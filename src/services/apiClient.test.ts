import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.hoisted(() => {
  const storage: Record<string, string> = {};
  global.localStorage = {
    getItem: vi.fn((key) => storage[key] || null),
    setItem: vi.fn((key, value) => { storage[key] = value; }),
    removeItem: vi.fn((key) => { delete storage[key]; }),
    clear: vi.fn(() => { Object.keys(storage).forEach(key => delete storage[key]); }),
    length: 0,
    key: vi.fn(),
  } as unknown as Storage;
});

vi.unmock('./apiClient');

import { apiClient } from './apiClient';
import i18n from '../i18n';

describe('ApiClient', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    // @ts-expect-error -- Deleting window.location for test mock
    delete window.location;
    window.location = { ...originalLocation, href: '', pathname: '/current-page', search: '?q=test' } as unknown as string & Location;
    vi.stubGlobal('fetch', vi.fn());
    apiClient.clearTokens();
  });

  afterEach(() => {
    // @ts-expect-error -- Restoring original window.location after test
    window.location = originalLocation;
    vi.restoreAllMocks();
  });

  it('should include Accept-Language header matching i18n language', async () => {
    vi.mocked(fetch).mockResolvedValue({
      status: 200,
      ok: true,
      json: () => Promise.resolve({}),
    } as unknown as Response);

    // Mock i18n language
    const originalLanguage = i18n.language;
    Object.defineProperty(i18n, 'language', { value: 'pl-PL', configurable: true });

    await apiClient.get('/test');

    const fetchCall = vi.mocked(fetch).mock.calls[0];
    const headers = fetchCall![1]!.headers as Headers;
    expect(headers.get('Accept-Language')).toBe('pl-PL');

    // Restore i18n language
    Object.defineProperty(i18n, 'language', { value: originalLanguage, configurable: true });
  });

  it('should redirect to login on 401 error when no refresh token is available', async () => {
    vi.mocked(fetch).mockResolvedValue({
      status: 401,
      ok: false,
      json: () => Promise.resolve({ message: 'Unauthorized' }),
    } as unknown as Response);

    try {
      await apiClient.get('/test');
    } catch {
      // expected error
    }

    expect(window.location.href).toContain('/login');
    expect(window.location.href).toContain('redirect=' + encodeURIComponent('/current-page?q=test'));
    expect(window.location.href).toContain('reason=unauthorized');
  });

  it('should attempt token refresh on 401 when refresh token exists', async () => {
    apiClient.setRefreshToken('valid-refresh-token');

    // First call: original request returns 401 (token not yet detected as expired locally)
    vi.mocked(fetch).mockResolvedValueOnce({
      status: 401,
      ok: false,
      json: () => Promise.resolve({ message: 'Unauthorized' }),
    } as unknown as Response);

    // Second call: refresh endpoint succeeds
    vi.mocked(fetch).mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: () => Promise.resolve({
        success: true,
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      }),
    } as unknown as Response);

    // Third call: retry of original request succeeds
    vi.mocked(fetch).mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: () => Promise.resolve({ data: 'success' }),
    } as unknown as Response);

    // Set a token that appears valid (not expired) so proactive check doesn't fire
    const futureExp = Math.floor(Date.now() / 1000) + 600; // 10 min from now
    const payload = btoa(JSON.stringify({ exp: futureExp, sub: 'user1', roles: [] }));
    apiClient.setToken(`header.${payload}.signature`);

    const result = await apiClient.get<{ data: string }>('/test');

    expect(result.data).toBe('success');
    expect(apiClient.getToken()).toBe('new-access-token');
    expect(apiClient.getRefreshToken()).toBe('new-refresh-token');
    expect(window.location.href).not.toContain('/login');
  });

  it('should redirect to login when refresh token is also expired', async () => {
    apiClient.setToken('expired-access-token');
    apiClient.setRefreshToken('expired-refresh-token');

    // First call: original request returns 401
    vi.mocked(fetch).mockResolvedValueOnce({
      status: 401,
      ok: false,
      json: () => Promise.resolve({ message: 'Unauthorized' }),
    } as unknown as Response);

    // Second call: refresh endpoint also fails
    vi.mocked(fetch).mockResolvedValueOnce({
      status: 401,
      ok: false,
      json: () => Promise.resolve({ status: 'AUTH_REFRESH_TOKEN_EXPIRED' }),
    } as unknown as Response);

    try {
      await apiClient.get('/test');
    } catch {
      // expected error
    }

    expect(window.location.href).toContain('/login');
    expect(apiClient.getRefreshToken()).toBeNull();
  });

  it('should not redirect and throw error from body on 403 error', async () => {
    vi.mocked(fetch).mockResolvedValue({
      status: 403,
      ok: false,
      json: () => Promise.resolve({ message: 'Forbidden localized message' }),
    } as unknown as Response);

    let error: unknown;
    try {
      await apiClient.get('/test');
    } catch (e) {
      error = e;
    }

    expect(window.location.href).not.toContain('/login');
    expect((error as Record<string, unknown>).message).toBe('Forbidden localized message');
  });

  it('should not clear token on 403 error', async () => {
    apiClient.setToken('existing-token');
    vi.mocked(fetch).mockResolvedValue({
      status: 403,
      ok: false,
      json: () => Promise.resolve({ message: 'Forbidden' }),
    } as unknown as Response);

    try {
      await apiClient.get('/test');
    } catch { /* Expected error */ }

    expect(apiClient.getToken()).toBe('existing-token');
  });

  it('should store and retrieve refresh token from localStorage', () => {
    expect(apiClient.getRefreshToken()).toBeNull();
    apiClient.setRefreshToken('my-refresh-token');
    expect(apiClient.getRefreshToken()).toBe('my-refresh-token');
    apiClient.clearTokens();
    expect(apiClient.getRefreshToken()).toBeNull();
    expect(apiClient.getToken()).toBeNull();
  });

  it('should generate and persist a stable device ID', () => {
    const deviceId = apiClient.getDeviceId();
    expect(deviceId).toBeTruthy();
    // Should return the same ID on subsequent calls
    expect(apiClient.getDeviceId()).toBe(deviceId);
  });
});

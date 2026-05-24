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

/** Creates a minimal JWT with the given payload fields. */
function makeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.test-signature`;
}

/** Creates a JWT that expires at a specific time. */
function makeExpiringJwt(expiresInSeconds: number): string {
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  return makeJwt({ exp, sub: 'user-1', roles: ['USER'], username: 'testuser' });
}

/** Creates a standard successful refresh response mock. */
function mockRefreshSuccess(newAccessToken?: string, newRefreshToken?: string) {
  return {
    status: 200,
    ok: true,
    json: () => Promise.resolve({
      success: true,
      accessToken: newAccessToken ?? makeExpiringJwt(900),
      refreshToken: newRefreshToken ?? 'rotated-refresh-token',
    }),
  } as unknown as Response;
}

/** Creates a 401 error response with a specific status code. */
function mockRefreshFailure(statusCode: string) {
  return {
    status: 401,
    ok: false,
    json: () => Promise.resolve({ success: false, status: statusCode }),
  } as unknown as Response;
}

/** Creates a standard successful API response. */
function mockOkResponse(data: unknown = {}) {
  return { status: 200, ok: true, json: () => Promise.resolve(data) } as unknown as Response;
}

/** Creates a 401 API response. */
function mock401Response() {
  return { status: 401, ok: false, json: () => Promise.resolve({ message: 'Unauthorized' }) } as unknown as Response;
}

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
    vi.useRealTimers();
  });

  // ─── Basic request behavior ───────────────────────────────────────────

  it('should include Accept-Language header matching i18n language', async () => {
    vi.mocked(fetch).mockResolvedValue(mockOkResponse());

    const originalLanguage = i18n.language;
    Object.defineProperty(i18n, 'language', { value: 'pl-PL', configurable: true });

    await apiClient.get('/test');

    const fetchCall = vi.mocked(fetch).mock.calls[0];
    const headers = fetchCall![1]!.headers as Headers;
    expect(headers.get('Accept-Language')).toBe('pl-PL');

    Object.defineProperty(i18n, 'language', { value: originalLanguage, configurable: true });
  });

  it('should not redirect and throw error from body on 403 error', async () => {
    vi.mocked(fetch).mockResolvedValue({
      status: 403, ok: false,
      json: () => Promise.resolve({ message: 'Forbidden localized message' }),
    } as unknown as Response);

    await expect(apiClient.get('/test')).rejects.toMatchObject({ message: 'Forbidden localized message' });
    expect(window.location.href).not.toContain('/login');
  });

  it('should not clear token on 403 error', async () => {
    apiClient.setToken('existing-token');
    vi.mocked(fetch).mockResolvedValue({
      status: 403, ok: false,
      json: () => Promise.resolve({ message: 'Forbidden' }),
    } as unknown as Response);

    try { await apiClient.get('/test'); } catch { /* expected */ }
    expect(apiClient.getToken()).toBe('existing-token');
  });

  // ─── Token storage ────────────────────────────────────────────────────

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
    expect(apiClient.getDeviceId()).toBe(deviceId);
  });

  it('should keep access token in memory only and never persist to localStorage', () => {
    apiClient.setToken(makeExpiringJwt(900));
    expect(apiClient.getToken()).toBeTruthy();
    expect(localStorage.getItem('accessToken')).toBeNull();
  });

  // ─── 401 without refresh token → redirect ─────────────────────────────

  it('should redirect to login on 401 when no refresh token is available', async () => {
    vi.mocked(fetch).mockResolvedValue(mock401Response());

    try { await apiClient.get('/test'); } catch { /* expected */ }

    expect(window.location.href).toContain('/login');
    expect(window.location.href).toContain('redirect=' + encodeURIComponent('/current-page?q=test'));
    expect(window.location.href).toContain('reason=unauthorized');
  });

  // ─── 401 with refresh token → refresh + retry ─────────────────────────

  it('should attempt token refresh on 401 when refresh token exists', async () => {
    apiClient.setRefreshToken('valid-refresh-token');
    apiClient.setToken(makeExpiringJwt(600));

    vi.mocked(fetch)
      .mockResolvedValueOnce(mock401Response())
      .mockResolvedValueOnce(mockRefreshSuccess())
      .mockResolvedValueOnce(mockOkResponse({ data: 'success' }));

    const result = await apiClient.get<{ data: string }>('/test');

    expect(result.data).toBe('success');
    expect(apiClient.getToken()).toBeTruthy();
    expect(apiClient.getRefreshToken()).toBe('rotated-refresh-token');
    expect(window.location.href).not.toContain('/login');
  });

  it('should redirect to login when refresh token is also expired', async () => {
    apiClient.setToken('expired-access-token');
    apiClient.setRefreshToken('expired-refresh-token');

    vi.mocked(fetch)
      .mockResolvedValueOnce(mock401Response())
      .mockResolvedValueOnce(mockRefreshFailure('AUTH_REFRESH_TOKEN_EXPIRED'));

    try { await apiClient.get('/test'); } catch { /* expected */ }

    expect(window.location.href).toContain('/login');
    expect(apiClient.getRefreshToken()).toBeNull();
  });

  it('should send deviceId and refreshToken in refresh request body', async () => {
    apiClient.setRefreshToken('my-rt');
    apiClient.setToken(makeExpiringJwt(600));

    vi.mocked(fetch)
      .mockResolvedValueOnce(mock401Response())
      .mockResolvedValueOnce(mockRefreshSuccess())
      .mockResolvedValueOnce(mockOkResponse());

    await apiClient.get('/test');

    // The refresh call is the second fetch invocation
    const refreshCall = vi.mocked(fetch).mock.calls[1];
    const body = JSON.parse(refreshCall![1]!.body as string);
    expect(body.refreshToken).toBe('my-rt');
    expect(body.deviceId).toBe(apiClient.getDeviceId());
  });

  it('should retry the original request with the new access token after refresh', async () => {
    apiClient.setRefreshToken('rt');
    apiClient.setToken(makeExpiringJwt(600));

    const newAccessToken = makeExpiringJwt(900);
    vi.mocked(fetch)
      .mockResolvedValueOnce(mock401Response())
      .mockResolvedValueOnce(mockRefreshSuccess(newAccessToken))
      .mockResolvedValueOnce(mockOkResponse({ retried: true }));

    await apiClient.get('/retry-test');

    // Verify the retry (3rd call) carries the new token
    const retryCall = vi.mocked(fetch).mock.calls[2];
    const retryHeaders = retryCall![1]!.headers as Headers;
    expect(retryHeaders.get('Authorization')).toBe(`Bearer ${newAccessToken}`);
    expect((retryCall![0] as string)).toContain('/retry-test');
  });

  // ─── AUTH_REFRESH_TOKEN_REUSE_DETECTED ────────────────────────────────

  it('should clear all tokens on reuse detection', async () => {
    apiClient.setRefreshToken('stolen-rt');
    apiClient.setToken(makeExpiringJwt(600));

    vi.mocked(fetch)
      .mockResolvedValueOnce(mock401Response())
      .mockResolvedValueOnce(mockRefreshFailure('AUTH_REFRESH_TOKEN_REUSE_DETECTED'));

    try { await apiClient.get('/test'); } catch { /* expected */ }

    expect(apiClient.getToken()).toBeNull();
    expect(apiClient.getRefreshToken()).toBeNull();
    expect(window.location.href).toContain('/login');
  });

  // ─── AUTH_REFRESH_TOKEN_DEVICE_MISMATCH ───────────────────────────────

  it('should clear tokens and redirect on device mismatch', async () => {
    apiClient.setRefreshToken('rt');
    apiClient.setToken(makeExpiringJwt(600));

    vi.mocked(fetch)
      .mockResolvedValueOnce(mock401Response())
      .mockResolvedValueOnce(mockRefreshFailure('AUTH_REFRESH_TOKEN_DEVICE_MISMATCH'));

    try { await apiClient.get('/test'); } catch { /* expected */ }

    expect(apiClient.getToken()).toBeNull();
    expect(apiClient.getRefreshToken()).toBeNull();
    expect(window.location.href).toContain('/login');
  });

  // ─── AUTH_REFRESH_TOKEN_INVALID ───────────────────────────────────────

  it('should clear tokens and redirect when refresh token is invalid', async () => {
    apiClient.setRefreshToken('invalid-rt');
    apiClient.setToken(makeExpiringJwt(600));

    vi.mocked(fetch)
      .mockResolvedValueOnce(mock401Response())
      .mockResolvedValueOnce(mockRefreshFailure('AUTH_REFRESH_TOKEN_INVALID'));

    try { await apiClient.get('/test'); } catch { /* expected */ }

    expect(apiClient.getToken()).toBeNull();
    expect(apiClient.getRefreshToken()).toBeNull();
    expect(window.location.href).toContain('/login');
  });

  // ─── HTTP 429 rate limiting ───────────────────────────────────────────

  it('should clear tokens and redirect on 429 from refresh endpoint', async () => {
    apiClient.setRefreshToken('rt');
    apiClient.setToken(makeExpiringJwt(600));

    vi.mocked(fetch)
      .mockResolvedValueOnce(mock401Response())
      .mockResolvedValueOnce({
        status: 429,
        ok: false,
        // Traefik returns no JSON body on 429
      } as unknown as Response);

    try { await apiClient.get('/test'); } catch { /* expected */ }

    expect(apiClient.getToken()).toBeNull();
    expect(apiClient.getRefreshToken()).toBeNull();
    expect(window.location.href).toContain('/login');
  });

  // ─── Proactive refresh (timer-based) ──────────────────────────────────

  it('should schedule proactive refresh 1 minute before token expiry', async () => {
    vi.useFakeTimers();
    apiClient.setRefreshToken('rt');

    vi.mocked(fetch).mockResolvedValue(mockRefreshSuccess());

    // Token expires in 5 minutes (300 seconds)
    const token = makeExpiringJwt(300);
    apiClient.setToken(token);

    // Should NOT have refreshed yet (should fire at 300s - 60s = 240s = 4 min)
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();

    // Advance to just before the proactive refresh (239 seconds)
    await vi.advanceTimersByTimeAsync(239_000);
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();

    // Advance past the proactive threshold (1 more second → 240s total)
    await vi.advanceTimersByTimeAsync(1_000);

    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1);
    const [url, opts] = vi.mocked(fetch).mock.calls[0];
    expect(url).toContain('/auth/token/refresh');
    expect(JSON.parse(opts!.body as string).refreshToken).toBe('rt');
  });

  it('should refresh immediately when token is already within the expiry margin', async () => {
    apiClient.setRefreshToken('rt');
    vi.mocked(fetch).mockResolvedValue(mockRefreshSuccess());

    // Token expires in 30 seconds (within the 60s margin)
    apiClient.setToken(makeExpiringJwt(30));

    // Should fire immediately (via void this.refreshTokens())
    await vi.waitFor(() => {
      expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1);
    });
    expect((vi.mocked(fetch).mock.calls[0][0] as string)).toContain('/auth/token/refresh');
  });

  it('should cancel proactive refresh timer when tokens are cleared', () => {
    vi.useFakeTimers();
    apiClient.setRefreshToken('rt');
    apiClient.setToken(makeExpiringJwt(300));

    // Clear tokens — should cancel the timer
    apiClient.clearTokens();

    // Advance well past what would have been the refresh time
    vi.advanceTimersByTime(300_000);
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it('should not schedule proactive refresh for tokens without exp claim', () => {
    vi.useFakeTimers();
    apiClient.setRefreshToken('rt');

    // Token with no exp
    const noExpToken = makeJwt({ sub: 'user-1', roles: [] });
    apiClient.setToken(noExpToken);

    vi.advanceTimersByTime(600_000);
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  // ─── Single-flight concurrency guard ──────────────────────────────────

  it('should coalesce concurrent refresh calls into a single request', async () => {
    apiClient.setRefreshToken('rt');

    let resolveRefresh: (v: unknown) => void;
    const refreshPromise = new Promise(resolve => { resolveRefresh = resolve; });

    vi.mocked(fetch).mockImplementation(() => refreshPromise as Promise<Response>);

    // Fire three concurrent refresh calls
    const p1 = apiClient.refreshTokens();
    const p2 = apiClient.refreshTokens();
    const p3 = apiClient.refreshTokens();

    // Only one fetch call should have been made
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1);

    // Resolve the single refresh call
    resolveRefresh!(mockRefreshSuccess());
    const [r1, r2, r3] = await Promise.all([p1, p2, p3]);

    // All three should get the same result
    expect(r1.refreshToken).toBe('rotated-refresh-token');
    expect(r2.refreshToken).toBe('rotated-refresh-token');
    expect(r3.refreshToken).toBe('rotated-refresh-token');
  });

  it('should allow a new refresh call after previous one completes', async () => {
    apiClient.setRefreshToken('rt-1');
    vi.mocked(fetch).mockResolvedValueOnce(mockRefreshSuccess('at-1', 'rt-2'));

    await apiClient.refreshTokens();
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1);

    // Now simulate another refresh — should make a new fetch call
    vi.mocked(fetch).mockResolvedValueOnce(mockRefreshSuccess('at-2', 'rt-3'));
    await apiClient.refreshTokens();
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2);
  });

  // ─── Token expiration detection ───────────────────────────────────────

  it('should proactively refresh before making request when token is expired', async () => {
    apiClient.setRefreshToken('rt');

    const newAccessToken = makeExpiringJwt(900);

    // Refresh succeeds
    vi.mocked(fetch)
      .mockResolvedValueOnce(mockRefreshSuccess(newAccessToken))
      .mockResolvedValueOnce(mockOkResponse({ data: 'result' }));

    // Set an already-expired token (expired 10 seconds ago)
    apiClient.setToken(makeExpiringJwt(-10));

    const result = await apiClient.get<{ data: string }>('/test');

    expect(result.data).toBe('result');
    // First call should be the refresh, second should be the actual request
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2);
    expect((vi.mocked(fetch).mock.calls[0][0] as string)).toContain('/auth/token/refresh');
    expect((vi.mocked(fetch).mock.calls[1][0] as string)).toContain('/test');
  });

  it('should not proactively refresh when token has plenty of time left', async () => {
    apiClient.setRefreshToken('rt');
    vi.mocked(fetch).mockResolvedValue(mockOkResponse({ data: 'fast' }));

    // Token valid for 10 minutes
    apiClient.setToken(makeExpiringJwt(600));

    await apiClient.get('/test');

    // Only the actual request, no refresh
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1);
    expect((vi.mocked(fetch).mock.calls[0][0] as string)).toContain('/test');
  });

  // ─── Refresh token rotation ───────────────────────────────────────────

  it('should store the rotated refresh token after successful refresh', async () => {
    apiClient.setRefreshToken('old-rt');

    vi.mocked(fetch).mockResolvedValue(mockRefreshSuccess(makeExpiringJwt(900), 'brand-new-rt'));

    await apiClient.refreshTokens();

    expect(apiClient.getRefreshToken()).toBe('brand-new-rt');
    expect(apiClient.getRefreshToken()).not.toBe('old-rt');
  });

  // ─── Edge cases ───────────────────────────────────────────────────────

  it('should handle refresh endpoint returning unparseable JSON gracefully', async () => {
    apiClient.setRefreshToken('rt');
    apiClient.setToken(makeExpiringJwt(600));

    vi.mocked(fetch)
      .mockResolvedValueOnce(mock401Response())
      .mockResolvedValueOnce({
        status: 500,
        ok: false,
        json: () => Promise.reject(new Error('not JSON')),
      } as unknown as Response);

    try { await apiClient.get('/test'); } catch { /* expected */ }

    expect(window.location.href).toContain('/login');
    expect(apiClient.getRefreshToken()).toBeNull();
  });

  it('should propagate network error during refresh and not redirect', async () => {
    apiClient.setRefreshToken('rt');
    apiClient.setToken(makeExpiringJwt(600));

    vi.mocked(fetch)
      .mockResolvedValueOnce(mock401Response())
      .mockRejectedValueOnce(new Error('Network error'));

    await expect(apiClient.get('/test')).rejects.toThrow();

    // Network errors are transient — apiClient should not redirect to login
    // (the user may just have lost connectivity temporarily)
  });

  it('should redirect to login when retry after refresh also returns 401', async () => {
    apiClient.setRefreshToken('rt');
    apiClient.setToken(makeExpiringJwt(600));

    vi.mocked(fetch)
      .mockResolvedValueOnce(mock401Response())        // original request
      .mockResolvedValueOnce(mockRefreshSuccess())     // refresh succeeds
      .mockResolvedValueOnce(mock401Response());       // retry also fails

    try { await apiClient.get('/test'); } catch { /* expected */ }

    expect(window.location.href).toContain('/login');
  });
});

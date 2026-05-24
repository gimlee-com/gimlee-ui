import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { createStore } from '../../store';
import { useNotificationStream } from './useNotificationStream';

// ─── Capture fetchEventSource options to simulate SSE events ────────

const mockFetchEventSource = vi.fn();

vi.mock('@microsoft/fetch-event-source', () => ({
  fetchEventSource: (...args: unknown[]) => mockFetchEventSource(...args),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn().mockReturnValue({ isAuthenticated: false }),
}));

vi.mock('../../services/apiClient', () => ({
  apiClient: {
    getToken: vi.fn().mockReturnValue('valid-token'),
    setToken: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
    getRefreshToken: vi.fn().mockReturnValue('rt'),
    setRefreshToken: vi.fn(),
    clearTokens: vi.fn(),
    getDeviceId: vi.fn().mockReturnValue('test-device-id'),
    refreshTokens: vi.fn(),
  },
}));

vi.mock('../services/notificationService', () => ({
  notificationService: {
    list: vi.fn().mockResolvedValue({ notifications: [], hasMore: false }),
    getUnreadCount: vi.fn().mockResolvedValue({ count: 0 }),
    getStreamUrl: vi.fn().mockReturnValue('http://localhost/api/notifications/stream'),
  },
}));

import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/apiClient';

interface FetchEventSourceOptions {
  headers: Record<string, string>;
  signal: AbortSignal;
  onopen: (response: Response) => Promise<void>;
  onmessage: (event: { data: string; event: string }) => void;
  onerror: (err: Error) => void;
  onclose: () => void;
}

function createWrapper() {
  const store = createStore();
  return {
    store,
    Wrapper: ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    ),
  };
}

describe('useNotificationStream — authentication lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchEventSource.mockResolvedValue(undefined);
  });

  // ─── Connection setup ───────────────────────────────────────────────

  it('should not open SSE connection when not authenticated', () => {
    vi.mocked(useAuth as Mock).mockReturnValue({ isAuthenticated: false });

    const { Wrapper } = createWrapper();
    renderHook(() => useNotificationStream(), { wrapper: Wrapper });

    expect(mockFetchEventSource).not.toHaveBeenCalled();
  });

  it('should open SSE connection with auth header when authenticated', () => {
    vi.mocked(useAuth as Mock).mockReturnValue({ isAuthenticated: true });

    const { Wrapper } = createWrapper();
    renderHook(() => useNotificationStream(), { wrapper: Wrapper });

    expect(mockFetchEventSource).toHaveBeenCalledTimes(1);
    const options = mockFetchEventSource.mock.calls[0][1] as FetchEventSourceOptions;
    expect(options.headers['Authorization']).toBe('Bearer valid-token');
  });

  it('should abort SSE connection when authentication is lost', async () => {
    // Start authenticated
    vi.mocked(useAuth as Mock).mockReturnValue({ isAuthenticated: true });

    const { Wrapper } = createWrapper();
    const { rerender } = renderHook(() => useNotificationStream(), { wrapper: Wrapper });

    expect(mockFetchEventSource).toHaveBeenCalledTimes(1);
    const options = mockFetchEventSource.mock.calls[0][1] as FetchEventSourceOptions;

    // Simulate losing authentication
    vi.mocked(useAuth as Mock).mockReturnValue({ isAuthenticated: false });
    rerender();

    // The abort signal should have been triggered
    expect(options.signal.aborted).toBe(true);
  });

  // ─── 401 during SSE onopen ──────────────────────────────────────────

  it('should attempt token refresh when SSE connection receives 401', async () => {
    vi.mocked(useAuth as Mock).mockReturnValue({ isAuthenticated: true });
    vi.mocked(apiClient.refreshTokens).mockResolvedValue({
      accessToken: 'refreshed-token',
      refreshToken: 'refreshed-rt',
    });

    const { Wrapper } = createWrapper();
    renderHook(() => useNotificationStream(), { wrapper: Wrapper });

    const options = mockFetchEventSource.mock.calls[0][1] as FetchEventSourceOptions;

    // Simulate 401 response during SSE connection
    const response401 = { ok: false, status: 401 } as Response;

    await expect(options.onopen(response401)).rejects.toThrow('Auth error: 401');
    expect(apiClient.refreshTokens).toHaveBeenCalledTimes(1);
  });

  it('should set stream connected on successful SSE open', async () => {
    vi.mocked(useAuth as Mock).mockReturnValue({ isAuthenticated: true });

    const { Wrapper, store } = createWrapper();
    renderHook(() => useNotificationStream(), { wrapper: Wrapper });

    const options = mockFetchEventSource.mock.calls[0][1] as FetchEventSourceOptions;

    // Simulate successful connection
    const responseOk = { ok: true, status: 200 } as Response;
    await options.onopen(responseOk);

    await waitFor(() => {
      expect(store.getState().notifications.streamConnected).toBe(true);
    });
  });

  it('should throw on 403 to stop reconnection attempts', async () => {
    vi.mocked(useAuth as Mock).mockReturnValue({ isAuthenticated: true });

    const { Wrapper } = createWrapper();
    renderHook(() => useNotificationStream(), { wrapper: Wrapper });

    const options = mockFetchEventSource.mock.calls[0][1] as FetchEventSourceOptions;

    const response403 = { ok: false, status: 403 } as Response;
    await expect(options.onopen(response403)).rejects.toThrow('Auth error: 403');
    expect(apiClient.refreshTokens).not.toHaveBeenCalled();
  });

  // ─── Device mismatch cascade ───────────────────────────────────────

  it('should handle device mismatch during SSE refresh gracefully', async () => {
    vi.mocked(useAuth as Mock).mockReturnValue({ isAuthenticated: true });

    // Simulate device mismatch — refreshTokens rejects (apiClient handles cleanup internally)
    vi.mocked(apiClient.refreshTokens).mockRejectedValue(
      new Error('AUTH_REFRESH_TOKEN_DEVICE_MISMATCH'),
    );

    const { Wrapper } = createWrapper();
    renderHook(() => useNotificationStream(), { wrapper: Wrapper });

    const options = mockFetchEventSource.mock.calls[0][1] as FetchEventSourceOptions;

    const response401 = { ok: false, status: 401 } as Response;

    // The onopen should still throw (to trigger reconnect/stop),
    // even though refreshTokens failed
    await expect(options.onopen(response401)).rejects.toThrow('Auth error: 401');
    expect(apiClient.refreshTokens).toHaveBeenCalled();
  });

  // ─── SSE message handling ──────────────────────────────────────────

  it('should ignore heartbeat events', () => {
    vi.mocked(useAuth as Mock).mockReturnValue({ isAuthenticated: true });

    const { Wrapper, store } = createWrapper();
    renderHook(() => useNotificationStream(), { wrapper: Wrapper });

    const options = mockFetchEventSource.mock.calls[0][1] as FetchEventSourceOptions;

    // Heartbeat should be silently ignored
    expect(() => options.onmessage({ data: '', event: 'heartbeat' })).not.toThrow();
    expect(store.getState().notifications.entities.ids).toHaveLength(0);
  });

  it('should dispatch notification on valid NOTIFICATION event', () => {
    vi.mocked(useAuth as Mock).mockReturnValue({ isAuthenticated: true });

    const { Wrapper, store } = createWrapper();
    renderHook(() => useNotificationStream(), { wrapper: Wrapper });

    const options = mockFetchEventSource.mock.calls[0][1] as FetchEventSourceOptions;

    const notification = {
      id: 'notif-1',
      type: 'ORDER_UPDATE',
      category: 'orders',
      message: 'Your order was shipped',
      severity: 'info',
      read: false,
      createdAt: Date.now(),
    };

    options.onmessage({ data: JSON.stringify(notification), event: 'notification' });

    expect(store.getState().notifications.entities.ids).toContain('notif-1');
  });

  // ─── Connection lifecycle ──────────────────────────────────────────

  it('should set stream disconnected on error', () => {
    vi.mocked(useAuth as Mock).mockReturnValue({ isAuthenticated: true });

    const { Wrapper, store } = createWrapper();
    renderHook(() => useNotificationStream(), { wrapper: Wrapper });

    const options = mockFetchEventSource.mock.calls[0][1] as FetchEventSourceOptions;

    // First mark as connected
    act(() => {
      store.dispatch({ type: 'notifications/setStreamConnected', payload: true });
    });
    expect(store.getState().notifications.streamConnected).toBe(true);

    // Simulate error
    options.onerror(new Error('Connection lost'));
    expect(store.getState().notifications.streamConnected).toBe(false);
  });

  it('should reconnect with fresh token when authentication changes', async () => {
    vi.mocked(useAuth as Mock).mockReturnValue({ isAuthenticated: true });
    vi.mocked(apiClient.getToken).mockReturnValue('token-v1');

    const { Wrapper } = createWrapper();
    const { rerender } = renderHook(() => useNotificationStream(), { wrapper: Wrapper });

    expect(mockFetchEventSource).toHaveBeenCalledTimes(1);
    const firstCallHeaders = (mockFetchEventSource.mock.calls[0][1] as FetchEventSourceOptions).headers;
    expect(firstCallHeaders['Authorization']).toBe('Bearer token-v1');

    // Simulate re-authentication (e.g., token refresh caused isAuthenticated toggle)
    vi.mocked(apiClient.getToken).mockReturnValue('token-v2');
    vi.mocked(useAuth as Mock).mockReturnValue({ isAuthenticated: false });
    rerender();
    vi.mocked(useAuth as Mock).mockReturnValue({ isAuthenticated: true });
    rerender();

    expect(mockFetchEventSource).toHaveBeenCalledTimes(2);
    const secondCallHeaders = (mockFetchEventSource.mock.calls[1][1] as FetchEventSourceOptions).headers;
    expect(secondCallHeaders['Authorization']).toBe('Bearer token-v2');
  });
});

import { render, waitFor, act, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import { userService } from '../profile/services/userService';
import { apiClient } from '../services/apiClient';
import { authService } from '../auth/services/authService';
import i18n from '../i18n';

vi.mock('../profile/services/userService', () => ({
  userService: {
    getUserPreferences: vi.fn(),
  },
}));

vi.mock('../services/apiClient', () => ({
  apiClient: {
    getToken: vi.fn(),
    setToken: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
    getRefreshToken: vi.fn().mockReturnValue(null),
    setRefreshToken: vi.fn(),
    clearTokens: vi.fn(),
    getDeviceId: vi.fn().mockReturnValue('test-device-id'),
    refreshTokens: vi.fn(),
  },
}));

vi.mock('../auth/services/authService', () => ({
  authService: {
    logout: vi.fn(),
  },
}));

vi.mock('../i18n', () => ({
  default: {
    changeLanguage: vi.fn(),
    language: 'en-US',
  },
}));

const TestComponent = () => {
  const { isAuthenticated, loading } = useAuth();
  return (
    <div>
      {loading ? 'Loading' : isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
    </div>
  );
};

/** Helper to render AuthProvider and expose auth actions via a companion component. */
function renderWithAuthActions() {
  let authActions: ReturnType<typeof useAuth>;
  const ActionsCapture = () => {
    authActions = useAuth(); // eslint-disable-line react-hooks/globals -- Capturing hook value for test assertion
    return (
      <div>
        {authActions.loading ? 'Loading' : authActions.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
    );
  };

  const result = render(
    <AuthProvider>
      <ActionsCapture />
    </AuthProvider>
  );

  return { ...result, getAuth: () => authActions! };
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Session initialization ─────────────────────────────────────────

  it('should fetch and apply language preference when authenticated', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      accessToken: 'fake-token',
      userProfile: { userId: '1', avatarUrl: '', updatedAt: 0 }
    });
    vi.mocked(userService.getUserPreferences).mockResolvedValue({ language: 'pl-PL', preferredCurrency: 'USD' });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/session/init?decorators=accessToken,userProfile,preferredCurrency,countryOfResidence,publicChatId,banStatus');
      expect(userService.getUserPreferences).toHaveBeenCalled();
      expect(i18n.changeLanguage).toHaveBeenCalledWith('pl-PL');
    });
  });

  it('should NOT fetch language preference when NOT authenticated', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      accessToken: '',
      userProfile: null
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/session/init?decorators=accessToken,userProfile,preferredCurrency,countryOfResidence,publicChatId,banStatus');
    });
    
    expect(userService.getUserPreferences).not.toHaveBeenCalled();
    expect(i18n.changeLanguage).not.toHaveBeenCalled();
  });

  // ─── Login lifecycle ────────────────────────────────────────────────

  it('should store both tokens and re-initialize session on login', async () => {
    // Initial: not authenticated
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      accessToken: '',
      userProfile: null
    });
    // After login: authenticated
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      accessToken: 'new-token',
      userProfile: { userId: '1', avatarUrl: '', updatedAt: 0 }
    });
    vi.mocked(userService.getUserPreferences).mockResolvedValue({ language: 'pl-PL', preferredCurrency: 'USD' });

    const { getAuth } = renderWithAuthActions();

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByText('Not Authenticated')).toBeTruthy();

    await act(async () => {
      await getAuth().login('new-token', 'new-refresh-token');
    });

    expect(apiClient.setToken).toHaveBeenCalledWith('new-token');
    expect(apiClient.setRefreshToken).toHaveBeenCalledWith('new-refresh-token');

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledTimes(2);
      expect(userService.getUserPreferences).toHaveBeenCalled();
      expect(i18n.changeLanguage).toHaveBeenCalledWith('pl-PL');
      expect(screen.getByText('Authenticated')).toBeTruthy();
    });
  });

  it('should allow re-initialization after login (initStarted reset)', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      accessToken: 'token',
      userProfile: { userId: '1', avatarUrl: '', updatedAt: 0 }
    });
    vi.mocked(userService.getUserPreferences).mockResolvedValue({ language: 'en-US', preferredCurrency: 'USD' });

    const { getAuth } = renderWithAuthActions();

    await waitFor(() => expect(apiClient.get).toHaveBeenCalledTimes(1));

    // Login should trigger a fresh init
    await act(async () => {
      await getAuth().login('token-2', 'rt-2');
    });

    expect(apiClient.get).toHaveBeenCalledTimes(2);
  });

  // ─── Logout lifecycle ───────────────────────────────────────────────

  it('should call authService.logout and clear all tokens on logout', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      accessToken: 'token',
      userProfile: { userId: '1', avatarUrl: '', updatedAt: 0 }
    });
    vi.mocked(userService.getUserPreferences).mockResolvedValue({ language: 'en-US', preferredCurrency: 'USD' });
    vi.mocked(authService.logout).mockResolvedValue({ success: true, status: 'OK', message: '' });

    const { getAuth } = renderWithAuthActions();

    await waitFor(() => expect(screen.getByText('Authenticated')).toBeTruthy());

    await act(async () => {
      await getAuth().logout();
    });

    expect(authService.logout).toHaveBeenCalled();
    expect(apiClient.clearTokens).toHaveBeenCalled();
    expect(screen.getByText('Not Authenticated')).toBeTruthy();
  });

  it('should clear local state even when logout API call fails', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      accessToken: 'token',
      userProfile: { userId: '1', avatarUrl: '', updatedAt: 0 }
    });
    vi.mocked(userService.getUserPreferences).mockResolvedValue({ language: 'en-US', preferredCurrency: 'USD' });
    vi.mocked(authService.logout).mockRejectedValue(new Error('Network error'));

    const { getAuth } = renderWithAuthActions();

    await waitFor(() => expect(screen.getByText('Authenticated')).toBeTruthy());

    // Logout should still succeed locally even if API fails
    await act(async () => {
      await getAuth().logout();
    });

    expect(apiClient.clearTokens).toHaveBeenCalled();
    expect(screen.getByText('Not Authenticated')).toBeTruthy();
  });

  it('should reset all auth state fields on logout', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      accessToken: 'token',
      userProfile: { userId: '1', avatarUrl: 'avatar.png', updatedAt: 123 },
      preferredCurrency: 'BTC',
      countryOfResidence: 'US',
      publicChatId: 'chat-123',
    });
    vi.mocked(userService.getUserPreferences).mockResolvedValue({ language: 'en-US', preferredCurrency: 'BTC' });
    vi.mocked(authService.logout).mockResolvedValue({ success: true, status: 'OK', message: '' });

    const { getAuth } = renderWithAuthActions();

    await waitFor(() => expect(screen.getByText('Authenticated')).toBeTruthy());

    // Capture state before logout
    const auth = getAuth();
    expect(auth.isAuthenticated).toBe(true);

    await act(async () => {
      await auth.logout();
    });

    const afterLogout = getAuth();
    expect(afterLogout.isAuthenticated).toBe(false);
    expect(afterLogout.userId).toBeNull();
    expect(afterLogout.userProfile).toBeNull();
    expect(afterLogout.preferredCurrency).toBeNull();
    expect(afterLogout.countryOfResidence).toBeNull();
    expect(afterLogout.username).toBeNull();
    expect(afterLogout.roles).toEqual([]);
    expect(afterLogout.publicChatId).toBeNull();
  });

  // ─── Startup silent refresh ─────────────────────────────────────────

  it('should attempt silent refresh on startup when refresh token exists', async () => {
    vi.mocked(apiClient.getRefreshToken).mockReturnValue('stored-rt');
    vi.mocked(apiClient.refreshTokens).mockResolvedValue({
      accessToken: 'refreshed-at',
      refreshToken: 'refreshed-rt',
    });
    vi.mocked(apiClient.get).mockResolvedValue({
      accessToken: 'refreshed-at',
      userProfile: { userId: '1', avatarUrl: '', updatedAt: 0 }
    });
    vi.mocked(userService.getUserPreferences).mockResolvedValue({ language: 'en-US', preferredCurrency: 'USD' });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(apiClient.refreshTokens).toHaveBeenCalledTimes(1);
      expect(apiClient.get).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Authenticated')).toBeTruthy();
    });
  });

  it('should fall back to guest mode when startup refresh fails', async () => {
    vi.mocked(apiClient.getRefreshToken).mockReturnValue('expired-rt');
    vi.mocked(apiClient.refreshTokens).mockRejectedValue(new Error('Token expired'));
    vi.mocked(apiClient.get).mockResolvedValue({
      accessToken: '',
      userProfile: null
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(apiClient.refreshTokens).toHaveBeenCalledTimes(1);
      expect(apiClient.clearTokens).toHaveBeenCalled();
      expect(apiClient.get).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Not Authenticated')).toBeTruthy();
    });
  });

  it('should not attempt refresh on startup when no refresh token exists', async () => {
    vi.mocked(apiClient.getRefreshToken).mockReturnValue(null);
    vi.mocked(apiClient.get).mockResolvedValue({
      accessToken: '',
      userProfile: null
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(apiClient.refreshTokens).not.toHaveBeenCalled();
      expect(apiClient.get).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Session init failure ──────────────────────────────────────────

  it('should handle session init failure gracefully and exit loading state', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new Error('Server down'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Not Authenticated')).toBeTruthy();
    });
  });
});

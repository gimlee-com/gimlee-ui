import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode, useRef } from 'react';
import { apiClient } from '../services/apiClient';
import { authService } from '../auth/services/authService';
import { userService } from '../profile/services/userService';
import i18n from '../i18n';
import type { SessionInitResponseDto, UserProfileDto } from '../types/api';
import { decodeJwt } from '../auth/utils/jwt';

interface AuthContextType {
  isAuthenticated: boolean;
  userId: string | null;
  userProfile: UserProfileDto | null;
  preferredCurrency: string | null;
  setPreferredCurrency: (currency: string | null) => void;
  countryOfResidence: string | null;
  setCountryOfResidence: (code: string | null) => void;
  username: string | null;
  roles: string[];
  publicChatId: string | null;
  isBanned: boolean;
  banReason: string | null;
  bannedAt: number | null;
  bannedUntil: number | null;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  refreshSession: () => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  userProfile: UserProfileDto | null;
  preferredCurrency: string | null;
  countryOfResidence: string | null;
  username: string | null;
  roles: string[];
  publicChatId: string | null;
  isBanned: boolean;
  banReason: string | null;
  bannedAt: number | null;
  bannedUntil: number | null;
  loading: boolean;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    userId: null,
    userProfile: null,
    preferredCurrency: null,
    countryOfResidence: null,
    username: null,
    roles: [],
    publicChatId: null,
    isBanned: false,
    banReason: null,
    bannedAt: null,
    bannedUntil: null,
    loading: true,
  });

  const initStarted = useRef(false);

  const initializeSession = useCallback(async () => {
    try {
      const session = await apiClient.get<SessionInitResponseDto>('/session/init?decorators=accessToken,userProfile,preferredCurrency,countryOfResidence,publicChatId,banStatus');
      
      let username: string | null = null;
      let userId: string | null = null;
      let roles: string[] = [];
      let isAuthenticated = false;
      let preferredCurrency = session.preferredCurrency || null;
      let countryOfResidence = session.countryOfResidence || null;
      const publicChatId = session.publicChatId || null;

      if (session.accessToken) {
        apiClient.setToken(session.accessToken);
        const decoded = decodeJwt(session.accessToken);
        username = decoded?.username || null;
        userId = decoded?.sub || null;
        roles = decoded?.roles || [];
        isAuthenticated = true;

        // Unified Initialization: fetch preferences before completing loading
        try {
          const prefs = await userService.getUserPreferences();
          if (prefs.preferredCurrency) {
            preferredCurrency = prefs.preferredCurrency;
          }
          if (prefs.countryOfResidence) {
            countryOfResidence = prefs.countryOfResidence;
          }
          if (prefs.language && prefs.language !== i18n.language) {
            await i18n.changeLanguage(prefs.language);
          }
        } catch (e) {
          console.error('Failed to fetch user preferences during init', e);
        }
      } else {
        apiClient.setToken(null);
      }

      setState({
        isAuthenticated,
        userId,
        userProfile: session.userProfile,
        preferredCurrency,
        countryOfResidence,
        username,
        roles,
        publicChatId,
        isBanned: session.banned ?? false,
        banReason: session.banReason ?? null,
        bannedAt: session.bannedAt ?? null,
        bannedUntil: session.bannedUntil ?? null,
        loading: false,
      });
    } catch (error) {
      console.error('Failed to initialize session', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const refreshSession = useCallback(async () => {
    if (initStarted.current) return;
    initStarted.current = true;

    // If we have a refresh token, obtain a fresh access token first
    const storedRefreshToken = apiClient.getRefreshToken();
    if (storedRefreshToken) {
      try {
        await apiClient.refreshTokens();
      } catch {
        // Refresh failed — clear tokens and continue as guest
        apiClient.clearTokens();
      }
    }

    await initializeSession();
  }, [initializeSession]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshSession();
  }, [refreshSession]);

  const login = async (accessToken: string, refreshToken: string) => {
    apiClient.setToken(accessToken);
    apiClient.setRefreshToken(refreshToken);
    initStarted.current = false; // Allow re-initialization after login
    await initializeSession();
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Even if the API call fails, still clear local state
    }
    apiClient.clearTokens();
    setState({
      isAuthenticated: false,
      userId: null,
      userProfile: null,
      preferredCurrency: null,
      countryOfResidence: null,
      username: null,
      roles: [],
      publicChatId: null,
      isBanned: false,
      banReason: null,
      bannedAt: null,
      bannedUntil: null,
      loading: false,
    });
  };

  const setPreferredCurrency = (currency: string | null) => {
    setState(prev => ({ ...prev, preferredCurrency: currency }));
  };

  const setCountryOfResidence = (code: string | null) => {
    setState(prev => ({ ...prev, countryOfResidence: code }));
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      setPreferredCurrency,
      setCountryOfResidence,
      login,
      logout,
      refreshSession
    }}>
      {!state.loading && children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

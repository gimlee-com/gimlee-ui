import UIkit from 'uikit';
import i18n from '../i18n';
import { decodeJwt } from '../auth/utils/jwt';
import { getOrCreateDeviceId } from '../auth/utils/deviceId';

const API_URL = import.meta.env.VITE_API_URL || '';

const REFRESH_TOKEN_KEY = 'gimlee_refresh_token';
const REFRESH_MARGIN_MS = 60_000; // Refresh 1 minute before expiry

class ApiClient {
  private token: string | null = null;
  private refreshPromise: Promise<{ accessToken: string; refreshToken: string }> | null = null;
  private proactiveRefreshTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // On startup, attempt silent refresh if a refresh token exists
    // Access token is never persisted — only lives in memory
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      this.scheduleProactiveRefresh(token);
    } else {
      this.clearProactiveRefreshTimer();
    }
  }

  getToken() {
    return this.token;
  }

  setRefreshToken(refreshToken: string | null) {
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  getDeviceId(): string {
    return getOrCreateDeviceId();
  }

  clearTokens() {
    this.token = null;
    this.clearProactiveRefreshTimer();
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  private clearProactiveRefreshTimer() {
    if (this.proactiveRefreshTimer) {
      clearTimeout(this.proactiveRefreshTimer);
      this.proactiveRefreshTimer = null;
    }
  }

  private scheduleProactiveRefresh(accessToken: string) {
    this.clearProactiveRefreshTimer();

    const decoded = decodeJwt(accessToken);
    if (!decoded?.exp) return;

    const expiresAtMs = decoded.exp * 1000;
    const now = Date.now();
    const refreshInMs = expiresAtMs - now - REFRESH_MARGIN_MS;

    if (refreshInMs <= 0) {
      // Token already expired or about to — refresh immediately
      void this.refreshTokens();
      return;
    }

    this.proactiveRefreshTimer = setTimeout(() => {
      void this.refreshTokens();
    }, refreshInMs);
  }

  async refreshTokens(): Promise<{ accessToken: string; refreshToken: string }> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.doRefresh().finally(() => {
      this.refreshPromise = null;
    });

    return this.refreshPromise;
  }

  private async doRefresh(): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.handleSessionExpired();
      throw new Error('No refresh token available');
    }

    const url = `${API_URL}/api/auth/token/refresh`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': i18n.language,
      },
      body: JSON.stringify({
        refreshToken,
        deviceId: this.getDeviceId(),
      }),
    });

    if (response.status === 429) {
      // Rate limited by Traefik — no JSON body
      this.handleSessionExpired();
      throw new Error('Rate limited');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ status: 'UNKNOWN' }));

      if (error.status === 'AUTH_REFRESH_TOKEN_REUSE_DETECTED') {
        this.clearTokens();
        UIkit.notification({
          message: i18n.t('auth.errors.securityAlert'),
          status: 'danger',
          pos: 'top-center',
          timeout: 8000,
        });
      } else {
        this.clearTokens();
      }

      const currentPath = window.location.pathname + window.location.search;
      window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}&reason=unauthorized`;
      throw new Error(error.status || 'Refresh failed');
    }

    const data = await response.json();
    this.setToken(data.accessToken);
    this.setRefreshToken(data.refreshToken);
    return { accessToken: data.accessToken, refreshToken: data.refreshToken };
  }

  private handleSessionExpired() {
    this.clearTokens();
    const currentPath = window.location.pathname + window.location.search;
    window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}&reason=unauthorized`;
  }

  private isTokenExpired(): boolean {
    if (!this.token) return true;
    const decoded = decodeJwt(this.token);
    if (!decoded?.exp) return true;
    // Consider expired if within the margin
    return decoded.exp * 1000 <= Date.now() + 5000;
  }

  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    // Proactively refresh if token is expired before making the request
    if (this.token && this.isTokenExpired() && this.getRefreshToken()) {
      try {
        await this.refreshTokens();
      } catch {
        // If refresh fails, handleSessionExpired was already called
        throw new Error('Unauthorized');
      }
    }

    const url = `${API_URL}/api${path}`;
    const headers = new Headers(options.headers);

    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    headers.set('Accept-Language', i18n.language);

    if (!(options.body instanceof FormData) && !(options.body instanceof Blob) && options.body !== undefined) {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Attempt token refresh and retry once
      const refreshToken = this.getRefreshToken();
      if (refreshToken) {
        try {
          await this.refreshTokens();
          // Retry original request with new token
          const retryHeaders = new Headers(options.headers);
          if (this.token) {
            retryHeaders.set('Authorization', `Bearer ${this.token}`);
          }
          retryHeaders.set('Accept-Language', i18n.language);
          if (!(options.body instanceof FormData) && !(options.body instanceof Blob) && options.body !== undefined) {
            retryHeaders.set('Content-Type', 'application/json');
          }

          const retryResponse = await fetch(url, { ...options, headers: retryHeaders });

          if (retryResponse.status === 401) {
            this.handleSessionExpired();
            throw new Error('Unauthorized');
          }

          if (!retryResponse.ok) {
            const error = await retryResponse.json().catch(() => ({ message: 'An error occurred' }));
            if (retryResponse.status === 403 && error.status === 'AUTH_USER_BANNED') {
              UIkit.notification({
                message: error.message || i18n.t('ban.restricted.message'),
                status: 'danger',
                pos: 'top-center',
                timeout: 5000,
              });
            }
            throw error;
          }

          if (retryResponse.status === 204) return {} as T;
          return retryResponse.json();
        } catch (err) {
          if ((err as Error).message === 'Unauthorized' || (err as Error).message === 'No refresh token available') {
            throw err;
          }
          // Refresh itself failed — session expired handling already done in doRefresh
          throw new Error('Unauthorized');
        }
      } else {
        this.handleSessionExpired();
        throw new Error('Unauthorized');
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));

      // Global notification for banned users attempting restricted actions
      if (response.status === 403 && error.status === 'AUTH_USER_BANNED') {
        UIkit.notification({
          message: error.message || i18n.t('ban.restricted.message'),
          status: 'danger',
          pos: 'top-center',
          timeout: 5000,
        });
      }

      throw error;
    }

    if (response.status === 204) {
        return {} as T;
    }

    return response.json();
  }

  get<T>(path: string, options: RequestInit = {}) {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  post<T>(path: string, body?: unknown, options: RequestInit = {}) {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: (body instanceof FormData || body instanceof Blob) ? body : JSON.stringify(body),
    });
  }

  put<T>(path: string, body?: unknown, options: RequestInit = {}) {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: (body instanceof FormData || body instanceof Blob) ? body : JSON.stringify(body),
    });
  }

  patch<T>(path: string, body?: unknown, options: RequestInit = {}) {
    return this.request<T>(path, {
      ...options,
      method: 'PATCH',
      body: (body instanceof FormData || body instanceof Blob) ? body : JSON.stringify(body),
    });
  }

  delete<T>(path: string, options: RequestInit = {}) {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

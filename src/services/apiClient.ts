import i18n from '../i18n';

const API_URL = import.meta.env.VITE_API_URL || '';

class ApiClient {
  private token: string | null = localStorage.getItem('accessToken');

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }

  getToken() {
    return this.token;
  }

  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
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
      this.setToken(null);
      const currentPath = window.location.pathname + window.location.search;
      window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}&reason=unauthorized`;
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));

      // Global notification for banned users attempting restricted actions
      if (response.status === 403 && error.status === 'AUTH_USER_BANNED') {
        const UIkit = await import('uikit');
        UIkit.default.notification({
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

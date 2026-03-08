export interface JwtPayload {
  roles?: string[];
  username?: string;
  sub?: string;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT', error);
    return null;
  }
}

export function hasRole(token: string, role: string): boolean {
  const payload = decodeJwt(token);
  return payload?.roles?.includes(role) || false;
}

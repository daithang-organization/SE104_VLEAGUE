import { api } from '../lib/api';

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
};

export type RefreshResponse = {
  accessToken: string;
};

/**
 * Login API call - now handled by AuthContext
 * @deprecated Use useAuth().login() instead
 */
export function apiLogin(email: string, password: string) {
  return api.post<LoginResponse>('/auth/login', { email, password }).then((res) => res.data);
}

/**
 * Refresh token API call
 */
export function apiRefresh(refreshToken: string) {
  return api.post<RefreshResponse>('/auth/refresh', { refreshToken }).then((res) => res.data);
}

/**
 * Logout API call
 */
export function apiLogout(refreshToken: string) {
  return api.post('/auth/logout', { refreshToken });
}

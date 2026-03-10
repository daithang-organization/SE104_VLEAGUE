import { api, SERVER_URL } from '../lib/api';

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    name?: string | null;
  };
};

export type RefreshResponse = {
  accessToken: string;
};

export type RegisterResponse = {
  message: string;
  email: string;
};

export type VerifyEmailResponse = {
  message: string;
};

export type UserProfile = {
  id: string;
  email: string;
  role: string;
  name?: string | null;
  avatarUrl?: string | null;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Session = {
  id: string;
  deviceName: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  lastUsedAt: string | null;
  createdAt: string;
  expiresAt: string;
};

/**
 * Login API call
 */
export function apiLogin(email: string, password: string, rememberMe?: boolean) {
  return api
    .post<LoginResponse>('/auth/login', { email, password, rememberMe })
    .then((res) => res.data);
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

/**
 * Register new account
 */
export function apiRegister(email: string, password: string) {
  return api.post<RegisterResponse>('/auth/register', { email, password }).then((res) => res.data);
}

/**
 * Verify email with OTP
 */
export function apiVerifyEmail(email: string, otp: string) {
  return api
    .post<VerifyEmailResponse>('/auth/verify-email', { email, otp })
    .then((res) => res.data);
}

/**
 * Resend OTP for email verification
 */
export function apiResendOtp(email: string) {
  return api.post<{ message: string }>('/auth/resend-otp', { email }).then((res) => res.data);
}

/**
 * Request password reset OTP
 */
export function apiForgotPassword(email: string) {
  return api.post<{ message: string }>('/auth/forgot-password', { email }).then((res) => res.data);
}

/**
 * Reset password with OTP
 */
export function apiResetPassword(email: string, otp: string, newPassword: string) {
  return api
    .post<{ message: string }>('/auth/reset-password', { email, otp, newPassword })
    .then((res) => res.data);
}

/**
 * Get current user profile
 */
export function apiGetMe() {
  return api.get<UserProfile>('/auth/me').then((res) => res.data);
}

/**
 * Change password
 */
export function apiChangePassword(currentPassword: string, newPassword: string) {
  return api
    .post<{ success: boolean; message: string }>('/auth/change-password', {
      currentPassword,
      newPassword,
    })
    .then((res) => res.data);
}

/**
 * Logout from all devices
 */
export function apiLogoutAll() {
  return api
    .post<{ success: boolean; message: string; revokedCount: number }>('/auth/logout-all')
    .then((res) => res.data);
}

/**
 * Update profile (name, avatarUrl)
 */
export function apiUpdateProfile(data: { name?: string; avatarUrl?: string }) {
  return api.patch<UserProfile>('/auth/profile', data).then((res) => res.data);
}

/**
 * Get all active sessions
 */
export function apiGetSessions() {
  return api.get<Session[]>('/auth/sessions').then((res) => res.data);
}

/**
 * Revoke a specific session
 */
export function apiRevokeSession(sessionId: string) {
  return api
    .delete<{ success: boolean; message: string }>(`/auth/sessions/${sessionId}`)
    .then((res) => res.data);
}

/**
 * Set password for OAuth users
 */
export function apiSetPassword(newPassword: string) {
  return api
    .post<{ success: boolean; message: string }>('/auth/set-password', { newPassword })
    .then((res) => res.data);
}

/**
 * Get Google OAuth URL
 */
export function getGoogleAuthUrl() {
  return `${SERVER_URL}/api/auth/google`;
}

/**
 * Get Facebook OAuth URL
 */
export function getFacebookAuthUrl() {
  return `${SERVER_URL}/api/auth/facebook`;
}

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockApi = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('../../lib/api', () => ({ api: mockApi }));

import {
  apiLogin,
  apiRefresh,
  apiLogout,
  apiRegister,
  apiVerifyEmail,
  apiResendOtp,
  apiForgotPassword,
  apiResetPassword,
  apiGetMe,
  apiChangePassword,
  apiLogoutAll,
  apiUpdateProfile,
  apiGetSessions,
  apiRevokeSession,
  apiSetPassword,
  getGoogleAuthUrl,
  getFacebookAuthUrl,
} from '../authApi';

describe('authApi', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it('apiLogin calls POST /auth/login', async () => {
    const data = {
      accessToken: 'at',
      refreshToken: 'rt',
      user: { id: '1', email: 'a@b.c', role: 'ADMIN' },
    };
    mockApi.post.mockResolvedValue({ data });
    const result = await apiLogin('a@b.c', 'pass', true);
    expect(mockApi.post).toHaveBeenCalledWith('/auth/login', {
      email: 'a@b.c',
      password: 'pass',
      rememberMe: true,
    });
    expect(result).toEqual(data);
  });

  it('apiRefresh calls POST /auth/refresh', async () => {
    mockApi.post.mockResolvedValue({ data: { accessToken: 'new-at' } });
    const result = await apiRefresh('rt-1');
    expect(mockApi.post).toHaveBeenCalledWith('/auth/refresh', { refreshToken: 'rt-1' });
    expect(result.accessToken).toBe('new-at');
  });

  it('apiLogout calls POST /auth/logout', async () => {
    mockApi.post.mockResolvedValue({ data: {} });
    await apiLogout('rt-1');
    expect(mockApi.post).toHaveBeenCalledWith('/auth/logout', { refreshToken: 'rt-1' });
  });

  it('apiRegister calls POST /auth/register', async () => {
    const data = { message: 'ok', email: 'a@b.c' };
    mockApi.post.mockResolvedValue({ data });
    const result = await apiRegister('a@b.c', 'pass');
    expect(mockApi.post).toHaveBeenCalledWith('/auth/register', {
      email: 'a@b.c',
      password: 'pass',
    });
    expect(result).toEqual(data);
  });

  it('apiVerifyEmail calls POST /auth/verify-email', async () => {
    mockApi.post.mockResolvedValue({ data: { message: 'verified' } });
    const result = await apiVerifyEmail('a@b.c', '123456');
    expect(mockApi.post).toHaveBeenCalledWith('/auth/verify-email', {
      email: 'a@b.c',
      otp: '123456',
    });
    expect(result.message).toBe('verified');
  });

  it('apiResendOtp calls POST /auth/resend-otp', async () => {
    mockApi.post.mockResolvedValue({ data: { message: 'sent' } });
    const result = await apiResendOtp('a@b.c');
    expect(mockApi.post).toHaveBeenCalledWith('/auth/resend-otp', { email: 'a@b.c' });
    expect(result.message).toBe('sent');
  });

  it('apiForgotPassword calls POST /auth/forgot-password', async () => {
    mockApi.post.mockResolvedValue({ data: { message: 'sent' } });
    const result = await apiForgotPassword('a@b.c');
    expect(mockApi.post).toHaveBeenCalledWith('/auth/forgot-password', { email: 'a@b.c' });
    expect(result.message).toBe('sent');
  });

  it('apiResetPassword calls POST /auth/reset-password', async () => {
    mockApi.post.mockResolvedValue({ data: { message: 'reset' } });
    const result = await apiResetPassword('a@b.c', '123456', 'newPass');
    expect(mockApi.post).toHaveBeenCalledWith('/auth/reset-password', {
      email: 'a@b.c',
      otp: '123456',
      newPassword: 'newPass',
    });
    expect(result.message).toBe('reset');
  });

  it('apiGetMe calls GET /auth/me', async () => {
    const user = { id: '1', email: 'a@b.c', role: 'ADMIN', emailVerified: true };
    mockApi.get.mockResolvedValue({ data: user });
    const result = await apiGetMe();
    expect(mockApi.get).toHaveBeenCalledWith('/auth/me');
    expect(result).toEqual(user);
  });

  it('apiChangePassword calls POST /auth/change-password', async () => {
    mockApi.post.mockResolvedValue({ data: { success: true, message: 'changed' } });
    const result = await apiChangePassword('old', 'new');
    expect(mockApi.post).toHaveBeenCalledWith('/auth/change-password', {
      currentPassword: 'old',
      newPassword: 'new',
    });
    expect(result.success).toBe(true);
  });

  it('apiLogoutAll calls POST /auth/logout-all', async () => {
    mockApi.post.mockResolvedValue({ data: { success: true, message: 'ok', revokedCount: 3 } });
    const result = await apiLogoutAll();
    expect(mockApi.post).toHaveBeenCalledWith('/auth/logout-all');
    expect(result.revokedCount).toBe(3);
  });

  it('apiUpdateProfile calls PATCH /auth/profile', async () => {
    const profile = { id: '1', email: 'a@b.c', name: 'Test' };
    mockApi.patch.mockResolvedValue({ data: profile });
    const result = await apiUpdateProfile({ name: 'Test' });
    expect(mockApi.patch).toHaveBeenCalledWith('/auth/profile', { name: 'Test' });
    expect(result.name).toBe('Test');
  });

  it('apiGetSessions calls GET /auth/sessions', async () => {
    const sessions = [{ id: 's1', deviceName: 'Chrome' }];
    mockApi.get.mockResolvedValue({ data: sessions });
    const result = await apiGetSessions();
    expect(mockApi.get).toHaveBeenCalledWith('/auth/sessions');
    expect(result).toHaveLength(1);
  });

  it('apiRevokeSession calls DELETE /auth/sessions/:id', async () => {
    mockApi.delete.mockResolvedValue({ data: { success: true, message: 'revoked' } });
    const result = await apiRevokeSession('s1');
    expect(mockApi.delete).toHaveBeenCalledWith('/auth/sessions/s1');
    expect(result.success).toBe(true);
  });

  it('apiSetPassword calls POST /auth/set-password', async () => {
    mockApi.post.mockResolvedValue({ data: { success: true, message: 'set' } });
    const result = await apiSetPassword('newPass');
    expect(mockApi.post).toHaveBeenCalledWith('/auth/set-password', { newPassword: 'newPass' });
    expect(result.success).toBe(true);
  });

  it('getGoogleAuthUrl returns correct URL', () => {
    const url = getGoogleAuthUrl();
    expect(url).toContain('/auth/google');
  });

  it('getFacebookAuthUrl returns correct URL', () => {
    const url = getFacebookAuthUrl();
    expect(url).toContain('/auth/facebook');
  });
});

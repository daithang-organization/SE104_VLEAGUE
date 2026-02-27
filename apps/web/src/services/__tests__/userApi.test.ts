import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockApi = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('../../lib/api', () => ({ api: mockApi }));

import { apiGetUsers, apiCreateUser, apiUpdateUserRole, apiDeleteUser } from '../userApi';

describe('userApi', () => {
  beforeEach(() => vi.clearAllMocks());

  it('apiGetUsers calls GET /users', async () => {
    const users = [{ id: 'u1', email: 'admin@test.com', role: 'ADMIN' }];
    mockApi.get.mockResolvedValue({ data: users });
    const result = await apiGetUsers();
    expect(mockApi.get).toHaveBeenCalledWith('/users');
    expect(result).toEqual(users);
  });

  it('apiCreateUser calls POST /users', async () => {
    const user = { id: 'u1', email: 'new@test.com', role: 'TEAM_MANAGER' };
    mockApi.post.mockResolvedValue({ data: user });
    const payload = { email: 'new@test.com', password: 'pass123', role: 'TEAM_MANAGER' };
    const result = await apiCreateUser(payload);
    expect(mockApi.post).toHaveBeenCalledWith('/users', payload);
    expect(result).toEqual(user);
  });

  it('apiUpdateUserRole calls PATCH /users/:id/role', async () => {
    const user = { id: 'u1', role: 'REFEREE' };
    mockApi.patch.mockResolvedValue({ data: user });
    const result = await apiUpdateUserRole('u1', 'REFEREE');
    expect(mockApi.patch).toHaveBeenCalledWith('/users/u1/role', { role: 'REFEREE' });
    expect(result).toEqual(user);
  });

  it('apiDeleteUser calls DELETE /users/:id', async () => {
    mockApi.delete.mockResolvedValue({ data: { success: true } });
    const result = await apiDeleteUser('u1');
    expect(mockApi.delete).toHaveBeenCalledWith('/users/u1');
    expect(result.success).toBe(true);
  });
});

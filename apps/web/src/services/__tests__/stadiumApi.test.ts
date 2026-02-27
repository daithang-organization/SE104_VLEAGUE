import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockApi = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('../../lib/api', () => ({ api: mockApi }));

import {
  apiCreateStadium,
  apiDeleteStadium,
  apiGetStadium,
  apiGetStadiums,
  apiUpdateStadium,
} from '../stadiumApi';

describe('stadiumApi', () => {
  beforeEach(() => vi.clearAllMocks());

  it('apiGetStadiums calls GET /stadiums', async () => {
    const stadiums = [{ id: 's1', name: 'Mỹ Đình', city: 'Hà Nội' }];
    mockApi.get.mockResolvedValue({ data: stadiums });
    const result = await apiGetStadiums();
    expect(mockApi.get).toHaveBeenCalledWith('/stadiums');
    expect(result).toEqual(stadiums);
  });

  it('apiGetStadium calls GET /stadiums/:id', async () => {
    const stadium = { id: 's1', name: 'Mỹ Đình', teams: [], matches: [] };
    mockApi.get.mockResolvedValue({ data: stadium });
    const result = await apiGetStadium('s1');
    expect(mockApi.get).toHaveBeenCalledWith('/stadiums/s1');
    expect(result).toEqual(stadium);
  });

  it('apiCreateStadium calls POST /stadiums', async () => {
    const stadium = { id: 's1', name: 'Thống Nhất', city: 'HCM' };
    mockApi.post.mockResolvedValue({ data: stadium });
    const result = await apiCreateStadium({ name: 'Thống Nhất', city: 'HCM', capacity: 15000 });
    expect(mockApi.post).toHaveBeenCalledWith('/stadiums', {
      name: 'Thống Nhất',
      city: 'HCM',
      capacity: 15000,
    });
    expect(result).toEqual(stadium);
  });

  it('apiUpdateStadium calls PATCH /stadiums/:id', async () => {
    const stadium = { id: 's1', name: 'Updated', city: 'HCM' };
    mockApi.patch.mockResolvedValue({ data: stadium });
    const result = await apiUpdateStadium('s1', { capacity: 20000 });
    expect(mockApi.patch).toHaveBeenCalledWith('/stadiums/s1', { capacity: 20000 });
    expect(result).toEqual(stadium);
  });

  it('apiDeleteStadium calls DELETE /stadiums/:id', async () => {
    mockApi.delete.mockResolvedValue({ data: { success: true } });
    const result = await apiDeleteStadium('s1');
    expect(mockApi.delete).toHaveBeenCalledWith('/stadiums/s1');
    expect(result.success).toBe(true);
  });
});

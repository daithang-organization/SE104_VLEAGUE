import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockApi = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('../../lib/api', () => ({ api: mockApi }));

import {
  apiCreateTeam,
  apiDeleteTeam,
  apiGetStadiums,
  apiGetTeam,
  apiGetTeams,
  apiUpdateTeam,
} from '../teamApi';

describe('teamApi', () => {
  beforeEach(() => vi.clearAllMocks());

  it('apiGetTeams calls GET /teams with pagination and filters', async () => {
    const data = { data: [], total: 0, page: 1, limit: 100, totalPages: 0 };
    mockApi.get.mockResolvedValue({ data });

    const result = await apiGetTeams(2, 50, { search: 'hanoi', status: 'ACTIVE' });
    expect(mockApi.get).toHaveBeenCalledWith('/teams', {
      params: { page: 2, limit: 50, search: 'hanoi', status: 'ACTIVE' },
    });
    expect(result).toEqual(data);
  });

  it('apiGetTeams uses defaults', async () => {
    mockApi.get.mockResolvedValue({ data: { data: [] } });
    await apiGetTeams();
    expect(mockApi.get).toHaveBeenCalledWith('/teams', { params: { page: 1, limit: 100 } });
  });

  it('apiGetTeam calls GET /teams/:id', async () => {
    const team = { id: 't1', name: 'Hà Nội FC' };
    mockApi.get.mockResolvedValue({ data: team });
    const result = await apiGetTeam('t1');
    expect(mockApi.get).toHaveBeenCalledWith('/teams/t1');
    expect(result).toEqual(team);
  });

  it('apiGetTeam passes seasonId when provided', async () => {
    const team = { id: 't1', name: 'Hà Nội FC' };
    mockApi.get.mockResolvedValue({ data: team });

    const result = await apiGetTeam('t1', 'season-2026');

    expect(mockApi.get).toHaveBeenCalledWith('/teams/t1', {
      params: { seasonId: 'season-2026' },
    });
    expect(result).toEqual(team);
  });

  it('apiCreateTeam calls POST /teams', async () => {
    const team = { id: 't1', name: 'New Team' };
    mockApi.post.mockResolvedValue({ data: team });
    const result = await apiCreateTeam({ name: 'New Team', city: 'HCM' });
    expect(mockApi.post).toHaveBeenCalledWith('/teams', { name: 'New Team', city: 'HCM' });
    expect(result).toEqual(team);
  });

  it('apiUpdateTeam calls PATCH /teams/:id', async () => {
    const team = { id: 't1', name: 'Updated' };
    mockApi.patch.mockResolvedValue({ data: team });
    const result = await apiUpdateTeam('t1', { name: 'Updated' });
    expect(mockApi.patch).toHaveBeenCalledWith('/teams/t1', { name: 'Updated' });
    expect(result).toEqual(team);
  });

  it('apiDeleteTeam calls DELETE /teams/:id', async () => {
    mockApi.delete.mockResolvedValue({ data: { success: true } });
    const result = await apiDeleteTeam('t1');
    expect(mockApi.delete).toHaveBeenCalledWith('/teams/t1');
    expect(result.success).toBe(true);
  });

  it('apiGetStadiums calls GET /stadiums', async () => {
    const stadiums = [{ id: 's1', name: 'Mỹ Đình' }];
    mockApi.get.mockResolvedValue({ data: stadiums });
    const result = await apiGetStadiums();
    expect(mockApi.get).toHaveBeenCalledWith('/stadiums');
    expect(result).toHaveLength(1);
  });
});

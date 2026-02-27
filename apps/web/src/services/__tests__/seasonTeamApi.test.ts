import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockApi = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('../../lib/api', () => ({ api: mockApi }));

import {
  apiGetSeasonTeams,
  apiRegisterTeam,
  apiUpdateSeasonTeamStatus,
  apiRemoveSeasonTeam,
} from '../seasonTeamApi';

describe('seasonTeamApi', () => {
  beforeEach(() => vi.clearAllMocks());

  it('apiGetSeasonTeams calls GET /seasons/:id/teams', async () => {
    const teams = [{ id: 'st1', teamId: 't1', status: 'APPROVED' }];
    mockApi.get.mockResolvedValue({ data: teams });
    const result = await apiGetSeasonTeams('s1');
    expect(mockApi.get).toHaveBeenCalledWith('/seasons/s1/teams');
    expect(result).toEqual(teams);
  });

  it('apiRegisterTeam calls POST /seasons/:id/teams', async () => {
    const st = { id: 'st1', teamId: 't1', status: 'REGISTERED' };
    mockApi.post.mockResolvedValue({ data: st });
    const result = await apiRegisterTeam('s1', 't1');
    expect(mockApi.post).toHaveBeenCalledWith('/seasons/s1/teams', { teamId: 't1' });
    expect(result).toEqual(st);
  });

  it('apiUpdateSeasonTeamStatus calls PATCH /seasons/:id/teams/:teamId/status', async () => {
    const st = { id: 'st1', teamId: 't1', status: 'APPROVED' };
    mockApi.patch.mockResolvedValue({ data: st });
    const result = await apiUpdateSeasonTeamStatus('s1', 't1', 'APPROVED');
    expect(mockApi.patch).toHaveBeenCalledWith('/seasons/s1/teams/t1/status', {
      status: 'APPROVED',
    });
    expect(result).toEqual(st);
  });

  it('apiRemoveSeasonTeam calls DELETE /seasons/:id/teams/:teamId', async () => {
    mockApi.delete.mockResolvedValue({ data: {} });
    await apiRemoveSeasonTeam('s1', 't1');
    expect(mockApi.delete).toHaveBeenCalledWith('/seasons/s1/teams/t1');
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockApi = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
}));

vi.mock('../../lib/api', () => ({ api: mockApi }));

import {
  apiAddMatchEvent,
  apiGetMatch,
  apiGetMatches,
  apiGetTeamRoster,
  apiUpdateMatch,
  apiUpdateMatchStatus,
} from '../matchApi';

describe('matchApi', () => {
  beforeEach(() => vi.clearAllMocks());

  it('apiGetMatches calls GET /matches with params', async () => {
    const data = { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
    mockApi.get.mockResolvedValue({ data });
    const result = await apiGetMatches('s1', 2, 10);
    expect(mockApi.get).toHaveBeenCalledWith('/matches', {
      params: { page: 2, limit: 10, seasonId: 's1' },
    });
    expect(result).toEqual(data);
  });

  it('apiGetMatches uses defaults without seasonId', async () => {
    mockApi.get.mockResolvedValue({ data: { data: [] } });
    await apiGetMatches();
    expect(mockApi.get).toHaveBeenCalledWith('/matches', { params: { page: 1, limit: 20 } });
  });

  it('apiGetMatch calls GET /matches/:id', async () => {
    const match = { id: 'm1', roundNo: 1, status: 'PUBLISHED' };
    mockApi.get.mockResolvedValue({ data: match });
    const result = await apiGetMatch('m1');
    expect(mockApi.get).toHaveBeenCalledWith('/matches/m1');
    expect(result).toEqual(match);
  });

  it('apiAddMatchEvent calls POST /matches/:id/events', async () => {
    const response = {
      ok: true,
      matchId: 'm1',
      createdEvent: { id: 'e1', minute: 45, type: 'GOAL' },
    };
    mockApi.post.mockResolvedValue({ data: response });
    const payload = { minute: 45, type: 'GOAL' as const, teamId: 't1', playerId: 'p1' };
    const result = await apiAddMatchEvent('m1', payload);
    expect(mockApi.post).toHaveBeenCalledWith('/matches/m1/events', payload);
    expect(result.ok).toBe(true);
  });

  it('apiGetTeamRoster calls GET /teams/:id/roster', async () => {
    const roster = { teamId: 't1', teamName: 'Hà Nội FC', count: 2, players: [] };
    mockApi.get.mockResolvedValue({ data: roster });
    const result = await apiGetTeamRoster('t1');
    expect(mockApi.get).toHaveBeenCalledWith('/teams/t1/roster');
    expect(result).toEqual(roster);
  });

  it('apiUpdateMatch calls PATCH /matches/:id', async () => {
    const match = { id: 'm1', stadiumId: 's1' };
    mockApi.patch.mockResolvedValue({ data: match });
    const result = await apiUpdateMatch('m1', { stadiumId: 's1' });
    expect(mockApi.patch).toHaveBeenCalledWith('/matches/m1', { stadiumId: 's1' });
    expect(result).toEqual(match);
  });

  it('apiUpdateMatchStatus calls PATCH /matches/:id/status', async () => {
    const match = { id: 'm1', status: 'FINISHED' };
    mockApi.patch.mockResolvedValue({ data: match });
    const result = await apiUpdateMatchStatus('m1', 'FINISHED');
    expect(mockApi.patch).toHaveBeenCalledWith('/matches/m1/status', { status: 'FINISHED' });
    expect(result).toEqual(match);
  });
});

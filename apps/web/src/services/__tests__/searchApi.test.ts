import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockApi = vi.hoisted(() => ({
  get: vi.fn(),
}));

vi.mock('../../lib/api', () => ({ api: mockApi }));

import { apiGetHeadToHead, apiGetPlayerStats, apiGlobalSearch } from '../searchApi';

describe('searchApi', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('apiGlobalSearch', () => {
    it('calls GET /search with query and default limit', async () => {
      const results = [{ type: 'team', id: 't1', title: 'Hà Nội FC', url: '/teams/t1' }];
      mockApi.get.mockResolvedValue({ data: results });

      const result = await apiGlobalSearch('Hà Nội');

      expect(mockApi.get).toHaveBeenCalledWith('/search', {
        params: { q: 'Hà Nội', limit: 10 },
      });
      expect(result).toEqual(results);
    });

    it('passes custom limit', async () => {
      mockApi.get.mockResolvedValue({ data: [] });
      await apiGlobalSearch('test', 5);
      expect(mockApi.get).toHaveBeenCalledWith('/search', {
        params: { q: 'test', limit: 5 },
      });
    });
  });

  describe('apiGetHeadToHead', () => {
    it('calls GET /standings/head-to-head with two teams', async () => {
      const h2h = {
        totalMatches: 3,
        team1: { teamId: 't1', wins: 1, goals: 3 },
        team2: { teamId: 't2', wins: 1, goals: 2 },
        draws: 1,
        matches: [],
      };
      mockApi.get.mockResolvedValue({ data: h2h });

      const result = await apiGetHeadToHead('t1', 't2');

      expect(mockApi.get).toHaveBeenCalledWith('/standings/head-to-head', {
        params: { team1: 't1', team2: 't2' },
      });
      expect(result).toEqual(h2h);
    });

    it('includes seasonId when provided', async () => {
      mockApi.get.mockResolvedValue({ data: {} });
      await apiGetHeadToHead('t1', 't2', 's1');
      expect(mockApi.get).toHaveBeenCalledWith('/standings/head-to-head', {
        params: { team1: 't1', team2: 't2', seasonId: 's1' },
      });
    });
  });

  describe('apiGetPlayerStats', () => {
    it('calls GET /standings/player-stats/:id', async () => {
      const stats = {
        player: { id: 'p1', fullName: 'Quang Hải', position: 'MF', nationality: 'VN' },
        matchesPlayed: 10,
        goals: 5,
        assists: 3,
        ownGoals: 0,
        yellowCards: 1,
        redCards: 0,
        goalsByRound: {},
        recentEvents: [],
      };
      mockApi.get.mockResolvedValue({ data: stats });

      const result = await apiGetPlayerStats('p1');

      expect(mockApi.get).toHaveBeenCalledWith('/standings/player-stats/p1', {
        params: {},
      });
      expect(result).toEqual(stats);
    });

    it('includes seasonId when provided', async () => {
      mockApi.get.mockResolvedValue({ data: {} });
      await apiGetPlayerStats('p1', 's1');
      expect(mockApi.get).toHaveBeenCalledWith('/standings/player-stats/p1', {
        params: { seasonId: 's1' },
      });
    });
  });
});

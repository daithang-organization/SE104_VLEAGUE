import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockApi = vi.hoisted(() => ({
  get: vi.fn(),
}));

vi.mock('../../lib/api', () => ({ api: mockApi }));

import {
  apiGetCardStats,
  apiGetPlayerOfMatchStats,
  apiGetSeasonAwards,
  apiGetStandings,
  apiGetSuspensionStats,
  apiGetTeamStats,
  apiGetTopAssists,
  apiGetTopScorers,
} from '../standingsApi';

describe('standingsApi', () => {
  beforeEach(() => vi.clearAllMocks());

  it('apiGetStandings calls GET /standings with seasonId', async () => {
    const standings = [{ position: 1, teamName: 'Hà Nội FC', points: 30 }];
    mockApi.get.mockResolvedValue({ data: standings });
    const result = await apiGetStandings('s1');
    expect(mockApi.get).toHaveBeenCalledWith('/standings?seasonId=s1');
    expect(result).toEqual(standings);
  });

  it('apiGetStandings calls GET /standings with final mode', async () => {
    const standings = [{ position: 1, teamName: 'Hà Nội FC', points: 30 }];
    mockApi.get.mockResolvedValue({ data: standings });
    const result = await apiGetStandings('s1', 'final');
    expect(mockApi.get).toHaveBeenCalledWith('/standings?seasonId=s1&mode=final');
    expect(result).toEqual(standings);
  });

  it('apiGetStandings calls GET /standings without seasonId', async () => {
    mockApi.get.mockResolvedValue({ data: [] });
    await apiGetStandings();
    expect(mockApi.get).toHaveBeenCalledWith('/standings');
  });

  it('apiGetTopScorers calls GET /standings/top-scorers with params', async () => {
    const scorers = [{ position: 1, playerName: 'Quang Hải', goals: 10 }];
    mockApi.get.mockResolvedValue({ data: scorers });
    const result = await apiGetTopScorers('s1', 5);
    expect(mockApi.get).toHaveBeenCalledWith('/standings/top-scorers?seasonId=s1&limit=5');
    expect(result).toEqual(scorers);
  });

  it('apiGetTopScorers without params', async () => {
    mockApi.get.mockResolvedValue({ data: [] });
    await apiGetTopScorers();
    expect(mockApi.get).toHaveBeenCalledWith('/standings/top-scorers');
  });

  it('apiGetTopAssists calls GET /standings/top-assists with params', async () => {
    const assists = [{ position: 1, playerName: 'Player A', assists: 8 }];
    mockApi.get.mockResolvedValue({ data: assists });
    const result = await apiGetTopAssists('s1', 5);
    expect(mockApi.get).toHaveBeenCalledWith('/standings/top-assists?seasonId=s1&limit=5');
    expect(result).toEqual(assists);
  });

  it('apiGetTopAssists without params', async () => {
    mockApi.get.mockResolvedValue({ data: [] });
    await apiGetTopAssists();
    expect(mockApi.get).toHaveBeenCalledWith('/standings/top-assists');
  });

  it('apiGetCardStats calls GET /standings/card-stats with params', async () => {
    const stats = [{ position: 1, playerName: 'Player A', yellowCards: 3, redCards: 1 }];
    mockApi.get.mockResolvedValue({ data: stats });
    const result = await apiGetCardStats('s1', 10);
    expect(mockApi.get).toHaveBeenCalledWith('/standings/card-stats?seasonId=s1&limit=10');
    expect(result).toEqual(stats);
  });

  it('apiGetCardStats without params', async () => {
    mockApi.get.mockResolvedValue({ data: [] });
    await apiGetCardStats();
    expect(mockApi.get).toHaveBeenCalledWith('/standings/card-stats');
  });

  it('apiGetTeamStats calls GET /standings/team-stats with seasonId', async () => {
    const stats = [{ teamName: 'Hà Nội FC', played: 10 }];
    mockApi.get.mockResolvedValue({ data: stats });
    const result = await apiGetTeamStats('s1');
    expect(mockApi.get).toHaveBeenCalledWith('/standings/team-stats?seasonId=s1');
    expect(result).toEqual(stats);
  });

  it('apiGetTeamStats without params', async () => {
    mockApi.get.mockResolvedValue({ data: [] });
    await apiGetTeamStats();
    expect(mockApi.get).toHaveBeenCalledWith('/standings/team-stats');
  });

  it('apiGetPlayerOfMatchStats calls GET /standings/player-of-match with params', async () => {
    const stats = [{ position: 1, playerName: 'Player A', awards: 3 }];
    mockApi.get.mockResolvedValue({ data: stats });
    const result = await apiGetPlayerOfMatchStats('s1', 10);
    expect(mockApi.get).toHaveBeenCalledWith('/standings/player-of-match?seasonId=s1&limit=10');
    expect(result).toEqual(stats);
  });

  it('apiGetSuspensionStats calls GET /standings/suspensions with seasonId', async () => {
    const suspensions = [{ id: 'sus1', playerName: 'Player A', status: 'ACTIVE' }];
    mockApi.get.mockResolvedValue({ data: suspensions });
    const result = await apiGetSuspensionStats('s1');
    expect(mockApi.get).toHaveBeenCalledWith('/standings/suspensions?seasonId=s1');
    expect(result).toEqual(suspensions);
  });

  it('apiGetSeasonAwards calls GET /standings/awards with seasonId', async () => {
    const awards = { champion: { teamName: 'Hà Nội FC' }, requiresDrawLot: false };
    mockApi.get.mockResolvedValue({ data: awards });
    const result = await apiGetSeasonAwards('s1');
    expect(mockApi.get).toHaveBeenCalledWith('/standings/awards?seasonId=s1');
    expect(result).toEqual(awards);
  });
});

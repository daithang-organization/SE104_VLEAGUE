import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockApi = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('../../lib/api', () => ({ api: mockApi }));

import {
  apiAddMatchEvent,
  apiAssignMatchOfficial,
  apiCreateOfficial,
  apiGetDisciplineReport,
  apiGetMatchOfficials,
  apiGetMatchLineups,
  apiGetMatch,
  apiGetMatches,
  apiGetMatchReport,
  apiGetMatchSuspensions,
  apiGetOfficials,
  apiGetTeamRoster,
  apiReviewMatchLineup,
  apiRemoveMatchEvent,
  apiRemoveMatchOfficial,
  apiSubmitDisciplineReport,
  apiSubmitMatchLineup,
  apiSubmitMatchReport,
  apiUpdateMatchEvent,
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

  it('apiRemoveMatchEvent calls DELETE /matches/:id/events/:eventId', async () => {
    mockApi.delete.mockResolvedValue({ data: { success: true } });
    const result = await apiRemoveMatchEvent('m1', 'e1');
    expect(mockApi.delete).toHaveBeenCalledWith('/matches/m1/events/e1');
    expect(result).toEqual({ success: true });
  });

  it('apiUpdateMatchEvent calls PATCH /matches/:id/events/:eventId', async () => {
    const response = {
      ok: true,
      matchId: 'm1',
      updatedEvent: { id: 'e1', minute: 55, type: 'PENALTY' },
    };
    const payload = { minute: 55, type: 'PENALTY' as const, teamId: 't1', playerId: 'p1' };
    mockApi.patch.mockResolvedValue({ data: response });

    const result = await apiUpdateMatchEvent('m1', 'e1', payload);

    expect(mockApi.patch).toHaveBeenCalledWith('/matches/m1/events/e1', payload);
    expect(result).toEqual(response);
  });

  it('apiGetMatchLineups calls GET /matches/:id/lineups', async () => {
    const lineups = [{ id: 'lineup-1', matchId: 'm1', teamId: 't1' }];
    mockApi.get.mockResolvedValue({ data: lineups });
    const result = await apiGetMatchLineups('m1');
    expect(mockApi.get).toHaveBeenCalledWith('/matches/m1/lineups');
    expect(result).toEqual(lineups);
  });

  it('apiSubmitMatchLineup calls POST /matches/:id/lineups', async () => {
    const payload = {
      teamId: 't1',
      kitType: 'PRIMARY' as const,
      formation: '4-4-2',
      players: Array.from({ length: 16 }, (_, index) => ({
        playerId: `p${index + 1}`,
        role: index < 11 ? ('STARTER' as const) : ('SUBSTITUTE' as const),
        position: index === 0 ? ('GK' as const) : ('MF' as const),
        shirtNumber: index + 1,
      })),
    };
    const response = { id: 'lineup-1', matchId: 'm1', teamId: 't1' };
    mockApi.post.mockResolvedValue({ data: response });
    const result = await apiSubmitMatchLineup('m1', payload);
    expect(mockApi.post).toHaveBeenCalledWith('/matches/m1/lineups', payload);
    expect(result).toEqual(response);
  });

  it('apiReviewMatchLineup calls PATCH /matches/:id/lineups/:teamId/review', async () => {
    const payload = { status: 'APPROVED' as const, reviewNote: 'Hợp lệ' };
    const response = { id: 'lineup-1', status: 'APPROVED' };
    mockApi.patch.mockResolvedValue({ data: response });
    const result = await apiReviewMatchLineup('m1', 't1', payload);
    expect(mockApi.patch).toHaveBeenCalledWith('/matches/m1/lineups/t1/review', payload);
    expect(result).toEqual(response);
  });

  it('apiGetMatchSuspensions calls GET /matches/:id/suspensions', async () => {
    const suspensions = [{ id: 's1', matchId: 'm1', playerId: 'p1' }];
    mockApi.get.mockResolvedValue({ data: suspensions });
    const result = await apiGetMatchSuspensions('m1');
    expect(mockApi.get).toHaveBeenCalledWith('/matches/m1/suspensions');
    expect(result).toEqual(suspensions);
  });

  it('apiGetOfficials calls GET /officials', async () => {
    const officials = [{ id: 'o1', fullName: 'Nguyễn Văn Trọng' }];
    mockApi.get.mockResolvedValue({ data: officials });
    const result = await apiGetOfficials();
    expect(mockApi.get).toHaveBeenCalledWith('/officials');
    expect(result).toEqual(officials);
  });

  it('apiCreateOfficial calls POST /officials', async () => {
    const payload = { fullName: 'Nguyễn Văn Trọng', email: 'referee@demo.local' };
    const response = { id: 'o1', ...payload };
    mockApi.post.mockResolvedValue({ data: response });
    const result = await apiCreateOfficial(payload);
    expect(mockApi.post).toHaveBeenCalledWith('/officials', payload);
    expect(result).toEqual(response);
  });

  it('apiGetMatchOfficials calls GET /matches/:id/officials', async () => {
    const assignments = [{ id: 'a1', matchId: 'm1', officialId: 'o1', role: 'MAIN_REFEREE' }];
    mockApi.get.mockResolvedValue({ data: assignments });
    const result = await apiGetMatchOfficials('m1');
    expect(mockApi.get).toHaveBeenCalledWith('/matches/m1/officials');
    expect(result).toEqual(assignments);
  });

  it('apiAssignMatchOfficial calls POST /matches/:id/officials', async () => {
    const payload = { officialId: 'o1', role: 'SUPERVISOR' as const, note: 'Giám sát' };
    const response = { id: 'a1', ...payload };
    mockApi.post.mockResolvedValue({ data: response });
    const result = await apiAssignMatchOfficial('m1', payload);
    expect(mockApi.post).toHaveBeenCalledWith('/matches/m1/officials', payload);
    expect(result).toEqual(response);
  });

  it('apiRemoveMatchOfficial calls DELETE /matches/:id/officials/:assignmentId', async () => {
    mockApi.delete.mockResolvedValue({ data: { success: true } });
    const result = await apiRemoveMatchOfficial('m1', 'a1');
    expect(mockApi.delete).toHaveBeenCalledWith('/matches/m1/officials/a1');
    expect(result).toEqual({ success: true });
  });

  it('apiSubmitMatchReport calls POST /matches/:id/report', async () => {
    const payload = {
      homeScore: 2,
      awayScore: 1,
      bestPlayerId: 'p1',
      technicalStats: { shots: { home: 8, away: 5 } },
      events: [{ minute: 12, type: 'GOAL' as const, teamId: 'home-team', playerId: 'p1' }],
    };
    const response = { id: 'r1', matchId: 'm1', bestPlayerId: 'p1' };
    mockApi.post.mockResolvedValue({ data: response });
    const result = await apiSubmitMatchReport('m1', payload);
    expect(mockApi.post).toHaveBeenCalledWith('/matches/m1/report', payload);
    expect(result).toEqual(response);
  });

  it('apiGetMatchReport calls GET /matches/:id/report', async () => {
    const report = { id: 'r1', matchId: 'm1' };
    mockApi.get.mockResolvedValue({ data: report });
    const result = await apiGetMatchReport('m1');
    expect(mockApi.get).toHaveBeenCalledWith('/matches/m1/report');
    expect(result).toEqual(report);
  });

  it('apiSubmitDisciplineReport calls POST /matches/:id/discipline-report', async () => {
    const payload = {
      supervisorId: 'o1',
      organizationRating: 'GOOD',
      playerIssues: 'Một cầu thủ phản ứng trọng tài',
      sendToDisciplinary: true,
    };
    const response = { id: 'd1', matchId: 'm1', supervisorId: 'o1' };
    mockApi.post.mockResolvedValue({ data: response });
    const result = await apiSubmitDisciplineReport('m1', payload);
    expect(mockApi.post).toHaveBeenCalledWith('/matches/m1/discipline-report', payload);
    expect(result).toEqual(response);
  });

  it('apiGetDisciplineReport calls GET /matches/:id/discipline-report', async () => {
    const report = { id: 'd1', matchId: 'm1' };
    mockApi.get.mockResolvedValue({ data: report });
    const result = await apiGetDisciplineReport('m1');
    expect(mockApi.get).toHaveBeenCalledWith('/matches/m1/discipline-report');
    expect(result).toEqual(report);
  });
});

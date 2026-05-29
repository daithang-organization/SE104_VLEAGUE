import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockApi = vi.hoisted(() => ({
  delete: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
}));

vi.mock('../../lib/api', () => ({ api: mockApi }));

import {
  apiGetInvitationCandidates,
  apiGetMyPendingInvitations,
  apiGetPromotionCandidates,
  apiGetSeasonInvitations,
  apiImportPromotionCandidates,
  apiDeletePromotionCandidate,
  apiRespondTeamInvitation,
  apiSendTeamInvitation,
  apiUpsertPromotionCandidate,
} from '../teamInvitationApi';

describe('teamInvitationApi', () => {
  beforeEach(() => vi.clearAllMocks());

  it('apiGetSeasonInvitations calls GET /seasons/:id/invitations', async () => {
    const invitations = [{ id: 'inv-1', status: 'SENT' }];
    mockApi.get.mockResolvedValue({ data: invitations });

    const result = await apiGetSeasonInvitations('season-1');

    expect(mockApi.get).toHaveBeenCalledWith('/seasons/season-1/invitations');
    expect(result).toEqual(invitations);
  });

  it('apiSendTeamInvitation calls POST /seasons/:id/invitations', async () => {
    const invitation = { id: 'inv-1', teamId: 'team-1', status: 'SENT' };
    mockApi.post.mockResolvedValue({ data: invitation });

    const result = await apiSendTeamInvitation('season-1', {
      teamId: 'team-1',
      sourceType: 'REPLACEMENT',
    });

    expect(mockApi.post).toHaveBeenCalledWith('/seasons/season-1/invitations', {
      teamId: 'team-1',
      sourceType: 'REPLACEMENT',
    });
    expect(result).toEqual(invitation);
  });

  it('apiGetInvitationCandidates calls GET /seasons/:id/invitation-candidates', async () => {
    const candidates = {
      previousSeason: { id: 'previous-season', status: 'COMPLETED' },
      candidates: [{ teamId: 'team-1', sourceType: 'PREVIOUS_TOP_8' }],
    };
    mockApi.get.mockResolvedValue({ data: candidates });

    const result = await apiGetInvitationCandidates('season-1');

    expect(mockApi.get).toHaveBeenCalledWith('/seasons/season-1/invitation-candidates', {
      params: undefined,
    });
    expect(result).toEqual(candidates);
  });

  it('apiGetMyPendingInvitations calls GET /team-invitations/my-pending', async () => {
    const invitations = [{ id: 'inv-1', status: 'SENT' }];
    mockApi.get.mockResolvedValue({ data: invitations });

    const result = await apiGetMyPendingInvitations();

    expect(mockApi.get).toHaveBeenCalledWith('/team-invitations/my-pending');
    expect(result).toEqual(invitations);
  });

  it('apiGetPromotionCandidates calls GET /seasons/:id/promotion-candidates', async () => {
    const rows = [{ id: 'pc-1', teamId: 'team-1', rank: 1 }];
    mockApi.get.mockResolvedValue({ data: rows });

    const result = await apiGetPromotionCandidates('season-1');

    expect(mockApi.get).toHaveBeenCalledWith('/seasons/season-1/promotion-candidates');
    expect(result).toEqual(rows);
  });

  it('apiUpsertPromotionCandidate calls POST /seasons/:id/promotion-candidates', async () => {
    const row = { id: 'pc-1', teamId: 'team-1', rank: 1 };
    const payload = {
      teamId: 'team-1',
      rank: 1,
      sourceCompetition: 'V.League 2 2025',
      qualificationType: 'CHAMPION' as const,
      note: 'Vô địch',
    };
    mockApi.post.mockResolvedValue({ data: row });

    const result = await apiUpsertPromotionCandidate('season-1', payload);

    expect(mockApi.post).toHaveBeenCalledWith('/seasons/season-1/promotion-candidates', payload);
    expect(result).toEqual(row);
  });

  it('apiImportPromotionCandidates calls POST /seasons/:id/promotion-candidates/import', async () => {
    const response = { importedCount: 2, replaced: true, candidates: [] };
    const payload = {
      sourceCompetition: 'V.League 2 2025',
      replaceExisting: true,
      rows: [
        { rank: 1, teamName: 'PVF-CAND', qualificationType: 'CHAMPION' as const },
        { rank: 2, teamName: 'Trường Tươi Bình Phước' },
      ],
    };
    mockApi.post.mockResolvedValue({ data: response });

    const result = await apiImportPromotionCandidates('season-1', payload);

    expect(mockApi.post).toHaveBeenCalledWith(
      '/seasons/season-1/promotion-candidates/import',
      payload,
    );
    expect(result).toEqual(response);
  });

  it('apiDeletePromotionCandidate calls DELETE /seasons/:id/promotion-candidates/:teamId', async () => {
    mockApi.delete.mockResolvedValue({ data: { count: 1 } });

    const result = await apiDeletePromotionCandidate('season-1', 'team-1');

    expect(mockApi.delete).toHaveBeenCalledWith('/seasons/season-1/promotion-candidates/team-1');
    expect(result).toEqual({ count: 1 });
  });

  it('apiRespondTeamInvitation calls PATCH /team-invitations/:id/respond', async () => {
    const invitation = { id: 'inv-1', status: 'ACCEPTED' };
    mockApi.patch.mockResolvedValue({ data: invitation });

    const result = await apiRespondTeamInvitation('inv-1', {
      responseStatus: 'ACCEPTED',
    });

    expect(mockApi.patch).toHaveBeenCalledWith('/team-invitations/inv-1/respond', {
      responseStatus: 'ACCEPTED',
    });
    expect(result).toEqual(invitation);
  });
});

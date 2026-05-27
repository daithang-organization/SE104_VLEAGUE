import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockApi = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
}));

vi.mock('../../lib/api', () => ({ api: mockApi }));

import {
  apiGetInvitationCandidates,
  apiGetMyPendingInvitations,
  apiGetSeasonInvitations,
  apiRespondTeamInvitation,
  apiSendTeamInvitation,
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

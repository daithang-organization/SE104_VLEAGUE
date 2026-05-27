import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseAuth = vi.hoisted(() =>
  vi.fn(() => ({
    user: { id: 'manager-1', email: 'manager.hanoi@demo.local', role: 'TEAM_MANAGER' },
  })),
);

const mockInvitationApi = vi.hoisted(() => ({
  apiGetMyPendingInvitations: vi.fn(),
  apiRespondTeamInvitation: vi.fn(),
}));

vi.mock('../../auth/AuthContext', () => ({ useAuth: mockUseAuth }));
vi.mock('../../services/teamInvitationApi', () => mockInvitationApi);

import TeamInvitationPopup from '../TeamInvitationPopup';

const pendingInvitation = {
  id: 'inv-1',
  seasonId: 'season-1',
  teamId: 'team-1',
  sourceType: 'PREVIOUS_TOP_8',
  status: 'SENT',
  sentAt: '2026-05-01T00:00:00.000Z',
  deadlineAt: '2026-05-15T00:00:00.000Z',
  responseAt: null,
  responseReason: null,
  regulationsSnapshot: {
    MIN_ROSTER: '16',
    MAX_ROSTER: '22',
    MAX_FOREIGN_PLAYERS: '5',
    MAX_FOREIGN_PLAYERS_ON_FIELD: '3',
    MIN_STADIUM_CAPACITY: '10000',
    MIN_STADIUM_FIFA_STARS: '2',
    PARTICIPATION_FEE_VND: '1000000000',
  },
  season: { id: 'season-1', name: 'V.League 2026', year: 2026 },
  team: { id: 'team-1', name: 'Hà Nội FC' },
  createdAt: '2026-05-01T00:00:00.000Z',
  updatedAt: '2026-05-01T00:00:00.000Z',
};

describe('TeamInvitationPopup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: { id: 'manager-1', email: 'manager.hanoi@demo.local', role: 'TEAM_MANAGER' },
    });
    mockInvitationApi.apiGetMyPendingInvitations.mockResolvedValue([pendingInvitation]);
    mockInvitationApi.apiRespondTeamInvitation.mockResolvedValue({
      ...pendingInvitation,
      status: 'ACCEPTED',
    });
  });

  it('shows pending invitation regulations to the team manager', async () => {
    render(<TeamInvitationPopup />);

    expect(await screen.findByText('Lời mời tham dự V.League 2026')).toBeInTheDocument();
    expect(screen.getByText('Hà Nội FC')).toBeInTheDocument();
    expect(screen.getByText('1.000.000.000 VND')).toBeInTheDocument();
    expect(screen.getByText('16 - 22 cầu thủ')).toBeInTheDocument();
  });

  it('accepts the active invitation', async () => {
    render(<TeamInvitationPopup />);

    await userEvent.click(await screen.findByRole('button', { name: /Đồng ý tham gia/i }));

    await waitFor(() => {
      expect(mockInvitationApi.apiRespondTeamInvitation).toHaveBeenCalledWith('inv-1', {
        responseStatus: 'ACCEPTED',
        responseReason: undefined,
      });
    });
  });

  it('does not fetch invitations for non-manager accounts', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'admin-1', email: 'admin@demo.local', role: 'ADMIN' },
    });

    render(<TeamInvitationPopup />);

    expect(mockInvitationApi.apiGetMyPendingInvitations).not.toHaveBeenCalled();
  });
});

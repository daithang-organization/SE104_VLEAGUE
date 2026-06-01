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
    MIN_AGE: '16',
    MAX_AGE: '40',
    MAX_FOREIGN_PLAYERS: '5',
    MAX_FOREIGN_PLAYERS_ON_FIELD: '3',
    MIN_STADIUM_CAPACITY: '10000',
    MIN_STADIUM_FIFA_STARS: '2',
    PARTICIPATION_FEE_VND: '1000000000',
  },
  compliance: {
    roster: { current: 20, min: 16, max: 22, ok: true },
    foreignPlayers: { current: 4, max: 5, maxOnField: 3, ok: true },
    age: { min: 16, max: 40, total: 20, invalidCount: 0, ok: true },
    stadium: {
      stadiumId: 'stadium-1',
      stadiumName: 'Sân Hàng Đẫy',
      capacity: 22500,
      fifaStars: 3,
      minCapacity: 10000,
      minFifaStars: 2,
      ok: true,
    },
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
    expect(screen.getByText(/16 - 22 cầu thủ/)).toBeInTheDocument();
    expect(screen.getByText(/16 - 40 tuổi/)).toBeInTheDocument();
    expect(screen.getByText(/hiện tại: 20/)).toBeInTheDocument();
    expect(screen.getByText(/20\/20 cầu thủ đạt/)).toBeInTheDocument();
    expect(screen.getAllByLabelText('Đạt quy định')).toHaveLength(4);
  });

  it('shows an alert when the current roster violates the invited season regulations', async () => {
    mockInvitationApi.apiGetMyPendingInvitations.mockResolvedValue([
      {
        ...pendingInvitation,
        compliance: {
          ...pendingInvitation.compliance,
          roster: { current: 12, min: 16, max: 22, ok: false },
        },
      },
    ]);

    render(<TeamInvitationPopup />);

    expect(
      await screen.findByText('Số lượng cầu thủ hiện tại không đảm bảo quy định'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Không đạt quy định')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Đồng ý tham gia/i })).toBeDisabled();
    expect(
      screen.getByText('Vui lòng đáp ứng đầy đủ các quy định để tham gia mùa giải'),
    ).toBeInTheDocument();
  });

  it('shows an alert when a player age violates the invited season regulations', async () => {
    mockInvitationApi.apiGetMyPendingInvitations.mockResolvedValue([
      {
        ...pendingInvitation,
        compliance: {
          ...pendingInvitation.compliance,
          age: { min: 16, max: 40, total: 20, invalidCount: 2, ok: false },
        },
      },
    ]);

    render(<TeamInvitationPopup />);

    expect(
      await screen.findByText('Độ tuổi cầu thủ hiện tại không đảm bảo quy định'),
    ).toBeInTheDocument();
    expect(screen.getByText(/18\/20 cầu thủ đạt/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Đồng ý tham gia/i })).toBeDisabled();
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

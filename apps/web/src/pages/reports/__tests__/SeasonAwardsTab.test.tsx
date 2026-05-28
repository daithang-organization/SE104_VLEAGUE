import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TeamStanding } from '../../../services/standingsApi';
import SeasonAwardsTab from '../SeasonAwardsTab';

const mockAuth = vi.hoisted(() => ({
  useAuth: vi.fn(() => ({
    user: { id: 'admin-1', email: 'admin@demo.local', role: 'ADMIN' },
  })),
}));

const mockStandingsApi = vi.hoisted(() => ({
  apiGetDrawLotStatus: vi.fn(),
  apiExecuteDrawLot: vi.fn(),
  apiConfirmDrawLot: vi.fn(),
  apiResetDrawLot: vi.fn(),
}));

vi.mock('../../../auth/AuthContext', () => mockAuth);
vi.mock('../../../services/standingsApi', () => mockStandingsApi);
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: { count?: number }) => `${key}${params?.count ?? ''}`,
  }),
}));

const makeStanding = (overrides: Partial<TeamStanding>): TeamStanding => ({
  position: 1,
  teamId: 'team-a',
  teamName: 'A FC',
  played: 0,
  won: 0,
  drawn: 0,
  lost: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  goalDifference: 0,
  points: 0,
  recentForm: [],
  ...overrides,
});

describe('SeasonAwardsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStandingsApi.apiGetDrawLotStatus.mockResolvedValue({
      seasonId: 'season-1',
      teamsRequiringDrawLot: [],
      isResolved: false,
      results: [
        {
          id: 'draw-1',
          seasonId: 'season-1',
          teamId: 'team-a',
          team: { id: 'team-a', name: 'A FC', shortName: 'A' },
          resolvedRank: 1,
          note: 'Rút thăm tự động',
          confirmed: false,
          resolvedAt: '2026-05-28T00:00:00.000Z',
          resolvedBy: null,
        },
        {
          id: 'draw-2',
          seasonId: 'season-1',
          teamId: 'team-b',
          team: { id: 'team-b', name: 'B FC', shortName: 'B' },
          resolvedRank: 2,
          note: 'Rút thăm tự động',
          confirmed: false,
          resolvedAt: '2026-05-28T00:00:00.000Z',
          resolvedBy: null,
        },
      ],
    });
    mockStandingsApi.apiConfirmDrawLot.mockResolvedValue({
      message: 'Đã xác nhận kết quả rút thăm.',
    });
  });

  it('notifies parent to reload awards after confirming draw-lot results', async () => {
    const onAwardsChanged = vi.fn().mockResolvedValue(undefined);

    render(
      <SeasonAwardsTab
        awards={{
          seasonId: 'season-1',
          champion: makeStanding({ teamId: 'team-a', teamName: 'A FC', points: 40 }),
          runnerUp: makeStanding({ position: 2, teamId: 'team-b', teamName: 'B FC', points: 40 }),
          topScorer: null,
          bestPlayer: null,
          requiresDrawLot: true,
          standings: [],
        }}
        loading={false}
        onAwardsChanged={onAwardsChanged}
      />,
    );

    const confirmButton = await screen.findByRole('button', {
      name: /Xác nhận kết quả/i,
    });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockStandingsApi.apiConfirmDrawLot).toHaveBeenCalledWith('season-1', [
        { teamId: 'team-a', resolvedRank: 1 },
        { teamId: 'team-b', resolvedRank: 2 },
      ]);
      expect(onAwardsChanged).toHaveBeenCalledTimes(1);
    });
  });
});

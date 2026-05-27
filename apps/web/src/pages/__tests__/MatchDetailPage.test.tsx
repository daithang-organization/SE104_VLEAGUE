import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseAuth = vi.hoisted(() =>
  vi.fn(() => ({
    user: { id: 'u1', email: 'admin@vl.local', role: 'ADMIN' },
    loading: false,
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
  })),
);

const homeRoster = Array.from({ length: 16 }, (_, index) => ({
  id: `h-row-${index + 1}`,
  playerId: `h-player-${index + 1}`,
  fullName: `Home Player ${index + 1}`,
  position: index === 0 ? 'GK' : 'MF',
  nationality: index < 3 ? 'Brazil' : 'Việt Nam',
  jerseyNumber: index + 1,
}));

const awayRoster = Array.from({ length: 16 }, (_, index) => ({
  id: `a-row-${index + 1}`,
  playerId: `a-player-${index + 1}`,
  fullName: `Away Player ${index + 1}`,
  position: index === 0 ? 'GK' : 'DF',
  nationality: 'Việt Nam',
  jerseyNumber: index + 1,
}));

const mockMatchApi = vi.hoisted(() => ({
  apiGetMatch: vi.fn().mockResolvedValue({
    id: 'm1',
    roundNo: 1,
    leg: 1,
    seasonId: 's1',
    season: { id: 's1', name: 'V.League 2025' },
    homeTeamId: 'home-team',
    awayTeamId: 'away-team',
    homeTeam: { id: 'home-team', name: 'Ha Noi FC', shortName: 'HN' },
    awayTeam: { id: 'away-team', name: 'Hai Phong FC', shortName: 'HP' },
    homeScore: null,
    awayScore: null,
    status: 'PUBLISHED',
    events: [],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  }),
  apiGetTeamRoster: vi.fn((teamId: string) =>
    Promise.resolve({
      teamId,
      teamName: teamId === 'home-team' ? 'Ha Noi FC' : 'Hai Phong FC',
      count: 16,
      players: teamId === 'home-team' ? homeRoster : awayRoster,
    }),
  ),
  apiUpdateMatchStatus: vi.fn().mockResolvedValue({}),
  apiGetMatchLineups: vi.fn().mockResolvedValue([]),
  apiSubmitMatchLineup: vi.fn().mockResolvedValue({}),
  apiReviewMatchLineup: vi.fn().mockResolvedValue({}),
  apiGetMatchSuspensions: vi.fn().mockResolvedValue([
    {
      id: 's1',
      playerId: 'h-player-4',
      teamId: 'home-team',
      reason: 'RED_CARD',
      status: 'ACTIVE',
      player: { id: 'h-player-4', fullName: 'Home Player 4' },
      team: { id: 'home-team', name: 'Ha Noi FC' },
      sourceMatch: { id: 'm0', roundNo: 0 },
    },
  ]),
}));

vi.mock('../../auth/AuthContext', () => ({ useAuth: mockUseAuth }));
vi.mock('../../hooks/useMatchSocket', () => ({ useMatchSocket: () => ({ isConnected: false }) }));
vi.mock('../../services/matchApi', () => mockMatchApi);

import MatchDetailPage from '../MatchDetailPage';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/matches/m1']}>
      <Routes>
        <Route path="/matches/:id" element={<MatchDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('MatchDetailPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads match lineups and suspensions and shows the lineup registration panel', async () => {
    renderPage();

    await screen.findByText(/Chi tiết trận đấu/);
    await userEvent.click(screen.getByRole('tab', { name: /Đội hình/ }));

    await waitFor(() => {
      expect(mockMatchApi.apiGetMatchLineups).toHaveBeenCalledWith('m1');
      expect(mockMatchApi.apiGetMatchSuspensions).toHaveBeenCalledWith('m1');
    });

    expect(screen.getByText('Đăng ký thi đấu')).toBeInTheDocument();
    expect(screen.getByText('Treo giò trận này')).toBeInTheDocument();
    expect(screen.getByText(/11 chính thức \/ 5 dự bị/)).toBeInTheDocument();
  });
});

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
  apiGetOfficials: vi.fn().mockResolvedValue([
    { id: 'official-1', fullName: 'Nguyễn Văn Trọng', status: 'ACTIVE' },
    { id: 'official-2', fullName: 'Trần Văn Giám', status: 'ACTIVE' },
  ]),
  apiGetMatchOfficials: vi.fn().mockResolvedValue([
    {
      id: 'assignment-1',
      matchId: 'm1',
      officialId: 'official-1',
      role: 'MAIN_REFEREE',
      official: { id: 'official-1', fullName: 'Nguyễn Văn Trọng', status: 'ACTIVE' },
    },
    {
      id: 'assignment-2',
      matchId: 'm1',
      officialId: 'official-2',
      role: 'SUPERVISOR',
      official: { id: 'official-2', fullName: 'Trần Văn Giám', status: 'ACTIVE' },
    },
  ]),
  apiAssignMatchOfficial: vi.fn().mockResolvedValue({}),
  apiGetMatchReport: vi.fn().mockResolvedValue({
    id: 'report-1',
    matchId: 'm1',
    homeScore: 2,
    awayScore: 1,
    bestPlayerId: 'h-player-1',
    bestPlayer: { id: 'h-player-1', fullName: 'Home Player 1' },
  }),
  apiSubmitMatchReport: vi.fn().mockResolvedValue({}),
  apiGetDisciplineReport: vi.fn().mockResolvedValue({
    id: 'discipline-1',
    matchId: 'm1',
    supervisorId: 'official-2',
    organizationRating: 'GOOD',
    playerIssues: 'Một cầu thủ phản ứng trọng tài',
    supervisor: { id: 'official-2', fullName: 'Trần Văn Giám', status: 'ACTIVE' },
  }),
  apiSubmitDisciplineReport: vi.fn().mockResolvedValue({}),
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

  it('renders the score area as a hero with grid cards', async () => {
    const { container } = renderPage();

    await screen.findByText(/Chi tiết trận đấu/);

    expect(container.querySelector('.match-detail-score-hero')).toBeInTheDocument();
    expect(container.querySelector('.match-detail-score-grid')).toBeInTheDocument();
    expect(container.querySelectorAll('.match-detail-score-grid-card')).toHaveLength(3);
    expect(container.querySelector('.match-detail-score-card')).toHaveTextContent('— : —');
  });

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

  it('loads match officials and reports in the officials tab', async () => {
    renderPage();

    await screen.findByText(/Chi tiết trận đấu/);
    await userEvent.click(screen.getByRole('tab', { name: /Trọng tài/ }));

    await waitFor(() => {
      expect(mockMatchApi.apiGetOfficials).toHaveBeenCalled();
      expect(mockMatchApi.apiGetMatchOfficials).toHaveBeenCalledWith('m1');
      expect(mockMatchApi.apiGetMatchReport).toHaveBeenCalledWith('m1');
      expect(mockMatchApi.apiGetDisciplineReport).toHaveBeenCalledWith('m1');
    });

    expect(screen.getAllByText('Nguyễn Văn Trọng').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Trọng tài chính').length).toBeGreaterThan(0);
    expect(screen.getByText('Cầu thủ xuất sắc')).toBeInTheDocument();
    expect(screen.getByText('Home Player 1')).toBeInTheDocument();
    expect(screen.getByText('Một cầu thủ phản ứng trọng tài')).toBeInTheDocument();
  });
});

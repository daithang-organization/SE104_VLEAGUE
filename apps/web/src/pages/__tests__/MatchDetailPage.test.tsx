import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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

const submittedLineups = [
  {
    id: 'home-lineup',
    matchId: 'm1',
    teamId: 'home-team',
    kitType: 'PRIMARY',
    formation: '4-4-2',
    status: 'APPROVED',
    team: { id: 'home-team', name: 'Ha Noi FC', shortName: 'HN' },
    lineupPlayers: homeRoster.map((player, index) => ({
      id: `home-lineup-player-${index + 1}`,
      registrationId: 'home-lineup',
      playerId: player.playerId,
      role: index < 11 ? 'STARTER' : 'SUBSTITUTE',
      position: player.position,
      shirtNumber: player.jerseyNumber,
      player: {
        id: player.playerId,
        fullName: player.fullName,
        position: player.position,
        nationality: player.nationality,
      },
    })),
  },
  {
    id: 'away-lineup',
    matchId: 'm1',
    teamId: 'away-team',
    kitType: 'BACKUP',
    formation: '4-2-3-1',
    status: 'SUBMITTED',
    team: { id: 'away-team', name: 'Hai Phong FC', shortName: 'HP' },
    lineupPlayers: awayRoster.map((player, index) => ({
      id: `away-lineup-player-${index + 1}`,
      registrationId: 'away-lineup',
      playerId: player.playerId,
      role: index < 11 ? 'STARTER' : 'SUBSTITUTE',
      position: player.position,
      shirtNumber: player.jerseyNumber,
      player: {
        id: player.playerId,
        fullName: player.fullName,
        position: player.position,
        nationality: player.nationality,
      },
    })),
  },
];

const matchWithEvents = {
  id: 'm1',
  roundNo: 1,
  leg: 1,
  seasonId: 's1',
  season: { id: 's1', name: 'V.League 2025' },
  homeTeamId: 'home-team',
  awayTeamId: 'away-team',
  homeTeam: { id: 'home-team', name: 'Ha Noi FC', shortName: 'HN' },
  awayTeam: { id: 'away-team', name: 'Hai Phong FC', shortName: 'HP' },
  homeScore: 1,
  awayScore: 0,
  status: 'PUBLISHED',
  events: [
    {
      id: 'event-goal-1',
      minute: 23,
      type: 'GOAL',
      teamId: 'home-team',
      playerId: 'h-player-1',
      player: { id: 'h-player-1', fullName: 'Home Player 1' },
      team: { id: 'home-team', name: 'Ha Noi FC' },
      note: 'Goal from open play',
    },
    {
      id: 'event-card-1',
      minute: 45,
      type: 'YELLOW_CARD',
      teamId: 'away-team',
      playerId: 'a-player-2',
      player: { id: 'a-player-2', fullName: 'Away Player 2' },
      team: { id: 'away-team', name: 'Hai Phong FC' },
      note: 'Tactical foul',
    },
    {
      id: 'event-red-1',
      minute: 67,
      type: 'RED_CARD',
      playerId: 'h-player-3',
      player: { id: 'h-player-3', fullName: 'Home Player 3' },
      team: { id: 'home-team', name: 'Ha Noi FC' },
      note: 'Serious foul',
    },
    {
      id: 'event-sub-1',
      minute: 70,
      type: 'SUBSTITUTION',
      teamId: 'home-team',
      playerId: 'h-player-12',
      player: { id: 'h-player-12', fullName: 'Home Player 12' },
      relatedPlayerId: 'h-player-4',
      relatedPlayer: { id: 'h-player-4', fullName: 'Home Player 4' },
      note: 'Fresh legs',
    },
    {
      id: 'event-sub-2',
      minute: 74,
      type: 'SUBSTITUTION',
      playerId: 'a-player-12',
      player: { id: 'a-player-12', fullName: 'Away Player 12' },
      team: { id: 'away-team', name: 'Hai Phong FC' },
      relatedPlayerId: 'a-player-4',
      relatedPlayer: { id: 'a-player-4', fullName: 'Away Player 4' },
      note: 'Away change',
    },
  ],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

const defaultMatch = {
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
};

const defaultTeamRoster = (teamId: string) => ({
  teamId,
  teamName: teamId === 'home-team' ? 'Ha Noi FC' : 'Hai Phong FC',
  count: 16,
  players: teamId === 'home-team' ? homeRoster : awayRoster,
});

const defaultSuspensions = [
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
];

const defaultOfficials = [
  { id: 'official-1', fullName: 'Nguyễn Văn Trọng', status: 'ACTIVE' },
  { id: 'official-2', fullName: 'Trần Văn Giám', status: 'ACTIVE' },
];

const defaultMatchOfficials = [
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
];

const defaultMatchReport = {
  id: 'report-1',
  matchId: 'm1',
  homeScore: 2,
  awayScore: 1,
  bestPlayerId: 'h-player-1',
  bestPlayer: { id: 'h-player-1', fullName: 'Home Player 1' },
};

const defaultDisciplineReport = {
  id: 'discipline-1',
  matchId: 'm1',
  supervisorId: 'official-2',
  organizationRating: 'GOOD',
  playerIssues: 'Một cầu thủ phản ứng trọng tài',
  supervisor: { id: 'official-2', fullName: 'Trần Văn Giám', status: 'ACTIVE' },
};

const mockMatchApi = vi.hoisted(() => ({
  apiGetMatch: vi.fn(),
  apiUpdateMatchEvent: vi.fn(),
  apiGetTeamRoster: vi.fn(),
  apiUpdateMatchStatus: vi.fn(),
  apiGetMatchLineups: vi.fn(),
  apiSubmitMatchLineup: vi.fn(),
  apiReviewMatchLineup: vi.fn(),
  apiGetMatchSuspensions: vi.fn(),
  apiGetOfficials: vi.fn(),
  apiGetMatchOfficials: vi.fn(),
  apiAssignMatchOfficial: vi.fn(),
  apiGetMatchReport: vi.fn(),
  apiSubmitMatchReport: vi.fn(),
  apiGetDisciplineReport: vi.fn(),
  apiSubmitDisciplineReport: vi.fn(),
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

function resetMatchApiMocks() {
  mockMatchApi.apiGetMatch.mockReset();
  mockMatchApi.apiGetMatch.mockResolvedValue(defaultMatch);
  mockMatchApi.apiUpdateMatchEvent.mockReset();
  mockMatchApi.apiUpdateMatchEvent.mockResolvedValue({ ok: true });
  mockMatchApi.apiGetTeamRoster.mockReset();
  mockMatchApi.apiGetTeamRoster.mockImplementation((teamId: string) =>
    Promise.resolve(defaultTeamRoster(teamId)),
  );
  mockMatchApi.apiUpdateMatchStatus.mockReset();
  mockMatchApi.apiUpdateMatchStatus.mockResolvedValue({});
  mockMatchApi.apiGetMatchLineups.mockReset();
  mockMatchApi.apiGetMatchLineups.mockResolvedValue([]);
  mockMatchApi.apiSubmitMatchLineup.mockReset();
  mockMatchApi.apiSubmitMatchLineup.mockResolvedValue({});
  mockMatchApi.apiReviewMatchLineup.mockReset();
  mockMatchApi.apiReviewMatchLineup.mockResolvedValue({});
  mockMatchApi.apiGetMatchSuspensions.mockReset();
  mockMatchApi.apiGetMatchSuspensions.mockResolvedValue(defaultSuspensions);
  mockMatchApi.apiGetOfficials.mockReset();
  mockMatchApi.apiGetOfficials.mockResolvedValue(defaultOfficials);
  mockMatchApi.apiGetMatchOfficials.mockReset();
  mockMatchApi.apiGetMatchOfficials.mockResolvedValue(defaultMatchOfficials);
  mockMatchApi.apiAssignMatchOfficial.mockReset();
  mockMatchApi.apiAssignMatchOfficial.mockResolvedValue({});
  mockMatchApi.apiGetMatchReport.mockReset();
  mockMatchApi.apiGetMatchReport.mockResolvedValue(defaultMatchReport);
  mockMatchApi.apiSubmitMatchReport.mockReset();
  mockMatchApi.apiSubmitMatchReport.mockResolvedValue({});
  mockMatchApi.apiGetDisciplineReport.mockReset();
  mockMatchApi.apiGetDisciplineReport.mockResolvedValue(defaultDisciplineReport);
  mockMatchApi.apiSubmitDisciplineReport.mockReset();
  mockMatchApi.apiSubmitDisciplineReport.mockResolvedValue({});
}

describe('MatchDetailPage', () => {
  beforeEach(() => resetMatchApiMocks());

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
    fireEvent.click(screen.getByRole('tab', { name: /Đội hình/ }));

    await waitFor(() => {
      expect(mockMatchApi.apiGetMatchLineups).toHaveBeenCalledWith('m1');
      expect(mockMatchApi.apiGetMatchSuspensions).toHaveBeenCalledWith('m1');
    });

    expect(screen.getByText('Đăng ký thi đấu')).toBeInTheDocument();
    expect(screen.getByText('Treo giò trận này')).toBeInTheDocument();
    expect(screen.getByText(/11 chính thức \/ 5 dự bị/)).toBeInTheDocument();
  });

  it('hides lineup submission when the match is locked', async () => {
    mockMatchApi.apiGetMatch.mockResolvedValueOnce({
      ...defaultMatch,
      status: 'LOCKED',
    });

    renderPage();

    await screen.findByText(/Chi tiết trận đấu/);
    await userEvent.click(screen.getByRole('tab', { name: /Đội hình/ }));

    await waitFor(() => {
      expect(mockMatchApi.apiGetMatchLineups).toHaveBeenCalledWith('m1');
    });

    expect(screen.queryByText('Đăng ký thi đấu')).not.toBeInTheDocument();
    expect(
      screen.getByText('Trận đã khóa đội hình; chỉ có thể xem hoặc xét duyệt danh sách đã nộp.'),
    ).toBeInTheDocument();
  });

  it('filters the lineup registration roster by player name', async () => {
    renderPage();

    await screen.findByText(/Chi tiết trận đấu/);
    await userEvent.click(screen.getByRole('tab', { name: /Đội hình/ }));

    const registrationCard = screen
      .getByText('Đăng ký thi đấu')
      .closest('.ant-card') as HTMLElement;
    const searchInput = within(registrationCard).getByPlaceholderText('Tìm cầu thủ trong roster');

    await userEvent.type(searchInput, 'Home Player 8');

    await waitFor(() => {
      expect(within(registrationCard).getByText('Home Player 8')).toBeInTheDocument();
      expect(within(registrationCard).queryByText('Home Player 1')).not.toBeInTheDocument();
    });
  });

  it('renders the timeline area as a hero with grid cards', async () => {
    const { container } = renderPage();

    await screen.findByText(/Chi tiết trận đấu/);
    await userEvent.click(screen.getByRole('tab', { name: /Diễn biến trận đấu/ }));

    expect(container.querySelector('.match-timeline-hero')).toBeInTheDocument();
    expect(container.querySelector('.match-timeline-grid')).toBeInTheDocument();
    expect(container.querySelectorAll('.match-timeline-grid-card')).toHaveLength(3);
  });

  it('opens an existing event for editing and saves it through update API', async () => {
    mockMatchApi.apiGetMatch.mockResolvedValueOnce({
      id: 'm1',
      roundNo: 1,
      leg: 1,
      seasonId: 's1',
      season: { id: 's1', name: 'V.League 2025' },
      homeTeamId: 'home-team',
      awayTeamId: 'away-team',
      homeTeam: { id: 'home-team', name: 'Ha Noi FC', shortName: 'HN' },
      awayTeam: { id: 'away-team', name: 'Hai Phong FC', shortName: 'HP' },
      homeScore: 1,
      awayScore: 0,
      status: 'PUBLISHED',
      events: [
        {
          id: 'event-1',
          minute: 23,
          type: 'GOAL',
          teamId: 'home-team',
          playerId: 'h-player-1',
          player: { id: 'h-player-1', fullName: 'Home Player 1' },
          team: { id: 'home-team', name: 'Ha Noi FC' },
          note: 'Old note',
        },
      ],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    });

    renderPage();

    await screen.findByText(/Chi tiết trận đấu/);
    await userEvent.click(screen.getByRole('tab', { name: /Sự kiện/ }));
    await userEvent.click(screen.getByRole('button', { name: /Sửa sự kiện 23/ }));

    const minuteInput = screen.getByPlaceholderText('Phút');
    await userEvent.clear(minuteInput);
    await userEvent.type(minuteInput, '55');
    await userEvent.click(screen.getByRole('button', { name: 'Cập nhật' }));

    await waitFor(() => {
      expect(mockMatchApi.apiUpdateMatchEvent).toHaveBeenCalledWith(
        'm1',
        'event-1',
        expect.objectContaining({
          minute: 55,
          type: 'GOAL',
          teamId: 'home-team',
          playerId: 'h-player-1',
          note: 'Old note',
        }),
      );
    });
  });

  it('renders the match center tabs with timeline, lineup, bench, and stats shells', async () => {
    mockMatchApi.apiGetMatch.mockResolvedValueOnce(matchWithEvents);
    mockMatchApi.apiGetMatchLineups.mockResolvedValueOnce(submittedLineups);
    mockMatchApi.apiGetMatchReport.mockResolvedValueOnce({
      id: 'report-1',
      matchId: 'm1',
      homeScore: 1,
      awayScore: 0,
      technicalStats: {
        shots: { homeTeam: 13, awayTeam: 5 },
        onTarget: [5, 0],
        ballPossession: { homeValue: '62%', awayValue: '38%' },
        totalPasses: [516, 299],
      },
    });

    const { container } = renderPage();

    await screen.findByText(/Chi tiết trận đấu/);
    fireEvent.click(screen.getByRole('tab', { name: /Đội hình/ }));

    await waitFor(() => {
      expect(mockMatchApi.apiGetMatchLineups).toHaveBeenCalledWith('m1');
    });

    const matchCenter = container.querySelector('.match-center-card');
    expect(matchCenter).toBeInTheDocument();
    const matchCenterElement = matchCenter as HTMLElement;
    expect(
      within(matchCenterElement).getByRole('tab', { name: /DIỄN BIẾN TRẬN ĐẤU/ }),
    ).toBeInTheDocument();
    expect(
      within(matchCenterElement).getByRole('tab', { name: /ĐỘI HÌNH RA SÂN/ }),
    ).toBeInTheDocument();
    expect(within(matchCenterElement).getByRole('tab', { name: /THỐNG KÊ/ })).toBeInTheDocument();

    fireEvent.click(within(matchCenterElement).getByRole('tab', { name: /ĐỘI HÌNH RA SÂN/ }));
    expect(matchCenterElement.querySelector('.lineup-pitch')).toBeInTheDocument();
    expect(matchCenterElement.querySelector('.lineup-pitch')).toHaveTextContent('Đội hình ra sân');
    expect(within(matchCenterElement).getAllByText('Ha Noi FC').length).toBeGreaterThan(0);
    expect(within(matchCenterElement).getAllByText('Hai Phong FC').length).toBeGreaterThan(0);
    expect(matchCenterElement.querySelector('.lineup-bench')).toBeInTheDocument();
    expect(matchCenterElement.querySelector('.lineup-bench')).toHaveTextContent('Bảng ghế dự bị');

    fireEvent.click(within(matchCenterElement).getByRole('tab', { name: /THỐNG KÊ/ }));
    const statsPanel = matchCenterElement.querySelector('.match-stats-panel') as HTMLElement;
    expect(statsPanel).toBeInTheDocument();
    expect(statsPanel.querySelector('.match-stats-teams')).toHaveTextContent('Ha Noi FC');
    expect(statsPanel.querySelector('.match-stats-teams')).toHaveTextContent('Hai Phong FC');
    expect(within(statsPanel).getByText('Thông số trận đấu')).toBeInTheDocument();

    const expectStatsRow = (label: string, home: string, away: string) => {
      const row = within(statsPanel).getByText(label).closest('.match-stats-row') as HTMLElement;
      expect(row).toBeInTheDocument();
      expect(Array.from(row.querySelectorAll('strong')).map((value) => value.textContent)).toEqual([
        home,
        away,
      ]);
    };

    expectStatsRow('Bàn thắng', '1', '0');
    expectStatsRow('Số lần sút', '13', '5');
    expectStatsRow('Sút trúng đích', '5', '0');
    expectStatsRow('Kiểm soát bóng', '62%', '38%');
    expectStatsRow('Lượt chuyền bóng', '516', '299');
    expectStatsRow('Thẻ vàng', '0', '1');
    expectStatsRow('Thẻ đỏ', '1', '0');
    expectStatsRow('Thay người', '1', '1');

    fireEvent.click(within(matchCenterElement).getByRole('tab', { name: /DIỄN BIẾN TRẬN ĐẤU/ }));
    expect(within(matchCenterElement).getByLabelText('Diễn biến trận đấu')).toBeInTheDocument();
    expect(matchCenterElement.querySelector('.match-timeline-hero')).toBeInTheDocument();
  });

  it('shows a pending lineup state inside the match center when no team has submitted', async () => {
    renderPage();

    await screen.findByText(/Chi tiết trận đấu/);
    await userEvent.click(screen.getByRole('tab', { name: /Đội hình/ }));

    const matchCenter = document.querySelector('.match-center-card');
    expect(matchCenter).toBeInTheDocument();
    const matchCenterElement = matchCenter as HTMLElement;

    await userEvent.click(within(matchCenterElement).getByRole('tab', { name: /ĐỘI HÌNH RA SÂN/ }));

    expect(
      within(matchCenterElement).getByText('Chưa có đội nào nộp danh sách thi đấu.'),
    ).toBeInTheDocument();
  });

  it('loads match officials and reports in the officials tab', async () => {
    renderPage();

    await screen.findByText(/Chi tiết trận đấu/);
    fireEvent.click(screen.getByRole('tab', { name: /Trọng tài/ }));

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

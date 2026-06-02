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
  { id: 'official-1', fullName: 'Nguyễn Văn Trọng', status: 'ACTIVE', accountRole: 'REFEREE' },
  { id: 'official-2', fullName: 'Trần Văn Giám', status: 'ACTIVE', accountRole: 'SUPERVISOR' },
];

const defaultMatchOfficials = [
  {
    id: 'assignment-1',
    matchId: 'm1',
    officialId: 'official-1',
    role: 'MAIN_REFEREE',
    official: {
      id: 'official-1',
      fullName: 'Nguyễn Văn Trọng',
      status: 'ACTIVE',
      accountRole: 'REFEREE',
    },
  },
  {
    id: 'assignment-2',
    matchId: 'm1',
    officialId: 'official-2',
    role: 'SUPERVISOR',
    official: {
      id: 'official-2',
      fullName: 'Trần Văn Giám',
      status: 'ACTIVE',
      accountRole: 'SUPERVISOR',
    },
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
  apiRemoveMatchOfficial: vi.fn(),
  apiGetMatchReport: vi.fn(),
  apiSubmitMatchReport: vi.fn(),
  apiGetDisciplineReport: vi.fn(),
  apiSubmitDisciplineReport: vi.fn(),
}));

const mockTeamManagerApi = vi.hoisted(() => ({
  apiGetTeamManagerManagedTeam: vi.fn(),
}));

vi.mock('../../auth/AuthContext', () => ({ useAuth: mockUseAuth }));
vi.mock('../../hooks/useMatchSocket', () => ({ useMatchSocket: () => ({ isConnected: false }) }));
vi.mock('../../services/matchApi', () => mockMatchApi);
vi.mock('../../services/teamManagerApi', () => mockTeamManagerApi);

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

async function selectReportOption(control: HTMLElement, optionTitle: string) {
  fireEvent.mouseDown(control);
  let option: Element | undefined;
  await waitFor(() => {
    const visibleDropdowns = Array.from(
      document.querySelectorAll('.ant-select-dropdown:not(.ant-select-dropdown-hidden)'),
    );
    const activeDropdown = visibleDropdowns[visibleDropdowns.length - 1];
    option = Array.from(activeDropdown?.querySelectorAll('.ant-select-item-option') ?? []).find(
      (element) => element.getAttribute('title') === optionTitle,
    );
    expect(option).toBeDefined();
  });
  fireEvent.click(option as Element);
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
  mockMatchApi.apiRemoveMatchOfficial.mockReset();
  mockMatchApi.apiRemoveMatchOfficial.mockResolvedValue({ success: true });
  mockMatchApi.apiGetMatchReport.mockReset();
  mockMatchApi.apiGetMatchReport.mockResolvedValue(defaultMatchReport);
  mockMatchApi.apiSubmitMatchReport.mockReset();
  mockMatchApi.apiSubmitMatchReport.mockResolvedValue({});
  mockMatchApi.apiGetDisciplineReport.mockReset();
  mockMatchApi.apiGetDisciplineReport.mockResolvedValue(defaultDisciplineReport);
  mockMatchApi.apiSubmitDisciplineReport.mockReset();
  mockMatchApi.apiSubmitDisciplineReport.mockResolvedValue({});
  mockTeamManagerApi.apiGetTeamManagerManagedTeam.mockReset();
  mockTeamManagerApi.apiGetTeamManagerManagedTeam.mockResolvedValue({
    id: 'home-team',
    name: 'Ha Noi FC',
    shortName: 'HN',
  });
}

describe('MatchDetailPage', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockUseAuth.mockReturnValue({
      user: { id: 'u1', email: 'admin@vl.local', role: 'ADMIN' },
      loading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });
    resetMatchApiMocks();
  });

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

  it('only shows lineup review actions for submitted lineups', async () => {
    mockMatchApi.apiGetMatchLineups.mockResolvedValueOnce(submittedLineups);

    renderPage();

    await screen.findByText(/Chi tiết trận đấu/);
    await userEvent.click(screen.getByRole('tab', { name: /Đội hình/ }));

    const submittedCard = screen.getByText('Danh sách đã nộp').closest('.ant-card') as HTMLElement;
    await waitFor(() => {
      expect(within(submittedCard).getByText('Ha Noi FC')).toBeInTheDocument();
      expect(within(submittedCard).getByText('Hai Phong FC')).toBeInTheDocument();
    });

    expect(within(submittedCard).getAllByRole('button', { name: /Duyệt/ })).toHaveLength(1);
    expect(within(submittedCard).getAllByRole('button', { name: /Từ chối/ })).toHaveLength(1);
  });

  it('shows rejected lineup reason and resubmission guidance to team managers', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'manager-1', email: 'manager@vl.local', role: 'TEAM_MANAGER' },
      loading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });
    mockMatchApi.apiGetMatchLineups.mockResolvedValueOnce([
      {
        ...submittedLineups[0],
        status: 'REJECTED',
        reviewNote: 'Thiếu thủ môn dự bị',
      },
    ]);

    renderPage();

    await screen.findByText(/Chi tiết trận đấu/);
    await userEvent.click(screen.getByRole('tab', { name: /Đội hình/ }));

    expect(await screen.findByText('Danh sách bị từ chối')).toBeInTheDocument();
    expect(screen.getByText(/Thiếu thủ môn dự bị/)).toBeInTheDocument();
    expect(screen.getByText(/Vui lòng chỉnh sửa và nộp lại/)).toBeInTheDocument();
    expect(screen.getByText('Đăng ký thi đấu')).toBeInTheDocument();
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

  it('prevents team managers from editing another team lineup after switching teams', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'manager-1', email: 'manager@vl.local', role: 'TEAM_MANAGER' },
      loading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });
    mockTeamManagerApi.apiGetTeamManagerManagedTeam.mockResolvedValueOnce({
      id: 'home-team',
      name: 'Ha Noi FC',
      shortName: 'HN',
    });

    renderPage();

    await screen.findByText(/Chi tiết trận đấu/);
    await userEvent.click(screen.getByRole('tab', { name: /Đội hình/ }));

    const registrationCard = screen
      .getByText('Đăng ký thi đấu')
      .closest('.ant-card') as HTMLElement;

    await waitFor(() => {
      expect(mockTeamManagerApi.apiGetTeamManagerManagedTeam).toHaveBeenCalled();
    });

    await selectReportOption(
      within(registrationCard).getByLabelText('Đội đăng ký'),
      'Hai Phong FC',
    );

    expect(within(registrationCard).getByText('Chỉ xem đội hình')).toBeInTheDocument();
    expect(
      within(registrationCard).getByText(
        'Huấn luyện viên chỉ có thể điều chỉnh đội hình của CLB mình quản lý.',
      ),
    ).toBeInTheDocument();
    expect(within(registrationCard).getByRole('button', { name: 'Chọn nhanh 16' })).toBeDisabled();
    expect(within(registrationCard).getByRole('button', { name: 'Xóa chọn' })).toBeDisabled();
    expect(within(registrationCard).getByRole('button', { name: /Nộp danh sách/ })).toBeDisabled();
    expect(registrationCard.querySelector('.ant-select-disabled')).toBeInTheDocument();
  });

  it('renders the timeline area as a hero with grid cards', async () => {
    const { container } = renderPage();

    await screen.findByText(/Chi tiết trận đấu/);
    await userEvent.click(screen.getByRole('tab', { name: /Diễn biến trận đấu/ }));

    expect(container.querySelector('.match-timeline-hero')).toBeInTheDocument();
    expect(container.querySelector('.match-timeline-grid')).toBeInTheDocument();
    expect(container.querySelectorAll('.match-timeline-grid-card')).toHaveLength(3);
    expect(container.querySelectorAll('.match-timeline-team-logo')).toHaveLength(2);
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
    await userEvent.click(screen.getAllByRole('tab')[1]);
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

  it('renders overview stats and keeps only the visual lineup inside the lineup tab', async () => {
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

    await waitFor(() => {
      expect(container.querySelector('.match-stats-panel')).toBeInTheDocument();
    });

    const statsPanel = container.querySelector('.match-stats-panel') as HTMLElement;
    expect(statsPanel.querySelector('.match-stats-teams')).toHaveTextContent('Ha Noi FC');
    expect(statsPanel.querySelector('.match-stats-teams')).toHaveTextContent('Hai Phong FC');
    expect(statsPanel.querySelectorAll('.match-stats-team-logo')).toHaveLength(2);
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

    fireEvent.click(screen.getByRole('tab', { name: /Đội hình/ }));

    await waitFor(() => {
      expect(mockMatchApi.apiGetMatchLineups).toHaveBeenCalledWith('m1');
    });

    const matchCenter = container.querySelector('.match-center-card');
    expect(matchCenter).toBeInTheDocument();
    const matchCenterElement = matchCenter as HTMLElement;
    expect(
      within(matchCenterElement).queryByRole('tab', { name: /DIỄN BIẾN TRẬN ĐẤU/ }),
    ).not.toBeInTheDocument();
    expect(
      within(matchCenterElement).queryByRole('tab', { name: /THỐNG KÊ/ }),
    ).not.toBeInTheDocument();
    expect(
      within(matchCenterElement).getByRole('heading', { name: /Đội hình ra sân/i }),
    ).toBeInTheDocument();

    expect(matchCenterElement.querySelector('.lineup-pitch')).toBeInTheDocument();
    expect(matchCenterElement.querySelector('.lineup-pitch')).toHaveTextContent('Đội hình ra sân');
    expect(within(matchCenterElement).getAllByText('Ha Noi FC').length).toBeGreaterThan(0);
    expect(within(matchCenterElement).getAllByText('Hai Phong FC').length).toBeGreaterThan(0);
    expect(matchCenterElement.querySelector('.lineup-bench')).toBeInTheDocument();
    expect(matchCenterElement.querySelector('.lineup-bench')).toHaveTextContent('Bảng ghế dự bị');
  });

  it('shows a pending lineup state inside the match center when no team has submitted', async () => {
    mockMatchApi.apiGetMatch.mockResolvedValueOnce({
      ...defaultMatch,
      kickoffAt: '2025-01-02T12:30:00',
      stadiumId: 'stadium-1',
      stadium: { id: 'stadium-1', name: 'Sân Hàng Đẫy' },
    });

    renderPage();

    await screen.findByText(/Chi tiết trận đấu/);
    await userEvent.click(screen.getByRole('tab', { name: /Đội hình/ }));

    const matchCenter = document.querySelector('.match-center-card');
    expect(matchCenter).toBeInTheDocument();
    const matchCenterElement = matchCenter as HTMLElement;

    expect(matchCenterElement.querySelectorAll('.match-center-team-logo')).toHaveLength(2);
    expect(matchCenterElement.querySelector('img[alt="Ha Noi FC logo"]')).toHaveAttribute(
      'src',
      '/team-logos/Logo_H%C3%A0_N%E1%BB%99i_FC.png',
    );
    expect(matchCenterElement.querySelector('img[alt="Hai Phong FC logo"]')).toHaveAttribute(
      'src',
      '/team-logos/H%E1%BA%A3i_Ph%C3%B2ng_FC.webp',
    );
    expect(matchCenterElement.querySelector('.match-center-scoreboard')).toHaveTextContent('— - —');
    expect(matchCenterElement.querySelector('.match-center-status')).toHaveTextContent(
      'Sắp diễn ra',
    );
    expect(matchCenterElement.querySelector('.match-center-meta')).toHaveTextContent('Vòng 1');
    expect(matchCenterElement.querySelector('.match-center-meta')).toHaveTextContent(
      'Sân Hàng Đẫy',
    );
    expect(matchCenterElement.querySelector('.match-center-meta')).toHaveTextContent(
      '02/01/2025 12:30',
    );
    expect(matchCenterElement.querySelector('.match-center-empty')).toBeInTheDocument();
    expect(matchCenterElement.querySelector('.match-center-empty-field')).toBeInTheDocument();
    expect(matchCenterElement.querySelectorAll('.match-center-empty-logo')).toHaveLength(2);
    expect(
      within(matchCenterElement).getByText('Chưa có đội nào nộp danh sách thi đấu.'),
    ).toBeInTheDocument();
  });

  it('shows club coaches as separate team fields in the match center', async () => {
    mockMatchApi.apiGetMatch.mockResolvedValueOnce({
      ...defaultMatch,
      homeTeam: { ...defaultMatch.homeTeam, coachName: 'L. Enrique' },
      awayTeam: { ...defaultMatch.awayTeam, coachName: 'M. Arteta' },
    });

    renderPage();

    await screen.findByText(/Chi tiết trận đấu/);
    await userEvent.click(screen.getByRole('tab', { name: /Đội hình/ }));

    const matchCenter = document.querySelector('.match-center-card') as HTMLElement;
    expect(matchCenter).toBeInTheDocument();

    const homeTeam = matchCenter.querySelector('.match-center-team-home') as HTMLElement;
    const awayTeam = matchCenter.querySelector('.match-center-team-away') as HTMLElement;
    const coachFields = matchCenter.querySelector('.match-center-coaches') as HTMLElement;

    expect(homeTeam.querySelector('.match-center-team-coach')).not.toBeInTheDocument();
    expect(awayTeam.querySelector('.match-center-team-coach')).not.toBeInTheDocument();
    expect(within(coachFields).getAllByText('Huấn Luyện Viên')).toHaveLength(2);
    expect(coachFields).not.toHaveTextContent('HLV Ha Noi FC');
    expect(coachFields).toHaveTextContent('L. Enrique');
    expect(coachFields).not.toHaveTextContent('HLV Hai Phong FC');
    expect(coachFields).toHaveTextContent('M. Arteta');
  });

  it('loads match officials and reports in the officials tab', async () => {
    renderPage();

    await screen.findByText(/Chi tiết trận đấu/);
    fireEvent.click(screen.getAllByRole('tab')[2]);

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
    fireEvent.click(screen.getAllByRole('tab')[3]);
    expect(screen.getByText('Một cầu thủ phản ứng trọng tài')).toBeInTheDocument();
  });

  it('shows account roles for officials when assigning match officials', async () => {
    renderPage();

    await screen.findByText(/Chi tiết trận đấu/);
    fireEvent.click(screen.getAllByRole('tab')[2]);

    await waitFor(() => {
      expect(mockMatchApi.apiGetOfficials).toHaveBeenCalled();
      expect(mockMatchApi.apiGetMatchOfficials).toHaveBeenCalledWith('m1');
    });

    expect((await screen.findAllByText('Tài khoản: Trọng tài')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('Tài khoản: Giám sát viên')).length).toBeGreaterThan(0);
  });

  it('lets team managers view match official assignments without requesting restricted official data', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'manager-1', email: 'manager@vl.local', role: 'TEAM_MANAGER' },
      loading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });
    mockMatchApi.apiGetMatchOfficials.mockResolvedValueOnce(defaultMatchOfficials);

    renderPage();

    await screen.findByText(/Chi tiết trận đấu/);

    await waitFor(() => {
      expect(mockMatchApi.apiGetMatchOfficials).toHaveBeenCalledWith('m1');
    });

    expect(mockMatchApi.apiGetOfficials).not.toHaveBeenCalled();
    expect(mockMatchApi.apiGetMatchReport).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('tab', { name: /Trọng tài/ }));

    expect(screen.getAllByText('Nguyễn Văn Trọng').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Trần Văn Giám').length).toBeGreaterThan(0);
  });

  it('lets admin remove an official assignment from the officials tab', async () => {
    renderPage();

    await screen.findByText(/Chi tiết trận đấu/);
    fireEvent.click(screen.getAllByRole('tab')[2]);

    const removeButtons = await screen.findAllByRole('button', { name: /Xóa phân công/ });
    await userEvent.click(removeButtons[0]);
    await userEvent.click(await screen.findByRole('button', { name: /Xác nhận|Confirm/ }));

    await waitFor(() => {
      expect(mockMatchApi.apiRemoveMatchOfficial).toHaveBeenCalledWith('m1', 'assignment-1');
      expect(mockMatchApi.apiGetMatchOfficials).toHaveBeenCalledTimes(2);
    });
  });

  it('shows the current match score instead of a stale report score', async () => {
    mockMatchApi.apiGetMatch.mockResolvedValueOnce({
      ...matchWithEvents,
      homeScore: 3,
      awayScore: 0,
    });
    mockMatchApi.apiGetMatchReport.mockResolvedValueOnce({
      ...defaultMatchReport,
      homeScore: 1,
      awayScore: 0,
    });

    renderPage();
    await screen.findByRole('heading', { name: /V.ng 1/ });
    await userEvent.click(screen.getAllByRole('tab')[2]);
    expect(await screen.findByText(/Tỷ số đã báo cáo: 3 - 0/)).toBeInTheDocument();
  });

  it('does not warn admin about missing report goal events when a submitted report exists', async () => {
    mockMatchApi.apiGetMatch.mockResolvedValueOnce({
      ...defaultMatch,
      homeScore: 3,
      awayScore: 0,
      events: [],
    });
    mockMatchApi.apiGetMatchReport.mockResolvedValueOnce({
      ...defaultMatchReport,
      homeScore: 3,
      awayScore: 0,
    });

    renderPage();

    await screen.findByRole('heading', { name: /V.ng 1/ });
    await userEvent.click(screen.getAllByRole('tab')[2]);

    expect((await screen.findAllByText(/3 - 0/)).length).toBeGreaterThan(0);
    expect(screen.queryByText(/3 - 0.*0 - 0/)).not.toBeInTheDocument();
  });

  it('uses the requested colors for supervisor report ratings', async () => {
    const cases = [
      { organizationRating: 'GOOD', className: 'ant-alert-success' },
      { organizationRating: 'ACCEPTABLE', className: 'ant-alert-warning' },
      { organizationRating: 'ISSUES_FOUND', className: 'ant-alert-error' },
    ];

    for (const testCase of cases) {
      resetMatchApiMocks();
      mockMatchApi.apiGetMatchReport.mockResolvedValueOnce(null);
      mockMatchApi.apiGetDisciplineReport.mockResolvedValueOnce({
        ...defaultDisciplineReport,
        organizationRating: testCase.organizationRating,
      });
      const { unmount } = renderPage();

      await screen.findByRole('heading', { name: /V.ng 1/ });
      await userEvent.click(screen.getAllByRole('tab')[3]);

      expect(document.querySelector(`.${testCase.className}`)).toBeInTheDocument();
      unmount();
    }
  });

  it('submits a zero-zero referee match record from the consolidated report panel', async () => {
    renderPage();

    await screen.findByText(/Chi tiết trận đấu/);
    await userEvent.click(screen.getAllByRole('tab')[2]);
    expect((await screen.findAllByText('Biên bản trận đấu')).length).toBeGreaterThan(0);

    await userEvent.click(screen.getByRole('button', { name: /Nộp biên bản trận đấu/ }));

    await waitFor(() => {
      expect(mockMatchApi.apiSubmitMatchReport).toHaveBeenCalledWith('m1', {
        homeScore: 0,
        awayScore: 0,
        bestPlayerId: 'h-player-1',
        technicalStats: undefined,
        note: undefined,
        events: [],
      });
    });
  });

  it('submits draft goal events and calculates the report score from them', async () => {
    renderPage();

    await screen.findByText(/Chi tiết trận đấu/);
    fireEvent.click(screen.getAllByRole('tab')[2]);
    const reportPanel = screen.getByTestId('referee-match-report-panel');
    fireEvent.click(within(reportPanel).getByRole('button', { name: /Thêm sự kiện/ }));
    fireEvent.change(within(reportPanel).getByLabelText('Phút sự kiện 1'), {
      target: { value: '23' },
    });

    await selectReportOption(within(reportPanel).getByLabelText('Đội sự kiện 1'), 'Ha Noi FC');
    await selectReportOption(
      within(reportPanel).getByLabelText('Cầu thủ sự kiện 1'),
      'Home Player 1 #1',
    );
    await selectReportOption(within(reportPanel).getByLabelText('Loại bàn thắng 1'), 'Đánh đầu');
    await selectReportOption(within(reportPanel).getByLabelText('Kiến tạo 1'), 'Home Player 2 #2');

    fireEvent.click(screen.getByRole('button', { name: /Nộp biên bản trận đấu/ }));

    await waitFor(() => {
      expect(mockMatchApi.apiSubmitMatchReport).toHaveBeenCalledWith('m1', {
        homeScore: 1,
        awayScore: 0,
        bestPlayerId: 'h-player-1',
        technicalStats: undefined,
        note: undefined,
        events: [
          {
            minute: 23,
            type: 'GOAL',
            teamId: 'home-team',
            playerId: 'h-player-1',
            goalType: 'HEADER',
            relatedPlayerId: 'h-player-2',
            note: undefined,
          },
        ],
      });
    });
  }, 60_000);

  it('submits card events from the referee report without changing the score', async () => {
    renderPage();

    await screen.findByText(/Chi tiết trận đấu/);
    fireEvent.click(screen.getAllByRole('tab')[2]);
    const reportPanel = screen.getByTestId('referee-match-report-panel');
    fireEvent.click(within(reportPanel).getByRole('button', { name: /Thêm sự kiện/ }));
    fireEvent.change(within(reportPanel).getByLabelText('Phút sự kiện 1'), {
      target: { value: '45' },
    });

    await selectReportOption(within(reportPanel).getByLabelText('Loại sự kiện 1'), 'Thẻ vàng');
    await selectReportOption(within(reportPanel).getByLabelText('Đội sự kiện 1'), 'Hai Phong FC');
    await selectReportOption(
      within(reportPanel).getByLabelText('Cầu thủ sự kiện 1'),
      'Away Player 2 #2',
    );

    fireEvent.click(screen.getByRole('button', { name: /Nộp biên bản trận đấu/ }));

    await waitFor(() => {
      expect(mockMatchApi.apiSubmitMatchReport).toHaveBeenCalledWith('m1', {
        homeScore: 0,
        awayScore: 0,
        bestPlayerId: 'h-player-1',
        technicalStats: undefined,
        note: undefined,
        events: [
          {
            minute: 45,
            type: 'YELLOW_CARD',
            teamId: 'away-team',
            playerId: 'a-player-2',
            note: undefined,
          },
        ],
      });
    });
  }, 60_000);

  it('submits the official match score when a referee report is saved after admin updates score', async () => {
    const savedReportGoals = [12, 24, 36, 48].map((minute, index) => ({
      id: `saved-goal-${index + 1}`,
      minute,
      type: 'GOAL',
      teamId: 'home-team',
      playerId: `h-player-${index + 1}`,
      player: { id: `h-player-${index + 1}`, fullName: `Home Player ${index + 1}` },
      team: { id: 'home-team', name: 'Ha Noi FC' },
      source: 'MATCH_REPORT',
    }));
    mockMatchApi.apiGetMatch.mockResolvedValueOnce({
      ...defaultMatch,
      homeScore: 4,
      awayScore: 0,
      events: savedReportGoals,
    });
    mockMatchApi.apiGetMatchReport.mockResolvedValueOnce({
      ...defaultMatchReport,
      homeScore: 1,
      awayScore: 0,
    });

    renderPage();

    await screen.findByRole('heading', { name: /V.ng 1/ });
    fireEvent.click(screen.getAllByRole('tab')[2]);
    const reportPanel = screen.getByTestId('referee-match-report-panel');

    fireEvent.click(within(reportPanel).getAllByRole('button').at(-1) as HTMLElement);

    await waitFor(() => {
      expect(mockMatchApi.apiSubmitMatchReport).toHaveBeenCalledWith('m1', {
        homeScore: 4,
        awayScore: 0,
        bestPlayerId: 'h-player-1',
        technicalStats: undefined,
        note: undefined,
        events: savedReportGoals.map((event) => ({
          minute: event.minute,
          type: event.type,
          teamId: event.teamId,
          playerId: event.playerId,
          relatedPlayerId: undefined,
          goalType: undefined,
          note: undefined,
        })),
      });
    });
  }, 60_000);

  it('blocks submitting a referee report when goal events do not match the official score', async () => {
    mockMatchApi.apiGetMatch.mockResolvedValueOnce({
      ...defaultMatch,
      homeScore: 6,
      awayScore: 7,
      events: [
        {
          id: 'saved-goal-home',
          minute: 6,
          type: 'GOAL',
          teamId: 'home-team',
          playerId: 'h-player-1',
          player: { id: 'h-player-1', fullName: 'Home Player 1' },
          team: { id: 'home-team', name: 'Ha Noi FC' },
          source: 'MATCH_REPORT',
        },
        {
          id: 'saved-goal-away',
          minute: 7,
          type: 'GOAL',
          teamId: 'away-team',
          playerId: 'a-player-1',
          player: { id: 'a-player-1', fullName: 'Away Player 1' },
          team: { id: 'away-team', name: 'Hai Phong FC' },
          source: 'MATCH_REPORT',
        },
      ],
    });

    renderPage();

    await screen.findByRole('heading', { name: /V.ng 1/ });
    fireEvent.click(screen.getAllByRole('tab')[2]);

    expect(await screen.findByText(/6 - 7.*1 - 1/)).toBeInTheDocument();
    const submitButton = screen
      .getAllByRole('button')
      .find((button) => button.textContent?.includes('Nộp biên bản trận đấu'));
    expect(submitButton).toBeDisabled();
    expect(mockMatchApi.apiSubmitMatchReport).not.toHaveBeenCalled();
  });

  it('submits substitutions with player in and player out from the referee report', async () => {
    renderPage();

    await screen.findByText(/Chi tiết trận đấu/);
    fireEvent.click(screen.getAllByRole('tab')[2]);
    const reportPanel = screen.getByTestId('referee-match-report-panel');
    fireEvent.click(within(reportPanel).getByRole('button', { name: /Thêm sự kiện/ }));
    fireEvent.change(within(reportPanel).getByLabelText('Phút sự kiện 1'), {
      target: { value: '70' },
    });

    await selectReportOption(within(reportPanel).getByLabelText('Loại sự kiện 1'), 'Thay người');
    await selectReportOption(within(reportPanel).getByLabelText('Đội sự kiện 1'), 'Ha Noi FC');
    await selectReportOption(
      within(reportPanel).getByLabelText('Cầu thủ vào sân 1'),
      'Home Player 2 #2',
    );
    await selectReportOption(
      within(reportPanel).getByLabelText('Cầu thủ ra sân 1'),
      'Home Player 4 #4',
    );

    fireEvent.click(screen.getByRole('button', { name: /Nộp biên bản trận đấu/ }));

    await waitFor(() => {
      expect(mockMatchApi.apiSubmitMatchReport).toHaveBeenCalledWith('m1', {
        homeScore: 0,
        awayScore: 0,
        bestPlayerId: 'h-player-1',
        technicalStats: undefined,
        note: undefined,
        events: [
          {
            minute: 70,
            type: 'SUBSTITUTION',
            teamId: 'home-team',
            playerId: 'h-player-2',
            relatedPlayerId: 'h-player-4',
            note: undefined,
          },
        ],
      });
    });
  }, 60_000);

  it('keeps referee score and event entry inside the report flow before the first submission', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u1', email: 'referee@vl.local', role: 'REFEREE' },
      loading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });
    mockMatchApi.apiGetMatchReport.mockResolvedValueOnce(null);

    renderPage();

    await screen.findByText(/Chi tiết trận đấu/);

    expect(screen.queryByRole('button', { name: /Cập nhật tỉ số/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Thêm sự kiện/ })).not.toBeInTheDocument();

    await userEvent.click(screen.getAllByRole('tab')[2]);
    expect(screen.getByRole('button', { name: /Thêm sự kiện/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Nộp biên bản trận đấu/ })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /Báo cáo giám sát/ })).not.toBeInTheDocument();
    expect(mockMatchApi.apiGetDisciplineReport).not.toHaveBeenCalled();
  });

  it('prevents a referee from submitting the match report again after one exists', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u1', email: 'referee@vl.local', role: 'REFEREE' },
      loading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderPage();

    await screen.findByRole('heading', { name: /V.ng 1/ });
    await userEvent.click(screen.getAllByRole('tab')[2]);

    expect(screen.queryByRole('button', { name: /Nộp biên bản trận đấu/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /Báo cáo giám sát/ })).not.toBeInTheDocument();
    expect(mockMatchApi.apiGetDisciplineReport).not.toHaveBeenCalled();
  });

  it('prevents a supervisor from submitting the discipline report again after one exists', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u1', email: 'supervisor@vl.local', role: 'SUPERVISOR' },
      loading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderPage();

    await screen.findByRole('heading', { name: /V.ng 1/ });
    expect(screen.queryByRole('tab', { name: /Biên bản trận đấu/ })).not.toBeInTheDocument();
    await userEvent.click(screen.getAllByRole('tab')[2]);

    expect(screen.queryByRole('button', { name: /Nộp báo cáo giám sát/ })).not.toBeInTheDocument();
    expect(screen.getByText(/Chỉ BTC hoặc giám sát viên/)).toBeInTheDocument();
  });
});

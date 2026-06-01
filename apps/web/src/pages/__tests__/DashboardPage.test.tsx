import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/* ---------- hoisted mocks ---------- */
const mockUseAuth = vi.hoisted(() =>
  vi.fn(() => ({
    user: { id: 'u1', email: 'admin@vl.local', role: 'ADMIN' },
    loading: false,
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
  })),
);

const mockTeamApi = vi.hoisted(() => ({
  apiGetTeams: vi.fn().mockResolvedValue({ data: [], total: 5 }),
  apiGetTeam: vi.fn().mockResolvedValue({
    id: 'team-1',
    name: 'CLB Bình Định',
    roster: [],
  }),
}));
const mockPlayerApi = vi.hoisted(() => ({
  apiGetPlayers: vi.fn().mockResolvedValue({ data: [], total: 12 }),
}));
const mockScheduleApi = vi.hoisted(() => ({
  apiGetSchedule: vi.fn().mockResolvedValue({ matches: [] }),
}));
const mockSeasonApi = vi.hoisted(() => ({
  apiGetCurrentSeason: vi.fn().mockResolvedValue({
    id: 's1',
    name: 'V.League 2025',
    startDate: '2000-01-01',
    endDate: '2099-12-31',
    status: 'IN_PROGRESS',
    _count: { matches: 8, seasonTeams: 4 },
  }),
  apiGetSeasons: vi.fn().mockResolvedValue([
    {
      id: 's1',
      name: 'V.League 2025',
      startDate: '2000-01-01',
      endDate: '2099-12-31',
      status: 'IN_PROGRESS',
    },
  ]),
}));
const mockStandingsApi = vi.hoisted(() => ({
  apiGetStandings: vi.fn().mockResolvedValue([]),
  apiGetTopScorers: vi.fn().mockResolvedValue([]),
  apiGetCardStats: vi.fn().mockResolvedValue([]),
}));
const mockMatchApi = vi.hoisted(() => ({
  apiGetMatches: vi.fn().mockResolvedValue({ data: [], total: 8 }),
}));
const mockTeamManagerApi = vi.hoisted(() => ({
  apiCreateTeamManagerAssignment: vi.fn(),
  apiGetTeamManagerAssignment: vi.fn().mockResolvedValue(null),
  apiGetTeamManagerApplication: vi.fn().mockResolvedValue(null),
  apiGetTeamManagerManagementRequest: vi.fn().mockResolvedValue(null),
  apiSubmitTeamManagerApplication: vi.fn(),
}));

vi.mock('../../auth/AuthContext', () => ({ useAuth: mockUseAuth }));
vi.mock('../../services/teamApi', () => mockTeamApi);
vi.mock('../../services/playerApi', () => mockPlayerApi);
vi.mock('../../services/scheduleApi', () => mockScheduleApi);
vi.mock('../../services/seasonApi', () => mockSeasonApi);
vi.mock('../../services/standingsApi', () => mockStandingsApi);
vi.mock('../../services/matchApi', () => mockMatchApi);
vi.mock('../../services/teamManagerApi', () => mockTeamManagerApi);

import DashboardPage from '../DashboardPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );
}

/* Wait for all mocked API calls (Promise.allSettled) to flush */
async function waitForAsyncEffects() {
  await waitFor(() => {
    expect(mockTeamApi.apiGetTeams).toHaveBeenCalled();
  });
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: { id: 'u1', email: 'admin@vl.local', role: 'ADMIN' },
      loading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });
  });
  afterEach(() => cleanup());

  it('renders the dashboard title', async () => {
    const { container } = renderPage();
    expect(screen.getByText('Trang chủ')).toBeInTheDocument();
    expect(container.querySelector('.dashboard-page .page-hero')).toBeInTheDocument();
    await waitForAsyncEffects();
  });

  it('shows admin welcome text only for admins', async () => {
    renderPage();
    expect(screen.getByText('Welcome to VLeague Admin')).toBeInTheDocument();
    expect(screen.queryByText('Welcome to VLeague')).not.toBeInTheDocument();
    await waitForAsyncEffects();
  });

  it('shows generic welcome text for non-admin roles', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u-public', email: 'public@vl.local', role: 'PUBLIC' },
      loading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderPage();
    expect(screen.getByText('Welcome to VLeague')).toBeInTheDocument();
    expect(screen.queryByText('Welcome to VLeague Admin')).not.toBeInTheDocument();
    await waitForAsyncEffects();
  });

  it('renders stat cards', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText('Đội bóng').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Cầu thủ').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Trận đấu').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Mùa giải').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders admin quick actions when user is ADMIN', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Thao tác nhanh')).toBeInTheDocument();
    });
  });

  it('hides quick actions for non-admin users', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u2', email: 'user@vl.local', role: 'USER' },
      loading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });
    renderPage();
    await waitFor(() => {
      expect(screen.queryByText('Thao tác nhanh')).not.toBeInTheDocument();
    });
  });

  it('calls all data-fetching APIs on mount', async () => {
    renderPage();
    await waitFor(() => {
      expect(mockTeamApi.apiGetTeams).toHaveBeenCalled();
      expect(mockPlayerApi.apiGetPlayers).toHaveBeenCalled();
      expect(mockSeasonApi.apiGetCurrentSeason).toHaveBeenCalled();
      expect(mockScheduleApi.apiGetSchedule).toHaveBeenCalled();
      expect(mockScheduleApi.apiGetSchedule).toHaveBeenCalledWith('s1');
      expect(mockSeasonApi.apiGetSeasons).toHaveBeenCalled();
      expect(mockStandingsApi.apiGetStandings).toHaveBeenCalled();
      expect(mockStandingsApi.apiGetStandings).toHaveBeenCalledWith('s1');
      expect(mockMatchApi.apiGetMatches).toHaveBeenCalled();
      expect(mockMatchApi.apiGetMatches).toHaveBeenCalledWith('s1', 1, 1000);
      expect(mockStandingsApi.apiGetTopScorers).toHaveBeenCalledWith('s1', 5);
      expect(mockStandingsApi.apiGetCardStats).toHaveBeenCalledWith('s1', 5);
    });
  });

  it('renders standings and upcoming matches sections', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Bảng xếp hạng (Top 5)')).toBeInTheDocument();
      expect(screen.getByText('Trận đấu sắp tới')).toBeInTheDocument();
      expect(screen.getByText('Kết quả gần đây')).toBeInTheDocument();
    });
  });

  it('moves the season application form out of the manager dashboard', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u-manager', email: 'manager@vl.local', role: 'TEAM_MANAGER' },
      loading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });
    mockTeamManagerApi.apiGetTeamManagerAssignment.mockResolvedValue({
      id: 'assignment-1',
      userId: 'u-manager',
      seasonId: 's1',
      teamId: 'team-1',
      season: { id: 's1', name: 'V.League 2025', status: 'IN_PROGRESS' },
      team: { id: 'team-1', name: 'CLB Bình Định' },
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    });
    mockTeamManagerApi.apiGetTeamManagerApplication.mockResolvedValue({
      id: 'season-team-1',
      seasonId: 's1',
      teamId: 'team-1',
      status: 'REGISTERED',
      applicationSubmittedAt: null,
      ownerName: null,
      ownerCountry: null,
      teamIntroduction: null,
      primaryKit: null,
      backupKit: null,
      participationFeePaid: false,
      team: { id: 'team-1', name: 'CLB Bình Định' },
    });

    const { container } = renderPage();

    await waitFor(() => {
      expect(mockTeamApi.apiGetTeam).toHaveBeenCalledWith('team-1');
    });
    expect(container.querySelector('.dashboard-manager-page .page-hero')).toBeInTheDocument();
    expect(screen.queryByText('Thông tin CLB')).not.toBeInTheDocument();
    expect(screen.queryByText('Hồ sơ tham dự mùa giải')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Cơ quan/công ty chủ quản')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Link chứng từ nộp lệ phí')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Mở tab Mùa giải/i })).not.toBeInTheDocument();
    expect(mockTeamManagerApi.apiGetTeamManagerApplication).not.toHaveBeenCalled();
  });

  it('shows team information and edit CTA for assigned team managers', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u-manager', email: 'manager@vl.local', role: 'TEAM_MANAGER' },
      loading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });
    mockTeamApi.apiGetTeam.mockResolvedValue({
      id: 'team-1',
      name: 'CLB Bình Định',
      coachName: 'HLV Trưởng',
      roster: [],
      homeMatches: [],
      awayMatches: [],
      standings: [],
    });
    mockTeamManagerApi.apiGetTeamManagerAssignment.mockResolvedValue({
      id: 'assignment-1',
      userId: 'u-manager',
      seasonId: 's1',
      teamId: 'team-1',
      season: { id: 's1', name: 'V.League 2025', status: 'IN_PROGRESS' },
      team: { id: 'team-1', name: 'CLB Bình Định' },
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    });
    mockTeamManagerApi.apiGetTeamManagerApplication.mockResolvedValue({
      id: 'season-team-1',
      seasonId: 's1',
      teamId: 'team-1',
      status: 'REGISTERED',
      applicationSubmittedAt: null,
      ownerName: null,
      ownerCountry: null,
      teamIntroduction: null,
      primaryKit: null,
      backupKit: null,
      participationFeePaid: false,
      team: { id: 'team-1', name: 'CLB Bình Định' },
    });
    renderPage();

    await waitFor(() => {
      expect(mockTeamApi.apiGetTeam).toHaveBeenCalledWith('team-1');
    });
    expect(screen.getAllByText('CLB quản lý')).toHaveLength(1);
    expect(screen.queryByText('Thông tin CLB')).not.toBeInTheDocument();
    expect(screen.getByText('HLV Trưởng')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Chỉnh sửa đội bóng/i })).toBeInTheDocument();
  });
});

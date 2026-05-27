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
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => cleanup());

  it('renders the Dashboard title', async () => {
    renderPage();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
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
      expect(screen.getByText('⚡ Thao tác nhanh')).toBeInTheDocument();
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
      expect(screen.queryByText('⚡ Thao tác nhanh')).not.toBeInTheDocument();
    });
  });

  it('calls all data-fetching APIs on mount', async () => {
    renderPage();
    await waitFor(() => {
      expect(mockTeamApi.apiGetTeams).toHaveBeenCalled();
      expect(mockPlayerApi.apiGetPlayers).toHaveBeenCalled();
      expect(mockScheduleApi.apiGetSchedule).toHaveBeenCalled();
      expect(mockSeasonApi.apiGetSeasons).toHaveBeenCalled();
      expect(mockStandingsApi.apiGetStandings).toHaveBeenCalled();
      expect(mockMatchApi.apiGetMatches).toHaveBeenCalled();
    });
  });

  it('renders standings and upcoming matches sections', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('🏆 Bảng xếp hạng (Top 5)')).toBeInTheDocument();
      expect(screen.getByText('📅 Trận đấu sắp tới')).toBeInTheDocument();
      expect(screen.getByText('⚽ Kết quả gần đây')).toBeInTheDocument();
    });
  });

  it('shows the season application form for assigned team managers', async () => {
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

    renderPage();

    expect(await screen.findByText('Hồ sơ tham dự mùa giải')).toBeInTheDocument();
    expect(screen.getByLabelText('Cơ quan/công ty chủ quản')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Nộp hồ sơ/i })).toBeInTheDocument();
  });
});

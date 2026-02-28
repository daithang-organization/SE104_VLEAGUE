import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

const mockScheduleApi = vi.hoisted(() => ({
  apiGetSchedule: vi.fn().mockResolvedValue({
    ok: true,
    matches: [
      {
        id: 'm1',
        roundNo: 1,
        leg: 1,
        homeTeamId: 't1',
        awayTeamId: 't2',
        homeTeam: { name: 'Hà Nội FC', shortName: 'HN' },
        awayTeam: { name: 'Hải Phòng FC', shortName: 'HP' },
        stadium: { name: 'Hàng Đẫy', city: 'Hà Nội' },
        stadiumId: 's1',
        homeScore: null,
        awayScore: null,
        status: 'DRAFT',
        kickoffAt: '2025-03-15T17:00:00Z',
      },
    ],
  }),
  apiGenerateSchedule: vi.fn().mockResolvedValue({ message: 'Đã tạo 20 trận' }),
  apiPublishSchedule: vi.fn().mockResolvedValue({ message: 'Đã công bố 20 trận' }),
}));

const mockSeasonApi = vi.hoisted(() => ({
  apiGetSeasons: vi
    .fn()
    .mockResolvedValue([{ id: 's1', name: 'V.League 2025', year: 2025, status: 'IN_PROGRESS' }]),
}));

const mockTeamApi = vi.hoisted(() => ({
  apiGetStadiums: vi.fn().mockResolvedValue([{ id: 'st1', name: 'Hàng Đẫy', city: 'Hà Nội' }]),
}));

const mockMatchApi = vi.hoisted(() => ({
  apiUpdateMatch: vi.fn().mockResolvedValue({}),
}));

vi.mock('../../auth/AuthContext', () => ({ useAuth: mockUseAuth }));
vi.mock('../../services/scheduleApi', () => mockScheduleApi);
vi.mock('../../services/seasonApi', () => mockSeasonApi);
vi.mock('../../services/teamApi', () => mockTeamApi);
vi.mock('../../services/matchApi', () => mockMatchApi);

import SchedulePage from '../SchedulePage';

function renderPage() {
  return render(<SchedulePage />);
}

describe('SchedulePage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the page title', () => {
    renderPage();
    expect(screen.getByText('Lịch thi đấu')).toBeInTheDocument();
  });

  it('calls apiGetSeasons on mount', async () => {
    renderPage();
    await waitFor(() => {
      expect(mockSeasonApi.apiGetSeasons).toHaveBeenCalled();
    });
  });

  it('calls apiGetSchedule after season loaded', async () => {
    renderPage();
    await waitFor(() => {
      expect(mockScheduleApi.apiGetSchedule).toHaveBeenCalled();
    });
  });

  it('renders admin schedule buttons', () => {
    renderPage();
    expect(screen.getByText('Tạo lịch tự động')).toBeInTheDocument();
    expect(screen.getByText('Công bố lịch')).toBeInTheDocument();
  });

  it('hides admin buttons for non-admin users', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u2', email: 'user@vl.local', role: 'PUBLIC' },
      loading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });
    renderPage();
    expect(screen.queryByText('Tạo lịch tự động')).not.toBeInTheDocument();
    expect(screen.queryByText('Công bố lịch')).not.toBeInTheDocument();
  });

  it('renders leg filter tabs', () => {
    renderPage();
    expect(screen.getByText(/Tất cả/)).toBeInTheDocument();
    expect(screen.getByText(/Lượt đi/)).toBeInTheDocument();
    expect(screen.getByText(/Lượt về/)).toBeInTheDocument();
  });
});

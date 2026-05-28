import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

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
        homeTeam: { name: 'Ha Noi FC', shortName: 'HN' },
        awayTeam: { name: 'Hai Phong FC', shortName: 'HP' },
        stadium: { name: 'Hang Day', city: 'Ha Noi' },
        stadiumId: 's1',
        homeScore: 2,
        awayScore: 0,
        status: 'FINISHED',
        kickoffAt: '2025-03-15T17:00:00Z',
      },
    ],
  }),
  apiGenerateSchedule: vi.fn().mockResolvedValue({ message: 'Created 20 matches' }),
  apiPublishSchedule: vi.fn().mockResolvedValue({ message: 'Published 20 matches' }),
}));

const mockSeasonApi = vi.hoisted(() => ({
  apiGetSeasons: vi
    .fn()
    .mockResolvedValue([{ id: 's1', name: 'V.League 2025', year: 2025, status: 'IN_PROGRESS' }]),
}));

const mockTeamApi = vi.hoisted(() => ({
  apiGetStadiums: vi.fn().mockResolvedValue([{ id: 'st1', name: 'Hang Day', city: 'Ha Noi' }]),
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
  return render(
    <MemoryRouter>
      <SchedulePage />
    </MemoryRouter>,
  );
}

describe('SchedulePage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the page title', () => {
    const { container } = renderPage();
    expect(screen.getAllByText('Lịch thi đấu')[0]).toBeInTheDocument();
    expect(container.querySelector('.page-cover')).toBeInTheDocument();
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

  it('renders the active round as a fixture list grouped by match day', async () => {
    const { container } = renderPage();

    await screen.findByText('HN');

    expect(container.querySelector('.schedule-fixture-list')).toBeInTheDocument();
    expect(container.querySelector('.schedule-fixture-day-group')).toBeInTheDocument();
    expect(container.querySelector('.schedule-fixture-row')).toBeInTheDocument();
    expect(container.querySelector('.schedule-fixture-score')).toBeInTheDocument();
    expect(
      container.querySelector('.schedule-fixture-score.is-final.is-score-card'),
    ).toHaveTextContent('2 - 0');
    expect(screen.getByText('HP')).toBeInTheDocument();
    expect(screen.getByText('Hang Day')).toBeInTheDocument();
  });
});

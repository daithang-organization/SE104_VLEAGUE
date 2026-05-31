import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/* ---------- hoisted mocks ---------- */
const mockSeasonApi = vi.hoisted(() => ({
  apiGetSeasons: vi.fn().mockResolvedValue([
    {
      id: 's2025',
      name: 'V.League 2025',
      year: 2025,
      status: 'COMPLETED',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 's2026',
      name: 'V.League 2026',
      year: 2026,
      status: 'IN_PROGRESS',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ]),
  apiGetCurrentSeason: vi.fn().mockResolvedValue({
    id: 's2025',
    name: 'V.League 2025',
    year: 2025,
    status: 'COMPLETED',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  }),
}));
const mockStandingsApi = vi.hoisted(() => ({
  apiGetStandings: vi.fn().mockResolvedValue([
    {
      teamId: 't1',
      teamName: 'Hà Nội FC',
      position: 1,
      played: 10,
      won: 8,
      drawn: 1,
      lost: 1,
      goalsFor: 20,
      goalsAgainst: 5,
      goalDifference: 15,
      points: 25,
    },
    {
      teamId: 't2',
      teamName: 'Hải Phòng FC',
      position: 2,
      played: 10,
      won: 7,
      drawn: 2,
      lost: 1,
      goalsFor: 18,
      goalsAgainst: 8,
      goalDifference: 10,
      points: 23,
    },
  ]),
  apiGetTopScorers: vi.fn().mockResolvedValue([
    {
      playerId: 'p1',
      playerName: 'Nguyễn Tiến Linh',
      teamName: 'Bình Dương',
      position: 1,
      goals: 12,
    },
  ]),
  apiGetTeamStats: vi.fn().mockResolvedValue([
    {
      teamId: 't1',
      teamName: 'HÃ  Ná»™i FC',
      played: 10,
      goalsFor: 20,
      yellowCards: 8,
      redCards: 1,
    },
    {
      teamId: 't2',
      teamName: 'Háº£i PhÃ²ng FC',
      played: 10,
      goalsFor: 18,
      yellowCards: 7,
      redCards: 0,
    },
  ]),
}));
const mockUseAuth = vi.hoisted(() =>
  vi.fn(() => ({
    user: { id: 'u1', email: 'admin@vl.local', role: 'ADMIN' },
    loading: false,
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
  })),
);
const mockUseMatchSocket = vi.hoisted(() => vi.fn());

vi.mock('../../auth/AuthContext', () => ({ useAuth: mockUseAuth }));
vi.mock('../../hooks/useMatchSocket', () => ({ useMatchSocket: mockUseMatchSocket }));
vi.mock('../../services/seasonApi', () => mockSeasonApi);
vi.mock('../../services/standingsApi', () => mockStandingsApi);
vi.mock('../../services/teamManagerApi', () => ({
  apiGetTeamManagerAssignment: vi.fn().mockResolvedValue(null),
}));

// Mock ExportButton to simplify
vi.mock('../../components/ExportButton', () => ({
  default: () => <button>Export</button>,
}));

import StandingsPage from '../StandingsPage';

function renderPage(initialEntry = '/standings') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/standings" element={<StandingsPage />} />
        <Route path="/teams/:id" element={<div>Team Detail Route</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('StandingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('renders standings title', () => {
    const { container } = renderPage();
    expect(screen.getByText('Bảng xếp hạng')).toBeInTheDocument();
    expect(container.querySelector('.page-cover')).toBeInTheDocument();
  });

  it('renders top scorers title', async () => {
    renderPage();
    expect(await screen.findByText('Vua phá lưới (Top 10)')).toBeInTheDocument();
  });

  it('fetches seasons on mount', async () => {
    renderPage();
    await waitFor(() => {
      expect(mockSeasonApi.apiGetSeasons).toHaveBeenCalled();
    });
  });

  it('fetches standings and top scorers for the default latest season on mount', async () => {
    renderPage();
    await waitFor(() => {
      expect(mockStandingsApi.apiGetStandings).toHaveBeenCalledWith('s2026', 'in_progress');
      expect(mockStandingsApi.apiGetTopScorers).toHaveBeenCalledWith('s2026', 10);
      expect(mockStandingsApi.apiGetTeamStats).toHaveBeenCalledWith('s2026');
    });
  });

  it('uses the season from the URL and shows the champion for a completed season', async () => {
    renderPage('/standings?seasonId=s2025');

    await waitFor(() => {
      expect(mockStandingsApi.apiGetStandings).toHaveBeenCalledWith('s2025', 'final');
    });

    expect(await screen.findByText('Vô địch')).toBeInTheDocument();
    expect(screen.getAllByText('Hà Nội FC').length).toBeGreaterThan(1);
  });

  it('displays team standings data', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Hà Nội FC')).toBeInTheDocument();
      expect(screen.getByText('Hải Phòng FC')).toBeInTheDocument();
    });
  });

  it('displays top scorers data', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Nguyễn Tiến Linh')).toBeInTheDocument();
    });
  });

  it('navigates to team detail when clicking a team in standings', async () => {
    renderPage();

    const teamButton = await waitFor(() => {
      const button = screen
        .getAllByRole('button')
        .find((candidate) => candidate.textContent?.includes('FC'));

      expect(button).toBeDefined();
      return button;
    });

    fireEvent.click(teamButton!);

    expect(screen.getByText('Team Detail Route')).toBeInTheDocument();
  });
});

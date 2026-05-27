import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/* ---------- hoisted mocks ---------- */
const mockSeasonApi = vi.hoisted(() => ({
  apiGetSeasons: vi.fn().mockResolvedValue([{ id: 's1', name: 'V.League 2025' }]),
  apiGetCurrentSeason: vi.fn().mockResolvedValue({ id: 's1', name: 'V.League 2025' }),
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

vi.mock('../../auth/AuthContext', () => ({ useAuth: mockUseAuth }));
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

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/standings']}>
      <Routes>
        <Route path="/standings" element={<StandingsPage />} />
        <Route path="/teams/:id" element={<div>Team Detail Route</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('StandingsPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders standings title', () => {
    const { container } = renderPage();
    expect(screen.getByText('Bảng xếp hạng')).toBeInTheDocument();
    expect(container.querySelector('.page-hero-compact')).toBeInTheDocument();
  });

  it('renders top scorers title', () => {
    renderPage();
    expect(screen.getByText('⚽ Vua phá lưới (Top 10)')).toBeInTheDocument();
  });

  it('fetches seasons on mount', async () => {
    renderPage();
    await waitFor(() => {
      expect(mockSeasonApi.apiGetSeasons).toHaveBeenCalled();
    });
  });

  it('fetches standings and top scorers on mount', async () => {
    renderPage();
    await waitFor(() => {
      expect(mockStandingsApi.apiGetStandings).toHaveBeenCalled();
      expect(mockStandingsApi.apiGetTopScorers).toHaveBeenCalled();
    });
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

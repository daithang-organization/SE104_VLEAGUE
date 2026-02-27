import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/* ---------- hoisted mocks ---------- */
const mockSeasonApi = vi.hoisted(() => ({
  apiGetSeasons: vi.fn().mockResolvedValue([{ id: 's1', name: 'V.League 2025' }]),
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
  apiGetTopScorers: vi
    .fn()
    .mockResolvedValue([
      {
        playerId: 'p1',
        playerName: 'Nguyễn Tiến Linh',
        teamName: 'Bình Dương',
        position: 1,
        goals: 12,
      },
    ]),
}));

vi.mock('../../services/seasonApi', () => mockSeasonApi);
vi.mock('../../services/standingsApi', () => mockStandingsApi);

// Mock ExportButton to simplify
vi.mock('../../components/ExportButton', () => ({
  default: () => <button>Export</button>,
}));

import StandingsPage from '../StandingsPage';

function renderPage() {
  return render(<StandingsPage />);
}

describe('StandingsPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders standings title', () => {
    renderPage();
    expect(screen.getByText('🏆 Bảng xếp hạng')).toBeInTheDocument();
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
});

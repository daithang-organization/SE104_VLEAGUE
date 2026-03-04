import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/* ---------- hoisted mocks ---------- */
const mockStandingsApi = vi.hoisted(() => ({
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
  apiGetCardStats: vi.fn().mockResolvedValue([]),
  apiGetTeamStats: vi
    .fn()
    .mockResolvedValue([
      {
        teamName: 'Hà Nội FC',
        played: 10,
        won: 8,
        drawn: 1,
        lost: 1,
        goalsFor: 20,
        goalsAgainst: 5,
        goalDifference: 15,
        points: 25,
      },
    ]),
}));

vi.mock('../../services/standingsApi', () => mockStandingsApi);
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('../../components', () => ({
  TableSkeleton: () => <div>Loading...</div>,
}));
// Mock sub-tab components
vi.mock('../reports/TopScorersTab', () => ({
  default: ({ data }: { data: unknown[] }) => <div>TopScorers: {(data as unknown[]).length}</div>,
}));
vi.mock('../reports/CardStatsTab', () => ({ default: () => <div>CardStats</div> }));
vi.mock('../reports/TeamStatsTab', () => ({ default: () => <div>TeamStats</div> }));
vi.mock('../reports/ChartsTab', () => ({ default: () => <div>Charts</div> }));

import ReportsPage from '../ReportsPage';

function renderPage() {
  return render(<ReportsPage />);
}

describe('ReportsPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders title', () => {
    renderPage();
    expect(screen.getByText('reports.title')).toBeInTheDocument();
  });

  it('fetches all data on mount', async () => {
    renderPage();
    await waitFor(() => {
      expect(mockStandingsApi.apiGetTopScorers).toHaveBeenCalled();
      expect(mockStandingsApi.apiGetCardStats).toHaveBeenCalled();
      expect(mockStandingsApi.apiGetTeamStats).toHaveBeenCalled();
    });
  });

  it('renders tab labels', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('reports.tabScorers')).toBeInTheDocument();
    });
  });

  it('renders export buttons', () => {
    renderPage();
    expect(screen.getByText('reports.exportScorersPdf')).toBeInTheDocument();
    expect(screen.getByText('reports.exportTeamStatsPdf')).toBeInTheDocument();
  });
});

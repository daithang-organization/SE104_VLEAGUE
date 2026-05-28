import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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

const mockMatchApi = vi.hoisted(() => ({
  apiGetMatches: vi.fn().mockResolvedValue({
    data: [
      {
        id: 'm1',
        roundNo: 1,
        leg: 1,
        homeTeamId: 't1',
        awayTeamId: 't2',
        homeTeam: { id: 't1', name: 'Ha Noi FC', shortName: 'HN' },
        awayTeam: { id: 't2', name: 'Hai Phong FC', shortName: 'HP' },
        stadium: { name: 'Hang Day' },
        homeScore: 2,
        awayScore: 1,
        status: 'FINISHED',
        kickoffAt: '2025-03-15T17:00:00Z',
      },
      {
        id: 'm2',
        roundNo: 1,
        leg: 1,
        homeTeamId: 't3',
        awayTeamId: 't4',
        homeTeam: { id: 't3', name: 'Hoang Anh Gia Lai', shortName: 'HAGL' },
        awayTeam: { id: 't4', name: 'Binh Duong', shortName: 'BBD' },
        stadium: { name: 'Pleiku' },
        homeScore: null,
        awayScore: null,
        status: 'DRAFT',
        kickoffAt: null,
      },
    ],
    total: 2,
  }),
  apiGetMatch: vi.fn().mockResolvedValue({}),
  apiAddMatchEvent: vi.fn().mockResolvedValue({}),
  apiGetTeamRoster: vi.fn().mockResolvedValue({ players: [] }),
  apiUpdateMatch: vi.fn().mockResolvedValue({}),
  apiUpdateMatchStatus: vi.fn().mockResolvedValue({}),
}));

const mockSeasonApi = vi.hoisted(() => ({
  apiGetSeasons: vi
    .fn()
    .mockResolvedValue([{ id: 's1', name: 'V.League 2025', year: 2025, status: 'IN_PROGRESS' }]),
}));

vi.mock('../../auth/AuthContext', () => ({ useAuth: mockUseAuth }));
vi.mock('../../services/matchApi', () => mockMatchApi);
vi.mock('../../services/seasonApi', () => mockSeasonApi);

import MatchesPage from '../MatchesPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <MatchesPage />
    </MemoryRouter>,
  );
}

describe('MatchesPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the page title', () => {
    const { container } = renderPage();
    expect(screen.getAllByText(/Kết quả trận đấu/)[0]).toBeInTheDocument();
    expect(screen.queryByText('⚽ Kết quả trận đấu')).not.toBeInTheDocument();
    expect(container.querySelector('.page-cover')).toBeInTheDocument();
  });

  it('calls apiGetSeasons on mount', async () => {
    renderPage();
    await waitFor(() => {
      expect(mockSeasonApi.apiGetSeasons).toHaveBeenCalled();
    });
  });

  it('calls apiGetMatches after season loaded', async () => {
    renderPage();
    await waitFor(() => {
      expect(mockMatchApi.apiGetMatches).toHaveBeenCalled();
    });
  });

  it('renders team abbreviations in match list', async () => {
    renderPage();
    await waitFor(
      () => {
        expect(screen.getByText('HN')).toBeInTheDocument();
        expect(screen.getByText('HP')).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });

  it('renders score for finished matches', async () => {
    renderPage();
    await waitFor(
      () => {
        expect(screen.getByText(/2 - 1/)).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });

  it('renders status tags', async () => {
    renderPage();
    await waitFor(
      () => {
        expect(screen.getByText('Kết thúc')).toBeInTheDocument();
        expect(screen.getByText('Nháp')).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });

  it('renders results with the schedule fixture card layout', async () => {
    const { container } = renderPage();

    await waitFor(
      () => {
        expect(container.querySelector('.schedule-fixture-list')).toBeInTheDocument();
        expect(container.querySelector('.schedule-fixture-day-group')).toBeInTheDocument();
        expect(container.querySelectorAll('.schedule-fixture-row')).toHaveLength(2);
        expect(
          container.querySelector('.schedule-fixture-score.is-final.is-score-card'),
        ).toHaveTextContent('2 - 1');
      },
      { timeout: 5000 },
    );

    expect(container.querySelector('.ant-table')).not.toBeInTheDocument();
  });
});

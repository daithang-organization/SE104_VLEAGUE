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

const mockSeasonApi = vi.hoisted(() => ({
  apiGetSeasons: vi.fn().mockResolvedValue([
    {
      id: 's1',
      name: 'VLeague 2025/2026',
      year: 2025,
      status: 'IN_PROGRESS',
      startDate: '2025-01-15T00:00:00Z',
      endDate: '2025-06-30T00:00:00Z',
    },
    {
      id: 's2',
      name: 'VLeague 2024/2025',
      year: 2024,
      status: 'COMPLETED',
      startDate: null,
      endDate: null,
    },
  ]),
  apiCreateSeason: vi.fn().mockResolvedValue({}),
  apiUpdateSeason: vi.fn().mockResolvedValue({}),
  apiDeleteSeason: vi.fn().mockResolvedValue({}),
  apiUpdateSeasonStatus: vi.fn().mockResolvedValue({}),
}));

const mockSeasonTeamApi = vi.hoisted(() => ({
  apiGetSeasonTeams: vi.fn().mockResolvedValue([]),
  apiRegisterTeam: vi.fn().mockResolvedValue({}),
  apiRemoveSeasonTeam: vi.fn().mockResolvedValue({}),
  apiUpdateSeasonTeamStatus: vi.fn().mockResolvedValue({}),
}));

const mockTeamApi = vi.hoisted(() => ({
  apiGetTeams: vi.fn().mockResolvedValue({ data: [], total: 0 }),
}));

vi.mock('../../auth/AuthContext', () => ({ useAuth: mockUseAuth }));
vi.mock('../../services/seasonApi', () => mockSeasonApi);
vi.mock('../../services/seasonTeamApi', () => mockSeasonTeamApi);
vi.mock('../../services/teamApi', () => mockTeamApi);

import SeasonsPage from '../SeasonsPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <SeasonsPage />
    </MemoryRouter>,
  );
}

describe('SeasonsPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the page title', () => {
    const { container } = renderPage();
    expect(screen.getAllByText(/Quản lý mùa giải/)[0]).toBeInTheDocument();
    expect(container.querySelector('.page-hero')).toBeInTheDocument();
  });

  it('summarizes season states in the hero metrics', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Đang diễn ra')).toBeInTheDocument();
    });
  });

  it('calls apiGetSeasons on mount', async () => {
    renderPage();
    await waitFor(() => {
      expect(mockSeasonApi.apiGetSeasons).toHaveBeenCalled();
    });
  });

  it('renders season names from API', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('VLeague 2025/2026')).toBeInTheDocument();
      expect(screen.getByText('VLeague 2024/2025')).toBeInTheDocument();
    });
  });

  it('shows create button for admin users', () => {
    renderPage();
    expect(screen.getByText('Tạo mùa giải')).toBeInTheDocument();
  });

  it('hides create button for non-admin users', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u2', email: 'user@vl.local', role: 'PUBLIC' },
      loading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });
    renderPage();
    expect(screen.queryByText('Tạo mùa giải')).not.toBeInTheDocument();
  });

  it('renders season years', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('2025/2026')).toBeInTheDocument();
      expect(screen.getByText('2024/2025')).toBeInTheDocument();
    });
  });
});

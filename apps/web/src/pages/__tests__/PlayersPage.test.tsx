import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

const mockPlayerApi = vi.hoisted(() => ({
  apiGetPlayers: vi.fn().mockResolvedValue({
    data: [
      {
        id: 'p1',
        fullName: 'Nguyễn Quang Hải',
        dob: '1997-04-12',
        nationality: 'Vietnam',
        position: 'MF',
        playerType: 'DOMESTIC',
        heightCm: 168,
        weightKg: 65,
        birthPlace: 'Hà Nội',
        roster: [{ team: { id: 't1', name: 'Hà Nội FC', shortName: 'HN', logoUrl: null } }],
      },
      {
        id: 'p2',
        fullName: 'Geovane Magno',
        dob: '1993-08-22',
        nationality: 'Brazil',
        position: 'FW',
        playerType: 'FOREIGN',
        heightCm: 180,
        weightKg: 78,
        birthPlace: null,
        roster: [],
      },
    ],
    total: 2,
    page: 1,
    limit: 20,
  }),
  apiCreatePlayer: vi.fn().mockResolvedValue({}),
  apiUpdatePlayer: vi.fn().mockResolvedValue({}),
  apiDeletePlayer: vi.fn().mockResolvedValue({}),
}));

const mockTeamApi = vi.hoisted(() => ({
  apiGetTeams: vi.fn().mockResolvedValue({
    data: [{ id: 't1', name: 'Hà Nội FC', shortName: 'HN', status: 'ACTIVE' }],
    total: 1,
  }),
}));

const mockSeasonApi = vi.hoisted(() => ({
  apiGetCurrentSeason: vi.fn().mockResolvedValue(null),
}));

const mockTeamManagerApi = vi.hoisted(() => ({
  apiGetTeamManagerAssignment: vi.fn().mockResolvedValue(null),
  apiGetTeamManagerManagedTeam: vi.fn().mockResolvedValue({
    id: 't1',
    name: 'Hà Nội FC',
    shortName: 'HN',
    status: 'ACTIVE',
  }),
}));

vi.mock('../../auth/AuthContext', () => ({ useAuth: mockUseAuth }));
vi.mock('../../services/playerApi', () => mockPlayerApi);
vi.mock('../../services/teamApi', () => mockTeamApi);
vi.mock('../../services/seasonApi', () => mockSeasonApi);
vi.mock('../../services/teamManagerApi', () => mockTeamManagerApi);

import PlayersPage from '../PlayersPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <PlayersPage />
    </MemoryRouter>,
  );
}

describe('PlayersPage', () => {
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

  it('renders the page title', () => {
    const { container } = renderPage();
    expect(screen.getByText('Quản lý cầu thủ')).toBeInTheDocument();
    expect(container.querySelector('.page-hero')).toBeInTheDocument();
  });

  it('calls apiGetPlayers on mount', async () => {
    renderPage();
    await waitFor(() => {
      expect(mockPlayerApi.apiGetPlayers).toHaveBeenCalled();
    });
  });

  it('renders player names from API', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Nguyễn Quang Hải')).toBeInTheDocument();
      expect(screen.getByText('Geovane Magno')).toBeInTheDocument();
    });
  });

  it('shows add button for admin/team_manager users', () => {
    renderPage();
    expect(screen.getByText('Thêm cầu thủ')).toBeInTheDocument();
  });

  it('hides add button for public users', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u2', email: 'user@vl.local', role: 'PUBLIC' },
      loading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });
    renderPage();
    expect(screen.queryByText('Thêm cầu thủ')).not.toBeInTheDocument();
  });

  it('renders position tags', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Tiền vệ')).toBeInTheDocument();
      expect(screen.getByText('Tiền đạo')).toBeInTheDocument();
    });
  });

  it('renders club logos in the club column', async () => {
    const { container } = renderPage();

    await waitFor(() => {
      expect(mockPlayerApi.apiGetPlayers).toHaveBeenCalled();
    });
    await screen.findByText('Nguyễn Quang Hải');

    const logo = await waitFor(() => {
      const element = container.querySelector('img.player-club-logo');
      expect(element).toBeInTheDocument();
      return element as HTMLImageElement;
    });

    expect(logo).toHaveAttribute('src', '/team-logos/Logo_H%C3%A0_N%E1%BB%99i_FC.png');
    expect(logo).toHaveAttribute('alt', 'Hà Nội FC logo');
    expect(logo).toHaveClass('player-club-logo');
    expect(logo.closest('.player-club-cell')).toHaveTextContent('HN');
  });

  it('summarizes player counts in the hero metrics', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Ngoại binh')).toBeInTheDocument();
    });
  });

  it('shows all players by default and loads managed club players in the manager tab', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u-manager', email: 'manager.hanoi@demo.local', role: 'TEAM_MANAGER' },
      loading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderPage();

    await waitFor(() => {
      expect(mockTeamManagerApi.apiGetTeamManagerManagedTeam).toHaveBeenCalled();
      expect(mockPlayerApi.apiGetPlayers).toHaveBeenCalledWith(
        1,
        20,
        expect.objectContaining({
          search: undefined,
          teamId: undefined,
        }),
      );
    });

    expect(screen.getByRole('tab', { name: 'Tất cả cầu thủ' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('tab', { name: 'Cầu thủ của tôi' }));

    await waitFor(() => {
      expect(mockPlayerApi.apiGetPlayers).toHaveBeenCalledWith(
        1,
        20,
        expect.objectContaining({
          teamId: 't1',
        }),
      );
    });
  });
});

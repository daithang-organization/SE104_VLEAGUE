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

const mockTeamApi = vi.hoisted(() => ({
  apiGetTeams: vi.fn().mockResolvedValue({
    data: [
      {
        id: 't1',
        name: 'Hà Nội FC',
        shortName: 'HN',
        city: 'Hà Nội',
        status: 'ACTIVE',
        stadiumId: 's1',
        logoUrl: null,
        stadium: { id: 's1', name: 'Hàng Đẫy' },
      },
      {
        id: 't2',
        name: 'Hải Phòng FC',
        shortName: 'HP',
        city: 'Hải Phòng',
        status: 'INACTIVE',
        stadiumId: null,
        logoUrl: null,
        stadium: null,
      },
    ],
    total: 2,
  }),
  apiGetStadiums: vi.fn().mockResolvedValue([{ id: 's1', name: 'Hàng Đẫy', city: 'Hà Nội' }]),
  apiCreateTeam: vi.fn().mockResolvedValue({}),
  apiUpdateTeam: vi.fn().mockResolvedValue({}),
  apiDeleteTeam: vi.fn().mockResolvedValue({}),
}));

vi.mock('../../auth/AuthContext', () => ({ useAuth: mockUseAuth }));
vi.mock('../../services/teamApi', () => mockTeamApi);

import TeamsPage from '../TeamsPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <TeamsPage />
    </MemoryRouter>,
  );
}

describe('TeamsPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the page title', () => {
    renderPage();
    expect(screen.getByText('Quản lý đội bóng')).toBeInTheDocument();
  });

  it('calls apiGetTeams and apiGetStadiums on mount', async () => {
    renderPage();
    await waitFor(() => {
      expect(mockTeamApi.apiGetTeams).toHaveBeenCalled();
      expect(mockTeamApi.apiGetStadiums).toHaveBeenCalled();
    });
  });

  it('renders team names from API', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Hà Nội FC')).toBeInTheDocument();
      expect(screen.getByText('Hải Phòng FC')).toBeInTheDocument();
    });
  });

  it('shows add button for admin users', () => {
    renderPage();
    expect(screen.getByText('Thêm đội bóng')).toBeInTheDocument();
  });

  it('hides add button for non-admin users', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u2', email: 'user@vl.local', role: 'PUBLIC' },
      loading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });
    renderPage();
    expect(screen.queryByText('Thêm đội bóng')).not.toBeInTheDocument();
  });

  it('renders status tags', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Hoạt động')).toBeInTheDocument();
      expect(screen.getByText('Ngưng')).toBeInTheDocument();
    });
  });

  it('renders detail buttons for the club card layout', async () => {
    renderPage();

    const detailButtons = await screen.findAllByRole('button', { name: /chi tiết/i });

    expect(detailButtons).toHaveLength(2);
  });

  it('keeps the short name attached to the club identity area', async () => {
    renderPage();

    const code = await screen.findByText('HN');

    expect(code).toHaveClass('club-card-code-pill');
    expect(code.closest('.club-card-footer')).toBeNull();
  });

  it('applies a club color theme to each club card', async () => {
    renderPage();

    const logo = await screen.findByRole('img', { name: 'Hà Nội FC logo' });
    const card = logo.closest('.club-card');

    expect(card?.getAttribute('style')).toContain('--club-accent: #f7c948');
  });
});

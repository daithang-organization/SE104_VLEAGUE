import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockTeamApi = vi.hoisted(() => ({
  apiGetTeam: vi.fn().mockResolvedValue({
    id: 't1',
    name: 'Công An Hà Nội',
    shortName: 'CAHN',
    logoUrl: null,
    city: 'Hà Nội',
    status: 'ACTIVE',
    stadiumId: 's1',
    stadium: { id: 's1', name: 'Sân vận động Hàng Đẫy', city: 'Hà Nội' },
    managedUsers: [
      {
        id: 'u-manager',
        email: 'manager.cahn@demo.local',
        name: 'Manager CAHN',
      },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    roster: [],
    homeMatches: [],
    awayMatches: [],
    standings: [],
  }),
}));

const mockUseAuth = vi.hoisted(() =>
  vi.fn(() => ({
    user: { id: 'u-admin', email: 'admin@demo.local', role: 'ADMIN' },
    loading: false,
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
  })),
);

vi.mock('../../auth/AuthContext', () => ({ useAuth: mockUseAuth }));
vi.mock('../../services/teamApi', () => mockTeamApi);

import TeamDetailPage from '../TeamDetailPage';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/teams/t1']}>
      <Routes>
        <Route path="/teams/:id" element={<TeamDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('TeamDetailPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the team logo from the known logo map when the API has no logoUrl', async () => {
    renderPage();

    const logo = await screen.findByRole('img', { name: 'Công An Hà Nội' });

    expect(logo).toHaveAttribute('src', '/team-logos/Logo_CAHN_FC.svg.png');
  });

  it('applies the club color theme to the detail hero', async () => {
    renderPage();

    const logo = await screen.findByRole('img', { name: 'Công An Hà Nội' });
    const hero = logo.closest('.club-detail-hero');

    expect(hero?.getAttribute('style')).toContain('--club-accent: #f5c542');
  });

  it('renders the short name as a low badge near the club facts', async () => {
    renderPage();

    const logo = await screen.findByRole('img', { name: 'Công An Hà Nội' });
    const hero = logo.closest('.club-detail-hero');
    const code = within(hero as HTMLElement).getByText('CAHN');

    expect(code).toHaveClass('club-detail-code-pill');
    expect(code).not.toHaveClass('club-detail-eyebrow');
    expect(code.closest('.club-detail-facts')).not.toBeNull();
  });

  it('renders manager information in the overview table', async () => {
    renderPage();

    expect(await screen.findByText('Manager CAHN (manager.cahn@demo.local)')).toBeInTheDocument();
  });
});

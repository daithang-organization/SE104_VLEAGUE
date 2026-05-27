import { render, screen } from '@testing-library/react';
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
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    roster: [],
    homeMatches: [],
    awayMatches: [],
    standings: [],
  }),
}));

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
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockStadiumApi = vi.hoisted(() => ({
  apiGetStadium: vi.fn().mockResolvedValue({
    id: 's1',
    name: 'Sân vận động Pleiku',
    city: 'Pleiku',
    address: 'TP. Pleiku, Gia Lai',
    capacity: 12000,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    teams: [
      {
        id: 't1',
        name: 'LPBank Hoàng Anh Gia Lai',
      },
    ],
    matches: [
      {
        id: 'm1',
        roundNo: 1,
        leg: 1,
        homeScore: null,
        awayScore: null,
        kickoffAt: '2024-12-29T00:00:00.000Z',
        status: 'PUBLISHED',
        homeTeam: { id: 't1', name: 'LPBank Hoàng Anh Gia Lai' },
        awayTeam: { id: 't2', name: 'Thép Xanh Nam Định' },
      },
    ],
  }),
}));

vi.mock('../../services/stadiumApi', () => mockStadiumApi);

import StadiumDetailPage from '../StadiumDetailPage';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/stadiums/s1']}>
      <Routes>
        <Route path="/stadiums/:id" element={<StadiumDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('StadiumDetailPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uses icon components instead of emoji text in the stadium heading and tabs', async () => {
    renderPage();

    await screen.findByRole('heading', { name: 'Sân vận động Pleiku' });

    expect(screen.queryByText(/🏟️|📋|⚽/u)).not.toBeInTheDocument();
  });

  it('shows club logos for home teams and match teams', async () => {
    const user = userEvent.setup();
    renderPage();

    const homeTeamLogo = await screen.findByRole('img', {
      name: 'LPBank Hoàng Anh Gia Lai logo',
    });

    expect(homeTeamLogo).toHaveAttribute('src', '/team-logos/Ho%C3%A0ng_Anh_Gia_Lai_FC.png');

    await user.click(screen.getByRole('tab', { name: /Trận đấu/ }));

    expect(await screen.findByRole('img', { name: 'Thép Xanh Nam Định logo' })).toHaveAttribute(
      'src',
      '/team-logos/images.png',
    );
    expect(screen.getByRole('img', { name: 'LPBank Hoàng Anh Gia Lai logo' })).toHaveAttribute(
      'src',
      '/team-logos/Ho%C3%A0ng_Anh_Gia_Lai_FC.png',
    );
  });
});

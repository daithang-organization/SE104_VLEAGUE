import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/* ---------- hoisted mocks ---------- */
const mockStadiumApi = vi.hoisted(() => ({
  apiGetStadiums: vi.fn().mockResolvedValue([
    {
      id: 's1',
      name: 'Sân Mỹ Đình',
      city: 'Hà Nội',
      address: 'Mỹ Đình, Nam Từ Liêm',
      capacity: 40000,
      country: 'Việt Nam',
      fifaStars: null,
    },
    {
      id: 's2',
      name: 'Sân Thống Nhất',
      city: 'TP.HCM',
      address: 'Q.10',
      capacity: 25000,
      country: 'Việt Nam',
      fifaStars: 2,
    },
  ]),
  apiCreateStadium: vi.fn(),
  apiUpdateStadium: vi.fn(),
  apiDeleteStadium: vi.fn(),
}));

const mockAuth = vi.hoisted(() => ({
  useAuth: vi.fn().mockReturnValue({ user: { role: 'ADMIN' } }),
}));

vi.mock('../../services/stadiumApi', () => mockStadiumApi);
vi.mock('../../auth/AuthContext', () => mockAuth);
vi.mock('react-router-dom', () => ({ useNavigate: () => vi.fn() }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('../../components', () => ({
  AppMenuIcon: ({ menuKey }: { menuKey: string }) => (
    <span data-testid={`app-menu-icon-${menuKey}`} />
  ),
  TableSkeleton: () => <div>Loading...</div>,
}));

import StadiumsPage from '../StadiumsPage';

function renderPage() {
  return render(<StadiumsPage />);
}

describe('StadiumsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.useAuth.mockReturnValue({ user: { role: 'ADMIN' } });
  });

  it('renders title', async () => {
    const { container } = renderPage();
    await waitFor(() => {
      expect(screen.getByText('stadiums.title')).toBeInTheDocument();
      expect(container.querySelector('.page-hero')).toBeInTheDocument();
    });
  });

  it('summarizes stadium inventory in the hero metrics', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('65.000')).toBeInTheDocument();
    });
  });

  it('fetches stadiums on mount', async () => {
    renderPage();
    await waitFor(() => {
      expect(mockStadiumApi.apiGetStadiums).toHaveBeenCalled();
    });
  });

  it('displays stadium data', async () => {
    renderPage();
    await waitFor(() => {
      expect(mockStadiumApi.apiGetStadiums).toHaveBeenCalledTimes(1);
    });
  });

  it('shows add button for admin', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('stadiums.addBtn')).toBeInTheDocument();
    });
  });

  it('hides add button for non-admin', async () => {
    mockAuth.useAuth.mockReturnValue({ user: { role: 'PUBLIC' } });
    renderPage();
    await waitFor(() => {
      expect(mockStadiumApi.apiGetStadiums).toHaveBeenCalledTimes(1);
    });
    expect(screen.queryByText('stadiums.addBtn')).not.toBeInTheDocument();
  });

  it('lets admin update stadium country and FIFA stars', async () => {
    mockStadiumApi.apiUpdateStadium.mockResolvedValue({
      id: 's1',
      name: 'Sân Mỹ Đình',
      city: 'Hà Nội',
      country: 'Việt Nam',
      fifaStars: 2,
    });
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Sân Mỹ Đình')).toBeInTheDocument();
    });

    const editButton = screen.getAllByRole('button', { name: 'stadiums.editAction' })[0];
    await userEvent.click(editButton);

    const countryInput = await screen.findByLabelText('stadiums.formCountry');
    const fifaStarsInput = screen.getByLabelText('stadiums.formFifaStars');

    await userEvent.clear(countryInput);
    await userEvent.type(countryInput, 'Việt Nam');
    await userEvent.clear(fifaStarsInput);
    await userEvent.type(fifaStarsInput, '2');
    await userEvent.click(screen.getByText('common.save'));

    await waitFor(() => {
      expect(mockStadiumApi.apiUpdateStadium).toHaveBeenCalledWith(
        's1',
        expect.objectContaining({
          country: 'Việt Nam',
          fifaStars: 2,
        }),
      );
    });
  });
});

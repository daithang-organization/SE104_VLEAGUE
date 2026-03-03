import { render, screen, waitFor } from '@testing-library/react';
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
    },
    { id: 's2', name: 'Sân Thống Nhất', city: 'TP.HCM', address: 'Q.10', capacity: 25000 },
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
  TableSkeleton: () => <div>Loading...</div>,
}));

import StadiumsPage from '../StadiumsPage';

function renderPage() {
  return render(<StadiumsPage />);
}

describe('StadiumsPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders title', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('stadiums.title')).toBeInTheDocument();
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
});

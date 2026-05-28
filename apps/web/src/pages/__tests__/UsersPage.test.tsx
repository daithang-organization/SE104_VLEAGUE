import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/* ---------- hoisted mocks ---------- */
const mockUserApi = vi.hoisted(() => ({
  apiGetUsers: vi.fn().mockResolvedValue([
    {
      id: 'u1',
      email: 'admin@demo.local',
      role: 'ADMIN',
      emailVerified: true,
      createdAt: '2024-01-01',
    },
    {
      id: 'u2',
      email: 'user@demo.local',
      role: 'PUBLIC',
      emailVerified: false,
      createdAt: '2024-02-01',
    },
  ]),
  apiCreateUser: vi.fn(),
  apiUpdateUserRole: vi.fn(),
  apiDeleteUser: vi.fn(),
}));
const mockTeamApi = vi.hoisted(() => ({
  apiGetTeams: vi.fn().mockResolvedValue({
    data: [{ id: 'team-1', name: 'Hà Nội FC', status: 'ACTIVE' }],
  }),
}));

vi.mock('../../services/userApi', () => mockUserApi);
vi.mock('../../services/teamApi', () => mockTeamApi);
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('../../components', () => ({
  AppMenuIcon: ({ menuKey }: { menuKey: string }) => (
    <span data-testid={`app-menu-icon-${menuKey}`} />
  ),
  TableSkeleton: () => <div>Loading...</div>,
}));

import UsersPage from '../UsersPage';

function renderPage() {
  return render(<UsersPage />);
}

describe('UsersPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders title', () => {
    const { container } = renderPage();
    expect(screen.getByText('users.title')).toBeInTheDocument();
    expect(container.querySelector('.page-hero')).toBeInTheDocument();
  });

  it('fetches users on mount', async () => {
    renderPage();
    await waitFor(() => {
      expect(mockUserApi.apiGetUsers).toHaveBeenCalled();
      expect(mockTeamApi.apiGetTeams).toHaveBeenCalled();
    });
  });

  it('displays user data', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('admin@demo.local')).toBeInTheDocument();
      expect(screen.getByText('user@demo.local')).toBeInTheDocument();
    });
  });

  it('renders create button', async () => {
    renderPage();
    await waitFor(() => {
      expect(mockUserApi.apiGetUsers).toHaveBeenCalledTimes(1);
    });
  });
});

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

const mockAuthApi = vi.hoisted(() => ({
  apiGetMe: vi.fn().mockResolvedValue({
    id: 'u1',
    email: 'admin@vl.local',
    name: 'Admin VLeague',
    role: 'ADMIN',
    emailVerified: true,
    avatarUrl: null,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
  }),
  apiUpdateProfile: vi.fn().mockResolvedValue({}),
  apiLogoutAll: vi.fn().mockResolvedValue({ message: 'Đã đăng xuất tất cả' }),
}));

vi.mock('../../auth/AuthContext', () => ({ useAuth: mockUseAuth }));
vi.mock('../../services/authApi', () => mockAuthApi);

import ProfilePage from '../ProfilePage';

function renderPage() {
  return render(
    <MemoryRouter>
      <ProfilePage />
    </MemoryRouter>,
  );
}

describe('ProfilePage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the page title', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Thông tin tài khoản')).toBeInTheDocument();
    });
  });

  it('calls apiGetMe on mount', async () => {
    renderPage();
    await waitFor(() => {
      expect(mockAuthApi.apiGetMe).toHaveBeenCalled();
    });
  });

  it('renders user profile data', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText('Admin VLeague').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('admin@vl.local').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders role tag', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Quản trị viên')).toBeInTheDocument();
    });
  });

  it('renders email verified status', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Đã xác thực')).toBeInTheDocument();
    });
  });

  it('renders action buttons', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Đổi mật khẩu')).toBeInTheDocument();
      expect(screen.getByText('Đăng xuất tất cả thiết bị')).toBeInTheDocument();
    });
  });
});

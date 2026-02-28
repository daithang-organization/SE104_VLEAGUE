import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/* ---------- hoisted mocks ---------- */
const mockUseAuth = vi.hoisted(() =>
  vi.fn(() => ({
    user: null,
    loading: false,
    isAuthed: false,
    isAuthenticated: false,
    login: vi.fn(),
    logout: vi.fn(),
  })),
);
const mockNav = vi.hoisted(() => vi.fn());

vi.mock('../../auth/AuthContext', () => ({ useAuth: mockUseAuth }));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNav,
    useLocation: () => ({ state: null, pathname: '/login', search: '', hash: '', key: 'default' }),
  };
});

import LoginPage from '../LoginPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      isAuthed: false,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
    });
  });

  it('renders the VLeague Admin title', () => {
    renderPage();
    expect(screen.getByText('VLeague Admin')).toBeInTheDocument();
  });

  it('renders email and password fields', () => {
    renderPage();
    expect(screen.getByPlaceholderText('admin@vleague.local')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('renders login button', () => {
    renderPage();
    expect(screen.getByRole('button', { name: 'Đăng nhập' })).toBeInTheDocument();
  });

  it('renders social login buttons', () => {
    renderPage();
    expect(screen.getByText('Đăng nhập với Google')).toBeInTheDocument();
    expect(screen.getByText('Đăng nhập với Facebook')).toBeInTheDocument();
  });

  it('renders registration and verify links', () => {
    renderPage();
    expect(screen.getByText('Đăng ký')).toBeInTheDocument();
    expect(screen.getByText('Xác thực email')).toBeInTheDocument();
  });

  it('renders remember me checkbox and forgot password link', () => {
    renderPage();
    expect(screen.getByText('Ghi nhớ đăng nhập')).toBeInTheDocument();
    expect(screen.getByText('Quên mật khẩu?')).toBeInTheDocument();
  });
});

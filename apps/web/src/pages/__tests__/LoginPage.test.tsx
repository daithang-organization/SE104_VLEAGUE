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

  it('renders the V.League season logo in the login brand area', () => {
    renderPage();

    expect(screen.getByRole('img', { name: 'V.League 1 2025/26' })).toHaveAttribute(
      'src',
      '/V.League_1_2025-26_logo.svg.png',
    );
  });

  it('renders the V.League management system introduction', () => {
    renderPage();

    expect(
      screen.getByText('Hệ thống quản lý giải vô địch bóng đá quốc gia V.League'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Nền tảng điều hành tập trung cho mùa giải, câu lạc bộ, cầu thủ, lịch thi đấu, kết quả và báo cáo thống kê.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Điều hành giải đấu')).toBeInTheDocument();
    expect(screen.getByText('Dữ liệu đội bóng')).toBeInTheDocument();
    expect(screen.getByText('Báo cáo thống kê')).toBeInTheDocument();
  });

  it('renders the decorative football background outside the accessible content', () => {
    renderPage();

    const background = screen.getByTestId('login-football-background');

    expect(background).toHaveAttribute('aria-hidden', 'true');
    expect(background.querySelector('.login-pitch-lines')).toBeInTheDocument();
    expect(background.querySelector('.login-goal-line')).toBeInTheDocument();
    expect(background.querySelectorAll('.login-ball')).toHaveLength(3);
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

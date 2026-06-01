import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

const mockLogout = vi.hoisted(() => vi.fn());
const mockToggleTheme = vi.hoisted(() => vi.fn());

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'admin-1', email: 'admin@example.com', role: 'ADMIN' },
    logout: mockLogout,
  }),
}));

vi.mock('./ThemeContext', () => ({
  useTheme: () => ({
    isDark: true,
    toggleTheme: mockToggleTheme,
  }),
}));

vi.mock('../components/NotificationBell', () => ({
  default: () => <span data-testid="notification-bell" />,
}));

vi.mock('../components/TeamInvitationPopup', () => ({
  default: () => <span data-testid="team-invitation-popup" />,
}));

vi.mock('../services/searchApi', () => ({
  apiGlobalSearch: vi.fn(),
}));

import AppShell from './AppShell';

function renderShell(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppShell />
    </MemoryRouter>,
  );
}

describe('AppShell', () => {
  it('renders sidebar with stable styling hooks for the brand and menu rail', () => {
    const { container } = renderShell('/teams');

    expect(container.querySelector('.app-sidebar')).toBeInTheDocument();
    expect(container.querySelector('.sidebar-brand')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'VLeague Dashboard' })).toHaveAttribute('href', '/');
    expect(screen.getByAltText('VLeague Logo')).toHaveClass('sidebar-brand-logo');
    expect(container.querySelector('.sidebar-menu')).toBeInTheDocument();
    expect(container.querySelectorAll('.sidebar-menu-icon').length).toBeGreaterThan(0);
    expect(screen.getByText('Trang chủ')).toBeInTheDocument();
    expect(screen.getByText('Đội bóng')).toBeInTheDocument();
  });
});

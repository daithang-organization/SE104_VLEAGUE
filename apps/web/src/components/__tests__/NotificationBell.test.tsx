import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockNotificationApi = vi.hoisted(() => ({
  apiGetNotifications: vi.fn(),
  apiMarkAllAsRead: vi.fn(),
  apiMarkAsRead: vi.fn(),
}));

vi.mock('../../services/notificationApi', () => mockNotificationApi);

vi.mock('../../auth/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'admin-1', email: 'admin@vl.local', role: 'ADMIN' },
  }),
}));

import NotificationBell from '../NotificationBell';

function LocationProbe() {
  const location = useLocation();
  return <span data-testid="location">{location.pathname + location.search}</span>;
}

function renderBell() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <NotificationBell />
      <Routes>
        <Route path="*" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNotificationApi.apiGetNotifications.mockResolvedValue({
      data: [
        {
          id: 'notification-1',
          userId: 'admin-1',
          title: 'CLB nộp hồ sơ mùa giải',
          message: 'Hà Nội FC đã nộp hồ sơ tham dự V.League 2026.',
          type: 'SYSTEM',
          entityType: 'season',
          entityId: 'season-1',
          readAt: null,
          createdAt: '2026-06-02T01:59:01.000Z',
        },
      ],
      total: 1,
      unreadCount: 1,
      page: 1,
      limit: 15,
      totalPages: 1,
    });
    mockNotificationApi.apiMarkAsRead.mockResolvedValue({});
    mockNotificationApi.apiMarkAllAsRead.mockResolvedValue({});
  });

  it('opens the seasons page for season workflow notifications', async () => {
    renderBell();

    await userEvent.click(await screen.findByTitle('Thông báo'));
    await userEvent.click(await screen.findByText('CLB nộp hồ sơ mùa giải'));

    await waitFor(() => {
      expect(mockNotificationApi.apiMarkAsRead).toHaveBeenCalledWith('notification-1');
      expect(screen.getByTestId('location')).toHaveTextContent('/seasons?seasonId=season-1');
    });
  });
});

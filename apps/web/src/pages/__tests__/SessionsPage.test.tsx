import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/* ---------- hoisted mocks ---------- */
const mockAuthApi = vi.hoisted(() => ({
  apiGetSessions: vi.fn().mockResolvedValue([
    {
      id: 'sess1',
      deviceName: 'Chrome Desktop',
      ipAddress: '127.0.0.1',
      lastUsedAt: '2024-06-01T10:00:00Z',
      createdAt: '2024-05-01T10:00:00Z',
      expiresAt: '2024-07-01T10:00:00Z',
    },
    {
      id: 'sess2',
      deviceName: 'iPhone Safari',
      ipAddress: '192.168.1.1',
      lastUsedAt: '2024-06-02T10:00:00Z',
      createdAt: '2024-05-15T10:00:00Z',
      expiresAt: '2024-07-15T10:00:00Z',
    },
  ]),
  apiRevokeSession: vi.fn(),
  apiLogoutAll: vi.fn(),
}));

vi.mock('../../services/authApi', () => mockAuthApi);
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import SessionsPage from '../SessionsPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <SessionsPage />
    </MemoryRouter>,
  );
}

describe('SessionsPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders title', () => {
    renderPage();
    expect(screen.getByText('sessions.title')).toBeInTheDocument();
  });

  it('fetches sessions on mount', async () => {
    renderPage();
    await waitFor(() => {
      expect(mockAuthApi.apiGetSessions).toHaveBeenCalled();
    });
  });

  it('displays session devices', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Chrome Desktop')).toBeInTheDocument();
      expect(screen.getByText('iPhone Safari')).toBeInTheDocument();
    });
  });

  it('shows back to profile link', () => {
    renderPage();
    expect(screen.getByText('sessions.backToProfile')).toBeInTheDocument();
  });
});

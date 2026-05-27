import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { message } from 'antd';
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

const mockSeasonApi = vi.hoisted(() => ({
  apiGetSeasons: vi.fn().mockResolvedValue([
    {
      id: 's1',
      name: 'VLeague 2025/2026',
      year: 2025,
      status: 'IN_PROGRESS',
      startDate: '2025-01-15T00:00:00Z',
      endDate: '2025-06-30T00:00:00Z',
    },
    {
      id: 's2',
      name: 'VLeague 2024/2025',
      year: 2024,
      status: 'COMPLETED',
      startDate: null,
      endDate: null,
    },
  ]),
  apiCreateSeason: vi.fn().mockResolvedValue({}),
  apiUpdateSeason: vi.fn().mockResolvedValue({}),
  apiDeleteSeason: vi.fn().mockResolvedValue({}),
  apiUpdateSeasonStatus: vi.fn().mockResolvedValue({}),
}));

const mockSeasonTeamApi = vi.hoisted(() => ({
  apiGetSeasonTeams: vi.fn().mockResolvedValue([
    {
      id: 'season-team-1',
      seasonId: 's1',
      teamId: 'team-1',
      status: 'REGISTERED',
      registeredAt: '2025-01-01T00:00:00Z',
      approvedAt: null,
      applicationSubmittedAt: null,
      ownerName: null,
      ownerCountry: null,
      teamIntroduction: null,
      primaryKit: null,
      backupKit: null,
      participationFeePaid: false,
      team: {
        id: 'team-1',
        name: 'CLB Bình Định',
        shortName: 'BĐ',
        logoUrl: null,
        city: 'Quy Nhơn',
        status: 'ACTIVE',
      },
    },
  ]),
  apiRegisterTeam: vi.fn().mockResolvedValue({}),
  apiRemoveSeasonTeam: vi.fn().mockResolvedValue({}),
  apiUpdateSeasonTeamStatus: vi.fn().mockResolvedValue({}),
}));

const mockTeamApi = vi.hoisted(() => ({
  apiGetTeams: vi.fn().mockResolvedValue({ data: [], total: 0 }),
}));
const mockTeamInvitationApi = vi.hoisted(() => ({
  apiGetSeasonInvitations: vi.fn().mockResolvedValue([
    {
      id: 'invitation-1',
      seasonId: 's1',
      teamId: 'team-1',
      sourceType: 'PREVIOUS_TOP_8',
      status: 'ACCEPTED',
      sentAt: '2025-01-01T00:00:00Z',
      deadlineAt: '2025-01-15T00:00:00Z',
      responseAt: '2025-01-02T00:00:00Z',
      responseReason: null,
      regulationsSnapshot: null,
      team: { id: 'team-1', name: 'CLB Bình Định' },
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-02T00:00:00Z',
    },
  ]),
  apiSendTeamInvitation: vi.fn().mockResolvedValue({}),
}));

vi.mock('../../auth/AuthContext', () => ({ useAuth: mockUseAuth }));
vi.mock('../../services/seasonApi', () => mockSeasonApi);
vi.mock('../../services/seasonTeamApi', () => mockSeasonTeamApi);
vi.mock('../../services/teamApi', () => mockTeamApi);
vi.mock('../../services/teamInvitationApi', () => mockTeamInvitationApi);

import SeasonsPage from '../SeasonsPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <SeasonsPage />
    </MemoryRouter>,
  );
}

describe('SeasonsPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the page title', () => {
    const { container } = renderPage();
    expect(screen.getAllByText(/Quản lý mùa giải/)[0]).toBeInTheDocument();
    expect(container.querySelector('.page-hero')).toBeInTheDocument();
  });

  it('summarizes season states in the hero metrics', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Đang diễn ra')).toBeInTheDocument();
    });
  });

  it('calls apiGetSeasons on mount', async () => {
    renderPage();
    await waitFor(() => {
      expect(mockSeasonApi.apiGetSeasons).toHaveBeenCalled();
    });
  });

  it('renders season names from API', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('VLeague 2025/2026')).toBeInTheDocument();
      expect(screen.getByText('VLeague 2024/2025')).toBeInTheDocument();
    });
  });

  it('shows create button for admin users', () => {
    renderPage();
    expect(screen.getByText('Tạo mùa giải')).toBeInTheDocument();
  });

  it('hides create button for non-admin users', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u2', email: 'user@vl.local', role: 'PUBLIC' },
      loading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });
    renderPage();
    expect(screen.queryByText('Tạo mùa giải')).not.toBeInTheDocument();
  });

  it('renders season years', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('2025/2026')).toBeInTheDocument();
      expect(screen.getByText('2024/2025')).toBeInTheDocument();
    });
  });

  it('shows invitation and application status in the admin season team panel', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u1', email: 'admin@vl.local', role: 'ADMIN' },
      loading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });
    const { container } = renderPage();

    await waitFor(() => {
      expect(screen.getByText('VLeague 2025/2026')).toBeInTheDocument();
    });

    const expandButton = container.querySelector('.ant-table-row-expand-icon') as HTMLElement;
    fireEvent.click(expandButton);

    await waitFor(() => {
      expect(mockSeasonTeamApi.apiGetSeasonTeams).toHaveBeenCalledWith('s1');
      expect(mockTeamInvitationApi.apiGetSeasonInvitations).toHaveBeenCalledWith('s1');
    });
    expect(await screen.findByText('CLB Bình Định')).toBeInTheDocument();
    expect(screen.getByText('Đã đồng ý')).toBeInTheDocument();
    expect(screen.getByText('Chờ nộp hồ sơ')).toBeInTheDocument();
  });

  it('shows the backend validation reason when team approval fails', async () => {
    const messageErrorSpy = vi.spyOn(message, 'error').mockImplementation(() => undefined as never);
    mockSeasonTeamApi.apiUpdateSeasonTeamStatus.mockRejectedValueOnce({
      response: { data: { message: 'Đội chỉ được đăng ký tối đa 22 cầu thủ' } },
    });

    const { container } = renderPage();

    await waitFor(() => {
      expect(screen.getByText('VLeague 2025/2026')).toBeInTheDocument();
    });

    const expandButton = container.querySelector('.ant-table-row-expand-icon') as HTMLElement;
    fireEvent.click(expandButton);

    expect(await screen.findByText('CLB Bình Định')).toBeInTheDocument();

    const approveButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.style.color === 'rgb(82, 196, 26)' || button.style.color === '#52c41a',
    );
    expect(approveButton).toBeTruthy();
    fireEvent.click(approveButton as HTMLButtonElement);

    await waitFor(() => {
      expect(mockSeasonTeamApi.apiUpdateSeasonTeamStatus).toHaveBeenCalledWith(
        's1',
        'team-1',
        'APPROVED',
      );
    });
    expect(messageErrorSpy).toHaveBeenCalledWith('Đội chỉ được đăng ký tối đa 22 cầu thủ');
  });

  it('shows the club decline reason in the admin season team panel', async () => {
    mockTeamInvitationApi.apiGetSeasonInvitations.mockResolvedValueOnce([
      {
        id: 'invitation-1',
        seasonId: 's1',
        teamId: 'team-1',
        sourceType: 'PREVIOUS_TOP_8',
        status: 'DECLINED',
        sentAt: '2025-01-01T00:00:00Z',
        deadlineAt: '2025-01-15T00:00:00Z',
        responseAt: '2025-01-03T00:00:00Z',
        responseReason: 'Không đủ ngân sách tham dự mùa giải mới',
        regulationsSnapshot: null,
        team: { id: 'team-1', name: 'CLB Bình Định' },
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-03T00:00:00Z',
      },
    ]);

    const { container } = renderPage();

    await waitFor(() => {
      expect(screen.getByText('VLeague 2025/2026')).toBeInTheDocument();
    });

    const expandButton = container.querySelector('.ant-table-row-expand-icon') as HTMLElement;
    fireEvent.click(expandButton);

    expect(await screen.findByText('Đã từ chối')).toBeInTheDocument();
    expect(screen.getByText('Không đủ ngân sách tham dự mùa giải mới')).toBeInTheDocument();
  });
});

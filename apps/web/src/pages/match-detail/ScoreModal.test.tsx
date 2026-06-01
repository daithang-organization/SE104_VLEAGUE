import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Match } from '../../services/matchApi';

const mockMessage = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
}));

const mockMatchApi = vi.hoisted(() => ({
  apiUpdateMatch: vi.fn(),
}));

vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd')>();
  return {
    ...actual,
    message: mockMessage,
  };
});

vi.mock('../../services/matchApi', () => mockMatchApi);

import ScoreModal from './ScoreModal';

const match = {
  id: 'match-1',
  roundNo: 1,
  leg: 1,
  homeTeamId: 'home-team',
  awayTeamId: 'away-team',
  homeTeam: { id: 'home-team', name: 'Ha Noi FC' },
  awayTeam: { id: 'away-team', name: 'Hai Phong FC' },
  homeScore: 1,
  awayScore: 0,
  status: 'FINISHED',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
} as Match;

describe('ScoreModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the backend reason when score update is rejected', async () => {
    const backendMessage =
      'Trận đấu đã kết thúc nên không thể cập nhật tỉ số. Hãy mở lại trạng thái trận đấu trước khi chỉnh sửa tỉ số.';
    mockMatchApi.apiUpdateMatch.mockRejectedValueOnce({
      response: { data: { message: backendMessage } },
    });

    render(<ScoreModal match={match} open onCancel={vi.fn()} onSuccess={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Lưu' }));

    await waitFor(() => {
      expect(mockMessage.error).toHaveBeenCalledWith(backendMessage);
    });
  });
});

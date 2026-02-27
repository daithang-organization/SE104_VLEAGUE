import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockApi = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}));

vi.mock('../../lib/api', () => ({ api: mockApi }));

import { apiGetSchedule, apiGenerateSchedule, apiPublishSchedule } from '../scheduleApi';

describe('scheduleApi', () => {
  beforeEach(() => vi.clearAllMocks());

  it('apiGetSchedule calls GET /schedule with seasonId', async () => {
    const data = { ok: true, matches: [{ id: 'm1' }] };
    mockApi.get.mockResolvedValue({ data });
    const result = await apiGetSchedule('s1');
    expect(mockApi.get).toHaveBeenCalledWith('/schedule', { params: { seasonId: 's1' } });
    expect(result).toEqual(data);
  });

  it('apiGetSchedule calls GET /schedule without seasonId', async () => {
    mockApi.get.mockResolvedValue({ data: { ok: true, matches: [] } });
    await apiGetSchedule();
    expect(mockApi.get).toHaveBeenCalledWith('/schedule', { params: {} });
  });

  it('apiGenerateSchedule calls POST /schedule/generate', async () => {
    const data = { ok: true, message: 'generated', totalMatches: 30 };
    mockApi.post.mockResolvedValue({ data });
    const result = await apiGenerateSchedule('s1');
    expect(mockApi.post).toHaveBeenCalledWith(
      '/schedule/generate',
      {},
      { params: { seasonId: 's1' } },
    );
    expect(result.totalMatches).toBe(30);
  });

  it('apiPublishSchedule calls POST /schedule/publish', async () => {
    const data = { ok: true, message: 'published' };
    mockApi.post.mockResolvedValue({ data });
    const result = await apiPublishSchedule('s1');
    expect(mockApi.post).toHaveBeenCalledWith(
      '/schedule/publish',
      {},
      { params: { seasonId: 's1' } },
    );
    expect(result.ok).toBe(true);
  });
});

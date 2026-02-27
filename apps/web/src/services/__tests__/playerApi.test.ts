import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockApi = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('../../lib/api', () => ({ api: mockApi }));

import {
  apiGetPlayers,
  apiGetPlayer,
  apiCreatePlayer,
  apiUpdatePlayer,
  apiDeletePlayer,
  apiImportPlayersCsv,
} from '../playerApi';

describe('playerApi', () => {
  beforeEach(() => vi.clearAllMocks());

  it('apiGetPlayers calls GET /players with params', async () => {
    const data = { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
    mockApi.get.mockResolvedValue({ data });

    const result = await apiGetPlayers(1, 20, { search: 'hai', position: 'MF', teamId: 't1' });
    expect(mockApi.get).toHaveBeenCalledWith('/players', {
      params: { page: 1, limit: 20, search: 'hai', position: 'MF', teamId: 't1' },
    });
    expect(result).toEqual(data);
  });

  it('apiGetPlayers uses defaults', async () => {
    mockApi.get.mockResolvedValue({ data: { data: [] } });
    await apiGetPlayers();
    expect(mockApi.get).toHaveBeenCalledWith('/players', { params: { page: 1, limit: 20 } });
  });

  it('apiGetPlayer calls GET /players/:id', async () => {
    const player = { id: 'p1', fullName: 'Quang Hải' };
    mockApi.get.mockResolvedValue({ data: player });
    const result = await apiGetPlayer('p1');
    expect(mockApi.get).toHaveBeenCalledWith('/players/p1');
    expect(result).toEqual(player);
  });

  it('apiCreatePlayer calls POST /players', async () => {
    const player = { id: 'p1', fullName: 'New Player' };
    mockApi.post.mockResolvedValue({ data: player });
    const payload = {
      fullName: 'New Player',
      dob: '2000-01-01',
      nationality: 'Vietnam',
      position: 'FW' as const,
    };
    const result = await apiCreatePlayer(payload);
    expect(mockApi.post).toHaveBeenCalledWith('/players', payload);
    expect(result).toEqual(player);
  });

  it('apiUpdatePlayer calls PATCH /players/:id', async () => {
    const player = { id: 'p1', fullName: 'Updated' };
    mockApi.patch.mockResolvedValue({ data: player });
    const result = await apiUpdatePlayer('p1', { fullName: 'Updated' });
    expect(mockApi.patch).toHaveBeenCalledWith('/players/p1', { fullName: 'Updated' });
    expect(result).toEqual(player);
  });

  it('apiDeletePlayer calls DELETE /players/:id', async () => {
    mockApi.delete.mockResolvedValue({ data: { success: true } });
    const result = await apiDeletePlayer('p1');
    expect(mockApi.delete).toHaveBeenCalledWith('/players/p1');
    expect(result.success).toBe(true);
  });

  it('apiImportPlayersCsv calls POST /players/import with FormData', async () => {
    const importResult = { imported: 5, errors: [], total: 5 };
    mockApi.post.mockResolvedValue({ data: importResult });

    const file = new File(['csv-content'], 'players.csv', { type: 'text/csv' });
    const result = await apiImportPlayersCsv(file);

    expect(mockApi.post).toHaveBeenCalledWith('/players/import', expect.any(FormData), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    expect(result.imported).toBe(5);
  });
});

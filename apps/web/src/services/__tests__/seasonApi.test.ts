import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockApi = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('../../lib/api', () => ({ api: mockApi }));

import {
  apiCreateSeason,
  apiDeleteSeason,
  apiGetCurrentSeason,
  apiGetSeason,
  apiGetSeasons,
  apiUpdateSeason,
  apiUpdateSeasonStatus,
} from '../seasonApi';

describe('seasonApi', () => {
  beforeEach(() => vi.clearAllMocks());

  it('apiGetSeasons calls GET /seasons', async () => {
    const seasons = [{ id: 's1', name: 'V.League 2026', year: 2026 }];
    mockApi.get.mockResolvedValue({ data: seasons });
    const result = await apiGetSeasons();
    expect(mockApi.get).toHaveBeenCalledWith('/seasons');
    expect(result).toEqual(seasons);
  });

  it('apiGetSeason calls GET /seasons/:id', async () => {
    const season = { id: 's1', name: 'V.League 2026' };
    mockApi.get.mockResolvedValue({ data: season });
    const result = await apiGetSeason('s1');
    expect(mockApi.get).toHaveBeenCalledWith('/seasons/s1');
    expect(result).toEqual(season);
  });

  it('apiGetCurrentSeason calls GET /seasons/current', async () => {
    const season = { id: 's1', name: 'V.League 2026', status: 'IN_PROGRESS' };
    mockApi.get.mockResolvedValue({ data: season });
    const result = await apiGetCurrentSeason();
    expect(mockApi.get).toHaveBeenCalledWith('/seasons/current');
    expect(result).toEqual(season);
  });

  it('apiCreateSeason calls POST /seasons', async () => {
    const season = { id: 's1', name: 'V.League 2027' };
    mockApi.post.mockResolvedValue({ data: season });
    const result = await apiCreateSeason({ name: 'V.League 2027', year: 2027 });
    expect(mockApi.post).toHaveBeenCalledWith('/seasons', { name: 'V.League 2027', year: 2027 });
    expect(result).toEqual(season);
  });

  it('apiUpdateSeason calls PATCH /seasons/:id', async () => {
    const season = { id: 's1', name: 'Updated' };
    mockApi.patch.mockResolvedValue({ data: season });
    const result = await apiUpdateSeason('s1', { name: 'Updated' });
    expect(mockApi.patch).toHaveBeenCalledWith('/seasons/s1', { name: 'Updated' });
    expect(result).toEqual(season);
  });

  it('apiDeleteSeason calls DELETE /seasons/:id', async () => {
    mockApi.delete.mockResolvedValue({ data: {} });
    await apiDeleteSeason('s1');
    expect(mockApi.delete).toHaveBeenCalledWith('/seasons/s1');
  });

  it('apiUpdateSeasonStatus calls PATCH /seasons/:id/status', async () => {
    const season = { id: 's1', status: 'IN_PROGRESS' };
    mockApi.patch.mockResolvedValue({ data: season });
    const result = await apiUpdateSeasonStatus('s1', 'IN_PROGRESS');
    expect(mockApi.patch).toHaveBeenCalledWith('/seasons/s1/status', { status: 'IN_PROGRESS' });
    expect(result).toEqual(season);
  });
});

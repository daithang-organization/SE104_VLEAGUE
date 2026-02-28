import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockApi = vi.hoisted(() => ({
  get: vi.fn(),
  put: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('../../lib/api', () => ({ api: mockApi }));

import {
  apiDeleteRegulation,
  apiGetRegulation,
  apiGetRegulations,
  apiSeedDefaultRegulations,
  apiUpsertRegulation,
} from '../regulationApi';

describe('regulationApi', () => {
  beforeEach(() => vi.clearAllMocks());

  it('apiGetRegulations calls GET /seasons/:id/regulations', async () => {
    const regs = [{ id: 'r1', key: 'MAX_ROSTER', value: '22' }];
    mockApi.get.mockResolvedValue({ data: regs });
    const result = await apiGetRegulations('s1');
    expect(mockApi.get).toHaveBeenCalledWith('/seasons/s1/regulations');
    expect(result).toEqual(regs);
  });

  it('apiGetRegulation calls GET /seasons/:id/regulations/:key', async () => {
    const reg = { id: 'r1', key: 'MAX_ROSTER', value: '22' };
    mockApi.get.mockResolvedValue({ data: reg });
    const result = await apiGetRegulation('s1', 'MAX_ROSTER');
    expect(mockApi.get).toHaveBeenCalledWith('/seasons/s1/regulations/MAX_ROSTER');
    expect(result).toEqual(reg);
  });

  it('apiUpsertRegulation calls PUT /seasons/:id/regulations', async () => {
    const reg = { id: 'r1', key: 'MAX_ROSTER', value: '25' };
    mockApi.put.mockResolvedValue({ data: reg });
    const result = await apiUpsertRegulation('s1', { key: 'MAX_ROSTER', value: '25' });
    expect(mockApi.put).toHaveBeenCalledWith('/seasons/s1/regulations', {
      key: 'MAX_ROSTER',
      value: '25',
    });
    expect(result).toEqual(reg);
  });

  it('apiDeleteRegulation calls DELETE /seasons/:id/regulations/:key', async () => {
    mockApi.delete.mockResolvedValue({ data: {} });
    await apiDeleteRegulation('s1', 'MAX_ROSTER');
    expect(mockApi.delete).toHaveBeenCalledWith('/seasons/s1/regulations/MAX_ROSTER');
  });

  it('apiSeedDefaultRegulations calls POST /seasons/:id/regulations/seed-defaults', async () => {
    const regs = [{ id: 'r1', key: 'MAX_ROSTER', value: '22' }];
    mockApi.post.mockResolvedValue({ data: regs });
    const result = await apiSeedDefaultRegulations('s1');
    expect(mockApi.post).toHaveBeenCalledWith('/seasons/s1/regulations/seed-defaults');
    expect(result).toEqual(regs);
  });
});

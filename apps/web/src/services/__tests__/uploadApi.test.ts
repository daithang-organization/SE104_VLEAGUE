import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockApi = vi.hoisted(() => ({
  post: vi.fn(),
}));

vi.mock('../../lib/api', () => ({ api: mockApi }));

import { apiUploadImage } from '../uploadApi';

describe('uploadApi', () => {
  beforeEach(() => vi.clearAllMocks());

  it('apiUploadImage calls POST /upload/image with FormData', async () => {
    const response = { url: '/uploads/test.jpg', filename: 'test.jpg' };
    mockApi.post.mockResolvedValue({ data: response });

    const file = new File(['image-data'], 'test.jpg', { type: 'image/jpeg' });
    const result = await apiUploadImage(file);

    expect(mockApi.post).toHaveBeenCalledWith('/upload/image', expect.any(FormData), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    expect(result).toEqual(response);
  });

  it('apiUploadImage sends file in FormData with key "file"', async () => {
    mockApi.post.mockResolvedValue({ data: { url: '/uploads/a.png', filename: 'a.png' } });

    const file = new File(['data'], 'a.png', { type: 'image/png' });
    await apiUploadImage(file);

    const formData = mockApi.post.mock.calls[0][1] as FormData;
    expect(formData.get('file')).toBeInstanceOf(File);
    expect((formData.get('file') as File).name).toBe('a.png');
  });
});

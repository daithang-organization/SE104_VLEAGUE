import { describe, expect, it } from 'vitest';
import { getApiErrorMessage } from './apiError';

describe('getApiErrorMessage', () => {
  it('extracts backend error messages from axios-style responses', () => {
    const error = {
      response: {
        data: {
          message:
            'Trận đấu đã kết thúc nên không thể cập nhật tỉ số. Hãy mở lại trạng thái trận đấu trước khi chỉnh sửa tỉ số.',
        },
      },
    };

    expect(getApiErrorMessage(error)).toBe(
      'Trận đấu đã kết thúc nên không thể cập nhật tỉ số. Hãy mở lại trạng thái trận đấu trước khi chỉnh sửa tỉ số.',
    );
  });

  it('returns undefined when the backend message is not available', () => {
    expect(getApiErrorMessage(new Error('Network error'))).toBeUndefined();
  });
});

import { message } from 'antd';

const STORAGE_KEY = 'vleague_access_token';

function getToken() {
  return localStorage.getItem(STORAGE_KEY);
}

function removeToken() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem('vleague_refresh_token');
  localStorage.removeItem('vleague_user');
}

export interface ApiError {
  code?: string;
  message: string;
  statusCode?: number;
}

/**
 * Parse error response from API
 */
async function parseErrorResponse(res: Response): Promise<ApiError> {
  try {
    const data = await res.json();
    return {
      code: data.code || `HTTP_${res.status}`,
      message: data.message || `HTTP Error ${res.status}`,
      statusCode: res.status,
    };
  } catch (_err) {
    return {
      code: `HTTP_${res.status}`,
      message: res.statusText || `HTTP Error ${res.status}`,
      statusCode: res.status,
    };
  }
}

/**
 * Enhanced HTTP client with error handling and toast notifications
 */
export async function http<T>(
  path: string,
  options: RequestInit = {},
  showErrorToast = true,
): Promise<T> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL as string;

  const token = getToken();
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  try {
    const res = await fetch(`${baseUrl}${path}`, { ...options, headers });

    if (!res.ok) {
      const error = await parseErrorResponse(res);

      // Handle unauthorized - auto logout
      if (res.status === 401) {
        removeToken();
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          window.location.href = '/login';
        }
      }

      // Handle forbidden
      if (res.status === 403) {
        if (showErrorToast) {
          message.error('Bạn không có quyền thực hiện thao tác này.');
        }
      }

      // Handle rate limiting
      if (res.status === 429) {
        if (showErrorToast) {
          message.warning('Quá nhiều yêu cầu. Vui lòng thử lại sau.');
        }
      }

      // Handle server errors
      if (res.status >= 500) {
        if (showErrorToast) {
          message.error('Lỗi máy chủ. Vui lòng thử lại sau.');
        }
      }

      // Generic error toast for other errors
      if (
        showErrorToast &&
        res.status >= 400 &&
        res.status < 500 &&
        res.status !== 401 &&
        res.status !== 403 &&
        res.status !== 429
      ) {
        message.error(error.message);
      }

      throw error;
    }

    // Handle empty response
    const contentType = res.headers.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      return {} as T;
    }

    return (await res.json()) as T;
  } catch (error) {
    // Network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      if (showErrorToast) {
        message.error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
      }
      throw {
        code: 'NETWORK_ERROR',
        message: 'Network error',
        statusCode: 0,
      };
    }
    throw error;
  }
}

/**
 * HTTP methods shortcuts
 */
export const api = {
  get: <T>(path: string, showErrorToast = true) => http<T>(path, { method: 'GET' }, showErrorToast),

  post: <T>(path: string, body?: unknown, showErrorToast = true) =>
    http<T>(path, { method: 'POST', body: JSON.stringify(body) }, showErrorToast),

  put: <T>(path: string, body?: unknown, showErrorToast = true) =>
    http<T>(path, { method: 'PUT', body: JSON.stringify(body) }, showErrorToast),

  patch: <T>(path: string, body?: unknown, showErrorToast = true) =>
    http<T>(path, { method: 'PATCH', body: JSON.stringify(body) }, showErrorToast),

  delete: <T>(path: string, showErrorToast = true) =>
    http<T>(path, { method: 'DELETE' }, showErrorToast),
};

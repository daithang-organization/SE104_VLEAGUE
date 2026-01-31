import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

// Server URL from env, /api prefix is hardcoded as it's an implementation detail
const serverURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const baseURL = `${serverURL}/api`;

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// In-memory access token (never stored in localStorage)
let accessTokenMem: string | null = null;

export function setAccessToken(token: string | null) {
  accessTokenMem = token;
}

export function getAccessToken() {
  return accessTokenMem;
}

// Refresh token in localStorage for session persistence across reloads
export function getRefreshToken() {
  return localStorage.getItem('refreshToken');
}

export function setRefreshToken(token: string | null) {
  if (!token) {
    localStorage.removeItem('refreshToken');
  } else {
    localStorage.setItem('refreshToken', token);
  }
}

// Attach access token to every request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Token refresh state
let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

function flushQueue(token: string | null) {
  pendingQueue.forEach((cb) => cb(token));
  pendingQueue = [];
}

// Response interceptor: handle 401 with token refresh
api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const original = err.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = err.response?.status;

    // Only handle 401 for non-auth endpoints
    const isAuthCall = original?.url?.includes('/auth/');
    if (status !== 401 || original?._retry || isAuthCall) {
      return Promise.reject(err);
    }

    original._retry = true;

    const rt = getRefreshToken();
    if (!rt) {
      // No refresh token => session expired
      window.dispatchEvent(new Event('auth:expired'));
      return Promise.reject(err);
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push((token) => {
          if (!token) return reject(err);
          original.headers.Authorization = `Bearer ${token}`;
          resolve(api(original));
        });
      });
    }

    isRefreshing = true;

    try {
      const response = await axios.post(`${baseURL}/auth/refresh`, { refreshToken: rt });
      const newAccessToken = response.data.accessToken as string;

      setAccessToken(newAccessToken);
      flushQueue(newAccessToken);

      original.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(original);
    } catch (refreshError) {
      // Refresh failed => clear session
      setAccessToken(null);
      setRefreshToken(null);
      flushQueue(null);
      window.dispatchEvent(new Event('auth:expired'));
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

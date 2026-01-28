const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export async function apiLogin(username: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json() as Promise<{
    accessToken: string;
    tokenType: string;
    expiresIn: number;
  }>;
}

export async function apiRefresh() {
  const res = await fetch(`${API_BASE}/auth/refresh`, { method: 'POST' });
  if (!res.ok) throw new Error('Refresh failed');
  return res.json() as Promise<{
    accessToken: string;
    tokenType: string;
    expiresIn: number;
  }>;
}

export async function apiLogout() {
  const res = await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
  if (!res.ok) throw new Error('Logout failed');
  return res.json() as Promise<{ ok: boolean }>;
}

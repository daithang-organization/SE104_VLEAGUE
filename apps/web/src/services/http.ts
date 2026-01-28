const STORAGE_KEY = 'vleague_access_token';

function getToken() {
  return localStorage.getItem(STORAGE_KEY);
}

export async function http<T>(path: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL as string;

  const token = getToken();
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${baseUrl}${path}`, { ...options, headers });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  return (await res.json()) as T;
}

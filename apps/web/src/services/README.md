# Services Directory

Thư mục chứa các API services và HTTP client utilities.

## Mục đích

Centralize tất cả API calls và HTTP configurations:
- HTTP client setup (axios/fetch)
- API endpoints organization
- Request/response interceptors
- Error handling
- Type-safe API calls

## Cấu trúc

```
services/
├── http.ts         # HTTP client configuration
└── authApi.ts      # Authentication API calls
```

## Files

### `http.ts`
HTTP client configuration và setup.

**Chức năng:**
- Configure axios/fetch instance
- Base URL setup
- Request/response interceptors
- Default headers
- Timeout configuration
- Error handling

**Typical Implementation:**
```typescript
import axios from 'axios';

// Create axios instance
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
http.interceptors.request.use(
  (config) => {
    // Add auth token to headers
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
http.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }

    if (error.response?.status === 500) {
      // Server error
      console.error('Server error:', error);
    }

    return Promise.reject(error);
  }
);
```

**Features:**
- ✅ Centralized configuration
- ✅ Auto token injection
- ✅ Response data extraction
- ✅ Error handling
- ✅ Request/response logging (dev)
- ✅ Retry logic (optional)

---

### `authApi.ts`
Authentication-related API calls.

**Endpoints:**
- Login
- Logout
- Register (nếu có)
- Get current user
- Refresh token
- Validate token

**Typical Implementation:**
```typescript
import { http } from './http';
import type { LoginCredentials, AuthResponse, User } from '@/auth/auth.types';

export const authApi = {
  /**
   * Login user
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await http.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    await http.post('/auth/logout');
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await http.get<User>('/auth/profile');
    return response.data;
  },

  /**
   * Validate token
   */
  validateToken: async (token: string): Promise<User> => {
    const response = await http.get<User>('/auth/validate', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const response = await http.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  /**
   * Register new user (if applicable)
   */
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await http.post('/auth/register', userData);
    return response.data;
  },
};
```

## API Service Pattern

Mỗi API service nên follow pattern:

```typescript
// <feature>Api.ts
import { http } from './http';
import type { Feature, CreateFeatureDto, UpdateFeatureDto } from '@/types';

export const featureApi = {
  // GET all
  getAll: async (params?: QueryParams): Promise<Feature[]> => {
    return http.get('/features', { params });
  },

  // GET one
  getById: async (id: string): Promise<Feature> => {
    return http.get(`/features/${id}`);
  },

  // POST create
  create: async (data: CreateFeatureDto): Promise<Feature> => {
    return http.post('/features', data);
  },

  // PATCH update
  update: async (id: string, data: UpdateFeatureDto): Promise<Feature> => {
    return http.patch(`/features/${id}`, data);
  },

  // DELETE
  delete: async (id: string): Promise<void> => {
    return http.delete(`/features/${id}`);
  },
};
```

## Example API Services

### Teams API
```typescript
// teamsApi.ts
export const teamsApi = {
  getAll: (params?: { season?: string }) =>
    http.get('/teams', { params }),

  getById: (id: string) =>
    http.get(`/teams/${id}`),

  getPlayers: (teamId: string) =>
    http.get(`/teams/${teamId}/players`),

  getStats: (teamId: string, season?: string) =>
    http.get(`/teams/${teamId}/stats`, { params: { season } }),
};
```

### Matches API
```typescript
// matchesApi.ts
export const matchesApi = {
  getAll: (params?: MatchQueryParams) =>
    http.get('/matches', { params }),

  getById: (id: string) =>
    http.get(`/matches/${id}`),

  getEvents: (matchId: string) =>
    http.get(`/matches/${matchId}/events`),

  addEvent: (matchId: string, event: MatchEventDto) =>
    http.post(`/matches/${matchId}/events`, event),
};
```

### Standings API
```typescript
// standingsApi.ts
export const standingsApi = {
  getStandings: (season: string) =>
    http.get('/standings', { params: { season } }),

  getByRound: (season: string, round: number) =>
    http.get('/standings', { params: { season, round } }),
};
```

## Error Handling

### Custom Error Class
```typescript
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

### Error Interceptor
```typescript
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (response) {
      throw new ApiError(
        response.status,
        response.data.message || 'An error occurred',
        response.data.errors
      );
    }

    throw new ApiError(0, 'Network error');
  }
);
```

### Usage trong Components
```typescript
try {
  await authApi.login(credentials);
} catch (error) {
  if (error instanceof ApiError) {
    if (error.statusCode === 401) {
      setError('Invalid credentials');
    } else if (error.statusCode === 500) {
      setError('Server error, please try again');
    }
  }
}
```

## TypeScript Types

### Request/Response Types
```typescript
// types/api.ts
export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
```

## Request Cancellation

```typescript
// Using AbortController
export const searchTeams = (query: string, signal?: AbortSignal) => {
  return http.get('/teams/search', {
    params: { q: query },
    signal
  });
};

// Usage
const controller = new AbortController();

searchTeams('HAGL', controller.signal)
  .then(results => setResults(results))
  .catch(err => {
    if (err.name === 'AbortError') {
      console.log('Request cancelled');
    }
  });

// Cancel request
controller.abort();
```

## Caching Strategy

### Simple In-Memory Cache
```typescript
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getCachedData = async <T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> => {
  const cached = cache.get(key);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const data = await fetcher();
  cache.set(key, { data, timestamp: Date.now() });

  return data;
};

// Usage
const teams = await getCachedData('teams', () => teamsApi.getAll());
```

## File Upload

```typescript
export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await http.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.url;
};
```

## Environment Configuration

```typescript
// config.ts
const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
  enableLogging: import.meta.env.DEV,
};

export default config;
```

## Best Practices

- ✅ One API service file per resource/feature
- ✅ Use TypeScript types cho all API calls
- ✅ Centralize HTTP configuration
- ✅ Handle errors consistently
- ✅ Use environment variables cho URLs
- ✅ Implement request/response logging (dev only)
- ✅ Add timeout cho all requests
- ✅ Cache when appropriate
- ❌ Không hardcode URLs
- ❌ Không expose sensitive data trong logs
- ❌ Tránh duplicate API logic

## Testing

### Mock API Calls
```typescript
// __mocks__/authApi.ts
export const authApi = {
  login: jest.fn().mockResolvedValue({
    user: { id: '1', username: 'test' },
    accessToken: 'mock-token',
  }),
  logout: jest.fn().mockResolvedValue(undefined),
};
```

### MSW (Mock Service Worker)
```typescript
// mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.post('/auth/login', (req, res, ctx) => {
    return res(
      ctx.json({
        user: { id: '1', username: 'test' },
        accessToken: 'mock-token',
      })
    );
  }),
];
```

## Future Enhancements

- GraphQL client (nếu migrate sang GraphQL)
- WebSocket service cho real-time updates
- Offline support với Service Workers
- Request queueing
- Advanced caching với React Query/SWR

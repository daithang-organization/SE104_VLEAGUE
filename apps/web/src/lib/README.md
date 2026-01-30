# Lib Directory

Thư mục chứa các utility và service dùng chung cho toàn bộ ứng dụng.

## Mục đích

Cung cấp các module cơ sở hạ tầng (infrastructure) không phụ thuộc vào UI components, bao gồm:
- HTTP client configuration
- API interceptors
- Token management
- Các helper functions dùng chung

## Cấu trúc

```
lib/
└── api.ts    # Axios instance với interceptors cho authentication
```

## Files

### `api.ts`

Axios HTTP client được cấu hình sẵn cho VLeague API.

**Features:**
- Base URL từ environment variable `VITE_API_BASE_URL`
- Auto-attach `Authorization: Bearer <token>` header
- Auto-refresh token khi nhận 401 response
- Queue pending requests trong khi đang refresh
- Dispatch `auth:expired` event khi refresh fail

**Exports:**
```typescript
// Axios instance - dùng cho mọi API call
export const api: AxiosInstance;

// Token management functions
export function getAccessToken(): string | null;
export function setAccessToken(token: string | null): void;
export function getRefreshToken(): string | null;
export function setRefreshToken(token: string | null): void;
```

**Sử dụng:**
```typescript
import { api } from '@/lib/api';

// GET request
const { data } = await api.get('/teams');

// POST request
const { data } = await api.post('/teams', { name: 'New Team' });

// Token được tự động đính kèm, không cần xử lý thủ công
```

**Token Storage Strategy:**
| Token | Storage | Lý do |
|-------|---------|-------|
| `accessToken` | Memory (JS variable) | Bảo mật - không expose qua localStorage |
| `refreshToken` | localStorage | Persist session qua page reload |

**Auto-refresh Flow:**
```
Request → 401 Unauthorized
    ↓
Check refreshToken exists?
    ↓ Yes
POST /auth/refresh
    ↓ Success
Update accessToken → Retry original request
    ↓ Fail
Clear tokens → Dispatch 'auth:expired' event
```

## Best Practices

1. **Luôn dùng `api` instance** thay vì tạo axios mới
2. **Không lưu accessToken vào localStorage** - đã được quản lý trong memory
3. **Listen `auth:expired` event** để xử lý session timeout ở UI level

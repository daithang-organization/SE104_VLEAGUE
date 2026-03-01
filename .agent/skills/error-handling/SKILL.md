---
name: Error Handling
description: Backend exception handling, error codes, and frontend error patterns for SE104_VLEAGUE
---

# Error Handling Skill

## Backend Error Architecture

```
Controller → Service throws exception
  → HttpExceptionFilter catches
  → Unified JSON response
```

---

## Unified Error Response Shape

```json
{
  "statusCode": 400,
  "code": "AUTH_EMAIL_EXISTS",
  "message": "Email đã được đăng ký",
  "details": null,
  "requestId": "550e8400-...",
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

---

## HttpExceptionFilter (Global)

Located at `src/common/filters/http-exception.filter.ts`. Applied globally in `main.ts`.

Catches all `HttpException` instances and normalizes them to the unified shape. Extracts `code` from exception response when available.

---

## Structured Error Codes

Vietnamese user-facing messages with deterministic error codes:

| Code                       | Status | Description                   |
| -------------------------- | ------ | ----------------------------- |
| `AUTH_EMAIL_EXISTS`        | 409    | Email already registered      |
| `AUTH_OTP_INVALID`         | 400    | Invalid or expired OTP        |
| `AUTH_OTP_COOLDOWN`        | 429    | OTP resend cooldown (60s)     |
| `AUTH_REFRESH_INVALID`     | 401    | Invalid/expired refresh token |
| `AUTH_CREDENTIALS_INVALID` | 401    | Wrong email/password          |
| `AUTH_EMAIL_NOT_VERIFIED`  | 403    | Email not verified            |
| `AUTH_PASSWORD_SAME`       | 400    | New password same as current  |
| `VALIDATION_ERROR`         | 400    | DTO validation failed         |
| `NOT_FOUND`                | 404    | Resource not found            |
| `CONFLICT`                 | 409    | Duplicate resource            |
| `FORBIDDEN`                | 403    | Insufficient permissions      |

---

## Exception Usage in Services

```typescript
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';

// Not found
throw new NotFoundException('Đội bóng không tồn tại');

// Bad request with code
throw new BadRequestException({
  code: 'AUTH_OTP_INVALID',
  message: 'Mã OTP không hợp lệ hoặc đã hết hạn',
});

// Conflict
throw new ConflictException({
  code: 'AUTH_EMAIL_EXISTS',
  message: 'Email đã được đăng ký',
});
```

---

## Global ValidationPipe

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }),
);
```

Validation errors return:

```json
{
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": ["name must be a string", "email must be an email"],
  "timestamp": "..."
}
```

---

## Frontend Error Handling

### Axios Interceptor (`lib/api.ts`)

- **401**: Attempts token refresh → replays failed request
- **401 (refresh fails)**: Dispatches `auth:expired` event → clears auth state → redirects to login
- **429**: Dispatches `api:rate-limited` event → shows notification

### Legacy HTTP Client (`services/http.ts`)

- `fetch`-based wrapper with error handling and toast notifications
- **Not actively used** — all services use Axios via `lib/api.ts`

### ErrorBoundary Component

```typescript
// Catches runtime React errors
// Shows Ant Design Result component with error message
// Reports to Sentry in production
// Shows stack trace in development
```

### Per-Page Error Handling

Most pages use try/catch with `message.error()` from Ant Design:

```typescript
try {
  await apiCreateTeam(values);
  message.success('Tạo đội bóng thành công');
} catch (error: any) {
  message.error(error.response?.data?.message || 'Có lỗi xảy ra');
}
```

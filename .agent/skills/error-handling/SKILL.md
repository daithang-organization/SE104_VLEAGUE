---
name: Error Handling & Validation
description: Guide for error handling patterns, validation pipeline, and unified error responses in SE104_VLEAGUE
---

# Error Handling & Validation Skill

This skill consolidates all error handling and validation patterns used across the backend and frontend of the SE104_VLEAGUE project.

## Backend Error Architecture

```
Request → GlobalValidationPipe → Controller → Service → AppError thrown
                                                              ↓
                                              HttpExceptionFilter catches
                                                              ↓
                                              Unified JSON { code, message, details?, requestId, timestamp }
```

## AppError — Custom Error Class

All application-specific errors extend `AppError` (`src/common/errors/app-error.ts`):

```typescript
export class AppError extends HttpException {
  constructor(
    public readonly code: string, // Machine-readable code, e.g. "AUTH_INVALID_CREDENTIALS"
    message: string, // Human-readable message
    status: HttpStatus, // HTTP status code
    public readonly details?: ErrorDetails, // Optional field-level details
  ) {
    super({ code, message, details }, status);
  }
}
```

### Pre-defined Error Classes

| Error Class                | Code                         | HTTP Status | When to Use                   |
| -------------------------- | ---------------------------- | ----------- | ----------------------------- |
| `InvalidCredentialsError`  | `AUTH_INVALID_CREDENTIALS`   | 401         | Wrong email or password       |
| `InvalidRefreshTokenError` | `AUTH_INVALID_REFRESH_TOKEN` | 401         | Expired/revoked refresh token |
| `TokenExpiredError`        | `AUTH_TOKEN_EXPIRED`         | 401         | JWT access token expired      |
| `UserNotFoundError`        | `AUTH_USER_NOT_FOUND`        | 404         | User ID not in database       |
| `EmailAlreadyExistsError`  | `AUTH_EMAIL_EXISTS`          | 409         | Duplicate email registration  |

### Creating New Error Classes

```typescript
// src/common/errors/app-error.ts — add at bottom
export class TeamNotFoundError extends AppError {
  constructor(teamId: string) {
    super('TEAM_NOT_FOUND', `Team with ID ${teamId} not found`, HttpStatus.NOT_FOUND);
  }
}
```

> [!TIP]
> Always create a specific error class rather than throwing generic `HttpException`. This ensures consistent error codes across the API.

## HttpExceptionFilter — Global Error Handler

`src/common/filters/http-exception.filter.ts` catches **all** exceptions (not just `HttpException`):

### Unified Error Response Shape

```json
{
  "code": "AUTH_INVALID_CREDENTIALS",
  "message": "Invalid email or password",
  "details": null,
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-02-17T12:00:00.000Z"
}
```

### How Exceptions Are Mapped

| Exception Type           | Behavior                                               |
| ------------------------ | ------------------------------------------------------ |
| `AppError` subclass      | Uses `code`, `message`, `details` from the error       |
| Validation error (array) | `code: "VALIDATION_ERROR"`, details = field messages   |
| Generic `HttpException`  | Maps HTTP status → code (400→`BAD_REQUEST`, etc.)      |
| Unhandled `Error`        | `code: "INTERNAL_ERROR"`, message hidden in production |

### Status Code → Error Code Mapping

```typescript
400 → 'BAD_REQUEST'
401 → 'UNAUTHORIZED'
403 → 'FORBIDDEN'
404 → 'NOT_FOUND'
409 → 'CONFLICT'
422 → 'UNPROCESSABLE_ENTITY'
500 → 'INTERNAL_ERROR'
```

## Global Validation Pipe

Configured in `main.ts`, the `ValidationPipe` automatically validates **all** incoming request bodies against their DTO class decorators:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // Remove unknown properties
    forbidNonWhitelisted: true, // Throw if unknown properties sent
    transform: true, // Auto-transform to DTO class instances
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
);
```

### Validation Decorators (class-validator)

```typescript
// Example DTO
import { IsString, IsEnum, IsOptional, MinLength } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEnum(TeamStatus)
  @IsOptional()
  status?: TeamStatus;
}
```

When validation fails, `HttpExceptionFilter` transforms it to:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Dữ liệu không hợp lệ",
  "details": [
    "name must be longer than or equal to 2 characters",
    "status must be one of: ACTIVE, INACTIVE"
  ]
}
```

## Frontend Error Handling

### Primary HTTP Client — `lib/api.ts` (Axios)

Token refresh and error handling via Axios interceptors:

```typescript
// Response interceptor — handles 401 with token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Attempt silent token refresh → retry original request
    }
    return Promise.reject(error);
  },
);
```

### Legacy HTTP Client — `services/http.ts` (Fetch)

Status-specific error toasts (Vietnamese):

| HTTP Status | Toast Message                               |
| ----------- | ------------------------------------------- |
| 401         | "Phiên đăng nhập đã hết hạn" + redirect     |
| 403         | "Bạn không có quyền thực hiện thao tác này" |
| 429         | "Quá nhiều yêu cầu. Vui lòng thử lại sau"   |
| 500+        | "Lỗi máy chủ. Vui lòng thử lại sau"         |
| Network     | "Không thể kết nối đến máy chủ"             |

### ErrorBoundary Component

`src/components/ErrorBoundary.tsx` wraps the app to catch React rendering errors and display a fallback UI instead of crashing.

## Best Practices

> [!IMPORTANT]
>
> - Always use `AppError` subclasses for business logic errors
> - Never expose stack traces or internal details in production
> - Use DTO + class-validator for all user input — never validate manually in services
> - Frontend should handle error codes (`code` field) for i18n-ready error messages

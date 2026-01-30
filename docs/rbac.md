# RBAC – Sprint 1 Permission Matrix

## Roles

| Role | Description |
|------|-------------|
| `ADMIN` | Quản trị hệ thống - toàn quyền |
| `TEAM_MANAGER` | Quản lý đội bóng - chỉ đọc thông tin teams (Sprint 1) |
| `REFEREE` | Trọng tài - nhập kết quả trận đấu |

## JWT Authentication

- Tất cả protected APIs yêu cầu header: `Authorization: Bearer <accessToken>`
- Access token hết hạn → `401 Unauthorized` với `code: AUTH_TOKEN_EXPIRED`
- Token không hợp lệ → `401 Unauthorized` với `code: AUTH_INVALID_TOKEN`
- Thiếu token → `401 Unauthorized` với `code: AUTH_UNAUTHORIZED`

## Permission Matrix

| Feature / Endpoint | ADMIN | TEAM_MANAGER | REFEREE |
|---|:---:|:---:|:---:|
| **Teams** | | | |
| `GET /teams` | ✅ | ✅ | ❌ |
| `GET /teams/:id` | ✅ | ✅ | ❌ |
| `POST /teams` | ✅ | ❌ | ❌ |
| `PATCH /teams/:id` | ✅ | ❌ | ❌ |
| `DELETE /teams/:id` | ✅ | ❌ | ❌ |
| **Schedule** | | | |
| `GET /schedule` | ✅ | ✅ | ✅ |
| `POST /schedule/generate` | ✅ | ❌ | ❌ |
| `POST /schedule/publish` | ✅ | ❌ | ❌ |
| **Match** | | | |
| `GET /matches/:id` | ✅ | ✅ | ✅ |
| `POST /matches/:id/events` | ✅ | ❌ | ✅ |

## HTTP Status Codes

| Status | Code | Description |
|--------|------|-------------|
| `401` | `AUTH_UNAUTHORIZED` | Thiếu hoặc không có token |
| `401` | `AUTH_TOKEN_EXPIRED` | Token đã hết hạn |
| `401` | `AUTH_INVALID_TOKEN` | Token không hợp lệ |
| `403` | `AUTH_FORBIDDEN` | Token hợp lệ nhưng không đủ quyền |

## Error Response Format

```json
{
  "code": "AUTH_FORBIDDEN",
  "message": "Insufficient permissions",
  "details": {
    "requiredRoles": ["ADMIN"],
    "currentRole": "TEAM_MANAGER"
  }
}
```

## Quick Test Checklist

1. ❌ No token → `POST /schedule/generate` → `401`
2. ❌ Token `TEAM_MANAGER` → `POST /schedule/generate` → `403`
3. ✅ Token `REFEREE` → `POST /matches/:id/events` → `200`
4. ❌ Token `REFEREE` → `DELETE /teams/:id` → `403`
5. ✅ Token `ADMIN` → tất cả routes → `200`

## Implementation

### Guards Order

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
```

1. `JwtAuthGuard` chạy trước: xác thực JWT, trả 401 nếu fail
2. `RolesGuard` chạy sau: kiểm tra role, trả 403 nếu không đủ quyền

### Usage Example

```typescript
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard, Roles, Role } from '../auth';

@Controller('teams')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeamsController {
  @Get()
  @Roles(Role.ADMIN, Role.TEAM_MANAGER)
  findAll() {}

  @Post()
  @Roles(Role.ADMIN)
  create() {}
}
```

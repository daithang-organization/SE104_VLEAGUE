# RBAC – Permission Matrix

> Cập nhật: v1.1.0 — đồng bộ với source code thực tế.

## Roles

| Role           | Description                                                    |
| -------------- | -------------------------------------------------------------- |
| `ADMIN`        | Quản trị hệ thống — toàn quyền                                 |
| `TEAM_MANAGER` | Quản lý đội bóng — quản lý thông tin đội, cầu thủ, roster      |
| `REFEREE`      | Trọng tài — nhập sự kiện trận đấu                              |
| `SUPERVISOR`   | Giám sát — xem lịch, trận đấu (qua @Roles)                     |
| `PUBLIC`       | Vai trò công khai — truy cập qua @Roles (xem matches/schedule) |

## JWT Authentication

- Tất cả protected APIs yêu cầu header: `Authorization: Bearer <accessToken>`
- Access token hết hạn → `401 Unauthorized` với `code: AUTH_TOKEN_EXPIRED`
- Token không hợp lệ → `401 Unauthorized` với `code: AUTH_INVALID_TOKEN`
- Thiếu token → `401 Unauthorized` với `code: AUTH_UNAUTHORIZED`

## Guard Patterns

Có 3 mức bảo vệ trong codebase:

| Pattern                                  | Mô tả                                      |
| ---------------------------------------- | ------------------------------------------ |
| **No guard**                             | Endpoint hoàn toàn public, không cần token |
| **JwtAuthGuard**                         | Chỉ cần đăng nhập (bất kỳ role nào)        |
| **JwtAuthGuard + RolesGuard + @Roles()** | Cần đăng nhập + đúng role                  |

## Permission Matrix

### Authentication (`/auth`) — Không có class-level guard

| Endpoint                           | Guard        | Roles             |
| ---------------------------------- | ------------ | ----------------- |
| `POST /auth/register`              | None         | Public            |
| `POST /auth/verify-email`          | None         | Public            |
| `POST /auth/resend-otp`            | None         | Public            |
| `POST /auth/forgot-password`       | None         | Public            |
| `POST /auth/reset-password`        | None         | Public            |
| `POST /auth/login`                 | None         | Public            |
| `POST /auth/refresh`               | None         | Public            |
| `POST /auth/logout`                | None         | Public            |
| `GET /auth/me`                     | JwtAuth      | Any authenticated |
| `POST /auth/change-password`       | JwtAuth      | Any authenticated |
| `POST /auth/logout-all`            | JwtAuth      | Any authenticated |
| `PATCH /auth/profile`              | JwtAuth      | Any authenticated |
| `GET /auth/sessions`               | JwtAuth      | Any authenticated |
| `DELETE /auth/sessions/:sessionId` | JwtAuth      | Any authenticated |
| `POST /auth/set-password`          | JwtAuth      | Any authenticated |
| `GET /auth/google`                 | GoogleAuth   | OAuth redirect    |
| `GET /auth/google/callback`        | GoogleAuth   | OAuth callback    |
| `GET /auth/facebook`               | FacebookAuth | OAuth redirect    |
| `GET /auth/facebook/callback`      | FacebookAuth | OAuth callback    |

### Teams (`/teams`) — Không có class-level guard

| Endpoint            | Guard         | Roles  |
| ------------------- | ------------- | ------ |
| `GET /teams`        | None          | Public |
| `GET /teams/:id`    | None          | Public |
| `POST /teams`       | JwtAuth+Roles | ADMIN  |
| `PATCH /teams/:id`  | JwtAuth+Roles | ADMIN  |
| `DELETE /teams/:id` | JwtAuth+Roles | ADMIN  |

### Players (`/players`) — Không có class-level guard

| Endpoint               | Guard         | Roles               |
| ---------------------- | ------------- | ------------------- |
| `GET /players`         | None          | Public              |
| `GET /players/:id`     | None          | Public              |
| `POST /players`        | JwtAuth+Roles | ADMIN, TEAM_MANAGER |
| `PATCH /players/:id`   | JwtAuth+Roles | ADMIN, TEAM_MANAGER |
| `DELETE /players/:id`  | JwtAuth+Roles | ADMIN, TEAM_MANAGER |
| `POST /players/import` | JwtAuth+Roles | ADMIN               |

### Seasons (`/seasons`) — Không có class-level guard

| Endpoint                    | Guard         | Roles  |
| --------------------------- | ------------- | ------ |
| `GET /seasons`              | None          | Public |
| `GET /seasons/current`      | None          | Public |
| `GET /seasons/:id`          | None          | Public |
| `POST /seasons`             | JwtAuth+Roles | ADMIN  |
| `PATCH /seasons/:id`        | JwtAuth+Roles | ADMIN  |
| `DELETE /seasons/:id`       | JwtAuth+Roles | ADMIN  |
| `PATCH /seasons/:id/status` | JwtAuth+Roles | ADMIN  |

### Season Teams (`/seasons/:seasonId/teams`) — Không có class-level guard

| Endpoint                                | Guard         | Roles  |
| --------------------------------------- | ------------- | ------ |
| `GET /seasons/:sId/teams`               | None          | Public |
| `POST /seasons/:sId/teams`              | JwtAuth+Roles | ADMIN  |
| `PATCH /seasons/:sId/teams/:tId/status` | JwtAuth+Roles | ADMIN  |
| `DELETE /seasons/:sId/teams/:tId`       | JwtAuth+Roles | ADMIN  |

### Stadiums (`/stadiums`) — Không có class-level guard

| Endpoint               | Guard         | Roles  |
| ---------------------- | ------------- | ------ |
| `GET /stadiums`        | None          | Public |
| `GET /stadiums/:id`    | None          | Public |
| `POST /stadiums`       | JwtAuth+Roles | ADMIN  |
| `PATCH /stadiums/:id`  | JwtAuth+Roles | ADMIN  |
| `DELETE /stadiums/:id` | JwtAuth+Roles | ADMIN  |

### Scheduling — **Class-level** `@UseGuards(JwtAuth, Roles)`

| Endpoint                  | Guard         | Roles                       |
| ------------------------- | ------------- | --------------------------- |
| `POST /schedule/generate` | JwtAuth+Roles | ADMIN                       |
| `POST /schedule/publish`  | JwtAuth+Roles | ADMIN                       |
| `GET /schedule`           | JwtAuth+Roles | ADMIN, TM, REF, SUP, PUBLIC |

### Matches (`/matches`) — **Class-level** `@UseGuards(JwtAuth, Roles)`

| Endpoint                    | Guard         | Roles                       |
| --------------------------- | ------------- | --------------------------- |
| `GET /matches`              | JwtAuth+Roles | ADMIN, TM, REF, SUP, PUBLIC |
| `GET /matches/:id`          | JwtAuth+Roles | ADMIN, TM, REF, SUP, PUBLIC |
| `POST /matches/:id/events`  | JwtAuth+Roles | ADMIN, REFEREE              |
| `PATCH /matches/:id`        | JwtAuth+Roles | ADMIN                       |
| `PATCH /matches/:id/status` | JwtAuth+Roles | ADMIN                       |

### Standings (`/standings`) — Không có guard

| Endpoint                     | Guard | Roles  |
| ---------------------------- | ----- | ------ |
| `GET /standings`             | None  | Public |
| `GET /standings/:seasonId`   | None  | Public |
| `GET /standings/top-scorers` | None  | Public |
| `GET /standings/card-stats`  | None  | Public |
| `GET /standings/team-stats`  | None  | Public |

### Roster (`/teams/:teamId/roster`) — Không có class-level guard

| Endpoint                         | Guard         | Roles               |
| -------------------------------- | ------------- | ------------------- |
| `GET /teams/:tId/roster`         | None          | Public              |
| `POST /teams/:tId/roster`        | JwtAuth+Roles | ADMIN, TEAM_MANAGER |
| `PATCH /teams/:tId/roster/:pId`  | JwtAuth+Roles | ADMIN, TEAM_MANAGER |
| `DELETE /teams/:tId/roster/:pId` | JwtAuth+Roles | ADMIN, TEAM_MANAGER |

### Regulations (`/seasons/:seasonId/regulations`) — Không có class-level guard

| Endpoint                                       | Guard         | Roles  |
| ---------------------------------------------- | ------------- | ------ |
| `GET /seasons/:sId/regulations`                | None          | Public |
| `GET /seasons/:sId/regulations/:key`           | None          | Public |
| `PUT /seasons/:sId/regulations`                | JwtAuth+Roles | ADMIN  |
| `DELETE /seasons/:sId/regulations/:key`        | JwtAuth+Roles | ADMIN  |
| `POST /seasons/:sId/regulations/seed-defaults` | JwtAuth+Roles | ADMIN  |

### Users (`/users`) — **Class-level** `@UseGuards(JwtAuth, Roles)` + `@Roles(ADMIN)`

| Endpoint                | Guard         | Roles |
| ----------------------- | ------------- | ----- |
| `GET /users`            | JwtAuth+Roles | ADMIN |
| `POST /users`           | JwtAuth+Roles | ADMIN |
| `PATCH /users/:id/role` | JwtAuth+Roles | ADMIN |
| `DELETE /users/:id`     | JwtAuth+Roles | ADMIN |

### Upload (`/upload`) — Guard trên method

| Endpoint             | Guard         | Roles               |
| -------------------- | ------------- | ------------------- |
| `POST /upload/image` | JwtAuth+Roles | ADMIN, TEAM_MANAGER |

### Health (`/health`) — Không có guard

| Endpoint      | Guard | Roles  |
| ------------- | ----- | ------ |
| `GET /health` | None  | Public |

## Role Summary

| Role             | Quyền chính                                                                                                            |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **ADMIN**        | Toàn quyền trên tất cả 74 endpoints                                                                                    |
| **TEAM_MANAGER** | CRUD players, roster, upload ảnh; xem matches/schedule                                                                 |
| **REFEREE**      | Thêm sự kiện trận đấu; xem matches/schedule                                                                            |
| **SUPERVISOR**   | Xem matches/schedule (qua @Roles)                                                                                      |
| **PUBLIC**       | Xem matches/schedule (qua @Roles); không cần token cho GET teams/players/seasons/stadiums/standings/regulations/roster |

## HTTP Status Codes

| Status | Code                 | Description                       |
| ------ | -------------------- | --------------------------------- |
| `401`  | `AUTH_UNAUTHORIZED`  | Thiếu hoặc không có token         |
| `401`  | `AUTH_TOKEN_EXPIRED` | Token đã hết hạn                  |
| `401`  | `AUTH_INVALID_TOKEN` | Token không hợp lệ                |
| `403`  | `AUTH_FORBIDDEN`     | Token hợp lệ nhưng không đủ quyền |

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
5. ✅ No token → `GET /teams` → `200` (public, no guard)
6. ❌ Token `SUPERVISOR` → `POST /teams` → `403`
7. ✅ Token `ADMIN` → tất cả routes → `200`
8. ✅ Token `TEAM_MANAGER` → `POST /players` → `200`
9. ❌ Token `TEAM_MANAGER` → `POST /players/import` → `403`

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
export class TeamsController {
  @Get()
  // Không có guard → public endpoint
  findAll() {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create() {}
}
```

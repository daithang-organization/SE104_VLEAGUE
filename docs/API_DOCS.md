# V-League API Documentation

> **Version:** 1.0.0  
> **Base URL:** `http://localhost:3000/api`  
> **Last Updated:** January 30, 2026

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [Auth](#auth)
  - [Teams](#teams)
  - [Players](#players)
  - [Matches](#matches)
  - [Scheduling](#scheduling)

---

## Overview

V-League API cung cấp các endpoint để quản lý giải bóng đá V-League, bao gồm:
- Xác thực người dùng (Authentication)
- Quản lý đội bóng (Teams)
- Quản lý cầu thủ (Players)
- Quản lý trận đấu (Matches)
- Lập lịch thi đấu (Scheduling)

### Tech Stack
- **Framework:** NestJS
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (JSON Web Tokens)

---

## Authentication

API sử dụng JWT (JSON Web Token) để xác thực. Có hai loại token:

| Token Type | Lifetime | Mục đích |
|------------|----------|----------|
| Access Token | 15 phút | Xác thực các request |
| Refresh Token | 7 ngày | Lấy access token mới |

### User Roles

| Role | Mô tả |
|------|-------|
| `ADMIN` | Quản trị viên hệ thống - có toàn quyền |
| `TEAM_MANAGER` | Quản lý đội bóng |
| `REFEREE` | Trọng tài - có quyền cập nhật sự kiện trận đấu |
| `SUPERVISOR` | Giám sát viên |
| `PUBLIC` | Người dùng công khai |

### Authorization Header

```http
Authorization: Bearer <access_token>
```

---

## Error Handling

### Error Response Format

```json
{
  "code": "ERROR_CODE",
  "message": "Mô tả lỗi bằng tiếng Việt",
  "statusCode": 400
}
```

### Common Error Codes

| Code | HTTP Status | Mô tả |
|------|-------------|-------|
| `AUTH_INVALID_CREDENTIALS` | 401 | Email hoặc mật khẩu không đúng |
| `AUTH_REFRESH_INVALID` | 401 | Refresh token không hợp lệ hoặc đã hết hạn |
| `AUTH_ACCESS_DENIED` | 403 | Không có quyền truy cập |
| `NOT_FOUND` | 404 | Không tìm thấy tài nguyên |
| `VALIDATION_ERROR` | 400 | Dữ liệu đầu vào không hợp lệ |

---

## Endpoints

---

## Auth

### POST /auth/login

Đăng nhập và nhận JWT tokens.

**Authentication:** Không yêu cầu

**Request Body:**

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `email` | string | ✅ | Valid email format | Email đăng nhập |
| `password` | string | ✅ | Min 6 characters | Mật khẩu |

**Example Request:**

```json
{
  "email": "admin@vleague.local",
  "password": "Admin@12345"
}
```

**Success Response (200 OK):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@vleague.local",
    "role": "ADMIN"
  }
}
```

**Error Response (401 Unauthorized):**

```json
{
  "code": "AUTH_INVALID_CREDENTIALS",
  "message": "Email hoặc mật khẩu không đúng"
}
```

---

### POST /auth/refresh

Làm mới access token bằng refresh token.

**Authentication:** Không yêu cầu

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `refreshToken` | string | ✅ | Refresh token đã nhận khi login |

**Example Request:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200 OK):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (401 Unauthorized):**

```json
{
  "code": "AUTH_REFRESH_INVALID",
  "message": "Refresh token không hợp lệ hoặc đã hết hạn"
}
```

---

### POST /auth/logout

Đăng xuất và vô hiệu hóa refresh token.

**Authentication:** Không yêu cầu

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `refreshToken` | string | ✅ | Refresh token cần vô hiệu hóa |

**Example Request:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200 OK):**

```json
{
  "success": true
}
```

---

## Teams

### GET /teams

Lấy danh sách tất cả đội bóng.

**Authentication:** ✅ Required  
**Allowed Roles:** `ADMIN`, `TEAM_MANAGER`

**Headers:**

```http
Authorization: Bearer <access_token>
```

**Query Parameters:** Không có

**Success Response (200 OK):**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Hà Nội FC",
    "status": "ACTIVE",
    "createdAt": "2026-01-28T11:32:43.000Z",
    "updatedAt": "2026-01-28T11:32:43.000Z"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "name": "Hoàng Anh Gia Lai",
    "status": "ACTIVE",
    "createdAt": "2026-01-28T11:32:43.000Z",
    "updatedAt": "2026-01-28T11:32:43.000Z"
  }
]
```

**Team Status Values:**

| Status | Mô tả |
|--------|-------|
| `ACTIVE` | Đội đang hoạt động |
| `INACTIVE` | Đội ngừng hoạt động |

**Error Response (401 Unauthorized):**

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Error Response (403 Forbidden):**

```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

---

## Players

### GET /players

Lấy danh sách tất cả cầu thủ.

**Authentication:** ❌ Không yêu cầu (Public endpoint)

**Query Parameters:** Không có

**Success Response (200 OK):**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "fullName": "Nguyễn Quang Hải",
    "dob": "1997-04-12T00:00:00.000Z",
    "nationality": "Vietnam",
    "position": "MF",
    "createdAt": "2026-01-28T11:32:43.000Z",
    "updatedAt": "2026-01-28T11:32:43.000Z"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440011",
    "fullName": "Đặng Văn Lâm",
    "dob": "1993-08-13T00:00:00.000Z",
    "nationality": "Vietnam",
    "position": "GK",
    "createdAt": "2026-01-28T11:32:43.000Z",
    "updatedAt": "2026-01-28T11:32:43.000Z"
  }
]
```

**Player Position Values:**

| Position | Mô tả |
|----------|-------|
| `GK` | Thủ môn (Goalkeeper) |
| `DF` | Hậu vệ (Defender) |
| `MF` | Tiền vệ (Midfielder) |
| `FW` | Tiền đạo (Forward) |

---

## Matches

### GET /matches/:id

Lấy thông tin chi tiết một trận đấu.

**Authentication:** ✅ Required  
**Allowed Roles:** `ADMIN`, `TEAM_MANAGER`, `REFEREE`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | ✅ | ID của trận đấu |

**Headers:**

```http
Authorization: Bearer <access_token>
```

**Example Request:**

```http
GET /matches/550e8400-e29b-41d4-a716-446655440020
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200 OK):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440020",
  "roundNo": 1,
  "kickoffAt": "2026-02-15T19:00:00.000Z",
  "status": "DRAFT",
  "homeTeamId": "550e8400-e29b-41d4-a716-446655440001",
  "awayTeamId": "550e8400-e29b-41d4-a716-446655440002",
  "homeScore": null,
  "awayScore": null,
  "events": []
}
```

**Match Status Values:**

| Status | Mô tả |
|--------|-------|
| `DRAFT` | Bản nháp - chưa công bố |
| `PUBLISHED` | Đã công bố |
| `LOCKED` | Đã khóa - không thể chỉnh sửa |

---

### POST /matches/:id/events

Thêm sự kiện vào trận đấu (bàn thắng, thẻ phạt, thay người...).

**Authentication:** ✅ Required  
**Allowed Roles:** `ADMIN`, `REFEREE`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | ✅ | ID của trận đấu |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `minute` | number | ✅ | Phút xảy ra sự kiện (0-120+) |
| `type` | string | ✅ | Loại sự kiện |
| `playerId` | string (UUID) | ❌ | ID cầu thủ liên quan |
| `teamId` | string (UUID) | ❌ | ID đội bóng liên quan |
| `note` | string | ❌ | Ghi chú thêm |

**Event Type Values:**

| Type | Mô tả |
|------|-------|
| `GOAL` | Bàn thắng |
| `YELLOW_CARD` | Thẻ vàng |
| `RED_CARD` | Thẻ đỏ |
| `SUBSTITUTION` | Thay người |

**Example Request:**

```json
{
  "minute": 45,
  "type": "GOAL",
  "playerId": "550e8400-e29b-41d4-a716-446655440010",
  "teamId": "550e8400-e29b-41d4-a716-446655440001",
  "note": "Penalty kick"
}
```

**Success Response (200 OK):**

```json
{
  "ok": true,
  "matchId": "550e8400-e29b-41d4-a716-446655440020",
  "createdEvent": {
    "id": "evt-1706612400000",
    "minute": 45,
    "type": "GOAL",
    "playerId": "550e8400-e29b-41d4-a716-446655440010",
    "teamId": "550e8400-e29b-41d4-a716-446655440001",
    "note": "Penalty kick"
  }
}
```

---

## Scheduling

### GET /schedule

Lấy lịch thi đấu (danh sách các trận đấu).

**Authentication:** ✅ Required  
**Allowed Roles:** `ADMIN`, `TEAM_MANAGER`, `REFEREE`

**Headers:**

```http
Authorization: Bearer <access_token>
```

**Success Response (200 OK):**

```json
{
  "ok": true,
  "matches": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440020",
      "roundNo": 1,
      "homeTeamId": "550e8400-e29b-41d4-a716-446655440001",
      "awayTeamId": "550e8400-e29b-41d4-a716-446655440002",
      "stadiumId": "550e8400-e29b-41d4-a716-446655440030",
      "kickoffAt": "2026-02-15T19:00:00.000Z",
      "status": "DRAFT",
      "createdAt": "2026-01-28T11:32:43.000Z",
      "updatedAt": "2026-01-28T11:32:43.000Z"
    }
  ]
}
```

---

### POST /schedule/generate

Tạo lịch thi đấu tự động.

**Authentication:** ✅ Required  
**Allowed Roles:** `ADMIN` only

**Headers:**

```http
Authorization: Bearer <access_token>
```

**Request Body:** Không yêu cầu

**Success Response (200 OK):**

```json
{
  "ok": true,
  "message": "schedule generation stub"
}
```

> ⚠️ **Note:** Đây là stub endpoint, chức năng đầy đủ sẽ được implement ở sprint sau.

---

### POST /schedule/publish

Công bố lịch thi đấu.

**Authentication:** ✅ Required  
**Allowed Roles:** `ADMIN` only

**Headers:**

```http
Authorization: Bearer <access_token>
```

**Request Body:** Không yêu cầu

**Success Response (200 OK):**

```json
{
  "ok": true,
  "message": "schedule publish stub"
}
```

> ⚠️ **Note:** Đây là stub endpoint, chức năng đầy đủ sẽ được implement ở sprint sau.

---

## Data Models

### User

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `email` | string | Email (unique) |
| `role` | UserRole | Vai trò người dùng |
| `createdAt` | DateTime | Ngày tạo |
| `updatedAt` | DateTime | Ngày cập nhật |

### Team

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `name` | string | Tên đội (unique) |
| `status` | TeamStatus | Trạng thái (`ACTIVE`, `INACTIVE`) |
| `createdAt` | DateTime | Ngày tạo |
| `updatedAt` | DateTime | Ngày cập nhật |

### Player

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `fullName` | string | Họ tên đầy đủ |
| `dob` | DateTime | Ngày sinh |
| `nationality` | string | Quốc tịch |
| `position` | PlayerPosition | Vị trí (`GK`, `DF`, `MF`, `FW`) |
| `createdAt` | DateTime | Ngày tạo |
| `updatedAt` | DateTime | Ngày cập nhật |

### Match

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `roundNo` | integer | Vòng đấu |
| `homeTeamId` | UUID | ID đội nhà |
| `awayTeamId` | UUID | ID đội khách |
| `stadiumId` | UUID (nullable) | ID sân vận động |
| `kickoffAt` | DateTime (nullable) | Thời gian bắt đầu |
| `status` | MatchStatus | Trạng thái (`DRAFT`, `PUBLISHED`, `LOCKED`) |
| `createdAt` | DateTime | Ngày tạo |
| `updatedAt` | DateTime | Ngày cập nhật |

---

## API Endpoint Summary

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/auth/login` | ❌ | - | Đăng nhập |
| POST | `/auth/refresh` | ❌ | - | Làm mới token |
| POST | `/auth/logout` | ❌ | - | Đăng xuất |
| GET | `/teams` | ✅ | ADMIN, TEAM_MANAGER | Danh sách đội bóng |
| GET | `/players` | ❌ | - | Danh sách cầu thủ |
| GET | `/matches/:id` | ✅ | ADMIN, TEAM_MANAGER, REFEREE | Chi tiết trận đấu |
| POST | `/matches/:id/events` | ✅ | ADMIN, REFEREE | Thêm sự kiện trận đấu |
| GET | `/schedule` | ✅ | ADMIN, TEAM_MANAGER, REFEREE | Lịch thi đấu |
| POST | `/schedule/generate` | ✅ | ADMIN | Tạo lịch tự động |
| POST | `/schedule/publish` | ✅ | ADMIN | Công bố lịch |

---

## Swagger UI

API documentation cũng có sẵn qua Swagger UI tại:

```
http://localhost:3000/api/docs
```

---

## Changelog

### v1.0.0 (2026-01-30)
- Initial API documentation
- Auth endpoints (login, refresh, logout)
- Teams management
- Players listing
- Match details and events
- Schedule management (stub)

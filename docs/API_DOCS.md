# V-League API Documentation

> **Version:** 1.1.0
> **Base URL:** `http://localhost:8080`
> **Last Updated:** February 26, 2026

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
  - [Seasons](#seasons)
  - [Season Teams](#season-teams)
  - [Stadiums](#stadiums)
  - [Standings](#standings)
  - [Roster](#roster)
  - [Regulations](#regulations)
  - [Users](#users-admin)
  - [Upload](#upload)
  - [Health](#health)
- [Data Models](#data-models)
- [API Endpoint Summary](#api-endpoint-summary)

---

## Overview

V-League API cung cấp các endpoint để quản lý giải bóng đá V-League, bao gồm:

- Xác thực người dùng (Authentication) với JWT, OAuth (Google, Facebook)
- Quản lý đội bóng (Teams) và cầu thủ (Players)
- Quản lý mùa giải (Seasons) và đăng ký đội tham gia
- Quản lý sân vận động (Stadiums)
- Lập lịch thi đấu tự động (Scheduling) — round-robin
- Quản lý trận đấu và sự kiện (Matches & Events)
- Bảng xếp hạng tự động (Standings) — vua phá lưới, thẻ phạt
- Quản lý danh sách cầu thủ đội (Roster)
- Quy định giải đấu theo mùa (Regulations)
- Quản trị người dùng (Users) và upload ảnh

### Tech Stack

- **Framework:** NestJS 11
- **Database:** PostgreSQL 16
- **ORM:** Prisma 7
- **Authentication:** JWT (access/refresh tokens) + OAuth2 (Google, Facebook)
- **Logging:** Pino (structured JSON)
- **Docs:** Swagger/OpenAPI at `/api/docs`

---

## Authentication

API sử dụng JWT (JSON Web Token) để xác thực. Có hai loại token:

| Token Type    | Lifetime | Mục đích             |
| ------------- | -------- | -------------------- |
| Access Token  | 15 phút  | Xác thực các request |
| Refresh Token | 7 ngày   | Lấy access token mới |

### User Roles

| Role           | Mô tả                                      |
| -------------- | ------------------------------------------ |
| `ADMIN`        | Quản trị viên hệ thống — có toàn quyền     |
| `TEAM_MANAGER` | Quản lý đội bóng — quản lý cầu thủ, roster |
| `REFEREE`      | Trọng tài — cập nhật sự kiện trận đấu      |
| `SUPERVISOR`   | Giám sát viên                              |
| `PUBLIC`       | Người dùng công khai                       |

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

| Code                       | HTTP Status | Mô tả                                      |
| -------------------------- | ----------- | ------------------------------------------ |
| `AUTH_INVALID_CREDENTIALS` | 401         | Email hoặc mật khẩu không đúng             |
| `AUTH_REFRESH_INVALID`     | 401         | Refresh token không hợp lệ hoặc đã hết hạn |
| `AUTH_ACCESS_DENIED`       | 403         | Không có quyền truy cập                    |
| `NOT_FOUND`                | 404         | Không tìm thấy tài nguyên                  |
| `VALIDATION_ERROR`         | 400         | Dữ liệu đầu vào không hợp lệ               |

---

## Endpoints

---

## Auth

### POST /auth/register

Đăng ký tài khoản mới.

**Authentication:** Không yêu cầu

**Request Body:**

| Field      | Type   | Required | Description            |
| ---------- | ------ | -------- | ---------------------- |
| `email`    | string | ✅       | Email đăng ký          |
| `password` | string | ✅       | Mật khẩu (min 6 ký tự) |
| `name`     | string | ❌       | Họ tên                 |

---

### POST /auth/verify-email

Xác thực email bằng mã OTP.

**Authentication:** Không yêu cầu

**Request Body:**

| Field   | Type   | Required | Description        |
| ------- | ------ | -------- | ------------------ |
| `email` | string | ✅       | Email cần xác thực |
| `otp`   | string | ✅       | Mã OTP 6 số        |

---

### POST /auth/resend-otp

Gửi lại mã OTP xác thực email.

**Authentication:** Không yêu cầu

---

### POST /auth/forgot-password

Yêu cầu đặt lại mật khẩu — gửi OTP qua email.

**Authentication:** Không yêu cầu

---

### POST /auth/reset-password

Đặt lại mật khẩu bằng mã OTP.

**Authentication:** Không yêu cầu

---

### POST /auth/login

Đăng nhập và nhận JWT tokens.

**Authentication:** Không yêu cầu

**Request Body:**

| Field      | Type   | Required | Description     |
| ---------- | ------ | -------- | --------------- |
| `email`    | string | ✅       | Email đăng nhập |
| `password` | string | ✅       | Mật khẩu        |

**Success Response (200 OK):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@demo.local",
    "role": "ADMIN"
  }
}
```

---

### POST /auth/refresh

Làm mới access token bằng refresh token.

**Authentication:** Không yêu cầu

---

### POST /auth/logout

Đăng xuất và vô hiệu hóa refresh token.

**Authentication:** Không yêu cầu

---

### GET /auth/me

Lấy thông tin người dùng hiện tại.

**Authentication:** ✅ Required (JWT)

---

### POST /auth/change-password

Đổi mật khẩu.

**Authentication:** ✅ Required (JWT)

---

### POST /auth/logout-all

Đăng xuất khỏi tất cả thiết bị.

**Authentication:** ✅ Required (JWT)

---

### PATCH /auth/profile

Cập nhật hồ sơ người dùng (tên, avatar).

**Authentication:** ✅ Required (JWT)

---

### GET /auth/sessions

Danh sách các phiên đăng nhập đang hoạt động.

**Authentication:** ✅ Required (JWT)

---

### DELETE /auth/sessions/:sessionId

Thu hồi một phiên đăng nhập cụ thể.

**Authentication:** ✅ Required (JWT)

---

### POST /auth/set-password

Đặt mật khẩu cho tài khoản OAuth (chưa có mật khẩu).

**Authentication:** ✅ Required (JWT)

---

### GET /auth/google, GET /auth/google/callback

Google OAuth2 đăng nhập.

---

### GET /auth/facebook, GET /auth/facebook/callback

Facebook OAuth2 đăng nhập.

---

## Teams

### GET /teams

Lấy danh sách đội bóng (phân trang, tìm kiếm).

**Authentication:** ❌ Không yêu cầu

---

### GET /teams/:id

Lấy chi tiết đội bóng.

**Authentication:** ❌ Không yêu cầu

---

### POST /teams

Tạo đội bóng mới.

**Authentication:** ✅ Required
**Allowed Roles:** `ADMIN`

**Request Body:**

| Field       | Type   | Required | Description      |
| ----------- | ------ | -------- | ---------------- |
| `name`      | string | ✅       | Tên đội (unique) |
| `shortName` | string | ❌       | Tên viết tắt     |
| `city`      | string | ❌       | Thành phố        |
| `logoUrl`   | string | ❌       | URL logo         |
| `stadiumId` | UUID   | ❌       | ID sân nhà       |

---

### PATCH /teams/:id

Cập nhật thông tin đội.

**Authentication:** ✅ Required
**Allowed Roles:** `ADMIN`

---

### DELETE /teams/:id

Xóa đội bóng.

**Authentication:** ✅ Required
**Allowed Roles:** `ADMIN`

---

## Players

### GET /players

Lấy danh sách cầu thủ (phân trang, lọc theo vị trí, loại).

**Authentication:** ❌ Không yêu cầu

---

### GET /players/:id

Chi tiết cầu thủ.

**Authentication:** ❌ Không yêu cầu

---

### POST /players

Tạo cầu thủ mới.

**Authentication:** ✅ Required
**Allowed Roles:** `ADMIN`, `TEAM_MANAGER`

**Request Body:**

| Field         | Type     | Required | Description                         |
| ------------- | -------- | -------- | ----------------------------------- |
| `fullName`    | string   | ✅       | Họ tên                              |
| `dob`         | DateTime | ✅       | Ngày sinh                           |
| `nationality` | string   | ✅       | Quốc tịch                           |
| `position`    | enum     | ✅       | Vị trí: `GK`, `DF`, `MF`, `FW`      |
| `playerType`  | enum     | ❌       | `DOMESTIC` (default) hoặc `FOREIGN` |
| `birthPlace`  | string   | ❌       | Nơi sinh                            |
| `heightCm`    | integer  | ❌       | Chiều cao (cm)                      |
| `weightKg`    | integer  | ❌       | Cân nặng (kg)                       |

---

### PATCH /players/:id

Cập nhật cầu thủ.

**Authentication:** ✅ Required
**Allowed Roles:** `ADMIN`, `TEAM_MANAGER`

---

### DELETE /players/:id

Xóa cầu thủ.

**Authentication:** ✅ Required
**Allowed Roles:** `ADMIN`, `TEAM_MANAGER`

---

### POST /players/import

Import cầu thủ từ file CSV.

**Authentication:** ✅ Required
**Allowed Roles:** `ADMIN`

---

## Matches

### GET /matches

Danh sách trận đấu (phân trang, lọc theo mùa giải/vòng/trạng thái).

**Authentication:** ✅ Required
**Allowed Roles:** `ADMIN`, `TEAM_MANAGER`, `REFEREE`, `SUPERVISOR`, `PUBLIC`

---

### GET /matches/:id

Chi tiết trận đấu kèm danh sách sự kiện.

**Authentication:** ✅ Required
**Allowed Roles:** `ADMIN`, `TEAM_MANAGER`, `REFEREE`, `SUPERVISOR`, `PUBLIC`

**Success Response (200 OK):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440020",
  "roundNo": 1,
  "leg": 1,
  "kickoffAt": "2026-02-15T19:00:00.000Z",
  "status": "FINISHED",
  "homeTeamId": "...",
  "awayTeamId": "...",
  "homeScore": 2,
  "awayScore": 1,
  "seasonId": "...",
  "events": [
    {
      "id": "...",
      "minute": 45,
      "type": "GOAL",
      "playerId": "...",
      "teamId": "..."
    }
  ]
}
```

**Match Status Values:**

| Status      | Mô tả                           |
| ----------- | ------------------------------- |
| `DRAFT`     | Bản nháp — chưa công bố         |
| `PUBLISHED` | Đã công bố                      |
| `LOCKED`    | Đã khóa — trận đấu đang diễn ra |
| `FINISHED`  | Đã kết thúc                     |
| `POSTPONED` | Hoãn                            |

---

### POST /matches/:id/events

Thêm sự kiện vào trận đấu (bàn thắng, thẻ phạt, thay người...).

**Authentication:** ✅ Required
**Allowed Roles:** `ADMIN`, `REFEREE`

**Request Body:**

| Field             | Type   | Required | Description                          |
| ----------------- | ------ | -------- | ------------------------------------ |
| `minute`          | number | ✅       | Phút xảy ra sự kiện                  |
| `type`            | enum   | ✅       | Loại sự kiện (xem bảng dưới)         |
| `playerId`        | UUID   | ❌       | Cầu thủ liên quan                    |
| `relatedPlayerId` | UUID   | ❌       | Cầu thủ liên quan thứ 2 (thay người) |
| `teamId`          | UUID   | ❌       | Đội liên quan                        |
| `note`            | string | ❌       | Ghi chú                              |

**Event Type Values:**

| Type           | Mô tả              |
| -------------- | ------------------ |
| `GOAL`         | Bàn thắng          |
| `OWN_GOAL`     | Phản lưới nhà      |
| `PENALTY`      | Penalty thành công |
| `PENALTY_MISS` | Penalty thất bại   |
| `YELLOW_CARD`  | Thẻ vàng           |
| `RED_CARD`     | Thẻ đỏ             |
| `SUBSTITUTION` | Thay người         |

---

### PATCH /matches/:id

Cập nhật thông tin trận đấu (sân, giờ, tỉ số).

**Authentication:** ✅ Required
**Allowed Roles:** `ADMIN`

---

### PATCH /matches/:id/status

Cập nhật trạng thái trận đấu (state machine).

**Authentication:** ✅ Required
**Allowed Roles:** `ADMIN`

---

## Scheduling

### GET /schedule

Lấy lịch thi đấu.

**Authentication:** ✅ Required
**Allowed Roles:** `ADMIN`, `TEAM_MANAGER`, `REFEREE`, `SUPERVISOR`, `PUBLIC`

---

### POST /schedule/generate

Tạo lịch thi đấu tự động (thuật toán round-robin, 2 lượt đi/về trên sân nhà/khách, tự động sắp lịch Thứ 7/CN).

**Authentication:** ✅ Required
**Allowed Roles:** `ADMIN`

**Request Body:**

| Field      | Type | Required | Description |
| ---------- | ---- | -------- | ----------- |
| `seasonId` | UUID | ✅       | ID mùa giải |

---

### POST /schedule/publish

Công bố lịch thi đấu (chuyển trạng thái DRAFT → PUBLISHED).

**Authentication:** ✅ Required
**Allowed Roles:** `ADMIN`

---

## Seasons

### GET /seasons

Danh sách tất cả mùa giải.

**Authentication:** ❌ Không yêu cầu

---

### GET /seasons/current

Lấy mùa giải đang diễn ra (status = `IN_PROGRESS`).

**Authentication:** ❌ Không yêu cầu

---

### GET /seasons/:id

Chi tiết mùa giải.

**Authentication:** ❌ Không yêu cầu

---

### POST /seasons

Tạo mùa giải mới.

**Authentication:** ✅ Required
**Allowed Roles:** `ADMIN`

**Request Body:**

| Field       | Type     | Required | Description           |
| ----------- | -------- | -------- | --------------------- |
| `name`      | string   | ✅       | Tên mùa giải (unique) |
| `year`      | integer  | ✅       | Năm                   |
| `startDate` | DateTime | ❌       | Ngày bắt đầu          |
| `endDate`   | DateTime | ❌       | Ngày kết thúc         |

**Season Status Values:**

| Status        | Mô tả              |
| ------------- | ------------------ |
| `UPCOMING`    | Sắp tới (mặc định) |
| `IN_PROGRESS` | Đang diễn ra       |
| `COMPLETED`   | Đã kết thúc        |

---

### PATCH /seasons/:id

Cập nhật mùa giải.

**Authentication:** ✅ Required
**Allowed Roles:** `ADMIN`

---

### DELETE /seasons/:id

Xóa mùa giải.

**Authentication:** ✅ Required
**Allowed Roles:** `ADMIN`

---

### PATCH /seasons/:id/status

Cập nhật trạng thái mùa giải.

**Authentication:** ✅ Required
**Allowed Roles:** `ADMIN`

---

## Season Teams

### GET /seasons/:seasonId/teams

Danh sách đội đăng ký tham gia mùa giải.

**Authentication:** ❌ Không yêu cầu

---

### POST /seasons/:seasonId/teams

Đăng ký đội tham gia mùa giải.

**Authentication:** ✅ Required
**Allowed Roles:** `ADMIN`

**Season Team Status:**

| Status       | Mô tả                 |
| ------------ | --------------------- |
| `REGISTERED` | Đã đăng ký (mặc định) |
| `APPROVED`   | Được duyệt            |
| `REJECTED`   | Bị từ chối            |
| `WITHDRAWN`  | Rút lui               |

---

### PATCH /seasons/:seasonId/teams/:teamId/status

Duyệt/từ chối đội.

**Authentication:** ✅ Required
**Allowed Roles:** `ADMIN`

---

### DELETE /seasons/:seasonId/teams/:teamId

Xóa đội khỏi mùa giải.

**Authentication:** ✅ Required
**Allowed Roles:** `ADMIN`

---

## Stadiums

### GET /stadiums

Danh sách sân vận động.

**Authentication:** ❌ Không yêu cầu

---

### GET /stadiums/:id

Chi tiết sân.

**Authentication:** ❌ Không yêu cầu

---

### POST /stadiums

Tạo sân mới.

**Authentication:** ✅ Required
**Allowed Roles:** `ADMIN`

**Request Body:**

| Field      | Type    | Required | Description      |
| ---------- | ------- | -------- | ---------------- |
| `name`     | string  | ✅       | Tên sân (unique) |
| `city`     | string  | ✅       | Thành phố        |
| `address`  | string  | ❌       | Địa chỉ          |
| `capacity` | integer | ❌       | Sức chứa         |

---

### PATCH /stadiums/:id

Cập nhật sân.

**Authentication:** ✅ Required
**Allowed Roles:** `ADMIN`

---

### DELETE /stadiums/:id

Xóa sân.

**Authentication:** ✅ Required
**Allowed Roles:** `ADMIN`

---

## Standings

### GET /standings

Bảng xếp hạng (mặc định: mùa giải hiện tại, hoặc truyền `?seasonId=`).

**Authentication:** ❌ Không yêu cầu

---

### GET /standings/top-scorers

Danh sách vua phá lưới.

**Authentication:** ❌ Không yêu cầu

---

### GET /standings/card-stats

Thống kê thẻ phạt.

**Authentication:** ❌ Không yêu cầu

---

### GET /standings/team-stats

Thống kê tổng hợp theo đội.

**Authentication:** ❌ Không yêu cầu

---

### GET /standings/:seasonId

Bảng xếp hạng theo mùa giải cụ thể.

**Authentication:** ❌ Không yêu cầu

---

## Roster

### GET /teams/:teamId/roster

Danh sách cầu thủ của đội.

**Authentication:** ❌ Không yêu cầu

---

### POST /teams/:teamId/roster

Thêm cầu thủ vào đội.

**Authentication:** ✅ Required
**Allowed Roles:** `ADMIN`, `TEAM_MANAGER`

**Request Body:**

| Field          | Type    | Required | Description |
| -------------- | ------- | -------- | ----------- |
| `playerId`     | UUID    | ✅       | ID cầu thủ  |
| `jerseyNumber` | integer | ❌       | Số áo       |

---

### PATCH /teams/:teamId/roster/:playerId

Cập nhật thông tin cầu thủ trong đội (số áo...).

**Authentication:** ✅ Required
**Allowed Roles:** `ADMIN`, `TEAM_MANAGER`

---

### DELETE /teams/:teamId/roster/:playerId

Xóa cầu thủ khỏi đội.

**Authentication:** ✅ Required
**Allowed Roles:** `ADMIN`, `TEAM_MANAGER`

---

## Regulations

### GET /seasons/:seasonId/regulations

Danh sách quy định của mùa giải.

**Authentication:** ❌ Không yêu cầu

---

### GET /seasons/:seasonId/regulations/:key

Lấy quy định theo key.

**Authentication:** ❌ Không yêu cầu

---

### PUT /seasons/:seasonId/regulations

Tạo/cập nhật quy định.

**Authentication:** ✅ Required
**Allowed Roles:** `ADMIN`

**Default Regulations:**

| Key                   | Default | Mô tả                    |
| --------------------- | ------- | ------------------------ |
| `MIN_AGE`             | 16      | Tuổi tối thiểu           |
| `MAX_AGE`             | 40      | Tuổi tối đa              |
| `MIN_ROSTER`          | 15      | Số cầu thủ tối thiểu/đội |
| `MAX_ROSTER`          | 22      | Số cầu thủ tối đa/đội    |
| `MAX_FOREIGN_PLAYERS` | 3       | Số ngoại binh tối đa     |
| `WIN_POINTS`          | 3       | Điểm thắng               |
| `DRAW_POINTS`         | 1       | Điểm hòa                 |
| `LOSS_POINTS`         | 0       | Điểm thua                |
| `MAX_GOAL_TIME`       | 96      | Phút ghi bàn tối đa      |

---

### DELETE /seasons/:seasonId/regulations/:key

Xóa quy định.

**Authentication:** ✅ Required
**Allowed Roles:** `ADMIN`

---

### POST /seasons/:seasonId/regulations/seed-defaults

Seed quy định mặc định cho mùa giải.

**Authentication:** ✅ Required
**Allowed Roles:** `ADMIN`

---

## Users (Admin)

### GET /users

Danh sách người dùng.

**Authentication:** ✅ Required
**Allowed Roles:** `ADMIN`

---

### POST /users

Tạo người dùng (với vai trò).

**Authentication:** ✅ Required
**Allowed Roles:** `ADMIN`

---

### PATCH /users/:id/role

Cập nhật vai trò người dùng.

**Authentication:** ✅ Required
**Allowed Roles:** `ADMIN`

---

### DELETE /users/:id

Xóa người dùng.

**Authentication:** ✅ Required
**Allowed Roles:** `ADMIN`

---

## Upload

### POST /upload/image

Upload ảnh (JPEG, PNG, WebP, GIF — tối đa 5MB).

**Authentication:** ✅ Required
**Allowed Roles:** `ADMIN`, `TEAM_MANAGER`

---

## Health

### GET /health

Kiểm tra trạng thái hệ thống (database + memory).

**Authentication:** ❌ Không yêu cầu

**Success Response (200 OK):**

```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "memory_heap": { "status": "up" }
  }
}
```

---

## Data Models

### User

| Field           | Type     | Description                                               |
| --------------- | -------- | --------------------------------------------------------- |
| `id`            | UUID     | Primary key                                               |
| `email`         | string   | Email (unique)                                            |
| `role`          | UserRole | Vai trò: ADMIN, TEAM_MANAGER, REFEREE, SUPERVISOR, PUBLIC |
| `emailVerified` | boolean  | Đã xác thực email                                         |
| `name`          | string?  | Họ tên                                                    |
| `avatarUrl`     | string?  | URL avatar                                                |
| `googleId`      | string?  | Google OAuth ID                                           |
| `facebookId`    | string?  | Facebook OAuth ID                                         |

### Team

| Field       | Type       | Description       |
| ----------- | ---------- | ----------------- |
| `id`        | UUID       | Primary key       |
| `name`      | string     | Tên đội (unique)  |
| `shortName` | string?    | Tên viết tắt      |
| `city`      | string?    | Thành phố         |
| `logoUrl`   | string?    | URL logo          |
| `status`    | TeamStatus | ACTIVE / INACTIVE |
| `stadiumId` | UUID?      | FK đến Stadium    |

### Player

| Field         | Type           | Description        |
| ------------- | -------------- | ------------------ |
| `id`          | UUID           | Primary key        |
| `fullName`    | string         | Họ tên             |
| `dob`         | DateTime       | Ngày sinh          |
| `nationality` | string         | Quốc tịch          |
| `position`    | PlayerPosition | GK / DF / MF / FW  |
| `playerType`  | PlayerType     | DOMESTIC / FOREIGN |
| `birthPlace`  | string?        | Nơi sinh           |
| `heightCm`    | integer?       | Chiều cao (cm)     |
| `weightKg`    | integer?       | Cân nặng (kg)      |

### Match

| Field        | Type        | Description                                       |
| ------------ | ----------- | ------------------------------------------------- |
| `id`         | UUID        | Primary key                                       |
| `roundNo`    | integer     | Vòng đấu                                          |
| `leg`        | integer     | Lượt (1 = đi, 2 = về)                             |
| `seasonId`   | UUID?       | FK đến Season                                     |
| `homeTeamId` | UUID        | FK đến Team (đội nhà)                             |
| `awayTeamId` | UUID        | FK đến Team (đội khách)                           |
| `stadiumId`  | UUID?       | FK đến Stadium                                    |
| `kickoffAt`  | DateTime?   | Thời gian                                         |
| `homeScore`  | integer?    | Tỉ số đội nhà                                     |
| `awayScore`  | integer?    | Tỉ số đội khách                                   |
| `status`     | MatchStatus | DRAFT / PUBLISHED / LOCKED / FINISHED / POSTPONED |

### Season

| Field       | Type         | Description                        |
| ----------- | ------------ | ---------------------------------- |
| `id`        | UUID         | Primary key                        |
| `name`      | string       | Tên mùa giải (unique)              |
| `year`      | integer      | Năm                                |
| `status`    | SeasonStatus | UPCOMING / IN_PROGRESS / COMPLETED |
| `startDate` | DateTime?    | Ngày bắt đầu                       |
| `endDate`   | DateTime?    | Ngày kết thúc                      |

### Stadium

| Field      | Type     | Description      |
| ---------- | -------- | ---------------- |
| `id`       | UUID     | Primary key      |
| `name`     | string   | Tên sân (unique) |
| `address`  | string?  | Địa chỉ          |
| `city`     | string   | Thành phố        |
| `capacity` | integer? | Sức chứa         |

### MatchEvent

| Field             | Type      | Description                                                                      |
| ----------------- | --------- | -------------------------------------------------------------------------------- |
| `id`              | UUID      | Primary key                                                                      |
| `matchId`         | UUID      | FK đến Match                                                                     |
| `minute`          | integer   | Phút xảy ra                                                                      |
| `type`            | EventType | GOAL / OWN_GOAL / PENALTY / PENALTY_MISS / YELLOW_CARD / RED_CARD / SUBSTITUTION |
| `playerId`        | UUID?     | Cầu thủ chính                                                                    |
| `relatedPlayerId` | UUID?     | Cầu thủ liên quan (thay người)                                                   |
| `teamId`          | UUID?     | Đội liên quan                                                                    |
| `note`            | string?   | Ghi chú                                                                          |

### Regulation

| Field       | Type   | Description              |
| ----------- | ------ | ------------------------ |
| `id`        | UUID   | Primary key              |
| `seasonId`  | UUID   | FK đến Season            |
| `key`       | string | Mã quy định              |
| `value`     | string | Giá trị                  |
| `valueType` | string | Kiểu giá trị (INT, JSON) |

### Standing

| Field          | Type     | Description    |
| -------------- | -------- | -------------- |
| `id`           | UUID     | Primary key    |
| `seasonId`     | UUID     | FK đến Season  |
| `teamId`       | UUID     | FK đến Team    |
| `played`       | integer  | Số trận đã đấu |
| `win`          | integer  | Số trận thắng  |
| `draw`         | integer  | Số trận hòa    |
| `loss`         | integer  | Số trận thua   |
| `goalsFor`     | integer  | Số bàn thắng   |
| `goalsAgainst` | integer  | Số bàn thua    |
| `goalDiff`     | integer  | Hiệu số        |
| `points`       | integer  | Điểm           |
| `rank`         | integer? | Thứ hạng       |

---

## API Endpoint Summary

| Method | Endpoint                                  | Auth | Roles               | Description           |
| ------ | ----------------------------------------- | ---- | ------------------- | --------------------- |
| POST   | `/auth/register`                          | ❌   | —                   | Đăng ký               |
| POST   | `/auth/verify-email`                      | ❌   | —                   | Xác thực email        |
| POST   | `/auth/resend-otp`                        | ❌   | —                   | Gửi lại OTP           |
| POST   | `/auth/forgot-password`                   | ❌   | —                   | Quên mật khẩu         |
| POST   | `/auth/reset-password`                    | ❌   | —                   | Đặt lại mật khẩu      |
| POST   | `/auth/login`                             | ❌   | —                   | Đăng nhập             |
| POST   | `/auth/refresh`                           | ❌   | —                   | Làm mới token         |
| POST   | `/auth/logout`                            | ❌   | —                   | Đăng xuất             |
| GET    | `/auth/me`                                | ✅   | Any                 | Thông tin hiện tại    |
| POST   | `/auth/change-password`                   | ✅   | Any                 | Đổi mật khẩu          |
| POST   | `/auth/logout-all`                        | ✅   | Any                 | Đăng xuất tất cả      |
| PATCH  | `/auth/profile`                           | ✅   | Any                 | Cập nhật hồ sơ        |
| GET    | `/auth/sessions`                          | ✅   | Any                 | Danh sách phiên       |
| DELETE | `/auth/sessions/:id`                      | ✅   | Any                 | Xóa phiên             |
| POST   | `/auth/set-password`                      | ✅   | Any                 | Đặt mật khẩu OAuth    |
| GET    | `/teams`                                  | ❌   | —                   | Danh sách đội         |
| GET    | `/teams/:id`                              | ❌   | —                   | Chi tiết đội          |
| POST   | `/teams`                                  | ✅   | ADMIN               | Tạo đội               |
| PATCH  | `/teams/:id`                              | ✅   | ADMIN               | Sửa đội               |
| DELETE | `/teams/:id`                              | ✅   | ADMIN               | Xóa đội               |
| GET    | `/players`                                | ❌   | —                   | Danh sách cầu thủ     |
| GET    | `/players/:id`                            | ❌   | —                   | Chi tiết cầu thủ      |
| POST   | `/players`                                | ✅   | ADMIN, TEAM_MANAGER | Tạo cầu thủ           |
| PATCH  | `/players/:id`                            | ✅   | ADMIN, TEAM_MANAGER | Sửa cầu thủ           |
| DELETE | `/players/:id`                            | ✅   | ADMIN, TEAM_MANAGER | Xóa cầu thủ           |
| POST   | `/players/import`                         | ✅   | ADMIN               | Import CSV            |
| GET    | `/schedule`                               | ✅   | All roles           | Lịch thi đấu          |
| POST   | `/schedule/generate`                      | ✅   | ADMIN               | Tạo lịch              |
| POST   | `/schedule/publish`                       | ✅   | ADMIN               | Công bố lịch          |
| GET    | `/matches`                                | ✅   | All roles           | Danh sách trận        |
| GET    | `/matches/:id`                            | ✅   | All roles           | Chi tiết trận         |
| POST   | `/matches/:id/events`                     | ✅   | ADMIN, REFEREE      | Thêm sự kiện          |
| PATCH  | `/matches/:id`                            | ✅   | ADMIN               | Sửa trận              |
| PATCH  | `/matches/:id/status`                     | ✅   | ADMIN               | Đổi trạng thái        |
| GET    | `/seasons`                                | ❌   | —                   | Danh sách mùa giải    |
| GET    | `/seasons/current`                        | ❌   | —                   | Mùa giải hiện tại     |
| GET    | `/seasons/:id`                            | ❌   | —                   | Chi tiết mùa giải     |
| POST   | `/seasons`                                | ✅   | ADMIN               | Tạo mùa giải          |
| PATCH  | `/seasons/:id`                            | ✅   | ADMIN               | Sửa mùa giải          |
| DELETE | `/seasons/:id`                            | ✅   | ADMIN               | Xóa mùa giải          |
| PATCH  | `/seasons/:id/status`                     | ✅   | ADMIN               | Đổi trạng thái        |
| GET    | `/seasons/:sId/teams`                     | ❌   | —                   | Đội trong mùa giải    |
| POST   | `/seasons/:sId/teams`                     | ✅   | ADMIN               | Đăng ký đội           |
| PATCH  | `/seasons/:sId/teams/:tId/status`         | ✅   | ADMIN               | Duyệt/từ chối         |
| DELETE | `/seasons/:sId/teams/:tId`                | ✅   | ADMIN               | Xóa đội               |
| GET    | `/stadiums`                               | ❌   | —                   | Danh sách sân         |
| GET    | `/stadiums/:id`                           | ❌   | —                   | Chi tiết sân          |
| POST   | `/stadiums`                               | ✅   | ADMIN               | Tạo sân               |
| PATCH  | `/stadiums/:id`                           | ✅   | ADMIN               | Sửa sân               |
| DELETE | `/stadiums/:id`                           | ✅   | ADMIN               | Xóa sân               |
| GET    | `/standings`                              | ❌   | —                   | Bảng xếp hạng         |
| GET    | `/standings/top-scorers`                  | ❌   | —                   | Vua phá lưới          |
| GET    | `/standings/card-stats`                   | ❌   | —                   | Thống kê thẻ          |
| GET    | `/standings/team-stats`                   | ❌   | —                   | Thống kê đội          |
| GET    | `/standings/:seasonId`                    | ❌   | —                   | BXH theo mùa          |
| GET    | `/teams/:tId/roster`                      | ❌   | —                   | Danh sách cầu thủ đội |
| POST   | `/teams/:tId/roster`                      | ✅   | ADMIN, TEAM_MANAGER | Thêm vào đội          |
| PATCH  | `/teams/:tId/roster/:pId`                 | ✅   | ADMIN, TEAM_MANAGER | Sửa roster            |
| DELETE | `/teams/:tId/roster/:pId`                 | ✅   | ADMIN, TEAM_MANAGER | Xóa khỏi đội          |
| GET    | `/seasons/:sId/regulations`               | ❌   | —                   | Quy định mùa giải     |
| GET    | `/seasons/:sId/regulations/:key`          | ❌   | —                   | Quy định theo key     |
| PUT    | `/seasons/:sId/regulations`               | ✅   | ADMIN               | Tạo/sửa quy định      |
| DELETE | `/seasons/:sId/regulations/:key`          | ✅   | ADMIN               | Xóa quy định          |
| POST   | `/seasons/:sId/regulations/seed-defaults` | ✅   | ADMIN               | Seed mặc định         |
| GET    | `/users`                                  | ✅   | ADMIN               | Danh sách user        |
| POST   | `/users`                                  | ✅   | ADMIN               | Tạo user              |
| PATCH  | `/users/:id/role`                         | ✅   | ADMIN               | Đổi role              |
| DELETE | `/users/:id`                              | ✅   | ADMIN               | Xóa user              |
| POST   | `/upload/image`                           | ✅   | ADMIN, TEAM_MANAGER | Upload ảnh            |
| GET    | `/health`                                 | ❌   | —                   | Health check          |

---

## Swagger UI

API documentation có sẵn qua Swagger UI tại:

```
http://localhost:8080/api/docs
```

---

## Changelog

### v1.1.0 (2026-02-26)

- Full API documentation for all 58 endpoints across 15 modules
- Added Seasons, Stadiums, Standings, Roster, Regulations, Users, Upload modules
- Match events: GOAL, OWN_GOAL, PENALTY, PENALTY_MISS, YELLOW_CARD, RED_CARD, SUBSTITUTION
- Season team registration workflow (REGISTERED → APPROVED/REJECTED → WITHDRAWN)
- Configurable regulations per season
- Auto-calculated standings with tiebreaks

### v1.0.0 (2026-01-30)

- Initial API documentation
- Auth endpoints (login, refresh, logout)
- Teams management
- Players listing
- Match details and events
- Schedule management

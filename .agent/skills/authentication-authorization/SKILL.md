---
name: Authentication & Authorization
description: JWT auth, OAuth, OTP verification, session management, RBAC for SE104_VLEAGUE
---

# Authentication & Authorization Skill

## Authentication Architecture

### Token Strategy

| Token              | Storage                                        | Lifetime                    | Purpose           |
| ------------------ | ---------------------------------------------- | --------------------------- | ----------------- |
| Access Token (JWT) | In-memory (frontend)                           | 15min                       | API authorization |
| Refresh Token      | `localStorage` (frontend), sha256-hashed in DB | 7d (30d with "remember me") | Token renewal     |

### JWT Payload

```json
{
  "sub": "user-uuid",
  "email": "user@email.com",
  "role": "ADMIN",
  "name": "User Name",
  "iat": 1234567890,
  "exp": 1234568790
}
```

---

## User Roles (5)

| Role           | Description                         |
| -------------- | ----------------------------------- |
| `ADMIN`        | Full system access, user management |
| `TEAM_MANAGER` | Manage own team roster, players     |
| `REFEREE`      | Add/remove match events             |
| `SUPERVISOR`   | Read-only oversight                 |
| `PUBLIC`       | Basic authenticated access          |

### Dual RBAC Implementation

Roles are stored in two places (for flexibility):

1. **`role` enum field** on `User` model — used by guards
2. **`roleId` FK** to `roles` table — future extensibility

---

## Auth API Endpoints (19)

### Public (No JWT)

| Method | Endpoint                | Rate Limit   | Description                            |
| ------ | ----------------------- | ------------ | -------------------------------------- |
| POST   | `/auth/register`        | 5/min        | Register + send verification OTP       |
| POST   | `/auth/verify-email`    | 5/10s        | Verify email with 6-digit OTP          |
| POST   | `/auth/resend-otp`      | 3/min        | Resend verification OTP (60s cooldown) |
| POST   | `/auth/forgot-password` | 3/min        | Request password reset OTP             |
| POST   | `/auth/reset-password`  | 5/10s        | Reset password with OTP                |
| POST   | `/auth/login`           | 5/min        | Login → access + refresh tokens        |
| POST   | `/auth/refresh`         | SkipThrottle | Refresh access token                   |
| POST   | `/auth/logout`          | SkipThrottle | Revoke refresh token                   |

### Protected (JWT Required)

| Method | Endpoint                    | Description                         |
| ------ | --------------------------- | ----------------------------------- |
| GET    | `/auth/me`                  | Current user profile                |
| POST   | `/auth/change-password`     | Change password (validates current) |
| POST   | `/auth/logout-all`          | Revoke all sessions                 |
| PATCH  | `/auth/profile`             | Update name/avatarUrl               |
| GET    | `/auth/sessions`            | List active sessions                |
| DELETE | `/auth/sessions/:sessionId` | Revoke specific session             |
| POST   | `/auth/set-password`        | Set password for OAuth-only users   |

### OAuth

| Method | Endpoint                  | Description                           |
| ------ | ------------------------- | ------------------------------------- |
| GET    | `/auth/google`            | Start Google OAuth flow               |
| GET    | `/auth/google/callback`   | Google callback → redirect frontend   |
| GET    | `/auth/facebook`          | Start Facebook OAuth flow             |
| GET    | `/auth/facebook/callback` | Facebook callback → redirect frontend |

---

## Email Verification Flow

1. User registers → `AUTH_EMAIL_EXISTS` check
2. OTP generated: 6-digit code, 10min expiry, stored in `otp_codes` table
3. Email sent via `MailService.sendEmailVerificationOtp()`
4. User submits OTP → `emailVerified = true`
5. **Resend cooldown**: 60 seconds between requests
6. **Dev mode**: `MAIL_SKIP_SEND=true` logs OTP to console

---

## Password Security

- **Hashing**: bcrypt with salt rounds
- **Validation**: Minimum strength rules enforced by DTO validators
- **Reset**: OTP-based (prevents email enumeration — always returns generic success)
- **Change**: Requires current password, prevents reuse of same password
- **OAuth password**: Users who signed up via OAuth can set a password later

---

## OAuth Integration

### Google OAuth 2.0

```
GET /api/auth/google → Google consent screen
→ GET /api/auth/google/callback → generate tokens
→ Redirect: {FRONTEND_URL}/auth/oauth-callback?accessToken=...&refreshToken=...
```

### Facebook OAuth

Same flow as Google, different strategy.

### Account Linking

- OAuth login with existing email → auto-links to existing account (sets `googleId`/`facebookId`)
- New OAuth email → creates new account (auto-verified, welcome email sent)

---

## Session Management

### Refresh Token Schema

```prisma
model RefreshToken {
  id         String    @id @default(uuid()) @db.Uuid
  tokenHash  String    @map("token_hash")       // sha256 hash
  userId     String    @map("user_id") @db.Uuid
  userAgent  String?   @map("user_agent")
  ipAddress  String?   @map("ip_address")
  deviceName String?   @map("device_name")       // Parsed from UA
  lastUsedAt DateTime  @default(now()) @map("last_used_at")
  revokedAt  DateTime? @map("revoked_at")
  expiresAt  DateTime  @map("expires_at")
}
```

### Features

- **Device tracking**: User agent, IP address, device name (parsed from UA)
- **Session listing**: `GET /auth/sessions` shows all active sessions
- **Individual revoke**: `DELETE /auth/sessions/:id`
- **Bulk revoke**: `POST /auth/logout-all`
- **Auto-expiry**: Token expires based on `expiresAt`

---

## Backend Guards & Decorators

### Guards

| Guard                   | Purpose                                       |
| ----------------------- | --------------------------------------------- |
| `JwtAuthGuard` (global) | Validates JWT; skips `@Public()` routes       |
| `RolesGuard` (global)   | Checks `@Roles()` metadata vs `req.user.role` |
| `GoogleAuthGuard`       | Passport Google OAuth strategy                |
| `FacebookAuthGuard`     | Passport Facebook OAuth strategy              |

### Decorators

```typescript
@Public()                          // Skip JWT auth
@Roles(UserRole.ADMIN)             // Require ADMIN role
@Roles(UserRole.ADMIN, UserRole.TEAM_MANAGER)  // Multiple roles (OR)
@CurrentUser()                     // Extract user from request
```

### Strategies

| Strategy           | Config Key                                                        |
| ------------------ | ----------------------------------------------------------------- |
| `JwtStrategy`      | `JWT_SECRET`                                                      |
| `GoogleStrategy`   | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` |
| `FacebookStrategy` | `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`, `FACEBOOK_CALLBACK_URL` |

---

## Frontend Auth Flow

### AuthContext (`src/auth/AuthContext.tsx`)

```
App mount → attempt silent refresh (stored RT)
  ├── Success → decode JWT → set user, isAuthed=true
  └── Fail → isAuthed=false, show login

Login → POST /auth/login → store AT (memory) + RT (localStorage)
  → decode JWT → set user

OAuth → /auth/oauth-callback → applyOAuthTokens(at, rt) → decode JWT

Logout → POST /auth/logout → clear tokens → redirect /login
```

### Token Refresh Interceptor (`lib/api.ts`)

- Axios response interceptor catches 401
- Queues concurrent failing requests while refresh is in progress
- Only ONE refresh request runs at a time
- On refresh success: replays queued requests with new token
- On refresh failure: dispatches `auth:expired` custom event → AuthContext clears state

### Rate Limit Handling

- 429 responses trigger `api:rate-limited` custom event
- Frontend can show notification to user

### Route Guards

```typescript
<RequireAuth>      // Redirects to /login if !isAuthed, preserves location
  <RequireRole allow={['ADMIN']}>  // Redirects to /403 if wrong role
    <ProtectedPage />
  </RequireRole>
</RequireAuth>
```

---

## Environment Variables

```env
# Backend
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:8080/api/auth/google/callback
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
FACEBOOK_CALLBACK_URL=http://localhost:8080/api/auth/facebook/callback
FRONTEND_URL=http://localhost:5173
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=...
MAIL_PASS=...
MAIL_FROM=noreply@vleague.local
MAIL_SKIP_SEND=true
```

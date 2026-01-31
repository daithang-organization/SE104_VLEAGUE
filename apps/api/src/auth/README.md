# Auth Module

Module xử lý authentication (xác thực) và authorization (phân quyền) cho hệ thống VLeague.

## Mục đích

Cung cấp các chức năng liên quan đến bảo mật:
- Đăng ký tài khoản mới với xác thực email
- Xác thực người dùng (login/logout)
- Quản lý JWT tokens (access + refresh tokens)
- Quên mật khẩu và đặt lại mật khẩu với OTP
- Bảo vệ routes với guards
- Role-based access control (RBAC)

## Roles trong hệ thống

| Role | Description | Permissions |
|------|-------------|-------------|
| `ADMIN` | Quản trị viên | Toàn quyền - quản lý hệ thống |
| `TEAM_MANAGER` | Quản lý đội bóng | Quản lý thông tin đội và cầu thủ |
| `REFEREE` | Trọng tài | Nhập kết quả trận đấu |
| `SUPERVISOR` | Giám sát viên | Xem báo cáo và thống kê |
| `PUBLIC` | Công khai | Xem thông tin cơ bản (không cần đăng nhập) |

## Cấu trúc

```
auth/
├── auth.module.ts       # Module definition
├── auth.controller.ts   # Authentication endpoints
├── auth.service.ts      # Authentication business logic
├── index.ts             # Public exports
├── dto/
│   ├── index.ts
│   ├── login.dto.ts           # Login request validation
│   ├── register.dto.ts        # Register request validation
│   ├── verify-email.dto.ts    # Email verification with OTP
│   ├── resend-otp.dto.ts      # Resend OTP request
│   ├── forgot-password.dto.ts # Forgot password request
│   ├── reset-password.dto.ts  # Reset password with OTP
│   ├── refresh.dto.ts         # Refresh token request
│   ├── logout.dto.ts          # Logout request
│   └── auth-response.dto.ts   # Response DTOs
├── guards/
│   ├── index.ts
│   ├── jwt-auth.guard.ts      # JWT authentication guard
│   └── roles.guard.ts         # Role-based authorization guard
├── strategies/
│   ├── index.ts
│   └── jwt.strategy.ts        # Passport JWT strategy
└── decorators/
    ├── index.ts
    ├── roles.decorator.ts     # @Roles() decorator
    └── current-user.decorator.ts  # @CurrentUser() decorator
```

## API Endpoints

### POST /auth/register
Đăng ký tài khoản mới. Gửi OTP xác thực về email.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password@123"
}
```

**Response (200 OK):**
```json
{
  "message": "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.",
  "email": "user@example.com"
}
```

### POST /auth/verify-email
Xác thực email bằng mã OTP.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (200 OK):**
```json
{
  "message": "Xác thực email thành công. Bạn có thể đăng nhập ngay bây giờ."
}
```

### POST /auth/resend-otp
Gửi lại mã OTP xác thực email (có cooldown 60 giây).

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "Đã gửi lại mã OTP. Vui lòng kiểm tra email."
}
```

### POST /auth/forgot-password
Yêu cầu đặt lại mật khẩu. Gửi OTP về email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "Nếu email tồn tại, bạn sẽ nhận được mã OTP để đặt lại mật khẩu."
}
```

### POST /auth/reset-password
Đặt lại mật khẩu với OTP.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "NewPassword@123"
}
```

**Response (200 OK):**
```json
{
  "message": "Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới."
}
```

### POST /auth/login
Xác thực người dùng với email và password.

**Request Body:**
```json
{
  "email": "admin@vleague.vn",
  "password": "admin123"
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "a1b2c3d4e5f6...",
  "user": {
    "id": "uuid",
    "email": "admin@vleague.vn",
    "role": "ADMIN",
    "createdAt": "2026-01-30T10:00:00.000Z"
  }
}
```

### POST /auth/refresh
Lấy access token mới từ refresh token.

**Request Body:**
```json
{
  "refreshToken": "a1b2c3d4e5f6..."
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### POST /auth/logout
Vô hiệu hóa refresh token (revoke).

**Request Body:**
```json
{
  "refreshToken": "a1b2c3d4e5f6..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Error Response Format

Tất cả errors đều có format thống nhất:
```json
{
  "code": "AUTH_INVALID_CREDENTIALS",
  "message": "Invalid email or password",
  "details": {}
}
```

**Error Codes:**
- `AUTH_INVALID_CREDENTIALS` - Sai email hoặc password
- `AUTH_INVALID_REFRESH_TOKEN` - Refresh token không hợp lệ hoặc đã hết hạn
- `AUTH_TOKEN_EXPIRED` - Access token đã hết hạn
- `AUTH_UNAUTHORIZED` - Chưa xác thực
- `AUTH_FORBIDDEN` - Không đủ quyền truy cập

## Components

### `auth.module.ts`
Định nghĩa Auth module và dependencies.

**Imports:**
- `JwtModule` - Để generate và verify JWT tokens
- `PassportModule` - Để sử dụng Passport strategies
- `PrismaModule` - Để truy cập database

**Exports:**
- `AuthService` - Để các module khác sử dụng
- Guards và strategies

### `auth.controller.ts`
HTTP endpoints cho authentication.

**Endpoints:**
- `POST /auth/login` - User login
- `POST /auth/register` - User registration (nếu có)
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get current user profile
- `POST /auth/refresh` - Refresh access token

### `auth.service.ts`
Business logic cho authentication.

**Methods:**
- `validateUser()` - Validate username/password
- `login()` - Generate JWT token
- `register()` - Create new user
- `hashPassword()` - Hash password với bcrypt
- `comparePassword()` - Compare hashed passwords
- `validateToken()` - Verify JWT token

## Authentication Flow

1. **Login:**
   ```
   Client → POST /auth/login {username, password}
          → AuthController.login()
          → AuthService.validateUser()
          → AuthService.login()
          ← JWT token
   ```

2. **Protected Routes:**
   ```
   Client → GET /api/resource (with JWT in header)
          → JwtAuthGuard validates token
          → If valid → Controller handles request
          → If invalid → 401 Unauthorized
   ```

## JWT Strategy

Token payload thường chứa:
```typescript
{
  sub: userId,      // Subject (user ID)
  username: string,
  role: string,     // User role (admin, manager, etc.)
  iat: number,      // Issued at
  exp: number       // Expiration time
}
```

## Guards & Decorators

### Guards
- `JwtAuthGuard` - Kiểm tra JWT token validity
- `RolesGuard` - Kiểm tra user roles

### Decorators (nếu có)
- `@Public()` - Skip authentication
- `@Roles(role1, role2)` - Require specific roles
- `@CurrentUser()` - Extract user từ request

## Usage trong các modules khác

```typescript
// Trong controller
import { JwtAuthGuard, RolesGuard, Roles, Role } from '../auth';

@Controller('teams')
@UseGuards(JwtAuthGuard, RolesGuard)  // Protect toàn bộ controller
export class TeamsController {

  @Get()
  @Roles(Role.ADMIN, Role.TEAM_MANAGER, Role.SUPERVISOR)
  findAll() {
    // ADMIN, TEAM_MANAGER, SUPERVISOR mới access được
  }

  @Post()
  @Roles(Role.ADMIN)  // Chỉ ADMIN
  create(@Body() dto: CreateTeamDto) {
    // ...
  }
}
```

### Các Role có sẵn

```typescript
import { Role } from '../auth';

Role.ADMIN         // Quản trị viên
Role.TEAM_MANAGER  // Quản lý đội bóng
Role.REFEREE       // Trọng tài
Role.SUPERVISOR    // Giám sát viên
Role.PUBLIC        // Công khai
```

## Environment Variables

```env
JWT_SECRET=your-secret-key
JWT_EXPIRATION=1d
```

## Security Best Practices

- ✅ Hash passwords với bcrypt (salt rounds >= 10)
- ✅ Use strong JWT secret
- ✅ Set appropriate token expiration
- ✅ Validate input data
- ✅ Use HTTPS in production
- ✅ Implement refresh token mechanism
- ✅ Store sensitive data in environment variables
- ❌ Never log passwords hoặc tokens
- ❌ Never return passwords trong responses

## Testing

```bash
# Run auth tests
pnpm test auth

# Test login endpoint
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}'
```

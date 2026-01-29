# Auth Module

Module xử lý authentication (xác thực) và authorization (phân quyền) cho hệ thống VLeague.

## Mục đích

Cung cấp các chức năng liên quan đến bảo mật:
- Xác thực người dùng (login/logout)
- Quản lý JWT tokens
- Bảo vệ routes với guards
- Role-based access control (RBAC)

## Cấu trúc

```
auth/
├── auth.module.ts       # Module definition
├── auth.controller.ts   # Authentication endpoints
└── auth.service.ts      # Authentication business logic
```

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
@Controller('teams')
@UseGuards(JwtAuthGuard)  // Protect toàn bộ controller
export class TeamsController {

  @Get()
  findAll() {
    // Chỉ authenticated users mới access được
  }

  @Post()
  @Roles('admin', 'manager')  // Chỉ admin hoặc manager
  create(@Body() dto: CreateTeamDto) {
    // ...
  }
}
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

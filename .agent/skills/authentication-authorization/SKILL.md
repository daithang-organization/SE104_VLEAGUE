---
name: Authentication & Authorization
description: Guide for implementing secure authentication and authorization patterns in SE104_VLEAGUE using JWT, OAuth, and RBAC
---

# Authentication & Authorization Skill

This skill covers secure authentication and authorization patterns for the SE104_VLEAGUE project.

## Overview

The project uses:

- **JWT**: Access and refresh tokens for API authentication
- **Passport.js**: Authentication strategies (JWT, Google OAuth)
- **bcrypt**: Password hashing
- **RBAC**: Role-based access control (USER, ADMIN)

## JWT Token Strategy

### Access & Refresh Token Pattern

```
┌──────────┐       ┌──────────┐       ┌──────────┐
│  Client  │──────▶│   API    │──────▶│ Database │
└──────────┘       └──────────┘       └──────────┘
     │                  │
     │  1. Login        │
     │  (email/pass)    │
     │─────────────────▶│
     │                  │ 2. Validate credentials
     │                  │ 3. Generate tokens
     │◀─────────────────│
     │  accessToken     │
     │  refreshToken    │
     │                  │
     │  4. API Request  │
     │  (Authorization  │
     │   Bearer token)  │
     │─────────────────▶│
     │                  │ 5. Validate JWT
     │◀─────────────────│
     │  Response        │
```

### Token Configuration

```typescript
// auth/auth.module.ts
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '15m' }, // Access token: 15 minutes
      }),
    }),
  ],
})
export class AuthModule {}
```

### Token Generation

```typescript
// auth/auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    // Store refresh token hash in database
    await this.prisma.refreshToken.create({
      data: {
        token: await bcrypt.hash(refreshToken, 10),
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);
      const stored = await this.prisma.refreshToken.findFirst({
        where: { userId: payload.sub, revoked: false },
      });

      if (!stored || !(await bcrypt.compare(refreshToken, stored.token))) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Revoke old token
      await this.prisma.refreshToken.update({
        where: { id: stored.id },
        data: { revoked: true },
      });

      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
```

## Password Security

### Hashing Passwords

```typescript
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

// Hash password before storing
async register(dto: RegisterDto) {
  const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

  return this.prisma.user.create({
    data: {
      email: dto.email,
      passwordHash,
      role: 'USER',
    },
  });
}

// Verify password during login
async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
```

### Password Validation Rules

```typescript
// auth/dto/register.dto.ts
import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/(?=.*[a-z])/, { message: 'Password must contain lowercase letter' })
  @Matches(/(?=.*[A-Z])/, { message: 'Password must contain uppercase letter' })
  @Matches(/(?=.*\d)/, { message: 'Password must contain number' })
  password: string;
}
```

## JWT Strategy

### Passport JWT Strategy

```typescript
// auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return { id: user.id, email: user.email, role: user.role };
  }
}
```

## Google OAuth Integration

### Google Strategy

```typescript
// auth/strategies/google.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    config: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: config.get('GOOGLE_CLIENT_ID'),
      clientSecret: config.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: config.get('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
    const { emails, displayName, id } = profile;
    const email = emails[0].value;

    // Find or create user
    let user = await this.authService.findByEmail(email);

    if (!user) {
      user = await this.authService.createOAuthUser({
        email,
        name: displayName,
        googleId: id,
      });
    }

    done(null, user);
  }
}
```

### OAuth Endpoints

```typescript
// auth/auth.controller.ts
@Controller('auth')
export class AuthController {
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req, @Res() res: Response) {
    const tokens = await this.authService.generateTokens(req.user);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${tokens.accessToken}`);
  }
}
```

## Role-Based Access Control (RBAC)

### User Roles Schema

```prisma
enum UserRole {
  USER
  ADMIN
}

model User {
  id           String    @id @default(uuid())
  email        String    @unique
  passwordHash String?   @map("password_hash")
  role         UserRole  @default(USER)

  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  @@map("users")
}
```

### Role Decorator and Guard

```typescript
// auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

// auth/guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
```

### Usage in Controllers

```typescript
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Get('users')
  @Roles(UserRole.ADMIN)
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @Delete('users/:id')
  @Roles(UserRole.ADMIN)
  async deleteUser(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
```

## Email Verification

### OTP-Based Verification

```typescript
// auth/auth.service.ts
async sendVerificationEmail(userId: string) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await this.prisma.otpCode.create({
    data: {
      code: otp,
      userId,
      type: 'EMAIL_VERIFICATION',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    },
  });

  await this.mailService.sendVerificationEmail(user.email, otp);
}

async verifyEmail(userId: string, code: string) {
  const otp = await this.prisma.otpCode.findFirst({
    where: {
      userId,
      code,
      type: 'EMAIL_VERIFICATION',
      used: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!otp) {
    throw new BadRequestException('Invalid or expired code');
  }

  await this.prisma.$transaction([
    this.prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    }),
    this.prisma.otpCode.update({
      where: { id: otp.id },
      data: { used: true },
    }),
  ]);
}
```

## Security Best Practices

> [!IMPORTANT]
> **Environment Variables**: Never hardcode secrets. Use `.env` files locally and secure secrets management in production.

> [!WARNING]
> **Token Storage**: Store refresh tokens securely (HttpOnly cookies preferred over localStorage for web apps).

> [!TIP]
> **Rate Limiting**: Implement rate limiting on auth endpoints to prevent brute force attacks.

### Required Environment Variables

```env
# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_CALLBACK_URL=http://localhost:8080/auth/google/callback

# Frontend
FRONTEND_URL=http://localhost:5173
```

## Complete Auth Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Authentication Flow                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────────────────┐   │
│  │  Login   │───▶│ Validate │───▶│ Generate Tokens      │   │
│  │  Request │    │ Creds    │    │ (access + refresh)   │   │
│  └──────────┘    └──────────┘    └──────────────────────┘   │
│                                            │                 │
│                                            ▼                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Store refresh in DB                      │   │
│  │              Return tokens to client                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                    Protected Request Flow                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │  Request │───▶│ JWT      │───▶│ Roles    │───▶ Handler   │
│  │  + Token │    │ Guard    │    │ Guard    │              │
│  └──────────┘    └──────────┘    └──────────┘              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

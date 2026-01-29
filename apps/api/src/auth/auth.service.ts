import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

type JwtUserPayload = { sub: string; email: string; role: string };

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  private hashToken(raw: string) {
    // sha256 là đủ để hash refresh token lưu DB
    return createHash('sha256').update(raw).digest('hex');
  }

  // parse "15m", "7d" -> ms
  private parseTtlToMs(ttl: string): number {
    const m = ttl.trim().match(/^(\d+)([smhd])$/i);
    if (!m) return 7 * 24 * 60 * 60 * 1000;

    const n = Number(m[1]);
    const unit = m[2].toLowerCase();

    const mul =
      unit === 's'
        ? 1000
        : unit === 'm'
          ? 60_000
          : unit === 'h'
            ? 3_600_000
            : 86_400_000;

    return n * mul;
  }

  // Convert TTL string to seconds for JWT
  private ttlToSeconds(ttl: string): number {
    return Math.floor(this.parseTtlToMs(ttl) / 1000);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    const ok = user && (await bcrypt.compare(password, user.passwordHash));
    if (!ok) {
      throw new UnauthorizedException({
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Email hoặc mật khẩu không đúng',
      });
    }

    const payload: JwtUserPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwt.signAsync(
      { ...payload },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: this.ttlToSeconds(process.env.JWT_ACCESS_TTL ?? '15m'),
      },
    );

    // Refresh token: random string (dễ revoke)
    const refreshToken = randomBytes(48).toString('base64url');
    const refreshTokenHash = this.hashToken(refreshToken);

    const expiresAt = new Date(
      Date.now() + this.parseTtlToMs(process.env.JWT_REFRESH_TTL ?? '7d'),
    );

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: refreshTokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  async refresh(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);

    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    const valid =
      stored && !stored.revokedAt && stored.expiresAt.getTime() > Date.now();

    if (!valid) {
      throw new UnauthorizedException({
        code: 'AUTH_REFRESH_INVALID',
        message: 'Refresh token không hợp lệ hoặc đã hết hạn',
      });
    }

    const payload: JwtUserPayload = {
      sub: stored.user.id,
      email: stored.user.email,
      role: stored.user.role,
    };

    const accessToken = await this.jwt.signAsync(
      { ...payload },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: this.ttlToSeconds(process.env.JWT_ACCESS_TTL ?? '15m'),
      },
    );

    return { accessToken };
  }

  async logout(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);

    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return { success: true };
  }

  /**
   * Validate JWT payload and return user (for JwtStrategy)
   */
  async validateUser(payload: JwtUserPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}

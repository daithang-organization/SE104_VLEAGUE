import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes, randomInt } from 'crypto';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';

export type JwtUserPayload = { sub: string; email: string; role: string };

// OTP Types - matches Prisma schema enum
const OtpType = {
  EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
  PASSWORD_RESET: 'PASSWORD_RESET',
} as const;

// OTP expiration time in minutes
const OTP_EXPIRATION_MINUTES = 10;
// Minimum time between OTP requests in seconds
const OTP_COOLDOWN_SECONDS = 60;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly mail: MailService,
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

  /**
   * Generate a 6-digit OTP code
   */
  private generateOtp(): string {
    return randomInt(100000, 999999).toString();
  }

  /**
   * Register a new user and send email verification OTP
   */
  async register(email: string, password: string) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      if (existingUser.emailVerified) {
        throw new ConflictException({
          code: 'AUTH_EMAIL_EXISTS',
          message: 'Email đã được đăng ký',
        });
      }
      // User exists but not verified - delete and recreate
      await this.prisma.user.delete({ where: { id: existingUser.id } });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        emailVerified: false,
      },
    });

    // Generate and save OTP
    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);

    await this.prisma.otpCode.create({
      data: {
        code: otp,
        type: OtpType.EMAIL_VERIFICATION,
        userId: user.id,
        expiresAt,
      },
    });

    // Send verification email
    await this.mail.sendEmailVerificationOtp(email, otp);

    return {
      message:
        'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.',
      email: user.email,
    };
  }

  /**
   * Verify email with OTP
   */
  async verifyEmail(email: string, otp: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new BadRequestException({
        code: 'AUTH_USER_NOT_FOUND',
        message: 'Email không tồn tại',
      });
    }

    if (user.emailVerified) {
      throw new BadRequestException({
        code: 'AUTH_EMAIL_ALREADY_VERIFIED',
        message: 'Email đã được xác thực',
      });
    }

    // Find valid OTP
    const otpRecord = await this.prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        code: otp,
        type: OtpType.EMAIL_VERIFICATION,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otpRecord) {
      throw new BadRequestException({
        code: 'AUTH_OTP_INVALID',
        message: 'Mã OTP không hợp lệ hoặc đã hết hạn',
      });
    }

    // Mark OTP as used and verify email
    await this.prisma.$transaction([
      this.prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      }),
    ]);

    // Send welcome email (non-blocking)
    this.mail.sendWelcomeEmail(email).catch(() => {});

    return {
      message: 'Xác thực email thành công. Bạn có thể đăng nhập ngay bây giờ.',
    };
  }

  /**
   * Resend email verification OTP
   */
  async resendVerificationOtp(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new BadRequestException({
        code: 'AUTH_USER_NOT_FOUND',
        message: 'Email không tồn tại',
      });
    }

    if (user.emailVerified) {
      throw new BadRequestException({
        code: 'AUTH_EMAIL_ALREADY_VERIFIED',
        message: 'Email đã được xác thực',
      });
    }

    // Check cooldown
    const lastOtp = await this.prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        type: OtpType.EMAIL_VERIFICATION,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (lastOtp) {
      const timeSinceLastOtp = Date.now() - lastOtp.createdAt.getTime();
      if (timeSinceLastOtp < OTP_COOLDOWN_SECONDS * 1000) {
        const waitTime = Math.ceil(
          (OTP_COOLDOWN_SECONDS * 1000 - timeSinceLastOtp) / 1000,
        );
        throw new BadRequestException({
          code: 'AUTH_OTP_COOLDOWN',
          message: `Vui lòng chờ ${waitTime} giây trước khi gửi lại`,
        });
      }
    }

    // Invalidate old OTPs
    await this.prisma.otpCode.updateMany({
      where: {
        userId: user.id,
        type: OtpType.EMAIL_VERIFICATION,
        usedAt: null,
      },
      data: { usedAt: new Date() },
    });

    // Generate new OTP
    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);

    await this.prisma.otpCode.create({
      data: {
        code: otp,
        type: OtpType.EMAIL_VERIFICATION,
        userId: user.id,
        expiresAt,
      },
    });

    await this.mail.sendEmailVerificationOtp(email, otp);

    return {
      message: 'Đã gửi lại mã OTP. Vui lòng kiểm tra email.',
    };
  }

  /**
   * Request password reset - send OTP to email
   */
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user || !user.emailVerified) {
      return {
        message:
          'Nếu email tồn tại, bạn sẽ nhận được mã OTP để đặt lại mật khẩu.',
      };
    }

    // Check cooldown
    const lastOtp = await this.prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        type: OtpType.PASSWORD_RESET,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (lastOtp) {
      const timeSinceLastOtp = Date.now() - lastOtp.createdAt.getTime();
      if (timeSinceLastOtp < OTP_COOLDOWN_SECONDS * 1000) {
        // Silently return success to prevent timing attacks
        return {
          message:
            'Nếu email tồn tại, bạn sẽ nhận được mã OTP để đặt lại mật khẩu.',
        };
      }
    }

    // Invalidate old OTPs
    await this.prisma.otpCode.updateMany({
      where: {
        userId: user.id,
        type: OtpType.PASSWORD_RESET,
        usedAt: null,
      },
      data: { usedAt: new Date() },
    });

    // Generate new OTP
    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);

    await this.prisma.otpCode.create({
      data: {
        code: otp,
        type: OtpType.PASSWORD_RESET,
        userId: user.id,
        expiresAt,
      },
    });

    await this.mail.sendPasswordResetOtp(email, otp);

    return {
      message:
        'Nếu email tồn tại, bạn sẽ nhận được mã OTP để đặt lại mật khẩu.',
    };
  }

  /**
   * Reset password with OTP
   */
  async resetPassword(email: string, otp: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new BadRequestException({
        code: 'AUTH_OTP_INVALID',
        message: 'Mã OTP không hợp lệ hoặc đã hết hạn',
      });
    }

    // Find valid OTP
    const otpRecord = await this.prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        code: otp,
        type: OtpType.PASSWORD_RESET,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otpRecord) {
      throw new BadRequestException({
        code: 'AUTH_OTP_INVALID',
        message: 'Mã OTP không hợp lệ hoặc đã hết hạn',
      });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Mark OTP as used, update password, and revoke all refresh tokens
    await this.prisma.$transaction([
      this.prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      // Revoke all refresh tokens for security
      this.prisma.refreshToken.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return {
      message:
        'Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới.',
    };
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

    // Check if email is verified
    if (!user.emailVerified) {
      throw new UnauthorizedException({
        code: 'AUTH_EMAIL_NOT_VERIFIED',
        message: 'Vui lòng xác thực email trước khi đăng nhập',
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

  /**
   * Get current user profile
   */
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException({
        code: 'AUTH_USER_NOT_FOUND',
        message: 'Người dùng không tồn tại',
      });
    }

    return user;
  }

  /**
   * Change password for authenticated user
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException({
        code: 'AUTH_USER_NOT_FOUND',
        message: 'Người dùng không tồn tại',
      });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new ForbiddenException({
        code: 'AUTH_INVALID_CURRENT_PASSWORD',
        message: 'Mật khẩu hiện tại không đúng',
      });
    }

    // Prevent using same password
    const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSamePassword) {
      throw new BadRequestException({
        code: 'AUTH_SAME_PASSWORD',
        message: 'Mật khẩu mới phải khác mật khẩu hiện tại',
      });
    }

    // Hash and update password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { success: true, message: 'Đổi mật khẩu thành công' };
  }

  /**
   * Logout from all devices by revoking all refresh tokens
   */
  async logoutAll(userId: string) {
    const result = await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });

    return {
      success: true,
      message: `Đã đăng xuất khỏi ${result.count} thiết bị`,
      revokedCount: result.count,
    };
  }
}

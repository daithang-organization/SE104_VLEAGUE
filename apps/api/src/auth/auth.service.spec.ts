import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let mailService: MailService;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    role: 'USER',
    name: 'Test User',
    emailVerified: true,
    avatarUrl: null,
    googleId: null,
    facebookId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUnverifiedUser = {
    ...mockUser,
    id: 'user-2',
    email: 'unverified@example.com',
    emailVerified: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            otpCode: {
              create: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
            },
            refreshToken: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
              findFirst: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('mock-access-token'),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendEmailVerificationOtp: jest.fn().mockResolvedValue(undefined),
            sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
            sendPasswordResetOtp: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    mailService = module.get<MailService>(MailService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should create a new user and send verification email', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.user, 'create').mockResolvedValue(mockUnverifiedUser);
      jest.spyOn(prisma.otpCode, 'create').mockResolvedValue({} as any);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const result = await service.register('new@example.com', 'password123');

      expect(result.email).toBe('unverified@example.com');
      expect(prisma.user.create).toHaveBeenCalled();
      expect(prisma.otpCode.create).toHaveBeenCalled();
      expect(mailService.sendEmailVerificationOtp).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists and verified', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);

      await expect(
        service.register(mockUser.email, 'password123'),
      ).rejects.toThrow(ConflictException);
    });

    it('should delete unverified user and create new one', async () => {
      jest
        .spyOn(prisma.user, 'findUnique')
        .mockResolvedValue(mockUnverifiedUser);
      jest.spyOn(prisma.user, 'delete').mockResolvedValue(mockUnverifiedUser);
      jest.spyOn(prisma.user, 'create').mockResolvedValue(mockUnverifiedUser);
      jest.spyOn(prisma.otpCode, 'create').mockResolvedValue({} as any);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      await service.register('unverified@example.com', 'password123');

      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: mockUnverifiedUser.id },
      });
      expect(prisma.user.create).toHaveBeenCalled();
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with valid OTP', async () => {
      jest
        .spyOn(prisma.user, 'findUnique')
        .mockResolvedValue(mockUnverifiedUser);
      jest.spyOn(prisma.otpCode, 'findFirst').mockResolvedValue({
        id: 'otp-1',
        code: '123456',
        type: 'EMAIL_VERIFICATION',
        userId: mockUnverifiedUser.id,
        expiresAt: new Date(Date.now() + 600000),
        usedAt: null,
        createdAt: new Date(),
      } as any);
      jest.spyOn(prisma, '$transaction').mockResolvedValue([]);

      const result = await service.verifyEmail(
        'unverified@example.com',
        '123456',
      );

      expect(result.message).toContain('thành công');
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException if user not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(
        service.verifyEmail('nonexistent@example.com', '123456'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if email already verified', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);

      await expect(
        service.verifyEmail(mockUser.email, '123456'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if OTP is invalid', async () => {
      jest
        .spyOn(prisma.user, 'findUnique')
        .mockResolvedValue(mockUnverifiedUser);
      jest.spyOn(prisma.otpCode, 'findFirst').mockResolvedValue(null);

      await expect(
        service.verifyEmail('unverified@example.com', 'wrong-otp'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prisma.refreshToken, 'create').mockResolvedValue({} as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(mockUser.email, 'password123');

      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBeDefined();
      expect(result.user.email).toBe(mockUser.email);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login(mockUser.email, 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(
        service.login('nonexistent@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if email not verified', async () => {
      jest
        .spyOn(prisma.user, 'findUnique')
        .mockResolvedValue(mockUnverifiedUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(
        service.login('unverified@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('should return new access token for valid refresh token', async () => {
      jest.spyOn(prisma.refreshToken, 'findUnique').mockResolvedValue({
        id: 'token-1',
        tokenHash: 'hash',
        userId: mockUser.id,
        expiresAt: new Date(Date.now() + 86400000),
        revokedAt: null,
        user: mockUser,
      } as any);
      jest.spyOn(prisma.refreshToken, 'update').mockResolvedValue({} as any);

      const result = await service.refresh('valid-refresh-token');

      expect(result.accessToken).toBe('mock-access-token');
    });

    it('should throw UnauthorizedException for revoked token', async () => {
      jest.spyOn(prisma.refreshToken, 'findUnique').mockResolvedValue({
        id: 'token-1',
        tokenHash: 'hash',
        userId: mockUser.id,
        expiresAt: new Date(Date.now() + 86400000),
        revokedAt: new Date(),
        user: mockUser,
      } as any);

      await expect(service.refresh('revoked-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for expired token', async () => {
      jest.spyOn(prisma.refreshToken, 'findUnique').mockResolvedValue({
        id: 'token-1',
        tokenHash: 'hash',
        userId: mockUser.id,
        expiresAt: new Date(Date.now() - 86400000), // expired
        revokedAt: null,
        user: mockUser,
      } as any);

      await expect(service.refresh('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for non-existent token', async () => {
      jest.spyOn(prisma.refreshToken, 'findUnique').mockResolvedValue(null);

      await expect(service.refresh('non-existent-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should revoke refresh token', async () => {
      jest
        .spyOn(prisma.refreshToken, 'updateMany')
        .mockResolvedValue({ count: 1 });

      const result = await service.logout('some-token');

      expect(result.success).toBe(true);
      expect(prisma.refreshToken.updateMany).toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    it('should return user for valid payload', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await service.validateUser({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('should return null if user not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      const result = await service.validateUser({
        sub: 'non-existent',
        email: 'test@example.com',
        role: 'USER',
      });

      expect(result).toBeNull();
    });
  });

  describe('getMe', () => {
    it('should return user profile', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await service.getMe(mockUser.id);

      expect(result.id).toBe(mockUser.id);
      expect(result.email).toBe(mockUser.email);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.getMe('non-existent')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getSessions', () => {
    it('should return active sessions for user', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          deviceName: 'Chrome on Windows',
          userAgent: 'Mozilla/5.0',
          ipAddress: '127.0.0.1',
          lastUsedAt: new Date(),
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 86400000),
        },
      ];
      jest
        .spyOn(prisma.refreshToken, 'findMany')
        .mockResolvedValue(mockSessions as any);

      const result = await service.getSessions(mockUser.id);

      expect(result).toHaveLength(1);
      expect(result[0].deviceName).toBe('Chrome on Windows');
    });
  });

  describe('revokeSession', () => {
    it('should revoke a specific session', async () => {
      jest.spyOn(prisma.refreshToken, 'findFirst').mockResolvedValue({
        id: 'session-1',
        userId: mockUser.id,
        revokedAt: null,
      } as any);
      jest.spyOn(prisma.refreshToken, 'update').mockResolvedValue({} as any);

      const result = await service.revokeSession(mockUser.id, 'session-1');

      expect(result.success).toBe(true);
    });

    it('should throw BadRequestException if session not found', async () => {
      jest.spyOn(prisma.refreshToken, 'findFirst').mockResolvedValue(null);

      await expect(
        service.revokeSession(mockUser.id, 'non-existent'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('forgotPassword', () => {
    it('should send password reset OTP for existing user', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prisma.otpCode, 'findFirst').mockResolvedValue(null);
      jest
        .spyOn(prisma.otpCode, 'updateMany')
        .mockResolvedValue({ count: 0 } as any);
      jest.spyOn(prisma.otpCode, 'create').mockResolvedValue({} as any);

      const result = await service.forgotPassword(mockUser.email);

      expect(result.message).toBeDefined();
      expect(mailService.sendPasswordResetOtp).toHaveBeenCalled();
    });

    it('should return same message for non-existent user (security)', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      const result = await service.forgotPassword('nonexistent@example.com');

      expect(result.message).toBeDefined();
      expect(mailService.sendPasswordResetOtp).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid OTP', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prisma.otpCode, 'findFirst').mockResolvedValue({
        id: 'otp-1',
        code: '123456',
        type: 'PASSWORD_RESET',
        userId: mockUser.id,
        expiresAt: new Date(Date.now() + 600000),
        usedAt: null,
      } as any);
      jest.spyOn(prisma, '$transaction').mockResolvedValue([]);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-password');

      const result = await service.resetPassword(
        mockUser.email,
        '123456',
        'newPassword123',
      );

      expect(result.message).toContain('thành công');
    });

    it('should throw BadRequestException for invalid OTP', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(prisma.otpCode, 'findFirst').mockResolvedValue(null);

      await expect(
        service.resetPassword(mockUser.email, 'wrong-otp', 'newPassword123'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('logoutAll', () => {
    it('should revoke all sessions for user', async () => {
      jest
        .spyOn(prisma.refreshToken, 'updateMany')
        .mockResolvedValue({ count: 3 });

      const result = await service.logoutAll(mockUser.id);

      expect(result.success).toBe(true);
      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id, revokedAt: null },
        data: { revokedAt: expect.any(Date) },
      });
    });
  });
});

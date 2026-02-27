import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockReq = {
    user: { id: 'user-1', email: 'test@vleague.local', role: 'USER' },
    headers: { 'user-agent': 'jest' },
    ip: '127.0.0.1',
  } as any;

  const mockTokens = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    user: { id: 'user-1', email: 'test@vleague.local', role: 'USER' },
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@vleague.local',
    role: 'USER',
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest
              .fn()
              .mockResolvedValue({
                message: 'OK',
                email: 'test@vleague.local',
              }),
            verifyEmail: jest.fn().mockResolvedValue({ message: 'Verified' }),
            resendVerificationOtp: jest
              .fn()
              .mockResolvedValue({ message: 'Sent' }),
            forgotPassword: jest.fn().mockResolvedValue({ message: 'Sent' }),
            resetPassword: jest.fn().mockResolvedValue({ message: 'Reset' }),
            login: jest.fn().mockResolvedValue(mockTokens),
            refresh: jest.fn().mockResolvedValue({ accessToken: 'new-token' }),
            logout: jest.fn().mockResolvedValue({ success: true }),
            getMe: jest.fn().mockResolvedValue(mockUser),
            changePassword: jest
              .fn()
              .mockResolvedValue({ success: true, message: 'Changed' }),
            logoutAll: jest
              .fn()
              .mockResolvedValue({
                success: true,
                message: 'Done',
                revokedCount: 3,
              }),
            updateProfile: jest
              .fn()
              .mockResolvedValue({ ...mockUser, name: 'Updated' }),
            getSessions: jest.fn().mockResolvedValue([{ id: 'sess-1' }]),
            revokeSession: jest
              .fn()
              .mockResolvedValue({ success: true, message: 'Revoked' }),
            setPassword: jest
              .fn()
              .mockResolvedValue({ success: true, message: 'Set' }),
            googleLogin: jest.fn().mockResolvedValue(mockTokens),
            facebookLogin: jest.fn().mockResolvedValue(mockTokens),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should delegate to auth.register', async () => {
      const dto = { email: 'test@vleague.local', password: 'Pass@123' };
      const result = await controller.register(dto as any);

      expect(result).toEqual({ message: 'OK', email: 'test@vleague.local' });
      expect(service.register).toHaveBeenCalledWith(dto.email, dto.password);
    });
  });

  describe('verifyEmail', () => {
    it('should delegate to auth.verifyEmail', async () => {
      const dto = { email: 'test@vleague.local', otp: '123456' };
      const result = await controller.verifyEmail(dto as any);

      expect(result).toEqual({ message: 'Verified' });
      expect(service.verifyEmail).toHaveBeenCalledWith(dto.email, dto.otp);
    });
  });

  describe('resendOtp', () => {
    it('should delegate to auth.resendVerificationOtp', async () => {
      const dto = { email: 'test@vleague.local' };
      const result = await controller.resendOtp(dto as any);

      expect(result).toEqual({ message: 'Sent' });
      expect(service.resendVerificationOtp).toHaveBeenCalledWith(dto.email);
    });
  });

  describe('forgotPassword', () => {
    it('should delegate to auth.forgotPassword', async () => {
      const dto = { email: 'test@vleague.local' };
      const result = await controller.forgotPassword(dto as any);

      expect(result).toEqual({ message: 'Sent' });
      expect(service.forgotPassword).toHaveBeenCalledWith(dto.email);
    });
  });

  describe('resetPassword', () => {
    it('should delegate to auth.resetPassword', async () => {
      const dto = {
        email: 'test@vleague.local',
        otp: '123456',
        newPassword: 'NewPass@123',
      };
      const result = await controller.resetPassword(dto as any);

      expect(result).toEqual({ message: 'Reset' });
      expect(service.resetPassword).toHaveBeenCalledWith(
        dto.email,
        dto.otp,
        dto.newPassword,
      );
    });
  });

  describe('login', () => {
    it('should delegate to auth.login with request context', async () => {
      const dto = {
        email: 'test@vleague.local',
        password: 'Pass@123',
        rememberMe: true,
      };
      const result = await controller.login(mockReq, dto as any);

      expect(result).toEqual(mockTokens);
      expect(service.login).toHaveBeenCalledWith(dto.email, dto.password, {
        rememberMe: true,
        userAgent: 'jest',
        ipAddress: '127.0.0.1',
      });
    });
  });

  describe('refresh', () => {
    it('should delegate to auth.refresh', async () => {
      const dto = { refreshToken: 'token-123' };
      const result = await controller.refresh(dto as any);

      expect(result).toEqual({ accessToken: 'new-token' });
      expect(service.refresh).toHaveBeenCalledWith('token-123');
    });
  });

  describe('logout', () => {
    it('should delegate to auth.logout', async () => {
      const dto = { refreshToken: 'token-123' };
      const result = await controller.logout(dto as any);

      expect(result).toEqual({ success: true });
      expect(service.logout).toHaveBeenCalledWith('token-123');
    });
  });

  describe('getMe', () => {
    it('should delegate to auth.getMe with user id', async () => {
      const result = await controller.getMe(mockReq);

      expect(result).toEqual(mockUser);
      expect(service.getMe).toHaveBeenCalledWith('user-1');
    });
  });

  describe('changePassword', () => {
    it('should delegate to auth.changePassword', async () => {
      const dto = { currentPassword: 'old', newPassword: 'new' };
      const result = await controller.changePassword(mockReq, dto as any);

      expect(result).toEqual({ success: true, message: 'Changed' });
      expect(service.changePassword).toHaveBeenCalledWith(
        'user-1',
        'old',
        'new',
      );
    });
  });

  describe('logoutAll', () => {
    it('should delegate to auth.logoutAll with user id', async () => {
      const result = await controller.logoutAll(mockReq);

      expect(result).toEqual({
        success: true,
        message: 'Done',
        revokedCount: 3,
      });
      expect(service.logoutAll).toHaveBeenCalledWith('user-1');
    });
  });

  describe('updateProfile', () => {
    it('should delegate to auth.updateProfile', async () => {
      const dto = { name: 'Updated' };
      const result = await controller.updateProfile(mockReq, dto as any);

      expect(result.name).toBe('Updated');
      expect(service.updateProfile).toHaveBeenCalledWith('user-1', dto);
    });
  });

  describe('getSessions', () => {
    it('should delegate to auth.getSessions with user id', async () => {
      const result = await controller.getSessions(mockReq);

      expect(result).toEqual([{ id: 'sess-1' }]);
      expect(service.getSessions).toHaveBeenCalledWith('user-1');
    });
  });

  describe('revokeSession', () => {
    it('should delegate to auth.revokeSession', async () => {
      const result = await controller.revokeSession(mockReq, 'sess-1');

      expect(result).toEqual({ success: true, message: 'Revoked' });
      expect(service.revokeSession).toHaveBeenCalledWith('user-1', 'sess-1');
    });
  });

  describe('setPassword', () => {
    it('should delegate to auth.setPassword', async () => {
      const dto = { newPassword: 'NewPass@123' };
      const result = await controller.setPassword(mockReq, dto as any);

      expect(result).toEqual({ success: true, message: 'Set' });
      expect(service.setPassword).toHaveBeenCalledWith('user-1', 'NewPass@123');
    });
  });

  describe('googleCallback', () => {
    it('should call googleLogin and redirect', async () => {
      const googleReq = {
        ...mockReq,
        user: { googleId: 'g-1', email: 'test@gmail.com', name: 'Test' },
      };
      const mockRes = { redirect: jest.fn() } as any;

      await controller.googleCallback(googleReq, mockRes);

      expect(service.googleLogin).toHaveBeenCalledWith(googleReq.user, {
        userAgent: 'jest',
        ipAddress: '127.0.0.1',
      });
      expect(mockRes.redirect).toHaveBeenCalledWith(
        expect.stringContaining('/auth/oauth-callback?'),
      );
    });
  });

  describe('facebookCallback', () => {
    it('should call facebookLogin and redirect', async () => {
      const fbReq = {
        ...mockReq,
        user: { facebookId: 'fb-1', email: 'test@fb.com', name: 'Test' },
      };
      const mockRes = { redirect: jest.fn() } as any;

      await controller.facebookCallback(fbReq, mockRes);

      expect(service.facebookLogin).toHaveBeenCalledWith(fbReq.user, {
        userAgent: 'jest',
        ipAddress: '127.0.0.1',
      });
      expect(mockRes.redirect).toHaveBeenCalledWith(
        expect.stringContaining('/auth/oauth-callback?'),
      );
    });
  });
});

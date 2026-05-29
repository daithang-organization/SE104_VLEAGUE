import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiExcludeEndpoint,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { FacebookAuthGuard } from './guards/facebook-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

interface RequestWithUser {
  user: { id: string; email: string; role: string };
  headers: { 'user-agent'?: string };
  ip?: string;
}

interface GoogleUser {
  googleId: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

interface FacebookUser {
  facebookId: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @ApiBody({ type: RegisterDto })
  @ApiOkResponse({
    schema: {
      example: {
        message:
          'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.',
        email: 'user@example.com',
      },
    },
  })
  @ApiConflictResponse({
    schema: {
      example: {
        code: 'AUTH_EMAIL_EXISTS',
        message: 'Email đã được đăng ký',
      },
    },
  })
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto.email, dto.password);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Xác thực email bằng OTP' })
  @ApiBody({ type: VerifyEmailDto })
  @ApiOkResponse({
    schema: {
      example: {
        message:
          'Xác thực email thành công. Bạn có thể đăng nhập ngay bây giờ.',
      },
    },
  })
  @ApiBadRequestResponse({
    schema: {
      example: {
        code: 'AUTH_OTP_INVALID',
        message: 'Mã OTP không hợp lệ hoặc đã hết hạn',
      },
    },
  })
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.auth.verifyEmail(dto.email, dto.otp);
  }

  @Post('resend-otp')
  @ApiOperation({ summary: 'Gửi lại mã OTP xác thực email' })
  @ApiBody({ type: ResendOtpDto })
  @ApiOkResponse({
    schema: {
      example: {
        message: 'Đã gửi lại mã OTP. Vui lòng kiểm tra email.',
      },
    },
  })
  @ApiBadRequestResponse({
    schema: {
      example: {
        code: 'AUTH_OTP_COOLDOWN',
        message: 'Vui lòng chờ 60 giây trước khi gửi lại',
      },
    },
  })
  resendOtp(@Body() dto: ResendOtpDto) {
    return this.auth.resendVerificationOtp(dto.email);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Yêu cầu đặt lại mật khẩu' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiOkResponse({
    schema: {
      example: {
        message:
          'Nếu email tồn tại, bạn sẽ nhận được mã OTP để đặt lại mật khẩu.',
      },
    },
  })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Đặt lại mật khẩu với OTP' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiOkResponse({
    schema: {
      example: {
        message:
          'Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới.',
      },
    },
  })
  @ApiBadRequestResponse({
    schema: {
      example: {
        code: 'AUTH_OTP_INVALID',
        message: 'Mã OTP không hợp lệ hoặc đã hết hạn',
      },
    },
  })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto.email, dto.otp, dto.newPassword);
  }

  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    schema: {
      example: {
        accessToken: '...',
        refreshToken: '...',
        user: { id: 'uuid', email: 'admin@vleague.local', role: 'ADMIN' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    schema: {
      example: {
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Email hoặc mật khẩu không đúng',
      },
    },
  })
  login(@Req() req: RequestWithUser, @Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password, {
      rememberMe: dto.rememberMe,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Làm mới access token' })
  @ApiBody({ type: RefreshDto })
  @ApiOkResponse({ schema: { example: { accessToken: '...' } } })
  @ApiUnauthorizedResponse({
    schema: {
      example: {
        code: 'AUTH_REFRESH_INVALID',
        message: 'Refresh token không hợp lệ hoặc đã hết hạn',
      },
    },
  })
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Đăng xuất' })
  @ApiBody({ type: LogoutDto })
  @ApiOkResponse({ schema: { example: { success: true } } })
  logout(@Body() dto: LogoutDto) {
    return this.auth.logout(dto.refreshToken);
  }

  // ===== Protected endpoints (requires JWT) =====

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy thông tin user hiện tại' })
  @ApiOkResponse({
    schema: {
      example: {
        id: 'uuid',
        email: 'user@example.com',
        role: 'USER',
        emailVerified: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiUnauthorizedResponse({
    schema: {
      example: {
        code: 'AUTH_TOKEN_INVALID',
        message: 'Access token không hợp lệ',
      },
    },
  })
  getMe(@Req() req: RequestWithUser) {
    return this.auth.getMe(req.user.id);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Đổi mật khẩu' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiOkResponse({
    schema: {
      example: {
        success: true,
        message: 'Đổi mật khẩu thành công',
      },
    },
  })
  @ApiForbiddenResponse({
    schema: {
      example: {
        code: 'AUTH_INVALID_CURRENT_PASSWORD',
        message: 'Mật khẩu hiện tại không đúng',
      },
    },
  })
  @ApiBadRequestResponse({
    schema: {
      example: {
        code: 'AUTH_SAME_PASSWORD',
        message: 'Mật khẩu mới phải khác mật khẩu hiện tại',
      },
    },
  })
  @ApiUnauthorizedResponse({
    schema: {
      example: {
        code: 'AUTH_TOKEN_INVALID',
        message: 'Access token không hợp lệ',
      },
    },
  })
  changePassword(@Req() req: RequestWithUser, @Body() dto: ChangePasswordDto) {
    return this.auth.changePassword(
      req.user.id,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Đăng xuất khỏi tất cả thiết bị' })
  @ApiOkResponse({
    schema: {
      example: {
        success: true,
        message: 'Đã đăng xuất khỏi 3 thiết bị',
        revokedCount: 3,
      },
    },
  })
  @ApiUnauthorizedResponse({
    schema: {
      example: {
        code: 'AUTH_TOKEN_INVALID',
        message: 'Access token không hợp lệ',
      },
    },
  })
  logoutAll(@Req() req: RequestWithUser) {
    return this.auth.logoutAll(req.user.id);
  }

  // ===== Profile & Session Management =====

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Cập nhật thông tin cá nhân' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiOkResponse({
    schema: {
      example: {
        id: 'uuid',
        email: 'user@example.com',
        role: 'USER',
        name: 'Nguyen Van A',
        avatarUrl: 'https://example.com/avatar.jpg',
        emailVerified: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  updateProfile(@Req() req: RequestWithUser, @Body() dto: UpdateProfileDto) {
    return this.auth.updateProfile(req.user.id, dto);
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy danh sách phiên đăng nhập' })
  @ApiOkResponse({
    schema: {
      example: [
        {
          id: 'uuid',
          deviceName: 'Chrome on Windows',
          userAgent: 'Mozilla/5.0...',
          ipAddress: '192.168.1.1',
          lastUsedAt: '2024-01-15T10:30:00.000Z',
          createdAt: '2024-01-01T00:00:00.000Z',
          expiresAt: '2024-01-31T00:00:00.000Z',
        },
      ],
    },
  })
  getSessions(@Req() req: RequestWithUser) {
    return this.auth.getSessions(req.user.id);
  }

  @Delete('sessions/:sessionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Thu hồi phiên đăng nhập cụ thể' })
  @ApiOkResponse({
    schema: {
      example: {
        success: true,
        message: 'Đã thu hồi phiên đăng nhập',
      },
    },
  })
  @ApiBadRequestResponse({
    schema: {
      example: {
        code: 'AUTH_SESSION_NOT_FOUND',
        message: 'Phiên đăng nhập không tồn tại',
      },
    },
  })
  revokeSession(
    @Req() req: RequestWithUser,
    @Param('sessionId') sessionId: string,
  ) {
    return this.auth.revokeSession(req.user.id, sessionId);
  }

  @Post('set-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Đặt mật khẩu cho tài khoản OAuth' })
  @ApiBody({ type: SetPasswordDto })
  @ApiOkResponse({
    schema: {
      example: {
        success: true,
        message: 'Đặt mật khẩu thành công',
      },
    },
  })
  @ApiBadRequestResponse({
    schema: {
      example: {
        code: 'AUTH_PASSWORD_EXISTS',
        message:
          'Tài khoản đã có mật khẩu. Vui lòng sử dụng chức năng đổi mật khẩu.',
      },
    },
  })
  setPassword(@Req() req: RequestWithUser, @Body() dto: SetPasswordDto) {
    return this.auth.setPassword(req.user.id, dto.newPassword);
  }

  // ===== Google OAuth =====

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Đăng nhập bằng Google' })
  @ApiExcludeEndpoint() // Hidden from Swagger, browser redirect
  googleAuth() {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiExcludeEndpoint()
  async googleCallback(
    @Req() req: RequestWithUser & { user: GoogleUser },
    @Res() res: Response,
  ) {
    const result = await this.auth.googleLogin(req.user, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    // Redirect to frontend with tokens in URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const params = new URLSearchParams({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });

    res.redirect(`${frontendUrl}/auth/oauth-callback?${params.toString()}`);
  }

  // ===== Facebook OAuth =====

  @Get('facebook')
  @UseGuards(FacebookAuthGuard)
  @ApiOperation({ summary: 'Đăng nhập bằng Facebook' })
  @ApiExcludeEndpoint() // Hidden from Swagger, browser redirect
  facebookAuth() {
    // Guard redirects to Facebook
  }

  @Get('facebook/callback')
  @UseGuards(FacebookAuthGuard)
  @ApiExcludeEndpoint()
  async facebookCallback(
    @Req() req: RequestWithUser & { user: FacebookUser },
    @Res() res: Response,
  ) {
    const result = await this.auth.facebookLogin(req.user, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    // Redirect to frontend with tokens in URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const params = new URLSearchParams({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });

    res.redirect(`${frontendUrl}/auth/oauth-callback?${params.toString()}`);
  }
}

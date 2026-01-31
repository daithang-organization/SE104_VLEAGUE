import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

interface RequestWithUser {
  user: { id: string; email: string; role: string };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @Throttle({ long: { ttl: 60000, limit: 5 } }) // 5 requests per minute
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
  @ApiTooManyRequestsResponse({
    description: 'Rate limit: 5 requests/phút',
    schema: {
      example: {
        statusCode: 429,
        message: 'ThrottlerException: Too Many Requests',
      },
    },
  })
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto.email, dto.password);
  }

  @Post('verify-email')
  @Throttle({ medium: { ttl: 10000, limit: 5 } }) // 5 requests per 10 seconds
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
  @Throttle({ long: { ttl: 60000, limit: 3 } }) // 3 requests per minute
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
  @Throttle({ long: { ttl: 60000, limit: 3 } }) // 3 requests per minute
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
  @Throttle({ medium: { ttl: 10000, limit: 5 } }) // 5 requests per 10 seconds
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
  @Throttle({ long: { ttl: 60000, limit: 5 } }) // 5 login attempts per minute
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
  @ApiTooManyRequestsResponse({
    description: 'Rate limit: 5 requests/phút',
    schema: {
      example: {
        statusCode: 429,
        message: 'ThrottlerException: Too Many Requests',
      },
    },
  })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @Post('refresh')
  @SkipThrottle() // Refresh token is already protected by token expiry
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
  @SkipThrottle()
  @ApiOperation({ summary: 'Đăng xuất' })
  @ApiBody({ type: LogoutDto })
  @ApiOkResponse({ schema: { example: { success: true } } })
  logout(@Body() dto: LogoutDto) {
    return this.auth.logout(dto.refreshToken);
  }

  // ===== Protected endpoints (requires JWT) =====

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
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
  @SkipThrottle()
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
  @SkipThrottle()
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
}

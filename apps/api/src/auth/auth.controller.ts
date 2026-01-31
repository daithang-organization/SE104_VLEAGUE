import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

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
        message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.',
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
        message: 'Xác thực email thành công. Bạn có thể đăng nhập ngay bây giờ.',
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
        message: 'Nếu email tồn tại, bạn sẽ nhận được mã OTP để đặt lại mật khẩu.',
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
        message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới.',
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
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @Post('refresh')
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
  @ApiBody({ type: LogoutDto })
  @ApiOkResponse({ schema: { example: { success: true } } })
  logout(@Body() dto: LogoutDto) {
    return this.auth.logout(dto.refreshToken);
  }
}

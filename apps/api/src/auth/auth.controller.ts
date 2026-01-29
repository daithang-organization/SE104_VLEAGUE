import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshDto } from './dto/refresh.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
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

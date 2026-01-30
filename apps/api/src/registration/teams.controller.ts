import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard, Role, Roles, RolesGuard } from '../auth';
import { RegistrationService } from './registration.service';

@ApiTags('Teams')
@ApiBearerAuth('access-token')
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeamsController {
  constructor(private readonly reg: RegistrationService) {}

  @Get('/teams')
  @Roles(Role.ADMIN, Role.TEAM_MANAGER)
  @ApiOperation({
    summary: 'Lấy danh sách đội bóng',
    description:
      'Trả về danh sách tất cả đội bóng. Yêu cầu quyền ADMIN hoặc TEAM_MANAGER.',
  })
  @ApiOkResponse({
    description: 'Danh sách đội bóng',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '550e8400-e29b-41d4-a716-446655440001',
          },
          name: { type: 'string', example: 'Hà Nội FC' },
          status: {
            type: 'string',
            enum: ['ACTIVE', 'INACTIVE'],
            example: 'ACTIVE',
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Chưa đăng nhập hoặc token không hợp lệ',
  })
  @ApiForbiddenResponse({
    description: 'Không có quyền truy cập (yêu cầu ADMIN hoặc TEAM_MANAGER)',
  })
  async getTeams(): Promise<Awaited<ReturnType<typeof this.reg.listTeams>>> {
    return await this.reg.listTeams();
  }
}

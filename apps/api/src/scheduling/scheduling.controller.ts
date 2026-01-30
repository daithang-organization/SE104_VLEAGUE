import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiForbiddenResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard, Role, Roles, RolesGuard } from '../auth';
import { SchedulingService } from './scheduling.service';

@ApiTags('Scheduling')
@ApiBearerAuth('access-token')
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchedulingController {
  constructor(private readonly scheduling: SchedulingService) {}

  @Post('/schedule/generate')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Tạo lịch thi đấu tự động',
    description: 'Tự động tạo lịch thi đấu cho mùa giải. Chỉ ADMIN có quyền thực hiện.',
  })
  @ApiOkResponse({
    description: 'Lịch thi đấu đã được tạo',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        message: { type: 'string', example: 'schedule generation stub' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Chưa đăng nhập hoặc token không hợp lệ' })
  @ApiForbiddenResponse({ description: 'Không có quyền truy cập (yêu cầu ADMIN)' })
  generate() {
    return this.scheduling.generateStub();
  }

  @Post('/schedule/publish')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Công bố lịch thi đấu',
    description: 'Công bố lịch thi đấu ra công chúng. Chỉ ADMIN có quyền thực hiện.',
  })
  @ApiOkResponse({
    description: 'Lịch thi đấu đã được công bố',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        message: { type: 'string', example: 'schedule publish stub' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Chưa đăng nhập hoặc token không hợp lệ' })
  @ApiForbiddenResponse({ description: 'Không có quyền truy cập (yêu cầu ADMIN)' })
  publish() {
    return this.scheduling.publishStub();
  }

  @Get('/schedule')
  @Roles(Role.ADMIN, Role.TEAM_MANAGER, Role.REFEREE)
  @ApiOperation({
    summary: 'Lấy lịch thi đấu',
    description: 'Trả về danh sách tất cả trận đấu theo lịch. Yêu cầu đăng nhập.',
  })
  @ApiOkResponse({
    description: 'Danh sách trận đấu',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        matches: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              roundNo: { type: 'integer', example: 1 },
              homeTeamId: { type: 'string', format: 'uuid' },
              awayTeamId: { type: 'string', format: 'uuid' },
              stadiumId: { type: 'string', format: 'uuid', nullable: true },
              kickoffAt: { type: 'string', format: 'date-time', nullable: true },
              status: { type: 'string', enum: ['DRAFT', 'PUBLISHED', 'LOCKED'] },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Chưa đăng nhập hoặc token không hợp lệ' })
  @ApiForbiddenResponse({ description: 'Không có quyền truy cập' })
  getSchedule() {
    return this.scheduling.getSchedule();
  }
}

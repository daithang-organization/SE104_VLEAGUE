import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
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
    summary: 'Tạo lịch thi đấu tự động (Round-robin)',
    description:
      'Tự động tạo lịch thi đấu round-robin cho mùa giải. Nếu không truyền seasonId, sẽ tìm mùa giải IN_PROGRESS hoặc UPCOMING. Chỉ ADMIN có quyền.',
  })
  @ApiQuery({
    name: 'seasonId',
    required: false,
    type: 'string',
    description: 'ID mùa giải (UUID). Bỏ trống để chọn mùa giải hiện tại.',
  })
  @ApiOkResponse({
    description: 'Lịch thi đấu đã được tạo',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        message: { type: 'string' },
        totalMatches: { type: 'integer', example: 24 },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Chưa đăng nhập' })
  @ApiForbiddenResponse({ description: 'Không có quyền (yêu cầu ADMIN)' })
  generate(@Query('seasonId') seasonId?: string) {
    return this.scheduling.generate(seasonId);
  }

  @Post('/schedule/publish')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Công bố lịch thi đấu',
    description:
      'Chuyển trạng thái tất cả trận DRAFT sang PUBLISHED. Chỉ ADMIN có quyền.',
  })
  @ApiQuery({
    name: 'seasonId',
    required: false,
    type: 'string',
    description: 'ID mùa giải (UUID). Bỏ trống để publish tất cả.',
  })
  @ApiOkResponse({
    description: 'Lịch thi đấu đã được công bố',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        message: { type: 'string' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Chưa đăng nhập' })
  @ApiForbiddenResponse({ description: 'Không có quyền (yêu cầu ADMIN)' })
  publish(@Query('seasonId') seasonId?: string) {
    return this.scheduling.publish(seasonId);
  }

  @Get('/schedule')
  @Roles(
    Role.ADMIN,
    Role.TEAM_MANAGER,
    Role.REFEREE,
    Role.SUPERVISOR,
    Role.PUBLIC,
  )
  @ApiOperation({
    summary: 'Lấy lịch thi đấu',
    description:
      'Trả về danh sách trận đấu kèm thông tin đội & sân. Yêu cầu đăng nhập.',
  })
  @ApiQuery({
    name: 'seasonId',
    required: false,
    type: 'string',
    description: 'Lọc theo mùa giải (UUID).',
  })
  @ApiOkResponse({ description: 'Danh sách trận đấu' })
  @ApiUnauthorizedResponse({ description: 'Chưa đăng nhập' })
  @ApiForbiddenResponse({ description: 'Không có quyền truy cập' })
  getSchedule(@Query('seasonId') seasonId?: string) {
    return this.scheduling.getSchedule(seasonId);
  }
}

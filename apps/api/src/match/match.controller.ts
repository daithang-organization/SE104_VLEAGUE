import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  CurrentUser,
  type CurrentUserPayload,
  JwtAuthGuard,
  Public,
  Role,
  Roles,
  RolesGuard,
} from '../auth';
import { AuditLogInterceptor } from '../common/interceptors/audit-log.interceptor';
import { AddMatchEventDto } from './dto/add-match-event.dto';
import { FindAllMatchesQueryDto } from './dto/find-all-matches-query.dto';
import { MatchService } from './match.service';

@ApiTags('Matches')
@ApiBearerAuth('access-token')
@Controller('matches')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(AuditLogInterceptor)
export class MatchController {
  constructor(private readonly match: MatchService) {}

  @Get()
  @Public()
  @Roles(
    Role.ADMIN,
    Role.TEAM_MANAGER,
    Role.REFEREE,
    Role.SUPERVISOR,
    Role.PUBLIC,
  )
  @ApiOperation({
    summary: 'Lấy danh sách trận đấu',
    description:
      'Trả về danh sách trận đấu có hỗ trợ phân trang và lọc theo mùa giải, vòng, trạng thái, đội',
  })
  @ApiOkResponse({ description: 'Danh sách trận đấu (phân trang)' })
  findAll(@Query() query: FindAllMatchesQueryDto) {
    const { seasonId, ...filters } = query;
    return this.match.findAll(seasonId, filters);
  }

  @Get('assigned-to-me')
  @Roles(Role.REFEREE, Role.SUPERVISOR)
  @ApiOperation({
    summary: 'Lấy danh sách trận đấu được phân công',
    description:
      'Trả về các trận đấu mà trọng tài hoặc giám sát hiện tại được phân công.',
  })
  @ApiOkResponse({
    description: 'Danh sách trận đấu được phân công cho tài khoản hiện tại',
  })
  @ApiUnauthorizedResponse({
    description: 'Chưa đăng nhập hoặc token không hợp lệ',
  })
  @ApiForbiddenResponse({
    description: 'Chỉ REFEREE và SUPERVISOR được truy cập',
  })
  findAssignedToMe(
    @Query() query: FindAllMatchesQueryDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const { seasonId, ...filters } = query;
    return this.match.findAssignedToOfficial(user, seasonId, filters);
  }

  @Get(':id')
  @Public()
  @Roles(
    Role.ADMIN,
    Role.TEAM_MANAGER,
    Role.REFEREE,
    Role.SUPERVISOR,
    Role.PUBLIC,
  )
  @ApiOperation({
    summary: 'Lấy thông tin trận đấu',
    description: 'Trả về thông tin chi tiết của một trận đấu theo ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của trận đấu',
    type: 'string',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Thông tin trận đấu',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        roundNo: { type: 'integer', nullable: true, example: 1 },
        kickoffAt: { type: 'string', format: 'date-time', nullable: true },
        status: {
          type: 'string',
          enum: ['DRAFT', 'PUBLISHED', 'LOCKED'],
          example: 'DRAFT',
        },
        homeTeamId: { type: 'string', format: 'uuid', nullable: true },
        awayTeamId: { type: 'string', format: 'uuid', nullable: true },
        homeScore: { type: 'integer', nullable: true },
        awayScore: { type: 'integer', nullable: true },
        events: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              minute: { type: 'integer' },
              type: {
                type: 'string',
                enum: ['GOAL', 'YELLOW_CARD', 'RED_CARD', 'SUBSTITUTION'],
              },
              playerId: { type: 'string', format: 'uuid', nullable: true },
              teamId: { type: 'string', format: 'uuid', nullable: true },
              note: { type: 'string', nullable: true },
            },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Chưa đăng nhập hoặc token không hợp lệ',
  })
  @ApiForbiddenResponse({ description: 'Không có quyền truy cập' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy trận đấu' })
  getById(@Param('id') id: string) {
    return this.match.getMatchById(id);
  }

  @Post(':id/events')
  @Roles(Role.ADMIN, Role.REFEREE)
  @ApiOperation({
    summary: 'Thêm sự kiện trận đấu',
    description:
      'Thêm sự kiện (bàn thắng, thẻ phạt, thay người) vào trận đấu. Chỉ ADMIN và REFEREE có quyền.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của trận đấu',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({
    description: 'Thông tin sự kiện',
    schema: {
      type: 'object',
      required: ['minute', 'type'],
      properties: {
        minute: {
          type: 'integer',
          minimum: 0,
          maximum: 120,
          example: 45,
          description: 'Phút xảy ra sự kiện',
        },
        type: {
          type: 'string',
          enum: ['GOAL', 'YELLOW_CARD', 'RED_CARD', 'SUBSTITUTION'],
          example: 'GOAL',
          description: 'Loại sự kiện',
        },
        playerId: {
          type: 'string',
          format: 'uuid',
          description: 'ID cầu thủ liên quan',
        },
        teamId: {
          type: 'string',
          format: 'uuid',
          description: 'ID đội bóng liên quan',
        },
        note: {
          type: 'string',
          example: 'Penalty kick',
          description: 'Ghi chú thêm',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Sự kiện đã được thêm thành công',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        matchId: { type: 'string', format: 'uuid' },
        createdEvent: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'evt-1706612400000' },
            minute: { type: 'integer', example: 45 },
            type: { type: 'string', example: 'GOAL' },
            playerId: { type: 'string', format: 'uuid' },
            teamId: { type: 'string', format: 'uuid' },
            note: { type: 'string', example: 'Penalty kick' },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Chưa đăng nhập hoặc token không hợp lệ',
  })
  @ApiForbiddenResponse({
    description: 'Không có quyền truy cập (yêu cầu ADMIN hoặc REFEREE)',
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy trận đấu' })
  addEvent(@Param('id') id: string, @Body() dto: AddMatchEventDto) {
    return this.match.addEvent(id, dto);
  }

  @Patch(':id/events/:eventId')
  @Roles(Role.ADMIN, Role.REFEREE)
  @ApiOperation({
    summary: 'Cập nhật sự kiện trận đấu',
    description:
      'Cập nhật một sự kiện trong trận đấu. Không thể cập nhật sự kiện của trận đã kết thúc. Chỉ ADMIN và REFEREE có quyền.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của trận đấu',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'eventId',
    description: 'ID của sự kiện',
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({ type: AddMatchEventDto })
  @ApiOkResponse({ description: 'Sự kiện đã được cập nhật thành công' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy sự kiện' })
  @ApiBadRequestResponse({
    description: 'Không thể cập nhật sự kiện của trận đấu đã kết thúc',
  })
  updateEvent(
    @Param('id') id: string,
    @Param('eventId') eventId: string,
    @Body() dto: AddMatchEventDto,
  ) {
    return this.match.updateEvent(id, eventId, dto);
  }

  @Delete(':id/events/:eventId')
  @Roles(Role.ADMIN, Role.REFEREE)
  @ApiOperation({
    summary: 'Xóa sự kiện trận đấu',
    description:
      'Xóa một sự kiện khỏi trận đấu. Không thể xóa sự kiện của trận đã kết thúc. Chỉ ADMIN và REFEREE có quyền.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của trận đấu',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'eventId',
    description: 'ID của sự kiện',
    type: 'string',
    format: 'uuid',
  })
  @ApiOkResponse({ description: 'Sự kiện đã được xóa thành công' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy sự kiện' })
  @ApiBadRequestResponse({
    description: 'Không thể xóa sự kiện của trận đấu đã kết thúc',
  })
  removeEvent(@Param('id') id: string, @Param('eventId') eventId: string) {
    return this.match.removeEvent(id, eventId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.REFEREE)
  @ApiOperation({
    summary: 'Cập nhật thông tin trận đấu',
    description:
      'Cập nhật thông tin trận đấu và tỉ số. ADMIN và REFEREE có quyền cập nhật kết quả.',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        stadiumId: {
          type: 'string',
          format: 'uuid',
          nullable: true,
          description: 'ID sân vận động',
        },
        kickoffAt: {
          type: 'string',
          format: 'date-time',
          nullable: true,
          description: 'Thời gian thi đấu',
        },
        homeScore: {
          type: 'integer',
          nullable: true,
          description: 'Số bàn thắng đội nhà',
        },
        awayScore: {
          type: 'integer',
          nullable: true,
          description: 'Số bàn thắng đội khách',
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Trận đấu đã được cập nhật' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy trận đấu' })
  @ApiForbiddenResponse({
    description: 'Không có quyền (yêu cầu ADMIN hoặc REFEREE)',
  })
  updateMatch(
    @Param('id') id: string,
    @Body()
    body: {
      stadiumId?: string | null;
      kickoffAt?: string | null;
      homeScore?: number | null;
      awayScore?: number | null;
    },
  ) {
    return this.match.updateMatch(id, body);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.REFEREE)
  @ApiOperation({
    summary: 'Cập nhật trạng thái trận đấu',
    description:
      'Chuyển trạng thái trận đấu theo state machine: DRAFT → PUBLISHED → LOCKED → FINISHED. ' +
      'DRAFT/PUBLISHED có thể chuyển sang POSTPONED. ADMIN và REFEREE có quyền cập nhật trạng thái.',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['status'],
      properties: {
        status: {
          type: 'string',
          enum: ['DRAFT', 'PUBLISHED', 'LOCKED', 'FINISHED', 'POSTPONED'],
          example: 'PUBLISHED',
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Trạng thái đã được cập nhật' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy trận đấu' })
  @ApiBadRequestResponse({ description: 'Chuyển trạng thái không hợp lệ' })
  @ApiForbiddenResponse({
    description: 'Không có quyền (yêu cầu ADMIN hoặc REFEREE)',
  })
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.match.updateStatus(id, body.status);
  }
}

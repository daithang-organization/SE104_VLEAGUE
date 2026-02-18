import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
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
import { JwtAuthGuard, Role, Roles, RolesGuard } from '../auth';
import type { AddMatchEventDto } from './dto/add-match-event.dto';
import { MatchService } from './match.service';

@ApiTags('Matches')
@ApiBearerAuth('access-token')
@Controller('matches')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MatchController {
  constructor(private readonly match: MatchService) {}

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEAM_MANAGER, Role.REFEREE)
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

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Cập nhật trạng thái trận đấu',
    description:
      'Chuyển trạng thái trận đấu theo state machine: DRAFT → PUBLISHED → LOCKED → FINISHED. ' +
      'DRAFT/PUBLISHED có thể chuyển sang POSTPONED. Chỉ ADMIN có quyền.',
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
  @ApiForbiddenResponse({ description: 'Không có quyền (yêu cầu ADMIN)' })
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.match.updateStatus(id, body.status);
  }
}

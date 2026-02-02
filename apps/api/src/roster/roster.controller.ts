import {
  Body,
  Controller,
  Delete,
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
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard, Role, Roles, RolesGuard } from '../auth';
import { AddPlayerToRosterDto, UpdateRosterPlayerDto } from './dto';
import { RosterService } from './roster.service';

@ApiTags('Roster')
@Controller('teams/:teamId/roster')
export class RosterController {
  constructor(private readonly rosterService: RosterService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách cầu thủ của đội',
    description: 'Trả về danh sách tất cả cầu thủ đang thuộc đội bóng',
  })
  @ApiParam({ name: 'teamId', type: 'string', format: 'uuid' })
  @ApiOkResponse({
    description: 'Danh sách cầu thủ trong đội',
    schema: {
      type: 'object',
      properties: {
        teamId: { type: 'string', format: 'uuid' },
        teamName: { type: 'string', example: 'Hà Nội FC' },
        count: { type: 'integer', example: 25 },
        players: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              playerId: { type: 'string', format: 'uuid' },
              fullName: { type: 'string', example: 'Nguyễn Quang Hải' },
              position: { type: 'string', enum: ['GK', 'DF', 'MF', 'FW'] },
              jerseyNumber: { type: 'integer', example: 19 },
              joinedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy đội bóng' })
  getTeamRoster(@Param('teamId') teamId: string) {
    return this.rosterService.getTeamRoster(teamId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEAM_MANAGER)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Thêm cầu thủ vào đội',
    description: 'ADMIN hoặc TEAM_MANAGER có thể thêm cầu thủ',
  })
  @ApiParam({ name: 'teamId', type: 'string', format: 'uuid' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['playerId'],
      properties: {
        playerId: { type: 'string', format: 'uuid' },
        jerseyNumber: { type: 'integer', example: 10 },
      },
    },
  })
  @ApiOkResponse({ description: 'Cầu thủ đã được thêm vào đội' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy đội hoặc cầu thủ' })
  @ApiConflictResponse({ description: 'Cầu thủ đã thuộc đội khác' })
  @ApiBadRequestResponse({ description: 'Số áo đã được sử dụng' })
  @ApiUnauthorizedResponse({ description: 'Chưa đăng nhập' })
  @ApiForbiddenResponse({ description: 'Không có quyền' })
  addPlayer(
    @Param('teamId') teamId: string,
    @Body() dto: AddPlayerToRosterDto,
  ) {
    return this.rosterService.addPlayerToRoster(teamId, dto);
  }

  @Patch(':playerId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEAM_MANAGER)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Cập nhật thông tin cầu thủ trong đội',
    description: 'Cập nhật số áo hoặc trạng thái',
  })
  @ApiParam({ name: 'teamId', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'playerId', type: 'string', format: 'uuid' })
  @ApiOkResponse({ description: 'Đã cập nhật' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy cầu thủ trong đội' })
  @ApiBadRequestResponse({ description: 'Số áo đã được sử dụng' })
  updatePlayer(
    @Param('teamId') teamId: string,
    @Param('playerId') playerId: string,
    @Body() dto: UpdateRosterPlayerDto,
  ) {
    return this.rosterService.updateRosterPlayer(teamId, playerId, dto);
  }

  @Delete(':playerId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEAM_MANAGER)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Xóa cầu thủ khỏi đội',
    description: 'Đánh dấu cầu thủ đã rời khỏi đội',
  })
  @ApiParam({ name: 'teamId', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'playerId', type: 'string', format: 'uuid' })
  @ApiOkResponse({ description: 'Đã xóa cầu thủ khỏi đội' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy cầu thủ trong đội' })
  removePlayer(
    @Param('teamId') teamId: string,
    @Param('playerId') playerId: string,
  ) {
    return this.rosterService.removePlayerFromRoster(teamId, playerId);
  }
}

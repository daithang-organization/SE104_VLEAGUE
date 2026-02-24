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
import { SeasonService } from './season.service';

@ApiTags('Season Teams')
@Controller('seasons/:seasonId/teams')
export class SeasonTeamController {
  constructor(private readonly seasonService: SeasonService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách đội đăng ký',
    description: 'Trả về danh sách đội đã đăng ký vào mùa giải',
  })
  @ApiParam({ name: 'seasonId', type: 'string', format: 'uuid' })
  @ApiOkResponse({ description: 'Danh sách đội đăng ký' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy mùa giải' })
  getTeams(@Param('seasonId') seasonId: string) {
    return this.seasonService.getSeasonTeams(seasonId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Đăng ký đội vào mùa giải',
    description: 'Chỉ ADMIN có quyền đăng ký đội',
  })
  @ApiParam({ name: 'seasonId', type: 'string', format: 'uuid' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['teamId'],
      properties: {
        teamId: { type: 'string', format: 'uuid' },
      },
    },
  })
  @ApiOkResponse({ description: 'Đội đã được đăng ký' })
  @ApiConflictResponse({ description: 'Đội đã đăng ký vào mùa giải' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy mùa giải' })
  @ApiUnauthorizedResponse({ description: 'Chưa đăng nhập' })
  @ApiForbiddenResponse({ description: 'Không có quyền (yêu cầu ADMIN)' })
  registerTeam(
    @Param('seasonId') seasonId: string,
    @Body() body: { teamId: string },
  ) {
    return this.seasonService.registerTeam(seasonId, body.teamId);
  }

  @Patch(':teamId/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Cập nhật trạng thái đội',
    description:
      'Duyệt (APPROVED), từ chối (REJECTED), hoặc rút (WITHDRAWN). Chỉ ADMIN.',
  })
  @ApiParam({ name: 'seasonId', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'teamId', type: 'string', format: 'uuid' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['status'],
      properties: {
        status: {
          type: 'string',
          enum: ['REGISTERED', 'APPROVED', 'REJECTED', 'WITHDRAWN'],
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Trạng thái đội đã được cập nhật' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy đội trong mùa giải' })
  @ApiForbiddenResponse({ description: 'Không có quyền (yêu cầu ADMIN)' })
  updateTeamStatus(
    @Param('seasonId') seasonId: string,
    @Param('teamId') teamId: string,
    @Body() body: { status: string },
  ) {
    return this.seasonService.updateTeamStatus(seasonId, teamId, body.status);
  }

  @Delete(':teamId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Xóa đội khỏi mùa giải',
    description: 'Chỉ ADMIN có quyền xóa',
  })
  @ApiParam({ name: 'seasonId', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'teamId', type: 'string', format: 'uuid' })
  @ApiOkResponse({ description: 'Đội đã được xóa khỏi mùa giải' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy đội trong mùa giải' })
  @ApiForbiddenResponse({ description: 'Không có quyền (yêu cầu ADMIN)' })
  removeTeam(
    @Param('seasonId') seasonId: string,
    @Param('teamId') teamId: string,
  ) {
    return this.seasonService.removeTeam(seasonId, teamId);
  }
}

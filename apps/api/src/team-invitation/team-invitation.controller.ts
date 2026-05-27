import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, Role, Roles, RolesGuard } from '../auth';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import {
  RespondTeamInvitationDto,
  SendTeamInvitationDto,
} from './dto/team-invitation.dto';
import { TeamInvitationService } from './team-invitation.service';

@ApiTags('Team Invitations')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class TeamInvitationController {
  constructor(private readonly invitationService: TeamInvitationService) {}

  @Get('seasons/:seasonId/invitations')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'BTC xem danh sách lời mời tham dự mùa giải' })
  @ApiParam({ name: 'seasonId', type: String })
  @ApiOkResponse({ description: 'Danh sách lời mời theo mùa giải' })
  listForSeason(@Param('seasonId') seasonId: string) {
    return this.invitationService.listForSeason(seasonId);
  }

  @Get('seasons/:seasonId/invitation-candidates')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary:
      'BTC lấy danh sách đề xuất top 8 mùa trước để chuẩn bị lời mời mùa mới',
  })
  @ApiParam({ name: 'seasonId', type: String })
  @ApiOkResponse({ description: 'Danh sách ứng viên top 8 mùa trước' })
  getInvitationCandidates(
    @Param('seasonId') seasonId: string,
    @Query('previousSeasonId') previousSeasonId?: string,
  ) {
    return this.invitationService.getInvitationCandidates(
      seasonId,
      previousSeasonId,
    );
  }

  @Post('seasons/:seasonId/invitations')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'BTC gửi popup/văn bản lời mời tham dự mùa giải cho manager CLB',
  })
  @ApiParam({ name: 'seasonId', type: String })
  @ApiOkResponse({ description: 'Lời mời đã gửi' })
  sendInvitation(
    @Param('seasonId') seasonId: string,
    @Body() dto: SendTeamInvitationDto,
  ) {
    return this.invitationService.sendInvitation(seasonId, dto);
  }

  @Get('team-invitations/my-pending')
  @Roles(Role.TEAM_MANAGER)
  @ApiOperation({ summary: 'Manager xem các lời mời chưa phản hồi' })
  @ApiOkResponse({ description: 'Danh sách lời mời pending của manager' })
  getMyPending(@CurrentUser() user: CurrentUserPayload) {
    return this.invitationService.getPendingForManager(user.id);
  }

  @Patch('team-invitations/:id/respond')
  @Roles(Role.TEAM_MANAGER)
  @ApiOperation({ summary: 'Manager đồng ý hoặc từ chối lời mời tham dự' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ description: 'Lời mời sau khi phản hồi' })
  respond(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: RespondTeamInvitationDto,
  ) {
    return this.invitationService.respondToInvitation(id, user.id, dto);
  }
}

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
  ImportPromotionCandidatesDto,
  RespondTeamInvitationDto,
  SendTeamInvitationDto,
  UpsertPromotionCandidateDto,
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

  @Get('seasons/:seasonId/replacement-candidates')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary:
      'BTC xem danh sách đội có thể mời thay thế khi có đội từ chối/quá hạn',
  })
  @ApiParam({ name: 'seasonId', type: String })
  @ApiOkResponse({
    description: 'Số slot cần, danh sách đội từ chối, và đội khả dụng',
  })
  getReplacementCandidates(@Param('seasonId') seasonId: string) {
    return this.invitationService.getReplacementCandidates(seasonId);
  }

  @Get('seasons/:seasonId/promotion-candidates')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary:
      'BTC xem snapshot ranking đội thăng hạng/dự phòng cho mùa giải đích',
  })
  @ApiParam({ name: 'seasonId', type: String })
  @ApiOkResponse({ description: 'Danh sách đội thăng hạng theo ranking' })
  listPromotionCandidates(@Param('seasonId') seasonId: string) {
    return this.invitationService.listPromotionCandidates(seasonId);
  }

  @Post('seasons/:seasonId/promotion-candidates/import')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'BTC import nhiều dòng snapshot thăng hạng từ BXH V.League 2',
  })
  @ApiParam({ name: 'seasonId', type: String })
  @ApiOkResponse({ description: 'Kết quả import snapshot thăng hạng' })
  importPromotionCandidates(
    @Param('seasonId') seasonId: string,
    @Body() dto: ImportPromotionCandidatesDto,
  ) {
    return this.invitationService.importPromotionCandidates(seasonId, dto);
  }

  @Post('seasons/:seasonId/promotion-candidates')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'BTC thêm hoặc cập nhật một đội trong snapshot thăng hạng',
  })
  @ApiParam({ name: 'seasonId', type: String })
  @ApiOkResponse({ description: 'Ứng viên thăng hạng sau khi lưu' })
  upsertPromotionCandidate(
    @Param('seasonId') seasonId: string,
    @Body() dto: UpsertPromotionCandidateDto,
  ) {
    return this.invitationService.upsertPromotionCandidate(seasonId, dto);
  }

  @Delete('seasons/:seasonId/promotion-candidates/:teamId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'BTC xóa một đội khỏi snapshot thăng hạng' })
  @ApiParam({ name: 'seasonId', type: String })
  @ApiParam({ name: 'teamId', type: String })
  @ApiOkResponse({ description: 'Số bản ghi đã xóa' })
  deletePromotionCandidate(
    @Param('seasonId') seasonId: string,
    @Param('teamId') teamId: string,
  ) {
    return this.invitationService.deletePromotionCandidate(seasonId, teamId);
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

  @Post('seasons/:seasonId/invitation-candidates/approve-all')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary:
      'BTC duyá»‡t nhanh toÃ n bá»™ danh sÃ¡ch má»i dá»± kiáº¿n vÃ o mÃ¹a giáº£i',
  })
  @ApiParam({ name: 'seasonId', type: String })
  @ApiOkResponse({ description: 'Sá»‘ Ä‘á»™i Ä‘Ã£ Ä‘Æ°á»£c duyá»‡t nhanh' })
  approveAllInvitationCandidates(@Param('seasonId') seasonId: string) {
    return this.invitationService.approveAllInvitationCandidates(seasonId);
  }

  @Get('team-invitations/my-pending')
  @Roles(Role.TEAM_MANAGER)
  @ApiOperation({ summary: 'Manager xem các lời mời chưa phản hồi' })
  @ApiOkResponse({ description: 'Danh sách lời mời pending của manager' })
  getMyPending(@CurrentUser() user: CurrentUserPayload) {
    return this.invitationService.getPendingForManager(user.id);
  }

  @Get('team-invitations/my')
  @Roles(Role.TEAM_MANAGER)
  @ApiOperation({ summary: 'Manager xem tất cả lời mời của CLB đang quản lý' })
  @ApiOkResponse({ description: 'Danh sách lời mời của manager' })
  getMyInvitations(@CurrentUser() user: CurrentUserPayload) {
    return this.invitationService.getForManager(user.id);
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

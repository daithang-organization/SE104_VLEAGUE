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
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, Role, Roles, RolesGuard } from '../auth';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import {
  CreateManagerPlayerRequestDto,
  CreateManagerStadiumRequestDto,
  CreateTeamManagerAssignmentDto,
  CreateTeamManagerRequestDto,
  ReviewManagerChangeRequestDto,
  ReviewTeamManagerRequestDto,
  SubmitTeamApplicationDto,
} from './dto/team-manager-assignment.dto';
import { TeamManagerService } from './team-manager.service';

@ApiTags('Team Manager')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.TEAM_MANAGER)
@Controller('team-manager')
export class TeamManagerController {
  constructor(private readonly teamManagerService: TeamManagerService) {}

  @Get('managed-team')
  @ApiOperation({ summary: 'Lấy CLB cố định của team manager' })
  @ApiOkResponse({
    description: 'CLB được admin gắn cho manager hoặc null nếu chưa có',
  })
  getManagedTeam(@CurrentUser() user: CurrentUserPayload) {
    return this.teamManagerService.getManagedTeam(user.id);
  }

  @Get('management-request')
  @ApiOperation({ summary: 'Lấy yêu cầu quản lý CLB mới nhất của manager' })
  @ApiOkResponse({ description: 'Yêu cầu mới nhất hoặc null' })
  getLatestManagementRequest(@CurrentUser() user: CurrentUserPayload) {
    return this.teamManagerService.getLatestManagementRequest(user.id);
  }

  @Get('claimable-teams')
  @ApiOperation({ summary: 'Lấy danh sách CLB chưa có manager để gửi yêu cầu' })
  @ApiOkResponse({ description: 'Danh sách CLB có thể nhận quản lý' })
  getClaimableTeams() {
    return this.teamManagerService.getClaimableTeams();
  }

  @Post('management-requests')
  @ApiOperation({ summary: 'Manager gửi yêu cầu tạo/nhận quản lý CLB' })
  @ApiOkResponse({ description: 'Yêu cầu đã được tạo' })
  createManagementRequest(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateTeamManagerRequestDto,
  ) {
    return this.teamManagerService.createManagementRequest(user.id, dto);
  }

  @Patch('management-requests/:id')
  @ApiOperation({ summary: 'Manager cập nhật yêu cầu quản lý CLB chưa duyệt' })
  @ApiOkResponse({ description: 'Yêu cầu đã được cập nhật' })
  updateManagementRequest(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: CreateTeamManagerRequestDto,
  ) {
    return this.teamManagerService.updateManagementRequest(user.id, id, dto);
  }

  @Delete('management-requests/:id')
  @ApiOperation({ summary: 'Manager xóa yêu cầu hoặc bỏ quyền quản lý CLB' })
  @ApiOkResponse({
    description: 'Yêu cầu đã được xóa hoặc quyền quản lý đã được bỏ',
  })
  deleteManagementRequest(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
  ) {
    return this.teamManagerService.deleteManagementRequest(user.id, id);
  }

  @Get('management-requests')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin xem danh sách yêu cầu quản lý CLB' })
  @ApiQuery({ name: 'status', required: false })
  @ApiOkResponse({ description: 'Danh sách yêu cầu quản lý CLB' })
  listManagementRequests(@Query('status') status?: string) {
    return this.teamManagerService.listManagementRequests(status);
  }

  @Patch('management-requests/:id/review')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin duyệt/từ chối yêu cầu quản lý CLB' })
  @ApiOkResponse({ description: 'Yêu cầu đã được xét duyệt' })
  reviewManagementRequest(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: ReviewTeamManagerRequestDto,
  ) {
    return this.teamManagerService.reviewManagementRequest(id, user.id, dto);
  }

  @Get('player-requests/mine')
  @ApiOperation({
    summary: 'Manager xem yêu cầu thay đổi cầu thủ của CLB mình',
  })
  @ApiOkResponse({ description: 'Danh sách yêu cầu cầu thủ của Manager' })
  listMyPlayerRequests(@CurrentUser() user: CurrentUserPayload) {
    return this.teamManagerService.listMyPlayerRequests(user.id);
  }

  @Post('player-requests')
  @ApiOperation({ summary: 'Manager gửi yêu cầu thêm/sửa/gỡ cầu thủ' })
  @ApiOkResponse({ description: 'Yêu cầu cầu thủ đã được tạo' })
  createPlayerRequest(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateManagerPlayerRequestDto,
  ) {
    return this.teamManagerService.createPlayerRequest(user.id, dto);
  }

  @Patch('player-requests/:id')
  @ApiOperation({ summary: 'Manager cập nhật yêu cầu cầu thủ chưa duyệt' })
  @ApiOkResponse({ description: 'Yêu cầu cầu thủ đã được cập nhật' })
  updatePlayerRequest(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: CreateManagerPlayerRequestDto,
  ) {
    return this.teamManagerService.updatePlayerRequest(user.id, id, dto);
  }

  @Delete('player-requests/:id')
  @ApiOperation({ summary: 'Manager xóa yêu cầu cầu thủ của mình' })
  @ApiOkResponse({ description: 'Yêu cầu cầu thủ đã được xóa' })
  deletePlayerRequest(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
  ) {
    return this.teamManagerService.deletePlayerRequest(user.id, id);
  }

  @Get('player-requests')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin xem danh sách yêu cầu cầu thủ từ Manager' })
  @ApiQuery({ name: 'status', required: false })
  @ApiOkResponse({ description: 'Danh sách yêu cầu cầu thủ' })
  listPlayerRequests(@Query('status') status?: string) {
    return this.teamManagerService.listPlayerRequests(status);
  }

  @Patch('player-requests/:id/review')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin duyệt/từ chối yêu cầu cầu thủ' })
  @ApiOkResponse({ description: 'Yêu cầu cầu thủ đã được xét duyệt' })
  reviewPlayerRequest(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: ReviewManagerChangeRequestDto,
  ) {
    return this.teamManagerService.reviewPlayerRequest(id, user.id, dto);
  }

  @Get('stadium-requests/mine')
  @ApiOperation({ summary: 'Manager xem yêu cầu sân nhà của CLB mình' })
  @ApiOkResponse({ description: 'Danh sách yêu cầu sân nhà của Manager' })
  listMyStadiumRequests(@CurrentUser() user: CurrentUserPayload) {
    return this.teamManagerService.listMyStadiumRequests(user.id);
  }

  @Post('stadium-requests')
  @ApiOperation({ summary: 'Manager gửi yêu cầu tạo/chỉnh sửa sân nhà' })
  @ApiOkResponse({ description: 'Yêu cầu sân nhà đã được tạo' })
  createStadiumRequest(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateManagerStadiumRequestDto,
  ) {
    return this.teamManagerService.createStadiumRequest(user.id, dto);
  }

  @Patch('stadium-requests/:id')
  @ApiOperation({ summary: 'Manager cập nhật yêu cầu sân nhà chưa duyệt' })
  @ApiOkResponse({ description: 'Yêu cầu sân nhà đã được cập nhật' })
  updateStadiumRequest(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: CreateManagerStadiumRequestDto,
  ) {
    return this.teamManagerService.updateStadiumRequest(user.id, id, dto);
  }

  @Delete('stadium-requests/:id')
  @ApiOperation({ summary: 'Manager xóa yêu cầu sân nhà của mình' })
  @ApiOkResponse({ description: 'Yêu cầu sân nhà đã được xóa' })
  deleteStadiumRequest(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
  ) {
    return this.teamManagerService.deleteStadiumRequest(user.id, id);
  }

  @Get('stadium-requests')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin xem danh sách yêu cầu sân nhà từ Manager' })
  @ApiQuery({ name: 'status', required: false })
  @ApiOkResponse({ description: 'Danh sách yêu cầu sân nhà' })
  listStadiumRequests(@Query('status') status?: string) {
    return this.teamManagerService.listStadiumRequests(status);
  }

  @Patch('stadium-requests/:id/review')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin duyệt/từ chối yêu cầu sân nhà' })
  @ApiOkResponse({ description: 'Yêu cầu sân nhà đã được xét duyệt' })
  reviewStadiumRequest(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: ReviewManagerChangeRequestDto,
  ) {
    return this.teamManagerService.reviewStadiumRequest(id, user.id, dto);
  }

  @Get('assignment')
  @ApiOperation({ summary: 'Lấy CLB cố định của team manager trong mùa giải' })
  @ApiQuery({ name: 'seasonId', type: 'string', required: true })
  @ApiOkResponse({
    description: 'Assignment hoặc null nếu tài khoản chưa được gắn CLB',
  })
  getAssignment(
    @CurrentUser() user: CurrentUserPayload,
    @Query('seasonId') seasonId: string,
  ) {
    return this.teamManagerService.getAssignment(user.id, seasonId);
  }

  @Post('assignment')
  @ApiOperation({
    summary: 'Đồng bộ CLB cố định của team manager cho mùa giải',
  })
  @ApiOkResponse({ description: 'Assignment đã được tạo' })
  @ApiConflictResponse({
    description: 'Manager gửi CLB khác với CLB cố định',
  })
  createAssignment(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateTeamManagerAssignmentDto,
  ) {
    return this.teamManagerService.createAssignment(
      user.id,
      dto.seasonId,
      dto.teamId,
    );
  }

  @Get('application')
  @ApiOperation({ summary: 'Lấy hồ sơ tham dự mùa giải của CLB manager' })
  @ApiQuery({ name: 'seasonId', type: 'string', required: true })
  @ApiOkResponse({ description: 'Hồ sơ SeasonTeam hoặc null nếu chưa có CLB' })
  getApplication(
    @CurrentUser() user: CurrentUserPayload,
    @Query('seasonId') seasonId: string,
  ) {
    return this.teamManagerService.getApplication(user.id, seasonId);
  }

  @Post('application')
  @ApiOperation({ summary: 'Manager nộp/cập nhật hồ sơ tham dự mùa giải' })
  @ApiOkResponse({ description: 'Hồ sơ đã nộp' })
  submitApplication(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: SubmitTeamApplicationDto,
  ) {
    return this.teamManagerService.submitApplication(user.id, dto);
  }
}

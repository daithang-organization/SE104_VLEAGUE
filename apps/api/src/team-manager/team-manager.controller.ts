import {
  Body,
  Controller,
  Get,
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
  CreateTeamManagerAssignmentDto,
  SubmitTeamApplicationDto,
  UpdateManagedTeamDto,
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

  @Patch('managed-team')
  @ApiOperation({ summary: 'Cập nhật thông tin CLB của team manager' })
  @ApiOkResponse({ description: 'CLB đã được cập nhật' })
  updateManagedTeam(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateManagedTeamDto,
  ) {
    return this.teamManagerService.updateManagedTeam(user.id, dto);
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

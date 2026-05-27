import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
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
} from './dto/team-manager-assignment.dto';
import { TeamManagerService } from './team-manager.service';

@ApiTags('Team Manager')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.TEAM_MANAGER)
@Controller('team-manager')
export class TeamManagerController {
  constructor(private readonly teamManagerService: TeamManagerService) {}

  @Get('assignment')
  @ApiOperation({ summary: 'Lấy CLB team manager đã chọn trong mùa giải' })
  @ApiQuery({ name: 'seasonId', type: 'string', required: true })
  @ApiOkResponse({ description: 'Assignment hoặc null nếu chưa chọn' })
  getAssignment(
    @CurrentUser() user: CurrentUserPayload,
    @Query('seasonId') seasonId: string,
  ) {
    return this.teamManagerService.getAssignment(user.id, seasonId);
  }

  @Post('assignment')
  @ApiOperation({ summary: 'Team manager chọn CLB quản lý cho mùa giải' })
  @ApiOkResponse({ description: 'Assignment đã được tạo' })
  @ApiConflictResponse({
    description: 'Manager đã chọn CLB khác cho mùa giải này',
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

import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  CurrentUser,
  CurrentUserPayload,
  JwtAuthGuard,
  Role,
  Roles,
  RolesGuard,
} from '../auth';
import {
  AssignOfficialDto,
  CreateOfficialDto,
  SubmitDisciplineReportDto,
  SubmitMatchReportDto,
} from './dto/match-official.dto';
import { MatchOfficialService } from './match-official.service';

@ApiTags('Match officials')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class MatchOfficialController {
  constructor(private readonly matchOfficialService: MatchOfficialService) {}

  @Get('officials')
  @Roles(Role.ADMIN, Role.REFEREE, Role.SUPERVISOR)
  @ApiOperation({ summary: 'Lấy danh sách trọng tài/giám sát viên' })
  listOfficials() {
    return this.matchOfficialService.listOfficials();
  }

  @Post('officials')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Tạo trọng tài/giám sát viên' })
  createOfficial(@Body() dto: CreateOfficialDto) {
    return this.matchOfficialService.createOfficial(dto);
  }

  @Get('matches/:matchId/officials')
  @Roles(
    Role.ADMIN,
    Role.TEAM_MANAGER,
    Role.REFEREE,
    Role.SUPERVISOR,
    Role.PUBLIC,
  )
  @ApiOperation({
    summary: 'Lấy danh sách trọng tài/giám sát viên được công bố cho trận',
  })
  @ApiParam({ name: 'matchId', type: 'string', format: 'uuid' })
  listAssignments(@Param('matchId') matchId: string) {
    return this.matchOfficialService.listAssignments(matchId);
  }

  @Post('matches/:matchId/officials')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Phân công trọng tài/giám sát viên cho trận' })
  @ApiParam({ name: 'matchId', type: 'string', format: 'uuid' })
  assignOfficial(
    @Param('matchId') matchId: string,
    @Body() dto: AssignOfficialDto,
  ) {
    return this.matchOfficialService.assignOfficial(matchId, dto);
  }

  @Get('matches/:matchId/report')
  @Roles(Role.ADMIN, Role.REFEREE, Role.SUPERVISOR)
  @ApiOperation({ summary: 'Lấy báo cáo trọng tài sau trận' })
  @ApiParam({ name: 'matchId', type: 'string', format: 'uuid' })
  getMatchReport(@Param('matchId') matchId: string) {
    return this.matchOfficialService.getMatchReport(matchId);
  }

  @Post('matches/:matchId/report')
  @Roles(Role.ADMIN, Role.REFEREE)
  @ApiOperation({
    summary: 'Trọng tài bàn nộp tỷ số, cầu thủ xuất sắc và sự kiện trận đấu',
  })
  @ApiParam({ name: 'matchId', type: 'string', format: 'uuid' })
  submitMatchReport(
    @Param('matchId') matchId: string,
    @CurrentUser() user: CurrentUserPayload | undefined,
    @Body() dto: SubmitMatchReportDto,
  ) {
    return this.matchOfficialService.submitMatchReport(matchId, user, dto);
  }

  @Get('matches/:matchId/discipline-report')
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  @ApiOperation({ summary: 'Lấy báo cáo giám sát/kỷ luật sau trận' })
  @ApiParam({ name: 'matchId', type: 'string', format: 'uuid' })
  getDisciplineReport(@Param('matchId') matchId: string) {
    return this.matchOfficialService.getDisciplineReport(matchId);
  }

  @Post('matches/:matchId/discipline-report')
  @Roles(Role.ADMIN, Role.SUPERVISOR)
  @ApiOperation({
    summary: 'Giám sát viên nộp báo cáo tổ chức và sai sót cần chuyển kỷ luật',
  })
  @ApiParam({ name: 'matchId', type: 'string', format: 'uuid' })
  submitDisciplineReport(
    @Param('matchId') matchId: string,
    @CurrentUser() user: CurrentUserPayload | undefined,
    @Body() dto: SubmitDisciplineReportDto,
  ) {
    return this.matchOfficialService.submitDisciplineReport(matchId, user, dto);
  }
}

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
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, Role, Roles, RolesGuard } from '../auth';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import {
  ReviewMatchLineupDto,
  SubmitMatchLineupDto,
} from './dto/match-lineup.dto';
import { MatchLineupService } from './match-lineup.service';

@ApiTags('Match lineups')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('matches/:matchId')
export class MatchLineupController {
  constructor(private readonly matchLineupService: MatchLineupService) {}

  @Get('lineups')
  @Roles(Role.ADMIN, Role.TEAM_MANAGER, Role.REFEREE, Role.SUPERVISOR)
  @ApiOperation({ summary: 'Lấy danh sách đăng ký thi đấu của hai đội' })
  @ApiParam({ name: 'matchId', type: 'string', format: 'uuid' })
  listLineups(@Param('matchId') matchId: string) {
    return this.matchLineupService.listLineups(matchId);
  }

  @Post('lineups')
  @Roles(Role.ADMIN, Role.TEAM_MANAGER)
  @ApiOperation({ summary: 'Nộp danh sách 16 cầu thủ đăng ký thi đấu' })
  @ApiParam({ name: 'matchId', type: 'string', format: 'uuid' })
  submitLineup(
    @Param('matchId') matchId: string,
    @Body() dto: SubmitMatchLineupDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.matchLineupService.submitLineup(matchId, dto, user);
  }

  @Patch('lineups/:teamId/review')
  @Roles(Role.ADMIN, Role.REFEREE)
  @ApiOperation({ summary: 'BTC duyệt/từ chối danh sách đăng ký thi đấu' })
  @ApiParam({ name: 'matchId', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'teamId', type: 'string', format: 'uuid' })
  reviewLineup(
    @Param('matchId') matchId: string,
    @Param('teamId') teamId: string,
    @Body() dto: ReviewMatchLineupDto,
  ) {
    return this.matchLineupService.reviewLineup(matchId, teamId, dto);
  }

  @Get('suspensions')
  @Roles(Role.ADMIN, Role.TEAM_MANAGER, Role.REFEREE, Role.SUPERVISOR)
  @ApiOperation({ summary: 'Lấy danh sách cầu thủ bị treo giò ở trận này' })
  @ApiParam({ name: 'matchId', type: 'string', format: 'uuid' })
  listSuspensions(@Param('matchId') matchId: string) {
    return this.matchLineupService.listSuspensions(matchId);
  }
}

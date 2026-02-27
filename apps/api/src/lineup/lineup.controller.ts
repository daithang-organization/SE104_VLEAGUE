import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard, Role, Roles, RolesGuard } from '../auth';
import { SetLineupDto } from './dto/set-lineup.dto';
import { LineupService } from './lineup.service';

@ApiTags('Match Lineup')
@ApiBearerAuth('access-token')
@Controller('matches/:matchId/lineup')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LineupController {
  constructor(private readonly lineupService: LineupService) {}

  @Get()
  @Roles(
    Role.ADMIN,
    Role.TEAM_MANAGER,
    Role.REFEREE,
    Role.SUPERVISOR,
    Role.PUBLIC,
  )
  @ApiOperation({ summary: 'Lấy đội hình ra sân của trận đấu' })
  @ApiParam({ name: 'matchId', type: 'string', format: 'uuid' })
  @ApiOkResponse({ description: 'Đội hình ra sân (home + away)' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy trận đấu' })
  getLineup(@Param('matchId') matchId: string) {
    return this.lineupService.getLineup(matchId);
  }

  @Post()
  @Roles(Role.ADMIN, Role.TEAM_MANAGER)
  @ApiOperation({ summary: 'Thiết lập đội hình ra sân cho 1 đội' })
  @ApiParam({ name: 'matchId', type: 'string', format: 'uuid' })
  @ApiBody({ type: SetLineupDto })
  @ApiOkResponse({ description: 'Đội hình đã được cập nhật' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy trận đấu' })
  setLineup(@Param('matchId') matchId: string, @Body() dto: SetLineupDto) {
    return this.lineupService.setLineup(matchId, dto);
  }

  @Delete(':teamId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Xóa đội hình của 1 đội trong trận đấu' })
  @ApiParam({ name: 'matchId', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'teamId', type: 'string', format: 'uuid' })
  @ApiOkResponse({ description: 'Đã xóa đội hình' })
  removeLineup(
    @Param('matchId') matchId: string,
    @Param('teamId') teamId: string,
  ) {
    return this.lineupService.removeLineup(matchId, teamId);
  }
}

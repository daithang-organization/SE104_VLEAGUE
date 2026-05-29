import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../auth/roles.enum';
import { toCsv } from '../common/utils/csv';
import { StandingsService } from './standings.service';
import type { StandingsMode } from './standings.service';

@ApiTags('Standings')
@Controller('standings')
@UseInterceptors(CacheInterceptor)
export class StandingsController {
  constructor(private readonly standingsService: StandingsService) {}

  @Get()
  @CacheTTL(30000)
  @ApiOperation({
    summary: 'Lấy bảng xếp hạng',
    description:
      'Trả về bảng xếp hạng cho mùa giải hiện tại hoặc mùa giải được chỉ định',
  })
  @ApiQuery({
    name: 'seasonId',
    required: false,
    type: 'string',
    description: 'ID mùa giải (mặc định: mùa giải đang diễn ra)',
  })
  @ApiQuery({
    name: 'mode',
    required: false,
    enum: ['in_progress', 'final'],
    description:
      'in_progress: chỉ xét điểm/hiệu số và cho đồng hạng; final: xét thêm đối đầu/rút thăm',
  })
  @ApiOkResponse({
    description: 'Bảng xếp hạng',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          position: { type: 'integer', example: 1 },
          teamId: { type: 'string', format: 'uuid' },
          teamName: { type: 'string', example: 'Hà Nội FC' },
          played: { type: 'integer', example: 10 },
          won: { type: 'integer', example: 7 },
          drawn: { type: 'integer', example: 2 },
          lost: { type: 'integer', example: 1 },
          goalsFor: { type: 'integer', example: 20 },
          goalsAgainst: { type: 'integer', example: 8 },
          goalDifference: { type: 'integer', example: 12 },
          points: { type: 'integer', example: 23 },
          recentForm: {
            type: 'array',
            items: { type: 'string', enum: ['W', 'D', 'L'] },
            example: ['W', 'D', 'L', 'W', 'W'],
          },
        },
      },
    },
  })
  getStandings(
    @Query('seasonId') seasonId?: string,
    @Query('mode') mode: StandingsMode = 'in_progress',
  ) {
    return this.standingsService.getStandings(seasonId, mode);
  }

  @Get('top-scorers')
  @ApiOperation({ summary: 'Lấy danh sách vua phá lưới' })
  @ApiQuery({ name: 'seasonId', required: false, type: 'string' })
  @ApiQuery({ name: 'limit', required: false, type: 'integer' })
  @ApiOkResponse({ description: 'Danh sách vua phá lưới' })
  getTopScorers(
    @Query('seasonId') seasonId?: string,
    @Query('limit') limit?: number,
  ) {
    return this.standingsService.getTopScorers(seasonId, limit ?? 10);
  }

  @Get('top-assists')
  @ApiOperation({ summary: 'Lấy danh sách kiến tạo' })
  @ApiQuery({ name: 'seasonId', required: false, type: 'string' })
  @ApiQuery({ name: 'limit', required: false, type: 'integer' })
  @ApiOkResponse({ description: 'Danh sách kiến tạo' })
  getTopAssists(
    @Query('seasonId') seasonId?: string,
    @Query('limit') limit?: number,
  ) {
    return this.standingsService.getTopAssists(seasonId, limit ?? 10);
  }

  @Get('card-stats')
  @ApiOperation({ summary: 'Thống kê thẻ phạt' })
  @ApiQuery({ name: 'seasonId', required: false, type: 'string' })
  @ApiQuery({ name: 'limit', required: false, type: 'integer' })
  @ApiOkResponse({ description: 'Danh sách thẻ phạt' })
  getCardStats(
    @Query('seasonId') seasonId?: string,
    @Query('limit') limit?: number,
  ) {
    return this.standingsService.getCardStats(seasonId, limit ?? 20);
  }

  @Get('player-of-match')
  @ApiOperation({ summary: 'Thống kê cầu thủ xuất sắc nhất trận' })
  @ApiQuery({ name: 'seasonId', required: false, type: 'string' })
  @ApiQuery({ name: 'limit', required: false, type: 'integer' })
  @ApiOkResponse({ description: 'Danh sách cầu thủ xuất sắc' })
  getPlayerOfMatchStats(
    @Query('seasonId') seasonId?: string,
    @Query('limit') limit?: number,
  ) {
    return this.standingsService.getPlayerOfMatchStats(seasonId, limit ?? 20);
  }

  @Get('suspensions')
  @ApiOperation({ summary: 'Danh sách cầu thủ bị treo giò' })
  @ApiQuery({ name: 'seasonId', required: false, type: 'string' })
  @ApiOkResponse({ description: 'Danh sách cầu thủ bị treo giò' })
  getSuspensionStats(@Query('seasonId') seasonId?: string) {
    return this.standingsService.getSuspensionStats(seasonId);
  }

  @Get('awards')
  @ApiOperation({ summary: 'Tổng hợp giải thưởng cuối mùa' })
  @ApiQuery({ name: 'seasonId', required: false, type: 'string' })
  @ApiOkResponse({ description: 'Danh sách giải thưởng cuối mùa' })
  getSeasonAwards(@Query('seasonId') seasonId?: string) {
    return this.standingsService.getSeasonAwards(seasonId);
  }

  @Get('team-stats')
  @ApiOperation({ summary: 'Thống kê theo đội' })
  @ApiQuery({ name: 'seasonId', required: false, type: 'string' })
  @ApiOkResponse({ description: 'Thống kê đội' })
  getTeamStats(@Query('seasonId') seasonId?: string) {
    return this.standingsService.getTeamStats(seasonId);
  }

  // ── Draw Lot ──────────────────────────────────────────────────

  @Get('draw-lot/status')
  @ApiOperation({
    summary: 'Kiểm tra trạng thái rút thăm',
    description:
      'Trả về danh sách đội cần rút thăm và kết quả rút thăm đã lưu (nếu có)',
  })
  @ApiQuery({ name: 'seasonId', required: false, type: 'string' })
  @ApiOkResponse({ description: 'Trạng thái rút thăm' })
  getDrawLotStatus(@Query('seasonId') seasonId?: string) {
    return this.standingsService.getDrawLotStatus(seasonId);
  }

  @Post('draw-lot/:seasonId/execute')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Rút thăm tự động',
    description:
      'Hệ thống random thứ hạng cho các đội bằng điểm/đối đầu. Admin cần xác nhận sau.',
  })
  @ApiParam({ name: 'seasonId', type: 'string', format: 'uuid' })
  @ApiOkResponse({ description: 'Kết quả rút thăm tự động' })
  executeDrawLot(
    @Param('seasonId') seasonId: string,
    @Req() req: { user?: { id?: string } },
  ) {
    return this.standingsService.executeDrawLot(seasonId, req.user?.id);
  }

  @Post('draw-lot/:seasonId/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Xác nhận kết quả rút thăm',
    description: 'Admin xác nhận kết quả rút thăm hoặc ghi đè thứ hạng tùy ý.',
  })
  @ApiParam({ name: 'seasonId', type: 'string', format: 'uuid' })
  @ApiOkResponse({ description: 'Đã xác nhận' })
  confirmDrawLot(
    @Param('seasonId') seasonId: string,
    @Body()
    body: { overrides?: Array<{ teamId: string; resolvedRank: number }> },
    @Req() req: { user?: { id?: string } },
  ) {
    return this.standingsService.confirmDrawLot(
      seasonId,
      body.overrides,
      req.user?.id,
    );
  }

  @Delete('draw-lot/:seasonId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Xóa kết quả rút thăm',
    description: 'Xóa để rút thăm lại hoặc sửa lại.',
  })
  @ApiParam({ name: 'seasonId', type: 'string', format: 'uuid' })
  @ApiOkResponse({ description: 'Đã xóa' })
  resetDrawLot(@Param('seasonId') seasonId: string) {
    return this.standingsService.resetDrawLot(seasonId);
  }

  // ── CSV Export ──────────────────────────────────────────────────

  @Get('export/standings')
  @ApiOperation({ summary: 'Export bảng xếp hạng ra CSV' })
  @ApiProduces('text/csv')
  @ApiQuery({ name: 'seasonId', required: false, type: 'string' })
  async exportStandingsCsv(
    @Res() res: Response,
    @Query('seasonId') seasonId?: string,
    @Query('mode') mode: StandingsMode = 'in_progress',
  ) {
    const data = await this.standingsService.getStandings(seasonId, mode);
    const csv = toCsv(data, [
      'position',
      'teamName',
      'played',
      'won',
      'drawn',
      'lost',
      'goalsFor',
      'goalsAgainst',
      'goalDifference',
      'points',
    ]);
    res
      .set('Content-Type', 'text/csv; charset=utf-8')
      .set('Content-Disposition', 'attachment; filename="standings.csv"')
      .send(csv);
  }

  @Get('export/top-scorers')
  @ApiProduces('text/csv')
  @ApiQuery({ name: 'seasonId', required: false, type: 'string' })
  @ApiQuery({ name: 'limit', required: false, type: 'integer' })
  async exportTopScorersCsv(
    @Res() res: Response,
    @Query('seasonId') seasonId?: string,
    @Query('limit') limit?: number,
  ) {
    const data = await this.standingsService.getTopScorers(
      seasonId,
      limit ?? 50,
    );
    const csv = toCsv(data);
    res
      .set('Content-Type', 'text/csv; charset=utf-8')
      .set('Content-Disposition', 'attachment; filename="top-scorers.csv"')
      .send(csv);
  }

  @Get('export/top-assists')
  @ApiProduces('text/csv')
  @ApiQuery({ name: 'seasonId', required: false, type: 'string' })
  @ApiQuery({ name: 'limit', required: false, type: 'integer' })
  async exportTopAssistsCsv(
    @Res() res: Response,
    @Query('seasonId') seasonId?: string,
    @Query('limit') limit?: number,
  ) {
    const data = await this.standingsService.getTopAssists(
      seasonId,
      limit ?? 50,
    );
    const csv = toCsv(data);
    res
      .set('Content-Type', 'text/csv; charset=utf-8')
      .set('Content-Disposition', 'attachment; filename="top-assists.csv"')
      .send(csv);
  }

  @Get('export/card-stats')
  @ApiProduces('text/csv')
  @ApiQuery({ name: 'seasonId', required: false, type: 'string' })
  @ApiQuery({ name: 'limit', required: false, type: 'integer' })
  async exportCardStatsCsv(
    @Res() res: Response,
    @Query('seasonId') seasonId?: string,
    @Query('limit') limit?: number,
  ) {
    const data = await this.standingsService.getCardStats(
      seasonId,
      limit ?? 100,
    );
    const csv = toCsv(data);
    res
      .set('Content-Type', 'text/csv; charset=utf-8')
      .set('Content-Disposition', 'attachment; filename="card-stats.csv"')
      .send(csv);
  }

  @Get('export/team-stats')
  @ApiProduces('text/csv')
  @ApiQuery({ name: 'seasonId', required: false, type: 'string' })
  async exportTeamStatsCsv(
    @Res() res: Response,
    @Query('seasonId') seasonId?: string,
  ) {
    const data = await this.standingsService.getTeamStats(seasonId);
    const csv = toCsv(data);
    res
      .set('Content-Type', 'text/csv; charset=utf-8')
      .set('Content-Disposition', 'attachment; filename="team-stats.csv"')
      .send(csv);
  }

  // ── Head-to-Head ──────────────────────────────────────────

  @Get('head-to-head')
  @ApiOperation({ summary: 'Thống kê đối đầu giữa 2 đội' })
  @ApiQuery({ name: 'team1', required: true, type: 'string' })
  @ApiQuery({ name: 'team2', required: true, type: 'string' })
  @ApiQuery({ name: 'seasonId', required: false, type: 'string' })
  @ApiOkResponse({ description: 'Kết quả đối đầu' })
  getHeadToHead(
    @Query('team1') team1: string,
    @Query('team2') team2: string,
    @Query('seasonId') seasonId?: string,
  ) {
    return this.standingsService.getHeadToHead(team1, team2, seasonId);
  }

  // ── Player Stats ─────────────────────────────────

  @Get('player-stats/:playerId')
  @ApiOperation({ summary: 'Thống kê cá nhân cầu thủ' })
  @ApiParam({ name: 'playerId', type: 'string', format: 'uuid' })
  @ApiQuery({ name: 'seasonId', required: false, type: 'string' })
  @ApiOkResponse({ description: 'Thống kê cá nhân chi tiết' })
  getPlayerStats(
    @Param('playerId') playerId: string,
    @Query('seasonId') seasonId?: string,
  ) {
    return this.standingsService.getPlayerStats(playerId, seasonId);
  }

  // ── Season-specific Standings ─────────────────────────────────

  @Get(':seasonId')
  @ApiOperation({ summary: 'Lấy bảng xếp hạng theo mùa giải' })
  @ApiParam({ name: 'seasonId', type: 'string', format: 'uuid' })
  @ApiOkResponse({ description: 'Bảng xếp hạng' })
  getStandingsBySeason(
    @Param('seasonId') seasonId: string,
    @Query('mode') mode: StandingsMode = 'in_progress',
  ) {
    return this.standingsService.getStandings(seasonId, mode);
  }
}

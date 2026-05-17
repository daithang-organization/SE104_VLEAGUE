import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import {
  Controller,
  Get,
  Param,
  Query,
  Res,
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
import { toCsv } from '../common/utils/csv';
import { StandingsService } from './standings.service';

@ApiTags('Standings')
@Controller('standings')
@UseInterceptors(CacheInterceptor)
export class StandingsController {
  constructor(private readonly standingsService: StandingsService) {}

  @Get()
  @CacheTTL(30000) // Cache for 30 seconds
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
        },
      },
    },
  })
  getStandings(@Query('seasonId') seasonId?: string) {
    return this.standingsService.getStandings(seasonId);
  }

  @Get('top-scorers')
  @ApiOperation({
    summary: 'Lấy danh sách vua phá lưới',
    description: 'Trả về danh sách cầu thủ ghi nhiều bàn thắng nhất',
  })
  @ApiQuery({
    name: 'seasonId',
    required: false,
    type: 'string',
    description: 'ID mùa giải',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'integer',
    description: 'Số lượng cầu thủ (mặc định: 10)',
  })
  @ApiOkResponse({
    description: 'Danh sách vua phá lưới',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          position: { type: 'integer', example: 1 },
          playerId: { type: 'string', format: 'uuid' },
          playerName: { type: 'string', example: 'Nguyễn Quang Hải' },
          teamId: { type: 'string', format: 'uuid' },
          teamName: { type: 'string', example: 'Hà Nội FC' },
          goals: { type: 'integer', example: 12 },
        },
      },
    },
  })
  getTopScorers(
    @Query('seasonId') seasonId?: string,
    @Query('limit') limit?: number,
  ) {
    return this.standingsService.getTopScorers(seasonId, limit ?? 10);
  }

  @Get('top-assists')
  @ApiOperation({
    summary: 'Lấy danh sách kiến tạo',
    description: 'Trả về danh sách cầu thủ kiến tạo nhiều nhất',
  })
  @ApiQuery({
    name: 'seasonId',
    required: false,
    type: 'string',
    description: 'ID mùa giải',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'integer',
    description: 'Số lượng cầu thủ (mặc định: 10)',
  })
  @ApiOkResponse({
    description: 'Danh sách kiến tạo',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          position: { type: 'integer', example: 1 },
          playerId: { type: 'string', format: 'uuid' },
          playerName: { type: 'string', example: 'Nguyễn Quang Hải' },
          teamId: { type: 'string', format: 'uuid' },
          teamName: { type: 'string', example: 'Hà Nội FC' },
          assists: { type: 'integer', example: 8 },
        },
      },
    },
  })
  getTopAssists(
    @Query('seasonId') seasonId?: string,
    @Query('limit') limit?: number,
  ) {
    return this.standingsService.getTopAssists(seasonId, limit ?? 10);
  }

  @Get('card-stats')
  @ApiOperation({
    summary: 'Thống kê thẻ phạt',
    description: 'Trả về danh sách cầu thủ bị thẻ vàng/đỏ nhiều nhất',
  })
  @ApiQuery({
    name: 'seasonId',
    required: false,
    type: 'string',
    description: 'ID mùa giải',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'integer',
    description: 'Số lượng (mặc định: 20)',
  })
  @ApiOkResponse({ description: 'Danh sách thẻ phạt' })
  getCardStats(
    @Query('seasonId') seasonId?: string,
    @Query('limit') limit?: number,
  ) {
    return this.standingsService.getCardStats(seasonId, limit ?? 20);
  }

  @Get('team-stats')
  @ApiOperation({
    summary: 'Thống kê theo đội',
    description:
      'Trả về thống kê tổng hợp theo đội: trận, bàn thắng, thẻ, sạch lưới',
  })
  @ApiQuery({
    name: 'seasonId',
    required: false,
    type: 'string',
    description: 'ID mùa giải',
  })
  @ApiOkResponse({ description: 'Thống kê đội' })
  getTeamStats(@Query('seasonId') seasonId?: string) {
    return this.standingsService.getTeamStats(seasonId);
  }

  // ── CSV Export Endpoints ──────────────────────────────────────

  @Get('export/standings')
  @ApiOperation({
    summary: 'Export bảng xếp hạng ra CSV',
    description: 'Tải xuống bảng xếp hạng dưới dạng file CSV',
  })
  @ApiProduces('text/csv')
  @ApiQuery({ name: 'seasonId', required: false, type: 'string' })
  async exportStandingsCsv(
    @Res() res: Response,
    @Query('seasonId') seasonId?: string,
  ) {
    const data = await this.standingsService.getStandings(seasonId);
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
  @ApiOperation({
    summary: 'Export vua phá lưới ra CSV',
    description: 'Tải xuống danh sách vua phá lưới dưới dạng file CSV',
  })
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
  @ApiOperation({
    summary: 'Export kiến tạo ra CSV',
    description: 'Tải xuống danh sách kiến tạo dưới dạng file CSV',
  })
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
  @ApiOperation({
    summary: 'Export thống kê thẻ phạt ra CSV',
    description: 'Tải xuống danh sách thẻ phạt dưới dạng file CSV',
  })
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
  @ApiOperation({
    summary: 'Export thống kê đội ra CSV',
    description: 'Tải xuống thống kê tổng hợp theo đội dưới dạng file CSV',
  })
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
  @ApiQuery({
    name: 'team1',
    required: true,
    type: 'string',
    description: 'ID đội 1',
  })
  @ApiQuery({
    name: 'team2',
    required: true,
    type: 'string',
    description: 'ID đội 2',
  })
  @ApiQuery({ name: 'seasonId', required: false, type: 'string' })
  @ApiOkResponse({ description: 'Kết quả đối đầu' })
  getHeadToHead(
    @Query('team1') team1: string,
    @Query('team2') team2: string,
    @Query('seasonId') seasonId?: string,
  ) {
    return this.standingsService.getHeadToHead(team1, team2, seasonId);
  }

  // ── Player Individual Stats ─────────────────────────────────

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
  @ApiOperation({
    summary: 'Lấy bảng xếp hạng theo mùa giải',
    description: 'Trả về bảng xếp hạng cho mùa giải cụ thể',
  })
  @ApiParam({ name: 'seasonId', type: 'string', format: 'uuid' })
  @ApiOkResponse({ description: 'Bảng xếp hạng' })
  getStandingsBySeason(@Param('seasonId') seasonId: string) {
    return this.standingsService.getStandings(seasonId);
  }
}

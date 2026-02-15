import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
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

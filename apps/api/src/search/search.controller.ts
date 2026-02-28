import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({
    summary: 'Tìm kiếm toàn cục (đội, cầu thủ, trận đấu, sân, mùa giải)',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Từ khóa tìm kiếm (tối thiểu 2 ký tự)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'integer',
    description: 'Giới hạn kết quả',
  })
  @ApiOkResponse({ description: 'Kết quả tìm kiếm' })
  search(@Query('q') query: string, @Query('limit') limit?: string) {
    return this.searchService.globalSearch(query, limit ? Number(limit) : 10);
  }
}

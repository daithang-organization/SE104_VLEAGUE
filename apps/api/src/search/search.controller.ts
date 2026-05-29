import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SearchDto } from './dto/search.dto';
import { SearchService } from './search.service';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({
    summary: 'Tìm kiếm toàn cục (đội, cầu thủ, trận đấu, sân, mùa giải)',
  })
  @ApiOkResponse({ description: 'Kết quả tìm kiếm' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  search(@Query() dto: SearchDto) {
    return this.searchService.globalSearch(dto.q, dto.limit ?? 10);
  }
}

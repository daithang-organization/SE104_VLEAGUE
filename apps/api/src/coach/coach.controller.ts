import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard, Role, Roles, RolesGuard } from '../auth';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { CoachService } from './coach.service';
import { CreateCoachDto, UpdateCoachDto } from './dto/coach.dto';

@ApiTags('Coaches')
@Controller('coaches')
export class CoachController {
  constructor(private readonly coachService: CoachService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách huấn luyện viên' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'teamId', required: false, type: 'string' })
  @ApiOkResponse({ description: 'Danh sách HLV (phân trang)' })
  findAll(
    @Query() pagination: PaginationQueryDto,
    @Query('search') search?: string,
    @Query('teamId') teamId?: string,
  ) {
    return this.coachService.findAll({ ...pagination, search, teamId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin HLV' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiOkResponse({ description: 'Thông tin chi tiết HLV' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy HLV' })
  findOne(@Param('id') id: string) {
    return this.coachService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Tạo HLV mới' })
  @ApiBody({ type: CreateCoachDto })
  @ApiOkResponse({ description: 'HLV đã được tạo' })
  create(@Body() dto: CreateCoachDto) {
    return this.coachService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Cập nhật HLV' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiBody({ type: UpdateCoachDto })
  @ApiOkResponse({ description: 'HLV đã được cập nhật' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy HLV' })
  update(@Param('id') id: string, @Body() dto: UpdateCoachDto) {
    return this.coachService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Xóa HLV' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiOkResponse({ description: 'Đã xóa HLV' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy HLV' })
  remove(@Param('id') id: string) {
    return this.coachService.remove(id);
  }
}

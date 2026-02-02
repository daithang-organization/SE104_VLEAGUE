import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard, Role, Roles, RolesGuard } from '../auth';
import { CreateSeasonDto, UpdateSeasonDto } from './dto';
import { SeasonService } from './season.service';

@ApiTags('Seasons')
@Controller('seasons')
export class SeasonController {
  constructor(private readonly seasonService: SeasonService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách mùa giải',
    description: 'Trả về tất cả mùa giải, sắp xếp theo năm giảm dần',
  })
  @ApiOkResponse({
    description: 'Danh sách mùa giải',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'VLeague 2024' },
          year: { type: 'integer', example: 2024 },
          status: {
            type: 'string',
            enum: ['UPCOMING', 'IN_PROGRESS', 'COMPLETED'],
          },
          startDate: { type: 'string', format: 'date-time', nullable: true },
          endDate: { type: 'string', format: 'date-time', nullable: true },
        },
      },
    },
  })
  findAll() {
    return this.seasonService.findAll();
  }

  @Get('current')
  @ApiOperation({
    summary: 'Lấy mùa giải hiện tại',
    description: 'Trả về mùa giải đang diễn ra (status = IN_PROGRESS)',
  })
  @ApiOkResponse({
    description: 'Mùa giải hiện tại hoặc null',
  })
  findCurrent() {
    return this.seasonService.findCurrent();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy chi tiết mùa giải',
    description: 'Trả về thông tin chi tiết của một mùa giải',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiOkResponse({ description: 'Thông tin mùa giải' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy mùa giải' })
  findOne(@Param('id') id: string) {
    return this.seasonService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Tạo mùa giải mới',
    description: 'Chỉ ADMIN có quyền tạo mùa giải',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'year'],
      properties: {
        name: { type: 'string', example: 'VLeague 2025' },
        year: { type: 'integer', example: 2025 },
        status: {
          type: 'string',
          enum: ['UPCOMING', 'IN_PROGRESS', 'COMPLETED'],
          default: 'UPCOMING',
        },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiOkResponse({ description: 'Mùa giải đã được tạo' })
  @ApiConflictResponse({ description: 'Tên mùa giải đã tồn tại' })
  @ApiUnauthorizedResponse({ description: 'Chưa đăng nhập' })
  @ApiForbiddenResponse({ description: 'Không có quyền (yêu cầu ADMIN)' })
  create(@Body() dto: CreateSeasonDto) {
    return this.seasonService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Cập nhật mùa giải',
    description: 'Chỉ ADMIN có quyền cập nhật mùa giải',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        year: { type: 'integer' },
        status: {
          type: 'string',
          enum: ['UPCOMING', 'IN_PROGRESS', 'COMPLETED'],
        },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiOkResponse({ description: 'Mùa giải đã được cập nhật' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy mùa giải' })
  @ApiForbiddenResponse({ description: 'Không có quyền (yêu cầu ADMIN)' })
  update(@Param('id') id: string, @Body() dto: UpdateSeasonDto) {
    return this.seasonService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Xóa mùa giải',
    description: 'Chỉ ADMIN có quyền xóa mùa giải',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiOkResponse({ description: 'Mùa giải đã được xóa' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy mùa giải' })
  @ApiForbiddenResponse({ description: 'Không có quyền (yêu cầu ADMIN)' })
  delete(@Param('id') id: string) {
    return this.seasonService.delete(id);
  }
}

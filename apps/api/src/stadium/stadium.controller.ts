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
import { CreateStadiumDto, UpdateStadiumDto } from './dto';
import { StadiumService } from './stadium.service';

@ApiTags('Stadiums')
@Controller('stadiums')
export class StadiumController {
  constructor(private readonly stadiumService: StadiumService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách sân vận động',
    description: 'Trả về tất cả sân vận động',
  })
  @ApiOkResponse({
    description: 'Danh sách sân vận động',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Sân Mỹ Đình' },
          city: { type: 'string', example: 'Hà Nội' },
          country: { type: 'string', example: 'Việt Nam' },
          capacity: { type: 'integer', example: 40000, nullable: true },
          fifaStars: { type: 'integer', example: 2, nullable: true },
        },
      },
    },
  })
  findAll() {
    return this.stadiumService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy chi tiết sân vận động',
    description: 'Trả về thông tin chi tiết và các đội sân nhà',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiOkResponse({ description: 'Thông tin sân vận động' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy sân vận động' })
  findOne(@Param('id') id: string) {
    return this.stadiumService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Tạo sân vận động mới',
    description: 'Chỉ ADMIN có quyền tạo',
  })
  @ApiBody({ type: CreateStadiumDto })
  @ApiOkResponse({ description: 'Sân vận động đã được tạo' })
  @ApiConflictResponse({ description: 'Tên sân vận động đã tồn tại' })
  @ApiUnauthorizedResponse({ description: 'Chưa đăng nhập' })
  @ApiForbiddenResponse({ description: 'Không có quyền (yêu cầu ADMIN)' })
  create(@Body() dto: CreateStadiumDto) {
    return this.stadiumService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Cập nhật sân vận động',
    description: 'Chỉ ADMIN có quyền cập nhật',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiBody({ type: UpdateStadiumDto })
  @ApiOkResponse({ description: 'Sân vận động đã được cập nhật' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy sân vận động' })
  @ApiForbiddenResponse({ description: 'Không có quyền (yêu cầu ADMIN)' })
  update(@Param('id') id: string, @Body() dto: UpdateStadiumDto) {
    return this.stadiumService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Xóa sân vận động',
    description: 'Chỉ ADMIN có quyền xóa',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiOkResponse({ description: 'Sân vận động đã được xóa' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy sân vận động' })
  @ApiForbiddenResponse({ description: 'Không có quyền (yêu cầu ADMIN)' })
  delete(@Param('id') id: string) {
    return this.stadiumService.delete(id);
  }
}

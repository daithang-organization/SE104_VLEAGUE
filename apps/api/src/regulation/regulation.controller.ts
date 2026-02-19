import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard, Role, Roles, RolesGuard } from '../auth';
import { CreateRegulationDto } from './dto/regulation.dto';
import { RegulationService } from './regulation.service';

@ApiTags('Regulations')
@Controller('seasons/:seasonId/regulations')
export class RegulationController {
  constructor(private readonly regulationService: RegulationService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách quy định của mùa giải',
    description: 'Trả về tất cả quy định của một mùa giải',
  })
  @ApiParam({ name: 'seasonId', type: 'string', format: 'uuid' })
  @ApiOkResponse({ description: 'Danh sách quy định' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy mùa giải' })
  findAll(@Param('seasonId') seasonId: string) {
    return this.regulationService.findAll(seasonId);
  }

  @Get(':key')
  @ApiOperation({
    summary: 'Lấy quy định theo khóa',
    description:
      'Trả về quy định cụ thể theo khóa (ví dụ: MAX_FOREIGN_PLAYERS)',
  })
  @ApiParam({ name: 'seasonId', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'key', type: 'string', example: 'MAX_FOREIGN_PLAYERS' })
  @ApiOkResponse({ description: 'Thông tin quy định' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy quy định' })
  findByKey(@Param('seasonId') seasonId: string, @Param('key') key: string) {
    return this.regulationService.findByKey(seasonId, key);
  }

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Tạo hoặc cập nhật quy định',
    description: 'Upsert quy định theo khóa. Chỉ ADMIN có quyền.',
  })
  @ApiParam({ name: 'seasonId', type: 'string', format: 'uuid' })
  @ApiBody({ type: CreateRegulationDto })
  @ApiOkResponse({ description: 'Quy định đã được tạo/cập nhật' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy mùa giải' })
  @ApiUnauthorizedResponse({ description: 'Chưa đăng nhập' })
  @ApiForbiddenResponse({ description: 'Không có quyền (yêu cầu ADMIN)' })
  upsert(
    @Param('seasonId') seasonId: string,
    @Body() dto: CreateRegulationDto,
  ) {
    return this.regulationService.upsert(seasonId, dto);
  }

  @Delete(':key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Xóa quy định',
    description: 'Xóa quy định theo khóa. Chỉ ADMIN có quyền.',
  })
  @ApiParam({ name: 'seasonId', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'key', type: 'string', example: 'MAX_FOREIGN_PLAYERS' })
  @ApiOkResponse({ description: 'Quy định đã được xóa' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy quy định' })
  @ApiForbiddenResponse({ description: 'Không có quyền (yêu cầu ADMIN)' })
  delete(@Param('seasonId') seasonId: string, @Param('key') key: string) {
    return this.regulationService.delete(seasonId, key);
  }

  @Post('seed-defaults')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Khởi tạo quy định mặc định',
    description:
      'Tạo bộ quy định mặc định cho mùa giải (tuổi, đội hình, điểm số...)',
  })
  @ApiParam({ name: 'seasonId', type: 'string', format: 'uuid' })
  @ApiOkResponse({ description: 'Quy định mặc định đã được tạo' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy mùa giải' })
  @ApiForbiddenResponse({ description: 'Không có quyền (yêu cầu ADMIN)' })
  seedDefaults(@Param('seasonId') seasonId: string) {
    return this.regulationService.seedDefaults(seasonId);
  }
}

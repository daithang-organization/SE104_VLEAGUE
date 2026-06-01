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
  UseInterceptors,
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
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { AuditLogInterceptor } from '../common/interceptors/audit-log.interceptor';
import { CreateTeamDto, UpdateTeamDto } from './dto/team.dto';
import { RegistrationService } from './registration.service';

@ApiTags('Teams')
@Controller('teams')
export class TeamsController {
  constructor(private readonly reg: RegistrationService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách đội bóng',
    description:
      'Trả về danh sách đội bóng có hỗ trợ phân trang và tìm kiếm (search, status)',
  })
  @ApiOkResponse({ description: 'Danh sách đội bóng (phân trang)' })
  async getTeams(
    @Query() pagination: PaginationQueryDto,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return await this.reg.listTeams({ ...pagination, search, status });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy chi tiết đội bóng',
    description: 'Trả về thông tin chi tiết của một đội bóng',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiOkResponse({ description: 'Thông tin đội bóng' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy đội bóng' })
  async getTeam(@Param('id') id: string, @Query('seasonId') seasonId?: string) {
    if (!seasonId) {
      return await this.reg.findOneTeam(id);
    }
    return await this.reg.findOneTeam(id, seasonId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(AuditLogInterceptor)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Tạo đội bóng mới',
    description: 'Chỉ ADMIN có quyền tạo đội bóng',
  })
  @ApiBody({ type: CreateTeamDto })
  @ApiOkResponse({ description: 'Đội bóng đã được tạo' })
  @ApiConflictResponse({ description: 'Tên đội bóng đã tồn tại' })
  @ApiUnauthorizedResponse({ description: 'Chưa đăng nhập' })
  @ApiForbiddenResponse({ description: 'Không có quyền (yêu cầu ADMIN)' })
  async createTeam(@Body() dto: CreateTeamDto) {
    return await this.reg.createTeam(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(AuditLogInterceptor)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Cập nhật đội bóng',
    description: 'Chỉ ADMIN có quyền cập nhật',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiBody({ type: UpdateTeamDto })
  @ApiOkResponse({ description: 'Đội bóng đã được cập nhật' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy đội bóng' })
  @ApiConflictResponse({ description: 'Tên đội bóng đã tồn tại' })
  @ApiForbiddenResponse({ description: 'Không có quyền (yêu cầu ADMIN)' })
  async updateTeam(@Param('id') id: string, @Body() dto: UpdateTeamDto) {
    return await this.reg.updateTeam(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(AuditLogInterceptor)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Xóa đội bóng',
    description: 'Chỉ ADMIN có quyền xóa',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiOkResponse({ description: 'Đội bóng đã được xóa' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy đội bóng' })
  @ApiForbiddenResponse({ description: 'Không có quyền (yêu cầu ADMIN)' })
  async deleteTeam(@Param('id') id: string) {
    return await this.reg.deleteTeam(id);
  }
}

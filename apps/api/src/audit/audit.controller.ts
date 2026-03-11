import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard, Role, Roles, RolesGuard } from '../auth';
import { AuditService } from './audit.service';

@ApiTags('Audit Logs')
@ApiBearerAuth('access-token')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Lấy danh sách audit log',
    description:
      'Truy vấn audit log với phân trang và filter theo entity, action, userId. Chỉ ADMIN.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Trang (mặc định: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Số lượng mỗi trang (mặc định: 20)',
  })
  @ApiQuery({
    name: 'entity',
    required: false,
    type: String,
    description: 'Lọc theo entity (vd: Team, Player, Match)',
  })
  @ApiQuery({
    name: 'action',
    required: false,
    type: String,
    description: 'Lọc theo action (vd: CREATE, UPDATE, DELETE)',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description: 'Lọc theo userId (UUID)',
  })
  @ApiOkResponse({ description: 'Danh sách audit log (phân trang)' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('entity') entity?: string,
    @Query('action') action?: string,
    @Query('userId') userId?: string,
  ) {
    return this.auditService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      entity,
      action,
      userId,
    });
  }
}

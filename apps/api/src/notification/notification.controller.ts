import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard, Role, Roles, RolesGuard } from '../auth';
import { NotificationService } from './notification.service';

@ApiTags('Notifications')
@ApiBearerAuth('access-token')
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @Roles(
    Role.ADMIN,
    Role.TEAM_MANAGER,
    Role.REFEREE,
    Role.SUPERVISOR,
    Role.PUBLIC,
  )
  @ApiOperation({
    summary: 'Lấy danh sách thông báo',
    description:
      'Lấy thông báo của người dùng hiện tại (bao gồm thông báo chung)',
  })
  @ApiOkResponse({ description: 'Danh sách thông báo (phân trang)' })
  getNotifications(
    @Req() req: { user: { id: string } },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.notificationService.getForUser(req.user.id, {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  @Patch(':id/read')
  @Roles(
    Role.ADMIN,
    Role.TEAM_MANAGER,
    Role.REFEREE,
    Role.SUPERVISOR,
    Role.PUBLIC,
  )
  @ApiOperation({
    summary: 'Đánh dấu đã đọc thông báo',
  })
  markAsRead(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return this.notificationService.markAsRead(id, req.user.id);
  }

  @Patch('read-all')
  @Roles(
    Role.ADMIN,
    Role.TEAM_MANAGER,
    Role.REFEREE,
    Role.SUPERVISOR,
    Role.PUBLIC,
  )
  @ApiOperation({
    summary: 'Đánh dấu tất cả đã đọc',
  })
  markAllAsRead(@Req() req: { user: { id: string } }) {
    return this.notificationService.markAllAsRead(req.user.id);
  }
}

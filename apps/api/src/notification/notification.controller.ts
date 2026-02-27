import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, type CurrentUserPayload } from '../auth';
import { NotificationService } from './notification.service';

@ApiTags('Notifications')
@ApiBearerAuth('access-token')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách thông báo' })
  @ApiQuery({ name: 'page', required: false, type: 'integer' })
  @ApiQuery({ name: 'limit', required: false, type: 'integer' })
  @ApiQuery({ name: 'unreadOnly', required: false, type: 'boolean' })
  @ApiOkResponse({ description: 'Danh sách thông báo (phân trang)' })
  getNotifications(
    @CurrentUser() user: CurrentUserPayload,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.notificationService.getNotifications(user.id, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      unreadOnly: unreadOnly === 'true',
    });
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Đếm số thông báo chưa đọc' })
  @ApiOkResponse({ description: 'Số thông báo chưa đọc' })
  getUnreadCount(@CurrentUser() user: CurrentUserPayload) {
    return this.notificationService.getUnreadCount(user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Đánh dấu thông báo đã đọc' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiOkResponse({ description: 'Đã đánh dấu đã đọc' })
  markAsRead(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.notificationService.markAsRead(user.id, id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Đánh dấu tất cả thông báo đã đọc' })
  @ApiOkResponse({ description: 'Đã đánh dấu tất cả đã đọc' })
  markAllAsRead(@CurrentUser() user: CurrentUserPayload) {
    return this.notificationService.markAllAsRead(user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa thông báo' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiOkResponse({ description: 'Đã xóa thông báo' })
  remove(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.notificationService.remove(user.id, id);
  }
}

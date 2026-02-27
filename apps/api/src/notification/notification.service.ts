import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type CreateNotificationInput = {
  userId: string;
  type?:
    | 'MATCH_FINISHED'
    | 'SCHEDULE_PUBLISHED'
    | 'SEASON_STARTED'
    | 'TEAM_REGISTERED'
    | 'GENERAL';
  title: string;
  message: string;
  link?: string;
};

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private prisma: PrismaService) {}

  /** Get notifications for a user */
  async getNotifications(
    userId: string,
    pagination?: { page?: number; limit?: number; unreadOnly?: boolean },
  ) {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId };
    if (pagination?.unreadOnly) where.readAt = null;

    const [data, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, readAt: null } }),
    ]);

    return {
      data,
      total,
      unreadCount,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /** Get unread count */
  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.prisma.notification.count({
      where: { userId, readAt: null },
    });
    return { count };
  }

  /** Mark one notification as read */
  async markAsRead(userId: string, notificationId: string) {
    const notif = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });
    if (!notif) throw new NotFoundException('Notification not found');

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    });
  }

  /** Mark all notifications as read */
  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { success: true, count: result.count };
  }

  /** Create a notification (internal use) */
  async create(input: CreateNotificationInput) {
    return this.prisma.notification.create({
      data: {
        userId: input.userId,
        type: (input.type ?? 'GENERAL') as never,
        title: input.title,
        message: input.message,
        link: input.link,
      },
    });
  }

  /** Broadcast notification to all users or specific roles */
  async broadcast(
    input: Omit<CreateNotificationInput, 'userId'>,
    options?: { roles?: string[] },
  ) {
    const where: Record<string, unknown> = {};
    if (options?.roles?.length) {
      where.role = { in: options.roles };
    }

    const users = await this.prisma.user.findMany({
      where,
      select: { id: true },
    });

    const notifications = users.map((u) => ({
      userId: u.id,
      type: (input.type ?? 'GENERAL') as never,
      title: input.title,
      message: input.message,
      link: input.link,
    }));

    if (notifications.length > 0) {
      await this.prisma.notification.createMany({ data: notifications });
    }

    this.logger.log(
      `Broadcast notification "${input.title}" to ${notifications.length} users`,
    );
    return { success: true, recipientCount: notifications.length };
  }

  /** Delete a notification */
  async remove(userId: string, notificationId: string) {
    const notif = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });
    if (!notif) throw new NotFoundException('Notification not found');

    await this.prisma.notification.delete({ where: { id: notificationId } });
    return { success: true };
  }
}

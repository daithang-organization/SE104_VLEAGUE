import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateNotificationDto {
  userId?: string;
  title: string;
  message: string;
  type:
    | 'MATCH_RESULT'
    | 'STATUS_CHANGE'
    | 'SCHEDULE_CHANGE'
    | 'TEAM_INVITATION'
    | 'SYSTEM';
  entityType?: string;
  entityId?: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create notification for a specific user
   */
  async createForUser(dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        userId: dto.userId,
        title: dto.title,
        message: dto.message,
        type: dto.type,
        entityType: dto.entityType,
        entityId: dto.entityId,
      },
    });
  }

  /**
   * Broadcast notification to all users (userId = null means broadcast)
   */
  async broadcast(dto: Omit<CreateNotificationDto, 'userId'>) {
    return this.prisma.notification.create({
      data: {
        userId: null,
        title: dto.title,
        message: dto.message,
        type: dto.type,
        entityType: dto.entityType,
        entityId: dto.entityId,
      },
    });
  }

  /**
   * Get notifications for a user (include broadcasts)
   */
  async getForUser(
    userId: string,
    pagination?: { page?: number; limit?: number },
  ) {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      OR: [{ userId }, { userId: null }],
    };

    const [data, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({
        where: { ...where, readAt: null },
      }),
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

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        OR: [{ userId }, { userId: null }],
      },
      data: { readAt: new Date() },
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        OR: [{ userId }, { userId: null }],
        readAt: null,
      },
      data: { readAt: new Date() },
    });
  }

  /**
   * Notify on match status change
   */
  async notifyMatchStatusChange(
    matchId: string,
    homeTeam: string,
    awayTeam: string,
    newStatus: string,
  ) {
    const statusLabels: Record<string, string> = {
      PUBLISHED: 'được công bố',
      LOCKED: 'bắt đầu',
      FINISHED: 'kết thúc',
      POSTPONED: 'bị hoãn',
    };

    const statusLabel = statusLabels[newStatus] || newStatus;

    await this.broadcast({
      title: 'Cập nhật trận đấu',
      message: `Trận ${homeTeam} vs ${awayTeam} đã ${statusLabel}`,
      type: 'STATUS_CHANGE',
      entityType: 'match',
      entityId: matchId,
    });

    this.logger.log(
      `Notification sent: match ${matchId} status → ${newStatus}`,
    );
  }

  /**
   * Notify on match result (when FINISHED)
   */
  async notifyMatchResult(
    matchId: string,
    homeTeam: string,
    awayTeam: string,
    homeScore: number,
    awayScore: number,
  ) {
    await this.broadcast({
      title: 'Kết quả trận đấu',
      message: `${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}`,
      type: 'MATCH_RESULT',
      entityType: 'match',
      entityId: matchId,
    });

    this.logger.log(
      `Match result notification: ${homeTeam} ${homeScore}-${awayScore} ${awayTeam}`,
    );
  }

  async notifyDisciplinaryReferralToAdmins(params: {
    matchId: string;
    homeTeam: string;
    awayTeam: string;
    kickoffAt?: Date | null;
    supervisorName: string;
  }) {
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    if (admins.length === 0) return;

    const kickoffText = params.kickoffAt
      ? params.kickoffAt.toLocaleString('vi-VN', {
          timeZone: 'Asia/Ho_Chi_Minh',
          hour12: false,
        })
      : 'chưa có thời gian';
    const matchName = `${params.homeTeam} vs ${params.awayTeam}`;

    await Promise.all(
      admins.map((admin) =>
        this.createForUser({
          userId: admin.id,
          title: 'Trận đấu cần xử lý kỷ luật',
          message: `${params.supervisorName} đã chuyển trận ${matchName} (${kickoffText}) đến BTC kỷ luật.`,
          type: 'SYSTEM',
          entityType: 'match',
          entityId: params.matchId,
        }),
      ),
    );
  }
}

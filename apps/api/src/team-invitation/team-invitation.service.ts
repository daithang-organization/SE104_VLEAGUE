import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  SeasonTeamStatus,
  TeamInvitationSourceType,
  TeamInvitationStatus,
} from '@prisma/client';
import { NotificationService } from '../notification/notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { DEFAULT_REGULATIONS } from '../regulation/regulation.service';
import {
  RespondTeamInvitationDto,
  SendTeamInvitationDto,
} from './dto/team-invitation.dto';

const RESPONSE_STATUSES = [
  TeamInvitationStatus.ACCEPTED,
  TeamInvitationStatus.DECLINED,
] as const;

@Injectable()
export class TeamInvitationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  private invitationInclude = {
    season: {
      select: {
        id: true,
        name: true,
        year: true,
        status: true,
        startDate: true,
        endDate: true,
      },
    },
    team: {
      select: {
        id: true,
        name: true,
        shortName: true,
        city: true,
        logoUrl: true,
      },
    },
  } satisfies Prisma.TeamInvitationInclude;

  async listForSeason(seasonId: string) {
    await this.ensureSeasonExists(seasonId);

    return this.prisma.teamInvitation.findMany({
      where: { seasonId },
      include: this.invitationInclude,
      orderBy: [{ sentAt: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async sendInvitation(seasonId: string, dto: SendTeamInvitationDto) {
    const [season, team] = await Promise.all([
      this.ensureSeasonExists(seasonId),
      this.ensureTeamExists(dto.teamId),
    ]);

    const managerAssignments = await this.prisma.teamManagerAssignment.findMany(
      {
        where: { seasonId, teamId: dto.teamId },
        include: {
          user: { select: { id: true, email: true, name: true } },
        },
      },
    );

    if (managerAssignments.length === 0) {
      throw new BadRequestException(
        'CLB này chưa có tài khoản TEAM_MANAGER trong mùa giải nên chưa thể gửi popup lời mời.',
      );
    }

    const sentAt = new Date();
    const deadlineAt = this.addDays(sentAt, 14);
    const regulationsSnapshot = await this.buildRegulationsSnapshot(seasonId);

    const invitation = await this.prisma.teamInvitation.upsert({
      where: { seasonId_teamId: { seasonId, teamId: dto.teamId } },
      create: {
        seasonId,
        teamId: dto.teamId,
        sourceType: dto.sourceType,
        status: TeamInvitationStatus.SENT,
        sentAt,
        deadlineAt,
        regulationsSnapshot,
      },
      update: {
        sourceType: dto.sourceType,
        status: TeamInvitationStatus.SENT,
        sentAt,
        deadlineAt,
        responseAt: null,
        responseReason: null,
        regulationsSnapshot,
      },
      include: this.invitationInclude,
    });

    const message = this.buildNotificationMessage(
      season.name,
      team.name,
      deadlineAt,
      regulationsSnapshot,
    );

    await Promise.all(
      managerAssignments.map((assignment) =>
        this.notificationService.createForUser({
          userId: assignment.userId,
          title: `Lời mời tham dự ${season.name}`,
          message,
          type: 'TEAM_INVITATION',
          entityType: 'team_invitation',
          entityId: invitation.id,
        }),
      ),
    );

    return invitation;
  }

  async getPendingForManager(userId: string) {
    const assignments = await this.prisma.teamManagerAssignment.findMany({
      where: { userId },
      select: { seasonId: true, teamId: true },
    });

    if (assignments.length === 0) return [];

    return this.prisma.teamInvitation.findMany({
      where: {
        status: TeamInvitationStatus.SENT,
        deadlineAt: { gte: new Date() },
        OR: assignments.map((assignment) => ({
          seasonId: assignment.seasonId,
          teamId: assignment.teamId,
        })),
      },
      include: this.invitationInclude,
      orderBy: { deadlineAt: 'asc' },
    });
  }

  async respondToInvitation(
    invitationId: string,
    userId: string,
    dto: RespondTeamInvitationDto,
  ) {
    if (!RESPONSE_STATUSES.includes(dto.responseStatus as never)) {
      throw new BadRequestException('Phản hồi lời mời không hợp lệ.');
    }

    const invitation = await this.prisma.teamInvitation.findUnique({
      where: { id: invitationId },
      include: this.invitationInclude,
    });

    if (!invitation) {
      throw new NotFoundException('Không tìm thấy lời mời tham dự mùa giải.');
    }

    if (invitation.status !== TeamInvitationStatus.SENT) {
      throw new BadRequestException('Lời mời này đã được phản hồi.');
    }

    if (invitation.deadlineAt < new Date()) {
      throw new BadRequestException('Lời mời đã quá hạn phản hồi.');
    }

    const assignment = await this.prisma.teamManagerAssignment.findFirst({
      where: {
        userId,
        seasonId: invitation.seasonId,
        teamId: invitation.teamId,
      },
    });

    if (!assignment) {
      throw new ForbiddenException('Bạn không có quyền phản hồi lời mời này.');
    }

    const responseStatus = dto.responseStatus as TeamInvitationStatus;
    const updatedInvitation = await this.prisma.teamInvitation.update({
      where: { id: invitationId },
      data: {
        status: responseStatus,
        responseAt: new Date(),
        responseReason: dto.responseReason ?? null,
      },
      include: this.invitationInclude,
    });

    if (responseStatus === TeamInvitationStatus.ACCEPTED) {
      await this.prisma.seasonTeam.upsert({
        where: {
          seasonId_teamId: {
            seasonId: invitation.seasonId,
            teamId: invitation.teamId,
          },
        },
        create: {
          seasonId: invitation.seasonId,
          teamId: invitation.teamId,
          status: SeasonTeamStatus.REGISTERED,
        },
        update: {
          status: SeasonTeamStatus.REGISTERED,
          approvedAt: null,
        },
      });
    } else {
      await this.prisma.seasonTeam.updateMany({
        where: {
          seasonId: invitation.seasonId,
          teamId: invitation.teamId,
          status: { not: SeasonTeamStatus.APPROVED },
        },
        data: {
          status: SeasonTeamStatus.REJECTED,
          approvedAt: null,
        },
      });
    }

    return updatedInvitation;
  }

  private async ensureSeasonExists(seasonId: string) {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
    });

    if (!season) {
      throw new NotFoundException('Không tìm thấy mùa giải.');
    }

    return season;
  }

  private async ensureTeamExists(teamId: string) {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });

    if (!team) {
      throw new NotFoundException('Không tìm thấy CLB.');
    }

    return team;
  }

  private async buildRegulationsSnapshot(seasonId: string) {
    const keys = [
      'MIN_ROSTER',
      'MAX_ROSTER',
      'MAX_FOREIGN_PLAYERS',
      'MAX_FOREIGN_PLAYERS_ON_FIELD',
      'MIN_STADIUM_CAPACITY',
      'MIN_STADIUM_FIFA_STARS',
      'PARTICIPATION_FEE_VND',
    ];
    const defaults = new Map(
      DEFAULT_REGULATIONS.map((reg) => [reg.key, reg.value]),
    );
    const regulations = await this.prisma.regulation.findMany({
      where: { seasonId, key: { in: keys } },
      select: { key: true, value: true },
    });
    const values = new Map(regulations.map((reg) => [reg.key, reg.value]));

    return keys.reduce<Record<string, string>>((snapshot, key) => {
      snapshot[key] = values.get(key) ?? defaults.get(key) ?? '';
      return snapshot;
    }, {});
  }

  private buildNotificationMessage(
    seasonName: string,
    teamName: string,
    deadlineAt: Date,
    regulations: Record<string, string>,
  ) {
    return [
      `BTC mời ${teamName} tham dự ${seasonName}.`,
      `Hạn phản hồi: ${deadlineAt.toLocaleDateString('vi-VN')}.`,
      `Lệ phí tham dự: ${this.formatVnd(regulations['PARTICIPATION_FEE_VND'])}.`,
      `Quy định chính: ${regulations['MIN_ROSTER']}-${regulations['MAX_ROSTER']} cầu thủ, tối đa ${regulations['MAX_FOREIGN_PLAYERS']} ngoại binh đăng ký, tối đa ${regulations['MAX_FOREIGN_PLAYERS_ON_FIELD']} ngoại binh trên sân, sân tối thiểu ${Number(regulations['MIN_STADIUM_CAPACITY']).toLocaleString('vi-VN')} chỗ và đạt ít nhất ${regulations['MIN_STADIUM_FIFA_STARS']} sao FIFA.`,
    ].join(' ');
  }

  private formatVnd(value?: string) {
    const amount = Number(value ?? 0);
    if (!Number.isFinite(amount) || amount <= 0) return '1.000.000.000 VND';
    return `${amount.toLocaleString('vi-VN')} VND`;
  }

  private addDays(date: Date, days: number) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}

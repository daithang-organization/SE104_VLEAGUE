import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { NotificationService } from '../notification/notification.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  SubmitTeamApplicationDto,
  UpdateManagedTeamDto,
} from './dto/team-manager-assignment.dto';

@Injectable()
export class TeamManagerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  private assignmentInclude = {
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
        logoUrl: true,
        coachName: true,
        city: true,
        status: true,
        stadium: { select: { id: true, name: true, city: true } },
      },
    },
  } satisfies Prisma.TeamManagerAssignmentInclude;

  async getAssignment(userId: string, seasonId: string) {
    if (!seasonId) {
      throw new BadRequestException('seasonId là bắt buộc.');
    }

    const user = await this.getTeamManagerUser(userId);
    if (!user.managedTeamId) return null;

    return this.upsertSeasonAssignment(user.id, seasonId, user.managedTeamId);
  }

  async getManagedTeam(userId: string) {
    const user = await this.getTeamManagerUser(userId);
    if (!user.managedTeamId) return null;

    return this.prisma.team.findUnique({
      where: { id: user.managedTeamId },
      select: {
        id: true,
        name: true,
        shortName: true,
        logoUrl: true,
        coachName: true,
        city: true,
        status: true,
        stadiumId: true,
        createdAt: true,
        updatedAt: true,
        stadium: { select: { id: true, name: true, city: true } },
      },
    });
  }

  async updateManagedTeam(userId: string, dto: UpdateManagedTeamDto) {
    const user = await this.getTeamManagerUser(userId);
    if (!user.managedTeamId) {
      throw new ForbiddenException(
        'Tài khoản này chưa được admin gắn với CLB nào.',
      );
    }

    return this.prisma.team.update({
      where: { id: user.managedTeamId },
      data: { coachName: dto.coachName?.trim() || null },
      select: {
        id: true,
        name: true,
        shortName: true,
        logoUrl: true,
        coachName: true,
        city: true,
        status: true,
        stadiumId: true,
        createdAt: true,
        updatedAt: true,
        stadium: { select: { id: true, name: true, city: true } },
      },
    });
  }

  async getApplication(userId: string, seasonId: string) {
    const assignment = await this.getAssignment(userId, seasonId);
    if (!assignment) return null;

    return this.prisma.seasonTeam.findUnique({
      where: {
        seasonId_teamId: {
          seasonId,
          teamId: assignment.teamId,
        },
      },
      include: {
        team: {
          include: {
            stadium: true,
          },
        },
        season: true,
      },
    });
  }

  async submitApplication(userId: string, dto: SubmitTeamApplicationDto) {
    this.assertRequiredApplicationFields(dto);

    const assignment = await this.getAssignment(userId, dto.seasonId);
    if (!assignment) {
      throw new ForbiddenException(
        'Tài khoản này chưa được admin gắn với CLB nào.',
      );
    }

    const seasonTeam = await this.prisma.seasonTeam.findUnique({
      where: {
        seasonId_teamId: {
          seasonId: dto.seasonId,
          teamId: assignment.teamId,
        },
      },
    });

    if (!seasonTeam) {
      throw new BadRequestException(
        'CLB chưa đồng ý lời mời hoặc chưa được đăng ký vào mùa giải.',
      );
    }

    const application = await this.prisma.seasonTeam.update({
      where: {
        seasonId_teamId: {
          seasonId: dto.seasonId,
          teamId: assignment.teamId,
        },
      },
      data: {
        ownerName: dto.ownerName.trim(),
        ownerCountry: dto.ownerCountry.trim(),
        ownerAddress: dto.ownerAddress?.trim() || null,
        teamIntroduction: dto.teamIntroduction.trim(),
        primaryKit: dto.primaryKit.trim(),
        backupKit: dto.backupKit.trim(),
        participationFeePaid: dto.participationFeePaid,
        feePaidAt: dto.participationFeePaid ? new Date() : null,
        feeReceiptCode: dto.feeReceiptCode?.trim() || null,
        feeReceiptUrl: dto.feeReceiptUrl?.trim() || null,
        externalCompetitionSchedule: dto.externalCompetitionSchedule.trim(),
        applicationSubmittedAt: new Date(),
        applicationReviewNote: null,
      },
      include: {
        team: {
          include: {
            stadium: true,
          },
        },
        season: true,
      },
    });

    await this.notificationService.notifyAdmins({
      title: 'CLB nộp hồ sơ mùa giải',
      message: `${application.team.name} đã nộp hồ sơ tham dự ${application.season.name}. Vui lòng kiểm tra và xét duyệt.`,
      type: 'SYSTEM',
      entityType: 'season_team',
      entityId: application.id,
    });

    return application;
  }

  async createAssignment(userId: string, seasonId: string, teamId: string) {
    if (!seasonId || !teamId) {
      throw new BadRequestException('seasonId và teamId là bắt buộc.');
    }

    const user = await this.getTeamManagerUser(userId);
    if (!user.managedTeamId) {
      throw new ForbiddenException(
        'Tài khoản này chưa được admin gắn với CLB nào.',
      );
    }

    if (user.managedTeamId !== teamId) {
      throw new ForbiddenException(
        'Tài khoản này chỉ được làm việc với CLB đã được admin gắn.',
      );
    }

    return this.upsertSeasonAssignment(user.id, seasonId, user.managedTeamId);
  }

  private async getTeamManagerUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, managedTeamId: true },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng.');
    }

    if (user.role !== 'TEAM_MANAGER') {
      throw new BadRequestException('Chỉ tài khoản TEAM_MANAGER quản lý CLB.');
    }

    return user;
  }

  private upsertSeasonAssignment(
    userId: string,
    seasonId: string,
    teamId: string,
  ) {
    return this.prisma.teamManagerAssignment.upsert({
      where: { userId_seasonId: { userId, seasonId } },
      update: { teamId },
      create: { userId, seasonId, teamId },
      include: this.assignmentInclude,
    });
  }

  private assertRequiredApplicationFields(dto: SubmitTeamApplicationDto) {
    const requiredFields = [
      ['ownerName', dto.ownerName],
      ['ownerCountry', dto.ownerCountry],
      ['teamIntroduction', dto.teamIntroduction],
      ['primaryKit', dto.primaryKit],
      ['backupKit', dto.backupKit],
      ['externalCompetitionSchedule', dto.externalCompetitionSchedule],
    ] as const;

    const missing = requiredFields
      .filter(([, value]) => !value?.trim())
      .map(([field]) => field);

    if (missing.length > 0) {
      throw new BadRequestException(
        `Hồ sơ còn thiếu thông tin bắt buộc: ${missing.join(', ')}`,
      );
    }
  }
}

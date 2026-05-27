import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitTeamApplicationDto } from './dto/team-manager-assignment.dto';

@Injectable()
export class TeamManagerService {
  constructor(private readonly prisma: PrismaService) {}

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
        city: true,
        status: true,
        stadium: { select: { id: true, name: true, city: true } },
      },
    },
  } satisfies Prisma.TeamManagerAssignmentInclude;

  getAssignment(userId: string, seasonId: string) {
    if (!seasonId) {
      throw new BadRequestException('seasonId là bắt buộc.');
    }

    return this.prisma.teamManagerAssignment.findUnique({
      where: { userId_seasonId: { userId, seasonId } },
      include: this.assignmentInclude,
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
      throw new ForbiddenException('Bạn chưa được gán CLB trong mùa giải này.');
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

    return this.prisma.seasonTeam.update({
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
        externalCompetitionSchedule:
          dto.externalCompetitionSchedule?.trim() || null,
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
  }

  async createAssignment(userId: string, seasonId: string, teamId: string) {
    if (!seasonId || !teamId) {
      throw new BadRequestException('seasonId và teamId là bắt buộc.');
    }

    const existing = await this.getAssignment(userId, seasonId);
    if (existing) {
      if (existing.teamId === teamId) return existing;
      throw new ConflictException(
        'Bạn đã chọn CLB cho mùa giải này và không thể thay đổi.',
      );
    }

    const [user, seasonTeam] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.seasonTeam.findUnique({
        where: { seasonId_teamId: { seasonId, teamId } },
        include: { team: true, season: true },
      }),
    ]);

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng.');
    }

    if (user.role !== 'TEAM_MANAGER') {
      throw new BadRequestException(
        'Chỉ tài khoản TEAM_MANAGER được chọn CLB.',
      );
    }

    if (!seasonTeam) {
      throw new BadRequestException('CLB chưa được đăng ký vào mùa giải này.');
    }

    if (seasonTeam.status !== 'APPROVED') {
      throw new BadRequestException(
        'CLB chưa được duyệt tham gia mùa giải này.',
      );
    }

    return this.prisma.teamManagerAssignment.create({
      data: { userId, seasonId, teamId },
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

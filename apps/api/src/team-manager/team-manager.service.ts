import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

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
}

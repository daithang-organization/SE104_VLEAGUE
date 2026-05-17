import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Season } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSeasonDto, UpdateSeasonDto } from './dto';

// Valid season status transitions
const SEASON_STATUS_TRANSITIONS: Record<string, string[]> = {
  UPCOMING: ['IN_PROGRESS'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED: [],
};

function assertValidSeasonDateRange(
  startDate?: Date | string,
  endDate?: Date | string,
) {
  if (!startDate || !endDate) return;

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return;

  if (start.getTime() > end.getTime()) {
    throw new BadRequestException('Ngày bắt đầu không được sau ngày kết thúc');
  }
}

@Injectable()
export class SeasonService {
  constructor(private prisma: PrismaService) {}

  findAll(): Promise<Season[]> {
    return this.prisma.season.findMany({
      orderBy: { year: 'desc' },
    });
  }

  async findOne(id: string): Promise<Season> {
    const season = await this.prisma.season.findUnique({
      where: { id },
      include: {
        matches: {
          take: 10,
          orderBy: { roundNo: 'asc' },
        },
      },
    });

    if (!season) {
      throw new NotFoundException(`Season with ID ${id} not found`);
    }

    return season;
  }

  findCurrent(): Promise<Season | null> {
    return this.prisma.season.findFirst({
      where: { status: 'IN_PROGRESS' },
    });
  }

  async create(dto: CreateSeasonDto): Promise<Season> {
    assertValidSeasonDateRange(dto.startDate, dto.endDate);

    try {
      return await this.prisma.season.create({
        data: {
          name: dto.name,
          year: dto.year,
          status: (dto.status ?? 'UPCOMING') as never,
          startDate: dto.startDate,
          endDate: dto.endDate,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            `Season with name "${dto.name}" already exists`,
          );
        }
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateSeasonDto): Promise<Season> {
    // Check exists
    const existing = await this.findOne(id);
    assertValidSeasonDateRange(
      dto.startDate ?? existing.startDate ?? undefined,
      dto.endDate ?? existing.endDate ?? undefined,
    );

    try {
      return await this.prisma.season.update({
        where: { id },
        data: dto as never,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            `Season with name "${dto.name}" already exists`,
          );
        }
      }
      throw error;
    }
  }

  async delete(id: string): Promise<{ success: boolean }> {
    await this.findOne(id);

    await this.prisma.season.delete({
      where: { id },
    });

    return { success: true };
  }

  /**
   * Update season status with state machine enforcement.
   * Only one season can be IN_PROGRESS at a time.
   */
  async updateStatus(id: string, newStatus: string): Promise<Season> {
    const season = await this.prisma.season.findUnique({ where: { id } });

    if (!season) {
      throw new NotFoundException(`Season with ID ${id} not found`);
    }

    const currentStatus = season.status;
    const allowedTransitions = SEASON_STATUS_TRANSITIONS[currentStatus] ?? [];

    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Không thể chuyển trạng thái từ ${currentStatus} sang ${newStatus}. ` +
          `Trạng thái hợp lệ: ${allowedTransitions.length ? allowedTransitions.join(', ') : 'không có'}`,
      );
    }

    // Ensure only one season can be IN_PROGRESS at a time
    if (newStatus === 'IN_PROGRESS') {
      const activeSeason = await this.prisma.season.findFirst({
        where: { status: 'IN_PROGRESS' },
      });

      if (activeSeason) {
        throw new BadRequestException(
          `Mùa giải "${activeSeason.name}" đang diễn ra. Chỉ được phép một mùa giải IN_PROGRESS.`,
        );
      }
    }

    return this.prisma.season.update({
      where: { id },
      data: { status: newStatus as never },
    });
  }

  // ───────────── Season Teams ─────────────

  async getSeasonTeams(seasonId: string) {
    await this.findOne(seasonId); // ensure season exists
    return this.prisma.seasonTeam.findMany({
      where: { seasonId },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            shortName: true,
            logoUrl: true,
            city: true,
            status: true,
          },
        },
      },
      orderBy: { registeredAt: 'asc' },
    });
  }

  async registerTeam(seasonId: string, teamId: string) {
    await this.findOne(seasonId); // ensure season exists
    try {
      return await this.prisma.seasonTeam.create({
        data: {
          seasonId,
          teamId,
          status: 'REGISTERED' as never,
        },
        include: {
          team: {
            select: { id: true, name: true, shortName: true, logoUrl: true },
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Đội đã được đăng ký vào mùa giải này');
        }
      }
      throw error;
    }
  }

  async updateTeamStatus(seasonId: string, teamId: string, status: string) {
    const record = await this.prisma.seasonTeam.findUnique({
      where: { seasonId_teamId: { seasonId, teamId } },
    });

    if (!record) {
      throw new NotFoundException('Không tìm thấy đội trong mùa giải này');
    }

    const validStatuses = ['REGISTERED', 'APPROVED', 'REJECTED', 'WITHDRAWN'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(
        `Trạng thái không hợp lệ. Chấp nhận: ${validStatuses.join(', ')}`,
      );
    }

    return this.prisma.seasonTeam.update({
      where: { seasonId_teamId: { seasonId, teamId } },
      data: {
        status: status as never,
        approvedAt: status === 'APPROVED' ? new Date() : undefined,
      },
      include: {
        team: {
          select: { id: true, name: true, shortName: true, logoUrl: true },
        },
      },
    });
  }

  async removeTeam(seasonId: string, teamId: string) {
    const record = await this.prisma.seasonTeam.findUnique({
      where: { seasonId_teamId: { seasonId, teamId } },
    });

    if (!record) {
      throw new NotFoundException('Không tìm thấy đội trong mùa giải này');
    }

    await this.prisma.seasonTeam.delete({
      where: { seasonId_teamId: { seasonId, teamId } },
    });

    return { success: true };
  }
}

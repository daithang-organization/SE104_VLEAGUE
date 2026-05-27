import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Season } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RegulationHelper } from '../regulation/regulation.helper';
import { CreateSeasonDto, UpdateSeasonDto } from './dto';

// Valid season status transitions
const SEASON_STATUS_TRANSITIONS: Record<string, string[]> = {
  UPCOMING: ['IN_PROGRESS'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED: [],
};

const DEFAULT_MIN_ROSTER = 16;
const DEFAULT_MAX_ROSTER = 22;
const DEFAULT_MAX_FOREIGN_PLAYERS = 5;
const DEFAULT_MIN_STADIUM_CAPACITY = 10000;
const DEFAULT_MIN_STADIUM_FIFA_STARS = 2;

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
  constructor(
    private prisma: PrismaService,
    private regulationHelper: RegulationHelper,
  ) {}

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

    if (status === 'APPROVED') {
      await this.assertTeamEligibleForApproval(seasonId, teamId);
    }

    return this.prisma.seasonTeam.update({
      where: { seasonId_teamId: { seasonId, teamId } },
      data: {
        status: status as never,
        approvedAt: status === 'APPROVED' ? new Date() : null,
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

  private async assertTeamEligibleForApproval(
    seasonId: string,
    teamId: string,
  ) {
    const [
      minRoster,
      maxRoster,
      maxForeignPlayers,
      minStadiumCapacity,
      minStadiumFifaStars,
      activePlayers,
      foreignPlayers,
      team,
    ] = await Promise.all([
      this.regulationHelper.getNumericValue(
        seasonId,
        'MIN_ROSTER',
        DEFAULT_MIN_ROSTER,
      ),
      this.regulationHelper.getNumericValue(
        seasonId,
        'MAX_ROSTER',
        DEFAULT_MAX_ROSTER,
      ),
      this.regulationHelper.getNumericValue(
        seasonId,
        'MAX_FOREIGN_PLAYERS',
        DEFAULT_MAX_FOREIGN_PLAYERS,
      ),
      this.regulationHelper.getNumericValue(
        seasonId,
        'MIN_STADIUM_CAPACITY',
        DEFAULT_MIN_STADIUM_CAPACITY,
      ),
      this.regulationHelper.getNumericValue(
        seasonId,
        'MIN_STADIUM_FIFA_STARS',
        DEFAULT_MIN_STADIUM_FIFA_STARS,
      ),
      this.prisma.teamPlayer.count({
        where: { teamId, leftAt: null },
      }),
      this.prisma.teamPlayer.count({
        where: {
          teamId,
          leftAt: null,
          player: { playerType: 'FOREIGN' },
        },
      }),
      this.prisma.team.findUnique({
        where: { id: teamId },
        include: { stadium: true },
      }),
    ]);

    if (!team) {
      throw new NotFoundException('Không tìm thấy đội bóng');
    }

    if (activePlayers < minRoster) {
      throw new BadRequestException(
        `Đội phải có tối thiểu ${minRoster} cầu thủ để được duyệt`,
      );
    }

    if (activePlayers > maxRoster) {
      throw new BadRequestException(
        `Đội chỉ được đăng ký tối đa ${maxRoster} cầu thủ`,
      );
    }

    if (foreignPlayers > maxForeignPlayers) {
      throw new BadRequestException(
        `Đội chỉ được đăng ký tối đa ${maxForeignPlayers} cầu thủ ngoại`,
      );
    }

    const stadium = team.stadium;
    if (!stadium) {
      throw new BadRequestException('Đội phải có sân nhà để được duyệt');
    }

    if ((stadium.capacity ?? 0) < minStadiumCapacity) {
      throw new BadRequestException(
        `Sân nhà phải có sức chứa tối thiểu ${minStadiumCapacity.toLocaleString('vi-VN')} chỗ`,
      );
    }

    if (!this.isVietnam(stadium.country)) {
      throw new BadRequestException('Sân nhà phải nằm tại Việt Nam');
    }

    if ((stadium.fifaStars ?? 0) < minStadiumFifaStars) {
      throw new BadRequestException(
        `Sân nhà phải đạt tiêu chuẩn ít nhất ${minStadiumFifaStars} sao FIFA`,
      );
    }
  }

  private isVietnam(country?: string | null) {
    if (!country) return false;

    const normalized = country
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();

    return normalized === 'viet nam' || normalized === 'vietnam';
  }
}

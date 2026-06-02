import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Season } from '@prisma/client';
import {
  isForeignPlayer,
  isVietnameseNationality,
} from '../common/utils/foreign-player.util';
import { PrismaService } from '../prisma/prisma.service';
import { RegulationHelper } from '../regulation/regulation.helper';
import { DEFAULT_REGULATIONS } from '../regulation/regulation.service';
import { CreateSeasonDto, UpdateSeasonDto } from './dto';

// Valid season status transitions
const SEASON_STATUS_TRANSITIONS: Record<string, string[]> = {
  UPCOMING: ['IN_PROGRESS'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED: [],
};

const SEASON_STATUS_LABELS: Record<string, string> = {
  UPCOMING: 'Sắp diễn ra',
  IN_PROGRESS: 'Đang diễn ra',
  COMPLETED: 'Đã kết thúc',
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

  const start = toValidSeasonDate(startDate);
  const end = toValidSeasonDate(endDate);

  if (!start || !end) return;

  if (start.getTime() > end.getTime()) {
    throw new BadRequestException('Ngày bắt đầu không được sau ngày kết thúc');
  }
}

function toValidSeasonDate(value?: Date | string | null) {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isPrismaUniqueConstraintError(error: unknown) {
  return (
    (error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002') ||
    (typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002')
  );
}

function getSeasonStatusLabel(status: string) {
  return SEASON_STATUS_LABELS[status] ?? status;
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
    return this.findBestCurrentSeason();
  }

  async create(dto: CreateSeasonDto): Promise<Season> {
    assertValidSeasonDateRange(dto.startDate, dto.endDate);
    const name = dto.name.trim();

    await this.assertSeasonDoesNotConflict({
      name,
      year: dto.year,
      startDate: dto.startDate,
      endDate: dto.endDate,
    });

    try {
      return await this.prisma.$transaction(async (tx) => {
        const season = await tx.season.create({
          data: {
            name: dto.name,
            year: dto.year,
            status: (dto.status ?? 'UPCOMING') as never,
            startDate: dto.startDate,
            endDate: dto.endDate,
          },
        });

        await this.copyCurrentRegulationsToSeason(tx, season.id);

        return season;
      });
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        throw new ConflictException(`Mùa giải "${name}" đã tồn tại`);
      }
      throw error;
    }
  }

  private async copyCurrentRegulationsToSeason(
    tx: Prisma.TransactionClient,
    seasonId: string,
  ) {
    const sourceSeason =
      (await tx.season.findFirst({
        where: {
          id: { not: seasonId },
          status: 'IN_PROGRESS',
          regulations: { some: {} },
        },
        orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
      })) ??
      (await tx.season.findFirst({
        where: {
          id: { not: seasonId },
          regulations: { some: {} },
        },
        orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
      }));

    const sourceRegulations = sourceSeason
      ? await tx.regulation.findMany({
          where: { seasonId: sourceSeason.id },
          select: { key: true, value: true, valueType: true },
        })
      : [];
    const regulations =
      sourceRegulations.length > 0 ? sourceRegulations : DEFAULT_REGULATIONS;

    await tx.regulation.createMany({
      data: regulations.map((regulation) => ({
        seasonId,
        key: regulation.key,
        value: regulation.value,
        valueType: regulation.valueType,
      })),
      skipDuplicates: true,
    });
  }

  async update(id: string, dto: UpdateSeasonDto): Promise<Season> {
    // Check exists
    const existing = await this.findOne(id);
    assertValidSeasonDateRange(
      dto.startDate ?? existing.startDate ?? undefined,
      dto.endDate ?? existing.endDate ?? undefined,
    );
    const nextName = dto.name?.trim();

    await this.assertSeasonDoesNotConflict(
      {
        name: nextName,
        year: dto.year,
        startDate: dto.startDate ?? existing.startDate,
        endDate: dto.endDate ?? existing.endDate,
      },
      id,
    );

    try {
      return await this.prisma.season.update({
        where: { id },
        data: {
          ...dto,
          ...(nextName !== undefined ? { name: nextName } : {}),
        } as never,
      });
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        throw new ConflictException(
          `Mùa giải "${nextName ?? existing.name}" đã tồn tại`,
        );
      }
      throw error;
    }
  }

  private async assertSeasonDoesNotConflict(
    input: {
      name?: string;
      year?: number;
      startDate?: Date | string | null;
      endDate?: Date | string | null;
    },
    excludedSeasonId?: string,
  ) {
    const excludeCurrentSeason = excludedSeasonId
      ? { id: { not: excludedSeasonId } }
      : {};

    if (input.name) {
      const duplicatedName = await this.prisma.season.findFirst({
        where: {
          ...excludeCurrentSeason,
          name: { equals: input.name, mode: 'insensitive' },
        },
      });

      if (duplicatedName) {
        throw new ConflictException(`Mùa giải "${input.name}" đã tồn tại`);
      }
    }

    if (input.year !== undefined) {
      const duplicatedYear = await this.prisma.season.findFirst({
        where: {
          ...excludeCurrentSeason,
          year: input.year,
        },
      });

      if (duplicatedYear) {
        throw new ConflictException(
          `Mùa giải ${input.year}-${input.year + 1} đã tồn tại`,
        );
      }
    }

    const start = toValidSeasonDate(input.startDate);
    const end = toValidSeasonDate(input.endDate);

    if (!start || !end) return;

    const overlappingSeason = await this.prisma.season.findFirst({
      where: {
        ...excludeCurrentSeason,
        startDate: { lte: end },
        endDate: { gte: start },
      },
    });

    if (overlappingSeason) {
      throw new ConflictException(
        `Khoảng thời gian mùa giải bị trùng với "${overlappingSeason.name}"`,
      );
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
        `Không thể chuyển trạng thái từ ${getSeasonStatusLabel(currentStatus)} sang ${getSeasonStatusLabel(newStatus)}. ` +
          `Trạng thái hợp lệ: ${allowedTransitions.length ? allowedTransitions.map(getSeasonStatusLabel).join(', ') : 'không có'}`,
      );
    }

    // Ensure only one season can be IN_PROGRESS at a time
    if (newStatus === 'IN_PROGRESS') {
      const activeSeason = await this.prisma.season.findFirst({
        where: { id: { not: id }, status: 'IN_PROGRESS' },
      });

      if (activeSeason) {
        throw new BadRequestException(
          `Không thể chuyển "${season.name}" sang trạng thái Đang diễn ra vì mùa giải "${activeSeason.name}" đang diễn ra. Vui lòng kết thúc mùa giải đó trước.`,
        );
      }

      const unfinishedPreviousSeason = await this.prisma.season.findFirst({
        where: {
          id: { not: id },
          year: { lt: season.year },
          status: { not: 'COMPLETED' },
        },
        orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
      });

      if (unfinishedPreviousSeason) {
        throw new BadRequestException(
          `Không thể chuyển "${season.name}" sang trạng thái Đang diễn ra vì mùa giải trước đó "${unfinishedPreviousSeason.name}" đang ở trạng thái ${getSeasonStatusLabel(unfinishedPreviousSeason.status)}, chưa phải Đã kết thúc. Vui lòng kết thúc các mùa giải trước trước khi bắt đầu mùa giải mới.`,
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
      this.assertApplicationComplete(record);
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
      activeRosterPlayers,
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
      this.prisma.teamPlayer.findMany({
        where: {
          teamId,
          leftAt: null,
        },
        select: {
          player: {
            select: {
              playerType: true,
              nationality: true,
            },
          },
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

    const foreignPlayers = activeRosterPlayers.filter((row) =>
      isForeignPlayer(row.player),
    ).length;

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

    return isVietnameseNationality(normalized);
  }

  private assertApplicationComplete(record: {
    applicationSubmittedAt?: Date | null;
    ownerName?: string | null;
    ownerCountry?: string | null;
    teamIntroduction?: string | null;
    primaryKit?: string | null;
    backupKit?: string | null;
    participationFeePaid?: boolean | null;
    feeReceiptCode?: string | null;
    feeReceiptUrl?: string | null;
    externalCompetitionSchedule?: string | null;
  }) {
    if (!record.applicationSubmittedAt) {
      throw new BadRequestException('CLB chưa nộp hồ sơ tham dự mùa giải.');
    }

    const requiredFields = [
      ['cơ quan chủ quản', record.ownerName],
      ['quốc gia cơ quan chủ quản', record.ownerCountry],
      ['giới thiệu đội', record.teamIntroduction],
      ['áo thi đấu chính thức', record.primaryKit],
      ['áo thi đấu dự bị', record.backupKit],
      ['lịch giải khác đã/đang tham gia', record.externalCompetitionSchedule],
    ] as const;
    const missing = requiredFields
      .filter(([, value]) => !value?.trim())
      .map(([label]) => label);

    if (missing.length > 0) {
      throw new BadRequestException(
        `Hồ sơ tham dự còn thiếu: ${missing.join(', ')}.`,
      );
    }

    if (!this.isVietnam(record.ownerCountry)) {
      throw new BadRequestException(
        'Cơ quan chủ quản của CLB phải nằm tại Việt Nam.',
      );
    }

    if (!record.participationFeePaid) {
      throw new BadRequestException(
        'CLB chưa xác nhận nộp lệ phí tham dự 1 tỷ đồng.',
      );
    }

    if (!record.feeReceiptCode?.trim() && !record.feeReceiptUrl?.trim()) {
      throw new BadRequestException(
        'CLB chưa cung cấp chứng từ nộp lệ phí tham dự.',
      );
    }
  }

  private async findBestCurrentSeason(): Promise<Season | null> {
    const seasonDelegate = this.prisma.season as typeof this.prisma.season & {
      findMany?: typeof this.prisma.season.findMany;
      findFirst?: typeof this.prisma.season.findFirst;
    };
    if (!seasonDelegate.findMany) {
      return (
        seasonDelegate.findFirst?.({
          where: { status: 'IN_PROGRESS' },
        }) ?? null
      );
    }

    const seasons = await seasonDelegate.findMany({
      where: { status: 'IN_PROGRESS' },
      include: {
        _count: {
          select: {
            matches: true,
            seasonTeams: true,
          },
        },
      },
      orderBy: [{ year: 'desc' }, { startDate: 'desc' }],
    });

    if (!Array.isArray(seasons)) {
      return (
        seasonDelegate.findFirst?.({
          where: { status: 'IN_PROGRESS' },
        }) ?? null
      );
    }

    return (
      seasons.sort((a, b) => {
        const matchDelta = b._count.matches - a._count.matches;
        if (matchDelta !== 0) return matchDelta;
        const teamDelta = b._count.seasonTeams - a._count.seasonTeams;
        if (teamDelta !== 0) return teamDelta;
        const brandedDelta =
          Number(b.name.startsWith('V.League')) -
          Number(a.name.startsWith('V.League'));
        if (brandedDelta !== 0) return brandedDelta;
        return b.year - a.year;
      })[0] ?? null
    );
  }
}

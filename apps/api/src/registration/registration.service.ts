import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  TeamStatus,
  UserRole,
  type Player,
  type Team,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RegulationHelper } from '../regulation/regulation.helper';
import {
  TeamManagerScopeService,
  type TeamScopeActor,
} from '../team-manager/team-manager-scope.service';
import type { CreatePlayerDto, UpdatePlayerDto } from './dto/player.dto';
import type { CreateTeamDto, UpdateTeamDto } from './dto/team.dto';

/** Fallback age limits when no season regulation is available */
const DEFAULT_MIN_AGE = 16;
const DEFAULT_MAX_AGE = 40;
const DEFAULT_MAX_ROSTER = 22;

@Injectable()
export class RegistrationService {
  constructor(
    private prisma: PrismaService,
    private regulationHelper: RegulationHelper,
    private readonly teamManagerScope: TeamManagerScopeService,
  ) {}

  // ───────────────── TEAMS ─────────────────

  async listTeams(pagination?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 100;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (pagination?.search) {
      where.OR = [
        { name: { contains: pagination.search, mode: 'insensitive' } },
        { shortName: { contains: pagination.search, mode: 'insensitive' } },
        { city: { contains: pagination.search, mode: 'insensitive' } },
        { coachName: { contains: pagination.search, mode: 'insensitive' } },
      ];
    }
    if (pagination?.status) {
      where.status = pagination.status;
    }

    const [data, total] = await Promise.all([
      this.prisma.team.findMany({
        where,
        orderBy: { name: 'asc' },
        include: {
          stadium: { select: { id: true, name: true } },
          managedUsers: {
            where: { role: UserRole.TEAM_MANAGER },
            select: { id: true, email: true, name: true },
            take: 1,
          },
        },
        skip,
        take: limit,
      }),
      this.prisma.team.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOneTeam(id: string, seasonId?: string) {
    const matchWhere = seasonId ? { seasonId } : undefined;

    const team = await this.prisma.team.findUnique({
      where: { id },
      include: {
        stadium: { select: { id: true, name: true, city: true } },
        managedUsers: {
          where: { role: UserRole.TEAM_MANAGER },
          select: { id: true, email: true, name: true },
          take: 1,
        },
        roster: {
          where: { leftAt: null },
          include: {
            player: {
              select: {
                id: true,
                fullName: true,
                position: true,
                nationality: true,
                playerType: true,
                dob: true,
              },
            },
          },
          orderBy: { jerseyNumber: 'asc' },
        },
        homeMatches: {
          ...(matchWhere ? { where: matchWhere } : {}),
          include: {
            awayTeam: {
              select: {
                id: true,
                name: true,
                shortName: true,
                logoUrl: true,
                coachName: true,
              },
            },
            stadium: { select: { name: true } },
          },
          orderBy: [{ roundNo: 'asc' }, { kickoffAt: 'asc' }],
        },
        awayMatches: {
          ...(matchWhere ? { where: matchWhere } : {}),
          include: {
            homeTeam: {
              select: {
                id: true,
                name: true,
                shortName: true,
                logoUrl: true,
                coachName: true,
              },
            },
            stadium: { select: { name: true } },
          },
          orderBy: [{ roundNo: 'asc' }, { kickoffAt: 'asc' }],
        },
        standings: {
          include: {
            season: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException(`Không tìm thấy đội bóng với ID ${id}`);
    }

    return team;
  }

  async createTeam(dto: CreateTeamDto): Promise<Team> {
    const data = {
      name: dto.name,
      shortName: dto.shortName,
      city: dto.city,
      stadiumId: dto.stadiumId,
      logoUrl: dto.logoUrl,
      coachName: dto.coachName,
      status: (dto.status ?? 'ACTIVE') as never,
    };

    try {
      const managerId = dto.managerId;
      if (!managerId) {
        return await this.prisma.team.create({ data });
      }

      return await this.prisma.$transaction(async (tx) => {
        await this.assertAssignableManager(tx, managerId);
        const team = await tx.team.create({ data });
        await this.assignManagerToTeam(tx, managerId, team.id);
        return team;
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            `Đội bóng với tên "${dto.name}" đã tồn tại`,
          );
        }
      }
      throw error;
    }
  }

  async updateTeam(id: string, dto: UpdateTeamDto): Promise<Team> {
    await this.findOneTeam(id);
    const { managerId, ...teamDto } = dto;
    const shouldUpdateManager = Object.prototype.hasOwnProperty.call(
      dto,
      'managerId',
    );

    try {
      if (!shouldUpdateManager) {
        return await this.prisma.team.update({
          where: { id },
          data: teamDto as never,
        });
      }

      return await this.prisma.$transaction(async (tx) => {
        const team = await tx.team.update({
          where: { id },
          data: teamDto as never,
        });

        if (managerId) {
          await this.assertAssignableManager(tx, managerId, id);
          await this.assignManagerToTeam(tx, managerId, id);
        } else {
          await tx.user.updateMany({
            where: { managedTeamId: id },
            data: { managedTeamId: null },
          });
        }

        return team;
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            `Đội bóng với tên "${dto.name}" đã tồn tại`,
          );
        }
      }
      throw error;
    }
  }

  async deleteTeam(id: string): Promise<{ success: boolean }> {
    await this.findOneTeam(id);

    await this.prisma.team.delete({ where: { id } });
    return { success: true };
  }

  private async assertAssignableManager(
    tx: Prisma.TransactionClient,
    managerId: string,
    currentTeamId?: string,
  ) {
    const manager = await tx.user.findUnique({
      where: { id: managerId },
      select: { id: true, role: true, managedTeamId: true },
    });

    if (!manager) {
      throw new NotFoundException('Không tìm thấy Manager được chọn.');
    }

    if (manager.role !== UserRole.TEAM_MANAGER) {
      throw new BadRequestException(
        'Chỉ tài khoản TEAM_MANAGER được gắn quản lý CLB.',
      );
    }

    if (manager.managedTeamId && manager.managedTeamId !== currentTeamId) {
      throw new BadRequestException('Manager này đã được gắn với CLB khác.');
    }
  }

  private async assignManagerToTeam(
    tx: Prisma.TransactionClient,
    managerId: string,
    teamId: string,
  ) {
    await tx.user.updateMany({
      where: { managedTeamId: teamId, id: { not: managerId } },
      data: { managedTeamId: null },
    });

    await tx.user.update({
      where: { id: managerId },
      data: { managedTeamId: teamId },
    });
  }

  // ───────────────── PLAYERS ─────────────────

  async listPlayers(pagination?: {
    page?: number;
    limit?: number;
    search?: string;
    position?: string;
    nationality?: string;
    teamId?: string;
    playerType?: string;
    minAge?: number;
    maxAge?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;
    const sortableFields = new Set(['fullName', 'dob', 'heightCm', 'weightKg']);
    const sortBy =
      pagination?.sortBy && sortableFields.has(pagination.sortBy)
        ? pagination.sortBy
        : 'fullName';
    const sortOrder = pagination?.sortOrder === 'desc' ? 'desc' : 'asc';
    const nullableNumericSortFields = new Set(['heightCm', 'weightKg']);
    const primaryOrder = nullableNumericSortFields.has(sortBy)
      ? { [sortBy]: { sort: sortOrder, nulls: 'last' } }
      : { [sortBy]: sortOrder };
    const orderBy: Prisma.PlayerOrderByWithRelationInput[] =
      sortBy === 'fullName'
        ? [{ fullName: sortOrder }]
        : [primaryOrder, { fullName: 'asc' }];

    // Build where clause
    const where: Record<string, unknown> = {};
    if (pagination?.search) {
      const safeSearchForLog = pagination.search.replace(/[\r\n]+/g, ' ');
      console.log(`🔍 Searching for player: "${safeSearchForLog}"`);
      where.fullName = { contains: pagination.search, mode: 'insensitive' };
    }
    if (pagination?.position) {
      where.position = pagination.position;
    }
    if (pagination?.nationality) {
      where.nationality = {
        contains: pagination.nationality,
        mode: 'insensitive',
      };
    }
    if (pagination?.teamId) {
      where.roster = {
        some: { teamId: pagination.teamId, leftAt: null },
      };
    }
    if (pagination?.playerType) {
      where.playerType = pagination.playerType;
    }
    // Age range filter (calculate DOB range from age)
    if (pagination?.minAge || pagination?.maxAge) {
      const dobFilter: Record<string, Date> = {};
      const today = new Date();
      if (pagination?.maxAge) {
        // Player must be at most maxAge → born after this date
        const minDob = new Date(
          today.getFullYear() - pagination.maxAge - 1,
          today.getMonth(),
          today.getDate(),
        );
        dobFilter.gte = minDob;
      }
      if (pagination?.minAge) {
        // Player must be at least minAge → born before this date
        const maxDob = new Date(
          today.getFullYear() - pagination.minAge,
          today.getMonth(),
          today.getDate(),
        );
        dobFilter.lte = maxDob;
      }
      where.dob = dobFilter;
    }

    const [data, total] = await Promise.all([
      this.prisma.player.findMany({
        where,
        orderBy,
        include: {
          roster: {
            where: { leftAt: null },
            include: {
              team: {
                select: {
                  id: true,
                  name: true,
                  shortName: true,
                  logoUrl: true,
                },
              },
            },
            take: 1,
          },
        },
        skip,
        take: limit,
      }),
      this.prisma.player.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOnePlayer(id: string) {
    const player = await this.prisma.player.findUnique({
      where: { id },
      include: {
        roster: {
          include: {
            team: { select: { id: true, name: true, shortName: true } },
          },
          orderBy: { joinedAt: 'desc' },
        },
        matchEvents: {
          include: {
            match: {
              select: {
                id: true,
                roundNo: true,
                kickoffAt: true,
                season: { select: { id: true, name: true } },
              },
            },
            team: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!player) {
      throw new NotFoundException(`Không tìm thấy cầu thủ với ID ${id}`);
    }

    return player;
  }

  async createPlayer(
    dto: CreatePlayerDto,
    actor?: TeamScopeActor,
  ): Promise<Player> {
    this.assertRequiredPlayerProfile(dto);

    const writableTeamId = actor
      ? await this.teamManagerScope.resolveWritableTeamId(actor, dto.teamId)
      : dto.teamId;
    if (writableTeamId) {
      await this.assertActiveTeamById(writableTeamId);
    }

    // Query age limits from regulations (or use defaults)
    const minAge = await this.regulationHelper.getNumericValue(
      dto.seasonId,
      'MIN_AGE',
      DEFAULT_MIN_AGE,
    );
    const maxAge = await this.regulationHelper.getNumericValue(
      dto.seasonId,
      'MAX_AGE',
      DEFAULT_MAX_AGE,
    );

    // Validate player age
    const dob = new Date(dto.dob);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    if (age < minAge) {
      throw new BadRequestException(
        `Cầu thủ phải ít nhất ${minAge} tuổi (hiện tại: ${age} tuổi)`,
      );
    }

    if (age > maxAge) {
      throw new BadRequestException(
        `Cầu thủ không được quá ${maxAge} tuổi (hiện tại: ${age} tuổi)`,
      );
    }

    if (writableTeamId) {
      await this.validateTeamRosterLimitsForPlayer(
        writableTeamId,
        dto.seasonId,
      );
    }

    const player = await this.prisma.player.create({
      data: {
        fullName: dto.fullName,
        dob,
        nationality: dto.nationality,
        position: dto.position as any,
        playerType: (dto.playerType ?? 'DOMESTIC') as any,
        birthPlace: dto.birthPlace.trim(),
        heightCm: dto.heightCm,
        weightKg: dto.weightKg,
        careerSummary: dto.careerSummary.trim(),
      },
    });

    // Assign to team if teamId provided
    if (writableTeamId) {
      try {
        await this.prisma.teamPlayer.create({
          data: {
            teamId: writableTeamId,
            playerId: player.id,
          },
        });
      } catch (error) {
        // If team assignment fails, we still created the player,
        // but we should probably warn or throw to maintain atomicity
        console.error('Failed to assign player to team:', error);
        throw new BadRequestException(
          'Không thể gán cầu thủ vào đội bóng. Vui lòng kiểm tra lại ID đội.',
        );
      }
    }

    return player;
  }

  async updatePlayer(
    id: string,
    dto: UpdatePlayerDto,
    actor?: TeamScopeActor,
  ): Promise<Player> {
    this.assertProvidedPlayerProfile(dto);

    const currentPlayer = await this.findOnePlayer(id);
    await this.assertPlayerCurrentTeamActive(id);
    if (actor) {
      await this.assertCanManagePlayer(actor, id);
    }

    const writableTeamId =
      dto.teamId !== undefined && actor
        ? await this.teamManagerScope.resolveWritableTeamId(actor, dto.teamId)
        : dto.teamId;
    if (writableTeamId) {
      await this.assertActiveTeamById(writableTeamId);
    }

    const data: Record<string, unknown> = {};
    if (dto.fullName !== undefined) data.fullName = dto.fullName;
    if (dto.dob !== undefined) data.dob = new Date(dto.dob);
    if (dto.nationality !== undefined) data.nationality = dto.nationality;
    if (dto.position !== undefined) data.position = dto.position;
    if (dto.playerType !== undefined) data.playerType = dto.playerType;
    if (dto.birthPlace !== undefined) data.birthPlace = dto.birthPlace.trim();
    if (dto.heightCm !== undefined) data.heightCm = dto.heightCm;
    if (dto.weightKg !== undefined) data.weightKg = dto.weightKg;
    if (dto.careerSummary !== undefined) {
      data.careerSummary = dto.careerSummary.trim();
    }

    const currentActiveRoster = Array.isArray((currentPlayer as any).roster)
      ? (currentPlayer as any).roster.find(
          (row: { leftAt?: Date | null }) => row.leftAt === null,
        )
      : null;
    const nextTeamId =
      dto.teamId !== undefined ? writableTeamId : currentActiveRoster?.teamId;
    const shouldValidateRosterLimits =
      dto.teamId !== undefined ||
      dto.playerType !== undefined ||
      dto.nationality !== undefined;

    if (shouldValidateRosterLimits && nextTeamId) {
      await this.validateTeamRosterLimitsForPlayer(nextTeamId, undefined, {
        excludePlayerId: id,
        checkRosterSize:
          dto.teamId !== undefined &&
          nextTeamId !== currentActiveRoster?.teamId,
      });
    }

    const player = await this.prisma.player.update({
      where: { id },
      data: data as never,
    });

    // Handle team assignment change
    if (dto.teamId !== undefined) {
      // Close current team assignment
      await this.prisma.teamPlayer.updateMany({
        where: { playerId: id, leftAt: null },
        data: { leftAt: new Date() },
      });

      // Create new assignment if teamId is not null
      if (writableTeamId) {
        await this.prisma.teamPlayer.create({
          data: {
            teamId: writableTeamId,
            playerId: id,
          },
        });
      }
    }

    return player;
  }

  async deletePlayer(
    id: string,
    actor?: TeamScopeActor,
  ): Promise<{ success: boolean }> {
    await this.findOnePlayer(id);
    await this.assertPlayerCurrentTeamActive(id);
    if (actor) {
      await this.assertCanManagePlayer(actor, id);
    }

    await this.prisma.player.delete({ where: { id } });
    return { success: true };
  }

  private async assertCanManagePlayer(actor: TeamScopeActor, playerId: string) {
    const managedTeamId =
      await this.teamManagerScope.resolveManagedTeamId(actor);
    if (!managedTeamId) return;

    const rosterRow = await this.prisma.teamPlayer.findFirst({
      where: {
        playerId,
        teamId: managedTeamId,
        leftAt: null,
      },
      select: { id: true },
    });

    if (!rosterRow) {
      throw new ForbiddenException(
        'Tài khoản này chỉ được thao tác với cầu thủ thuộc CLB đã được admin gắn.',
      );
    }
  }

  private async validateTeamRosterLimitsForPlayer(
    teamId: string,
    seasonId?: string,
    options?: { excludePlayerId?: string; checkRosterSize?: boolean },
  ) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException(`Không tìm thấy đội bóng với ID ${teamId}`);
    }

    const activeRosterWhere: Prisma.TeamPlayerWhereInput = {
      teamId,
      leftAt: null,
    };
    if (options?.excludePlayerId) {
      activeRosterWhere.playerId = { not: options.excludePlayerId };
    }

    if (options?.checkRosterSize !== false) {
      const maxRoster = await this.regulationHelper.getNumericValue(
        seasonId,
        'MAX_ROSTER',
        DEFAULT_MAX_ROSTER,
      );
      const activeCount = await this.prisma.teamPlayer.count({
        where: activeRosterWhere,
      });

      if (activeCount >= maxRoster) {
        throw new BadRequestException(
          `Đội đã đạt giới hạn ${maxRoster} cầu thủ trong đội hình`,
        );
      }
    }
  }

  private async assertActiveTeamById(teamId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      select: { status: true },
    });

    if (!team) {
      throw new NotFoundException(`Khong tim thay doi bong voi ID ${teamId}`);
    }
    if (team.status === TeamStatus.INACTIVE) {
      throw new ForbiddenException(
        'CLB dang khong hoat dong, khong the thao tac cau thu.',
      );
    }
  }

  private async assertPlayerCurrentTeamActive(playerId: string) {
    const rosterRow = await this.prisma.teamPlayer.findFirst({
      where: { playerId, leftAt: null },
      select: { team: { select: { status: true } } },
    });

    if (rosterRow?.team.status === TeamStatus.INACTIVE) {
      throw new ForbiddenException(
        'CLB dang khong hoat dong, khong the thao tac cau thu.',
      );
    }
  }

  private assertRequiredPlayerProfile(dto: CreatePlayerDto) {
    const requiredTextFields = [
      ['birthPlace', dto.birthPlace],
      ['careerSummary', dto.careerSummary],
    ] as const;
    const missing: string[] = requiredTextFields
      .filter(([, value]) => !value?.trim())
      .map(([field]) => field);

    if (dto.heightCm === undefined || dto.heightCm === null) {
      missing.push('heightCm');
    }
    if (dto.weightKg === undefined || dto.weightKg === null) {
      missing.push('weightKg');
    }

    if (missing.length > 0) {
      throw new BadRequestException(
        `Hồ sơ cầu thủ còn thiếu thông tin bắt buộc: ${missing.join(', ')}`,
      );
    }
  }

  private assertProvidedPlayerProfile(dto: UpdatePlayerDto) {
    const data = dto as UpdatePlayerDto & {
      heightCm?: number | null;
      weightKg?: number | null;
    };
    const invalid: string[] = [];

    if (data.birthPlace !== undefined && !data.birthPlace?.trim()) {
      invalid.push('birthPlace');
    }
    if (data.heightCm === null) {
      invalid.push('heightCm');
    }
    if (data.weightKg === null) {
      invalid.push('weightKg');
    }
    if (data.careerSummary !== undefined && !data.careerSummary?.trim()) {
      invalid.push('careerSummary');
    }

    if (invalid.length > 0) {
      throw new BadRequestException(
        `Hồ sơ cầu thủ không được để trống: ${invalid.join(', ')}`,
      );
    }
  }
}

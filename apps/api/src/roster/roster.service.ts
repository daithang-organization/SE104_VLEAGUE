import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RegulationHelper } from '../regulation/regulation.helper';
import {
  TeamManagerScopeService,
  type TeamScopeActor,
} from '../team-manager/team-manager-scope.service';
import { AddPlayerToRosterDto, UpdateRosterPlayerDto } from './dto';

/** Fallback limits when no season regulation is available */
const DEFAULT_MAX_ROSTER = 22;
const DEFAULT_MAX_FOREIGN = 5;
const DEFAULT_MIN_AGE = 16;
const DEFAULT_MAX_AGE = 40;

@Injectable()
export class RosterService {
  constructor(
    private prisma: PrismaService,
    private regulationHelper: RegulationHelper,
    private readonly teamManagerScope: TeamManagerScopeService,
  ) {}

  /**
   * Get team roster (all players in a team)
   */
  async getTeamRoster(teamId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException(`Không tìm thấy đội bóng với ID ${teamId}`);
    }

    const roster = await this.prisma.teamPlayer.findMany({
      where: {
        teamId,
        leftAt: null, // Only active players
      },
      include: {
        player: true,
      },
      orderBy: [{ jerseyNumber: 'asc' }, { joinedAt: 'asc' }],
    });

    return {
      teamId,
      teamName: team.name,
      count: roster.length,
      players: roster.map((tp: Record<string, unknown>) => ({
        id: tp.id,
        playerId: (tp.player as Record<string, unknown>).id,
        fullName: (tp.player as Record<string, unknown>).fullName,
        position: (tp.player as Record<string, unknown>).position,
        nationality: (tp.player as Record<string, unknown>).nationality,
        dob: (tp.player as Record<string, unknown>).dob,
        jerseyNumber: tp.jerseyNumber,
        joinedAt: tp.joinedAt,
      })),
    };
  }

  /**
   * Add player to team roster
   */
  async addPlayerToRoster(
    teamId: string,
    dto: AddPlayerToRosterDto,
    actor?: TeamScopeActor,
  ) {
    if (actor) {
      await this.teamManagerScope.assertCanManageTeam(actor, teamId);
    }

    // Check team exists
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException(`Không tìm thấy đội bóng với ID ${teamId}`);
    }

    // Check player exists
    const player = await this.prisma.player.findUnique({
      where: { id: dto.playerId },
    });

    if (!player) {
      throw new NotFoundException(
        `Không tìm thấy cầu thủ với ID ${dto.playerId}`,
      );
    }

    // Validate player age against regulation
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

    const dob = new Date(player.dob);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    if (age < minAge) {
      throw new BadRequestException(
        `Cầu thủ phải ít nhất ${minAge} tuổi để tham gia đội hình (hiện tại: ${age} tuổi)`,
      );
    }

    if (age > maxAge) {
      throw new BadRequestException(
        `Cầu thủ không được quá ${maxAge} tuổi để tham gia đội hình (hiện tại: ${age} tuổi)`,
      );
    }

    // Check if player already in a team
    const existingRoster = await this.prisma.teamPlayer.findFirst({
      where: {
        playerId: dto.playerId,
        leftAt: null,
      },
      include: { team: true },
    });

    if (existingRoster) {
      throw new ConflictException(
        `Cầu thủ đã thuộc đội "${existingRoster.team.name}"`,
      );
    }

    // Check roster size against regulation
    const maxRoster = await this.regulationHelper.getNumericValue(
      dto.seasonId,
      'MAX_ROSTER',
      DEFAULT_MAX_ROSTER,
    );

    const activeCount = await this.prisma.teamPlayer.count({
      where: { teamId, leftAt: null },
    });

    if (activeCount >= maxRoster) {
      throw new BadRequestException(
        `Đội đã đạt giới hạn ${maxRoster} cầu thủ trong đội hình`,
      );
    }

    // Check foreign player limit against regulation
    if ((player as Record<string, unknown>).playerType === 'FOREIGN') {
      const maxForeign = await this.regulationHelper.getNumericValue(
        dto.seasonId,
        'MAX_FOREIGN_PLAYERS',
        DEFAULT_MAX_FOREIGN,
      );

      const foreignCount = await this.prisma.teamPlayer.count({
        where: {
          teamId,
          leftAt: null,
          player: { playerType: 'FOREIGN' },
        },
      });

      if (foreignCount >= maxForeign) {
        throw new BadRequestException(
          `Đội đã đạt giới hạn ${maxForeign} cầu thủ ngoại`,
        );
      }
    }

    // Check jersey number availability
    if (dto.jerseyNumber) {
      const jerseyTaken = await this.prisma.teamPlayer.findFirst({
        where: {
          teamId,
          jerseyNumber: dto.jerseyNumber,
          leftAt: null,
        },
      });

      if (jerseyTaken) {
        throw new BadRequestException(
          `Số áo ${dto.jerseyNumber} đã được sử dụng`,
        );
      }
    }

    try {
      const teamPlayer = await this.prisma.teamPlayer.create({
        data: {
          teamId,
          playerId: dto.playerId,
          jerseyNumber: dto.jerseyNumber,
        },
        include: {
          player: true,
        },
      });

      return {
        success: true,
        message: `Đã thêm ${player.fullName} vào ${team.name}`,
        data: teamPlayer,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Cầu thủ đã có trong đội hình này');
        }
      }
      throw error;
    }
  }

  /**
   * Update roster player (jersey number, etc.)
   */
  async updateRosterPlayer(
    teamId: string,
    playerId: string,
    dto: UpdateRosterPlayerDto,
    actor?: TeamScopeActor,
  ) {
    if (actor) {
      await this.teamManagerScope.assertCanManageTeam(actor, teamId);
    }

    const teamPlayer = await this.prisma.teamPlayer.findFirst({
      where: {
        teamId,
        playerId,
        leftAt: null,
      },
    });

    if (!teamPlayer) {
      throw new NotFoundException('Không tìm thấy cầu thủ trong đội hình này');
    }

    // Check jersey number availability
    if (dto.jerseyNumber) {
      const jerseyTaken = await this.prisma.teamPlayer.findFirst({
        where: {
          teamId,
          jerseyNumber: dto.jerseyNumber,
          leftAt: null,
          NOT: { id: teamPlayer.id },
        },
      });

      if (jerseyTaken) {
        throw new BadRequestException(
          `Số áo ${dto.jerseyNumber} đã được sử dụng`,
        );
      }
    }

    return this.prisma.teamPlayer.update({
      where: { id: teamPlayer.id },
      data: dto,
      include: { player: true },
    });
  }

  /**
   * Remove player from roster (mark as left)
   */
  async removePlayerFromRoster(
    teamId: string,
    playerId: string,
    actor?: TeamScopeActor,
  ) {
    if (actor) {
      await this.teamManagerScope.assertCanManageTeam(actor, teamId);
    }

    const teamPlayer = await this.prisma.teamPlayer.findFirst({
      where: {
        teamId,
        playerId,
        leftAt: null,
      },
      include: { player: true, team: true },
    });

    if (!teamPlayer) {
      throw new NotFoundException('Không tìm thấy cầu thủ trong đội hình này');
    }

    await this.prisma.teamPlayer.update({
      where: { id: teamPlayer.id },
      data: { leftAt: new Date() },
    });

    return {
      success: true,
      message: `Đã xóa ${teamPlayer.player.fullName} khỏi ${teamPlayer.team.name}`,
    };
  }
}

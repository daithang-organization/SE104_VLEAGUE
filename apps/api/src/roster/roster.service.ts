import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AddPlayerToRosterDto, UpdateRosterPlayerDto } from './dto';

@Injectable()
export class RosterService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get team roster (all players in a team)
   */
  async getTeamRoster(teamId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
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
  async addPlayerToRoster(teamId: string, dto: AddPlayerToRosterDto) {
    // Check team exists
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    // Check player exists
    const player = await this.prisma.player.findUnique({
      where: { id: dto.playerId },
    });

    if (!player) {
      throw new NotFoundException(`Player with ID ${dto.playerId} not found`);
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
        `Player is already in team "${existingRoster.team.name}"`,
      );
    }

    // Check roster size (max 22 active players)
    const activeCount = await this.prisma.teamPlayer.count({
      where: { teamId, leftAt: null },
    });

    if (activeCount >= 22) {
      throw new BadRequestException(
        `Đội đã đạt giới hạn 22 cầu thủ trong đội hình`,
      );
    }

    // Check foreign player limit (max 3)
    if ((player as Record<string, unknown>).playerType === 'FOREIGN') {
      const foreignCount = await this.prisma.teamPlayer.count({
        where: {
          teamId,
          leftAt: null,
          player: { playerType: 'FOREIGN' },
        },
      });

      if (foreignCount >= 3) {
        throw new BadRequestException(`Đội đã đạt giới hạn 3 cầu thủ ngoại`);
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
          `Jersey number ${dto.jerseyNumber} is already taken`,
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
        message: `${player.fullName} added to ${team.name}`,
        data: teamPlayer,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Player is already in this team');
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
  ) {
    const teamPlayer = await this.prisma.teamPlayer.findFirst({
      where: {
        teamId,
        playerId,
        leftAt: null,
      },
    });

    if (!teamPlayer) {
      throw new NotFoundException('Player not found in this team');
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
          `Jersey number ${dto.jerseyNumber} is already taken`,
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
  async removePlayerFromRoster(teamId: string, playerId: string) {
    const teamPlayer = await this.prisma.teamPlayer.findFirst({
      where: {
        teamId,
        playerId,
        leftAt: null,
      },
      include: { player: true, team: true },
    });

    if (!teamPlayer) {
      throw new NotFoundException('Player not found in this team');
    }

    await this.prisma.teamPlayer.update({
      where: { id: teamPlayer.id },
      data: { leftAt: new Date() },
    });

    return {
      success: true,
      message: `${teamPlayer.player.fullName} removed from ${teamPlayer.team.name}`,
    };
  }
}

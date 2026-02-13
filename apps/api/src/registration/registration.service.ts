import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, type Player, type Team } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreatePlayerDto, UpdatePlayerDto } from './dto/player.dto';
import type { CreateTeamDto, UpdateTeamDto } from './dto/team.dto';

@Injectable()
export class RegistrationService {
  constructor(private prisma: PrismaService) {}

  // ───────────────── TEAMS ─────────────────

  async listTeams(): Promise<Team[]> {
    return await this.prisma.team.findMany({
      orderBy: { name: 'asc' },
      include: { stadium: { select: { id: true, name: true } } },
    });
  }

  async findOneTeam(id: string): Promise<Team> {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: {
        stadium: { select: { id: true, name: true, city: true } },
      },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    return team;
  }

  async createTeam(dto: CreateTeamDto): Promise<Team> {
    try {
      return await this.prisma.team.create({
        data: {
          name: dto.name,
          status: (dto.status ?? 'ACTIVE') as never,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            `Team with name "${dto.name}" already exists`,
          );
        }
      }
      throw error;
    }
  }

  async updateTeam(id: string, dto: UpdateTeamDto): Promise<Team> {
    await this.findOneTeam(id);

    try {
      return await this.prisma.team.update({
        where: { id },
        data: dto as never,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            `Team with name "${dto.name}" already exists`,
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

  // ───────────────── PLAYERS ─────────────────

  async listPlayers(): Promise<Player[]> {
    return await this.prisma.player.findMany({
      orderBy: { fullName: 'asc' },
    });
  }

  async findOnePlayer(id: string): Promise<Player> {
    const player = await this.prisma.player.findUnique({
      where: { id },
      include: {
        teamPlayers: {
          where: { leftAt: null },
          include: { team: { select: { id: true, name: true } } },
          take: 1,
        },
      },
    });

    if (!player) {
      throw new NotFoundException(`Player with ID ${id} not found`);
    }

    return player;
  }

  async createPlayer(dto: CreatePlayerDto): Promise<Player> {
    return await this.prisma.player.create({
      data: {
        fullName: dto.fullName,
        dob: new Date(dto.dob),
        nationality: dto.nationality,
        position: dto.position as never,
      },
    });
  }

  async updatePlayer(id: string, dto: UpdatePlayerDto): Promise<Player> {
    await this.findOnePlayer(id);

    const data: Record<string, unknown> = {};
    if (dto.fullName !== undefined) data.fullName = dto.fullName;
    if (dto.dob !== undefined) data.dob = new Date(dto.dob);
    if (dto.nationality !== undefined) data.nationality = dto.nationality;
    if (dto.position !== undefined) data.position = dto.position;

    return await this.prisma.player.update({
      where: { id },
      data: data as never,
    });
  }

  async deletePlayer(id: string): Promise<{ success: boolean }> {
    await this.findOnePlayer(id);

    await this.prisma.player.delete({ where: { id } });
    return { success: true };
  }
}

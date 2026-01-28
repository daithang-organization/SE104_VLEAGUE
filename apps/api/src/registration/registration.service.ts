import { Injectable } from '@nestjs/common';
import type { Player, Team } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RegistrationService {
  constructor(private prisma: PrismaService) {}

  async listTeams(): Promise<Team[]> {
    return await this.prisma.team.findMany({ orderBy: { name: 'asc' } });
  }

  async listPlayers(): Promise<Player[]> {
    return await this.prisma.player.findMany({ orderBy: { fullName: 'asc' } });
  }
}

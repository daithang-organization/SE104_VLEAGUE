import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RegistrationService {
  constructor(private prisma: PrismaService) {}

  async listTeams() {
    return await this.prisma.team.findMany({ orderBy: { name: 'asc' } });
  }

  async listPlayers() {
    return await this.prisma.player.findMany({ orderBy: { fullName: 'asc' } });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RegistrationService {
  constructor(private prisma: PrismaService) {}

  listTeams() {
    return this.prisma.team.findMany({ orderBy: { name: 'asc' } });
  }

  listPlayers() {
    return this.prisma.player.findMany({ orderBy: { fullName: 'asc' } });
  }
}

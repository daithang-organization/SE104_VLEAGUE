import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SetLineupDto } from './dto/set-lineup.dto';

@Injectable()
export class LineupService {
  private readonly logger = new Logger(LineupService.name);

  constructor(private prisma: PrismaService) {}

  /** Get lineup for a match (both teams) */
  async getLineup(matchId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      select: { id: true, homeTeamId: true, awayTeamId: true },
    });
    if (!match)
      throw new NotFoundException(`Match with ID ${matchId} not found`);

    const lineups = await this.prisma.matchLineup.findMany({
      where: { matchId },
      include: {
        player: {
          select: {
            id: true,
            fullName: true,
            position: true,
            playerType: true,
          },
        },
        team: { select: { id: true, name: true } },
      },
      orderBy: [{ role: 'asc' }, { position: 'asc' }],
    });

    const home = lineups.filter((l) => l.teamId === match.homeTeamId);
    const away = lineups.filter((l) => l.teamId === match.awayTeamId);

    return {
      matchId,
      home: {
        teamId: match.homeTeamId,
        starting: home.filter((l) => l.role === 'STARTING'),
        substitutes: home.filter((l) => l.role === 'SUBSTITUTE'),
      },
      away: {
        teamId: match.awayTeamId,
        starting: away.filter((l) => l.role === 'STARTING'),
        substitutes: away.filter((l) => l.role === 'SUBSTITUTE'),
      },
    };
  }

  /** Set lineup for one team in a match */
  async setLineup(matchId: string, dto: SetLineupDto) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      select: { id: true, homeTeamId: true, awayTeamId: true, status: true },
    });
    if (!match)
      throw new NotFoundException(`Match with ID ${matchId} not found`);

    // Validate team belongs to the match
    if (dto.teamId !== match.homeTeamId && dto.teamId !== match.awayTeamId) {
      throw new BadRequestException('Đội bóng không tham gia trận đấu này');
    }

    // Validate starting count
    const startingCount = dto.players.filter(
      (p) => p.role === 'STARTING',
    ).length;
    if (startingCount > 11) {
      throw new BadRequestException('Đội hình chính không được quá 11 cầu thủ');
    }

    // Delete existing lineup for this team in this match
    await this.prisma.matchLineup.deleteMany({
      where: { matchId, teamId: dto.teamId },
    });

    // Create new lineup entries
    const created = await this.prisma.matchLineup.createMany({
      data: dto.players.map((p) => ({
        matchId,
        teamId: dto.teamId,
        playerId: p.playerId,
        role: p.role as never,
        position: p.position,
      })),
    });

    this.logger.log(
      `Lineup set for match ${matchId}, team ${dto.teamId}: ${created.count} players`,
    );

    return this.getLineup(matchId);
  }

  /** Remove lineup for one team in a match */
  async removeLineup(matchId: string, teamId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });
    if (!match)
      throw new NotFoundException(`Match with ID ${matchId} not found`);

    const result = await this.prisma.matchLineup.deleteMany({
      where: { matchId, teamId },
    });

    return { success: true, deletedCount: result.count };
  }
}

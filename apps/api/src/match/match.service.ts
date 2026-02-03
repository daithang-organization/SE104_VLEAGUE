import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddMatchEventDto } from './dto/add-match-event.dto';

@Injectable()
export class MatchService {
  constructor(private prisma: PrismaService) {}

  async getMatchById(id: string) {
    const match = await this.prisma.match.findUnique({
      where: { id },
      include: {
        homeTeam: { select: { id: true, name: true } },
        awayTeam: { select: { id: true, name: true } },
        stadium: { select: { id: true, name: true } },
        season: { select: { id: true, name: true } },
        events: {
          include: {
            player: { select: { id: true, fullName: true } },
            team: { select: { id: true, name: true } },
          },
          orderBy: { minute: 'asc' },
        },
      },
    });

    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }

    return match;
  }

  async findAll(seasonId?: string) {
    return this.prisma.match.findMany({
      where: seasonId ? { seasonId } : undefined,
      include: {
        homeTeam: { select: { id: true, name: true } },
        awayTeam: { select: { id: true, name: true } },
        stadium: { select: { id: true, name: true } },
      },
      orderBy: [{ roundNo: 'asc' }, { kickoffAt: 'asc' }],
    });
  }

  async addEvent(matchId: string, dto: AddMatchEventDto) {
    // Check match exists
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException(`Match with ID ${matchId} not found`);
    }

    // Create the event
    const event = await this.prisma.matchEvent.create({
      data: {
        matchId,
        minute: dto.minute,
        type: dto.type as never,
        playerId: dto.playerId,
        teamId: dto.teamId,
        note: dto.note,
      },
      include: {
        player: { select: { id: true, fullName: true } },
        team: { select: { id: true, name: true } },
      },
    });

    // Update score if it's a goal
    if (dto.type === 'GOAL' || dto.type === 'OWN_GOAL') {
      await this.recalculateScore(matchId);
    }

    return {
      ok: true,
      matchId,
      createdEvent: event,
    };
  }

  async removeEvent(matchId: string, eventId: string) {
    const event = await this.prisma.matchEvent.findFirst({
      where: { id: eventId, matchId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    await this.prisma.matchEvent.delete({
      where: { id: eventId },
    });

    // Recalculate score if it was a goal
    if (event.type === 'GOAL' || event.type === 'OWN_GOAL') {
      await this.recalculateScore(matchId);
    }

    return { success: true };
  }

  /**
   * Recalculate match score based on goal events
   */
  private async recalculateScore(matchId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) return;

    const goals = await this.prisma.matchEvent.findMany({
      where: {
        matchId,
        type: { in: ['GOAL', 'OWN_GOAL'] },
      },
    });

    let homeScore = 0;
    let awayScore = 0;

    for (const goal of goals) {
      if (goal.type === 'GOAL') {
        // Regular goal: team that scored gets the point
        if (goal.teamId === match.homeTeamId) {
          homeScore++;
        } else {
          awayScore++;
        }
      } else if (goal.type === 'OWN_GOAL') {
        // Own goal: opposite team gets the point
        if (goal.teamId === match.homeTeamId) {
          awayScore++;
        } else {
          homeScore++;
        }
      }
    }

    await this.prisma.match.update({
      where: { id: matchId },
      data: { homeScore, awayScore },
    });
  }
}

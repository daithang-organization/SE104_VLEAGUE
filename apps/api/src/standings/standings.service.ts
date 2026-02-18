import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface TeamStanding {
  position: number;
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

@Injectable()
export class StandingsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calculate standings for a specific season
   * Win = 3 points, Draw = 1 point, Loss = 0 points
   */
  async getStandings(seasonId?: string): Promise<TeamStanding[]> {
    // Get the season (current if not specified)
    let targetSeasonId = seasonId;
    if (!targetSeasonId) {
      const currentSeason = await this.prisma.season.findFirst({
        where: { status: 'IN_PROGRESS' },
      });
      targetSeasonId = currentSeason?.id;
    }

    // Get all teams
    const teams = await this.prisma.team.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, name: true },
    });

    // Get all completed matches for the season
    const matches = await this.prisma.match.findMany({
      where: {
        seasonId: targetSeasonId,
        status: { in: ['FINISHED', 'LOCKED'] },
      },
      select: {
        homeTeamId: true,
        awayTeamId: true,
        homeScore: true,
        awayScore: true,
      },
    });

    // Calculate standings for each team
    const standingsMap = new Map<string, TeamStanding>();

    // Initialize all teams
    for (const team of teams) {
      standingsMap.set(team.id, {
        position: 0,
        teamId: team.id,
        teamName: team.name,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      });
    }

    // Process each match
    for (const match of matches) {
      const homeTeam = standingsMap.get(match.homeTeamId);
      const awayTeam = standingsMap.get(match.awayTeamId);

      if (!homeTeam || !awayTeam) continue;

      const homeScore = match.homeScore ?? 0;
      const awayScore = match.awayScore ?? 0;

      // Update matches played
      homeTeam.played++;
      awayTeam.played++;

      // Update goals
      homeTeam.goalsFor += homeScore;
      homeTeam.goalsAgainst += awayScore;
      awayTeam.goalsFor += awayScore;
      awayTeam.goalsAgainst += homeScore;

      // Determine winner and update points
      if (homeScore > awayScore) {
        // Home win
        homeTeam.won++;
        homeTeam.points += 3;
        awayTeam.lost++;
      } else if (homeScore < awayScore) {
        // Away win
        awayTeam.won++;
        awayTeam.points += 3;
        homeTeam.lost++;
      } else {
        // Draw
        homeTeam.drawn++;
        awayTeam.drawn++;
        homeTeam.points += 1;
        awayTeam.points += 1;
      }
    }

    // Calculate goal difference
    for (const team of standingsMap.values()) {
      team.goalDifference = team.goalsFor - team.goalsAgainst;
    }

    // Sort standings
    const standings = Array.from(standingsMap.values()).sort((a, b) => {
      // 1. Points (descending)
      if (b.points !== a.points) return b.points - a.points;
      // 2. Goal difference (descending)
      if (b.goalDifference !== a.goalDifference)
        return b.goalDifference - a.goalDifference;
      // 3. Goals scored (descending)
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      // 4. Alphabetical (ascending)
      return a.teamName.localeCompare(b.teamName);
    });

    // Assign positions
    standings.forEach((team, index) => {
      team.position = index + 1;
    });

    return standings;
  }

  /**
   * Get top scorers for a season
   */
  async getTopScorers(seasonId?: string, limit = 10) {
    let targetSeasonId = seasonId;
    if (!targetSeasonId) {
      const currentSeason = await this.prisma.season.findFirst({
        where: { status: 'IN_PROGRESS' },
      });
      targetSeasonId = currentSeason?.id;
    }

    const goalEvents = await this.prisma.matchEvent.findMany({
      where: {
        type: 'GOAL',
        match: {
          seasonId: targetSeasonId,
          status: { in: ['FINISHED', 'LOCKED'] },
        },
        playerId: { not: null },
      },
      include: {
        player: { select: { id: true, fullName: true } },
        team: { select: { id: true, name: true } },
      },
    });

    // Count goals per player
    const scorerMap = new Map<
      string,
      {
        playerId: string;
        playerName: string;
        teamId: string;
        teamName: string;
        goals: number;
      }
    >();

    for (const event of goalEvents) {
      if (!event.player || !event.team) continue;

      const existing = scorerMap.get(event.player.id);
      if (existing) {
        existing.goals++;
      } else {
        scorerMap.set(event.player.id, {
          playerId: event.player.id,
          playerName: event.player.fullName,
          teamId: event.team.id,
          teamName: event.team.name,
          goals: 1,
        });
      }
    }

    return Array.from(scorerMap.values())
      .sort((a, b) => b.goals - a.goals)
      .slice(0, limit)
      .map((scorer, index) => ({ position: index + 1, ...scorer }));
  }

  /**
   * Get card statistics per player for a season
   */
  async getCardStats(seasonId?: string, limit = 20) {
    let targetSeasonId = seasonId;
    if (!targetSeasonId) {
      const currentSeason = await this.prisma.season.findFirst({
        where: { status: 'IN_PROGRESS' },
      });
      targetSeasonId = currentSeason?.id;
    }

    const cardEvents = await this.prisma.matchEvent.findMany({
      where: {
        type: { in: ['YELLOW_CARD', 'RED_CARD'] },
        match: {
          seasonId: targetSeasonId,
          status: { in: ['FINISHED', 'LOCKED'] },
        },
        playerId: { not: null },
      },
      include: {
        player: { select: { id: true, fullName: true } },
        team: { select: { id: true, name: true } },
      },
    });

    const cardMap = new Map<
      string,
      {
        playerId: string;
        playerName: string;
        teamId: string;
        teamName: string;
        yellowCards: number;
        redCards: number;
      }
    >();

    for (const event of cardEvents) {
      if (!event.player || !event.team) continue;

      const existing = cardMap.get(event.player.id);
      if (existing) {
        if (event.type === 'YELLOW_CARD') existing.yellowCards++;
        else existing.redCards++;
      } else {
        cardMap.set(event.player.id, {
          playerId: event.player.id,
          playerName: event.player.fullName,
          teamId: event.team.id,
          teamName: event.team.name,
          yellowCards: event.type === 'YELLOW_CARD' ? 1 : 0,
          redCards: event.type === 'RED_CARD' ? 1 : 0,
        });
      }
    }

    return Array.from(cardMap.values())
      .sort((a, b) => {
        const totalA = a.yellowCards + a.redCards * 3;
        const totalB = b.yellowCards + b.redCards * 3;
        return totalB - totalA;
      })
      .slice(0, limit)
      .map((card, index) => ({
        position: index + 1,
        ...card,
        totalCards: card.yellowCards + card.redCards,
      }));
  }

  /**
   * Get aggregated team statistics for a season
   */
  async getTeamStats(seasonId?: string) {
    let targetSeasonId = seasonId;
    if (!targetSeasonId) {
      const currentSeason = await this.prisma.season.findFirst({
        where: { status: 'IN_PROGRESS' },
      });
      targetSeasonId = currentSeason?.id;
    }

    // Get standings for base stats
    const standings = await this.getStandings(targetSeasonId);

    // Get card counts per team
    const cardEvents = await this.prisma.matchEvent.findMany({
      where: {
        type: { in: ['YELLOW_CARD', 'RED_CARD'] },
        match: {
          seasonId: targetSeasonId,
          status: { in: ['FINISHED', 'LOCKED'] },
        },
        teamId: { not: null },
      },
      select: { teamId: true, type: true },
    });

    const teamCards = new Map<
      string,
      { yellowCards: number; redCards: number }
    >();
    for (const event of cardEvents) {
      if (!event.teamId) continue;
      const existing = teamCards.get(event.teamId) || {
        yellowCards: 0,
        redCards: 0,
      };
      if (event.type === 'YELLOW_CARD') existing.yellowCards++;
      else existing.redCards++;
      teamCards.set(event.teamId, existing);
    }

    // Count clean sheets (matches where team conceded 0 goals)
    const matches = await this.prisma.match.findMany({
      where: {
        seasonId: targetSeasonId,
        status: { in: ['FINISHED', 'LOCKED'] },
      },
      select: {
        homeTeamId: true,
        awayTeamId: true,
        homeScore: true,
        awayScore: true,
      },
    });

    const cleanSheets = new Map<string, number>();
    for (const m of matches) {
      if (m.awayScore === 0 && m.homeTeamId) {
        cleanSheets.set(m.homeTeamId, (cleanSheets.get(m.homeTeamId) ?? 0) + 1);
      }
      if (m.homeScore === 0 && m.awayTeamId) {
        cleanSheets.set(m.awayTeamId, (cleanSheets.get(m.awayTeamId) ?? 0) + 1);
      }
    }

    return standings.map((team) => {
      const cards = teamCards.get(team.teamId) || {
        yellowCards: 0,
        redCards: 0,
      };
      return {
        teamId: team.teamId,
        teamName: team.teamName,
        played: team.played,
        won: team.won,
        drawn: team.drawn,
        lost: team.lost,
        goalsFor: team.goalsFor,
        goalsAgainst: team.goalsAgainst,
        goalDifference: team.goalDifference,
        points: team.points,
        cleanSheets: cleanSheets.get(team.teamId) ?? 0,
        yellowCards: cards.yellowCards,
        redCards: cards.redCards,
      };
    });
  }
}

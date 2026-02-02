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
        status: 'LOCKED', // Only count completed matches
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

      // Update matches played
      homeTeam.played++;
      awayTeam.played++;

      // Update goals
      homeTeam.goalsFor += match.homeScore;
      homeTeam.goalsAgainst += match.awayScore;
      awayTeam.goalsFor += match.awayScore;
      awayTeam.goalsAgainst += match.homeScore;

      // Determine winner and update points
      if (match.homeScore > match.awayScore) {
        // Home win
        homeTeam.won++;
        homeTeam.points += 3;
        awayTeam.lost++;
      } else if (match.homeScore < match.awayScore) {
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
          status: 'LOCKED',
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
      if (!event.player) continue;

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
}

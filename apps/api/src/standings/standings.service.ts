import { BadRequestException, Injectable } from '@nestjs/common';
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
  recentForm: Array<'W' | 'D' | 'L'>;
  requiresDrawLot?: boolean;
  headToHeadGoalsFor?: number;
  headToHeadGoalsAgainst?: number;
  tieBreakNote?: string;
}

export type StandingsMode = 'in_progress' | 'final';

type StandingMatch = {
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  kickoffAt?: Date | null;
  roundNo: number;
};

type DrawLotResultLike = {
  teamId: string;
  resolvedRank: number;
};

@Injectable()
export class StandingsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calculate standings for a specific season
   * Win = 3 points, Draw = 1 point, Loss = 0 points
   */
  async getStandings(
    seasonId?: string,
    mode: StandingsMode = 'in_progress',
    roundNo?: number,
  ): Promise<TeamStanding[]> {
    // Get the season (current if not specified)
    const targetSeasonId = await this.resolveSeasonId(seasonId);

    // Get only teams registered (APPROVED) for this season via SeasonTeam
    let teams: { id: string; name: string }[];
    if (targetSeasonId) {
      const seasonTeams = await this.prisma.seasonTeam.findMany({
        where: {
          seasonId: targetSeasonId,
          status: 'APPROVED',
        },
        include: {
          team: { select: { id: true, name: true } },
        },
      });
      teams = seasonTeams.map((st) => st.team);
    } else {
      // Fallback: no season → show all active teams
      teams = await this.prisma.team.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true, name: true },
      });
    }

    // Get all completed matches for the season
    const matches = await this.prisma.match.findMany({
      where: {
        seasonId: targetSeasonId,
        status: { in: ['PUBLISHED', 'FINISHED', 'LOCKED'] },
        homeScore: { not: null },
        awayScore: { not: null },
        ...(roundNo !== undefined ? { roundNo: { lte: roundNo } } : {}),
      },
      select: {
        homeTeamId: true,
        awayTeamId: true,
        homeScore: true,
        awayScore: true,
        kickoffAt: true,
        roundNo: true,
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
        recentForm: [],
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

    const recentMatches = [...matches].sort((a, b) => {
      const dateDiff =
        (b.kickoffAt?.getTime() ?? 0) - (a.kickoffAt?.getTime() ?? 0);
      if (dateDiff !== 0) return dateDiff;
      return b.roundNo - a.roundNo;
    });

    for (const match of recentMatches) {
      const homeTeam = standingsMap.get(match.homeTeamId);
      const awayTeam = standingsMap.get(match.awayTeamId);
      if (!homeTeam || !awayTeam) continue;
      if (homeTeam.recentForm.length >= 5 && awayTeam.recentForm.length >= 5) {
        continue;
      }

      const homeScore = match.homeScore ?? 0;
      const awayScore = match.awayScore ?? 0;
      const homeResult =
        homeScore > awayScore ? 'W' : homeScore < awayScore ? 'L' : 'D';
      const awayResult =
        awayScore > homeScore ? 'W' : awayScore < homeScore ? 'L' : 'D';

      if (homeTeam.recentForm.length < 5) homeTeam.recentForm.push(homeResult);
      if (awayTeam.recentForm.length < 5) awayTeam.recentForm.push(awayResult);
    }

    // Calculate goal difference
    for (const team of standingsMap.values()) {
      team.goalDifference = team.goalsFor - team.goalsAgainst;
    }

    // Sort standings
    let standings = Array.from(standingsMap.values()).sort((a, b) =>
      this.compareByPrimaryStandingRules(a, b),
    );

    if (mode === 'final') {
      standings = this.applyFinalTieBreakers(standings, matches);
      if (targetSeasonId) {
        standings = await this.applyDrawLotResults(standings, targetSeasonId);
      }
    }

    // Assign positions
    this.assignPositions(standings, mode);

    return standings;
  }

  /**
   * Get top scorers for a season
   */
  async getTopScorers(seasonId?: string, limit = 10) {
    const targetSeasonId = await this.resolveSeasonId(seasonId);

    const goalEvents = await this.prisma.matchEvent.findMany({
      where: {
        type: { in: ['GOAL', 'PENALTY'] },
        match: {
          seasonId: targetSeasonId,
          status: { in: ['PUBLISHED', 'FINISHED', 'LOCKED'] },
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
   * Get top assists for a season
   */
  async getTopAssists(seasonId?: string, limit = 10) {
    const targetSeasonId = await this.resolveSeasonId(seasonId);

    const assistEvents = await this.prisma.matchEvent.findMany({
      where: {
        type: { in: ['GOAL', 'PENALTY'] },
        match: {
          seasonId: targetSeasonId,
          status: { in: ['PUBLISHED', 'FINISHED', 'LOCKED'] },
        },
        relatedPlayerId: { not: null },
      },
      include: {
        relatedPlayer: { select: { id: true, fullName: true } },
        team: { select: { id: true, name: true } },
      },
    });

    const assistMap = new Map<
      string,
      {
        playerId: string;
        playerName: string;
        teamId: string;
        teamName: string;
        assists: number;
      }
    >();

    for (const event of assistEvents) {
      if (!event.relatedPlayer || !event.team) continue;

      const existing = assistMap.get(event.relatedPlayer.id);
      if (existing) {
        existing.assists++;
      } else {
        assistMap.set(event.relatedPlayer.id, {
          playerId: event.relatedPlayer.id,
          playerName: event.relatedPlayer.fullName,
          teamId: event.team.id,
          teamName: event.team.name,
          assists: 1,
        });
      }
    }

    return Array.from(assistMap.values())
      .sort((a, b) => b.assists - a.assists)
      .slice(0, limit)
      .map((assist, index) => ({ position: index + 1, ...assist }));
  }

  /**
   * Get card statistics per player for a season
   */
  async getCardStats(seasonId?: string, limit = 20) {
    const targetSeasonId = await this.resolveSeasonId(seasonId);

    const cardEvents = await this.prisma.matchEvent.findMany({
      where: {
        type: { in: ['YELLOW_CARD', 'RED_CARD'] },
        match: {
          seasonId: targetSeasonId,
          status: { in: ['PUBLISHED', 'FINISHED', 'LOCKED'] },
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
   * Get player-of-the-match award counts for a season.
   */
  async getPlayerOfMatchStats(seasonId?: string, limit = 20) {
    const targetSeasonId = await this.resolveSeasonId(seasonId);

    const reports = await this.prisma.matchReport.findMany({
      where: {
        bestPlayerId: { not: null },
        match: {
          seasonId: targetSeasonId,
          status: { in: ['PUBLISHED', 'FINISHED', 'LOCKED'] },
        },
      },
      include: {
        bestPlayer: { select: { id: true, fullName: true } },
      },
    });

    const awardMap = new Map<
      string,
      {
        playerId: string;
        playerName: string;
        awards: number;
      }
    >();

    for (const report of reports) {
      if (!report.bestPlayerId || !report.bestPlayer) continue;
      const existing = awardMap.get(report.bestPlayerId);
      if (existing) {
        existing.awards++;
      } else {
        awardMap.set(report.bestPlayerId, {
          playerId: report.bestPlayerId,
          playerName: report.bestPlayer.fullName,
          awards: 1,
        });
      }
    }

    return Array.from(awardMap.values())
      .sort(
        (a, b) =>
          b.awards - a.awards || a.playerName.localeCompare(b.playerName),
      )
      .slice(0, limit)
      .map((award, index) => ({ position: index + 1, ...award }));
  }

  /**
   * Get suspensions created by the discipline rules for a season.
   */
  async getSuspensionStats(seasonId?: string) {
    const targetSeasonId = await this.resolveSeasonId(seasonId);

    const suspensions = await this.prisma.playerSuspension.findMany({
      where: { seasonId: targetSeasonId },
      include: {
        player: { select: { id: true, fullName: true } },
        team: { select: { id: true, name: true } },
        sourceMatch: { select: { id: true, roundNo: true } },
        effectiveMatch: { select: { id: true, roundNo: true } },
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });

    return suspensions.map((suspension) => ({
      id: suspension.id,
      playerId: suspension.playerId,
      playerName: suspension.player?.fullName ?? '—',
      teamId: suspension.teamId,
      teamName: suspension.team?.name ?? '—',
      reason: suspension.reason,
      status: suspension.status,
      sourceMatchId: suspension.sourceMatchId,
      sourceRound: suspension.sourceMatch?.roundNo ?? null,
      effectiveMatchId: suspension.effectiveMatchId,
      effectiveRound: suspension.effectiveMatch?.roundNo ?? null,
      servedAt: suspension.servedAt,
    }));
  }

  /**
   * Summarize final season awards from standings and player statistics.
   */
  async getSeasonAwards(seasonId?: string) {
    const targetSeasonId = await this.resolveSeasonId(seasonId);
    const [standings, topScorers, bestPlayers] = await Promise.all([
      this.getStandings(targetSeasonId, 'final'),
      this.getTopScorers(targetSeasonId, 1),
      this.getPlayerOfMatchStats(targetSeasonId, 1),
    ]);

    return {
      seasonId: targetSeasonId,
      champion: standings[0] ?? null,
      runnerUp: standings[1] ?? null,
      topScorer: topScorers[0] ?? null,
      bestPlayer: bestPlayers[0] ?? null,
      requiresDrawLot: standings.some((standing) => standing.requiresDrawLot),
      standings,
    };
  }

  /**
   * Get aggregated team statistics for a season
   */
  async getTeamStats(seasonId?: string) {
    const targetSeasonId = await this.resolveSeasonId(seasonId);

    // Get standings for base stats
    const standings = await this.getStandings(targetSeasonId);

    // Get card counts per team
    const cardEvents = await this.prisma.matchEvent.findMany({
      where: {
        type: { in: ['YELLOW_CARD', 'RED_CARD'] },
        match: {
          seasonId: targetSeasonId,
          status: { in: ['PUBLISHED', 'FINISHED', 'LOCKED'] },
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
        status: { in: ['PUBLISHED', 'FINISHED', 'LOCKED'] },
        homeScore: { not: null },
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

  // ── Head-to-Head ──

  async getHeadToHead(team1Id: string, team2Id: string, seasonId?: string) {
    const where: Record<string, unknown> = {
      OR: [
        { homeTeamId: team1Id, awayTeamId: team2Id },
        { homeTeamId: team2Id, awayTeamId: team1Id },
      ],
      status: { in: ['PUBLISHED', 'LOCKED', 'FINISHED'] },
      homeScore: { not: null },
      awayScore: { not: null },
    };
    if (seasonId) where.seasonId = seasonId;

    const matches = await this.prisma.match.findMany({
      where,
      include: {
        homeTeam: { select: { id: true, name: true } },
        awayTeam: { select: { id: true, name: true } },
        stadium: { select: { id: true, name: true } },
      },
      orderBy: { kickoffAt: 'desc' },
    });

    let team1Wins = 0;
    let team2Wins = 0;
    let draws = 0;
    let team1Goals = 0;
    let team2Goals = 0;

    for (const m of matches) {
      const hs = m.homeScore ?? 0;
      const as_ = m.awayScore ?? 0;

      if (m.homeTeamId === team1Id) {
        team1Goals += hs;
        team2Goals += as_;
        if (hs > as_) team1Wins++;
        else if (hs < as_) team2Wins++;
        else draws++;
      } else {
        team2Goals += hs;
        team1Goals += as_;
        if (hs > as_) team2Wins++;
        else if (hs < as_) team1Wins++;
        else draws++;
      }
    }

    return {
      totalMatches: matches.length,
      team1: { teamId: team1Id, wins: team1Wins, goals: team1Goals },
      team2: { teamId: team2Id, wins: team2Wins, goals: team2Goals },
      draws,
      matches: matches.map((m) => ({
        id: m.id,
        roundNo: m.roundNo,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
        kickoffAt: m.kickoffAt,
        stadium: m.stadium,
      })),
    };
  }

  // ── Player Individual Stats ──

  async getPlayerStats(playerId: string, seasonId?: string) {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      select: { id: true, fullName: true, position: true, nationality: true },
    });
    if (!player) return null;

    const matchWhere: Record<string, unknown> = { status: 'FINISHED' };
    if (seasonId) matchWhere.seasonId = seasonId;

    const events = await this.prisma.matchEvent.findMany({
      where: {
        playerId,
        match: matchWhere,
      },
      include: {
        match: {
          select: { id: true, roundNo: true, seasonId: true, kickoffAt: true },
        },
        team: { select: { id: true, name: true } },
      },
      orderBy: { match: { kickoffAt: 'desc' } },
    });

    const goals = events.filter(
      (e) => e.type === 'GOAL' || e.type === 'PENALTY',
    ).length;
    const ownGoals = events.filter((e) => e.type === 'OWN_GOAL').length;
    const yellowCards = events.filter((e) => e.type === 'YELLOW_CARD').length;
    const redCards = events.filter((e) => e.type === 'RED_CARD').length;
    const assists = await this.prisma.matchEvent.count({
      where: {
        relatedPlayerId: playerId,
        type: 'GOAL',
        match: matchWhere,
      },
    });

    // Matches played (via events)
    const matchIds = new Set(events.map((e) => e.match.id));

    // Goals per round for chart
    const goalsByRound = events
      .filter((e) => e.type === 'GOAL' || e.type === 'PENALTY')
      .reduce(
        (acc, e) => {
          const round = e.match.roundNo;
          acc[round] = (acc[round] ?? 0) + 1;
          return acc;
        },
        {} as Record<number, number>,
      );

    return {
      player,
      matchesPlayed: matchIds.size,
      goals,
      assists,
      ownGoals,
      yellowCards,
      redCards,
      goalsByRound,
      recentEvents: events.slice(0, 20),
    };
  }

  private async resolveSeasonId(seasonId?: string) {
    if (seasonId) return seasonId;

    const seasonDelegate = this.prisma.season as typeof this.prisma.season & {
      findMany?: typeof this.prisma.season.findMany;
      findFirst?: typeof this.prisma.season.findFirst;
    };
    if (!seasonDelegate.findMany) {
      const currentSeason = await seasonDelegate.findFirst?.({
        where: { status: 'IN_PROGRESS' },
      });
      return currentSeason?.id;
    }

    const currentSeasons = await seasonDelegate.findMany({
      where: { status: 'IN_PROGRESS' },
      include: {
        _count: {
          select: {
            matches: true,
            seasonTeams: true,
          },
        },
      },
    });
    const currentSeason = currentSeasons.sort((a, b) => {
      const brandedDelta =
        Number(b.name.startsWith('V.League')) -
        Number(a.name.startsWith('V.League'));
      if (brandedDelta !== 0) return brandedDelta;
      const matchDelta = b._count.matches - a._count.matches;
      if (matchDelta !== 0) return matchDelta;
      return b._count.seasonTeams - a._count.seasonTeams;
    })[0];
    return currentSeason?.id;
  }

  private compareByPrimaryStandingRules(a: TeamStanding, b: TeamStanding) {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) {
      return b.goalDifference - a.goalDifference;
    }
    return a.teamName.localeCompare(b.teamName);
  }

  private applyFinalTieBreakers(
    standings: TeamStanding[],
    matches: StandingMatch[],
  ) {
    const result: TeamStanding[] = [];

    for (let index = 0; index < standings.length; ) {
      const group = [standings[index]];
      let nextIndex = index + 1;
      while (
        nextIndex < standings.length &&
        standings[nextIndex].points === standings[index].points &&
        standings[nextIndex].goalDifference === standings[index].goalDifference
      ) {
        group.push(standings[nextIndex]);
        nextIndex++;
      }

      if (group.length === 2) {
        result.push(
          ...this.resolveTwoTeamFinalTie(group[0], group[1], matches),
        );
      } else if (group.length > 2) {
        for (const standing of group) {
          standing.requiresDrawLot = true;
          standing.tieBreakNote =
            'Có từ 3 đội trở lên bằng điểm và hiệu số; cần BTC xử lý/rút thăm theo quy định bổ sung.';
        }
        result.push(...group);
      } else {
        group[0].requiresDrawLot = false;
        result.push(group[0]);
      }

      index = nextIndex;
    }

    return result;
  }

  private resolveTwoTeamFinalTie(
    first: TeamStanding,
    second: TeamStanding,
    matches: StandingMatch[],
  ) {
    const aggregate = this.getHeadToHeadAggregate(
      first.teamId,
      second.teamId,
      matches,
    );

    first.headToHeadGoalsFor = aggregate.firstGoals;
    first.headToHeadGoalsAgainst = aggregate.secondGoals;
    second.headToHeadGoalsFor = aggregate.secondGoals;
    second.headToHeadGoalsAgainst = aggregate.firstGoals;

    if (aggregate.firstGoals > aggregate.secondGoals) {
      first.requiresDrawLot = false;
      second.requiresDrawLot = false;
      first.tieBreakNote = 'Xếp trên nhờ tổng tỷ số đối đầu.';
      second.tieBreakNote = 'Xếp sau do tổng tỷ số đối đầu.';
      return [first, second];
    }

    if (aggregate.firstGoals < aggregate.secondGoals) {
      first.requiresDrawLot = false;
      second.requiresDrawLot = false;
      first.tieBreakNote = 'Xếp sau do tổng tỷ số đối đầu.';
      second.tieBreakNote = 'Xếp trên nhờ tổng tỷ số đối đầu.';
      return [second, first];
    }

    first.requiresDrawLot = true;
    second.requiresDrawLot = true;
    first.tieBreakNote = 'Bằng tổng tỷ số đối đầu; cần rút thăm.';
    second.tieBreakNote = 'Bằng tổng tỷ số đối đầu; cần rút thăm.';
    return [first, second].sort((a, b) => a.teamName.localeCompare(b.teamName));
  }

  private getHeadToHeadAggregate(
    firstTeamId: string,
    secondTeamId: string,
    matches: StandingMatch[],
  ) {
    let firstGoals = 0;
    let secondGoals = 0;

    for (const match of matches) {
      const involvesBothTeams =
        (match.homeTeamId === firstTeamId &&
          match.awayTeamId === secondTeamId) ||
        (match.homeTeamId === secondTeamId && match.awayTeamId === firstTeamId);
      if (!involvesBothTeams) continue;

      const homeScore = match.homeScore ?? 0;
      const awayScore = match.awayScore ?? 0;
      if (match.homeTeamId === firstTeamId) {
        firstGoals += homeScore;
        secondGoals += awayScore;
      } else {
        firstGoals += awayScore;
        secondGoals += homeScore;
      }
    }

    return { firstGoals, secondGoals };
  }

  private assignPositions(standings: TeamStanding[], mode: StandingsMode) {
    let currentPosition = 1;

    standings.forEach((team, index) => {
      if (index === 0) {
        team.position = currentPosition;
        return;
      }

      const previous = standings[index - 1];
      const sharesPrimaryRank =
        team.points === previous.points &&
        team.goalDifference === previous.goalDifference;
      const unresolvedFinalTie =
        mode === 'final' &&
        sharesPrimaryRank &&
        Boolean(team.requiresDrawLot && previous.requiresDrawLot);

      if (mode === 'in_progress' && sharesPrimaryRank) {
        team.position = currentPosition;
        return;
      }

      if (unresolvedFinalTie) {
        team.position = currentPosition;
        return;
      }

      currentPosition = index + 1;
      team.position = currentPosition;
    });
  }

  // ── Draw Lot ──────────────────────────────────────────────────

  /**
   * Apply saved DrawLotResult to resolve tied positions in final standings.
   * Called after applyFinalTieBreakers when mode === 'final'.
   */
  private async applyDrawLotResults(
    standings: TeamStanding[],
    seasonId: string,
  ): Promise<TeamStanding[]> {
    this.assignPositions(standings, 'final');
    const drawLotGroups = this.getDrawLotGroups(standings);
    const currentDrawLotTeamIds = drawLotGroups
      .flat()
      .map((standing) => standing.teamId);

    if (currentDrawLotTeamIds.length === 0) return standings;

    const drawLotResults = await this.prisma.drawLotResult.findMany({
      where: {
        seasonId,
        confirmed: true,
        teamId: { in: currentDrawLotTeamIds },
      },
    });

    if (!this.drawLotResultsCoverGroups(drawLotGroups, drawLotResults)) {
      return standings;
    }

    const rankMap = new Map(
      drawLotResults.map((r) => [r.teamId, r.resolvedRank]),
    );

    // For each team that has a confirmed draw lot result, override position
    for (const standing of standings) {
      if (rankMap.has(standing.teamId)) {
        standing.position = rankMap.get(standing.teamId)!;
        standing.requiresDrawLot = false;
        standing.tieBreakNote = 'Đã xếp hạng chính thức qua rút thăm.';
      }
    }

    // Re-sort by resolved position
    standings.sort((a, b) => {
      const rankA = rankMap.get(a.teamId) ?? a.position;
      const rankB = rankMap.get(b.teamId) ?? b.position;
      if (rankA !== rankB) return rankA - rankB;
      return this.compareByPrimaryStandingRules(a, b);
    });

    return standings;
  }

  /**
   * Get draw lot status: which teams need draw lot, are there saved results?
   */
  async getDrawLotStatus(seasonId?: string) {
    const targetSeasonId = await this.resolveSeasonId(seasonId);
    if (!targetSeasonId) {
      return {
        seasonId: null,
        teamsRequiringDrawLot: [],
        isResolved: false,
        results: [],
      };
    }

    const rawStandings = await this.getRawFinalStandings(targetSeasonId);
    const drawLotGroups = this.getDrawLotGroups(rawStandings);
    const drawLotTeamIds = drawLotGroups
      .flat()
      .map((standing) => standing.teamId);

    const results = await this.prisma.drawLotResult.findMany({
      where:
        drawLotTeamIds.length > 0
          ? { seasonId: targetSeasonId, teamId: { in: drawLotTeamIds } }
          : { seasonId: targetSeasonId, teamId: { in: [] } },
      include: { team: { select: { id: true, name: true, shortName: true } } },
      orderBy: { resolvedRank: 'asc' },
    });
    const isResolved =
      drawLotGroups.length > 0 &&
      this.drawLotResultsCoverGroups(
        drawLotGroups,
        results.filter((result) => result.confirmed),
      );

    return {
      seasonId: targetSeasonId,
      teamsRequiringDrawLot: isResolved ? [] : drawLotGroups.flat(),
      isResolved,
      results,
    };
  }

  /**
   * Auto-random draw lot: shuffle tied teams and assign random ranks.
   * Does NOT auto-confirm — admin must confirm separately.
   */
  async executeDrawLot(seasonId: string, userId?: string) {
    // First compute standings without draw lot applied to find tied teams
    const rawStandings = await this.getRawFinalStandings(seasonId);
    const tiedTeams = rawStandings.filter((s) => s.requiresDrawLot === true);

    if (tiedTeams.length === 0) {
      return { message: 'Không có đội nào cần rút thăm.', results: [] };
    }

    // Group tied teams by their position (they share the same position)
    const groups = this.groupTiedTeams(tiedTeams);

    // Delete existing unconfirmed results for this season
    await this.prisma.drawLotResult.deleteMany({
      where: { seasonId, confirmed: false },
    });

    const results: Array<{
      teamId: string;
      teamName: string;
      resolvedRank: number;
    }> = [];

    for (const group of groups) {
      // Fisher-Yates shuffle
      const shuffled = [...group];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      // Assign sequential ranks starting from the group's shared position
      const startRank = group[0].position;
      for (let i = 0; i < shuffled.length; i++) {
        const rank = startRank + i;
        await this.prisma.drawLotResult.upsert({
          where: {
            seasonId_teamId: { seasonId, teamId: shuffled[i].teamId },
          },
          create: {
            seasonId,
            teamId: shuffled[i].teamId,
            resolvedRank: rank,
            note: `Rút thăm tự động — hạng ${rank}`,
            resolvedBy: userId ?? null,
            confirmed: false,
          },
          update: {
            resolvedRank: rank,
            note: `Rút thăm tự động — hạng ${rank}`,
            resolvedBy: userId ?? null,
            confirmed: false,
            resolvedAt: new Date(),
          },
        });
        results.push({
          teamId: shuffled[i].teamId,
          teamName: shuffled[i].teamName,
          resolvedRank: rank,
        });
      }
    }

    return {
      message: `Đã rút thăm cho ${results.length} đội. Hãy xác nhận kết quả.`,
      results,
    };
  }

  /**
   * Admin confirms draw lot results (optionally overriding ranks).
   */
  async confirmDrawLot(
    seasonId: string,
    overrides?: Array<{ teamId: string; resolvedRank: number }>,
    userId?: string,
  ) {
    const rawStandings = await this.getRawFinalStandings(seasonId);
    const drawLotGroups = this.getDrawLotGroups(rawStandings);
    const drawLotTeamIds = drawLotGroups
      .flat()
      .map((standing) => standing.teamId);

    if (drawLotGroups.length === 0) {
      throw new BadRequestException('Không có đội nào cần rút thăm.');
    }

    if (overrides && overrides.length > 0) {
      this.assertDrawLotOverridesMatchGroups(drawLotGroups, overrides);

      // Apply overrides
      for (const override of overrides) {
        await this.prisma.drawLotResult.upsert({
          where: {
            seasonId_teamId: { seasonId, teamId: override.teamId },
          },
          create: {
            seasonId,
            teamId: override.teamId,
            resolvedRank: override.resolvedRank,
            note: 'BTC xác nhận thủ công',
            resolvedBy: userId ?? null,
            confirmed: true,
          },
          update: {
            resolvedRank: override.resolvedRank,
            note: 'BTC xác nhận thủ công',
            resolvedBy: userId ?? null,
            confirmed: true,
            resolvedAt: new Date(),
          },
        });
      }
    } else {
      const pendingResults = await this.prisma.drawLotResult.findMany({
        where: {
          seasonId,
          confirmed: false,
          teamId: { in: drawLotTeamIds },
        },
      });

      if (!this.drawLotResultsCoverGroups(drawLotGroups, pendingResults)) {
        throw new BadRequestException(
          'Chưa có đủ kết quả rút thăm để xác nhận.',
        );
      }

      // Confirm all existing unconfirmed results
      await this.prisma.drawLotResult.updateMany({
        where: { seasonId, confirmed: false, teamId: { in: drawLotTeamIds } },
        data: { confirmed: true, resolvedAt: new Date() },
      });
    }

    return { message: 'Đã xác nhận kết quả rút thăm.' };
  }

  /**
   * Reset draw lot results for a season.
   */
  async resetDrawLot(seasonId: string) {
    const deleted = await this.prisma.drawLotResult.deleteMany({
      where: { seasonId },
    });
    return {
      message: `Đã xóa ${deleted.count} kết quả rút thăm.`,
      deletedCount: deleted.count,
    };
  }

  /**
   * Get raw final standings without applying DrawLotResult.
   * Used internally to find which teams still need draw lot.
   */
  private async getRawFinalStandings(
    seasonId: string,
  ): Promise<TeamStanding[]> {
    const seasonTeams = await this.prisma.seasonTeam.findMany({
      where: { seasonId, status: 'APPROVED' },
      include: { team: { select: { id: true, name: true } } },
    });
    const teams = seasonTeams.map((st) => st.team);

    const matches = await this.prisma.match.findMany({
      where: {
        seasonId,
        status: { in: ['PUBLISHED', 'FINISHED', 'LOCKED'] },
        homeScore: { not: null },
        awayScore: { not: null },
      },
      select: {
        homeTeamId: true,
        awayTeamId: true,
        homeScore: true,
        awayScore: true,
        kickoffAt: true,
        roundNo: true,
      },
    });

    const standingsMap = new Map<string, TeamStanding>();
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
        recentForm: [],
      });
    }

    for (const match of matches) {
      const homeTeam = standingsMap.get(match.homeTeamId);
      const awayTeam = standingsMap.get(match.awayTeamId);
      if (!homeTeam || !awayTeam) continue;

      const homeScore = match.homeScore ?? 0;
      const awayScore = match.awayScore ?? 0;

      homeTeam.played++;
      awayTeam.played++;
      homeTeam.goalsFor += homeScore;
      homeTeam.goalsAgainst += awayScore;
      awayTeam.goalsFor += awayScore;
      awayTeam.goalsAgainst += homeScore;

      if (homeScore > awayScore) {
        homeTeam.won++;
        homeTeam.points += 3;
        awayTeam.lost++;
      } else if (homeScore < awayScore) {
        awayTeam.won++;
        awayTeam.points += 3;
        homeTeam.lost++;
      } else {
        homeTeam.drawn++;
        awayTeam.drawn++;
        homeTeam.points += 1;
        awayTeam.points += 1;
      }
    }

    for (const team of standingsMap.values()) {
      team.goalDifference = team.goalsFor - team.goalsAgainst;
    }

    let standings = Array.from(standingsMap.values()).sort((a, b) =>
      this.compareByPrimaryStandingRules(a, b),
    );
    standings = this.applyFinalTieBreakers(standings, matches);
    this.assignPositions(standings, 'final');

    return standings;
  }

  /**
   * Group tied teams by their shared position.
   */
  private groupTiedTeams(tiedTeams: TeamStanding[]): TeamStanding[][] {
    const groups: TeamStanding[][] = [];
    let currentGroup: TeamStanding[] = [];

    for (const team of tiedTeams) {
      if (
        currentGroup.length === 0 ||
        currentGroup[0].position === team.position
      ) {
        currentGroup.push(team);
      } else {
        groups.push(currentGroup);
        currentGroup = [team];
      }
    }
    if (currentGroup.length > 0) groups.push(currentGroup);

    return groups;
  }

  private getDrawLotGroups(standings: TeamStanding[]) {
    return this.groupTiedTeams(
      standings.filter((standing) => standing.requiresDrawLot === true),
    );
  }

  private getExpectedDrawLotRanks(group: TeamStanding[]) {
    const startRank = group[0].position;
    return group.map((_, index) => startRank + index);
  }

  private drawLotResultsCoverGroups(
    groups: TeamStanding[][],
    results: DrawLotResultLike[],
  ) {
    const resultsByTeamId = new Map(
      results.map((result) => [result.teamId, result]),
    );

    for (const group of groups) {
      const ranks: number[] = [];
      for (const standing of group) {
        const result = resultsByTeamId.get(standing.teamId);
        if (!result) return false;
        ranks.push(result.resolvedRank);
      }

      const expectedRanks = this.getExpectedDrawLotRanks(group);
      if (!this.sameNumberSet(ranks, expectedRanks)) return false;
    }

    return true;
  }

  private assertDrawLotOverridesMatchGroups(
    groups: TeamStanding[][],
    overrides: DrawLotResultLike[],
  ) {
    const requiredTeamIds = new Set(
      groups.flat().map((standing) => standing.teamId),
    );
    const overrideTeamIds = overrides.map((override) => override.teamId);
    const overrideRanks = overrides.map((override) => override.resolvedRank);

    if (new Set(overrideTeamIds).size !== overrideTeamIds.length) {
      throw new BadRequestException(
        'Mỗi đội chỉ được có một kết quả rút thăm.',
      );
    }

    if (new Set(overrideRanks).size !== overrideRanks.length) {
      throw new BadRequestException('Thứ hạng không được trùng nhau.');
    }

    if (overrides.length !== requiredTeamIds.size) {
      throw new BadRequestException(
        'Kết quả rút thăm phải bao gồm đầy đủ các đội trong nhóm đang hòa.',
      );
    }

    for (const override of overrides) {
      if (!requiredTeamIds.has(override.teamId)) {
        throw new BadRequestException(
          'Kết quả rút thăm chỉ được áp dụng cho các đội đang cần rút thăm.',
        );
      }
    }

    if (!this.drawLotResultsCoverGroups(groups, overrides)) {
      throw new BadRequestException(
        'Thứ hạng rút thăm phải khớp phạm vi thứ hạng của nhóm đang hòa.',
      );
    }
  }

  private sameNumberSet(first: number[], second: number[]) {
    if (first.length !== second.length) return false;
    const firstSet = new Set(first);
    if (firstSet.size !== first.length) return false;
    return second.every((value) => firstSet.has(value));
  }
}

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import type { Match } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchedulingService {
  private readonly logger = new Logger(SchedulingService.name);

  constructor(private prisma: PrismaService) {}

  // ────────── GET schedule with relations ──────────
  async getSchedule(
    seasonId?: string,
  ): Promise<{ ok: boolean; matches: Match[] }> {
    const where: Record<string, unknown> = {};
    if (seasonId) where.seasonId = seasonId;

    const matches = await this.prisma.match.findMany({
      where,
      include: {
        homeTeam: { select: { id: true, name: true, shortName: true } },
        awayTeam: { select: { id: true, name: true, shortName: true } },
        stadium: { select: { id: true, name: true, city: true } },
      },
      orderBy: [{ leg: 'asc' }, { roundNo: 'asc' }],
    });

    return { ok: true, matches };
  }

  // ────────── GENERATE round-robin ──────────
  async generate(seasonId?: string): Promise<{
    ok: boolean;
    message: string;
    totalMatches: number;
  }> {
    // 1) Find the target season
    let resolvedSeasonId = seasonId;

    if (!resolvedSeasonId) {
      // Try to find an IN_PROGRESS or UPCOMING season
      const season = await this.prisma.season.findFirst({
        where: { status: { in: ['IN_PROGRESS', 'UPCOMING'] } },
        orderBy: { year: 'desc' },
      });
      if (!season) {
        throw new BadRequestException(
          'Không tìm thấy mùa giải đang diễn ra hoặc sắp tới. Vui lòng tạo mùa giải trước.',
        );
      }
      resolvedSeasonId = season.id;
    }

    // 2) Get all ACTIVE teams (registered in the season, or all active teams)
    const seasonTeams = await this.prisma.seasonTeam.findMany({
      where: { seasonId: resolvedSeasonId },
      include: { team: { select: { id: true, name: true, stadiumId: true } } },
    });

    let teams =
      seasonTeams.length > 0
        ? seasonTeams.map((st) => st.team)
        : // Fallback: get all ACTIVE teams if no seasonTeams registered
          await this.prisma.team.findMany({
            where: { status: 'ACTIVE' },
            select: { id: true, name: true, stadiumId: true },
          });

    if (teams.length < 2) {
      throw new BadRequestException(
        `Cần ít nhất 2 đội để tạo lịch thi đấu (hiện có ${teams.length} đội).`,
      );
    }

    // 3) Delete existing DRAFT matches for this season
    const deleted = await this.prisma.match.deleteMany({
      where: { seasonId: resolvedSeasonId, status: 'DRAFT' },
    });
    if (deleted.count > 0) {
      this.logger.log(
        `Deleted ${deleted.count} existing DRAFT matches for season ${resolvedSeasonId}`,
      );
    }

    // 4) Round-robin algorithm
    // If odd number of teams, add a BYE placeholder (null)
    const teamList: ((typeof teams)[0] | null)[] = [...teams];
    if (teamList.length % 2 !== 0) {
      teamList.push(null); // BYE
    }

    const n = teamList.length;
    const numRounds = n - 1;
    const matchesPerRound = n / 2;

    const matchData: {
      roundNo: number;
      leg: number;
      homeTeamId: string;
      awayTeamId: string;
      stadiumId: string | null;
      seasonId: string;
      status: 'DRAFT';
    }[] = [];

    // Rotate teams (fix first team, rotate the rest)
    const fixed = teamList[0];
    const rotating = teamList.slice(1);

    for (let round = 0; round < numRounds; round++) {
      const current = [fixed, ...rotating];

      for (let match = 0; match < matchesPerRound; match++) {
        const home = current[match];
        const away = current[n - 1 - match];

        // Skip matches involving BYE team
        if (!home || !away) continue;

        // Leg 1 (lượt đi)
        matchData.push({
          roundNo: round + 1,
          leg: 1,
          homeTeamId: home.id,
          awayTeamId: away.id,
          stadiumId: home.stadiumId ?? null,
          seasonId: resolvedSeasonId,
          status: 'DRAFT',
        });

        // Leg 2 (lượt về) — swap home/away
        matchData.push({
          roundNo: round + 1,
          leg: 2,
          homeTeamId: away.id,
          awayTeamId: home.id,
          stadiumId: away.stadiumId ?? null,
          seasonId: resolvedSeasonId,
          status: 'DRAFT',
        });
      }

      // Rotate: move last element to index 0 of rotating array
      rotating.unshift(rotating.pop()!);
    }

    // 5) Bulk-create matches
    const result = await this.prisma.match.createMany({
      data: matchData as never,
    });

    const season = await this.prisma.season.findUnique({
      where: { id: resolvedSeasonId },
      select: { name: true },
    });

    this.logger.log(
      `Generated ${result.count} matches for season "${season?.name}"`,
    );

    return {
      ok: true,
      message: `Đã tạo ${result.count} trận đấu cho mùa giải "${season?.name}" (${teams.length} đội, ${numRounds} vòng × 2 lượt)`,
      totalMatches: result.count,
    };
  }

  // ────────── PUBLISH schedule ──────────
  async publish(seasonId?: string): Promise<{ ok: boolean; message: string }> {
    const where: Record<string, unknown> = { status: 'DRAFT' };
    if (seasonId) where.seasonId = seasonId;

    const result = await this.prisma.match.updateMany({
      where,
      data: { status: 'PUBLISHED' },
    });

    return {
      ok: true,
      message: `Đã công bố ${result.count} trận đấu.`,
    };
  }
}

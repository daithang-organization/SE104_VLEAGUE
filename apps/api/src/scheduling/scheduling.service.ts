import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import type { Match } from '@prisma/client';
import { NotificationService } from '../notification/notification.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchedulingService {
  private readonly logger = new Logger(SchedulingService.name);
  private readonly requiredTeamCount = 10;

  constructor(
    private prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  // ────────── GET schedule with relations ──────────
  async getSchedule(
    seasonId?: string,
  ): Promise<{ ok: boolean; matches: Match[] }> {
    const where: Record<string, unknown> = {};
    if (seasonId) where.seasonId = seasonId;

    const matches = await this.prisma.match.findMany({
      where,
      include: {
        homeTeam: {
          select: { id: true, name: true, shortName: true, coachName: true },
        },
        awayTeam: {
          select: { id: true, name: true, shortName: true, coachName: true },
        },
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

    // 2) Only approved teams are eligible for official league scheduling.
    const seasonTeams = await this.prisma.seasonTeam.findMany({
      where: { seasonId: resolvedSeasonId, status: 'APPROVED' },
      include: { team: { select: { id: true, name: true, stadiumId: true } } },
      orderBy: { registeredAt: 'asc' },
    });

    const teams = seasonTeams.map((st) => st.team);

    if (teams.length !== this.requiredTeamCount) {
      throw new BadRequestException(
        `Cần đúng ${this.requiredTeamCount} đội đã được duyệt để tạo lịch thi đấu (hiện có ${teams.length} đội APPROVED).`,
      );
    }

    // 3) Delete ALL existing matches for this season (clean slate)
    const deleted = await this.prisma.match.deleteMany({
      where: { seasonId: resolvedSeasonId },
    });
    if (deleted.count > 0) {
      this.logger.log(
        `Deleted ${deleted.count} existing matches for season ${resolvedSeasonId}`,
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

    // Determine season start date for scheduling
    const season = await this.prisma.season.findUnique({
      where: { id: resolvedSeasonId },
      select: { name: true, startDate: true, year: true },
    });
    // Base date: season startDate or Jan 15 of season year
    const baseDate = season?.startDate
      ? new Date(season.startDate)
      : new Date(season?.year ?? new Date().getFullYear(), 0, 15);

    // Find the next Saturday from baseDate
    const getNextSaturday = (from: Date) => {
      const d = new Date(from);
      const day = d.getDay();
      const diff = day === 6 ? 0 : (6 - day + 7) % 7;
      d.setDate(d.getDate() + diff);
      return d;
    };

    // VLeague typical kickoff times (hour:minute)
    const KICKOFF_SLOTS = [
      { hour: 17, minute: 0 },
      { hour: 18, minute: 0 },
      { hour: 19, minute: 15 },
    ];

    const matchData: {
      roundNo: number;
      leg: number;
      homeTeamId: string;
      awayTeamId: string;
      stadiumId: string | null;
      kickoffAt: Date;
      seasonId: string;
      status: 'DRAFT';
    }[] = [];

    // Rotate teams (fix first team, rotate the rest)
    const fixed = teamList[0];
    const rotating = teamList.slice(1);

    for (let round = 0; round < numRounds; round++) {
      const current = [fixed, ...rotating];

      // Leg 1: each round is 1 week apart, starting from first Saturday
      const leg1Saturday = getNextSaturday(
        new Date(baseDate.getTime() + round * 7 * 24 * 60 * 60 * 1000),
      );
      // Leg 2: starts after all leg 1 rounds + 1 week gap
      const leg2Saturday = getNextSaturday(
        new Date(
          baseDate.getTime() +
            (numRounds + 1 + round) * 7 * 24 * 60 * 60 * 1000,
        ),
      );

      for (let match = 0; match < matchesPerRound; match++) {
        const home = current[match];
        const away = current[n - 1 - match];

        // Skip matches involving BYE team
        if (!home || !away) continue;

        // Assign kickoff: spread matches across Sat & Sun with different time slots
        const slot = KICKOFF_SLOTS[match % KICKOFF_SLOTS.length];
        const isSunday = match >= Math.ceil(matchesPerRound / 2);

        // Leg 1 kickoff
        const kickoff1 = new Date(leg1Saturday);
        if (isSunday) kickoff1.setDate(kickoff1.getDate() + 1);
        kickoff1.setHours(slot.hour, slot.minute, 0, 0);

        // Leg 2 kickoff
        const kickoff2 = new Date(leg2Saturday);
        if (isSunday) kickoff2.setDate(kickoff2.getDate() + 1);
        kickoff2.setHours(slot.hour, slot.minute, 0, 0);

        // Leg 1 (lượt đi)
        matchData.push({
          roundNo: round + 1,
          leg: 1,
          homeTeamId: home.id,
          awayTeamId: away.id,
          stadiumId: home.stadiumId ?? null,
          kickoffAt: kickoff1,
          seasonId: resolvedSeasonId,
          status: 'DRAFT',
        });

        // Leg 2 (lượt về) — swap home/away, separate round number
        matchData.push({
          roundNo: numRounds + round + 1,
          leg: 2,
          homeTeamId: away.id,
          awayTeamId: home.id,
          stadiumId: away.stadiumId ?? null,
          kickoffAt: kickoff2,
          seasonId: resolvedSeasonId,
          status: 'DRAFT',
        });
      }

      // Rotate: move last element to index 0 of rotating array
      rotating.unshift(rotating.pop()!);
    }

    this.validateGeneratedSchedule(
      matchData,
      teams.map((team) => team.id),
    );

    // 5) Bulk-create matches
    const result = await this.prisma.match.createMany({
      data: matchData as never,
    });

    this.logger.log(
      `Generated ${result.count} matches for season "${season?.name}"`,
    );

    return {
      ok: true,
      message: `Đã tạo ${result.count} trận đấu cho mùa giải "${season?.name}" (${teams.length} đội, ${numRounds * 2} vòng: lượt đi V1–V${numRounds}, lượt về V${numRounds + 1}–V${numRounds * 2})`,
      totalMatches: result.count,
    };
  }

  private validateGeneratedSchedule(
    matches: Array<{
      roundNo: number;
      homeTeamId: string;
      awayTeamId: string;
    }>,
    teamIds: string[],
  ) {
    const expectedRounds = (this.requiredTeamCount - 1) * 2;
    const expectedMatches =
      this.requiredTeamCount * (this.requiredTeamCount - 1);
    const matchesPerRound = this.requiredTeamCount / 2;

    if (matches.length !== expectedMatches) {
      throw new BadRequestException(
        `Lịch thi đấu không hợp lệ: cần ${expectedMatches} trận, hiện có ${matches.length}.`,
      );
    }

    for (let roundNo = 1; roundNo <= expectedRounds; roundNo++) {
      const roundMatches = matches.filter((match) => match.roundNo === roundNo);
      if (roundMatches.length !== matchesPerRound) {
        throw new BadRequestException(
          `Lịch thi đấu không hợp lệ: vòng ${roundNo} phải có ${matchesPerRound} trận.`,
        );
      }
    }

    for (const teamId of teamIds) {
      const homeMatches = matches.filter(
        (match) => match.homeTeamId === teamId,
      );
      const awayMatches = matches.filter(
        (match) => match.awayTeamId === teamId,
      );

      if (homeMatches.length !== 9 || awayMatches.length !== 9) {
        throw new BadRequestException(
          `Lịch thi đấu không hợp lệ: mỗi đội phải có 9 trận sân nhà và 9 trận sân khách.`,
        );
      }
    }
  }

  // ────────── PUBLISH schedule ──────────
  async publish(seasonId?: string): Promise<{ ok: boolean; message: string }> {
    const where: Record<string, unknown> = { status: 'DRAFT' };
    if (seasonId) where.seasonId = seasonId;

    const result = await this.prisma.match.updateMany({
      where,
      data: { status: 'PUBLISHED' },
    });

    if (seasonId && result.count > 0) {
      await this.notifyApprovedTeamManagers(seasonId);
    }

    return {
      ok: true,
      message: `Đã công bố ${result.count} trận đấu.`,
    };
  }

  private async notifyApprovedTeamManagers(seasonId: string) {
    const seasonTeams = await this.prisma.seasonTeam.findMany({
      where: { seasonId, status: 'APPROVED' },
      include: {
        team: {
          select: {
            name: true,
            managedUsers: { select: { id: true } },
          },
        },
      },
    });

    const notifiedUserIds = new Set<string>();
    const notifications = seasonTeams.flatMap((seasonTeam) =>
      seasonTeam.team.managedUsers
        .filter((manager) => {
          if (notifiedUserIds.has(manager.id)) return false;
          notifiedUserIds.add(manager.id);
          return true;
        })
        .map((manager) =>
          this.notificationService.createForUser({
            userId: manager.id,
            title: 'Lịch thi đấu đã được công bố',
            message: `Lịch thi đấu mùa giải đã được BTC công bố cho ${seasonTeam.team.name}.`,
            type: 'SCHEDULE_CHANGE',
            entityType: 'season',
            entityId: seasonId,
          }),
        ),
    );

    await Promise.all(notifications);
  }
}

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { MatchLineupStatus, MatchOfficialRole, Prisma } from '@prisma/client';
import type { CurrentUserPayload } from '../auth';
import { MatchLineupService } from '../match-lineup/match-lineup.service';
import { NotificationService } from '../notification/notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegulationHelper } from '../regulation/regulation.helper';
import { StandingsService } from '../standings/standings.service';
import { AddMatchEventDto } from './dto/add-match-event.dto';
import { MatchGateway } from './match.gateway';

/** Fallback for max goal minute when no regulation is available */
const DEFAULT_MAX_GOAL_TIME = 96;

const MATCH_TEAM_SELECT = {
  id: true,
  name: true,
  shortName: true,
  logoUrl: true,
  coachName: true,
  status: true,
  stadium: { select: { id: true, name: true, city: true } },
};

// Valid match status transitions
const MATCH_STATUS_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['PUBLISHED', 'POSTPONED'],
  PUBLISHED: ['LOCKED', 'POSTPONED'],
  LOCKED: ['FINISHED'],
  FINISHED: [],
  POSTPONED: ['DRAFT'],
};

type FindAllMatchesPagination = {
  page?: number;
  limit?: number;
  round?: number;
  status?: string;
  teamId?: string;
  dateFrom?: string;
  dateTo?: string;
};

@Injectable()
export class MatchService {
  private readonly logger = new Logger(MatchService.name);

  constructor(
    private prisma: PrismaService,
    private standingsService: StandingsService,
    private regulationHelper: RegulationHelper,
    private matchGateway: MatchGateway,
    private notificationService: NotificationService,
    private matchLineupService: MatchLineupService,
  ) {}

  async getMatchById(id: string) {
    const match = await this.prisma.match.findUnique({
      where: { id },
      include: {
        homeTeam: { select: MATCH_TEAM_SELECT },
        awayTeam: { select: MATCH_TEAM_SELECT },
        stadium: { select: { id: true, name: true } },
        season: { select: { id: true, name: true } },
        events: {
          include: {
            player: { select: { id: true, fullName: true } },
            relatedPlayer: { select: { id: true, fullName: true } },
            team: { select: { id: true, name: true } },
          },
          orderBy: { minute: 'asc' },
        },
      },
    });

    if (!match) {
      throw new NotFoundException(`Không tìm thấy trận đấu với ID ${id}`);
    }

    return match;
  }

  async findAll(
    seasonId?: string,
    pagination?: FindAllMatchesPagination,
    extraWhere?: Prisma.MatchWhereInput,
  ) {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.MatchWhereInput = { ...extraWhere };
    if (seasonId) where.seasonId = seasonId;
    if (pagination?.round) where.roundNo = pagination.round;
    if (pagination?.status) where.status = pagination.status as never;
    if (pagination?.teamId) {
      where.OR = [
        { homeTeamId: pagination.teamId },
        { awayTeamId: pagination.teamId },
      ];
    }
    // Date range filter
    if (pagination?.dateFrom || pagination?.dateTo) {
      const kickoffFilter: Record<string, Date> = {};
      if (pagination?.dateFrom) {
        kickoffFilter.gte = new Date(pagination.dateFrom);
      }
      if (pagination?.dateTo) {
        kickoffFilter.lte = new Date(pagination.dateTo);
      }
      where.kickoffAt = kickoffFilter;
    }

    const [data, total] = await Promise.all([
      this.prisma.match.findMany({
        where,
        include: {
          homeTeam: { select: MATCH_TEAM_SELECT },
          awayTeam: { select: MATCH_TEAM_SELECT },
          stadium: { select: { id: true, name: true } },
        },
        orderBy: [{ roundNo: 'asc' }, { kickoffAt: 'asc' }],
        skip,
        take: limit,
      }),
      this.prisma.match.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAssignedToOfficial(
    user: CurrentUserPayload,
    seasonId?: string,
    pagination?: FindAllMatchesPagination,
  ) {
    const roles =
      user.role === 'SUPERVISOR'
        ? [MatchOfficialRole.SUPERVISOR]
        : [
            MatchOfficialRole.MAIN_REFEREE,
            MatchOfficialRole.ASSISTANT_REFEREE,
            MatchOfficialRole.FOURTH_OFFICIAL,
          ];

    return this.findAll(seasonId, pagination, {
      officialAssignments: {
        some: {
          role: { in: roles },
          official: {
            email: { equals: user.email, mode: 'insensitive' },
            status: 'ACTIVE',
          },
        },
      },
    });
  }

  async updateMatch(
    matchId: string,
    data: {
      stadiumId?: string | null;
      kickoffAt?: string | null;
      homeScore?: number | null;
      awayScore?: number | null;
    },
  ) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeam: { select: { status: true } },
        awayTeam: { select: { status: true } },
      },
    });

    if (!match) {
      throw new NotFoundException(`Không tìm thấy trận đấu với ID ${matchId}`);
    }

    const isScoreUpdate =
      data.homeScore !== undefined || data.awayScore !== undefined;

    // Block edits on FINISHED or LOCKED matches
    if (match.status === 'FINISHED' || match.status === 'LOCKED') {
      if (isScoreUpdate) {
        const reason =
          match.status === 'FINISHED'
            ? 'Trận đấu đã kết thúc nên không thể cập nhật tỉ số. Hãy mở lại trạng thái trận đấu trước khi chỉnh sửa tỉ số.'
            : 'Trận đấu đang khóa nên không thể cập nhật tỉ số. Hãy chuyển trạng thái trận đấu trước khi chỉnh sửa tỉ số.';
        throw new BadRequestException(reason);
      }

      throw new BadRequestException(
        `Không thể chỉnh sửa trận đấu ở trạng thái ${match.status}`,
      );
    }

    if (
      match.homeTeam.status === 'INACTIVE' ||
      match.awayTeam.status === 'INACTIVE'
    ) {
      throw new ForbiddenException(
        'CLB đang không hoạt động, không thể chỉnh sửa lịch thi đấu.',
      );
    }

    const updateData: Record<string, unknown> = {};
    if (data.stadiumId !== undefined) updateData.stadiumId = data.stadiumId;
    if (data.kickoffAt !== undefined)
      updateData.kickoffAt = data.kickoffAt ? new Date(data.kickoffAt) : null;
    if (data.homeScore !== undefined) updateData.homeScore = data.homeScore;
    if (data.awayScore !== undefined) updateData.awayScore = data.awayScore;
    if (isScoreUpdate) {
      updateData.scoreSource =
        data.homeScore === null && data.awayScore === null ? null : 'ADMIN';
    }

    const updatedMatch = await this.prisma.match.update({
      where: { id: matchId },
      data: updateData,
      include: {
        homeTeam: { select: MATCH_TEAM_SELECT },
        awayTeam: { select: MATCH_TEAM_SELECT },
        stadium: { select: { id: true, name: true } },
      },
    });

    if (
      updatedMatch.homeScore !== null &&
      updatedMatch.awayScore !== null &&
      isScoreUpdate
    ) {
      await this.prisma.matchReport.updateMany({
        where: { matchId },
        data: {
          homeScore: updatedMatch.homeScore,
          awayScore: updatedMatch.awayScore,
        },
      });
    }

    return updatedMatch;
  }

  async addEvent(matchId: string, dto: AddMatchEventDto) {
    // Check match exists
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException(`Không tìm thấy trận đấu với ID ${matchId}`);
    }

    // Block adding events to FINISHED matches
    if (match.status === 'FINISHED') {
      throw new BadRequestException(
        'Không thể thêm sự kiện vào trận đấu đã kết thúc',
      );
    }

    // Validate goal minute against MAX_GOAL_TIME regulation
    if (['GOAL', 'OWN_GOAL', 'PENALTY'].includes(dto.type) && match.seasonId) {
      const maxGoalTime = await this.regulationHelper.getNumericValue(
        match.seasonId,
        'MAX_GOAL_TIME',
        DEFAULT_MAX_GOAL_TIME,
      );

      if (dto.minute > maxGoalTime) {
        throw new BadRequestException(
          `Phút ghi bàn không được vượt quá ${maxGoalTime} (hiện tại: phút ${dto.minute})`,
        );
      }
    }

    await this.assertSingleRedCardPerPlayer(matchId, dto);

    // Create the event
    const event = await this.prisma.matchEvent.create({
      data: {
        matchId,
        minute: dto.minute,
        type: dto.type as never,
        playerId: dto.playerId,
        teamId: dto.teamId,
        note: dto.note,
        goalType: dto.goalType,
        relatedPlayerId: dto.relatedPlayerId,
      },
      include: {
        player: { select: { id: true, fullName: true } },
        relatedPlayer: { select: { id: true, fullName: true } },
        team: { select: { id: true, name: true } },
      },
    });

    // Update score if it's a goal (including penalty)
    if (
      dto.type === 'GOAL' ||
      dto.type === 'OWN_GOAL' ||
      dto.type === 'PENALTY'
    ) {
      await this.recalculateScore(matchId);
      // Emit live score update via WebSocket
      const updated = await this.prisma.match.findUnique({
        where: { id: matchId },
        select: { homeScore: true, awayScore: true },
      });
      if (updated) {
        this.matchGateway.emitScoreUpdate(matchId, updated);
      }
    }

    if (dto.type === 'RED_CARD' || dto.type === 'YELLOW_CARD') {
      await this.matchLineupService.syncSuspensionsForMatch(matchId);
    }

    // Emit live match event via WebSocket
    this.matchGateway.emitMatchEvent(
      matchId,
      event as unknown as Record<string, unknown>,
    );

    return {
      ok: true,
      matchId,
      createdEvent: event,
    };
  }

  async updateEvent(matchId: string, eventId: string, dto: AddMatchEventDto) {
    const event = await this.prisma.matchEvent.findFirst({
      where: { id: eventId, matchId },
    });

    if (!event) {
      throw new NotFoundException('Không tìm thấy sự kiện');
    }

    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException(`Không tìm thấy trận đấu với ID ${matchId}`);
    }

    if (match.status === 'FINISHED') {
      throw new BadRequestException(
        'Không thể cập nhật sự kiện của trận đấu đã kết thúc',
      );
    }

    if (['GOAL', 'OWN_GOAL', 'PENALTY'].includes(dto.type) && match.seasonId) {
      const maxGoalTime = await this.regulationHelper.getNumericValue(
        match.seasonId,
        'MAX_GOAL_TIME',
        DEFAULT_MAX_GOAL_TIME,
      );

      if (dto.minute > maxGoalTime) {
        throw new BadRequestException(
          `Phút ghi bàn không được vượt quá ${maxGoalTime} (hiện tại: phút ${dto.minute})`,
        );
      }
    }

    await this.assertSingleRedCardPerPlayer(matchId, dto, eventId);

    const updatedEvent = await this.prisma.matchEvent.update({
      where: { id: eventId },
      data: {
        minute: dto.minute,
        type: dto.type as never,
        playerId: dto.playerId ?? null,
        teamId: dto.teamId,
        note: dto.note ?? null,
        goalType: dto.goalType ?? null,
        relatedPlayerId: dto.relatedPlayerId ?? null,
      },
      include: {
        player: { select: { id: true, fullName: true } },
        relatedPlayer: { select: { id: true, fullName: true } },
        team: { select: { id: true, name: true } },
      },
    });

    const wasGoal = ['GOAL', 'OWN_GOAL', 'PENALTY'].includes(
      String(event.type),
    );
    const isGoal = ['GOAL', 'OWN_GOAL', 'PENALTY'].includes(dto.type);
    if (wasGoal || isGoal) {
      await this.recalculateScore(matchId);
      const updatedScore = await this.prisma.match.findUnique({
        where: { id: matchId },
        select: { homeScore: true, awayScore: true },
      });
      if (updatedScore) {
        this.matchGateway.emitScoreUpdate(matchId, updatedScore);
      }
    }

    const wasCard = ['YELLOW_CARD', 'RED_CARD'].includes(String(event.type));
    const isCard = ['YELLOW_CARD', 'RED_CARD'].includes(dto.type);
    if (wasCard || isCard) {
      await this.matchLineupService.syncSuspensionsForMatch(matchId);
    }

    this.matchGateway.emitMatchEvent(
      matchId,
      updatedEvent as unknown as Record<string, unknown>,
    );

    return {
      ok: true,
      matchId,
      updatedEvent,
    };
  }

  async removeEvent(matchId: string, eventId: string) {
    const event = await this.prisma.matchEvent.findFirst({
      where: { id: eventId, matchId },
    });

    if (!event) {
      throw new NotFoundException('Không tìm thấy sự kiện');
    }

    // Block removing events from FINISHED matches
    const eventMatch = await this.prisma.match.findUnique({
      where: { id: matchId },
      select: { status: true },
    });
    if (eventMatch?.status === 'FINISHED') {
      throw new BadRequestException(
        'Không thể xóa sự kiện của trận đấu đã kết thúc',
      );
    }

    await this.prisma.matchEvent.delete({
      where: { id: eventId },
    });

    // Recalculate score if it was a goal (including penalty)
    if (
      event.type === 'GOAL' ||
      event.type === 'OWN_GOAL' ||
      event.type === 'PENALTY'
    ) {
      await this.recalculateScore(matchId);
      // Emit live score update via WebSocket
      const updated = await this.prisma.match.findUnique({
        where: { id: matchId },
        select: { homeScore: true, awayScore: true },
      });
      if (updated) {
        this.matchGateway.emitScoreUpdate(matchId, updated);
      }
    }

    if (event.type === 'YELLOW_CARD' || event.type === 'RED_CARD') {
      await this.matchLineupService.syncSuspensionsForMatch(matchId);
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
        type: { in: ['GOAL', 'OWN_GOAL', 'PENALTY'] },
      },
    });

    let homeScore = 0;
    let awayScore = 0;

    for (const goal of goals) {
      if (goal.type === 'GOAL' || goal.type === 'PENALTY') {
        // Regular goal or penalty: team that scored gets the point
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

  private async assertSingleRedCardPerPlayer(
    matchId: string,
    dto: AddMatchEventDto,
    excludeEventId?: string,
  ) {
    if (dto.type !== 'RED_CARD' || !dto.playerId) return;

    const duplicate = await this.prisma.matchEvent.findFirst({
      where: {
        matchId,
        playerId: dto.playerId,
        type: 'RED_CARD' as never,
        ...(excludeEventId ? { id: { not: excludeEventId } } : {}),
      },
      select: { id: true },
    });

    if (duplicate) {
      throw new BadRequestException(
        'Cầu thủ này đã nhận thẻ đỏ trong trận đấu này. Mỗi cầu thủ chỉ được nhận tối đa 1 thẻ đỏ trong 1 trận.',
      );
    }
  }

  /**
   * Update match status with state machine enforcement
   */
  async updateStatus(matchId: string, newStatus: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException(`Không tìm thấy trận đấu với ID ${matchId}`);
    }

    const currentStatus = match.status;
    const allowedTransitions = MATCH_STATUS_TRANSITIONS[currentStatus] ?? [];

    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Không thể chuyển trạng thái từ ${currentStatus} sang ${newStatus}. ` +
          `Trạng thái hợp lệ: ${allowedTransitions.length ? allowedTransitions.join(', ') : 'không có'}`,
      );
    }

    if (newStatus === 'LOCKED') {
      await this.assertCanLockMatch(match);
    }

    // Validate that scores are set before transitioning to FINISHED
    if (newStatus === 'FINISHED') {
      if (match.homeScore === null || match.awayScore === null) {
        throw new BadRequestException(
          'Phải có tỷ số trước khi kết thúc trận đấu',
        );
      }
      await this.assertCanFinishMatch(matchId);
    }

    const updated = await this.prisma.match.update({
      where: { id: matchId },
      data: { status: newStatus as never },
      include: {
        homeTeam: { select: MATCH_TEAM_SELECT },
        awayTeam: { select: MATCH_TEAM_SELECT },
      },
    });

    // Trigger standings recalculation when match finishes
    if (newStatus === 'FINISHED' && match.seasonId) {
      try {
        await this.matchLineupService.markServedSuspensionsForMatch(matchId);
        await this.matchLineupService.syncSuspensionsForMatch(matchId);
        await this.standingsService.getStandings(match.seasonId);
        this.logger.log(
          `Standings recalculated for season ${match.seasonId} after match ${matchId} finished`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to recalculate standings for season ${match.seasonId}`,
          error,
        );
      }
    }

    // Emit live status change via WebSocket
    this.matchGateway.emitStatusChange(matchId, {
      status: newStatus,
      homeTeam: updated.homeTeam,
      awayTeam: updated.awayTeam,
    });

    // Send notifications
    const homeName = updated.homeTeam?.name ?? 'Đội nhà';
    const awayName = updated.awayTeam?.name ?? 'Đội khách';

    this.notificationService
      .notifyMatchStatusChange(matchId, homeName, awayName, newStatus)
      .catch((err) =>
        this.logger.error('Failed to send status notification', err),
      );

    if (
      newStatus === 'FINISHED' &&
      match.homeScore != null &&
      match.awayScore != null
    ) {
      this.notificationService
        .notifyMatchResult(
          matchId,
          homeName,
          awayName,
          match.homeScore,
          match.awayScore,
        )
        .catch((err) =>
          this.logger.error('Failed to send result notification', err),
        );
    }

    return updated;
  }

  private async assertCanLockMatch(match: {
    id: string;
    homeTeamId: string;
    awayTeamId: string;
  }) {
    const refereeRoles: MatchOfficialRole[] = [
      MatchOfficialRole.MAIN_REFEREE,
      MatchOfficialRole.ASSISTANT_REFEREE,
      MatchOfficialRole.FOURTH_OFFICIAL,
    ];
    const [
      approvedLineupCount,
      refereeAssignmentCount,
      supervisorCount,
      officialAssignments,
    ] = await Promise.all([
      this.prisma.matchTeamRegistration.count({
        where: {
          matchId: match.id,
          teamId: { in: [match.homeTeamId, match.awayTeamId] },
          status: MatchLineupStatus.APPROVED,
        },
      }),
      this.prisma.matchOfficialAssignment.count({
        where: {
          matchId: match.id,
          role: { in: refereeRoles },
          official: { status: 'ACTIVE' },
        },
      }),
      this.prisma.matchOfficialAssignment.count({
        where: {
          matchId: match.id,
          role: MatchOfficialRole.SUPERVISOR,
          official: { status: 'ACTIVE' },
        },
      }),
      this.prisma.matchOfficialAssignment.findMany({
        where: {
          matchId: match.id,
          role: {
            in: [...refereeRoles, MatchOfficialRole.SUPERVISOR],
          },
          official: { status: 'ACTIVE' },
        },
        select: { officialId: true, role: true },
      }),
    ]);

    if (approvedLineupCount < 2) {
      throw new BadRequestException(
        'Phải có đội hình đã được BTC duyệt cho cả hai đội trước khi khóa trận.',
      );
    }

    if (refereeAssignmentCount === 0) {
      throw new BadRequestException(
        'Phải phân công trọng tài trước khi khóa trận.',
      );
    }

    if (supervisorCount === 0) {
      throw new BadRequestException(
        'Phải phân công giám sát trước khi khóa trận.',
      );
    }

    const refereeOfficialIds = new Set(
      (officialAssignments ?? [])
        .filter((assignment) => refereeRoles.includes(assignment.role))
        .map((assignment) => assignment.officialId),
    );
    const supervisorAlsoReferee = (officialAssignments ?? []).some(
      (assignment) =>
        assignment.role === MatchOfficialRole.SUPERVISOR &&
        refereeOfficialIds.has(assignment.officialId),
    );

    if (supervisorAlsoReferee) {
      throw new BadRequestException(
        'Trọng tài và giám sát phải là 2 người khác nhau trước khi khóa trận.',
      );
    }
  }

  private async assertCanFinishMatch(matchId: string) {
    const [matchReport, disciplineReport] = await Promise.all([
      this.prisma.matchReport.findUnique({
        where: { matchId },
        select: { id: true },
      }),
      this.prisma.disciplineReport.findUnique({
        where: { matchId },
        select: { id: true },
      }),
    ]);

    if (!matchReport) {
      throw new BadRequestException(
        'Phải có biên bản trọng tài trước khi kết thúc trận đấu.',
      );
    }

    if (!disciplineReport) {
      throw new BadRequestException(
        'Phải có báo cáo giám sát trước khi kết thúc trận đấu.',
      );
    }
  }
}

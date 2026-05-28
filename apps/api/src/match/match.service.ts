import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { MatchLineupService } from '../match-lineup/match-lineup.service';
import { NotificationService } from '../notification/notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegulationHelper } from '../regulation/regulation.helper';
import { StandingsService } from '../standings/standings.service';
import { AddMatchEventDto } from './dto/add-match-event.dto';
import { MatchGateway } from './match.gateway';

/** Fallback for max goal minute when no regulation is available */
const DEFAULT_MAX_GOAL_TIME = 96;

// Valid match status transitions
const MATCH_STATUS_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['PUBLISHED', 'POSTPONED'],
  PUBLISHED: ['LOCKED', 'POSTPONED'],
  LOCKED: ['FINISHED'],
  FINISHED: [],
  POSTPONED: ['DRAFT'],
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
        homeTeam: { select: { id: true, name: true, logoUrl: true } },
        awayTeam: { select: { id: true, name: true, logoUrl: true } },
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
    pagination?: {
      page?: number;
      limit?: number;
      round?: number;
      status?: string;
      teamId?: string;
      dateFrom?: string;
      dateTo?: string;
    },
  ) {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (seasonId) where.seasonId = seasonId;
    if (pagination?.round) where.roundNo = pagination.round;
    if (pagination?.status) where.status = pagination.status;
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
          homeTeam: { select: { id: true, name: true, logoUrl: true } },
          awayTeam: { select: { id: true, name: true, logoUrl: true } },
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
    });

    if (!match) {
      throw new NotFoundException(`Không tìm thấy trận đấu với ID ${matchId}`);
    }

    // Block edits on FINISHED or LOCKED matches
    if (match.status === 'FINISHED' || match.status === 'LOCKED') {
      throw new BadRequestException(
        `Không thể chỉnh sửa trận đấu ở trạng thái ${match.status}`,
      );
    }

    const updateData: Record<string, unknown> = {};
    if (data.stadiumId !== undefined) updateData.stadiumId = data.stadiumId;
    if (data.kickoffAt !== undefined)
      updateData.kickoffAt = data.kickoffAt ? new Date(data.kickoffAt) : null;
    if (data.homeScore !== undefined) updateData.homeScore = data.homeScore;
    if (data.awayScore !== undefined) updateData.awayScore = data.awayScore;

    return this.prisma.match.update({
      where: { id: matchId },
      data: updateData,
      include: {
        homeTeam: { select: { id: true, name: true, logoUrl: true } },
        awayTeam: { select: { id: true, name: true, logoUrl: true } },
        stadium: { select: { id: true, name: true } },
      },
    });
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

    // Validate that scores are set before transitioning to FINISHED
    if (newStatus === 'FINISHED') {
      if (match.homeScore === null || match.awayScore === null) {
        throw new BadRequestException(
          'Phải có tỷ số trước khi kết thúc trận đấu',
        );
      }
    }

    const updated = await this.prisma.match.update({
      where: { id: matchId },
      data: { status: newStatus as never },
      include: {
        homeTeam: { select: { id: true, name: true, logoUrl: true } },
        awayTeam: { select: { id: true, name: true, logoUrl: true } },
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
}

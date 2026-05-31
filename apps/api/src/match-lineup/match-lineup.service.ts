import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  EventType,
  MatchLineupRole,
  MatchLineupStatus,
  MatchStatus,
  PlayerSuspensionStatus,
  Prisma,
} from '@prisma/client';
import { NotificationService } from '../notification/notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegulationHelper } from '../regulation/regulation.helper';
import {
  TeamManagerScopeService,
  type TeamScopeActor,
} from '../team-manager/team-manager-scope.service';
import {
  ReviewMatchLineupDto,
  SubmitMatchLineupDto,
} from './dto/match-lineup.dto';

const REQUIRED_LINEUP_SIZE = 16;
const REQUIRED_STARTERS = 11;
const REQUIRED_SUBSTITUTES = 5;
const DEFAULT_MAX_FOREIGN_ON_FIELD = 3;

@Injectable()
export class MatchLineupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly regulationHelper: RegulationHelper,
    private readonly teamManagerScope: TeamManagerScopeService,
    private readonly notificationService: NotificationService,
  ) {}

  async listLineups(matchId: string) {
    await this.ensureMatch(matchId);

    return this.prisma.matchTeamRegistration.findMany({
      where: { matchId },
      include: this.registrationInclude,
      orderBy: { submittedAt: 'asc' },
    });
  }

  async submitLineup(
    matchId: string,
    dto: SubmitMatchLineupDto,
    actor?: TeamScopeActor,
  ) {
    this.assertLineupShape(dto);
    if (actor) {
      await this.teamManagerScope.assertCanManageTeam(actor, dto.teamId);
    }

    const match = await this.ensureMatch(matchId);
    this.assertCanSubmitLineup(match.status);
    if (dto.teamId !== match.homeTeamId && dto.teamId !== match.awayTeamId) {
      throw new BadRequestException(
        'Chỉ hai đội tham gia trận đấu mới được đăng ký đội hình.',
      );
    }

    this.assertFormation(dto.formation);

    const playerIds = dto.players.map((player) => player.playerId);
    const rosterRows = await this.prisma.teamPlayer.findMany({
      where: {
        teamId: dto.teamId,
        playerId: { in: playerIds },
        OR: [
          { leftAt: null },
          { leftAt: { gt: match.kickoffAt ?? new Date() } },
        ],
      },
      include: {
        player: {
          select: {
            id: true,
            fullName: true,
            playerType: true,
            nationality: true,
          },
        },
      },
    });

    if (rosterRows.length !== REQUIRED_LINEUP_SIZE) {
      throw new BadRequestException(
        'Tất cả cầu thủ đăng ký phải thuộc danh sách cầu thủ hiện tại của CLB.',
      );
    }

    const suspendedPlayers = await this.prisma.playerSuspension.findMany({
      where: {
        teamId: dto.teamId,
        effectiveMatchId: matchId,
        status: PlayerSuspensionStatus.ACTIVE,
        playerId: { in: playerIds },
      },
      select: { playerId: true, reason: true },
    });

    if (suspendedPlayers.length > 0) {
      throw new BadRequestException(
        `Cầu thủ đang bị treo giò: ${suspendedPlayers
          .map((player) => player.playerId)
          .join(', ')}`,
      );
    }

    const maxForeignOnField = await this.regulationHelper.getNumericValue(
      match.seasonId ?? '',
      'MAX_FOREIGN_PLAYERS_ON_FIELD',
      DEFAULT_MAX_FOREIGN_ON_FIELD,
    );
    const rosterByPlayerId = new Map(
      rosterRows.map((row) => [row.playerId, row.player]),
    );
    const foreignStarterCount = dto.players.filter((player) => {
      if (player.role !== MatchLineupRole.STARTER) return false;
      const rosterPlayer = rosterByPlayerId.get(player.playerId);
      return (
        rosterPlayer?.playerType === 'FOREIGN' ||
        this.isForeignNationality(rosterPlayer?.nationality)
      );
    }).length;

    if (foreignStarterCount > maxForeignOnField) {
      throw new BadRequestException(
        `Đội hình chính chỉ được có tối đa ${maxForeignOnField} cầu thủ ngoại.`,
      );
    }

    const lineupPlayers = dto.players.map((player) => ({
      playerId: player.playerId,
      role: player.role as MatchLineupRole,
      position: player.position,
      shirtNumber: player.shirtNumber,
    }));

    const registration = await this.prisma.matchTeamRegistration.upsert({
      where: { matchId_teamId: { matchId, teamId: dto.teamId } },
      create: {
        matchId,
        teamId: dto.teamId,
        kitType: dto.kitType,
        formation: dto.formation,
        status: MatchLineupStatus.SUBMITTED,
        submittedAt: new Date(),
        lineupPlayers: { create: lineupPlayers },
      },
      update: {
        kitType: dto.kitType,
        formation: dto.formation,
        status: MatchLineupStatus.SUBMITTED,
        submittedAt: new Date(),
        reviewedAt: null,
        reviewNote: null,
        lineupPlayers: {
          deleteMany: {},
          create: lineupPlayers,
        },
      },
      include: this.registrationInclude,
    });

    if (actor?.role === 'TEAM_MANAGER') {
      await this.notificationService.notifyAdmins({
        title: 'CLB nộp đội hình',
        message: `${registration.team?.name ?? 'CLB'} đã nộp danh sách đăng ký thi đấu cho trận này. Vui lòng kiểm tra và xét duyệt.`,
        type: 'SYSTEM',
        entityType: 'match',
        entityId: matchId,
      });
    }

    return registration;
  }

  async reviewLineup(
    matchId: string,
    teamId: string,
    dto: ReviewMatchLineupDto,
  ) {
    const match = await this.ensureMatch(matchId);
    this.assertCanReviewLineup(match.status);

    const existing = await this.prisma.matchTeamRegistration.findUnique({
      where: { matchId_teamId: { matchId, teamId } },
      include: {
        team: {
          select: {
            name: true,
            managedUsers: { select: { id: true } },
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Không tìm thấy danh sách đăng ký thi đấu.');
    }

    if (existing.status !== MatchLineupStatus.SUBMITTED) {
      throw new BadRequestException(
        'Chỉ được xét duyệt danh sách đang chờ duyệt.',
      );
    }

    const reviewNote = dto.reviewNote?.trim();
    if (dto.status === MatchLineupStatus.REJECTED && !reviewNote) {
      throw new BadRequestException(
        'Vui lòng nhập lý do từ chối để CLB có thể nộp lại.',
      );
    }

    const registration = await this.prisma.matchTeamRegistration.update({
      where: { matchId_teamId: { matchId, teamId } },
      data: {
        status: dto.status as MatchLineupStatus,
        reviewedAt: new Date(),
        reviewNote: reviewNote || null,
      },
      include: this.registrationInclude,
    });

    if (dto.status === MatchLineupStatus.REJECTED && reviewNote) {
      await this.notifyLineupRejected(
        registration.id,
        existing.team,
        reviewNote,
      );
    }

    return registration;
  }

  async listSuspensions(matchId: string) {
    await this.ensureMatch(matchId);

    return this.prisma.playerSuspension.findMany({
      where: {
        effectiveMatchId: matchId,
        status: PlayerSuspensionStatus.ACTIVE,
      },
      include: {
        player: { select: { id: true, fullName: true } },
        team: { select: { id: true, name: true } },
        sourceMatch: { select: { id: true, roundNo: true } },
      },
      orderBy: [{ teamId: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async markServedSuspensionsForMatch(matchId: string) {
    await this.prisma.playerSuspension.updateMany({
      where: {
        effectiveMatchId: matchId,
        status: PlayerSuspensionStatus.ACTIVE,
      },
      data: {
        status: PlayerSuspensionStatus.SERVED,
        servedAt: new Date(),
      },
    });
  }

  async syncSuspensionsForMatch(matchId: string) {
    const match = await this.ensureMatch(matchId);
    if (!match.seasonId) return;

    const cardEvents = await this.prisma.matchEvent.findMany({
      where: {
        matchId,
        type: { in: [EventType.YELLOW_CARD, EventType.RED_CARD] },
        playerId: { not: null },
        teamId: { not: null },
      },
      select: {
        type: true,
        playerId: true,
        teamId: true,
      },
    });

    for (const event of cardEvents) {
      if (!event.playerId || !event.teamId) continue;

      if (event.type === EventType.RED_CARD) {
        await this.createSuspension(
          match,
          event.playerId,
          event.teamId,
          'RED_CARD',
        );
        continue;
      }

      const yellowCount = await this.countSeasonYellowCards(
        match.seasonId,
        event.playerId,
        event.teamId,
      );
      if (yellowCount > 0 && yellowCount % 2 === 0) {
        await this.createSuspension(
          match,
          event.playerId,
          event.teamId,
          'ACCUMULATED_YELLOW_CARDS',
        );
      }
    }
  }

  private get registrationInclude() {
    return {
      team: {
        select: { id: true, name: true, shortName: true, logoUrl: true },
      },
      lineupPlayers: {
        include: {
          player: {
            select: {
              id: true,
              fullName: true,
              position: true,
              playerType: true,
              nationality: true,
            },
          },
        },
        orderBy: [
          { role: 'asc' },
          { shirtNumber: 'asc' },
          { createdAt: 'asc' },
        ],
      },
    } satisfies Prisma.MatchTeamRegistrationInclude;
  }

  private async ensureMatch(matchId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });
    if (!match) {
      throw new NotFoundException('Không tìm thấy trận đấu.');
    }
    return match;
  }

  private assertCanSubmitLineup(status: MatchStatus) {
    if (status !== MatchStatus.PUBLISHED) {
      throw new BadRequestException(
        'Chỉ được nộp danh sách đăng ký khi trận đang mở.',
      );
    }
  }

  private assertCanReviewLineup(status: MatchStatus) {
    if (status === MatchStatus.FINISHED) {
      throw new BadRequestException(
        'Không thể xét duyệt đội hình khi trận đã kết thúc.',
      );
    }
  }

  private assertLineupShape(dto: SubmitMatchLineupDto) {
    if (dto.players.length !== REQUIRED_LINEUP_SIZE) {
      throw new BadRequestException(
        `Mỗi đội phải đăng ký đúng ${REQUIRED_LINEUP_SIZE} cầu thủ cho trận đấu.`,
      );
    }

    const uniquePlayerIds = new Set(
      dto.players.map((player) => player.playerId),
    );
    if (uniquePlayerIds.size !== dto.players.length) {
      throw new BadRequestException('Danh sách đăng ký có cầu thủ bị trùng.');
    }

    const starters = dto.players.filter(
      (player) => player.role === MatchLineupRole.STARTER,
    );
    const substitutes = dto.players.filter(
      (player) => player.role === MatchLineupRole.SUBSTITUTE,
    );

    if (
      starters.length !== REQUIRED_STARTERS ||
      substitutes.length !== REQUIRED_SUBSTITUTES
    ) {
      throw new BadRequestException(
        `Đội hình phải gồm đúng ${REQUIRED_STARTERS} chính thức và ${REQUIRED_SUBSTITUTES} dự bị.`,
      );
    }
  }

  private assertFormation(formation: string) {
    const parts = formation.split('-').map((part) => Number(part));
    if (parts.some((part) => !Number.isInteger(part) || part <= 0)) {
      throw new BadRequestException(
        'Sơ đồ thi đấu phải có định dạng như 4-4-2 hoặc 4-2-3-1.',
      );
    }

    const outfieldCount = parts.reduce((sum, part) => sum + part, 0);
    if (outfieldCount !== 10) {
      throw new BadRequestException(
        'Sơ đồ thi đấu phải có tổng 10 cầu thủ ngoài thủ môn.',
      );
    }
  }

  private isForeignNationality(nationality?: string | null) {
    if (!nationality) return false;
    const normalized = nationality
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();

    return normalized !== 'viet nam' && normalized !== 'vietnam';
  }

  private async notifyLineupRejected(
    registrationId: string,
    team: { name: string; managedUsers: Array<{ id: string }> },
    reviewNote: string,
  ) {
    await Promise.all(
      team.managedUsers.map((manager) =>
        this.notificationService.createForUser({
          userId: manager.id,
          title: 'Đội hình bị từ chối',
          message: `Danh sách đăng ký thi đấu của ${team.name} bị từ chối: ${reviewNote}. Vui lòng chỉnh sửa và nộp lại.`,
          type: 'SYSTEM',
          entityType: 'match_lineup',
          entityId: registrationId,
        }),
      ),
    );
  }

  private async countSeasonYellowCards(
    seasonId: string,
    playerId: string,
    teamId: string,
  ) {
    return this.prisma.matchEvent.count({
      where: {
        type: EventType.YELLOW_CARD,
        playerId,
        teamId,
        match: { seasonId },
      },
    });
  }

  private async createSuspension(
    match: { id: string; seasonId: string | null; roundNo: number },
    playerId: string,
    teamId: string,
    reason: string,
  ) {
    if (!match.seasonId) return;

    const nextMatch = await this.prisma.match.findFirst({
      where: {
        seasonId: match.seasonId,
        roundNo: { gt: match.roundNo },
        OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
      },
      orderBy: [{ roundNo: 'asc' }, { kickoffAt: 'asc' }],
      select: { id: true },
    });

    if (!nextMatch) return;

    await this.prisma.playerSuspension.upsert({
      where: {
        playerId_sourceMatchId_reason: {
          playerId,
          sourceMatchId: match.id,
          reason,
        },
      },
      create: {
        playerId,
        teamId,
        seasonId: match.seasonId,
        sourceMatchId: match.id,
        effectiveMatchId: nextMatch.id,
        reason,
        status: PlayerSuspensionStatus.ACTIVE,
      },
      update: {
        effectiveMatchId: nextMatch.id,
        status: PlayerSuspensionStatus.ACTIVE,
        servedAt: null,
      },
    });
  }
}

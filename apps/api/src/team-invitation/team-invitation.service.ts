import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  PromotionCandidateStatus,
  PromotionQualificationType,
  Season,
  SeasonTeamStatus,
  TeamInvitationSourceType,
  TeamInvitationStatus,
  UserRole,
} from '@prisma/client';
import { NotificationService } from '../notification/notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { isForeignPlayer } from '../common/utils/foreign-player.util';
import { DEFAULT_REGULATIONS } from '../regulation/regulation.service';
import {
  StandingsService,
  type TeamStanding,
} from '../standings/standings.service';
import {
  ImportPromotionCandidatesDto,
  RespondTeamInvitationDto,
  SendTeamInvitationDto,
  UpsertPromotionCandidateDto,
} from './dto/team-invitation.dto';

const RESPONSE_STATUSES = [
  TeamInvitationStatus.ACCEPTED,
  TeamInvitationStatus.DECLINED,
] as const;

type InvitationCandidate = {
  teamId: string;
  teamName: string;
  sourceType: TeamInvitationSourceType;
  sourceRank: number;
  points: number;
  goalDifference: number;
  played: number;
  invitationId: string | null;
  invitationStatus: TeamInvitationStatus | null;
  responseReason: string | null;
  deadlineAt: Date | null;
  sourceCompetition?: string | null;
  qualificationType?: PromotionQualificationType | null;
  promotionStatus?: PromotionCandidateStatus | null;
  sourceNote?: string | null;
  team: {
    id: string;
    name: string;
    shortName: string | null;
    city: string | null;
    logoUrl: string | null;
    status: string;
  } | null;
};
type TeamSummary = NonNullable<InvitationCandidate['team']>;
type PromotionCandidateWithTeam = Prisma.PromotionCandidateGetPayload<{
  include: {
    team: {
      select: {
        id: true;
        name: true;
        shortName: true;
        city: true;
        logoUrl: true;
        status: true;
      };
    };
  };
}>;
type ResolvedPromotionImportRow = {
  teamId: string;
  rank: number;
  sourceCompetition: string;
  qualificationType: PromotionQualificationType;
  status: PromotionCandidateStatus;
  note: string | null;
};
type InvitationForCompliance = {
  teamId: string;
  regulationsSnapshot: Prisma.JsonValue | null;
};

@Injectable()
export class TeamInvitationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly standingsService: StandingsService,
  ) {}

  private invitationInclude = {
    season: {
      select: {
        id: true,
        name: true,
        year: true,
        status: true,
        startDate: true,
        endDate: true,
      },
    },
    team: {
      select: {
        id: true,
        name: true,
        shortName: true,
        city: true,
        logoUrl: true,
      },
    },
  } satisfies Prisma.TeamInvitationInclude;

  private managerAssignmentInclude = {
    user: { select: { id: true, email: true, name: true } },
  } satisfies Prisma.TeamManagerAssignmentInclude;

  private teamSummarySelect = {
    id: true,
    name: true,
    shortName: true,
    city: true,
    logoUrl: true,
    status: true,
  } satisfies Prisma.TeamSelect;

  private promotionCandidateInclude = {
    team: { select: this.teamSummarySelect },
  } satisfies Prisma.PromotionCandidateInclude;

  async listForSeason(seasonId: string) {
    await this.ensureSeasonExists(seasonId);
    await this.markExpiredInvitations({ seasonId });

    return this.prisma.teamInvitation.findMany({
      where: { seasonId },
      include: this.invitationInclude,
      orderBy: [{ sentAt: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async getInvitationCandidates(
    seasonId: string,
    previousSeasonId?: string,
  ): Promise<{
    targetSeason: Season;
    previousSeason: Season;
    requiredTopLeagueSlots: number;
    requiredPromotedSlots: number;
    candidates: InvitationCandidate[];
  }> {
    const targetSeason = await this.ensureSeasonExists(seasonId);
    await this.markExpiredInvitations({ seasonId });
    const previousSeason = previousSeasonId
      ? await this.prisma.season.findUnique({ where: { id: previousSeasonId } })
      : await this.prisma.season.findFirst({
          where: {
            status: 'COMPLETED',
            year: { lt: targetSeason.year },
          },
          orderBy: { year: 'desc' },
        });

    if (!previousSeason) {
      throw new NotFoundException(
        'Không tìm thấy mùa giải trước để sinh danh sách top 8.',
      );
    }

    if (previousSeason.status !== 'COMPLETED') {
      throw new BadRequestException(
        `Mùa giải "${previousSeason.name}" chưa kết thúc. Cần chốt COMPLETED trước khi sinh danh sách top 8 mùa trước.`,
      );
    }

    const standings = await this.standingsService.getStandings(
      previousSeason.id,
      'final',
    );
    const topLeagueSlots = 8;
    const promotedSlots = 2;
    const topStandings = standings.slice(0, topLeagueSlots);

    if (topStandings.length < topLeagueSlots) {
      throw new BadRequestException(
        `BXH cuối mùa "${previousSeason.name}" chưa đủ ${topLeagueSlots} đội để sinh danh sách mời.`,
      );
    }

    const topLeagueCandidates = await this.buildTopLeagueCandidates(
      seasonId,
      topStandings,
    );
    const promotedCandidates = await this.buildPromotedCandidates(
      seasonId,
      topStandings.map((standing) => standing.teamId),
      promotedSlots,
    );

    return {
      targetSeason,
      previousSeason,
      requiredTopLeagueSlots: topLeagueSlots,
      requiredPromotedSlots: promotedSlots,
      candidates: [...topLeagueCandidates, ...promotedCandidates],
    };
  }

  async sendInvitation(seasonId: string, dto: SendTeamInvitationDto) {
    const [season, team] = await Promise.all([
      this.ensureSeasonExists(seasonId),
      this.ensureTeamExists(dto.teamId),
    ]);

    const managerAssignments =
      await this.resolveManagerAssignmentsForInvitation(seasonId, dto.teamId);

    if (managerAssignments.length === 0) {
      throw new BadRequestException(
        'CLB này chưa có Manager được Admin duyệt nên chưa thể gửi popup lời mời.',
      );
    }

    const sentAt = new Date();
    const deadlineAt = this.addDays(sentAt, 14);
    const regulationsSnapshot = await this.buildRegulationsSnapshot(seasonId);

    const promotionNote =
      dto.sourceType === TeamInvitationSourceType.PROMOTED
        ? dto.promotionNote?.trim() || null
        : null;

    const invitation = await this.prisma.teamInvitation.upsert({
      where: { seasonId_teamId: { seasonId, teamId: dto.teamId } },
      create: {
        seasonId,
        teamId: dto.teamId,
        sourceType: dto.sourceType,
        status: TeamInvitationStatus.SENT,
        sentAt,
        deadlineAt,
        regulationsSnapshot,
        promotionNote,
      },
      update: {
        sourceType: dto.sourceType,
        status: TeamInvitationStatus.SENT,
        sentAt,
        deadlineAt,
        responseAt: null,
        responseReason: null,
        regulationsSnapshot,
        promotionNote,
      },
      include: this.invitationInclude,
    });

    if (dto.sourceType === TeamInvitationSourceType.PROMOTED) {
      await this.prisma.promotionCandidate.updateMany({
        where: { seasonId, teamId: dto.teamId },
        data: { status: PromotionCandidateStatus.INVITED },
      });
    }

    const message = this.buildNotificationMessage(
      season.name,
      team.name,
      deadlineAt,
      regulationsSnapshot,
    );

    await Promise.all(
      managerAssignments.map((assignment) =>
        this.notificationService.createForUser({
          userId: assignment.userId,
          title: `Lời mời tham dự ${season.name}`,
          message,
          type: 'TEAM_INVITATION',
          entityType: 'team_invitation',
          entityId: invitation.id,
        }),
      ),
    );

    return invitation;
  }

  async getReplacementCandidates(seasonId: string) {
    await this.ensureSeasonExists(seasonId);
    await this.markExpiredInvitations({ seasonId });

    const TOTAL_REQUIRED = 10;

    // Count distinct teams that are already accepted and/or approved.
    const [acceptedInvitations, approvedTeams] = await Promise.all([
      this.prisma.teamInvitation.findMany({
        where: { seasonId, status: TeamInvitationStatus.ACCEPTED },
        select: { teamId: true },
      }),
      this.prisma.seasonTeam.findMany({
        where: { seasonId, status: SeasonTeamStatus.APPROVED },
        select: { teamId: true },
      }),
    ]);
    const filledTeamIds = new Set([
      ...acceptedInvitations.map((invitation) => invitation.teamId),
      ...approvedTeams.map((seasonTeam) => seasonTeam.teamId),
    ]);
    const filledSlots = filledTeamIds.size;
    const slotsNeeded = Math.max(0, TOTAL_REQUIRED - filledSlots);

    // Teams that declined or expired
    const declinedExpiredInvitations =
      await this.prisma.teamInvitation.findMany({
        where: {
          seasonId,
          status: {
            in: [TeamInvitationStatus.DECLINED, TeamInvitationStatus.EXPIRED],
          },
        },
        include: this.invitationInclude,
        orderBy: { responseAt: 'desc' },
      });

    // All team IDs already involved in this season
    const involvedTeamIds = new Set(
      (
        await this.prisma.teamInvitation.findMany({
          where: { seasonId },
          select: { teamId: true },
        })
      ).map((i) => i.teamId),
    );
    // Also add season teams that were registered directly
    const seasonTeamIds = (
      await this.prisma.seasonTeam.findMany({
        where: { seasonId },
        select: { teamId: true },
      })
    ).map((st) => st.teamId);
    for (const id of seasonTeamIds) involvedTeamIds.add(id);

    const promotionCandidates = await this.prisma.promotionCandidate.findMany({
      where: {
        seasonId,
        status: PromotionCandidateStatus.ELIGIBLE,
        teamId: { notIn: [...involvedTeamIds] },
      },
      include: this.promotionCandidateInclude,
      orderBy: [{ rank: 'asc' }, { createdAt: 'asc' }],
    });
    const promotionCandidateTeamIds = promotionCandidates.map(
      (candidate) => candidate.teamId,
    );

    // Available teams: promotion ranking first, then other ACTIVE teams.
    const otherActiveTeams = await this.prisma.team.findMany({
      where: {
        status: 'ACTIVE',
        id: { notIn: [...involvedTeamIds, ...promotionCandidateTeamIds] },
      },
      select: this.teamSummarySelect,
      orderBy: { name: 'asc' },
    });
    const candidates = [
      ...promotionCandidates.map((candidate) => ({
        ...candidate.team,
        promotionRank: candidate.rank,
        sourceCompetition: candidate.sourceCompetition,
        qualificationType: candidate.qualificationType,
        promotionStatus: candidate.status,
        sourceNote: candidate.note,
      })),
      ...otherActiveTeams,
    ];

    return {
      totalRequired: TOTAL_REQUIRED,
      filledSlots,
      slotsNeeded,
      declinedTeams: declinedExpiredInvitations,
      candidates,
    };
  }

  async listPromotionCandidates(seasonId: string) {
    await this.ensureSeasonExists(seasonId);

    return this.prisma.promotionCandidate.findMany({
      where: { seasonId },
      include: this.promotionCandidateInclude,
      orderBy: [{ rank: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async upsertPromotionCandidate(
    seasonId: string,
    dto: UpsertPromotionCandidateDto,
  ) {
    await Promise.all([
      this.ensureSeasonExists(seasonId),
      this.ensureTeamExists(dto.teamId),
    ]);

    const sourceCompetition = dto.sourceCompetition.trim();
    if (!sourceCompetition) {
      throw new BadRequestException('Vui lòng nhập nguồn giải thăng hạng.');
    }

    return this.prisma.promotionCandidate.upsert({
      where: {
        seasonId_teamId: {
          seasonId,
          teamId: dto.teamId,
        },
      },
      create: {
        seasonId,
        teamId: dto.teamId,
        rank: dto.rank,
        sourceCompetition,
        qualificationType:
          dto.qualificationType ?? PromotionQualificationType.RUNNER_UP,
        status: dto.status ?? PromotionCandidateStatus.ELIGIBLE,
        note: dto.note?.trim() || null,
      },
      update: {
        rank: dto.rank,
        sourceCompetition,
        qualificationType:
          dto.qualificationType ?? PromotionQualificationType.RUNNER_UP,
        status: dto.status ?? PromotionCandidateStatus.ELIGIBLE,
        note: dto.note?.trim() || null,
      },
      include: this.promotionCandidateInclude,
    });
  }

  async importPromotionCandidates(
    seasonId: string,
    dto: ImportPromotionCandidatesDto,
  ) {
    await this.ensureSeasonExists(seasonId);

    const sourceCompetition = dto.sourceCompetition?.trim() || '';
    const teams = await this.prisma.team.findMany({
      select: this.teamSummarySelect,
    });
    const teamsById = new Map(teams.map((team) => [team.id, team]));
    const teamsByName = this.buildTeamLookup(teams);
    const errors: string[] = [];
    const seenTeamIds = new Set<string>();
    const seenRanks = new Set<number>();
    const rows: ResolvedPromotionImportRow[] = [];

    dto.rows.forEach((row, index) => {
      const line = index + 1;
      const rowSourceCompetition =
        row.sourceCompetition?.trim() || sourceCompetition;
      const resolved = this.resolvePromotionImportTeam(
        row,
        teamsById,
        teamsByName,
      );

      if (!rowSourceCompetition) {
        errors.push(`Dòng ${line}: thiếu giải nguồn.`);
      }
      if (seenRanks.has(row.rank)) {
        errors.push(`Dòng ${line}: trùng hạng #${row.rank}.`);
      } else {
        seenRanks.add(row.rank);
      }
      if (resolved.error) {
        errors.push(`Dòng ${line}: ${resolved.error}`);
      }
      if (resolved.team) {
        if (seenTeamIds.has(resolved.team.id)) {
          errors.push(`Dòng ${line}: CLB bị trùng trong file import.`);
        } else {
          seenTeamIds.add(resolved.team.id);
        }
      }

      if (rowSourceCompetition && resolved.team) {
        rows.push({
          teamId: resolved.team.id,
          rank: row.rank,
          sourceCompetition: rowSourceCompetition,
          qualificationType:
            row.qualificationType ??
            this.inferPromotionQualificationType(row.rank),
          status: row.status ?? PromotionCandidateStatus.ELIGIBLE,
          note: row.note?.trim() || null,
        });
      }
    });

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const candidates = await this.prisma.$transaction(async (tx) => {
      if (dto.replaceExisting) {
        await tx.promotionCandidate.deleteMany({ where: { seasonId } });
      }

      const imported: PromotionCandidateWithTeam[] = [];
      for (const row of rows) {
        imported.push(
          await tx.promotionCandidate.upsert({
            where: {
              seasonId_teamId: {
                seasonId,
                teamId: row.teamId,
              },
            },
            create: {
              seasonId,
              teamId: row.teamId,
              rank: row.rank,
              sourceCompetition: row.sourceCompetition,
              qualificationType: row.qualificationType,
              status: row.status,
              note: row.note,
            },
            update: {
              rank: row.rank,
              sourceCompetition: row.sourceCompetition,
              qualificationType: row.qualificationType,
              status: row.status,
              note: row.note,
            },
            include: this.promotionCandidateInclude,
          }),
        );
      }
      return imported;
    });

    return {
      importedCount: candidates.length,
      replaced: Boolean(dto.replaceExisting),
      candidates,
    };
  }

  async deletePromotionCandidate(seasonId: string, teamId: string) {
    await this.ensureSeasonExists(seasonId);

    const result = await this.prisma.promotionCandidate.deleteMany({
      where: { seasonId, teamId },
    });

    if (result.count === 0) {
      throw new NotFoundException(
        'Không tìm thấy đội trong snapshot thăng hạng.',
      );
    }

    return result;
  }

  async getPendingForManager(userId: string) {
    const manager = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, managedTeamId: true },
    });

    if (
      !manager ||
      manager.role !== UserRole.TEAM_MANAGER ||
      !manager.managedTeamId
    ) {
      return [];
    }

    await this.markExpiredInvitations({ teamId: manager.managedTeamId });

    const invitations = await this.prisma.teamInvitation.findMany({
      where: {
        status: TeamInvitationStatus.SENT,
        deadlineAt: { gte: new Date() },
        teamId: manager.managedTeamId,
      },
      include: this.invitationInclude,
      orderBy: { deadlineAt: 'asc' },
    });

    return Promise.all(
      invitations.map((invitation) =>
        this.withInvitationCompliance(invitation),
      ),
    );
  }

  async respondToInvitation(
    invitationId: string,
    userId: string,
    dto: RespondTeamInvitationDto,
  ) {
    if (!RESPONSE_STATUSES.includes(dto.responseStatus as never)) {
      throw new BadRequestException('Phản hồi lời mời không hợp lệ.');
    }

    const invitation = await this.prisma.teamInvitation.findUnique({
      where: { id: invitationId },
      include: this.invitationInclude,
    });

    if (!invitation) {
      throw new NotFoundException('Không tìm thấy lời mời tham dự mùa giải.');
    }

    if (invitation.status !== TeamInvitationStatus.SENT) {
      throw new BadRequestException('Lời mời này đã được phản hồi.');
    }

    if (invitation.deadlineAt < new Date()) {
      await this.markInvitationExpired(invitation.id);
      throw new BadRequestException('Lời mời đã quá hạn phản hồi.');
    }

    const manager = await this.prisma.user.findFirst({
      where: {
        id: userId,
        role: UserRole.TEAM_MANAGER,
        managedTeamId: invitation.teamId,
      },
      select: { id: true },
    });

    if (!manager) {
      throw new ForbiddenException('Bạn không có quyền phản hồi lời mời này.');
    }

    await this.prisma.teamManagerAssignment.upsert({
      where: { userId_seasonId: { userId, seasonId: invitation.seasonId } },
      update: { teamId: invitation.teamId },
      create: {
        userId,
        seasonId: invitation.seasonId,
        teamId: invitation.teamId,
      },
      include: this.managerAssignmentInclude,
    });

    const responseStatus = dto.responseStatus as TeamInvitationStatus;
    const updatedInvitation = await this.prisma.teamInvitation.update({
      where: { id: invitationId },
      data: {
        status: responseStatus,
        responseAt: new Date(),
        responseReason: dto.responseReason ?? null,
      },
      include: this.invitationInclude,
    });

    if (responseStatus === TeamInvitationStatus.ACCEPTED) {
      await this.prisma.seasonTeam.upsert({
        where: {
          seasonId_teamId: {
            seasonId: invitation.seasonId,
            teamId: invitation.teamId,
          },
        },
        create: {
          seasonId: invitation.seasonId,
          teamId: invitation.teamId,
          status: SeasonTeamStatus.REGISTERED,
        },
        update: {
          status: SeasonTeamStatus.REGISTERED,
          approvedAt: null,
        },
      });
    } else {
      await this.prisma.seasonTeam.updateMany({
        where: {
          seasonId: invitation.seasonId,
          teamId: invitation.teamId,
          status: { not: SeasonTeamStatus.APPROVED },
        },
        data: {
          status: SeasonTeamStatus.REJECTED,
          approvedAt: null,
        },
      });
    }

    if (invitation.sourceType === TeamInvitationSourceType.PROMOTED) {
      await this.prisma.promotionCandidate.updateMany({
        where: {
          seasonId: invitation.seasonId,
          teamId: invitation.teamId,
        },
        data: {
          status:
            responseStatus === TeamInvitationStatus.ACCEPTED
              ? PromotionCandidateStatus.ACCEPTED
              : PromotionCandidateStatus.DECLINED,
        },
      });
    }

    await this.notificationService.notifyAdmins({
      title: 'CLB phản hồi lời mời',
      message: this.buildInvitationResponseNotificationMessage(
        updatedInvitation.team.name,
        updatedInvitation.season.name,
        responseStatus,
        updatedInvitation.responseReason,
      ),
      type: 'TEAM_INVITATION',
      entityType: 'team_invitation',
      entityId: updatedInvitation.id,
    });

    return updatedInvitation;
  }

  private async buildPromotedCandidates(
    seasonId: string,
    excludedTeamIds: string[],
    requiredSlots: number,
  ): Promise<InvitationCandidate[]> {
    if (requiredSlots <= 0) return [];

    const excluded = new Set(excludedTeamIds);
    const selectedTeamIds = new Set<string>();
    const selected: Array<{
      teamId: string;
      teamName: string;
      team: InvitationCandidate['team'];
      invitationId: string | null;
      invitationStatus: TeamInvitationStatus | null;
      responseReason: string | null;
      deadlineAt: Date | null;
      sourceRank?: number;
      sourceCompetition?: string | null;
      qualificationType?: PromotionQualificationType | null;
      promotionStatus?: PromotionCandidateStatus | null;
      sourceNote?: string | null;
    }> = [];

    const promotionCandidates = await this.prisma.promotionCandidate.findMany({
      where: {
        seasonId,
        teamId: { notIn: excludedTeamIds },
        status: {
          in: [
            PromotionCandidateStatus.ELIGIBLE,
            PromotionCandidateStatus.INVITED,
            PromotionCandidateStatus.ACCEPTED,
          ],
        },
      },
      include: this.promotionCandidateInclude,
      orderBy: [{ rank: 'asc' }, { createdAt: 'asc' }],
    });
    const sortedPromotionCandidates = [...promotionCandidates].sort(
      (a, b) => a.rank - b.rank,
    );
    const promotionCandidateTeamIds = sortedPromotionCandidates.map(
      (candidate) => candidate.teamId,
    );
    const promotionCandidateInvitations =
      promotionCandidateTeamIds.length > 0
        ? await this.prisma.teamInvitation.findMany({
            where: { seasonId, teamId: { in: promotionCandidateTeamIds } },
            select: {
              id: true,
              teamId: true,
              status: true,
              responseReason: true,
              deadlineAt: true,
            },
          })
        : [];
    const invitationsByTeamId = new Map(
      promotionCandidateInvitations.map((invitation) => [
        invitation.teamId,
        invitation,
      ]),
    );

    for (const candidate of sortedPromotionCandidates) {
      if (selected.length >= requiredSlots) break;
      if (
        excluded.has(candidate.teamId) ||
        selectedTeamIds.has(candidate.teamId)
      ) {
        continue;
      }

      const invitation = invitationsByTeamId.get(candidate.teamId);
      selectedTeamIds.add(candidate.teamId);
      selected.push({
        teamId: candidate.teamId,
        teamName: candidate.team.name,
        team: candidate.team,
        invitationId: invitation?.id ?? null,
        invitationStatus: invitation?.status ?? null,
        responseReason: invitation?.responseReason ?? null,
        deadlineAt: invitation?.deadlineAt ?? null,
        sourceRank: candidate.rank,
        sourceCompetition: candidate.sourceCompetition,
        qualificationType: candidate.qualificationType,
        promotionStatus: candidate.status,
        sourceNote: candidate.note,
      });
    }

    const promotedInvitations = await this.prisma.teamInvitation.findMany({
      where: {
        seasonId,
        sourceType: TeamInvitationSourceType.PROMOTED,
        teamId: { notIn: [...excludedTeamIds, ...selectedTeamIds] },
      },
      include: {
        team: { select: this.teamSummarySelect },
      },
      orderBy: [{ sentAt: 'asc' }, { createdAt: 'asc' }],
    });

    for (const invitation of promotedInvitations) {
      if (selected.length >= requiredSlots) break;
      if (
        excluded.has(invitation.teamId) ||
        selectedTeamIds.has(invitation.teamId)
      ) {
        continue;
      }

      selectedTeamIds.add(invitation.teamId);
      selected.push({
        teamId: invitation.teamId,
        teamName: invitation.team.name,
        team: invitation.team,
        invitationId: invitation.id,
        invitationStatus: invitation.status,
        responseReason: invitation.responseReason,
        deadlineAt: invitation.deadlineAt,
        sourceNote: invitation.promotionNote,
      });
    }

    if (selected.length < requiredSlots) {
      const promotedSeasonTeams = await this.prisma.seasonTeam.findMany({
        where: {
          seasonId,
          teamId: {
            notIn: [...excludedTeamIds, ...selectedTeamIds],
          },
          status: {
            in: [SeasonTeamStatus.REGISTERED, SeasonTeamStatus.APPROVED],
          },
        },
        include: {
          team: { select: this.teamSummarySelect },
        },
        orderBy: { registeredAt: 'asc' },
      });

      for (const seasonTeam of promotedSeasonTeams) {
        if (selected.length >= requiredSlots) break;
        if (
          excluded.has(seasonTeam.teamId) ||
          selectedTeamIds.has(seasonTeam.teamId)
        ) {
          continue;
        }

        selectedTeamIds.add(seasonTeam.teamId);
        selected.push({
          teamId: seasonTeam.teamId,
          teamName: seasonTeam.team.name,
          team: seasonTeam.team,
          invitationId: null,
          invitationStatus: null,
          responseReason: null,
          deadlineAt: null,
        });
      }
    }

    return selected.map((candidate, index) => ({
      ...candidate,
      sourceType: TeamInvitationSourceType.PROMOTED,
      sourceRank: candidate.sourceRank ?? index + 1,
      points: 0,
      goalDifference: 0,
      played: 0,
    }));
  }

  private async resolveManagerAssignmentsForInvitation(
    seasonId: string,
    teamId: string,
  ) {
    const managers = await this.prisma.user.findMany({
      where: { role: UserRole.TEAM_MANAGER, managedTeamId: teamId },
      select: { id: true, email: true, name: true },
    });

    return Promise.all(
      managers.map((manager) =>
        this.prisma.teamManagerAssignment.upsert({
          where: {
            userId_seasonId: { userId: manager.id, seasonId },
          },
          update: { teamId },
          create: { userId: manager.id, seasonId, teamId },
          include: this.managerAssignmentInclude,
        }),
      ),
    );
  }

  private buildTeamLookup(teams: TeamSummary[]) {
    const lookup = new Map<string, TeamSummary[]>();
    const add = (value: string | null, team: TeamSummary) => {
      const key = this.normalizeTeamLookupKey(value);
      if (!key) return;
      const matches = lookup.get(key) ?? [];
      if (!matches.some((match) => match.id === team.id)) {
        matches.push(team);
      }
      lookup.set(key, matches);
    };

    for (const team of teams) {
      add(team.name, team);
      add(team.shortName, team);
    }

    return lookup;
  }

  private resolvePromotionImportTeam(
    row: ImportPromotionCandidatesDto['rows'][number],
    teamsById: Map<string, TeamSummary>,
    teamsByName: Map<string, TeamSummary[]>,
  ): { team?: TeamSummary; error?: string } {
    if (row.teamId) {
      const team = teamsById.get(row.teamId);
      return team
        ? { team }
        : { error: `không tìm thấy CLB với ID ${row.teamId}.` };
    }

    const key = this.normalizeTeamLookupKey(row.teamName);
    if (!key) {
      return { error: 'thiếu ID hoặc tên CLB.' };
    }

    const matches = teamsByName.get(key) ?? [];
    if (matches.length === 0) {
      return { error: `không tìm thấy CLB "${row.teamName}".` };
    }
    if (matches.length > 1) {
      return {
        error: `tên CLB "${row.teamName}" bị trùng, vui lòng dùng teamId.`,
      };
    }

    return { team: matches[0] };
  }

  private normalizeTeamLookupKey(value?: string | null) {
    return value?.trim().replace(/\s+/g, ' ').toLocaleLowerCase('vi-VN') ?? '';
  }

  private inferPromotionQualificationType(rank: number) {
    if (rank === 1) return PromotionQualificationType.CHAMPION;
    if (rank === 2) return PromotionQualificationType.RUNNER_UP;
    return PromotionQualificationType.REPLACEMENT_POOL;
  }

  private async buildTopLeagueCandidates(
    seasonId: string,
    standings: TeamStanding[],
  ): Promise<InvitationCandidate[]> {
    const teamIds = standings.map((standing) => standing.teamId);
    const [teams, invitations] = await Promise.all([
      this.prisma.team.findMany({
        where: { id: { in: teamIds } },
        select: {
          id: true,
          name: true,
          shortName: true,
          city: true,
          logoUrl: true,
          status: true,
        },
      }),
      this.prisma.teamInvitation.findMany({
        where: { seasonId, teamId: { in: teamIds } },
        select: {
          id: true,
          teamId: true,
          status: true,
          responseReason: true,
          deadlineAt: true,
        },
      }),
    ]);

    const teamsById = new Map(teams.map((team) => [team.id, team]));
    const invitationsByTeamId = new Map(
      invitations.map((invitation) => [invitation.teamId, invitation]),
    );

    return standings.map((standing, index) => {
      const team = teamsById.get(standing.teamId) ?? null;
      const invitation = invitationsByTeamId.get(standing.teamId);

      return {
        teamId: standing.teamId,
        teamName: team?.name ?? standing.teamName,
        sourceType: TeamInvitationSourceType.PREVIOUS_TOP_8,
        sourceRank: standing.position || index + 1,
        points: standing.points,
        goalDifference: standing.goalDifference,
        played: standing.played,
        invitationId: invitation?.id ?? null,
        invitationStatus: invitation?.status ?? null,
        responseReason: invitation?.responseReason ?? null,
        deadlineAt: invitation?.deadlineAt ?? null,
        team,
      };
    });
  }

  private async ensureSeasonExists(seasonId: string) {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
    });

    if (!season) {
      throw new NotFoundException('Không tìm thấy mùa giải.');
    }

    return season;
  }

  private async ensureTeamExists(teamId: string) {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });

    if (!team) {
      throw new NotFoundException('Không tìm thấy CLB.');
    }

    return team;
  }

  private async markExpiredInvitations(where: Prisma.TeamInvitationWhereInput) {
    await this.prisma.teamInvitation.updateMany({
      where: {
        ...where,
        status: TeamInvitationStatus.SENT,
        deadlineAt: { lt: new Date() },
      },
      data: {
        status: TeamInvitationStatus.EXPIRED,
        responseAt: new Date(),
        responseReason: 'Quá hạn phản hồi',
      },
    });
  }

  private async markInvitationExpired(invitationId: string) {
    await this.markExpiredInvitations({ id: invitationId });
  }

  private async withInvitationCompliance<T extends InvitationForCompliance>(
    invitation: T,
  ) {
    const rules = this.getComplianceRules(invitation.regulationsSnapshot);
    const [activeRosterPlayers, team] = await Promise.all([
      this.prisma.teamPlayer.findMany({
        where: { teamId: invitation.teamId, leftAt: null },
        select: {
          player: {
            select: {
              dob: true,
              playerType: true,
              nationality: true,
            },
          },
        },
      }),
      this.prisma.team.findUnique({
        where: { id: invitation.teamId },
        select: {
          stadium: {
            select: {
              id: true,
              name: true,
              capacity: true,
              fifaStars: true,
            },
          },
        },
      }),
    ]);

    const rosterCount = activeRosterPlayers.length;
    const foreignPlayers = activeRosterPlayers.filter((row) =>
      isForeignPlayer(row.player),
    ).length;
    const ageViolations = activeRosterPlayers.filter((row) => {
      const age = this.calculateAge(row.player.dob);
      return age === null || age < rules.minAge || age > rules.maxAge;
    }).length;
    const stadium = team?.stadium ?? null;
    const stadiumCapacity = stadium?.capacity ?? null;
    const stadiumFifaStars = stadium?.fifaStars ?? null;

    return {
      ...invitation,
      compliance: {
        roster: {
          current: rosterCount,
          min: rules.minRoster,
          max: rules.maxRoster,
          ok: rosterCount >= rules.minRoster && rosterCount <= rules.maxRoster,
        },
        foreignPlayers: {
          current: foreignPlayers,
          max: rules.maxForeignPlayers,
          maxOnField: rules.maxForeignPlayersOnField,
          ok: foreignPlayers <= rules.maxForeignPlayers,
        },
        age: {
          min: rules.minAge,
          max: rules.maxAge,
          total: rosterCount,
          invalidCount: ageViolations,
          ok: ageViolations === 0,
        },
        stadium: {
          stadiumId: stadium?.id ?? null,
          stadiumName: stadium?.name ?? null,
          capacity: stadiumCapacity,
          fifaStars: stadiumFifaStars,
          minCapacity: rules.minStadiumCapacity,
          minFifaStars: rules.minStadiumFifaStars,
          ok:
            stadiumCapacity !== null &&
            stadiumFifaStars !== null &&
            stadiumCapacity >= rules.minStadiumCapacity &&
            stadiumFifaStars >= rules.minStadiumFifaStars,
        },
      },
    };
  }

  private getComplianceRules(snapshot: Prisma.JsonValue | null) {
    return {
      minAge: this.getSnapshotNumber(snapshot, 'MIN_AGE', 16),
      maxAge: this.getSnapshotNumber(snapshot, 'MAX_AGE', 40),
      minRoster: this.getSnapshotNumber(snapshot, 'MIN_ROSTER', 16),
      maxRoster: this.getSnapshotNumber(snapshot, 'MAX_ROSTER', 22),
      maxForeignPlayers: this.getSnapshotNumber(
        snapshot,
        'MAX_FOREIGN_PLAYERS',
        5,
      ),
      maxForeignPlayersOnField: this.getSnapshotNumber(
        snapshot,
        'MAX_FOREIGN_PLAYERS_ON_FIELD',
        3,
      ),
      minStadiumCapacity: this.getSnapshotNumber(
        snapshot,
        'MIN_STADIUM_CAPACITY',
        10000,
      ),
      minStadiumFifaStars: this.getSnapshotNumber(
        snapshot,
        'MIN_STADIUM_FIFA_STARS',
        2,
      ),
    };
  }

  private calculateAge(dob?: Date | string | null) {
    if (!dob) return null;
    const birthDate = new Date(dob);
    if (Number.isNaN(birthDate.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }

  private getSnapshotNumber(
    snapshot: Prisma.JsonValue | null,
    key: string,
    fallback: number,
  ) {
    const snapshotValue = this.getSnapshotValue(snapshot, key);
    const snapshotNumber = Number(snapshotValue);
    if (Number.isFinite(snapshotNumber)) return snapshotNumber;

    const defaultValue = DEFAULT_REGULATIONS.find(
      (regulation) => regulation.key === key,
    )?.value;
    const defaultNumber = Number(defaultValue);
    return Number.isFinite(defaultNumber) ? defaultNumber : fallback;
  }

  private getSnapshotValue(snapshot: Prisma.JsonValue | null, key: string) {
    if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) {
      return undefined;
    }

    const value = (snapshot as Record<string, unknown>)[key];
    if (typeof value === 'string' || typeof value === 'number') {
      return value;
    }
    return undefined;
  }

  private async buildRegulationsSnapshot(seasonId: string) {
    const keys = [
      'MIN_AGE',
      'MAX_AGE',
      'MIN_ROSTER',
      'MAX_ROSTER',
      'MAX_FOREIGN_PLAYERS',
      'MAX_FOREIGN_PLAYERS_ON_FIELD',
      'MIN_STADIUM_CAPACITY',
      'MIN_STADIUM_FIFA_STARS',
      'PARTICIPATION_FEE_VND',
    ];
    const defaults = new Map(
      DEFAULT_REGULATIONS.map((reg) => [reg.key, reg.value]),
    );
    const regulations = await this.prisma.regulation.findMany({
      where: { seasonId, key: { in: keys } },
      select: { key: true, value: true },
    });
    const values = new Map(regulations.map((reg) => [reg.key, reg.value]));

    return keys.reduce<Record<string, string>>((snapshot, key) => {
      snapshot[key] = values.get(key) ?? defaults.get(key) ?? '';
      return snapshot;
    }, {});
  }

  private buildNotificationMessage(
    seasonName: string,
    teamName: string,
    deadlineAt: Date,
    regulations: Record<string, string>,
  ) {
    return [
      `BTC mời ${teamName} tham dự ${seasonName}.`,
      `Hạn phản hồi: ${deadlineAt.toLocaleDateString('vi-VN')}.`,
      `Lệ phí tham dự: ${this.formatVnd(regulations['PARTICIPATION_FEE_VND'])}.`,
      `Quy định chính: ${regulations['MIN_ROSTER']}-${regulations['MAX_ROSTER']} cầu thủ, tối đa ${regulations['MAX_FOREIGN_PLAYERS']} ngoại binh đăng ký, tối đa ${regulations['MAX_FOREIGN_PLAYERS_ON_FIELD']} ngoại binh trên sân, sân tối thiểu ${Number(regulations['MIN_STADIUM_CAPACITY']).toLocaleString('vi-VN')} chỗ và đạt ít nhất ${regulations['MIN_STADIUM_FIFA_STARS']} sao FIFA.`,
    ].join(' ');
  }

  private buildInvitationResponseNotificationMessage(
    teamName: string,
    seasonName: string,
    responseStatus: TeamInvitationStatus,
    responseReason?: string | null,
  ) {
    const statusLabel =
      responseStatus === TeamInvitationStatus.ACCEPTED
        ? 'chấp nhận'
        : 'từ chối';
    const reason = responseReason?.trim()
      ? ` Lý do: ${responseReason.trim()}.`
      : '';

    return `${teamName} đã ${statusLabel} lời mời tham dự ${seasonName}.${reason}`;
  }

  private formatVnd(value?: string) {
    const amount = Number(value ?? 0);
    if (!Number.isFinite(amount) || amount <= 0) return '1.000.000.000 VND';
    return `${amount.toLocaleString('vi-VN')} VND`;
  }

  private addDays(date: Date, days: number) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}

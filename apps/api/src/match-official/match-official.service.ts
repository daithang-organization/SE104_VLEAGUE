import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { CurrentUserPayload } from '../auth';
import { PrismaService } from '../prisma/prisma.service';
import { MatchLineupService } from '../match-lineup/match-lineup.service';
import { NotificationService } from '../notification/notification.service';
import {
  AssignOfficialDto,
  CreateOfficialDto,
  SubmitDisciplineReportDto,
  SubmitMatchReportDto,
} from './dto/match-official.dto';

@Injectable()
export class MatchOfficialService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly matchLineupService: MatchLineupService,
  ) {}

  async listOfficials() {
    const officials = await this.prisma.official.findMany({
      orderBy: [{ status: 'asc' }, { fullName: 'asc' }],
    });

    return this.addAccountRolesToOfficials(officials);
  }

  async createOfficial(dto: CreateOfficialDto) {
    const fullName = dto.fullName.trim();
    if (!fullName) {
      throw new BadRequestException('Tên trọng tài/giám sát viên là bắt buộc.');
    }

    return this.prisma.official.create({
      data: {
        fullName,
        email: this.cleanOptional(dto.email),
        phone: this.cleanOptional(dto.phone),
        status: 'ACTIVE',
      },
    });
  }

  async listAssignments(matchId: string) {
    await this.ensureMatch(matchId);

    const assignments = await this.prisma.matchOfficialAssignment.findMany({
      where: { matchId },
      include: { official: true },
      orderBy: [{ role: 'asc' }, { publishedAt: 'asc' }],
    });

    const roleByEmail = await this.getAccountRoleByOfficialEmail(
      assignments.map((assignment) => assignment.official),
    );

    return assignments.map((assignment) => ({
      ...assignment,
      official: {
        ...assignment.official,
        accountRole: this.resolveOfficialAccountRole(
          assignment.official,
          roleByEmail,
        ),
      },
    }));
  }

  async assignOfficial(matchId: string, dto: AssignOfficialDto) {
    await this.ensureMatch(matchId);
    await this.ensureOfficial(dto.officialId);
    await this.ensureOfficialHasNoOtherMatchRole(matchId, dto);

    if (dto.role === 'SUPERVISOR') {
      const supervisorCount = await this.prisma.matchOfficialAssignment.count({
        where: { matchId, role: 'SUPERVISOR' },
      });
      if (supervisorCount > 0) {
        throw new BadRequestException(
          'Mỗi trận chỉ được phân công 1 giám sát viên.',
        );
      }
    }

    const publishedAt = new Date();
    const note = this.cleanOptional(dto.note);

    return this.prisma.matchOfficialAssignment.upsert({
      where: {
        matchId_officialId_role: {
          matchId,
          officialId: dto.officialId,
          role: dto.role,
        },
      },
      create: {
        matchId,
        officialId: dto.officialId,
        role: dto.role,
        note,
        publishedAt,
      },
      update: {
        note,
        publishedAt,
      },
      include: { official: true },
    });
  }

  async removeAssignment(matchId: string, assignmentId: string) {
    await this.ensureMatch(matchId);

    const result = await this.prisma.matchOfficialAssignment.deleteMany({
      where: { id: assignmentId, matchId },
    });

    if (result.count === 0) {
      throw new NotFoundException(
        'Không tìm thấy phân công trọng tài/giám sát viên.',
      );
    }

    return { success: true };
  }

  async getMatchReport(matchId: string) {
    await this.ensureMatch(matchId);

    return this.prisma.matchReport.findUnique({
      where: { matchId },
      include: {
        bestPlayer: { select: { id: true, fullName: true } },
      },
    });
  }

  async submitMatchReport(
    matchId: string,
    submittedByUser: CurrentUserPayload | undefined,
    dto: SubmitMatchReportDto,
  ) {
    const match = await this.ensureMatch(matchId);
    const refereeAssignment = await this.ensureRefereeCanReport(
      matchId,
      submittedByUser,
    );
    const existingReport = await this.prisma.matchReport.findUnique({
      where: { matchId },
      select: { id: true },
    });
    if (submittedByUser?.role === 'REFEREE' && existingReport) {
      throw new BadRequestException('Biên bản trọng tài chỉ được nộp một lần.');
    }

    const adminScoreLocked = match.scoreSource === 'ADMIN';
    const homeScore = adminScoreLocked
      ? (match.homeScore ?? dto.homeScore)
      : dto.homeScore;
    const awayScore = adminScoreLocked
      ? (match.awayScore ?? dto.awayScore)
      : dto.awayScore;
    const submittedEvents = dto.events ?? [];
    const scoreEvents =
      dto.events ?? (await this.getExistingReportEvents(matchId));
    const eventScore = this.calculateEventScore(scoreEvents, match);

    if (
      eventScore.homeScore !== homeScore ||
      eventScore.awayScore !== awayScore
    ) {
      throw new BadRequestException(
        `Tỉ số ${homeScore} - ${awayScore} không khớp với sự kiện bàn thắng hiện có: ${eventScore.homeScore} - ${eventScore.awayScore}.`,
      );
    }

    if (dto.events !== undefined) {
      await this.assertSingleRedCardPerPlayerForSubmittedEvents(
        matchId,
        submittedEvents,
      );

      await this.prisma.matchEvent.deleteMany({
        where: { matchId, source: 'MATCH_REPORT' },
      });
    }

    if (dto.events !== undefined && submittedEvents.length > 0) {
      await this.prisma.matchEvent.createMany({
        data: submittedEvents.map((event) => ({
          matchId,
          minute: event.minute,
          type: event.type,
          teamId: event.teamId,
          playerId: event.playerId,
          relatedPlayerId: event.relatedPlayerId,
          goalType: event.goalType,
          note: event.note,
          source: 'MATCH_REPORT',
        })),
      });
    }

    if (dto.events !== undefined) {
      await this.matchLineupService.syncSuspensionsForMatch(matchId);
    }

    if (!adminScoreLocked) {
      await this.prisma.match.update({
        where: { id: matchId },
        data: {
          homeScore: dto.homeScore,
          awayScore: dto.awayScore,
          scoreSource: 'REFEREE',
        },
      });
    }

    const submittedAt = new Date();
    const reportData = {
      submittedByUserId: submittedByUser?.id ?? null,
      homeScore,
      awayScore,
      bestPlayerId: dto.bestPlayerId ?? null,
      technicalStats: dto.technicalStats as Prisma.InputJsonValue | undefined,
      note: this.cleanOptional(dto.note),
      submittedAt,
    };

    const report = await this.prisma.matchReport.upsert({
      where: { matchId },
      create: {
        matchId,
        ...reportData,
      },
      update: reportData,
      include: {
        bestPlayer: { select: { id: true, fullName: true } },
      },
    });

    if (submittedByUser?.role === 'REFEREE') {
      const refereeName =
        refereeAssignment?.official?.fullName?.trim() ||
        submittedByUser.email ||
        'Trọng tài';
      const matchName = `${match.homeTeam?.name ?? 'Đội nhà'} vs ${
        match.awayTeam?.name ?? 'Đội khách'
      }`;

      await this.notificationService.notifyAdmins({
        title: 'Trọng tài nộp biên bản',
        message: `${refereeName} đã nộp biên bản trận ${matchName} với tỉ số ${homeScore} - ${awayScore}. Vui lòng kiểm tra.`,
        type: 'SYSTEM',
        entityType: 'match',
        entityId: matchId,
      });
    }

    return report;
  }

  async getDisciplineReport(matchId: string) {
    await this.ensureMatch(matchId);

    return this.prisma.disciplineReport.findUnique({
      where: { matchId },
      include: { supervisor: true },
    });
  }

  async submitDisciplineReport(
    matchId: string,
    submittedByUser: CurrentUserPayload | undefined,
    dto: SubmitDisciplineReportDto,
  ) {
    await this.ensureMatch(matchId);
    const existingReport = await this.prisma.disciplineReport.findUnique({
      where: { matchId },
      select: { id: true },
    });
    if (submittedByUser?.role === 'SUPERVISOR' && existingReport) {
      throw new BadRequestException('Báo cáo giám sát chỉ được nộp một lần.');
    }

    const supervisor = await this.ensureOfficial(dto.supervisorId);
    await this.ensureSupervisorAssignment(matchId, dto.supervisorId);
    this.ensureOfficialMatchesUser(
      supervisor.email,
      submittedByUser,
      'SUPERVISOR',
    );

    const sentToDisciplinaryAt = dto.sendToDisciplinary ? new Date() : null;
    const reportData = {
      supervisorId: dto.supervisorId,
      organizationRating: dto.organizationRating.trim(),
      refereeIssues: this.cleanOptional(dto.refereeIssues),
      playerIssues: this.cleanOptional(dto.playerIssues),
      organizerIssues: this.cleanOptional(dto.organizerIssues),
      notes: this.cleanOptional(dto.notes),
      sentToDisciplinaryAt,
      submittedAt: new Date(),
    };

    const report = await this.prisma.disciplineReport.upsert({
      where: { matchId },
      create: {
        matchId,
        ...reportData,
      },
      update: reportData,
      include: { supervisor: true },
    });

    if (submittedByUser?.role === 'SUPERVISOR') {
      await this.notificationService.notifyAdmins({
        title: 'Giám sát viên nộp báo cáo kỷ luật',
        message: `Giám sát viên đã nộp báo cáo kỷ luật trận đấu với mức đánh giá ${report.organizationRating}. Vui lòng kiểm tra.`,
        type: 'SYSTEM',
        entityType: 'match',
        entityId: matchId,
      });
    }

    if (
      submittedByUser?.role === 'SUPERVISOR' &&
      dto.organizationRating === 'ISSUES_FOUND' &&
      dto.sendToDisciplinary
    ) {
      await this.notifyAdminsAboutDisciplinaryReferral(
        matchId,
        supervisor.fullName,
      );
    }

    return report;
  }

  private async assertSingleRedCardPerPlayerForSubmittedEvents(
    matchId: string,
    events: Array<{ type: string; playerId?: string | null }>,
  ) {
    const redCardPlayerIds = events
      .filter((event) => event.type === 'RED_CARD' && event.playerId)
      .map((event) => event.playerId as string);
    if (redCardPlayerIds.length === 0) return;

    const uniqueRedCardPlayerIds = new Set(redCardPlayerIds);
    if (uniqueRedCardPlayerIds.size !== redCardPlayerIds.length) {
      throw new BadRequestException(
        'Mỗi cầu thủ chỉ được nhận tối đa 1 thẻ đỏ trong 1 trận.',
      );
    }

    const existingRedCard = await this.prisma.matchEvent.findFirst({
      where: {
        matchId,
        type: 'RED_CARD' as never,
        playerId: { in: [...uniqueRedCardPlayerIds] },
        source: { not: 'MATCH_REPORT' },
      },
      select: { id: true },
    });

    if (existingRedCard) {
      throw new BadRequestException(
        'Cầu thủ này đã nhận thẻ đỏ trong trận đấu này. Mỗi cầu thủ chỉ được nhận tối đa 1 thẻ đỏ trong 1 trận.',
      );
    }
  }

  private async notifyAdminsAboutDisciplinaryReferral(
    matchId: string,
    supervisorName: string,
  ) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      select: {
        id: true,
        kickoffAt: true,
        homeTeam: { select: { name: true } },
        awayTeam: { select: { name: true } },
      },
    });

    if (!match) return;

    await this.notificationService.notifyDisciplinaryReferralToAdmins({
      matchId: match.id,
      homeTeam: match.homeTeam?.name ?? 'Đội nhà',
      awayTeam: match.awayTeam?.name ?? 'Đội khách',
      kickoffAt: match.kickoffAt,
      supervisorName,
    });
  }

  private async ensureMatch(matchId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeam: { select: { name: true } },
        awayTeam: { select: { name: true } },
      },
    });

    if (!match) {
      throw new NotFoundException('Không tìm thấy trận đấu.');
    }

    return match;
  }

  private async ensureOfficial(officialId: string) {
    const official = await this.prisma.official.findUnique({
      where: { id: officialId },
    });

    if (!official) {
      throw new NotFoundException('Không tìm thấy trọng tài/giám sát viên.');
    }

    if (official.status !== 'ACTIVE') {
      throw new BadRequestException(
        'Trọng tài/giám sát viên không ở trạng thái hoạt động.',
      );
    }

    return official;
  }

  private async ensureSupervisorAssignment(
    matchId: string,
    supervisorId: string,
  ) {
    const assignmentCount = await this.prisma.matchOfficialAssignment.count({
      where: { matchId, officialId: supervisorId, role: 'SUPERVISOR' },
    });

    if (assignmentCount === 0) {
      throw new BadRequestException(
        'Giám sát viên phải được phân công cho trận trước khi nộp báo cáo.',
      );
    }
  }

  private async ensureOfficialHasNoOtherMatchRole(
    matchId: string,
    dto: AssignOfficialDto,
  ) {
    const assignments = await this.prisma.matchOfficialAssignment.findMany({
      where: { matchId, officialId: dto.officialId },
      select: { role: true },
    });

    if (assignments.some((assignment) => assignment.role !== dto.role)) {
      throw new BadRequestException(
        'Một trọng tài/giám sát viên chỉ được đảm nhận 1 vai trò trong cùng một trận.',
      );
    }
  }

  private async ensureRefereeCanReport(
    matchId: string,
    user: CurrentUserPayload | undefined,
  ) {
    if (user?.role === 'ADMIN') return null;

    const assignment = await this.prisma.matchOfficialAssignment.findFirst({
      where: {
        matchId,
        role: { in: ['MAIN_REFEREE', 'ASSISTANT_REFEREE', 'FOURTH_OFFICIAL'] },
        official: {
          email: { equals: user?.email ?? '', mode: 'insensitive' },
          status: 'ACTIVE',
        },
      },
      include: {
        official: { select: { fullName: true, email: true } },
      },
    });

    if (!assignment) {
      throw new ForbiddenException(
        'Trọng tài phải được phân công cho trận trước khi nộp báo cáo.',
      );
    }

    return assignment;
  }

  private ensureOfficialMatchesUser(
    officialEmail: string | null | undefined,
    user: CurrentUserPayload | undefined,
    expectedRole: string,
  ) {
    if (user?.role === 'ADMIN') return;

    if (
      user?.role !== expectedRole ||
      !officialEmail ||
      officialEmail.toLowerCase() !== user.email.toLowerCase()
    ) {
      throw new ForbiddenException(
        'Người dùng hiện tại không khớp với trọng tài/giám sát viên được phân công.',
      );
    }
  }

  private cleanOptional(value?: string) {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  }

  private async addAccountRolesToOfficials<
    TOfficial extends { email?: string | null },
  >(officials: TOfficial[]) {
    const roleByEmail = await this.getAccountRoleByOfficialEmail(officials);

    return officials.map((official) => ({
      ...official,
      accountRole: this.resolveOfficialAccountRole(official, roleByEmail),
    }));
  }

  private async getAccountRoleByOfficialEmail(
    officials: Array<{ email?: string | null }>,
  ) {
    const emails = Array.from(
      new Set(
        officials
          .map((official) => this.normalizeEmail(official.email))
          .filter((email): email is string => Boolean(email)),
      ),
    );

    if (emails.length === 0) {
      return new Map<string, string>();
    }

    const users = await this.prisma.user.findMany({
      where: {
        OR: emails.map((email) => ({
          email: { equals: email, mode: 'insensitive' },
        })),
      },
      select: { email: true, role: true },
    });

    return new Map(
      users.map((user) => [
        this.normalizeEmail(user.email) as string,
        user.role,
      ]),
    );
  }

  private resolveOfficialAccountRole(
    official: { email?: string | null },
    roleByEmail: Map<string, string>,
  ) {
    const email = this.normalizeEmail(official.email);
    return email ? (roleByEmail.get(email) ?? null) : null;
  }

  private normalizeEmail(email?: string | null) {
    const trimmed = email?.trim();
    return trimmed ? trimmed.toLowerCase() : null;
  }

  private async getExistingReportEvents(matchId: string) {
    return this.prisma.matchEvent.findMany({
      where: { matchId, source: 'MATCH_REPORT' },
      select: { type: true, teamId: true },
    });
  }

  private calculateEventScore(
    events: Array<{ type: string; teamId?: string | null }>,
    match: { homeTeamId: string; awayTeamId: string },
  ) {
    return events.reduce(
      (score, event) => {
        if (event.type === 'GOAL' || event.type === 'PENALTY') {
          if (event.teamId === match.homeTeamId) score.homeScore += 1;
          if (event.teamId === match.awayTeamId) score.awayScore += 1;
        }
        if (event.type === 'OWN_GOAL') {
          if (event.teamId === match.homeTeamId) score.awayScore += 1;
          if (event.teamId === match.awayTeamId) score.homeScore += 1;
        }
        return score;
      },
      { homeScore: 0, awayScore: 0 },
    );
  }
}

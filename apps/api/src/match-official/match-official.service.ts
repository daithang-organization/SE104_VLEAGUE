import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CurrentUserPayload } from '../auth';
import {
  AssignOfficialDto,
  CreateOfficialDto,
  SubmitDisciplineReportDto,
  SubmitMatchReportDto,
} from './dto/match-official.dto';

@Injectable()
export class MatchOfficialService {
  constructor(private readonly prisma: PrismaService) {}

  listOfficials() {
    return this.prisma.official.findMany({
      orderBy: [{ status: 'asc' }, { fullName: 'asc' }],
    });
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

    return this.prisma.matchOfficialAssignment.findMany({
      where: { matchId },
      include: { official: true },
      orderBy: [{ role: 'asc' }, { publishedAt: 'asc' }],
    });
  }

  async assignOfficial(matchId: string, dto: AssignOfficialDto) {
    await this.ensureMatch(matchId);
    await this.ensureOfficial(dto.officialId);

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
    await this.ensureRefereeCanReport(matchId, submittedByUser);
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

    return this.prisma.matchReport.upsert({
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

    return this.prisma.disciplineReport.upsert({
      where: { matchId },
      create: {
        matchId,
        ...reportData,
      },
      update: reportData,
      include: { supervisor: true },
    });
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

  private async ensureRefereeCanReport(
    matchId: string,
    user: CurrentUserPayload | undefined,
  ) {
    if (user?.role === 'ADMIN') return;

    const assignment = await this.prisma.matchOfficialAssignment.findFirst({
      where: {
        matchId,
        role: { in: ['MAIN_REFEREE', 'ASSISTANT_REFEREE', 'FOURTH_OFFICIAL'] },
        official: {
          email: { equals: user?.email ?? '', mode: 'insensitive' },
          status: 'ACTIVE',
        },
      },
    });

    if (!assignment) {
      throw new ForbiddenException(
        'Trọng tài phải được phân công cho trận trước khi nộp báo cáo.',
      );
    }
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

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
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
    submittedByUserId: string | undefined,
    dto: SubmitMatchReportDto,
  ) {
    await this.ensureMatch(matchId);

    await this.prisma.match.update({
      where: { id: matchId },
      data: { homeScore: dto.homeScore, awayScore: dto.awayScore },
    });

    const events = dto.events ?? [];
    if (events.length > 0) {
      await this.prisma.matchEvent.createMany({
        data: events.map((event) => ({
          matchId,
          minute: event.minute,
          type: event.type,
          teamId: event.teamId,
          playerId: event.playerId,
          relatedPlayerId: event.relatedPlayerId,
          goalType: event.goalType,
          note: event.note,
        })),
        skipDuplicates: true,
      });
    }

    const submittedAt = new Date();
    const reportData = {
      submittedByUserId: submittedByUserId ?? null,
      homeScore: dto.homeScore,
      awayScore: dto.awayScore,
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
    dto: SubmitDisciplineReportDto,
  ) {
    await this.ensureMatch(matchId);
    await this.ensureOfficial(dto.supervisorId);
    await this.ensureSupervisorAssignment(matchId, dto.supervisorId);

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

  private cleanOptional(value?: string) {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  }
}

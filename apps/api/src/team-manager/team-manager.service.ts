import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ManagerPlayerRequestType,
  ManagerRequestStatus,
  ManagerStadiumRequestType,
  PlayerPosition,
  PlayerType,
  Prisma,
  TeamManagerRequestStatus,
  TeamManagerRequestType,
  UserRole,
} from '@prisma/client';
import { NotificationService } from '../notification/notification.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateManagerPlayerRequestDto,
  CreateManagerStadiumRequestDto,
  CreateTeamManagerRequestDto,
  ReviewManagerChangeRequestDto,
  ReviewTeamManagerRequestDto,
  SubmitTeamApplicationDto,
} from './dto/team-manager-assignment.dto';

@Injectable()
export class TeamManagerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  private assignmentInclude = {
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
        logoUrl: true,
        coachName: true,
        city: true,
        status: true,
        stadium: { select: { id: true, name: true, city: true } },
      },
    },
  } satisfies Prisma.TeamManagerAssignmentInclude;

  private requestInclude = {
    manager: {
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        managedTeamId: true,
      },
    },
    team: {
      select: {
        id: true,
        name: true,
        shortName: true,
        logoUrl: true,
        city: true,
        status: true,
        stadium: { select: { id: true, name: true, city: true } },
      },
    },
    reviewedBy: {
      select: {
        id: true,
        email: true,
        name: true,
      },
    },
  } satisfies Prisma.TeamManagerRequestInclude;

  private playerRequestInclude = {
    manager: {
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        managedTeamId: true,
      },
    },
    team: {
      select: {
        id: true,
        name: true,
        shortName: true,
        logoUrl: true,
        city: true,
        status: true,
      },
    },
    player: {
      select: {
        id: true,
        fullName: true,
        dob: true,
        nationality: true,
        position: true,
        playerType: true,
        birthPlace: true,
        heightCm: true,
        weightKg: true,
        careerSummary: true,
      },
    },
    reviewedBy: {
      select: {
        id: true,
        email: true,
        name: true,
      },
    },
  } satisfies Prisma.ManagerPlayerRequestInclude;

  private stadiumRequestInclude = {
    manager: {
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        managedTeamId: true,
      },
    },
    team: {
      select: {
        id: true,
        name: true,
        shortName: true,
        logoUrl: true,
        city: true,
        status: true,
        stadium: true,
      },
    },
    stadium: true,
    reviewedBy: {
      select: {
        id: true,
        email: true,
        name: true,
      },
    },
  } satisfies Prisma.ManagerStadiumRequestInclude;

  async getAssignment(userId: string, seasonId: string) {
    if (!seasonId) {
      throw new BadRequestException('seasonId là bắt buộc.');
    }

    const user = await this.getTeamManagerUser(userId);
    if (!user.managedTeamId) return null;

    return this.upsertSeasonAssignment(user.id, seasonId, user.managedTeamId);
  }

  async getManagedTeam(userId: string) {
    const user = await this.getTeamManagerUser(userId);
    if (!user.managedTeamId) return null;

    return this.prisma.team.findUnique({
      where: { id: user.managedTeamId },
      select: {
        id: true,
        name: true,
        shortName: true,
        logoUrl: true,
        coachName: true,
        city: true,
        status: true,
        stadiumId: true,
        createdAt: true,
        updatedAt: true,
        stadium: { select: { id: true, name: true, city: true } },
      },
    });
  }

  async getLatestManagementRequest(userId: string) {
    await this.getTeamManagerUser(userId);

    return this.prisma.teamManagerRequest.findFirst({
      where: { managerId: userId },
      include: this.requestInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async listMyManagementRequests(userId: string) {
    await this.getTeamManagerUser(userId);

    return this.prisma.teamManagerRequest.findMany({
      where: { managerId: userId },
      include: this.requestInclude,
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async getClaimableTeams() {
    return this.prisma.team.findMany({
      where: {
        status: 'ACTIVE',
        managedUsers: { none: { role: UserRole.TEAM_MANAGER } },
        managerRequests: {
          none: {
            status: TeamManagerRequestStatus.PENDING,
            requestType: TeamManagerRequestType.CLAIM_EXISTING_TEAM,
          },
        },
      },
      select: {
        id: true,
        name: true,
        shortName: true,
        logoUrl: true,
        city: true,
        status: true,
        stadiumId: true,
        createdAt: true,
        updatedAt: true,
        stadium: { select: { id: true, name: true, city: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createManagementRequest(
    userId: string,
    dto: CreateTeamManagerRequestDto,
  ) {
    const user = await this.getTeamManagerUser(userId);

    if (user.managedTeamId) {
      if (
        dto.requestType === TeamManagerRequestType.UPDATE_MANAGED_TEAM ||
        dto.requestType === TeamManagerRequestType.DELETE_MANAGED_TEAM
      ) {
        const pendingRequest = await this.prisma.teamManagerRequest.findFirst({
          where: {
            managerId: userId,
            status: TeamManagerRequestStatus.PENDING,
          },
          select: { id: true },
        });

        if (pendingRequest) {
          throw new ConflictException(
            'Bạn đã có yêu cầu đang chờ Admin xét duyệt.',
          );
        }

        if (dto.requestType === TeamManagerRequestType.DELETE_MANAGED_TEAM) {
          return this.createDeleteManagedTeamRequest(
            userId,
            user.managedTeamId,
            dto,
          );
        }

        return this.createUpdateManagedTeamRequest(
          userId,
          user.managedTeamId,
          dto,
        );
      }

      throw new ConflictException('Tài khoản này đã được duyệt quản lý CLB.');
    }

    const pendingRequest = await this.prisma.teamManagerRequest.findFirst({
      where: { managerId: userId, status: TeamManagerRequestStatus.PENDING },
      select: { id: true },
    });

    if (pendingRequest) {
      throw new ConflictException(
        'Bạn đã có yêu cầu đang chờ Admin xét duyệt.',
      );
    }

    if (dto.requestType === TeamManagerRequestType.CLAIM_EXISTING_TEAM) {
      return this.createClaimExistingTeamRequest(userId, dto);
    }

    if (dto.requestType === TeamManagerRequestType.CREATE_TEAM) {
      return this.createNewTeamRequest(userId, dto);
    }

    if (
      dto.requestType === TeamManagerRequestType.UPDATE_MANAGED_TEAM ||
      dto.requestType === TeamManagerRequestType.DELETE_MANAGED_TEAM
    ) {
      throw new BadRequestException('Bạn chưa có CLB để gửi yêu cầu này.');
    }

    throw new BadRequestException('Loại yêu cầu không hợp lệ.');
  }

  async updateManagementRequest(
    userId: string,
    requestId: string,
    dto: CreateTeamManagerRequestDto,
  ) {
    const user = await this.getTeamManagerUser(userId);

    const request = await this.prisma.teamManagerRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        managerId: true,
        status: true,
        teamId: true,
        requestType: true,
      },
    });

    if (!request) {
      throw new NotFoundException('Không tìm thấy yêu cầu quản lý CLB.');
    }

    if (request.managerId !== userId) {
      throw new ForbiddenException('Bạn không có quyền sửa yêu cầu này.');
    }

    if (request.status === TeamManagerRequestStatus.APPROVED) {
      throw new BadRequestException('Yêu cầu đã duyệt không thể chỉnh sửa.');
    }

    if (dto.requestType === TeamManagerRequestType.UPDATE_MANAGED_TEAM) {
      const teamId = request.teamId ?? user.managedTeamId;
      if (!teamId || teamId !== user.managedTeamId) {
        throw new ForbiddenException('Bạn không có quyền cập nhật CLB này.');
      }

      return this.updateManagedTeamRequest(requestId, teamId, dto);
    }

    if (dto.requestType === TeamManagerRequestType.DELETE_MANAGED_TEAM) {
      const teamId = request.teamId ?? user.managedTeamId;
      if (!teamId || teamId !== user.managedTeamId) {
        throw new ForbiddenException('Bạn không có quyền xóa CLB này.');
      }

      return this.updateDeleteManagedTeamRequest(requestId, teamId, dto);
    }

    if (dto.requestType === TeamManagerRequestType.CLAIM_EXISTING_TEAM) {
      if (!dto.teamId) {
        throw new BadRequestException('Vui lòng chọn CLB muốn quản lý.');
      }

      await this.ensureClaimableTeam(dto.teamId, requestId);

      return this.prisma.teamManagerRequest.update({
        where: { id: requestId },
        data: {
          requestType: TeamManagerRequestType.CLAIM_EXISTING_TEAM,
          status: TeamManagerRequestStatus.PENDING,
          teamId: dto.teamId,
          proposedTeamName: null,
          proposedTeamShortName: null,
          proposedTeamCity: null,
          proposedTeamLogoUrl: null,
          proposedStadiumId: null,
          requestNote: dto.requestNote?.trim() || null,
          adminNote: null,
          reviewedById: null,
          reviewedAt: null,
        },
        include: this.requestInclude,
      });
    }

    if (dto.requestType !== TeamManagerRequestType.CREATE_TEAM) {
      throw new BadRequestException('Loại yêu cầu không hợp lệ.');
    }

    const proposedTeamName = dto.proposedTeamName?.trim();
    if (!proposedTeamName) {
      throw new BadRequestException('Vui lòng nhập tên CLB đề xuất.');
    }

    const existingTeam = await this.prisma.team.findUnique({
      where: { name: proposedTeamName },
      select: { id: true },
    });

    if (existingTeam) {
      throw new ConflictException('Tên CLB này đã tồn tại.');
    }

    if (dto.proposedStadiumId) {
      const stadium = await this.prisma.stadium.findUnique({
        where: { id: dto.proposedStadiumId },
        select: { id: true },
      });

      if (!stadium) {
        throw new NotFoundException('Không tìm thấy sân vận động đề xuất.');
      }
    }

    return this.prisma.teamManagerRequest.update({
      where: { id: requestId },
      data: {
        requestType: TeamManagerRequestType.CREATE_TEAM,
        status: TeamManagerRequestStatus.PENDING,
        teamId: null,
        proposedTeamName,
        proposedTeamShortName: dto.proposedTeamShortName?.trim() || null,
        proposedTeamCity: dto.proposedTeamCity?.trim() || null,
        proposedTeamLogoUrl: dto.proposedTeamLogoUrl?.trim() || null,
        proposedStadiumId: dto.proposedStadiumId || null,
        requestNote: dto.requestNote?.trim() || null,
        adminNote: null,
        reviewedById: null,
        reviewedAt: null,
      },
      include: this.requestInclude,
    });
  }

  async deleteManagementRequest(userId: string, requestId: string) {
    const user = await this.getTeamManagerUser(userId);

    const request = await this.prisma.teamManagerRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        managerId: true,
        status: true,
        teamId: true,
        requestType: true,
      },
    });

    if (!request) {
      throw new NotFoundException('Không tìm thấy yêu cầu quản lý CLB.');
    }

    if (request.managerId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa yêu cầu này.');
    }

    await this.prisma.$transaction(async (tx) => {
      if (
        request.status === TeamManagerRequestStatus.APPROVED &&
        (request.requestType === TeamManagerRequestType.CREATE_TEAM ||
          request.requestType === TeamManagerRequestType.CLAIM_EXISTING_TEAM) &&
        user.managedTeamId &&
        user.managedTeamId === request.teamId
      ) {
        await tx.user.update({
          where: { id: userId },
          data: { managedTeamId: null },
        });
      }

      await tx.teamManagerRequest.delete({ where: { id: requestId } });
    });

    return { success: true };
  }

  async leaveManagedTeam(userId: string) {
    const user = await this.getTeamManagerUser(userId);

    if (!user.managedTeamId) {
      throw new BadRequestException('Bạn chưa quản lý CLB nào.');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { managedTeamId: null },
      });

      await tx.teamManagerRequest.deleteMany({
        where: {
          managerId: userId,
          teamId: user.managedTeamId,
        },
      });
    });

    return { success: true };
  }

  async listManagementRequests(status?: string) {
    const where: Prisma.TeamManagerRequestWhereInput = {};

    if (status) {
      if (!Object.values(TeamManagerRequestStatus).includes(status as never)) {
        throw new BadRequestException('Trạng thái yêu cầu không hợp lệ.');
      }
      where.status = status as TeamManagerRequestStatus;
    }

    return this.prisma.teamManagerRequest.findMany({
      where,
      include: this.requestInclude,
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async reviewManagementRequest(
    requestId: string,
    reviewerId: string,
    dto: ReviewTeamManagerRequestDto,
  ) {
    const request = await this.prisma.teamManagerRequest.findUnique({
      where: { id: requestId },
      include: this.requestInclude,
    });

    if (!request) {
      throw new NotFoundException('Không tìm thấy yêu cầu quản lý CLB.');
    }

    if (request.status !== TeamManagerRequestStatus.PENDING) {
      throw new BadRequestException('Yêu cầu này đã được xét duyệt.');
    }

    if (dto.status === TeamManagerRequestStatus.REJECTED) {
      return this.prisma.teamManagerRequest.update({
        where: { id: requestId },
        data: {
          status: TeamManagerRequestStatus.REJECTED,
          adminNote: dto.adminNote?.trim() || null,
          reviewedById: reviewerId,
          reviewedAt: new Date(),
        },
        include: this.requestInclude,
      });
    }

    if (request.requestType === TeamManagerRequestType.UPDATE_MANAGED_TEAM) {
      if (!request.teamId || request.manager.managedTeamId !== request.teamId) {
        throw new ForbiddenException('Manager không còn quản lý CLB này.');
      }

      return this.approveUpdateManagedTeamRequest(
        request.id,
        reviewerId,
        request.teamId,
        request,
        dto.adminNote,
      );
    }

    if (request.requestType === TeamManagerRequestType.DELETE_MANAGED_TEAM) {
      if (!request.teamId || request.manager.managedTeamId !== request.teamId) {
        throw new ForbiddenException('Manager không còn quản lý CLB này.');
      }

      return this.approveDeleteManagedTeamRequest(
        request.id,
        reviewerId,
        request.teamId,
        request.managerId,
        dto.adminNote,
      );
    }

    if (request.manager.managedTeamId) {
      throw new ConflictException('Manager này đã được gán CLB khác.');
    }

    if (request.requestType === TeamManagerRequestType.CLAIM_EXISTING_TEAM) {
      return this.approveClaimExistingTeamRequest(
        request.id,
        reviewerId,
        request.teamId,
        dto.adminNote,
      );
    }

    return this.approveCreateTeamRequest(
      request.id,
      reviewerId,
      request,
      dto.adminNote,
    );
  }

  async listMyPlayerRequests(userId: string) {
    const user = await this.getTeamManagerUser(userId);
    if (!user.managedTeamId) return [];

    return this.prisma.managerPlayerRequest.findMany({
      where: { managerId: userId, teamId: user.managedTeamId },
      include: this.playerRequestInclude,
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async createPlayerRequest(
    userId: string,
    dto: CreateManagerPlayerRequestDto,
  ) {
    const teamId = await this.requireManagedTeamId(userId);
    const payload = this.buildPlayerRequestPayload(dto);

    if (dto.requestType === ManagerPlayerRequestType.ADD_PLAYER) {
      this.assertRequiredPlayerPayload(payload);
    } else {
      if (!dto.playerId) {
        throw new BadRequestException('Vui lòng chọn cầu thủ cần thao tác.');
      }
      await this.assertPlayerBelongsToTeam(dto.playerId, teamId);
      await this.assertNoPendingPlayerRequest(dto.playerId);
    }

    try {
      return await this.prisma.managerPlayerRequest.create({
        data: {
          managerId: userId,
          teamId,
          playerId: dto.playerId ?? null,
          requestType: dto.requestType,
          payload: payload as Prisma.InputJsonValue,
          requestNote: dto.requestNote?.trim() || null,
        },
        include: this.playerRequestInclude,
      });
    } catch (error) {
      this.handleRequestConflict(error);
      throw error;
    }
  }

  async updatePlayerRequest(
    userId: string,
    requestId: string,
    dto: CreateManagerPlayerRequestDto,
  ) {
    const teamId = await this.requireManagedTeamId(userId);
    const request = await this.prisma.managerPlayerRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        managerId: true,
        teamId: true,
        status: true,
        playerId: true,
      },
    });

    if (!request) {
      throw new NotFoundException('Không tìm thấy yêu cầu cầu thủ.');
    }

    if (request.managerId !== userId || request.teamId !== teamId) {
      throw new ForbiddenException('Bạn không có quyền sửa yêu cầu này.');
    }

    if (request.status === ManagerRequestStatus.APPROVED) {
      throw new BadRequestException('Yêu cầu đã duyệt không thể chỉnh sửa.');
    }

    const payload = this.buildPlayerRequestPayload(dto);

    if (dto.requestType === ManagerPlayerRequestType.ADD_PLAYER) {
      this.assertRequiredPlayerPayload(payload);
    } else {
      if (!dto.playerId) {
        throw new BadRequestException('Vui lòng chọn cầu thủ cần thao tác.');
      }
      await this.assertPlayerBelongsToTeam(dto.playerId, teamId);
      await this.assertNoPendingPlayerRequest(dto.playerId, requestId);
    }

    try {
      return await this.prisma.managerPlayerRequest.update({
        where: { id: requestId },
        data: {
          playerId: dto.playerId ?? null,
          requestType: dto.requestType,
          status: ManagerRequestStatus.PENDING,
          payload: payload as Prisma.InputJsonValue,
          requestNote: dto.requestNote?.trim() || null,
          adminNote: null,
          reviewedById: null,
          reviewedAt: null,
        },
        include: this.playerRequestInclude,
      });
    } catch (error) {
      this.handleRequestConflict(error);
      throw error;
    }
  }

  async deletePlayerRequest(userId: string, requestId: string) {
    const teamId = await this.requireManagedTeamId(userId);
    const request = await this.prisma.managerPlayerRequest.findUnique({
      where: { id: requestId },
      select: { id: true, managerId: true, teamId: true },
    });

    if (!request) {
      throw new NotFoundException('Không tìm thấy yêu cầu cầu thủ.');
    }

    if (request.managerId !== userId || request.teamId !== teamId) {
      throw new ForbiddenException('Bạn không có quyền xóa yêu cầu này.');
    }

    await this.prisma.managerPlayerRequest.delete({ where: { id: requestId } });
    return { success: true };
  }

  async listPlayerRequests(status?: string) {
    const where: Prisma.ManagerPlayerRequestWhereInput = {};
    if (status) {
      where.status = this.parseManagerRequestStatus(status);
    }

    return this.prisma.managerPlayerRequest.findMany({
      where,
      include: this.playerRequestInclude,
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async reviewPlayerRequest(
    requestId: string,
    reviewerId: string,
    dto: ReviewManagerChangeRequestDto,
  ) {
    const request = await this.prisma.managerPlayerRequest.findUnique({
      where: { id: requestId },
      include: this.playerRequestInclude,
    });

    if (!request) {
      throw new NotFoundException('Không tìm thấy yêu cầu cầu thủ.');
    }

    if (request.status !== ManagerRequestStatus.PENDING) {
      throw new BadRequestException('Yêu cầu này đã được xét duyệt.');
    }

    if (dto.status === ManagerRequestStatus.REJECTED) {
      return this.prisma.managerPlayerRequest.update({
        where: { id: requestId },
        data: {
          status: ManagerRequestStatus.REJECTED,
          adminNote: dto.adminNote?.trim() || null,
          reviewedById: reviewerId,
          reviewedAt: new Date(),
        },
        include: this.playerRequestInclude,
      });
    }

    const payload = this.getJsonObject(request.payload);

    if (request.requestType === ManagerPlayerRequestType.ADD_PLAYER) {
      this.assertRequiredPlayerPayload(payload);
      return this.approveAddPlayerRequest(
        request.id,
        reviewerId,
        request.teamId,
        payload,
        dto.adminNote,
      );
    }

    if (!request.playerId) {
      throw new BadRequestException('Yêu cầu chưa có cầu thủ để xét duyệt.');
    }
    await this.assertPlayerBelongsToTeam(request.playerId, request.teamId);

    if (request.requestType === ManagerPlayerRequestType.UPDATE_PLAYER) {
      return this.approveUpdatePlayerRequest(
        request.id,
        reviewerId,
        request.playerId,
        payload,
        dto.adminNote,
      );
    }

    return this.approveRemovePlayerRequest(
      request.id,
      reviewerId,
      request.teamId,
      request.playerId,
      dto.adminNote,
    );
  }

  async listMyStadiumRequests(userId: string) {
    const user = await this.getTeamManagerUser(userId);
    if (!user.managedTeamId) return [];

    return this.prisma.managerStadiumRequest.findMany({
      where: { managerId: userId, teamId: user.managedTeamId },
      include: this.stadiumRequestInclude,
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async createStadiumRequest(
    userId: string,
    dto: CreateManagerStadiumRequestDto,
  ) {
    const teamId = await this.requireManagedTeamId(userId);
    const pending = await this.prisma.managerStadiumRequest.findFirst({
      where: { teamId, status: ManagerRequestStatus.PENDING },
      select: { id: true },
    });

    if (pending) {
      throw new ConflictException('CLB đã có yêu cầu sân nhà đang chờ duyệt.');
    }

    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      select: { stadiumId: true },
    });

    if (!team) {
      throw new NotFoundException('Không tìm thấy CLB quản lý.');
    }

    const payload = this.buildStadiumRequestPayload(dto);
    const isRemoveRequest =
      dto.requestType === ManagerStadiumRequestType.REMOVE_HOME_STADIUM;

    if (isRemoveRequest) {
      if (!team.stadiumId && !dto.stadiumId) {
        throw new BadRequestException('CLB chưa có sân nhà để xóa.');
      }
    } else {
      this.assertRequiredStadiumPayload(payload);
    }

    const stadiumId =
      dto.requestType === ManagerStadiumRequestType.UPDATE_HOME_STADIUM ||
      isRemoveRequest
        ? (dto.stadiumId ?? team.stadiumId)
        : dto.stadiumId;

    try {
      return await this.prisma.managerStadiumRequest.create({
        data: {
          managerId: userId,
          teamId,
          stadiumId: stadiumId ?? null,
          requestType: dto.requestType,
          payload: payload as Prisma.InputJsonValue,
          requestNote: dto.requestNote?.trim() || null,
        },
        include: this.stadiumRequestInclude,
      });
    } catch (error) {
      this.handleRequestConflict(error);
      throw error;
    }
  }

  async updateStadiumRequest(
    userId: string,
    requestId: string,
    dto: CreateManagerStadiumRequestDto,
  ) {
    const teamId = await this.requireManagedTeamId(userId);
    const request = await this.prisma.managerStadiumRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        managerId: true,
        teamId: true,
        status: true,
      },
    });

    if (!request) {
      throw new NotFoundException('Không tìm thấy yêu cầu sân nhà.');
    }

    if (request.managerId !== userId || request.teamId !== teamId) {
      throw new ForbiddenException('Bạn không có quyền sửa yêu cầu này.');
    }

    if (request.status === ManagerRequestStatus.APPROVED) {
      throw new BadRequestException('Yêu cầu đã duyệt không thể chỉnh sửa.');
    }

    const otherPending = await this.prisma.managerStadiumRequest.findFirst({
      where: {
        teamId,
        status: ManagerRequestStatus.PENDING,
        id: { not: requestId },
      },
      select: { id: true },
    });

    if (otherPending) {
      throw new ConflictException('CLB đã có yêu cầu sân nhà đang chờ duyệt.');
    }

    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      select: { stadiumId: true },
    });

    if (!team) {
      throw new NotFoundException('Không tìm thấy CLB quản lý.');
    }

    const payload = this.buildStadiumRequestPayload(dto);
    const isRemoveRequest =
      dto.requestType === ManagerStadiumRequestType.REMOVE_HOME_STADIUM;

    if (isRemoveRequest) {
      if (!team.stadiumId && !dto.stadiumId) {
        throw new BadRequestException('CLB chưa có sân nhà để xóa.');
      }
    } else {
      this.assertRequiredStadiumPayload(payload);
    }

    const stadiumId =
      dto.requestType === ManagerStadiumRequestType.UPDATE_HOME_STADIUM ||
      isRemoveRequest
        ? (dto.stadiumId ?? team.stadiumId)
        : dto.stadiumId;

    try {
      return await this.prisma.managerStadiumRequest.update({
        where: { id: requestId },
        data: {
          stadiumId: stadiumId ?? null,
          requestType: dto.requestType,
          status: ManagerRequestStatus.PENDING,
          payload: payload as Prisma.InputJsonValue,
          requestNote: dto.requestNote?.trim() || null,
          adminNote: null,
          reviewedById: null,
          reviewedAt: null,
        },
        include: this.stadiumRequestInclude,
      });
    } catch (error) {
      this.handleRequestConflict(error);
      throw error;
    }
  }

  async deleteStadiumRequest(userId: string, requestId: string) {
    const teamId = await this.requireManagedTeamId(userId);
    const request = await this.prisma.managerStadiumRequest.findUnique({
      where: { id: requestId },
      select: { id: true, managerId: true, teamId: true },
    });

    if (!request) {
      throw new NotFoundException('Không tìm thấy yêu cầu sân nhà.');
    }

    if (request.managerId !== userId || request.teamId !== teamId) {
      throw new ForbiddenException('Bạn không có quyền xóa yêu cầu này.');
    }

    await this.prisma.managerStadiumRequest.delete({
      where: { id: requestId },
    });
    return { success: true };
  }

  async listStadiumRequests(status?: string) {
    const where: Prisma.ManagerStadiumRequestWhereInput = {};
    if (status) {
      where.status = this.parseManagerRequestStatus(status);
    }

    return this.prisma.managerStadiumRequest.findMany({
      where,
      include: this.stadiumRequestInclude,
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async reviewStadiumRequest(
    requestId: string,
    reviewerId: string,
    dto: ReviewManagerChangeRequestDto,
  ) {
    const request = await this.prisma.managerStadiumRequest.findUnique({
      where: { id: requestId },
      include: this.stadiumRequestInclude,
    });

    if (!request) {
      throw new NotFoundException('Không tìm thấy yêu cầu sân nhà.');
    }

    if (request.status !== ManagerRequestStatus.PENDING) {
      throw new BadRequestException('Yêu cầu này đã được xét duyệt.');
    }

    if (dto.status === ManagerRequestStatus.REJECTED) {
      return this.prisma.managerStadiumRequest.update({
        where: { id: requestId },
        data: {
          status: ManagerRequestStatus.REJECTED,
          adminNote: dto.adminNote?.trim() || null,
          reviewedById: reviewerId,
          reviewedAt: new Date(),
        },
        include: this.stadiumRequestInclude,
      });
    }

    if (request.requestType === ManagerStadiumRequestType.REMOVE_HOME_STADIUM) {
      if (!request.stadiumId) {
        throw new BadRequestException('Yêu cầu chưa có sân nhà để xóa.');
      }

      return this.approveRemoveStadiumRequest(
        request.id,
        reviewerId,
        request.teamId,
        request.stadiumId,
        dto.adminNote,
      );
    }

    const payload = this.getJsonObject(request.payload);
    this.assertRequiredStadiumPayload(payload);

    return this.approveStadiumRequest(
      request.id,
      reviewerId,
      request.teamId,
      payload,
      dto.adminNote,
    );
  }

  async getApplication(userId: string, seasonId: string) {
    const assignment = await this.getAssignment(userId, seasonId);
    if (!assignment) return null;

    return this.prisma.seasonTeam.findUnique({
      where: {
        seasonId_teamId: {
          seasonId,
          teamId: assignment.teamId,
        },
      },
      include: {
        team: {
          include: {
            stadium: true,
          },
        },
        season: true,
      },
    });
  }

  async submitApplication(userId: string, dto: SubmitTeamApplicationDto) {
    this.assertRequiredApplicationFields(dto);

    const assignment = await this.getAssignment(userId, dto.seasonId);
    if (!assignment) {
      throw new ForbiddenException(
        'Tài khoản này chưa được admin gắn với CLB nào.',
      );
    }

    const seasonTeam = await this.prisma.seasonTeam.findUnique({
      where: {
        seasonId_teamId: {
          seasonId: dto.seasonId,
          teamId: assignment.teamId,
        },
      },
    });

    if (!seasonTeam) {
      throw new BadRequestException(
        'CLB chưa đồng ý lời mời hoặc chưa được đăng ký vào mùa giải.',
      );
    }

    const application = await this.prisma.seasonTeam.update({
      where: {
        seasonId_teamId: {
          seasonId: dto.seasonId,
          teamId: assignment.teamId,
        },
      },
      data: {
        ownerName: dto.ownerName.trim(),
        ownerCountry: dto.ownerCountry.trim(),
        ownerAddress: dto.ownerAddress?.trim() || null,
        teamIntroduction: dto.teamIntroduction.trim(),
        primaryKit: dto.primaryKit.trim(),
        backupKit: dto.backupKit.trim(),
        participationFeePaid: dto.participationFeePaid,
        feePaidAt: dto.participationFeePaid ? new Date() : null,
        feeReceiptCode: dto.feeReceiptCode?.trim() || null,
        feeReceiptUrl: dto.feeReceiptUrl?.trim() || null,
        externalCompetitionSchedule: dto.externalCompetitionSchedule.trim(),
        applicationSubmittedAt: new Date(),
        applicationReviewNote: null,
      },
      include: {
        team: {
          include: {
            stadium: true,
          },
        },
        season: true,
      },
    });

    await this.notificationService.notifyAdmins({
      title: 'CLB nộp hồ sơ mùa giải',
      message: `${application.team.name} đã nộp hồ sơ tham dự ${application.season.name}. Vui lòng kiểm tra và xét duyệt.`,
      type: 'SYSTEM',
      entityType: 'season_team',
      entityId: application.id,
    });

    return application;
  }

  async createAssignment(userId: string, seasonId: string, teamId: string) {
    if (!seasonId || !teamId) {
      throw new BadRequestException('seasonId và teamId là bắt buộc.');
    }

    const user = await this.getTeamManagerUser(userId);
    if (!user.managedTeamId) {
      throw new ForbiddenException(
        'Tài khoản này chưa được admin gắn với CLB nào.',
      );
    }

    if (user.managedTeamId !== teamId) {
      throw new ForbiddenException(
        'Tài khoản này chỉ được làm việc với CLB đã được admin gắn.',
      );
    }

    return this.upsertSeasonAssignment(user.id, seasonId, user.managedTeamId);
  }

  private async requireManagedTeamId(userId: string) {
    const user = await this.getTeamManagerUser(userId);
    if (!user.managedTeamId) {
      throw new ForbiddenException(
        'Tài khoản này chưa được Admin duyệt quản lý CLB.',
      );
    }

    return user.managedTeamId;
  }

  private buildPlayerRequestPayload(dto: CreateManagerPlayerRequestDto) {
    const payload: Record<string, string | number> = {};
    if (dto.fullName !== undefined) payload.fullName = dto.fullName.trim();
    if (dto.dob !== undefined) payload.dob = dto.dob;
    if (dto.nationality !== undefined)
      payload.nationality = dto.nationality.trim();
    if (dto.position !== undefined) payload.position = dto.position;
    if (dto.playerType !== undefined) payload.playerType = dto.playerType;
    if (dto.birthPlace !== undefined)
      payload.birthPlace = dto.birthPlace.trim();
    if (dto.heightCm !== undefined) payload.heightCm = dto.heightCm;
    if (dto.weightKg !== undefined) payload.weightKg = dto.weightKg;
    if (dto.careerSummary !== undefined)
      payload.careerSummary = dto.careerSummary.trim();
    return payload;
  }

  private buildStadiumRequestPayload(dto: CreateManagerStadiumRequestDto) {
    const payload: Record<string, string | number> = {};
    if (dto.name !== undefined) payload.name = dto.name.trim();
    if (dto.city !== undefined) payload.city = dto.city.trim();
    if (dto.address !== undefined) payload.address = dto.address.trim();
    if (dto.country !== undefined) payload.country = dto.country.trim();
    if (dto.capacity !== undefined) payload.capacity = dto.capacity;
    if (dto.fifaStars !== undefined) payload.fifaStars = dto.fifaStars;
    return payload;
  }

  private assertRequiredPlayerPayload(payload: Record<string, unknown>) {
    const missing = ['fullName', 'dob', 'nationality', 'position'].filter(
      (field) => !payload[field],
    );

    if (missing.length > 0) {
      throw new BadRequestException(
        `Yêu cầu cầu thủ còn thiếu thông tin: ${missing.join(', ')}`,
      );
    }
  }

  private assertRequiredStadiumPayload(payload: Record<string, unknown>) {
    const missing = ['name', 'city'].filter((field) => !payload[field]);
    if (missing.length > 0) {
      throw new BadRequestException(
        `Yêu cầu sân nhà còn thiếu thông tin: ${missing.join(', ')}`,
      );
    }
  }

  private getJsonObject(value: Prisma.JsonValue): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }
    return value as Record<string, unknown>;
  }

  private parseManagerRequestStatus(status: string) {
    if (!Object.values(ManagerRequestStatus).includes(status as never)) {
      throw new BadRequestException('Trạng thái yêu cầu không hợp lệ.');
    }
    return status as ManagerRequestStatus;
  }

  private async assertNoPendingPlayerRequest(
    playerId: string,
    ignoredRequestId?: string,
  ) {
    const pending = await this.prisma.managerPlayerRequest.findFirst({
      where: {
        playerId,
        status: ManagerRequestStatus.PENDING,
        ...(ignoredRequestId ? { id: { not: ignoredRequestId } } : {}),
        requestType: {
          in: [
            ManagerPlayerRequestType.UPDATE_PLAYER,
            ManagerPlayerRequestType.REMOVE_FROM_TEAM,
          ],
        },
      },
      select: { id: true },
    });

    if (pending) {
      throw new ConflictException(
        'Cầu thủ này đã có yêu cầu đang chờ Admin xét duyệt.',
      );
    }
  }

  private async assertPlayerBelongsToTeam(playerId: string, teamId: string) {
    const roster = await this.prisma.teamPlayer.findFirst({
      where: { playerId, teamId, leftAt: null },
      select: { id: true },
    });

    if (!roster) {
      throw new ForbiddenException(
        'Manager chỉ được gửi yêu cầu với cầu thủ thuộc CLB đang quản lý.',
      );
    }
  }

  private getStringPayload(payload: Record<string, unknown>, key: string) {
    const value = payload[key];
    return typeof value === 'string' ? value.trim() : undefined;
  }

  private getNumberPayload(payload: Record<string, unknown>, key: string) {
    const value = payload[key];
    return typeof value === 'number' ? value : undefined;
  }

  private buildPlayerUpdateData(payload: Record<string, unknown>) {
    const data: Prisma.PlayerUpdateInput = {};
    const fullName = this.getStringPayload(payload, 'fullName');
    const dob = this.getStringPayload(payload, 'dob');
    const nationality = this.getStringPayload(payload, 'nationality');
    const position = this.getStringPayload(payload, 'position');
    const playerType = this.getStringPayload(payload, 'playerType');
    const birthPlace = this.getStringPayload(payload, 'birthPlace');
    const heightCm = this.getNumberPayload(payload, 'heightCm');
    const weightKg = this.getNumberPayload(payload, 'weightKg');
    const careerSummary = this.getStringPayload(payload, 'careerSummary');

    if (fullName !== undefined) data.fullName = fullName;
    if (dob !== undefined) data.dob = new Date(dob);
    if (nationality !== undefined) data.nationality = nationality;
    if (position !== undefined) data.position = position as PlayerPosition;
    if (playerType !== undefined) data.playerType = playerType as PlayerType;
    if (birthPlace !== undefined) data.birthPlace = birthPlace || null;
    if (heightCm !== undefined) data.heightCm = heightCm;
    if (weightKg !== undefined) data.weightKg = weightKg;
    if (careerSummary !== undefined) data.careerSummary = careerSummary;

    return data;
  }

  private buildStadiumCreateData(payload: Record<string, unknown>) {
    return {
      name: this.getStringPayload(payload, 'name')!,
      city: this.getStringPayload(payload, 'city')!,
      address: this.getStringPayload(payload, 'address') || null,
      country: this.getStringPayload(payload, 'country') || 'Việt Nam',
      capacity: this.getNumberPayload(payload, 'capacity') ?? null,
      fifaStars: this.getNumberPayload(payload, 'fifaStars') ?? null,
    };
  }

  private approveAddPlayerRequest(
    requestId: string,
    reviewerId: string,
    teamId: string,
    payload: Record<string, unknown>,
    adminNote?: string,
  ) {
    const playerData = this.buildPlayerUpdateData(payload);

    return this.prisma.$transaction(async (tx) => {
      const player = await tx.player.create({
        data: {
          fullName: playerData.fullName as string,
          dob: playerData.dob as Date,
          nationality: playerData.nationality as string,
          position: (playerData.position ??
            PlayerPosition.FW) as PlayerPosition,
          playerType: (playerData.playerType ??
            PlayerType.DOMESTIC) as PlayerType,
          birthPlace:
            (playerData.birthPlace as string | null | undefined) ?? null,
          heightCm: (playerData.heightCm as number | undefined) ?? null,
          weightKg: (playerData.weightKg as number | undefined) ?? null,
          careerSummary:
            (playerData.careerSummary as string | null | undefined) ?? null,
        },
      });

      await tx.teamPlayer.create({
        data: { teamId, playerId: player.id },
      });

      await tx.managerPlayerRequest.update({
        where: { id: requestId },
        data: {
          status: ManagerRequestStatus.APPROVED,
          playerId: player.id,
          adminNote: adminNote?.trim() || null,
          reviewedById: reviewerId,
          reviewedAt: new Date(),
        },
      });

      return tx.managerPlayerRequest.findUniqueOrThrow({
        where: { id: requestId },
        include: this.playerRequestInclude,
      });
    });
  }

  private approveUpdatePlayerRequest(
    requestId: string,
    reviewerId: string,
    playerId: string,
    payload: Record<string, unknown>,
    adminNote?: string,
  ) {
    const data = this.buildPlayerUpdateData(payload);

    return this.prisma.$transaction(async (tx) => {
      if (Object.keys(data).length > 0) {
        await tx.player.update({ where: { id: playerId }, data });
      }

      await tx.managerPlayerRequest.update({
        where: { id: requestId },
        data: {
          status: ManagerRequestStatus.APPROVED,
          adminNote: adminNote?.trim() || null,
          reviewedById: reviewerId,
          reviewedAt: new Date(),
        },
      });

      return tx.managerPlayerRequest.findUniqueOrThrow({
        where: { id: requestId },
        include: this.playerRequestInclude,
      });
    });
  }

  private approveRemovePlayerRequest(
    requestId: string,
    reviewerId: string,
    teamId: string,
    playerId: string,
    adminNote?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const lineupCount = await tx.matchLineupPlayer.count({
        where: { playerId },
      });
      const otherTeamRosterCount = await tx.teamPlayer.count({
        where: {
          playerId,
          teamId: { not: teamId },
        },
      });

      await tx.managerPlayerRequest.update({
        where: { id: requestId },
        data: {
          status: ManagerRequestStatus.APPROVED,
          playerId: null,
          adminNote: adminNote?.trim() || null,
          reviewedById: reviewerId,
          reviewedAt: new Date(),
        },
      });

      if (lineupCount > 0) {
        throw new BadRequestException(
          'Không thể xóa cầu thủ vì cầu thủ đã nằm trong đội hình trận đấu. Hãy gỡ khỏi CLB thay vì xóa dữ liệu.',
        );
      }

      if (otherTeamRosterCount > 0) {
        throw new BadRequestException(
          'Không thể xóa cầu thủ vì cầu thủ còn lịch sử ở CLB khác.',
        );
      }

      await tx.teamPlayer.deleteMany({
        where: { teamId, playerId },
      });
      await tx.player.delete({ where: { id: playerId } });

      return tx.managerPlayerRequest.findUniqueOrThrow({
        where: { id: requestId },
        include: this.playerRequestInclude,
      });
    });
  }

  private approveStadiumRequest(
    requestId: string,
    reviewerId: string,
    teamId: string,
    payload: Record<string, unknown>,
    adminNote?: string,
  ) {
    const stadiumData = this.buildStadiumCreateData(payload);

    return this.prisma.$transaction(async (tx) => {
      const stadium = await tx.stadium.create({ data: stadiumData });

      await tx.team.update({
        where: { id: teamId },
        data: { stadiumId: stadium.id },
      });

      await tx.managerStadiumRequest.update({
        where: { id: requestId },
        data: {
          status: ManagerRequestStatus.APPROVED,
          stadiumId: stadium.id,
          adminNote: adminNote?.trim() || null,
          reviewedById: reviewerId,
          reviewedAt: new Date(),
        },
      });

      return tx.managerStadiumRequest.findUniqueOrThrow({
        where: { id: requestId },
        include: this.stadiumRequestInclude,
      });
    });
  }

  private approveRemoveStadiumRequest(
    requestId: string,
    reviewerId: string,
    teamId: string,
    stadiumId: string,
    adminNote?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const otherTeamsUsingStadium = await tx.team.count({
        where: {
          stadiumId,
          id: { not: teamId },
        },
      });

      if (otherTeamsUsingStadium > 0) {
        throw new BadRequestException(
          'Không thể xóa sân vì sân đang được CLB khác sử dụng.',
        );
      }

      await tx.managerStadiumRequest.update({
        where: { id: requestId },
        data: {
          status: ManagerRequestStatus.APPROVED,
          stadiumId: null,
          adminNote: adminNote?.trim() || null,
          reviewedById: reviewerId,
          reviewedAt: new Date(),
        },
      });

      await tx.team.update({
        where: { id: teamId },
        data: { stadiumId: null },
      });
      await tx.stadium.delete({ where: { id: stadiumId } });

      return tx.managerStadiumRequest.findUniqueOrThrow({
        where: { id: requestId },
        include: this.stadiumRequestInclude,
      });
    });
  }

  private async getTeamManagerUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, managedTeamId: true },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng.');
    }

    if (user.role !== 'TEAM_MANAGER') {
      throw new BadRequestException('Chỉ tài khoản TEAM_MANAGER quản lý CLB.');
    }

    return user;
  }

  private async createClaimExistingTeamRequest(
    userId: string,
    dto: CreateTeamManagerRequestDto,
  ) {
    if (!dto.teamId) {
      throw new BadRequestException('Vui lòng chọn CLB muốn quản lý.');
    }

    await this.ensureClaimableTeam(dto.teamId);

    try {
      return await this.prisma.teamManagerRequest.create({
        data: {
          managerId: userId,
          requestType: TeamManagerRequestType.CLAIM_EXISTING_TEAM,
          teamId: dto.teamId,
          requestNote: dto.requestNote?.trim() || null,
        },
        include: this.requestInclude,
      });
    } catch (error) {
      this.handleRequestConflict(error);
      throw error;
    }
  }

  private async createNewTeamRequest(
    userId: string,
    dto: CreateTeamManagerRequestDto,
  ) {
    const proposedTeamName = dto.proposedTeamName?.trim();
    if (!proposedTeamName) {
      throw new BadRequestException('Vui lòng nhập tên CLB đề xuất.');
    }

    const existingTeam = await this.prisma.team.findUnique({
      where: { name: proposedTeamName },
      select: { id: true },
    });

    if (existingTeam) {
      throw new ConflictException('Tên CLB này đã tồn tại.');
    }

    if (dto.proposedStadiumId) {
      const stadium = await this.prisma.stadium.findUnique({
        where: { id: dto.proposedStadiumId },
        select: { id: true },
      });

      if (!stadium) {
        throw new NotFoundException('Không tìm thấy sân vận động đề xuất.');
      }
    }

    try {
      return await this.prisma.teamManagerRequest.create({
        data: {
          managerId: userId,
          requestType: TeamManagerRequestType.CREATE_TEAM,
          proposedTeamName,
          proposedTeamShortName: dto.proposedTeamShortName?.trim() || null,
          proposedTeamCity: dto.proposedTeamCity?.trim() || null,
          proposedTeamLogoUrl: dto.proposedTeamLogoUrl?.trim() || null,
          proposedStadiumId: dto.proposedStadiumId || null,
          requestNote: dto.requestNote?.trim() || null,
        },
        include: this.requestInclude,
      });
    } catch (error) {
      this.handleRequestConflict(error);
      throw error;
    }
  }

  private async createUpdateManagedTeamRequest(
    userId: string,
    teamId: string,
    dto: CreateTeamManagerRequestDto,
  ) {
    await this.assertManagedTeamUpdatePayload(teamId, dto);

    return this.prisma.teamManagerRequest.create({
      data: {
        managerId: userId,
        requestType: TeamManagerRequestType.UPDATE_MANAGED_TEAM,
        teamId,
        proposedTeamName: dto.proposedTeamName!.trim(),
        proposedTeamShortName: dto.proposedTeamShortName?.trim() || null,
        proposedTeamCity: dto.proposedTeamCity?.trim() || null,
        proposedTeamLogoUrl: dto.proposedTeamLogoUrl?.trim() || null,
        proposedStadiumId: null,
        requestNote: dto.requestNote?.trim() || null,
      },
      include: this.requestInclude,
    });
  }

  private async createDeleteManagedTeamRequest(
    userId: string,
    teamId: string,
    dto: CreateTeamManagerRequestDto,
  ) {
    return this.prisma.teamManagerRequest.create({
      data: {
        managerId: userId,
        requestType: TeamManagerRequestType.DELETE_MANAGED_TEAM,
        teamId,
        requestNote: dto.requestNote?.trim() || null,
      },
      include: this.requestInclude,
    });
  }

  private async updateManagedTeamRequest(
    requestId: string,
    teamId: string,
    dto: CreateTeamManagerRequestDto,
  ) {
    await this.assertManagedTeamUpdatePayload(teamId, dto);

    return this.prisma.teamManagerRequest.update({
      where: { id: requestId },
      data: {
        requestType: TeamManagerRequestType.UPDATE_MANAGED_TEAM,
        status: TeamManagerRequestStatus.PENDING,
        teamId,
        proposedTeamName: dto.proposedTeamName!.trim(),
        proposedTeamShortName: dto.proposedTeamShortName?.trim() || null,
        proposedTeamCity: dto.proposedTeamCity?.trim() || null,
        proposedTeamLogoUrl: dto.proposedTeamLogoUrl?.trim() || null,
        proposedStadiumId: null,
        requestNote: dto.requestNote?.trim() || null,
        adminNote: null,
        reviewedById: null,
        reviewedAt: null,
      },
      include: this.requestInclude,
    });
  }

  private async updateDeleteManagedTeamRequest(
    requestId: string,
    teamId: string,
    dto: CreateTeamManagerRequestDto,
  ) {
    return this.prisma.teamManagerRequest.update({
      where: { id: requestId },
      data: {
        requestType: TeamManagerRequestType.DELETE_MANAGED_TEAM,
        status: TeamManagerRequestStatus.PENDING,
        teamId,
        proposedTeamName: null,
        proposedTeamShortName: null,
        proposedTeamCity: null,
        proposedTeamLogoUrl: null,
        proposedStadiumId: null,
        requestNote: dto.requestNote?.trim() || null,
        adminNote: null,
        reviewedById: null,
        reviewedAt: null,
      },
      include: this.requestInclude,
    });
  }

  private async assertManagedTeamUpdatePayload(
    teamId: string,
    dto: CreateTeamManagerRequestDto,
  ) {
    const proposedTeamName = dto.proposedTeamName?.trim();
    if (!proposedTeamName) {
      throw new BadRequestException('Vui lòng nhập tên CLB đề xuất.');
    }

    const existingTeam = await this.prisma.team.findUnique({
      where: { name: proposedTeamName },
      select: { id: true },
    });

    if (existingTeam && existingTeam.id !== teamId) {
      throw new ConflictException('Tên CLB này đã tồn tại.');
    }
  }

  private async approveClaimExistingTeamRequest(
    requestId: string,
    reviewerId: string,
    teamId?: string | null,
    adminNote?: string,
  ) {
    if (!teamId) {
      throw new BadRequestException('Yêu cầu chưa có CLB để duyệt.');
    }

    await this.ensureClaimableTeam(teamId, requestId);

    return this.prisma.$transaction(async (tx) => {
      const request = await tx.teamManagerRequest.update({
        where: { id: requestId },
        data: {
          status: TeamManagerRequestStatus.APPROVED,
          adminNote: adminNote?.trim() || null,
          reviewedById: reviewerId,
          reviewedAt: new Date(),
        },
        select: { managerId: true, teamId: true },
      });

      await tx.user.update({
        where: { id: request.managerId },
        data: { managedTeamId: request.teamId },
      });

      return tx.teamManagerRequest.findUniqueOrThrow({
        where: { id: requestId },
        include: this.requestInclude,
      });
    });
  }

  private async approveCreateTeamRequest(
    requestId: string,
    reviewerId: string,
    request: {
      managerId: string;
      proposedTeamName: string | null;
      proposedTeamShortName: string | null;
      proposedTeamCity: string | null;
      proposedTeamLogoUrl: string | null;
      proposedStadiumId: string | null;
    },
    adminNote?: string,
  ) {
    if (!request.proposedTeamName?.trim()) {
      throw new BadRequestException('Yêu cầu chưa có tên CLB đề xuất.');
    }

    const existingTeam = await this.prisma.team.findUnique({
      where: { name: request.proposedTeamName },
      select: { id: true },
    });

    if (existingTeam) {
      throw new ConflictException('Tên CLB này đã tồn tại.');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const team = await tx.team.create({
          data: {
            name: request.proposedTeamName!.trim(),
            shortName: request.proposedTeamShortName?.trim() || null,
            city: request.proposedTeamCity?.trim() || null,
            logoUrl: request.proposedTeamLogoUrl?.trim() || null,
            stadiumId: request.proposedStadiumId || null,
            status: 'ACTIVE',
          },
        });

        await tx.teamManagerRequest.update({
          where: { id: requestId },
          data: {
            status: TeamManagerRequestStatus.APPROVED,
            teamId: team.id,
            adminNote: adminNote?.trim() || null,
            reviewedById: reviewerId,
            reviewedAt: new Date(),
          },
        });

        await tx.user.update({
          where: { id: request.managerId },
          data: { managedTeamId: team.id },
        });

        return tx.teamManagerRequest.findUniqueOrThrow({
          where: { id: requestId },
          include: this.requestInclude,
        });
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Tên CLB này đã tồn tại.');
      }
      throw error;
    }
  }

  private async approveUpdateManagedTeamRequest(
    requestId: string,
    reviewerId: string,
    teamId: string,
    request: {
      proposedTeamName: string | null;
      proposedTeamShortName: string | null;
      proposedTeamCity: string | null;
      proposedTeamLogoUrl: string | null;
    },
    adminNote?: string,
  ) {
    if (!request.proposedTeamName?.trim()) {
      throw new BadRequestException('Yêu cầu chưa có tên CLB đề xuất.');
    }

    const existingTeam = await this.prisma.team.findUnique({
      where: { name: request.proposedTeamName },
      select: { id: true },
    });

    if (existingTeam && existingTeam.id !== teamId) {
      throw new ConflictException('Tên CLB này đã tồn tại.');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.team.update({
        where: { id: teamId },
        data: {
          name: request.proposedTeamName!.trim(),
          shortName: request.proposedTeamShortName?.trim() || null,
          city: request.proposedTeamCity?.trim() || null,
          logoUrl: request.proposedTeamLogoUrl?.trim() || null,
        },
      });

      await tx.teamManagerRequest.update({
        where: { id: requestId },
        data: {
          status: TeamManagerRequestStatus.APPROVED,
          adminNote: adminNote?.trim() || null,
          reviewedById: reviewerId,
          reviewedAt: new Date(),
        },
      });

      return tx.teamManagerRequest.findUniqueOrThrow({
        where: { id: requestId },
        include: this.requestInclude,
      });
    });
  }

  private async approveDeleteManagedTeamRequest(
    requestId: string,
    reviewerId: string,
    teamId: string,
    managerId: string,
    adminNote?: string,
  ) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: managerId },
          data: { managedTeamId: null },
        });

        await tx.teamManagerRequest.update({
          where: { id: requestId },
          data: {
            status: TeamManagerRequestStatus.APPROVED,
            adminNote: adminNote?.trim() || null,
            reviewedById: reviewerId,
            reviewedAt: new Date(),
          },
        });

        await tx.team.delete({ where: { id: teamId } });

        return tx.teamManagerRequest.findUniqueOrThrow({
          where: { id: requestId },
          include: this.requestInclude,
        });
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          'Không thể xóa CLB vì đang có dữ liệu ràng buộc.',
        );
      }
      throw error;
    }
  }

  private async ensureClaimableTeam(teamId: string, ignoredRequestId?: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      select: {
        id: true,
        status: true,
        managedUsers: {
          where: { role: UserRole.TEAM_MANAGER },
          select: { id: true },
          take: 1,
        },
        managerRequests: {
          where: {
            status: TeamManagerRequestStatus.PENDING,
            requestType: TeamManagerRequestType.CLAIM_EXISTING_TEAM,
            ...(ignoredRequestId ? { id: { not: ignoredRequestId } } : {}),
          },
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Không tìm thấy CLB được chọn.');
    }

    if (team.status !== 'ACTIVE') {
      throw new BadRequestException('Chỉ có thể quản lý CLB đang hoạt động.');
    }

    if (team.managedUsers.length > 0) {
      throw new ConflictException('CLB này đã có Manager được duyệt.');
    }

    if ((team.managerRequests ?? []).length > 0) {
      throw new ConflictException('CLB này đã có yêu cầu chờ duyệt.');
    }
  }

  private handleRequestConflict(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(
        'Yêu cầu này bị trùng với một yêu cầu đang chờ duyệt.',
      );
    }
  }

  private upsertSeasonAssignment(
    userId: string,
    seasonId: string,
    teamId: string,
  ) {
    return this.prisma.teamManagerAssignment.upsert({
      where: { userId_seasonId: { userId, seasonId } },
      update: { teamId },
      create: { userId, seasonId, teamId },
      include: this.assignmentInclude,
    });
  }

  private assertRequiredApplicationFields(dto: SubmitTeamApplicationDto) {
    const requiredFields = [
      ['ownerName', dto.ownerName],
      ['ownerCountry', dto.ownerCountry],
      ['teamIntroduction', dto.teamIntroduction],
      ['primaryKit', dto.primaryKit],
      ['backupKit', dto.backupKit],
      ['externalCompetitionSchedule', dto.externalCompetitionSchedule],
    ] as const;

    const missing = requiredFields
      .filter(([, value]) => !value?.trim())
      .map(([field]) => field);

    if (missing.length > 0) {
      throw new BadRequestException(
        `Hồ sơ còn thiếu thông tin bắt buộc: ${missing.join(', ')}`,
      );
    }
  }
}

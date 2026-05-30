import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { TeamManagerService } from './team-manager.service';

describe('TeamManagerService application workflow', () => {
  let service: TeamManagerService;
  let prisma: PrismaService;

  const assignment = {
    id: 'assignment-1',
    userId: 'manager-1',
    seasonId: 'season-1',
    teamId: 'team-1',
  };
  const managerUser = {
    id: 'manager-1',
    role: 'TEAM_MANAGER',
    managedTeamId: 'team-1',
  };

  const applicationPayload = {
    seasonId: 'season-1',
    ownerName: 'Công ty Cổ phần Bóng đá Hà Nội',
    ownerCountry: 'Việt Nam',
    ownerAddress: 'Hà Nội',
    teamIntroduction: 'Đội bóng đại diện Thủ đô.',
    primaryKit: 'Áo tím, quần trắng',
    backupKit: 'Áo trắng, quần tím',
    participationFeePaid: true,
    feeReceiptCode: 'REC-001',
    externalCompetitionSchedule: 'Cúp Quốc gia 2026',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamManagerService,
        {
          provide: PrismaService,
          useValue: {
            teamManagerAssignment: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              upsert: jest.fn(),
            },
            teamManagerRequest: {
              findFirst: jest.fn(),
              create: jest.fn(),
            },
            user: { findUnique: jest.fn() },
            team: { findUnique: jest.fn() },
            seasonTeam: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<TeamManagerService>(TeamManagerService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(managerUser as any);
    jest
      .spyOn(prisma.teamManagerAssignment, 'upsert')
      .mockResolvedValue(assignment as any);
  });

  it('loads the current manager application for a season', async () => {
    jest.spyOn(prisma.seasonTeam, 'findUnique').mockResolvedValue({
      id: 'season-team-1',
      seasonId: 'season-1',
      teamId: 'team-1',
      ownerName: null,
      applicationSubmittedAt: null,
    } as any);

    const result = await service.getApplication('manager-1', 'season-1');

    expect(result?.id).toBe('season-team-1');
    expect(prisma.teamManagerAssignment.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId_seasonId: { userId: 'manager-1', seasonId: 'season-1' },
        },
        create: { userId: 'manager-1', seasonId: 'season-1', teamId: 'team-1' },
        update: { teamId: 'team-1' },
      }),
    );
    expect(prisma.seasonTeam.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { seasonId_teamId: { seasonId: 'season-1', teamId: 'team-1' } },
      }),
    );
  });

  it('loads the fixed managed club without requiring a season', async () => {
    jest.spyOn(prisma.team, 'findUnique').mockResolvedValue({
      id: 'team-1',
      name: 'Hà Nội FC',
      shortName: 'HN',
      status: 'ACTIVE',
    } as any);

    const result = await service.getManagedTeam('manager-1');

    expect(result?.id).toBe('team-1');
    expect(prisma.team.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'team-1' },
      }),
    );
    expect(prisma.teamManagerAssignment.upsert).not.toHaveBeenCalled();
  });

  it('submits application information for the assigned team', async () => {
    jest.spyOn(prisma.seasonTeam, 'findUnique').mockResolvedValue({
      id: 'season-team-1',
      seasonId: 'season-1',
      teamId: 'team-1',
    } as any);
    jest.spyOn(prisma.seasonTeam, 'update').mockResolvedValue({
      id: 'season-team-1',
      ...applicationPayload,
      applicationSubmittedAt: new Date(),
    } as any);

    const result = await service.submitApplication(
      'manager-1',
      applicationPayload,
    );

    expect(result.id).toBe('season-team-1');
    expect(prisma.seasonTeam.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { seasonId_teamId: { seasonId: 'season-1', teamId: 'team-1' } },
        data: expect.objectContaining({
          ownerName: applicationPayload.ownerName,
          ownerCountry: applicationPayload.ownerCountry,
          participationFeePaid: true,
          applicationSubmittedAt: expect.any(Date),
          applicationReviewNote: null,
        }),
      }),
    );
  });

  it('rejects application submission when manager has no fixed CLB', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({
      ...managerUser,
      managedTeamId: null,
    } as any);

    await expect(
      service.submitApplication('manager-1', applicationPayload),
    ).rejects.toThrow(ForbiddenException);
  });

  it('prevents a manager account from choosing another CLB', async () => {
    await expect(
      service.createAssignment('manager-1', 'season-1', 'team-2'),
    ).rejects.toThrow(ForbiddenException);
    expect(prisma.teamManagerAssignment.upsert).not.toHaveBeenCalled();
  });

  it('rejects application submission when required fields are missing', async () => {
    await expect(
      service.submitApplication('manager-1', {
        ...applicationPayload,
        ownerName: '',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('creates a request to claim an existing club when manager has no approved club', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({
      ...managerUser,
      managedTeamId: null,
    } as any);
    jest.spyOn(prisma.teamManagerRequest, 'findFirst').mockResolvedValue(null);
    jest.spyOn(prisma.team, 'findUnique').mockResolvedValue({
      id: 'team-2',
      status: 'ACTIVE',
      managedUsers: [],
    } as any);
    jest.spyOn(prisma.teamManagerRequest, 'create').mockResolvedValue({
      id: 'request-1',
      managerId: 'manager-1',
      teamId: 'team-2',
      requestType: 'CLAIM_EXISTING_TEAM',
      status: 'PENDING',
    } as any);

    const result = await service.createManagementRequest('manager-1', {
      requestType: 'CLAIM_EXISTING_TEAM' as any,
      teamId: 'team-2',
      requestNote: 'Tôi đang điều hành CLB này',
    });

    expect(result.id).toBe('request-1');
    expect(prisma.teamManagerRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          managerId: 'manager-1',
          requestType: 'CLAIM_EXISTING_TEAM',
          teamId: 'team-2',
        }),
      }),
    );
  });

  it('prevents a manager from opening a second pending request', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({
      ...managerUser,
      managedTeamId: null,
    } as any);
    jest
      .spyOn(prisma.teamManagerRequest, 'findFirst')
      .mockResolvedValue({ id: 'request-1' } as any);

    await expect(
      service.createManagementRequest('manager-1', {
        requestType: 'CLAIM_EXISTING_TEAM' as any,
        teamId: 'team-2',
      }),
    ).rejects.toThrow(ConflictException);
    expect(prisma.teamManagerRequest.create).not.toHaveBeenCalled();
  });
});

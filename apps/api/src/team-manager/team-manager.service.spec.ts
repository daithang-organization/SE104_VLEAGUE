import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from '../notification/notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { TeamManagerService } from './team-manager.service';

describe('TeamManagerService application workflow', () => {
  let service: TeamManagerService;
  let prisma: PrismaService;
  let notificationService: NotificationService;

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
    feeReceiptUrl: 'https://storage.example/receipts/rec-001.pdf',
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
            team: { findUnique: jest.fn(), update: jest.fn() },
            seasonTeam: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: NotificationService,
          useValue: {
            notifyAdmins: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<TeamManagerService>(TeamManagerService);
    prisma = module.get<PrismaService>(PrismaService);
    notificationService = module.get<NotificationService>(NotificationService);

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
      team: { name: 'Hà Nội FC' },
      season: { name: 'V.League 2026' },
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
          feeReceiptCode: 'REC-001',
          feeReceiptUrl: 'https://storage.example/receipts/rec-001.pdf',
          applicationSubmittedAt: expect.any(Date),
          applicationReviewNote: null,
        }),
      }),
    );
    expect((notificationService as any).notifyAdmins).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'CLB nộp hồ sơ mùa giải',
        message: expect.stringContaining('Hà Nội FC'),
        type: 'SYSTEM',
        entityType: 'season_team',
        entityId: 'season-team-1',
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

  it('rejects application submission when external competition schedule is missing', async () => {
    await expect(
      service.submitApplication('manager-1', {
        ...applicationPayload,
        externalCompetitionSchedule: ' ',
      }),
    ).rejects.toThrow('externalCompetitionSchedule');
    expect(prisma.teamManagerAssignment.upsert).not.toHaveBeenCalled();
  });
});

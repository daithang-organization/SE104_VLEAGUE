import { BadRequestException, ForbiddenException } from '@nestjs/common';
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
            },
            user: { findUnique: jest.fn() },
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
  });

  it('loads the current manager application for a season', async () => {
    jest
      .spyOn(prisma.teamManagerAssignment, 'findUnique')
      .mockResolvedValue(assignment as any);
    jest.spyOn(prisma.seasonTeam, 'findUnique').mockResolvedValue({
      id: 'season-team-1',
      seasonId: 'season-1',
      teamId: 'team-1',
      ownerName: null,
      applicationSubmittedAt: null,
    } as any);

    const result = await service.getApplication('manager-1', 'season-1');

    expect(result?.id).toBe('season-team-1');
    expect(prisma.seasonTeam.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { seasonId_teamId: { seasonId: 'season-1', teamId: 'team-1' } },
      }),
    );
  });

  it('submits application information for the assigned team', async () => {
    jest
      .spyOn(prisma.teamManagerAssignment, 'findUnique')
      .mockResolvedValue(assignment as any);
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

  it('rejects application submission when manager has no team assignment', async () => {
    jest
      .spyOn(prisma.teamManagerAssignment, 'findUnique')
      .mockResolvedValue(null);

    await expect(
      service.submitApplication('manager-1', applicationPayload),
    ).rejects.toThrow(ForbiddenException);
  });

  it('rejects application submission when required fields are missing', async () => {
    await expect(
      service.submitApplication('manager-1', {
        ...applicationPayload,
        ownerName: '',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});

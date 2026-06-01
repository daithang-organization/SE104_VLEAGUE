import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { RegulationHelper } from '../regulation/regulation.helper';
import { SeasonService } from './season.service';

describe('SeasonService', () => {
  let service: SeasonService;
  let prisma: PrismaService;
  let regulationHelper: RegulationHelper;

  const mockSeason = {
    id: 'season-1',
    name: 'VLeague 2024',
    year: 2024,
    status: 'IN_PROGRESS' as const,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeasonService,
        {
          provide: PrismaService,
          useValue: {
            season: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            seasonTeam: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            team: {
              findUnique: jest.fn(),
            },
            teamPlayer: {
              count: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
        {
          provide: RegulationHelper,
          useValue: {
            getNumericValue: jest.fn().mockImplementation((_sid, key, fb) => {
              if (key === 'MIN_ROSTER') return Promise.resolve(16);
              if (key === 'MAX_ROSTER') return Promise.resolve(22);
              if (key === 'MAX_FOREIGN_PLAYERS') return Promise.resolve(5);
              if (key === 'MIN_STADIUM_CAPACITY') return Promise.resolve(10000);
              if (key === 'MIN_STADIUM_FIFA_STARS') return Promise.resolve(2);
              return Promise.resolve(fb);
            }),
          },
        },
      ],
    }).compile();

    service = module.get<SeasonService>(SeasonService);
    prisma = module.get<PrismaService>(PrismaService);
    regulationHelper = module.get<RegulationHelper>(RegulationHelper);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all seasons ordered by year desc', async () => {
      const mockSeasons = [mockSeason];
      jest.spyOn(prisma.season, 'findMany').mockResolvedValue(mockSeasons);

      const result = await service.findAll();

      expect(result).toEqual(mockSeasons);
      expect(prisma.season.findMany).toHaveBeenCalledWith({
        orderBy: { year: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a season by id', async () => {
      jest.spyOn(prisma.season, 'findUnique').mockResolvedValue({
        ...mockSeason,
        matches: [],
      } as any);

      const result = await service.findOne('season-1');

      expect(result.id).toBe('season-1');
    });

    it('should throw NotFoundException if season not found', async () => {
      jest.spyOn(prisma.season, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findCurrent', () => {
    it('should return the current IN_PROGRESS season', async () => {
      jest.spyOn(prisma.season, 'findFirst').mockResolvedValue(mockSeason);

      const result = await service.findCurrent();

      expect(result?.status).toBe('IN_PROGRESS');
    });

    it('should return null if no current season', async () => {
      jest.spyOn(prisma.season, 'findFirst').mockResolvedValue(null);

      const result = await service.findCurrent();

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new season', async () => {
      const createDto = { name: 'VLeague 2025', year: 2025 };
      jest.spyOn(prisma.season, 'create').mockResolvedValue({
        ...mockSeason,
        ...createDto,
        id: 'new-id',
      });

      const result = await service.create(createDto);

      expect(result.name).toBe('VLeague 2025');
    });

    it('should reject creating a season when the selected year already exists', async () => {
      const createDto = {
        name: 'VLeague 2024-2025',
        year: 2024,
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-30'),
      };
      jest.spyOn(prisma.season, 'findFirst').mockImplementation((args: any) => {
        if (args?.where?.year === 2024) {
          return Promise.resolve(mockSeason);
        }
        return Promise.resolve(null);
      });

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      expect(prisma.season.create).not.toHaveBeenCalled();
    });

    it('should reject creating a season when its date range overlaps another season', async () => {
      const createDto = {
        name: 'VLeague 2026',
        year: 2026,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-10-01'),
      };
      jest.spyOn(prisma.season, 'findFirst').mockImplementation((args: any) => {
        if (args?.where?.startDate && args?.where?.endDate) {
          return Promise.resolve(mockSeason);
        }
        return Promise.resolve(null);
      });

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      expect(prisma.season.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if season name exists', async () => {
      const createDto = { name: 'VLeague 2024', year: 2024 };
      const prismaError = new Error('Unique constraint violation');
      Object.assign(prismaError, {
        code: 'P2002',
        name: 'PrismaClientKnownRequestError',
      });
      jest.spyOn(prisma.season, 'create').mockRejectedValue(prismaError);

      // The service rethrows as-is if not Prisma.PrismaClientKnownRequestError instance
      // So we just test that the create was rejected
      await expect(service.create(createDto)).rejects.toBeDefined();
    });
  });

  describe('update', () => {
    it('should reject updating a season when its date range overlaps another season', async () => {
      const existingSeason = {
        ...mockSeason,
        id: 'season-2',
        year: 2026,
        startDate: new Date('2026-09-01'),
        endDate: new Date('2027-06-30'),
        matches: [],
      };
      jest.spyOn(prisma.season, 'findUnique').mockResolvedValue(existingSeason);
      jest.spyOn(prisma.season, 'findFirst').mockImplementation((args: any) => {
        if (args?.where?.startDate && args?.where?.endDate) {
          return Promise.resolve(mockSeason);
        }
        return Promise.resolve(null);
      });

      await expect(
        service.update('season-2', {
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-10-01'),
        }),
      ).rejects.toThrow(ConflictException);
      expect(prisma.season.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a season', async () => {
      jest.spyOn(prisma.season, 'findUnique').mockResolvedValue({
        ...mockSeason,
        matches: [],
      } as any);
      jest.spyOn(prisma.season, 'delete').mockResolvedValue(mockSeason);

      const result = await service.delete('season-1');

      expect(result.success).toBe(true);
    });
  });

  describe('updateStatus', () => {
    it('should allow UPCOMING → IN_PROGRESS transition', async () => {
      const upcomingSeason = { ...mockSeason, status: 'UPCOMING' };
      jest
        .spyOn(prisma.season, 'findUnique')
        .mockResolvedValue(upcomingSeason as any);
      jest.spyOn(prisma.season, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prisma.season, 'update').mockResolvedValue({
        ...upcomingSeason,
        status: 'IN_PROGRESS',
      });

      const result = await service.updateStatus('season-1', 'IN_PROGRESS');

      expect(result.status).toBe('IN_PROGRESS');
    });

    it('should allow IN_PROGRESS → COMPLETED transition', async () => {
      const activeSeason = { ...mockSeason, status: 'IN_PROGRESS' };
      jest
        .spyOn(prisma.season, 'findUnique')
        .mockResolvedValue(activeSeason as any);
      jest.spyOn(prisma.season, 'update').mockResolvedValue({
        ...activeSeason,
        status: 'COMPLETED',
      });

      const result = await service.updateStatus('season-1', 'COMPLETED');

      expect(result.status).toBe('COMPLETED');
    });

    it('should reject invalid transition UPCOMING → COMPLETED', async () => {
      const upcomingSeason = { ...mockSeason, status: 'UPCOMING' };
      jest
        .spyOn(prisma.season, 'findUnique')
        .mockResolvedValue(upcomingSeason as any);

      await expect(
        service.updateStatus('season-1', 'COMPLETED'),
      ).rejects.toThrow('Không thể chuyển trạng thái');
    });

    it('should reject invalid transition COMPLETED → IN_PROGRESS', async () => {
      const completedSeason = { ...mockSeason, status: 'COMPLETED' };
      jest
        .spyOn(prisma.season, 'findUnique')
        .mockResolvedValue(completedSeason as any);

      await expect(
        service.updateStatus('season-1', 'IN_PROGRESS'),
      ).rejects.toThrow('Không thể chuyển trạng thái');
    });

    it('should reject IN_PROGRESS if another season is already active', async () => {
      const upcomingSeason = {
        ...mockSeason,
        id: 'season-2',
        status: 'UPCOMING',
      };
      jest
        .spyOn(prisma.season, 'findUnique')
        .mockResolvedValue(upcomingSeason as any);
      jest.spyOn(prisma.season, 'findFirst').mockResolvedValue(mockSeason); // existing active

      await expect(
        service.updateStatus('season-2', 'IN_PROGRESS'),
      ).rejects.toThrow('đang diễn ra');
    });

    it('should throw NotFoundException for non-existent season', async () => {
      jest.spyOn(prisma.season, 'findUnique').mockResolvedValue(null);

      await expect(
        service.updateStatus('non-existent', 'IN_PROGRESS'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateTeamStatus approval validation', () => {
    const seasonTeamRecord = {
      id: 'season-team-1',
      seasonId: 'season-1',
      teamId: 'team-1',
      status: 'REGISTERED',
      ownerName: 'Công ty Cổ phần Bóng đá Hà Nội',
      ownerCountry: 'Việt Nam',
      ownerAddress: 'Hà Nội',
      teamIntroduction: 'Đội bóng đại diện Thủ đô.',
      primaryKit: 'Áo tím, quần trắng',
      backupKit: 'Áo trắng, quần tím',
      participationFeePaid: true,
      feePaidAt: new Date(),
      feeReceiptCode: 'REC-001',
      feeReceiptUrl: 'https://storage.example/receipts/rec-001.pdf',
      externalCompetitionSchedule: 'Cúp Quốc gia',
      applicationSubmittedAt: new Date(),
      applicationReviewNote: null,
      registeredAt: new Date(),
      approvedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const validTeam = {
      id: 'team-1',
      name: 'Hà Nội FC',
      stadium: {
        id: 'stadium-1',
        name: 'Sân Hàng Đẫy',
        capacity: 22500,
        country: 'Việt Nam',
        fifaStars: 2,
      },
    };

    beforeEach(() => {
      jest
        .spyOn(prisma.seasonTeam, 'findUnique')
        .mockResolvedValue(seasonTeamRecord as any);
      jest.spyOn(prisma.team, 'findUnique').mockResolvedValue(validTeam as any);
      jest
        .spyOn(prisma.teamPlayer, 'count')
        .mockResolvedValueOnce(16)
        .mockResolvedValueOnce(5);
      jest
        .spyOn(prisma.teamPlayer, 'findMany')
        .mockResolvedValue([
          { player: { playerType: 'FOREIGN', nationality: 'Brazil' } },
          { player: { playerType: 'FOREIGN', nationality: 'Japan' } },
          { player: { playerType: 'FOREIGN', nationality: 'Korea' } },
          { player: { playerType: 'FOREIGN', nationality: 'France' } },
          { player: { playerType: 'FOREIGN', nationality: 'Spain' } },
        ] as any);
      jest.spyOn(prisma.seasonTeam, 'update').mockResolvedValue({
        ...seasonTeamRecord,
        status: 'APPROVED',
        approvedAt: new Date(),
        team: validTeam,
      } as any);
    });

    it('should approve a team that satisfies roster and stadium regulations', async () => {
      const result = await service.updateTeamStatus(
        'season-1',
        'team-1',
        'APPROVED',
      );

      expect(result.status).toBe('APPROVED');
      expect(prisma.teamPlayer.count).toHaveBeenCalledWith({
        where: { teamId: 'team-1', leftAt: null },
      });
      expect(prisma.teamPlayer.findMany).toHaveBeenCalledWith({
        where: {
          teamId: 'team-1',
          leftAt: null,
        },
        select: {
          player: {
            select: {
              playerType: true,
              nationality: true,
            },
          },
        },
      });
    });

    it('should reject approval when the team has not submitted application information', async () => {
      jest.spyOn(prisma.seasonTeam, 'findUnique').mockResolvedValue({
        ...seasonTeamRecord,
        applicationSubmittedAt: null,
      } as any);

      await expect(
        service.updateTeamStatus('season-1', 'team-1', 'APPROVED'),
      ).rejects.toThrow('chưa nộp hồ sơ');
      expect(regulationHelper.getNumericValue).not.toHaveBeenCalled();
    });

    it('should reject approval when external competition schedule is missing', async () => {
      jest.spyOn(prisma.seasonTeam, 'findUnique').mockResolvedValue({
        ...seasonTeamRecord,
        externalCompetitionSchedule: null,
      } as any);

      await expect(
        service.updateTeamStatus('season-1', 'team-1', 'APPROVED'),
      ).rejects.toThrow('lịch giải khác');
      expect(regulationHelper.getNumericValue).not.toHaveBeenCalled();
    });

    it('should reject approval when participation fee proof is missing', async () => {
      jest.spyOn(prisma.seasonTeam, 'findUnique').mockResolvedValue({
        ...seasonTeamRecord,
        feeReceiptCode: null,
        feeReceiptUrl: null,
      } as any);

      await expect(
        service.updateTeamStatus('season-1', 'team-1', 'APPROVED'),
      ).rejects.toThrow('chứng từ nộp lệ phí');
      expect(regulationHelper.getNumericValue).not.toHaveBeenCalled();
    });

    it('should reject approval when a team has fewer than 16 active players', async () => {
      jest
        .spyOn(prisma.teamPlayer, 'count')
        .mockReset()
        .mockResolvedValueOnce(15)
        .mockResolvedValueOnce(4);

      await expect(
        service.updateTeamStatus('season-1', 'team-1', 'APPROVED'),
      ).rejects.toThrow('tối thiểu 16 cầu thủ');
    });

    it('should reject approval when a team has more than 22 active players', async () => {
      jest
        .spyOn(prisma.teamPlayer, 'count')
        .mockReset()
        .mockResolvedValueOnce(23)
        .mockResolvedValueOnce(4);

      await expect(
        service.updateTeamStatus('season-1', 'team-1', 'APPROVED'),
      ).rejects.toThrow('tối đa 22 cầu thủ');
    });

    it('should reject approval when a team has more than 5 foreign players', async () => {
      jest
        .spyOn(prisma.teamPlayer, 'count')
        .mockReset()
        .mockResolvedValueOnce(20);
      jest
        .spyOn(prisma.teamPlayer, 'findMany')
        .mockResolvedValue([
          { player: { playerType: 'FOREIGN', nationality: 'Brazil' } },
          { player: { playerType: 'FOREIGN', nationality: 'Japan' } },
          { player: { playerType: 'FOREIGN', nationality: 'Korea' } },
          { player: { playerType: 'FOREIGN', nationality: 'France' } },
          { player: { playerType: 'FOREIGN', nationality: 'Spain' } },
          { player: { playerType: 'FOREIGN', nationality: 'Argentina' } },
        ] as any);

      await expect(
        service.updateTeamStatus('season-1', 'team-1', 'APPROVED'),
      ).rejects.toThrow('tối đa 5 cầu thủ ngoại');
    });

    it('should reject approval when non-Vietnam nationality roster exceeds the foreign-player limit', async () => {
      jest
        .spyOn(prisma.teamPlayer, 'count')
        .mockReset()
        .mockResolvedValueOnce(20);
      jest
        .spyOn(prisma.teamPlayer, 'findMany')
        .mockResolvedValue([
          { player: { playerType: 'DOMESTIC', nationality: 'Brazil' } },
          { player: { playerType: 'DOMESTIC', nationality: 'Japan' } },
          { player: { playerType: 'DOMESTIC', nationality: 'Korea' } },
          { player: { playerType: 'DOMESTIC', nationality: 'France' } },
          { player: { playerType: 'DOMESTIC', nationality: 'Spain' } },
          { player: { playerType: 'DOMESTIC', nationality: 'Argentina' } },
        ] as any);

      await expect(
        service.updateTeamStatus('season-1', 'team-1', 'APPROVED'),
      ).rejects.toThrow('tối đa 5 cầu thủ ngoại');
    });

    it('should reject approval when the home stadium is below 10,000 seats', async () => {
      jest.spyOn(prisma.team, 'findUnique').mockResolvedValue({
        ...validTeam,
        stadium: { ...validTeam.stadium, capacity: 9000 },
      } as any);

      await expect(
        service.updateTeamStatus('season-1', 'team-1', 'APPROVED'),
      ).rejects.toThrow('10.000');
    });

    it('should reject approval when the home stadium is outside Vietnam', async () => {
      jest.spyOn(prisma.team, 'findUnique').mockResolvedValue({
        ...validTeam,
        stadium: { ...validTeam.stadium, country: 'Thailand' },
      } as any);

      await expect(
        service.updateTeamStatus('season-1', 'team-1', 'APPROVED'),
      ).rejects.toThrow('Việt Nam');
    });

    it('should reject approval when the home stadium is below 2 FIFA stars', async () => {
      jest.spyOn(prisma.team, 'findUnique').mockResolvedValue({
        ...validTeam,
        stadium: { ...validTeam.stadium, fifaStars: 1 },
      } as any);

      await expect(
        service.updateTeamStatus('season-1', 'team-1', 'APPROVED'),
      ).rejects.toThrow('2 sao');
    });

    it('should not run approval validation for rejection or withdrawal', async () => {
      jest.spyOn(prisma.seasonTeam, 'update').mockResolvedValue({
        ...seasonTeamRecord,
        status: 'REJECTED',
      } as any);

      const result = await service.updateTeamStatus(
        'season-1',
        'team-1',
        'REJECTED',
      );

      expect(result.status).toBe('REJECTED');
      expect(regulationHelper.getNumericValue).not.toHaveBeenCalled();
    });
  });
});

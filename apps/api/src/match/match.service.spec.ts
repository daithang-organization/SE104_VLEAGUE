import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { RegulationHelper } from '../regulation/regulation.helper';
import { StandingsService } from '../standings/standings.service';
import { MatchService } from './match.service';

describe('MatchService', () => {
  let service: MatchService;
  let prisma: PrismaService;
  let standingsService: StandingsService;
  let regulationHelper: RegulationHelper;

  const mockMatch = {
    id: 'match-1',
    seasonId: 'season-1',
    roundNo: 1,
    homeTeamId: 'team-1',
    awayTeamId: 'team-2',
    stadiumId: 'stadium-1',
    kickoffAt: new Date(),
    homeScore: 0,
    awayScore: 0,
    status: 'DRAFT',
    homeTeam: { id: 'team-1', name: 'Hà Nội FC' },
    awayTeam: { id: 'team-2', name: 'Viettel FC' },
    stadium: { id: 'stadium-1', name: 'Sân Mỹ Đình' },
    season: { id: 'season-1', name: 'VLeague 2024' },
    events: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchService,
        {
          provide: PrismaService,
          useValue: {
            match: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
            },
            matchEvent: {
              create: jest.fn(),
              findFirst: jest.fn(),
              findMany: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: StandingsService,
          useValue: {
            getStandings: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: RegulationHelper,
          useValue: {
            getNumericValue: jest.fn().mockResolvedValue(96),
          },
        },
      ],
    }).compile();

    service = module.get<MatchService>(MatchService);
    prisma = module.get<PrismaService>(PrismaService);
    standingsService = module.get<StandingsService>(StandingsService);
    regulationHelper = module.get<RegulationHelper>(RegulationHelper);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMatchById', () => {
    it('should return a match with all relations', async () => {
      jest
        .spyOn(prisma.match, 'findUnique')
        .mockResolvedValue(mockMatch as any);

      const result = await service.getMatchById('match-1');

      expect(result.id).toBe('match-1');
      expect(result.homeTeam.name).toBe('Hà Nội FC');
      expect(result.events).toEqual([]);
    });

    it('should throw NotFoundException if match not found', async () => {
      jest.spyOn(prisma.match, 'findUnique').mockResolvedValue(null);

      await expect(service.getMatchById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated matches', async () => {
      jest
        .spyOn(prisma.match, 'findMany')
        .mockResolvedValue([mockMatch] as any);
      jest.spyOn(prisma.match, 'count').mockResolvedValue(1);

      const result = await service.findAll();

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });

    it('should filter by seasonId if provided', async () => {
      jest
        .spyOn(prisma.match, 'findMany')
        .mockResolvedValue([mockMatch] as any);
      jest.spyOn(prisma.match, 'count').mockResolvedValue(1);

      await service.findAll('season-1');

      expect(prisma.match.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { seasonId: 'season-1' },
        }),
      );
    });
  });

  describe('addEvent', () => {
    it('should create a match event', async () => {
      jest
        .spyOn(prisma.match, 'findUnique')
        .mockResolvedValue(mockMatch as any);
      jest.spyOn(prisma.matchEvent, 'create').mockResolvedValue({
        id: 'event-1',
        matchId: 'match-1',
        minute: 45,
        type: 'GOAL',
        teamId: 'team-1',
        player: { id: 'p1', fullName: 'Player 1' },
        team: { id: 'team-1', name: 'Hà Nội FC' },
      } as any);
      jest.spyOn(prisma.matchEvent, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.match, 'update').mockResolvedValue(mockMatch as any);

      const result = await service.addEvent('match-1', {
        minute: 45,
        type: 'GOAL' as any,
        teamId: 'team-1',
      });

      expect(result.ok).toBe(true);
      expect(result.createdEvent.minute).toBe(45);
    });

    it('should throw NotFoundException if match not found', async () => {
      jest.spyOn(prisma.match, 'findUnique').mockResolvedValue(null);

      await expect(
        service.addEvent('non-existent', {
          minute: 45,
          type: 'GOAL' as any,
          teamId: 'team-1',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeEvent', () => {
    it('should delete an event', async () => {
      jest.spyOn(prisma.matchEvent, 'findFirst').mockResolvedValue({
        id: 'event-1',
        type: 'YELLOW_CARD',
      } as any);
      jest.spyOn(prisma.matchEvent, 'delete').mockResolvedValue({} as any);

      const result = await service.removeEvent('match-1', 'event-1');

      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException if event not found', async () => {
      jest.spyOn(prisma.matchEvent, 'findFirst').mockResolvedValue(null);

      await expect(service.removeEvent('match-1', 'event-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateStatus', () => {
    it('should allow DRAFT → PUBLISHED transition', async () => {
      const match = { ...mockMatch, status: 'DRAFT' };
      jest.spyOn(prisma.match, 'findUnique').mockResolvedValue(match as any);
      jest.spyOn(prisma.match, 'update').mockResolvedValue({
        ...match,
        status: 'PUBLISHED',
      } as any);

      const result = await service.updateStatus('match-1', 'PUBLISHED');

      expect(result.status).toBe('PUBLISHED');
    });

    it('should allow PUBLISHED → LOCKED transition', async () => {
      const match = { ...mockMatch, status: 'PUBLISHED' };
      jest.spyOn(prisma.match, 'findUnique').mockResolvedValue(match as any);
      jest.spyOn(prisma.match, 'update').mockResolvedValue({
        ...match,
        status: 'LOCKED',
      } as any);

      const result = await service.updateStatus('match-1', 'LOCKED');

      expect(result.status).toBe('LOCKED');
    });

    it('should allow LOCKED → FINISHED transition', async () => {
      const match = { ...mockMatch, status: 'LOCKED' };
      jest.spyOn(prisma.match, 'findUnique').mockResolvedValue(match as any);
      jest.spyOn(prisma.match, 'update').mockResolvedValue({
        ...match,
        status: 'FINISHED',
      } as any);

      const result = await service.updateStatus('match-1', 'FINISHED');

      expect(result.status).toBe('FINISHED');
    });

    it('should reject invalid transition DRAFT → FINISHED', async () => {
      const match = { ...mockMatch, status: 'DRAFT' };
      jest.spyOn(prisma.match, 'findUnique').mockResolvedValue(match as any);

      await expect(service.updateStatus('match-1', 'FINISHED')).rejects.toThrow(
        'Không thể chuyển trạng thái',
      );
    });

    it('should reject invalid transition FINISHED → DRAFT', async () => {
      const match = { ...mockMatch, status: 'FINISHED' };
      jest.spyOn(prisma.match, 'findUnique').mockResolvedValue(match as any);

      await expect(service.updateStatus('match-1', 'DRAFT')).rejects.toThrow(
        'Không thể chuyển trạng thái',
      );
    });

    it('should allow DRAFT → POSTPONED transition', async () => {
      const match = { ...mockMatch, status: 'DRAFT' };
      jest.spyOn(prisma.match, 'findUnique').mockResolvedValue(match as any);
      jest.spyOn(prisma.match, 'update').mockResolvedValue({
        ...match,
        status: 'POSTPONED',
      } as any);

      const result = await service.updateStatus('match-1', 'POSTPONED');

      expect(result.status).toBe('POSTPONED');
    });

    it('should throw NotFoundException for non-existent match', async () => {
      jest.spyOn(prisma.match, 'findUnique').mockResolvedValue(null);

      await expect(
        service.updateStatus('non-existent', 'PUBLISHED'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject LOCKED → FINISHED when scores are null', async () => {
      const match = {
        ...mockMatch,
        status: 'LOCKED',
        homeScore: null,
        awayScore: null,
      };
      jest.spyOn(prisma.match, 'findUnique').mockResolvedValue(match as any);

      await expect(service.updateStatus('match-1', 'FINISHED')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should trigger standings recalculation on FINISHED', async () => {
      const match = {
        ...mockMatch,
        status: 'LOCKED',
        homeScore: 2,
        awayScore: 1,
        seasonId: 'season-1',
      };
      jest.spyOn(prisma.match, 'findUnique').mockResolvedValue(match as any);
      jest.spyOn(prisma.match, 'update').mockResolvedValue({
        ...match,
        status: 'FINISHED',
      } as any);

      await service.updateStatus('match-1', 'FINISHED');

      expect(standingsService.getStandings).toHaveBeenCalledWith('season-1');
    });
  });

  describe('addEvent - MAX_GOAL_TIME validation', () => {
    it('should reject goal event when minute exceeds MAX_GOAL_TIME', async () => {
      const match = { ...mockMatch, seasonId: 'season-1' };
      jest.spyOn(prisma.match, 'findUnique').mockResolvedValue(match as any);
      jest.spyOn(regulationHelper, 'getNumericValue').mockResolvedValue(96);

      await expect(
        service.addEvent('match-1', {
          minute: 120,
          type: 'GOAL' as any,
          teamId: 'team-1',
        }),
      ).rejects.toThrow('vượt quá 96');
    });
  });
});

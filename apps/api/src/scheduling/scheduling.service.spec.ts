import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { SchedulingService } from './scheduling.service';

describe('SchedulingService', () => {
  let service: SchedulingService;
  let prisma: PrismaService;

  const mockMatches = [
    {
      id: 'match-1',
      seasonId: 'season-1',
      roundNo: 1,
      leg: 1,
      homeTeamId: 'team-1',
      awayTeamId: 'team-2',
      stadiumId: 'stadium-1',
      kickoffAt: new Date('2024-01-15T19:00:00Z'),
      homeScore: 0,
      awayScore: 0,
      status: 'DRAFT',
      homeTeam: { id: 'team-1', name: 'Team A', shortName: 'TA' },
      awayTeam: { id: 'team-2', name: 'Team B', shortName: 'TB' },
      stadium: { id: 'stadium-1', name: 'Stadium A', city: 'City A' },
    },
    {
      id: 'match-2',
      seasonId: 'season-1',
      roundNo: 1,
      leg: 2,
      homeTeamId: 'team-2',
      awayTeamId: 'team-1',
      stadiumId: 'stadium-2',
      kickoffAt: new Date('2024-01-22T19:00:00Z'),
      homeScore: 0,
      awayScore: 0,
      status: 'DRAFT',
      homeTeam: { id: 'team-2', name: 'Team B', shortName: 'TB' },
      awayTeam: { id: 'team-1', name: 'Team A', shortName: 'TA' },
      stadium: { id: 'stadium-2', name: 'Stadium B', city: 'City B' },
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulingService,
        {
          provide: PrismaService,
          useValue: {
            match: {
              findMany: jest.fn(),
              createMany: jest.fn(),
              deleteMany: jest.fn(),
              updateMany: jest.fn(),
            },
            season: {
              findFirst: jest.fn(),
              findUnique: jest.fn(),
            },
            seasonTeam: {
              findMany: jest.fn(),
            },
            team: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<SchedulingService>(SchedulingService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSchedule', () => {
    it('should return all matches with team/stadium relations', async () => {
      jest
        .spyOn(prisma.match, 'findMany')
        .mockResolvedValue(mockMatches as any);

      const result = await service.getSchedule();

      expect(result.ok).toBe(true);
      expect(result.matches).toHaveLength(2);
      expect(result.matches[0].roundNo).toBe(1);
    });

    it('should include homeTeam, awayTeam, stadium in query', async () => {
      jest
        .spyOn(prisma.match, 'findMany')
        .mockResolvedValue(mockMatches as any);

      await service.getSchedule();

      expect(prisma.match.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          homeTeam: { select: { id: true, name: true, shortName: true } },
          awayTeam: { select: { id: true, name: true, shortName: true } },
          stadium: { select: { id: true, name: true, city: true } },
        },
        orderBy: [{ leg: 'asc' }, { roundNo: 'asc' }],
      });
    });

    it('should return empty array when no matches exist', async () => {
      jest.spyOn(prisma.match, 'findMany').mockResolvedValue([]);

      const result = await service.getSchedule();

      expect(result.ok).toBe(true);
      expect(result.matches).toHaveLength(0);
    });

    it('should filter by seasonId when provided', async () => {
      jest.spyOn(prisma.match, 'findMany').mockResolvedValue([]);

      await service.getSchedule('season-123');

      expect(prisma.match.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { seasonId: 'season-123' },
        }),
      );
    });
  });

  describe('generate', () => {
    it('should generate round-robin matches for 4 teams', async () => {
      const teams = [
        { id: 't1', name: 'A', stadiumId: 's1' },
        { id: 't2', name: 'B', stadiumId: 's2' },
        { id: 't3', name: 'C', stadiumId: 's3' },
        { id: 't4', name: 'D', stadiumId: 's4' },
      ];

      jest
        .spyOn(prisma.season, 'findFirst')
        .mockResolvedValue({ id: 'season-1', name: 'V.League 2024' } as any);
      jest.spyOn(prisma.seasonTeam, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.team, 'findMany').mockResolvedValue(teams as any);
      jest.spyOn(prisma.match, 'deleteMany').mockResolvedValue({ count: 0 });
      jest.spyOn(prisma.match, 'createMany').mockResolvedValue({ count: 12 });
      jest
        .spyOn(prisma.season, 'findUnique')
        .mockResolvedValue({ name: 'V.League 2024' } as any);

      const result = await service.generate();

      // 4 teams: 3 rounds × 2 matches × 2 legs = 12 matches
      expect(result.ok).toBe(true);
      expect(result.totalMatches).toBe(12);
      expect(prisma.match.createMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({
              leg: 1,
              homeTeamId: expect.any(String),
              awayTeamId: expect.any(String),
              seasonId: 'season-1',
              status: 'DRAFT',
            }),
          ]),
        }),
      );
    });
  });

  describe('publish', () => {
    it('should update DRAFT matches to PUBLISHED', async () => {
      jest.spyOn(prisma.match, 'updateMany').mockResolvedValue({ count: 12 });

      const result = await service.publish();

      expect(result.ok).toBe(true);
      expect(result.message).toContain('12');
      expect(prisma.match.updateMany).toHaveBeenCalledWith({
        where: { status: 'DRAFT' },
        data: { status: 'PUBLISHED' },
      });
    });
  });
});

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
      homeTeamId: 'team-1',
      awayTeamId: 'team-2',
      stadiumId: 'stadium-1',
      kickoffAt: new Date('2024-01-15T19:00:00Z'),
      homeScore: 0,
      awayScore: 0,
      status: 'DRAFT',
    },
    {
      id: 'match-2',
      seasonId: 'season-1',
      roundNo: 2,
      homeTeamId: 'team-2',
      awayTeamId: 'team-1',
      stadiumId: 'stadium-2',
      kickoffAt: new Date('2024-01-22T19:00:00Z'),
      homeScore: 0,
      awayScore: 0,
      status: 'DRAFT',
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
    it('should return all matches with ok status', async () => {
      jest
        .spyOn(prisma.match, 'findMany')
        .mockResolvedValue(mockMatches as any);

      const result = await service.getSchedule();

      expect(result.ok).toBe(true);
      expect(result.matches).toHaveLength(2);
      expect(result.matches[0].roundNo).toBe(1);
    });

    it('should order matches by roundNo and kickoffAt', async () => {
      jest
        .spyOn(prisma.match, 'findMany')
        .mockResolvedValue(mockMatches as any);

      await service.getSchedule();

      expect(prisma.match.findMany).toHaveBeenCalledWith({
        orderBy: [{ roundNo: 'asc' }, { kickoffAt: 'asc' }],
      });
    });

    it('should return empty array when no matches exist', async () => {
      jest.spyOn(prisma.match, 'findMany').mockResolvedValue([]);

      const result = await service.getSchedule();

      expect(result.ok).toBe(true);
      expect(result.matches).toHaveLength(0);
    });
  });

  describe('generateStub', () => {
    it('should return stub response', () => {
      const result = service.generateStub();

      expect(result.ok).toBe(true);
      expect(result.message).toBe('schedule generation stub');
    });
  });

  describe('publishStub', () => {
    it('should return stub response', () => {
      const result = service.publishStub();

      expect(result.ok).toBe(true);
      expect(result.message).toBe('schedule publish stub');
    });
  });
});

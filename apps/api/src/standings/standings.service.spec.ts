import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { StandingsService } from './standings.service';

describe('StandingsService', () => {
  let service: StandingsService;
  let prisma: PrismaService;

  const mockTeams = [
    { id: 'team-1', name: 'Hà Nội FC', status: 'ACTIVE' },
    { id: 'team-2', name: 'Viettel FC', status: 'ACTIVE' },
  ];

  const mockMatches = [
    {
      homeTeamId: 'team-1',
      awayTeamId: 'team-2',
      homeScore: 2,
      awayScore: 1,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StandingsService,
        {
          provide: PrismaService,
          useValue: {
            season: {
              findFirst: jest.fn(),
            },
            team: {
              findMany: jest.fn(),
            },
            match: {
              findMany: jest.fn(),
            },
            matchEvent: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<StandingsService>(StandingsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStandings', () => {
    it('should calculate standings correctly', async () => {
      jest.spyOn(prisma.season, 'findFirst').mockResolvedValue({
        id: 'season-1',
        name: 'VLeague 2024',
        year: 2024,
        status: 'IN_PROGRESS',
      } as any);
      jest.spyOn(prisma.team, 'findMany').mockResolvedValue(mockTeams as any);
      jest.spyOn(prisma.match, 'findMany').mockResolvedValue(mockMatches as any);

      const result = await service.getStandings();

      expect(result).toHaveLength(2);
      // Team 1 won, should have 3 points
      const team1 = result.find((t) => t.teamId === 'team-1');
      expect(team1?.points).toBe(3);
      expect(team1?.won).toBe(1);
      expect(team1?.goalsFor).toBe(2);

      // Team 2 lost, should have 0 points
      const team2 = result.find((t) => t.teamId === 'team-2');
      expect(team2?.points).toBe(0);
      expect(team2?.lost).toBe(1);
    });

    it('should handle draws correctly', async () => {
      const drawMatch = [
        {
          homeTeamId: 'team-1',
          awayTeamId: 'team-2',
          homeScore: 1,
          awayScore: 1,
        },
      ];

      jest.spyOn(prisma.season, 'findFirst').mockResolvedValue({
        id: 'season-1',
        status: 'IN_PROGRESS',
      } as any);
      jest.spyOn(prisma.team, 'findMany').mockResolvedValue(mockTeams as any);
      jest.spyOn(prisma.match, 'findMany').mockResolvedValue(drawMatch as any);

      const result = await service.getStandings();

      // Both teams should have 1 point
      expect(result[0].points).toBe(1);
      expect(result[1].points).toBe(1);
      expect(result[0].drawn).toBe(1);
    });

    it('should sort by points, then goal difference', async () => {
      const multiMatches = [
        { homeTeamId: 'team-1', awayTeamId: 'team-2', homeScore: 3, awayScore: 0 },
      ];

      jest.spyOn(prisma.season, 'findFirst').mockResolvedValue({ id: 's1' } as any);
      jest.spyOn(prisma.team, 'findMany').mockResolvedValue(mockTeams as any);
      jest.spyOn(prisma.match, 'findMany').mockResolvedValue(multiMatches as any);

      const result = await service.getStandings();

      expect(result[0].teamId).toBe('team-1'); // Team 1 first (3 pts)
      expect(result[1].teamId).toBe('team-2'); // Team 2 second (0 pts)
    });
  });

  describe('getTopScorers', () => {
    it('should return top scorers', async () => {
      jest.spyOn(prisma.season, 'findFirst').mockResolvedValue({ id: 's1' } as any);
      jest.spyOn(prisma.matchEvent, 'findMany').mockResolvedValue([
        {
          type: 'GOAL',
          player: { id: 'p1', fullName: 'Nguyễn Quang Hải' },
          team: { id: 't1', name: 'Hà Nội FC' },
        },
        {
          type: 'GOAL',
          player: { id: 'p1', fullName: 'Nguyễn Quang Hải' },
          team: { id: 't1', name: 'Hà Nội FC' },
        },
      ] as any);

      const result = await service.getTopScorers();

      expect(result).toHaveLength(1);
      expect(result[0].goals).toBe(2);
      expect(result[0].playerName).toBe('Nguyễn Quang Hải');
    });
  });
});

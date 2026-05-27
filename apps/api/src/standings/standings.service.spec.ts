import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { StandingsService } from './standings.service';

describe('StandingsService', () => {
  let service: StandingsService;
  let prisma: PrismaService;

  const mockSeasonTeams = [
    {
      seasonId: 'season-1',
      teamId: 'team-1',
      status: 'APPROVED',
      team: { id: 'team-1', name: 'Hà Nội FC' },
    },
    {
      seasonId: 'season-1',
      teamId: 'team-2',
      status: 'APPROVED',
      team: { id: 'team-2', name: 'Viettel FC' },
    },
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
            seasonTeam: {
              findMany: jest.fn(),
            },
            team: {
              findMany: jest.fn(),
            },
            match: {
              findMany: jest.fn(),
            },
            matchEvent: {
              findMany: jest.fn(),
              count: jest.fn(),
            },
            matchReport: {
              findMany: jest.fn(),
            },
            playerSuspension: {
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
      jest
        .spyOn(prisma.seasonTeam, 'findMany')
        .mockResolvedValue(mockSeasonTeams as any);
      jest
        .spyOn(prisma.match, 'findMany')
        .mockResolvedValue(mockMatches as any);

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
      jest
        .spyOn(prisma.seasonTeam, 'findMany')
        .mockResolvedValue(mockSeasonTeams as any);
      jest.spyOn(prisma.match, 'findMany').mockResolvedValue(drawMatch as any);

      const result = await service.getStandings();

      // Both teams should have 1 point
      expect(result[0].points).toBe(1);
      expect(result[1].points).toBe(1);
      expect(result[0].drawn).toBe(1);
    });

    it('should sort by points, then goal difference', async () => {
      const multiMatches = [
        {
          homeTeamId: 'team-1',
          awayTeamId: 'team-2',
          homeScore: 3,
          awayScore: 0,
        },
      ];

      jest
        .spyOn(prisma.season, 'findFirst')
        .mockResolvedValue({ id: 's1' } as any);
      jest
        .spyOn(prisma.seasonTeam, 'findMany')
        .mockResolvedValue(mockSeasonTeams as any);
      jest
        .spyOn(prisma.match, 'findMany')
        .mockResolvedValue(multiMatches as any);

      const result = await service.getStandings();

      expect(result[0].teamId).toBe('team-1'); // Team 1 first (3 pts)
      expect(result[1].teamId).toBe('team-2'); // Team 2 second (0 pts)
    });

    it('keeps teams tied in-progress when points and goal difference are equal', async () => {
      const seasonTeams = [
        { team: { id: 'team-a', name: 'A FC' } },
        { team: { id: 'team-b', name: 'B FC' } },
        { team: { id: 'team-c', name: 'C FC' } },
      ];
      const matches = [
        {
          homeTeamId: 'team-a',
          awayTeamId: 'team-c',
          homeScore: 3,
          awayScore: 0,
          roundNo: 1,
        },
        {
          homeTeamId: 'team-b',
          awayTeamId: 'team-c',
          homeScore: 4,
          awayScore: 1,
          roundNo: 1,
        },
      ];

      jest
        .spyOn(prisma.seasonTeam, 'findMany')
        .mockResolvedValue(seasonTeams as any);
      jest.spyOn(prisma.match, 'findMany').mockResolvedValue(matches as any);

      const result = await service.getStandings('season-1', 'in_progress');
      const teamA = result.find((standing) => standing.teamId === 'team-a');
      const teamB = result.find((standing) => standing.teamId === 'team-b');

      expect(teamA?.points).toBe(teamB?.points);
      expect(teamA?.goalDifference).toBe(teamB?.goalDifference);
      expect(teamA?.position).toBe(1);
      expect(teamB?.position).toBe(1);
    });

    it('uses two-leg head-to-head aggregate to break final ties', async () => {
      const seasonTeams = [
        { team: { id: 'team-a', name: 'A FC' } },
        { team: { id: 'team-b', name: 'B FC' } },
        { team: { id: 'team-c', name: 'C FC' } },
      ];
      const matches = [
        {
          homeTeamId: 'team-a',
          awayTeamId: 'team-b',
          homeScore: 2,
          awayScore: 0,
          roundNo: 1,
        },
        {
          homeTeamId: 'team-b',
          awayTeamId: 'team-a',
          homeScore: 1,
          awayScore: 1,
          roundNo: 2,
        },
        {
          homeTeamId: 'team-b',
          awayTeamId: 'team-c',
          homeScore: 3,
          awayScore: 0,
          roundNo: 3,
        },
        {
          homeTeamId: 'team-c',
          awayTeamId: 'team-b',
          homeScore: 0,
          awayScore: 2,
          roundNo: 4,
        },
        {
          homeTeamId: 'team-a',
          awayTeamId: 'team-c',
          homeScore: 1,
          awayScore: 0,
          roundNo: 5,
        },
      ];

      jest
        .spyOn(prisma.seasonTeam, 'findMany')
        .mockResolvedValue(seasonTeams as any);
      jest.spyOn(prisma.match, 'findMany').mockResolvedValue(matches as any);

      const result = await service.getStandings('season-1', 'final');

      expect(result[0].teamId).toBe('team-a');
      expect(result[1].teamId).toBe('team-b');
      expect(result[0].headToHeadGoalsFor).toBe(3);
      expect(result[1].headToHeadGoalsFor).toBe(1);
      expect(result[0].requiresDrawLot).toBe(false);
    });

    it('marks final ties as requiring draw lot when head-to-head aggregate is equal', async () => {
      const seasonTeams = [
        { team: { id: 'team-a', name: 'A FC' } },
        { team: { id: 'team-b', name: 'B FC' } },
      ];
      const matches = [
        {
          homeTeamId: 'team-a',
          awayTeamId: 'team-b',
          homeScore: 1,
          awayScore: 0,
          roundNo: 1,
        },
        {
          homeTeamId: 'team-b',
          awayTeamId: 'team-a',
          homeScore: 1,
          awayScore: 0,
          roundNo: 2,
        },
      ];

      jest
        .spyOn(prisma.seasonTeam, 'findMany')
        .mockResolvedValue(seasonTeams as any);
      jest.spyOn(prisma.match, 'findMany').mockResolvedValue(matches as any);

      const result = await service.getStandings('season-1', 'final');

      expect(result).toHaveLength(2);
      expect(result[0].position).toBe(1);
      expect(result[1].position).toBe(1);
      expect(result[0].requiresDrawLot).toBe(true);
      expect(result[1].requiresDrawLot).toBe(true);
    });
  });

  describe('getTopScorers', () => {
    it('should return top scorers', async () => {
      jest
        .spyOn(prisma.season, 'findFirst')
        .mockResolvedValue({ id: 's1' } as any);
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

  describe('getTopAssists', () => {
    it('should return top assists', async () => {
      jest
        .spyOn(prisma.season, 'findFirst')
        .mockResolvedValue({ id: 's1' } as any);
      jest.spyOn(prisma.matchEvent, 'findMany').mockResolvedValue([
        {
          type: 'GOAL',
          relatedPlayer: { id: 'p2', fullName: 'Assist Player' },
          team: { id: 't1', name: 'HÃ  Ná»™i FC' },
        },
        {
          type: 'PENALTY',
          relatedPlayer: { id: 'p2', fullName: 'Assist Player' },
          team: { id: 't1', name: 'HÃ  Ná»™i FC' },
        },
      ] as any);

      const result = await service.getTopAssists();

      expect(result).toHaveLength(1);
      expect(result[0].assists).toBe(2);
      expect(result[0].playerName).toBe('Assist Player');
    });
  });

  describe('getPlayerOfMatchStats', () => {
    it('counts player-of-the-match awards from match reports', async () => {
      jest
        .spyOn(prisma.season, 'findFirst')
        .mockResolvedValue({ id: 'season-1' } as any);
      jest.spyOn(prisma.matchReport, 'findMany').mockResolvedValue([
        {
          bestPlayerId: 'player-1',
          bestPlayer: { id: 'player-1', fullName: 'Home Player 1' },
        },
        {
          bestPlayerId: 'player-1',
          bestPlayer: { id: 'player-1', fullName: 'Home Player 1' },
        },
      ] as any);

      const result = await service.getPlayerOfMatchStats();

      expect(result).toEqual([
        {
          position: 1,
          playerId: 'player-1',
          playerName: 'Home Player 1',
          awards: 2,
        },
      ]);
    });
  });

  describe('getSuspensionStats', () => {
    it('returns suspensions linked to players, teams, and matches', async () => {
      jest
        .spyOn(prisma.season, 'findFirst')
        .mockResolvedValue({ id: 'season-1' } as any);
      jest.spyOn(prisma.playerSuspension, 'findMany').mockResolvedValue([
        {
          id: 'suspension-1',
          playerId: 'player-1',
          teamId: 'team-1',
          reason: 'RED_CARD',
          status: 'ACTIVE',
          player: { id: 'player-1', fullName: 'Home Player 1' },
          team: { id: 'team-1', name: 'A FC' },
          sourceMatch: { id: 'match-1', roundNo: 1 },
          effectiveMatch: { id: 'match-2', roundNo: 2 },
        },
      ] as any);

      const result = await service.getSuspensionStats();

      expect(result[0]).toMatchObject({
        playerName: 'Home Player 1',
        teamName: 'A FC',
        reason: 'RED_CARD',
        status: 'ACTIVE',
        sourceRound: 1,
        effectiveRound: 2,
      });
    });
  });

  describe('getSeasonAwards', () => {
    it('returns champion, runner-up, top scorer, and best player award candidates', async () => {
      const seasonTeams = [
        { team: { id: 'team-a', name: 'A FC' } },
        { team: { id: 'team-b', name: 'B FC' } },
      ];
      const matches = [
        {
          homeTeamId: 'team-a',
          awayTeamId: 'team-b',
          homeScore: 2,
          awayScore: 0,
          roundNo: 1,
        },
      ];

      jest
        .spyOn(prisma.seasonTeam, 'findMany')
        .mockResolvedValue(seasonTeams as any);
      jest.spyOn(prisma.match, 'findMany').mockResolvedValue(matches as any);
      jest.spyOn(prisma.matchEvent, 'findMany').mockResolvedValue([
        {
          type: 'GOAL',
          player: { id: 'player-1', fullName: 'Home Player 1' },
          team: { id: 'team-a', name: 'A FC' },
        },
      ] as any);
      jest.spyOn(prisma.matchReport, 'findMany').mockResolvedValue([
        {
          bestPlayerId: 'player-1',
          bestPlayer: { id: 'player-1', fullName: 'Home Player 1' },
        },
      ] as any);

      const result = await service.getSeasonAwards('season-1');

      expect(result.champion?.teamId).toBe('team-a');
      expect(result.runnerUp?.teamId).toBe('team-b');
      expect(result.topScorer?.playerId).toBe('player-1');
      expect(result.bestPlayer?.playerId).toBe('player-1');
      expect(result.requiresDrawLot).toBe(false);
    });
  });
});

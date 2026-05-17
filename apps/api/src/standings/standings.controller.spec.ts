import { CacheModule } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { StandingsController } from './standings.controller';
import { StandingsService } from './standings.service';

describe('StandingsController', () => {
  let controller: StandingsController;
  let service: StandingsService;

  const mockStandings = [
    {
      position: 1,
      teamId: 'team-1',
      teamName: 'Hà Nội FC',
      played: 10,
      won: 8,
      drawn: 1,
      lost: 1,
      goalsFor: 24,
      goalsAgainst: 8,
      goalDifference: 16,
      points: 25,
    },
    {
      position: 2,
      teamId: 'team-2',
      teamName: 'HAGL',
      played: 10,
      won: 6,
      drawn: 2,
      lost: 2,
      goalsFor: 18,
      goalsAgainst: 10,
      goalDifference: 8,
      points: 20,
    },
  ];

  const mockTopScorers = [
    {
      position: 1,
      playerId: 'player-1',
      playerName: 'Nguyễn Quang Hải',
      teamId: 'team-1',
      teamName: 'Hà Nội FC',
      goals: 12,
    },
  ];

  const mockTopAssists = [
    {
      position: 1,
      playerId: 'player-2',
      playerName: 'Assist Player',
      teamId: 'team-1',
      teamName: 'HÃ  Ná»™i FC',
      assists: 8,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [StandingsController],
      providers: [
        {
          provide: StandingsService,
          useValue: {
            getStandings: jest.fn().mockResolvedValue(mockStandings),
            getTopScorers: jest.fn().mockResolvedValue(mockTopScorers),
            getTopAssists: jest.fn().mockResolvedValue(mockTopAssists),
          },
        },
      ],
    }).compile();

    controller = module.get<StandingsController>(StandingsController);
    service = module.get<StandingsService>(StandingsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getStandings', () => {
    it('should return standings for current season', async () => {
      const result = await controller.getStandings();

      expect(result).toEqual(mockStandings);
      expect(service.getStandings).toHaveBeenCalledWith(undefined);
    });

    it('should return standings for specific season', async () => {
      const seasonId = 'season-1';
      await controller.getStandings(seasonId);

      expect(service.getStandings).toHaveBeenCalledWith(seasonId);
    });
  });

  describe('getTopScorers', () => {
    it('should return top scorers with default limit', async () => {
      const result = await controller.getTopScorers();

      expect(result).toEqual(mockTopScorers);
      expect(service.getTopScorers).toHaveBeenCalledWith(undefined, 10);
    });

    it('should return top scorers with custom limit', async () => {
      await controller.getTopScorers('season-1', 5);

      expect(service.getTopScorers).toHaveBeenCalledWith('season-1', 5);
    });
  });

  describe('getTopAssists', () => {
    it('should return top assists with default limit', async () => {
      const result = await controller.getTopAssists();

      expect(result).toEqual(mockTopAssists);
      expect(service.getTopAssists).toHaveBeenCalledWith(undefined, 10);
    });

    it('should return top assists with custom limit', async () => {
      await controller.getTopAssists('season-1', 5);

      expect(service.getTopAssists).toHaveBeenCalledWith('season-1', 5);
    });
  });

  describe('getStandingsBySeason', () => {
    it('should return standings for specific season', async () => {
      const seasonId = 'season-1';
      await controller.getStandingsBySeason(seasonId);

      expect(service.getStandings).toHaveBeenCalledWith(seasonId);
    });
  });
});

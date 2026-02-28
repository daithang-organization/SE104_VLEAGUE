import { Test, TestingModule } from '@nestjs/testing';
import { SeasonTeamController } from './season-team.controller';
import { SeasonService } from './season.service';

describe('SeasonTeamController', () => {
  let controller: SeasonTeamController;
  let service: SeasonService;

  const mockTeams = [
    {
      teamId: 'team-1',
      teamName: 'Hà Nội FC',
      status: 'APPROVED',
      registeredAt: new Date(),
    },
  ];

  const mockRegistration = {
    seasonId: 'season-1',
    teamId: 'team-1',
    status: 'PENDING',
    registeredAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeasonTeamController],
      providers: [
        {
          provide: SeasonService,
          useValue: {
            getSeasonTeams: jest.fn().mockResolvedValue(mockTeams),
            registerTeam: jest.fn().mockResolvedValue(mockRegistration),
            updateTeamStatus: jest
              .fn()
              .mockResolvedValue({ ...mockRegistration, status: 'APPROVED' }),
            removeTeam: jest.fn().mockResolvedValue({ success: true }),
          },
        },
      ],
    }).compile();

    controller = module.get<SeasonTeamController>(SeasonTeamController);
    service = module.get<SeasonService>(SeasonService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTeams', () => {
    it('should return teams for a season', async () => {
      const result = await controller.getTeams('season-1');

      expect(result).toEqual(mockTeams);
      expect(service.getSeasonTeams).toHaveBeenCalledWith('season-1');
    });
  });

  describe('registerTeam', () => {
    it('should register a team to the season', async () => {
      const result = await controller.registerTeam('season-1', {
        teamId: 'team-1',
      });

      expect(result).toEqual(mockRegistration);
      expect(service.registerTeam).toHaveBeenCalledWith('season-1', 'team-1');
    });
  });

  describe('updateTeamStatus', () => {
    it('should update team status in the season', async () => {
      const result = await controller.updateTeamStatus('season-1', 'team-1', {
        status: 'APPROVED',
      });

      expect(result.status).toBe('APPROVED');
      expect(service.updateTeamStatus).toHaveBeenCalledWith(
        'season-1',
        'team-1',
        'APPROVED',
      );
    });
  });

  describe('removeTeam', () => {
    it('should remove team from season', async () => {
      const result = await controller.removeTeam('season-1', 'team-1');

      expect(result).toEqual({ success: true });
      expect(service.removeTeam).toHaveBeenCalledWith('season-1', 'team-1');
    });
  });
});

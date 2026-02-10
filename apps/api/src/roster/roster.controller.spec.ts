import { Test, TestingModule } from '@nestjs/testing';
import { RosterController } from './roster.controller';
import { RosterService } from './roster.service';

describe('RosterController', () => {
  let controller: RosterController;
  let service: RosterService;

  const mockTeamId = 'team-1';
  const mockPlayerId = 'player-1';

  const mockRoster = {
    teamId: mockTeamId,
    teamName: 'Hà Nội FC',
    count: 2,
    players: [
      {
        id: 'tp-1',
        playerId: 'player-1',
        fullName: 'Nguyễn Quang Hải',
        position: 'MF',
        jerseyNumber: 19,
        joinedAt: new Date(),
      },
      {
        id: 'tp-2',
        playerId: 'player-2',
        fullName: 'Đoàn Văn Hậu',
        position: 'DF',
        jerseyNumber: 5,
        joinedAt: new Date(),
      },
    ],
  };

  const mockAddResult = {
    success: true,
    message: 'Player added to team',
    data: {
      id: 'tp-3',
      teamId: mockTeamId,
      playerId: 'player-3',
      jerseyNumber: 10,
    },
  };

  const mockRemoveResult = {
    success: true,
    message: 'Player removed from team',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RosterController],
      providers: [
        {
          provide: RosterService,
          useValue: {
            getTeamRoster: jest.fn().mockResolvedValue(mockRoster),
            addPlayerToRoster: jest.fn().mockResolvedValue(mockAddResult),
            updateRosterPlayer: jest.fn().mockResolvedValue({}),
            removePlayerFromRoster: jest
              .fn()
              .mockResolvedValue(mockRemoveResult),
          },
        },
      ],
    }).compile();

    controller = module.get<RosterController>(RosterController);
    service = module.get<RosterService>(RosterService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTeamRoster', () => {
    it('should return team roster', async () => {
      const result = await controller.getTeamRoster(mockTeamId);

      expect(result).toEqual(mockRoster);
      expect(service.getTeamRoster).toHaveBeenCalledWith(mockTeamId);
    });
  });

  describe('addPlayer', () => {
    it('should add player to roster', async () => {
      const dto = { playerId: 'player-3', jerseyNumber: 10 };
      const result = await controller.addPlayer(mockTeamId, dto);

      expect(result).toEqual(mockAddResult);
      expect(service.addPlayerToRoster).toHaveBeenCalledWith(mockTeamId, dto);
    });
  });

  describe('updatePlayer', () => {
    it('should update player in roster', async () => {
      const dto = { jerseyNumber: 7 };
      await controller.updatePlayer(mockTeamId, mockPlayerId, dto);

      expect(service.updateRosterPlayer).toHaveBeenCalledWith(
        mockTeamId,
        mockPlayerId,
        dto,
      );
    });
  });

  describe('removePlayer', () => {
    it('should remove player from roster', async () => {
      const result = await controller.removePlayer(mockTeamId, mockPlayerId);

      expect(result).toEqual(mockRemoveResult);
      expect(service.removePlayerFromRoster).toHaveBeenCalledWith(
        mockTeamId,
        mockPlayerId,
      );
    });
  });
});

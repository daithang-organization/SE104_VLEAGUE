import { Test, TestingModule } from '@nestjs/testing';
import { PlayersController } from './players.controller';
import { RegistrationService } from './registration.service';

describe('PlayersController', () => {
  let controller: PlayersController;
  let service: RegistrationService;

  const mockPlayer = {
    id: 'player-1',
    fullName: 'Nguyễn Quang Hải',
    dob: '1997-04-12',
    nationality: 'Việt Nam',
    position: 'MF',
    playerType: 'DOMESTIC',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPaginated = {
    data: [mockPlayer],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlayersController],
      providers: [
        {
          provide: RegistrationService,
          useValue: {
            listPlayers: jest.fn().mockResolvedValue(mockPaginated),
            findOnePlayer: jest.fn().mockResolvedValue(mockPlayer),
            createPlayer: jest.fn().mockResolvedValue(mockPlayer),
            updatePlayer: jest
              .fn()
              .mockResolvedValue({ ...mockPlayer, fullName: 'Updated' }),
            deletePlayer: jest.fn().mockResolvedValue({ success: true }),
          },
        },
      ],
    }).compile();

    controller = module.get<PlayersController>(PlayersController);
    service = module.get<RegistrationService>(RegistrationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPlayers', () => {
    it('should return paginated players', async () => {
      const result = await controller.getPlayers(
        { page: 1, limit: 10 } as any,
        'hai',
        'MF',
        'Việt Nam',
        'team-1',
      );

      expect(result).toEqual(mockPaginated);
      expect(service.listPlayers).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: 'hai',
        position: 'MF',
        nationality: 'Việt Nam',
        teamId: 'team-1',
      });
    });
  });

  describe('getPlayer', () => {
    it('should return a single player', async () => {
      const result = await controller.getPlayer('player-1');

      expect(result).toEqual(mockPlayer);
      expect(service.findOnePlayer).toHaveBeenCalledWith('player-1');
    });
  });

  describe('createPlayer', () => {
    it('should create and return player', async () => {
      const dto = {
        fullName: 'Nguyễn Quang Hải',
        dob: '1997-04-12',
        nationality: 'Việt Nam',
        position: 'MF',
      };
      const result = await controller.createPlayer(dto as any);

      expect(result).toEqual(mockPlayer);
      expect(service.createPlayer).toHaveBeenCalledWith(dto);
    });
  });

  describe('updatePlayer', () => {
    it('should update and return player', async () => {
      const dto = { fullName: 'Updated' };
      const result = await controller.updatePlayer('player-1', dto as any);

      expect(result.fullName).toBe('Updated');
      expect(service.updatePlayer).toHaveBeenCalledWith('player-1', dto);
    });
  });

  describe('deletePlayer', () => {
    it('should delete player', async () => {
      const result = await controller.deletePlayer('player-1');

      expect(result).toEqual({ success: true });
      expect(service.deletePlayer).toHaveBeenCalledWith('player-1');
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';

describe('MatchController', () => {
  let controller: MatchController;
  let service: MatchService;

  const mockMatch = {
    id: 'match-1',
    roundNo: 1,
    kickoffAt: '2025-03-01T15:00:00Z',
    status: 'DRAFT',
    homeTeamId: 'team-1',
    awayTeamId: 'team-2',
    homeScore: null,
    awayScore: null,
    events: [],
  };

  const mockPaginated = {
    data: [mockMatch],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  const mockEventResult = {
    ok: true,
    matchId: 'match-1',
    createdEvent: { id: 'evt-1', minute: 45, type: 'GOAL' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchController],
      providers: [
        {
          provide: MatchService,
          useValue: {
            findAll: jest.fn().mockResolvedValue(mockPaginated),
            getMatchById: jest.fn().mockResolvedValue(mockMatch),
            addEvent: jest.fn().mockResolvedValue(mockEventResult),
            removeEvent: jest.fn().mockResolvedValue({ success: true }),
            updateMatch: jest
              .fn()
              .mockResolvedValue({ ...mockMatch, homeScore: 2 }),
            updateStatus: jest
              .fn()
              .mockResolvedValue({ ...mockMatch, status: 'PUBLISHED' }),
          },
        },
      ],
    }).compile();

    controller = module.get<MatchController>(MatchController);
    service = module.get<MatchService>(MatchService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated matches', async () => {
      const result = await controller.findAll(
        'season-1',
        { page: 1, limit: 10 } as any,
        '1',
        'DRAFT',
        'team-1',
      );

      expect(result).toEqual(mockPaginated);
      expect(service.findAll).toHaveBeenCalledWith('season-1', {
        page: 1,
        limit: 10,
        round: 1,
        status: 'DRAFT',
        teamId: 'team-1',
      });
    });

    it('should handle undefined round', async () => {
      await controller.findAll(
        'season-1',
        {} as any,
        undefined,
        undefined,
        undefined,
      );

      expect(service.findAll).toHaveBeenCalledWith('season-1', {
        round: undefined,
        status: undefined,
        teamId: undefined,
      });
    });
  });

  describe('getById', () => {
    it('should return a single match', async () => {
      const result = await controller.getById('match-1');

      expect(result).toEqual(mockMatch);
      expect(service.getMatchById).toHaveBeenCalledWith('match-1');
    });
  });

  describe('addEvent', () => {
    it('should add event to match', async () => {
      const dto = {
        minute: 45,
        type: 'GOAL',
        playerId: 'p-1',
        teamId: 'team-1',
      };
      const result = await controller.addEvent('match-1', dto as any);

      expect(result).toEqual(mockEventResult);
      expect(service.addEvent).toHaveBeenCalledWith('match-1', dto);
    });
  });

  describe('updateMatch', () => {
    it('should update match details', async () => {
      const body = { homeScore: 2, awayScore: 1 };
      const result = await controller.updateMatch('match-1', body);

      expect(result.homeScore).toBe(2);
      expect(service.updateMatch).toHaveBeenCalledWith('match-1', body);
    });
  });

  describe('updateStatus', () => {
    it('should update match status', async () => {
      const result = await controller.updateStatus('match-1', {
        status: 'PUBLISHED',
      });

      expect(result.status).toBe('PUBLISHED');
      expect(service.updateStatus).toHaveBeenCalledWith('match-1', 'PUBLISHED');
    });
  });

  describe('removeEvent', () => {
    it('should delete an event from a match', async () => {
      const result = await controller.removeEvent('match-1', 'evt-1');

      expect(result).toEqual({ success: true });
      expect(service.removeEvent).toHaveBeenCalledWith('match-1', 'evt-1');
    });
  });
});

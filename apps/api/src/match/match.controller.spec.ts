import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
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

  const mockUpdateEventResult = {
    ok: true,
    matchId: 'match-1',
    updatedEvent: { id: 'evt-1', minute: 55, type: 'PENALTY' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchController],
      providers: [
        {
          provide: MatchService,
          useValue: {
            findAll: jest.fn().mockResolvedValue(mockPaginated),
            findAssignedToOfficial: jest.fn().mockResolvedValue(mockPaginated),
            getMatchById: jest.fn().mockResolvedValue(mockMatch),
            addEvent: jest.fn().mockResolvedValue(mockEventResult),
            updateEvent: jest.fn().mockResolvedValue(mockUpdateEventResult),
            removeEvent: jest.fn().mockResolvedValue({ success: true }),
            updateMatch: jest
              .fn()
              .mockResolvedValue({ ...mockMatch, homeScore: 2 }),
            updateStatus: jest
              .fn()
              .mockResolvedValue({ ...mockMatch, status: 'PUBLISHED' }),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            auditLog: {
              create: jest.fn().mockResolvedValue({}),
            },
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
      const query = {
        seasonId: 'season-1',
        page: 1,
        limit: 10,
        round: 1,
        status: 'DRAFT',
        teamId: 'team-1',
      };
      const result = await controller.findAll(query as any);

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
      const query = {
        seasonId: 'season-1',
      };
      await controller.findAll(query as any);

      expect(service.findAll).toHaveBeenCalledWith('season-1', {});
    });

    it('should return matches assigned to the current official', async () => {
      const query = {
        seasonId: 'season-1',
        page: 1,
        limit: 10,
      };
      const user = {
        id: 'user-1',
        email: 'referee@demo.local',
        role: 'REFEREE',
      };

      const result = await controller.findAssignedToMe(query as any, user);

      expect(result).toEqual(mockPaginated);
      expect(service.findAssignedToOfficial).toHaveBeenCalledWith(
        user,
        'season-1',
        { page: 1, limit: 10 },
      );
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

  describe('updateEvent', () => {
    it('should update an event in a match', async () => {
      const dto = {
        minute: 55,
        type: 'PENALTY',
        playerId: 'p-1',
        teamId: 'team-1',
      };
      const result = await controller.updateEvent(
        'match-1',
        'evt-1',
        dto as any,
      );

      expect(result).toEqual(mockUpdateEventResult);
      expect(service.updateEvent).toHaveBeenCalledWith('match-1', 'evt-1', dto);
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

/* eslint-disable @typescript-eslint/no-unsafe-argument */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { MatchService } from './match.service';

describe('MatchService', () => {
  let service: MatchService;
  let prisma: PrismaService;

  const mockMatch = {
    id: 'match-1',
    seasonId: 'season-1',
    roundNo: 1,
    homeTeamId: 'team-1',
    awayTeamId: 'team-2',
    stadiumId: 'stadium-1',
    kickoffAt: new Date(),
    homeScore: 0,
    awayScore: 0,
    status: 'DRAFT',
    homeTeam: { id: 'team-1', name: 'Hà Nội FC' },
    awayTeam: { id: 'team-2', name: 'Viettel FC' },
    stadium: { id: 'stadium-1', name: 'Sân Mỹ Đình' },
    season: { id: 'season-1', name: 'VLeague 2024' },
    events: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchService,
        {
          provide: PrismaService,
          useValue: {
            match: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
            },
            matchEvent: {
              create: jest.fn(),
              findFirst: jest.fn(),
              findMany: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<MatchService>(MatchService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMatchById', () => {
    it('should return a match with all relations', async () => {
      jest
        .spyOn(prisma.match, 'findUnique')
        .mockResolvedValue(mockMatch as any);

      const result = await service.getMatchById('match-1');

      expect(result.id).toBe('match-1');
      expect(result.homeTeam.name).toBe('Hà Nội FC');
      expect(result.events).toEqual([]);
    });

    it('should throw NotFoundException if match not found', async () => {
      jest.spyOn(prisma.match, 'findUnique').mockResolvedValue(null);

      await expect(service.getMatchById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all matches', async () => {
      jest
        .spyOn(prisma.match, 'findMany')
        .mockResolvedValue([mockMatch] as any);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
    });

    it('should filter by seasonId if provided', async () => {
      jest
        .spyOn(prisma.match, 'findMany')
        .mockResolvedValue([mockMatch] as any);

      await service.findAll('season-1');

      expect(prisma.match.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { seasonId: 'season-1' },
        }),
      );
    });
  });

  describe('addEvent', () => {
    it('should create a match event', async () => {
      jest
        .spyOn(prisma.match, 'findUnique')
        .mockResolvedValue(mockMatch as any);
      jest.spyOn(prisma.matchEvent, 'create').mockResolvedValue({
        id: 'event-1',
        matchId: 'match-1',
        minute: 45,
        type: 'GOAL',
        teamId: 'team-1',
        player: { id: 'p1', fullName: 'Player 1' },
        team: { id: 'team-1', name: 'Hà Nội FC' },
      } as any);
      jest.spyOn(prisma.matchEvent, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.match, 'update').mockResolvedValue(mockMatch as any);

      const result = await service.addEvent('match-1', {
        minute: 45,
        type: 'GOAL' as any,
        teamId: 'team-1',
      });

      expect(result.ok).toBe(true);
      expect(result.createdEvent.minute).toBe(45);
    });

    it('should throw NotFoundException if match not found', async () => {
      jest.spyOn(prisma.match, 'findUnique').mockResolvedValue(null);

      await expect(
        service.addEvent('non-existent', {
          minute: 45,
          type: 'GOAL' as any,
          teamId: 'team-1',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeEvent', () => {
    it('should delete an event', async () => {
      jest.spyOn(prisma.matchEvent, 'findFirst').mockResolvedValue({
        id: 'event-1',
        type: 'YELLOW_CARD',
      } as any);
      jest.spyOn(prisma.matchEvent, 'delete').mockResolvedValue({} as any);

      const result = await service.removeEvent('match-1', 'event-1');

      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException if event not found', async () => {
      jest.spyOn(prisma.matchEvent, 'findFirst').mockResolvedValue(null);

      await expect(service.removeEvent('match-1', 'event-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

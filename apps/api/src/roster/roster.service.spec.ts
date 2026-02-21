import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { RegulationHelper } from '../regulation/regulation.helper';
import { RosterService } from './roster.service';

describe('RosterService', () => {
  let service: RosterService;
  let prisma: PrismaService;
  let regulationHelper: RegulationHelper;

  const mockTeam = {
    id: 'team-1',
    name: 'Hà Nội FC',
    status: 'ACTIVE',
  };

  const mockPlayer = {
    id: 'player-1',
    fullName: 'Nguyễn Quang Hải',
    position: 'MF',
    nationality: 'Vietnam',
    dob: new Date('1997-04-12'),
  };

  const mockTeamPlayer = {
    id: 'tp-1',
    teamId: 'team-1',
    playerId: 'player-1',
    jerseyNumber: 19,
    joinedAt: new Date(),
    leftAt: null,
    player: mockPlayer,
    team: mockTeam,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RosterService,
        {
          provide: PrismaService,
          useValue: {
            team: {
              findUnique: jest.fn(),
            },
            player: {
              findUnique: jest.fn(),
            },
            teamPlayer: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              count: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: RegulationHelper,
          useValue: {
            getNumericValue: jest.fn().mockImplementation((_sid, key, fb) => {
              if (key === 'MAX_ROSTER') return Promise.resolve(22);
              if (key === 'MAX_FOREIGN_PLAYERS') return Promise.resolve(3);
              return Promise.resolve(fb);
            }),
          },
        },
      ],
    }).compile();

    service = module.get<RosterService>(RosterService);
    prisma = module.get<PrismaService>(PrismaService);
    regulationHelper = module.get<RegulationHelper>(RegulationHelper);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTeamRoster', () => {
    it('should return team roster with players', async () => {
      jest.spyOn(prisma.team, 'findUnique').mockResolvedValue(mockTeam as any);
      jest
        .spyOn(prisma.teamPlayer, 'findMany')
        .mockResolvedValue([mockTeamPlayer] as any);

      const result = await service.getTeamRoster('team-1');

      expect(result.teamId).toBe('team-1');
      expect(result.teamName).toBe('Hà Nội FC');
      expect(result.count).toBe(1);
      expect(result.players[0].fullName).toBe('Nguyễn Quang Hải');
    });

    it('should throw NotFoundException if team not found', async () => {
      jest.spyOn(prisma.team, 'findUnique').mockResolvedValue(null);

      await expect(service.getTeamRoster('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addPlayerToRoster', () => {
    it('should add player to team', async () => {
      jest.spyOn(prisma.team, 'findUnique').mockResolvedValue(mockTeam as any);
      jest
        .spyOn(prisma.player, 'findUnique')
        .mockResolvedValue(mockPlayer as any);
      jest.spyOn(prisma.teamPlayer, 'findFirst').mockResolvedValue(null);
      jest
        .spyOn(prisma.teamPlayer, 'create')
        .mockResolvedValue(mockTeamPlayer as any);

      const result = await service.addPlayerToRoster('team-1', {
        playerId: 'player-1',
        jerseyNumber: 19,
      });

      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException if player not found', async () => {
      jest.spyOn(prisma.team, 'findUnique').mockResolvedValue(mockTeam as any);
      jest.spyOn(prisma.player, 'findUnique').mockResolvedValue(null);

      await expect(
        service.addPlayerToRoster('team-1', { playerId: 'non-existent' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if player already in team', async () => {
      jest.spyOn(prisma.team, 'findUnique').mockResolvedValue(mockTeam as any);
      jest
        .spyOn(prisma.player, 'findUnique')
        .mockResolvedValue(mockPlayer as any);
      jest.spyOn(prisma.teamPlayer, 'findFirst').mockResolvedValue({
        ...mockTeamPlayer,
        team: { name: 'Other Team' },
      } as any);

      await expect(
        service.addPlayerToRoster('team-1', { playerId: 'player-1' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if jersey number taken', async () => {
      jest.spyOn(prisma.team, 'findUnique').mockResolvedValue(mockTeam as any);
      jest
        .spyOn(prisma.player, 'findUnique')
        .mockResolvedValue(mockPlayer as any);
      jest
        .spyOn(prisma.teamPlayer, 'findFirst')
        .mockResolvedValueOnce(null) // Player not in any team
        .mockResolvedValueOnce(mockTeamPlayer as any); // Jersey taken

      await expect(
        service.addPlayerToRoster('team-1', {
          playerId: 'player-2',
          jerseyNumber: 19,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removePlayerFromRoster', () => {
    it('should mark player as left', async () => {
      jest
        .spyOn(prisma.teamPlayer, 'findFirst')
        .mockResolvedValue(mockTeamPlayer as any);
      jest.spyOn(prisma.teamPlayer, 'update').mockResolvedValue({
        ...mockTeamPlayer,
        leftAt: new Date(),
      } as any);

      const result = await service.removePlayerFromRoster('team-1', 'player-1');

      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException if player not in team', async () => {
      jest.spyOn(prisma.teamPlayer, 'findFirst').mockResolvedValue(null);

      await expect(
        service.removePlayerFromRoster('team-1', 'player-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('addPlayerToRoster - roster limits', () => {
    it('should reject when roster has 22 active players', async () => {
      jest
        .spyOn(prisma.team, 'findUnique')
        .mockResolvedValue({ id: 'team-1', name: 'Team A' } as any);
      jest
        .spyOn(prisma.player, 'findUnique')
        .mockResolvedValue({ id: 'player-new', playerType: 'DOMESTIC' } as any);
      jest.spyOn(prisma.teamPlayer, 'findFirst').mockResolvedValue(null); // not in another team
      jest.spyOn(prisma.teamPlayer, 'count').mockResolvedValue(22); // full roster

      await expect(
        service.addPlayerToRoster('team-1', {
          playerId: 'player-new',
          jerseyNumber: 99,
        }),
      ).rejects.toThrow('22 cầu thủ');
    });

    it('should reject when team has 3 foreign players and adding another', async () => {
      jest
        .spyOn(prisma.team, 'findUnique')
        .mockResolvedValue({ id: 'team-1', name: 'Team A' } as any);
      jest
        .spyOn(prisma.player, 'findUnique')
        .mockResolvedValue({ id: 'player-new', playerType: 'FOREIGN' } as any);
      jest.spyOn(prisma.teamPlayer, 'findFirst').mockResolvedValue(null);
      jest
        .spyOn(prisma.teamPlayer, 'count')
        .mockResolvedValueOnce(18) // active count < 22
        .mockResolvedValueOnce(3); // foreign count = 3

      await expect(
        service.addPlayerToRoster('team-1', {
          playerId: 'player-new',
          jerseyNumber: 99,
        }),
      ).rejects.toThrow('3 cầu thủ ngoại');
    });

    it('should allow adding when roster has space and foreign limit not reached', async () => {
      jest
        .spyOn(prisma.team, 'findUnique')
        .mockResolvedValue({ id: 'team-1', name: 'Team A' } as any);
      jest.spyOn(prisma.player, 'findUnique').mockResolvedValue({
        id: 'player-new',
        fullName: 'Test',
        playerType: 'DOMESTIC',
      } as any);
      jest
        .spyOn(prisma.teamPlayer, 'findFirst')
        .mockResolvedValueOnce(null) // not in another team
        .mockResolvedValueOnce(null); // jersey not taken
      jest.spyOn(prisma.teamPlayer, 'count').mockResolvedValue(15); // plenty of room
      jest.spyOn(prisma.teamPlayer, 'create').mockResolvedValue({
        teamId: 'team-1',
        playerId: 'player-new',
        jerseyNumber: 99,
        player: { fullName: 'Test' },
      } as any);

      const result = await service.addPlayerToRoster('team-1', {
        playerId: 'player-new',
        jerseyNumber: 99,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('addPlayerToRoster - regulation-based limits', () => {
    it('should use season-specific roster limit from regulations', async () => {
      // Custom season with MAX_ROSTER=18
      jest
        .spyOn(regulationHelper, 'getNumericValue')
        .mockImplementation((_sid, key) => {
          if (key === 'MAX_ROSTER') return Promise.resolve(18);
          if (key === 'MAX_FOREIGN_PLAYERS') return Promise.resolve(3);
          return Promise.resolve(0);
        });

      jest
        .spyOn(prisma.team, 'findUnique')
        .mockResolvedValue({ id: 'team-1', name: 'Team A' } as any);
      jest
        .spyOn(prisma.player, 'findUnique')
        .mockResolvedValue({ id: 'player-new', playerType: 'DOMESTIC' } as any);
      jest.spyOn(prisma.teamPlayer, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prisma.teamPlayer, 'count').mockResolvedValue(18); // At custom limit

      await expect(
        service.addPlayerToRoster('team-1', {
          playerId: 'player-new',
          jerseyNumber: 99,
          seasonId: 'season-custom',
        }),
      ).rejects.toThrow('18 cầu thủ');
    });

    it('should use season-specific foreign limit from regulations', async () => {
      jest
        .spyOn(regulationHelper, 'getNumericValue')
        .mockImplementation((_sid, key) => {
          if (key === 'MAX_ROSTER') return Promise.resolve(22);
          if (key === 'MAX_FOREIGN_PLAYERS') return Promise.resolve(2);
          return Promise.resolve(0);
        });

      jest
        .spyOn(prisma.team, 'findUnique')
        .mockResolvedValue({ id: 'team-1', name: 'Team A' } as any);
      jest
        .spyOn(prisma.player, 'findUnique')
        .mockResolvedValue({ id: 'player-new', playerType: 'FOREIGN' } as any);
      jest.spyOn(prisma.teamPlayer, 'findFirst').mockResolvedValue(null);
      jest
        .spyOn(prisma.teamPlayer, 'count')
        .mockResolvedValueOnce(10) // active < 22
        .mockResolvedValueOnce(2); // foreign = custom limit

      await expect(
        service.addPlayerToRoster('team-1', {
          playerId: 'player-new',
          jerseyNumber: 99,
          seasonId: 'season-custom',
        }),
      ).rejects.toThrow('2 cầu thủ ngoại');
    });
  });
});

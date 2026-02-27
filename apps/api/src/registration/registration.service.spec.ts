import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { RegulationHelper } from '../regulation/regulation.helper';
import { PlayerPosition } from './dto/player.dto';
import { RegistrationService } from './registration.service';

describe('RegistrationService', () => {
  let service: RegistrationService;
  let prisma: PrismaService;
  let regulationHelper: RegulationHelper;

  const mockTeams = [
    {
      id: 'team-1',
      name: 'Công An Hà Nội',
      status: 'ACTIVE',
      stadiumId: null,
      shortName: null,
      logoUrl: null,
      city: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      stadium: null,
    },
    {
      id: 'team-2',
      name: 'Hoàng Anh Gia Lai',
      status: 'ACTIVE',
      stadiumId: null,
      shortName: null,
      logoUrl: null,
      city: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      stadium: null,
    },
  ];

  const mockPlayers = [
    {
      id: 'player-1',
      fullName: 'Nguyễn Quang Hải',
      dob: new Date('1997-04-12'),
      nationality: 'Vietnam',
      position: 'MF',
      playerType: 'DOMESTIC',
      birthPlace: null,
      heightCm: null,
      weightKg: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'player-2',
      fullName: 'Đoàn Văn Hậu',
      dob: new Date('1999-04-19'),
      nationality: 'Vietnam',
      position: 'DF',
      playerType: 'DOMESTIC',
      birthPlace: null,
      heightCm: null,
      weightKg: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationService,
        {
          provide: PrismaService,
          useValue: {
            team: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
            player: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
          },
        },
        {
          provide: RegulationHelper,
          useValue: {
            getNumericValue: jest.fn().mockImplementation((_sid, key, fb) => {
              if (key === 'MIN_AGE') return Promise.resolve(16);
              if (key === 'MAX_AGE') return Promise.resolve(40);
              return Promise.resolve(fb);
            }),
          },
        },
      ],
    }).compile();

    service = module.get<RegistrationService>(RegistrationService);
    prisma = module.get<PrismaService>(PrismaService);
    regulationHelper = module.get<RegulationHelper>(RegulationHelper);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ───────────── TEAMS ─────────────

  describe('listTeams', () => {
    it('should return all teams', async () => {
      jest.spyOn(prisma.team, 'findMany').mockResolvedValue(mockTeams as any);
      jest.spyOn(prisma.team, 'count').mockResolvedValue(2);

      const result = await service.listTeams();
      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toBe('Công An Hà Nội');
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
    });

    it('should return empty array when no teams exist', async () => {
      jest.spyOn(prisma.team, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.team, 'count').mockResolvedValue(0);

      const result = await service.listTeams();
      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('findOneTeam', () => {
    it('should return a team by id', async () => {
      jest
        .spyOn(prisma.team, 'findUnique')
        .mockResolvedValue(mockTeams[0] as any);

      const result = await service.findOneTeam('team-1');
      expect(result.name).toBe('Công An Hà Nội');
    });

    it('should throw NotFoundException if team not found', async () => {
      jest.spyOn(prisma.team, 'findUnique').mockResolvedValue(null);

      await expect(service.findOneTeam('not-found')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createTeam', () => {
    it('should create a team', async () => {
      const newTeam = { ...mockTeams[0], name: 'New Team' };
      jest.spyOn(prisma.team, 'create').mockResolvedValue(newTeam as any);

      const result = await service.createTeam({ name: 'New Team' });
      expect(result.name).toBe('New Team');
    });

    it('should throw ConflictException on duplicate name', async () => {
      jest
        .spyOn(prisma.team, 'create')
        .mockRejectedValue(
          Object.assign(new Error('P2002'), { code: 'P2002' }),
        );

      await expect(
        service.createTeam({ name: 'Duplicate Team' }),
      ).rejects.toThrow();
    });
  });

  describe('deleteTeam', () => {
    it('should delete a team', async () => {
      jest
        .spyOn(prisma.team, 'findUnique')
        .mockResolvedValue(mockTeams[0] as any);
      jest.spyOn(prisma.team, 'delete').mockResolvedValue(mockTeams[0] as any);

      const result = await service.deleteTeam('team-1');
      expect(result).toEqual({ success: true });
    });

    it('should throw NotFoundException if team not found', async () => {
      jest.spyOn(prisma.team, 'findUnique').mockResolvedValue(null);

      await expect(service.deleteTeam('not-found')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ───────────── PLAYERS ─────────────

  describe('listPlayers', () => {
    it('should return paginated players', async () => {
      jest
        .spyOn(prisma.player, 'findMany')
        .mockResolvedValue(mockPlayers as any);
      jest.spyOn(prisma.player, 'count').mockResolvedValue(2);

      const result = await service.listPlayers();
      expect(result.data).toHaveLength(2);
      expect(result.data[0].fullName).toBe('Nguyễn Quang Hải');
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should order players by fullName ascending with skip/take', async () => {
      jest
        .spyOn(prisma.player, 'findMany')
        .mockResolvedValue(mockPlayers as any);
      jest.spyOn(prisma.player, 'count').mockResolvedValue(2);

      await service.listPlayers();
      expect(prisma.player.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { fullName: 'asc' },
        include: {
          roster: {
            where: { leftAt: null },
            include: {
              team: {
                select: {
                  id: true,
                  name: true,
                  shortName: true,
                  logoUrl: true,
                },
              },
            },
            take: 1,
          },
        },
        skip: 0,
        take: 20,
      });
    });
  });

  describe('findOnePlayer', () => {
    it('should return a player by id', async () => {
      jest
        .spyOn(prisma.player, 'findUnique')
        .mockResolvedValue(mockPlayers[0] as any);

      const result = await service.findOnePlayer('player-1');
      expect(result.fullName).toBe('Nguyễn Quang Hải');
    });

    it('should throw NotFoundException if player not found', async () => {
      jest.spyOn(prisma.player, 'findUnique').mockResolvedValue(null);

      await expect(service.findOnePlayer('not-found')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createPlayer', () => {
    it('should create a player', async () => {
      const dto = {
        fullName: 'Test Player',
        dob: '2000-01-01',
        nationality: 'Vietnam',
        position: PlayerPosition.FW,
      };
      jest.spyOn(prisma.player, 'create').mockResolvedValue({
        ...mockPlayers[0],
        fullName: dto.fullName,
      } as any);

      const result = await service.createPlayer(dto);
      expect(result.fullName).toBe('Test Player');
    });
  });

  describe('deletePlayer', () => {
    it('should delete a player', async () => {
      jest
        .spyOn(prisma.player, 'findUnique')
        .mockResolvedValue({ ...mockPlayers[0], teamPlayers: [] } as any);
      jest
        .spyOn(prisma.player, 'delete')
        .mockResolvedValue(mockPlayers[0] as any);

      const result = await service.deletePlayer('player-1');
      expect(result).toEqual({ success: true });
    });

    it('should throw NotFoundException if player not found', async () => {
      jest.spyOn(prisma.player, 'findUnique').mockResolvedValue(null);

      await expect(service.deletePlayer('not-found')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createPlayer - age validation', () => {
    it('should reject a player under 16 years old', async () => {
      const today = new Date();
      const youngDob = new Date(
        today.getFullYear() - 15,
        today.getMonth(),
        today.getDate(),
      );

      await expect(
        service.createPlayer({
          fullName: 'Young Player',
          dob: youngDob.toISOString(),
          nationality: 'VN',
          position: 'FORWARD',
        } as any),
      ).rejects.toThrow('ít nhất 16 tuổi');
    });

    it('should reject a player over 40 years old', async () => {
      const today = new Date();
      const oldDob = new Date(
        today.getFullYear() - 41,
        today.getMonth(),
        today.getDate(),
      );

      await expect(
        service.createPlayer({
          fullName: 'Old Player',
          dob: oldDob.toISOString(),
          nationality: 'VN',
          position: 'FORWARD',
        } as any),
      ).rejects.toThrow('không được quá 40 tuổi');
    });

    it('should allow a player exactly 16 years old', async () => {
      const today = new Date();
      const dob = new Date(
        today.getFullYear() - 16,
        today.getMonth(),
        today.getDate(),
      );

      jest.spyOn(prisma.player, 'create').mockResolvedValue({
        id: 'new-id',
        fullName: 'Valid Player',
        dob,
        nationality: 'VN',
        position: 'FORWARD',
        playerType: 'DOMESTIC',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await service.createPlayer({
        fullName: 'Valid Player',
        dob: dob.toISOString(),
        nationality: 'VN',
        position: 'FORWARD',
      } as any);

      expect(result.fullName).toBe('Valid Player');
    });

    it('should allow a player exactly 40 years old', async () => {
      const today = new Date();
      const dob = new Date(
        today.getFullYear() - 40,
        today.getMonth(),
        today.getDate(),
      );

      jest.spyOn(prisma.player, 'create').mockResolvedValue({
        id: 'new-id',
        fullName: 'Veteran Player',
        dob,
        nationality: 'VN',
        position: 'GOALKEEPER',
        playerType: 'DOMESTIC',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await service.createPlayer({
        fullName: 'Veteran Player',
        dob: dob.toISOString(),
        nationality: 'VN',
        position: 'GOALKEEPER',
      } as any);

      expect(result.fullName).toBe('Veteran Player');
    });
  });

  describe('createPlayer - regulation-based age limits', () => {
    it('should use season-specific age limits from regulations', async () => {
      // Custom season with MIN_AGE=18, MAX_AGE=35
      jest
        .spyOn(regulationHelper, 'getNumericValue')
        .mockImplementation((_sid, key) => {
          if (key === 'MIN_AGE') return Promise.resolve(18);
          if (key === 'MAX_AGE') return Promise.resolve(35);
          return Promise.resolve(0);
        });

      const today = new Date();
      const dob17 = new Date(
        today.getFullYear() - 17,
        today.getMonth(),
        today.getDate(),
      );

      await expect(
        service.createPlayer({
          fullName: 'Young Player',
          dob: dob17.toISOString(),
          nationality: 'VN',
          position: 'FORWARD',
          seasonId: 'season-custom',
        } as any),
      ).rejects.toThrow('ít nhất 18 tuổi');
    });

    it('should fall back to defaults when no seasonId provided', async () => {
      const today = new Date();
      const dob17 = new Date(
        today.getFullYear() - 17,
        today.getMonth(),
        today.getDate(),
      );

      jest.spyOn(prisma.player, 'create').mockResolvedValue({
        id: 'new-id',
        fullName: 'Player 17',
        dob: dob17,
        nationality: 'VN',
        position: 'FORWARD',
        playerType: 'DOMESTIC',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      // 17 years old should pass with default MIN_AGE=16 (no seasonId)
      const result = await service.createPlayer({
        fullName: 'Player 17',
        dob: dob17.toISOString(),
        nationality: 'VN',
        position: 'FORWARD',
      } as any);

      expect(result.fullName).toBe('Player 17');
    });
  });
});

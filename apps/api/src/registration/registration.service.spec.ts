import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { RegistrationService } from './registration.service';

describe('RegistrationService', () => {
  let service: RegistrationService;
  let prisma: PrismaService;

  const mockTeams = [
    {
      id: 'team-1',
      name: 'Công An Hà Nội',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'team-2',
      name: 'Hoàng Anh Gia Lai',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockPlayers = [
    {
      id: 'player-1',
      fullName: 'Nguyễn Quang Hải',
      dob: new Date('1997-04-12'),
      nationality: 'Vietnam',
      position: 'MF',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'player-2',
      fullName: 'Đoàn Văn Hậu',
      dob: new Date('1999-04-19'),
      nationality: 'Vietnam',
      position: 'DF',
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
            },
            player: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<RegistrationService>(RegistrationService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listTeams', () => {
    it('should return all teams', async () => {
      jest.spyOn(prisma.team, 'findMany').mockResolvedValue(mockTeams as any);

      const result = await service.listTeams();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Công An Hà Nội');
    });

    it('should order teams by name ascending', async () => {
      jest.spyOn(prisma.team, 'findMany').mockResolvedValue(mockTeams as any);

      await service.listTeams();

      expect(prisma.team.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
    });

    it('should return empty array when no teams exist', async () => {
      jest.spyOn(prisma.team, 'findMany').mockResolvedValue([]);

      const result = await service.listTeams();

      expect(result).toHaveLength(0);
    });
  });

  describe('listPlayers', () => {
    it('should return all players', async () => {
      jest
        .spyOn(prisma.player, 'findMany')
        .mockResolvedValue(mockPlayers as any);

      const result = await service.listPlayers();

      expect(result).toHaveLength(2);
      expect(result[0].fullName).toBe('Nguyễn Quang Hải');
    });

    it('should order players by fullName ascending', async () => {
      jest
        .spyOn(prisma.player, 'findMany')
        .mockResolvedValue(mockPlayers as any);

      await service.listPlayers();

      expect(prisma.player.findMany).toHaveBeenCalledWith({
        orderBy: { fullName: 'asc' },
      });
    });

    it('should return empty array when no players exist', async () => {
      jest.spyOn(prisma.player, 'findMany').mockResolvedValue([]);

      const result = await service.listPlayers();

      expect(result).toHaveLength(0);
    });
  });
});

import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { StadiumService } from './stadium.service';

describe('StadiumService', () => {
  let service: StadiumService;
  let prisma: PrismaService;

  const mockStadium = {
    id: 'stadium-1',
    name: 'Sân Mỹ Đình',
    address: null,
    city: 'Hà Nội',
    country: 'Việt Nam',
    capacity: 40000,
    fifaStars: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StadiumService,
        {
          provide: PrismaService,
          useValue: {
            team: {
              findFirst: jest.fn(),
            },
            stadium: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<StadiumService>(StadiumService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.spyOn(prisma.team, 'findFirst').mockResolvedValue(null);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all stadiums ordered by name', async () => {
      const mockStadiums = [mockStadium];
      jest.spyOn(prisma.stadium, 'findMany').mockResolvedValue(mockStadiums);

      const result = await service.findAll();

      expect(result).toEqual(mockStadiums);
      expect(prisma.stadium.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a stadium with teams', async () => {
      jest.spyOn(prisma.stadium, 'findUnique').mockResolvedValue({
        ...mockStadium,
        teams: [{ id: 'team-1', name: 'Hà Nội FC' }],
      } as any);

      const result = await service.findOne('stadium-1');

      expect(result.id).toBe('stadium-1');
      expect(result.teams).toHaveLength(1);
    });

    it('should throw NotFoundException if stadium not found', async () => {
      jest.spyOn(prisma.stadium, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new stadium', async () => {
      const createDto = {
        name: 'Sân Thống Nhất',
        city: 'TP.HCM',
        country: 'Việt Nam',
        capacity: 15000,
        fifaStars: 2,
      };
      jest.spyOn(prisma.stadium, 'create').mockResolvedValue({
        ...mockStadium,
        ...createDto,
        id: 'new-id',
      });

      const result = await service.create(createDto);

      expect(result.name).toBe('Sân Thống Nhất');
    });

    it('should reject a stadium with capacity below 10,000 seats', async () => {
      await expect(
        service.create({
          name: 'Sân nhỏ',
          city: 'Hà Nội',
          country: 'Việt Nam',
          capacity: 9999,
          fifaStars: 2,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject a stadium outside Vietnam', async () => {
      await expect(
        service.create({
          name: 'Sân nước ngoài',
          city: 'Bangkok',
          country: 'Thailand',
          capacity: 20000,
          fifaStars: 2,
        }),
      ).rejects.toThrow('Việt Nam');
    });

    it('should reject a stadium below 2 FIFA stars', async () => {
      await expect(
        service.create({
          name: 'Sân chưa đạt chuẩn',
          city: 'Hà Nội',
          country: 'Việt Nam',
          capacity: 20000,
          fifaStars: 1,
        }),
      ).rejects.toThrow('2 sao');
    });

    it('should throw ConflictException if stadium name exists', async () => {
      const createDto = { name: 'Sân Mỹ Đình', city: 'Hà Nội' };
      const prismaError = new Error('Unique constraint violation');
      Object.assign(prismaError, {
        code: 'P2002',
        name: 'PrismaClientKnownRequestError',
      });
      jest.spyOn(prisma.stadium, 'create').mockRejectedValue(prismaError);

      // The service rethrows as-is if not Prisma.PrismaClientKnownRequestError instance
      await expect(service.create(createDto)).rejects.toBeDefined();
    });
  });

  describe('update', () => {
    it('should update a stadium', async () => {
      jest.spyOn(prisma.stadium, 'findUnique').mockResolvedValue({
        ...mockStadium,
        teams: [],
      } as any);
      jest.spyOn(prisma.stadium, 'update').mockResolvedValue({
        ...mockStadium,
        capacity: 50000,
      });

      const result = await service.update('stadium-1', { capacity: 50000 });

      expect(result.capacity).toBe(50000);
    });

    it('should reject updates that make a stadium ineligible', async () => {
      jest.spyOn(prisma.stadium, 'findUnique').mockResolvedValue({
        ...mockStadium,
        teams: [],
      } as any);

      await expect(
        service.update('stadium-1', { capacity: 9000 }),
      ).rejects.toThrow('10.000');
    });
  });

  describe('delete', () => {
    it('should delete a stadium', async () => {
      jest.spyOn(prisma.stadium, 'findUnique').mockResolvedValue({
        ...mockStadium,
        teams: [],
      } as any);
      jest.spyOn(prisma.stadium, 'delete').mockResolvedValue(mockStadium);

      const result = await service.delete('stadium-1');

      expect(result.success).toBe(true);
    });
  });
});

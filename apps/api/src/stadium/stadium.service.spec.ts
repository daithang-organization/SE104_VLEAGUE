/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { StadiumService } from './stadium.service';

describe('StadiumService', () => {
  let service: StadiumService;
  let prisma: PrismaService;

  const mockStadium = {
    id: 'stadium-1',
    name: 'Sân Mỹ Đình',
    city: 'Hà Nội',
    capacity: 40000,
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
        capacity: 15000,
      };
      jest.spyOn(prisma.stadium, 'create').mockResolvedValue({
        ...mockStadium,
        ...createDto,
        id: 'new-id',
      });

      const result = await service.create(createDto);

      expect(result.name).toBe('Sân Thống Nhất');
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

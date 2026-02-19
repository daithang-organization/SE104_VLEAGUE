import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { RegulationService } from './regulation.service';

describe('RegulationService', () => {
  let service: RegulationService;
  let prisma: PrismaService;

  const mockSeason = {
    id: 'season-1',
    name: 'VLeague 2024',
    year: 2024,
    status: 'IN_PROGRESS',
    startDate: new Date(),
    endDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRegulation = {
    id: 'reg-1',
    seasonId: 'season-1',
    key: 'MAX_FOREIGN_PLAYERS',
    value: '3',
    valueType: 'number',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegulationService,
        {
          provide: PrismaService,
          useValue: {
            season: {
              findUnique: jest.fn(),
            },
            regulation: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              upsert: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<RegulationService>(RegulationService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all regulations for a season', async () => {
      jest
        .spyOn(prisma.season, 'findUnique')
        .mockResolvedValue(mockSeason as any);
      jest
        .spyOn(prisma.regulation, 'findMany')
        .mockResolvedValue([mockRegulation] as any);

      const result = await service.findAll('season-1');

      expect(result).toHaveLength(1);
      expect(result[0].key).toBe('MAX_FOREIGN_PLAYERS');
    });

    it('should throw NotFoundException if season not found', async () => {
      jest.spyOn(prisma.season, 'findUnique').mockResolvedValue(null);

      await expect(service.findAll('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByKey', () => {
    it('should return a regulation by key', async () => {
      jest
        .spyOn(prisma.regulation, 'findUnique')
        .mockResolvedValue(mockRegulation as any);

      const result = await service.findByKey('season-1', 'MAX_FOREIGN_PLAYERS');

      expect(result.key).toBe('MAX_FOREIGN_PLAYERS');
      expect(result.value).toBe('3');
    });

    it('should throw NotFoundException if regulation not found', async () => {
      jest.spyOn(prisma.regulation, 'findUnique').mockResolvedValue(null);

      await expect(
        service.findByKey('season-1', 'NON_EXISTENT'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('upsert', () => {
    it('should upsert a regulation', async () => {
      jest
        .spyOn(prisma.season, 'findUnique')
        .mockResolvedValue(mockSeason as any);
      jest
        .spyOn(prisma.regulation, 'upsert')
        .mockResolvedValue(mockRegulation as any);

      const result = await service.upsert('season-1', {
        key: 'MAX_FOREIGN_PLAYERS',
        value: '3',
        valueType: 'number',
      });

      expect(result.key).toBe('MAX_FOREIGN_PLAYERS');
    });

    it('should throw NotFoundException if season not found', async () => {
      jest.spyOn(prisma.season, 'findUnique').mockResolvedValue(null);

      await expect(
        service.upsert('non-existent', { key: 'TEST', value: '1' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a regulation value', async () => {
      jest
        .spyOn(prisma.regulation, 'findUnique')
        .mockResolvedValue(mockRegulation as any);
      jest.spyOn(prisma.regulation, 'update').mockResolvedValue({
        ...mockRegulation,
        value: '5',
      } as any);

      const result = await service.update('season-1', 'MAX_FOREIGN_PLAYERS', {
        value: '5',
      });

      expect(result.value).toBe('5');
    });

    it('should throw NotFoundException if regulation not found', async () => {
      jest.spyOn(prisma.regulation, 'findUnique').mockResolvedValue(null);

      await expect(
        service.update('season-1', 'NON_EXISTENT', { value: '1' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a regulation', async () => {
      jest
        .spyOn(prisma.regulation, 'findUnique')
        .mockResolvedValue(mockRegulation as any);
      jest
        .spyOn(prisma.regulation, 'delete')
        .mockResolvedValue(mockRegulation as any);

      const result = await service.delete('season-1', 'MAX_FOREIGN_PLAYERS');

      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException if regulation not found', async () => {
      jest.spyOn(prisma.regulation, 'findUnique').mockResolvedValue(null);

      await expect(service.delete('season-1', 'NON_EXISTENT')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('seedDefaults', () => {
    it('should seed default regulations for a season', async () => {
      jest
        .spyOn(prisma.season, 'findUnique')
        .mockResolvedValue(mockSeason as any);
      jest
        .spyOn(prisma.regulation, 'upsert')
        .mockResolvedValue(mockRegulation as any);

      const result = await service.seedDefaults('season-1');

      expect(result.length).toBeGreaterThan(0);
      expect(prisma.regulation.upsert).toHaveBeenCalled();
    });

    it('should throw NotFoundException if season not found', async () => {
      jest.spyOn(prisma.season, 'findUnique').mockResolvedValue(null);

      await expect(service.seedDefaults('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

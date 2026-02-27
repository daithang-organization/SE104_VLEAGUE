import { Test, TestingModule } from '@nestjs/testing';
import { RegulationController } from './regulation.controller';
import { RegulationService } from './regulation.service';

describe('RegulationController', () => {
  let controller: RegulationController;
  let service: RegulationService;

  const mockRegulation = {
    id: 'reg-1',
    seasonId: 'season-1',
    key: 'MAX_FOREIGN_PLAYERS',
    value: '3',
    valueType: 'INTEGER',
  };

  const mockRegulations = [
    mockRegulation,
    {
      id: 'reg-2',
      seasonId: 'season-1',
      key: 'MIN_PLAYERS',
      value: '15',
      valueType: 'INTEGER',
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegulationController],
      providers: [
        {
          provide: RegulationService,
          useValue: {
            findAll: jest.fn().mockResolvedValue(mockRegulations),
            findByKey: jest.fn().mockResolvedValue(mockRegulation),
            upsert: jest.fn().mockResolvedValue(mockRegulation),
            delete: jest.fn().mockResolvedValue({ success: true }),
            seedDefaults: jest.fn().mockResolvedValue(mockRegulations),
          },
        },
      ],
    }).compile();

    controller = module.get<RegulationController>(RegulationController);
    service = module.get<RegulationService>(RegulationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all regulations for a season', async () => {
      const result = await controller.findAll('season-1');

      expect(result).toEqual(mockRegulations);
      expect(service.findAll).toHaveBeenCalledWith('season-1');
    });
  });

  describe('findByKey', () => {
    it('should return regulation by key', async () => {
      const result = await controller.findByKey(
        'season-1',
        'MAX_FOREIGN_PLAYERS',
      );

      expect(result).toEqual(mockRegulation);
      expect(service.findByKey).toHaveBeenCalledWith(
        'season-1',
        'MAX_FOREIGN_PLAYERS',
      );
    });
  });

  describe('upsert', () => {
    it('should create or update regulation', async () => {
      const dto = {
        key: 'MAX_FOREIGN_PLAYERS',
        value: '3',
        valueType: 'INTEGER',
      };
      const result = await controller.upsert('season-1', dto as any);

      expect(result).toEqual(mockRegulation);
      expect(service.upsert).toHaveBeenCalledWith('season-1', dto);
    });
  });

  describe('delete', () => {
    it('should delete regulation by key', async () => {
      const result = await controller.delete('season-1', 'MAX_FOREIGN_PLAYERS');

      expect(result).toEqual({ success: true });
      expect(service.delete).toHaveBeenCalledWith(
        'season-1',
        'MAX_FOREIGN_PLAYERS',
      );
    });
  });

  describe('seedDefaults', () => {
    it('should seed default regulations', async () => {
      const result = await controller.seedDefaults('season-1');

      expect(result).toEqual(mockRegulations);
      expect(service.seedDefaults).toHaveBeenCalledWith('season-1');
    });
  });
});

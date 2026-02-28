import { Test, TestingModule } from '@nestjs/testing';
import { SeasonController } from './season.controller';
import { SeasonService } from './season.service';

describe('SeasonController', () => {
  let controller: SeasonController;
  let service: SeasonService;

  const mockSeason = {
    id: 'season-1',
    name: 'V-League 2025',
    year: 2025,
    status: 'UPCOMING',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSeasons = [mockSeason];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeasonController],
      providers: [
        {
          provide: SeasonService,
          useValue: {
            findAll: jest.fn().mockResolvedValue(mockSeasons),
            findCurrent: jest.fn().mockResolvedValue(mockSeason),
            findOne: jest.fn().mockResolvedValue(mockSeason),
            create: jest.fn().mockResolvedValue(mockSeason),
            update: jest
              .fn()
              .mockResolvedValue({ ...mockSeason, name: 'Updated' }),
            delete: jest.fn().mockResolvedValue({ success: true }),
            updateStatus: jest
              .fn()
              .mockResolvedValue({ ...mockSeason, status: 'IN_PROGRESS' }),
          },
        },
      ],
    }).compile();

    controller = module.get<SeasonController>(SeasonController);
    service = module.get<SeasonService>(SeasonService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all seasons', async () => {
      const result = await controller.findAll();

      expect(result).toEqual(mockSeasons);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findCurrent', () => {
    it('should return current season', async () => {
      const result = await controller.findCurrent();

      expect(result).toEqual(mockSeason);
      expect(service.findCurrent).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single season', async () => {
      const result = await controller.findOne('season-1');

      expect(result).toEqual(mockSeason);
      expect(service.findOne).toHaveBeenCalledWith('season-1');
    });
  });

  describe('create', () => {
    it('should create and return season', async () => {
      const dto = { name: 'V-League 2025', year: 2025 };
      const result = await controller.create(dto as any);

      expect(result).toEqual(mockSeason);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should update and return season', async () => {
      const dto = { name: 'Updated' };
      const result = await controller.update('season-1', dto as any);

      expect(result.name).toBe('Updated');
      expect(service.update).toHaveBeenCalledWith('season-1', dto);
    });
  });

  describe('delete', () => {
    it('should delete season', async () => {
      const result = await controller.delete('season-1');

      expect(result).toEqual({ success: true });
      expect(service.delete).toHaveBeenCalledWith('season-1');
    });
  });

  describe('updateStatus', () => {
    it('should update season status', async () => {
      const result = await controller.updateStatus('season-1', {
        status: 'IN_PROGRESS',
      });

      expect(result.status).toBe('IN_PROGRESS');
      expect(service.updateStatus).toHaveBeenCalledWith(
        'season-1',
        'IN_PROGRESS',
      );
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { SchedulingController } from './scheduling.controller';
import { SchedulingService } from './scheduling.service';

describe('SchedulingController', () => {
  let controller: SchedulingController;
  let service: SchedulingService;

  const mockGenerateResult = {
    ok: true,
    message: 'Đã tạo 24 trận đấu',
    totalMatches: 24,
  };

  const mockPublishResult = {
    ok: true,
    message: 'Đã công bố lịch thi đấu',
  };

  const mockSchedule = {
    ok: true,
    matches: [
      {
        id: 'match-1',
        roundNo: 1,
        homeTeam: 'Hà Nội FC',
        awayTeam: 'Hải Phòng FC',
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchedulingController],
      providers: [
        {
          provide: SchedulingService,
          useValue: {
            generate: jest.fn().mockResolvedValue(mockGenerateResult),
            publish: jest.fn().mockResolvedValue(mockPublishResult),
            getSchedule: jest.fn().mockResolvedValue(mockSchedule),
          },
        },
      ],
    }).compile();

    controller = module.get<SchedulingController>(SchedulingController);
    service = module.get<SchedulingService>(SchedulingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('generate', () => {
    it('should generate schedule with seasonId', async () => {
      const result = await controller.generate('season-1');

      expect(result).toEqual(mockGenerateResult);
      expect(service.generate).toHaveBeenCalledWith('season-1');
    });

    it('should generate schedule without seasonId', async () => {
      await controller.generate(undefined);

      expect(service.generate).toHaveBeenCalledWith(undefined);
    });
  });

  describe('publish', () => {
    it('should publish schedule with seasonId', async () => {
      const result = await controller.publish('season-1');

      expect(result).toEqual(mockPublishResult);
      expect(service.publish).toHaveBeenCalledWith('season-1');
    });

    it('should publish schedule without seasonId', async () => {
      await controller.publish(undefined);

      expect(service.publish).toHaveBeenCalledWith(undefined);
    });
  });

  describe('getSchedule', () => {
    it('should get schedule with seasonId', async () => {
      const result = await controller.getSchedule('season-1');

      expect(result).toEqual(mockSchedule);
      expect(service.getSchedule).toHaveBeenCalledWith('season-1');
    });

    it('should get schedule without seasonId', async () => {
      await controller.getSchedule(undefined);

      expect(service.getSchedule).toHaveBeenCalledWith(undefined);
    });
  });
});

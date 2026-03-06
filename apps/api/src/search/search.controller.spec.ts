import { Test, TestingModule } from '@nestjs/testing';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

describe('SearchController', () => {
  let controller: SearchController;
  let service: SearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [
        {
          provide: SearchService,
          useValue: {
            globalSearch: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    controller = module.get<SearchController>(SearchController);
    service = module.get<SearchService>(SearchService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('search', () => {
    it('should delegate to SearchService.globalSearch', async () => {
      const mockResults = [
        { type: 'team', id: 't1', title: 'Hà Nội FC', url: '/teams/t1' },
      ];
      jest.spyOn(service, 'globalSearch').mockResolvedValue(mockResults as any);

      const result = await controller.search({ q: 'Hà Nội', limit: 10 });

      expect(result).toEqual(mockResults);
      expect(service.globalSearch).toHaveBeenCalledWith('Hà Nội', 10);
    });

    it('should use default limit when not provided', async () => {
      jest.spyOn(service, 'globalSearch').mockResolvedValue([]);

      await controller.search({ q: 'test' } as any);

      expect(service.globalSearch).toHaveBeenCalledWith('test', 10);
    });

    it('should return empty array when no results', async () => {
      jest.spyOn(service, 'globalSearch').mockResolvedValue([]);

      const result = await controller.search({ q: 'xyz', limit: 5 });

      expect(result).toEqual([]);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { TeamsController } from './teams.controller';
import { RegistrationService } from './registration.service';

describe('TeamsController', () => {
  let controller: TeamsController;
  let service: RegistrationService;

  const mockTeam = {
    id: 'team-1',
    name: 'Hà Nội FC',
    shortName: 'HN',
    city: 'Hà Nội',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPaginated = {
    data: [mockTeam],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamsController],
      providers: [
        {
          provide: RegistrationService,
          useValue: {
            listTeams: jest.fn().mockResolvedValue(mockPaginated),
            findOneTeam: jest.fn().mockResolvedValue(mockTeam),
            createTeam: jest.fn().mockResolvedValue(mockTeam),
            updateTeam: jest
              .fn()
              .mockResolvedValue({ ...mockTeam, name: 'Updated' }),
            deleteTeam: jest.fn().mockResolvedValue({ success: true }),
          },
        },
      ],
    }).compile();

    controller = module.get<TeamsController>(TeamsController);
    service = module.get<RegistrationService>(RegistrationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTeams', () => {
    it('should return paginated teams', async () => {
      const result = await controller.getTeams(
        { page: 1, limit: 10 } as any,
        'hanoi',
        'ACTIVE',
      );

      expect(result).toEqual(mockPaginated);
      expect(service.listTeams).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: 'hanoi',
        status: 'ACTIVE',
      });
    });
  });

  describe('getTeam', () => {
    it('should return a single team', async () => {
      const result = await controller.getTeam('team-1');

      expect(result).toEqual(mockTeam);
      expect(service.findOneTeam).toHaveBeenCalledWith('team-1');
    });
  });

  describe('createTeam', () => {
    it('should create and return team', async () => {
      const dto = { name: 'Hà Nội FC', city: 'Hà Nội' };
      const result = await controller.createTeam(dto as any);

      expect(result).toEqual(mockTeam);
      expect(service.createTeam).toHaveBeenCalledWith(dto);
    });
  });

  describe('updateTeam', () => {
    it('should update and return team', async () => {
      const dto = { name: 'Updated' };
      const result = await controller.updateTeam('team-1', dto as any);

      expect(result.name).toBe('Updated');
      expect(service.updateTeam).toHaveBeenCalledWith('team-1', dto);
    });
  });

  describe('deleteTeam', () => {
    it('should delete team', async () => {
      const result = await controller.deleteTeam('team-1');

      expect(result).toEqual({ success: true });
      expect(service.deleteTeam).toHaveBeenCalledWith('team-1');
    });
  });
});

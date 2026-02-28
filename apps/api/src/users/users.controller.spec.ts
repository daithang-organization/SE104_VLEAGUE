import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser = {
    id: 'user-1',
    email: 'admin@vleague.local',
    name: 'Admin',
    role: 'ADMIN',
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsers = [
    mockUser,
    {
      id: 'user-2',
      email: 'manager@vleague.local',
      name: 'Manager',
      role: 'TEAM_MANAGER',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            listUsers: jest.fn().mockResolvedValue(mockUsers),
            createUser: jest.fn().mockResolvedValue(mockUser),
            updateRole: jest
              .fn()
              .mockResolvedValue({ ...mockUser, role: 'REFEREE' }),
            deleteUser: jest.fn().mockResolvedValue({ success: true }),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUsers', () => {
    it('should return list of users', async () => {
      const result = await controller.getUsers();

      expect(result).toEqual(mockUsers);
      expect(service.listUsers).toHaveBeenCalled();
    });
  });

  describe('createUser', () => {
    it('should create a user and delegate to service', async () => {
      const dto = {
        email: 'new@test.com',
        password: 'Pass@123',
        role: 'TEAM_MANAGER' as any,
        name: 'New User',
      };
      const result = await controller.createUser(dto);

      expect(result).toEqual(mockUser);
      expect(service.createUser).toHaveBeenCalledWith(dto);
    });
  });

  describe('updateRole', () => {
    it('should update user role and delegate to service', async () => {
      const dto = { role: 'REFEREE' as any };
      const result = await controller.updateRole('user-1', dto);

      expect(result.role).toBe('REFEREE');
      expect(service.updateRole).toHaveBeenCalledWith('user-1', dto.role);
    });
  });

  describe('deleteUser', () => {
    it('should delete user and delegate to service', async () => {
      const result = await controller.deleteUser('user-1');

      expect(result).toEqual({ success: true });
      expect(service.deleteUser).toHaveBeenCalledWith('user-1');
    });
  });
});

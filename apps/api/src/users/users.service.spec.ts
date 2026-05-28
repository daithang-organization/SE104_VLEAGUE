import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockUser = {
    id: 'user-1',
    email: 'admin@vleague.local',
    name: 'Admin User',
    role: 'ADMIN',
    emailVerified: true,
    avatarUrl: null,
    googleId: null,
    facebookId: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  const mockUserSelect = {
    id: 'user-1',
    email: 'admin@vleague.local',
    name: 'Admin User',
    role: 'ADMIN',
    emailVerified: true,
    avatarUrl: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            team: {
              findUnique: jest.fn(),
            },
            otpCode: {
              deleteMany: jest.fn(),
            },
            refreshToken: {
              deleteMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listUsers', () => {
    it('should return all users ordered by createdAt desc', async () => {
      const users = [mockUser];
      jest.spyOn(prisma.user, 'findMany').mockResolvedValue(users as any);

      const result = await service.listUsers();

      expect(result).toEqual(users);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          avatarUrl: true,
          googleId: true,
          facebookId: true,
          managedTeamId: true,
          managedTeam: {
            select: {
              id: true,
              name: true,
              shortName: true,
              logoUrl: true,
              city: true,
              status: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when no users', async () => {
      jest.spyOn(prisma.user, 'findMany').mockResolvedValue([]);

      const result = await service.listUsers();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      jest
        .spyOn(prisma.user, 'findUnique')
        .mockResolvedValue(mockUserSelect as any);

      const result = await service.findOne('user-1');

      expect(result.id).toBe('user-1');
      expect(result.email).toBe('admin@vleague.local');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          avatarUrl: true,
          managedTeamId: true,
          managedTeam: {
            select: {
              id: true,
              name: true,
              shortName: true,
              logoUrl: true,
              city: true,
              status: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should include user ID in the error message', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne('abc-123')).rejects.toThrow('abc-123');
    });
  });

  describe('updateRole', () => {
    it('should update user role', async () => {
      jest
        .spyOn(prisma.user, 'findUnique')
        .mockResolvedValue(mockUserSelect as any);
      jest.spyOn(prisma.user, 'update').mockResolvedValue({
        ...mockUserSelect,
        role: 'REFEREE',
      } as any);

      const result = await service.updateRole('user-1', 'REFEREE' as any);

      expect(result.role).toBe('REFEREE');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { role: 'REFEREE', managedTeamId: null },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatarUrl: true,
          managedTeamId: true,
          managedTeam: {
            select: {
              id: true,
              name: true,
              shortName: true,
              logoUrl: true,
              city: true,
              status: true,
            },
          },
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(
        service.updateRole('non-existent', 'ADMIN' as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createUser', () => {
    it('should create a new user with hashed password', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.team, 'findUnique').mockResolvedValue({
        id: 'team-1',
        name: 'Hà Nội FC',
      } as any);
      jest.spyOn(prisma.user, 'create').mockResolvedValue({
        ...mockUserSelect,
        email: 'new@vleague.local',
        role: 'TEAM_MANAGER',
        managedTeamId: 'team-1',
      } as any);

      const dto = {
        email: 'new@vleague.local',
        password: 'Password@123',
        role: 'TEAM_MANAGER' as any,
        name: 'New User',
        managedTeamId: 'team-1',
      };
      const result = await service.createUser(dto);

      expect(result.email).toBe('new@vleague.local');
      expect(prisma.team.findUnique).toHaveBeenCalledWith({
        where: { id: 'team-1' },
      });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'new@vleague.local',
          passwordHash: 'hashed-password',
          role: 'TEAM_MANAGER',
          name: 'New User',
          managedTeamId: 'team-1',
          emailVerified: true,
        },
        select: expect.objectContaining({
          id: true,
          email: true,
          role: true,
          managedTeamId: true,
          managedTeam: expect.any(Object),
        }),
      });
    });

    it('requires a fixed CLB when creating a team manager account', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(
        service.createUser({
          email: 'manager@vleague.local',
          password: 'Password@123',
          role: 'TEAM_MANAGER' as any,
        }),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('rejects a fixed CLB for non team-manager accounts', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(
        service.createUser({
          email: 'referee@vleague.local',
          password: 'Password@123',
          role: 'REFEREE' as any,
          managedTeamId: 'team-1',
        } as any),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);

      const dto = {
        email: 'admin@vleague.local',
        password: 'Password@123',
        role: 'TEAM_MANAGER' as any,
      };

      await expect(service.createUser(dto)).rejects.toThrow(ConflictException);
    });

    it('should include email in conflict error message', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);

      const dto = {
        email: 'admin@vleague.local',
        password: 'Password@123',
        role: 'ADMIN' as any,
      };

      await expect(service.createUser(dto)).rejects.toThrow(
        'admin@vleague.local',
      );
    });

    it('should set emailVerified to true for admin-created accounts', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      jest
        .spyOn(prisma.user, 'create')
        .mockResolvedValue(mockUserSelect as any);

      await service.createUser({
        email: 'test@test.com',
        password: 'pass123',
        role: 'PUBLIC' as any,
      });

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            emailVerified: true,
          }),
        }),
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete user and related records', async () => {
      jest
        .spyOn(prisma.user, 'findUnique')
        .mockResolvedValue(mockUserSelect as any);
      jest.spyOn(prisma.otpCode, 'deleteMany').mockResolvedValue({ count: 0 });
      jest
        .spyOn(prisma.refreshToken, 'deleteMany')
        .mockResolvedValue({ count: 2 });
      jest.spyOn(prisma.user, 'delete').mockResolvedValue(mockUser as any);

      const result = await service.deleteUser('user-1');

      expect(result).toEqual({ success: true });
      expect(prisma.otpCode.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.deleteUser('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should delete OTP codes and refresh tokens before deleting user', async () => {
      jest
        .spyOn(prisma.user, 'findUnique')
        .mockResolvedValue(mockUserSelect as any);
      jest.spyOn(prisma.otpCode, 'deleteMany').mockResolvedValue({ count: 1 });
      jest
        .spyOn(prisma.refreshToken, 'deleteMany')
        .mockResolvedValue({ count: 0 });
      jest.spyOn(prisma.user, 'delete').mockResolvedValue(mockUser as any);

      await service.deleteUser('user-1');

      // Verify all cleanup methods were called
      expect(prisma.otpCode.deleteMany).toHaveBeenCalledTimes(1);
      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledTimes(1);
      expect(prisma.user.delete).toHaveBeenCalledTimes(1);
    });
  });
});

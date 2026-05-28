import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { TeamManagerScopeService } from './team-manager-scope.service';

describe('TeamManagerScopeService', () => {
  let service: TeamManagerScopeService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamManagerScopeService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get(TeamManagerScopeService);
    prisma = module.get(PrismaService);
  });

  it('allows admins to manage any team without loading a managed club', async () => {
    await expect(
      service.assertCanManageTeam({ id: 'admin-1', role: 'ADMIN' }, 'team-2'),
    ).resolves.toBeUndefined();

    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('allows a team manager to manage only the fixed club', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({
      id: 'manager-1',
      role: 'TEAM_MANAGER',
      managedTeamId: 'team-1',
    } as any);

    await expect(
      service.assertCanManageTeam(
        { id: 'manager-1', role: 'TEAM_MANAGER' },
        'team-1',
      ),
    ).resolves.toBeUndefined();
  });

  it('rejects a team manager managing another club', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({
      id: 'manager-1',
      role: 'TEAM_MANAGER',
      managedTeamId: 'team-1',
    } as any);

    await expect(
      service.assertCanManageTeam(
        { id: 'manager-1', role: 'TEAM_MANAGER' },
        'team-2',
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('rejects a team manager without a fixed club', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({
      id: 'manager-1',
      role: 'TEAM_MANAGER',
      managedTeamId: null,
    } as any);

    await expect(
      service.resolveManagedTeamId({
        id: 'manager-1',
        role: 'TEAM_MANAGER',
      }),
    ).rejects.toThrow(ForbiddenException);
  });
});

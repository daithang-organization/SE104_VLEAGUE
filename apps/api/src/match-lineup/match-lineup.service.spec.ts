import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from '../notification/notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegulationHelper } from '../regulation/regulation.helper';
import { TeamManagerScopeService } from '../team-manager/team-manager-scope.service';
import type { SubmitMatchLineupDto } from './dto/match-lineup.dto';
import { MatchLineupService } from './match-lineup.service';

const match = {
  id: 'match-1',
  seasonId: 'season-1',
  roundNo: 1,
  homeTeamId: 'team-1',
  awayTeamId: 'team-2',
  kickoffAt: new Date('2025-02-01T12:00:00Z'),
  status: 'PUBLISHED',
};

function lineupPayload(
  playerIds = Array.from({ length: 16 }, (_, index) => `player-${index + 1}`),
): SubmitMatchLineupDto {
  return {
    teamId: 'team-1',
    kitType: 'PRIMARY',
    formation: '4-4-2',
    players: playerIds.map((playerId, index) => ({
      playerId,
      role: index < 11 ? 'STARTER' : 'SUBSTITUTE',
      position: index === 0 ? 'GK' : index < 5 ? 'DF' : index < 9 ? 'MF' : 'FW',
      shirtNumber: index + 1,
    })),
  };
}

function rosterRows(foreignStarterCount = 0) {
  return Array.from({ length: 16 }, (_, index) => ({
    playerId: `player-${index + 1}`,
    player: {
      id: `player-${index + 1}`,
      fullName: `Cầu thủ ${index + 1}`,
      playerType: index < foreignStarterCount ? 'FOREIGN' : 'DOMESTIC',
      nationality: index < foreignStarterCount ? 'Brazil' : 'Việt Nam',
    },
  }));
}

describe('MatchLineupService', () => {
  let service: MatchLineupService;
  let prisma: PrismaService;
  let regulationHelper: RegulationHelper;
  let teamManagerScope: TeamManagerScopeService;
  let notificationService: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchLineupService,
        {
          provide: PrismaService,
          useValue: {
            match: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
            },
            teamPlayer: {
              findMany: jest.fn(),
            },
            playerSuspension: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              updateMany: jest.fn(),
              upsert: jest.fn(),
            },
            matchEvent: {
              findMany: jest.fn(),
            },
            matchTeamRegistration: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              upsert: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: RegulationHelper,
          useValue: {
            getNumericValue: jest.fn().mockResolvedValue(3),
          },
        },
        {
          provide: TeamManagerScopeService,
          useValue: {
            assertCanManageTeam: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: NotificationService,
          useValue: {
            createForUser: jest
              .fn()
              .mockResolvedValue({ id: 'notification-1' }),
            notifyAdmins: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get(MatchLineupService);
    prisma = module.get(PrismaService);
    regulationHelper = module.get(RegulationHelper);
    teamManagerScope = module.get(TeamManagerScopeService);
    notificationService = module.get(NotificationService);

    jest.spyOn(prisma.match, 'findUnique').mockResolvedValue(match as any);
    jest
      .spyOn(prisma.teamPlayer, 'findMany')
      .mockResolvedValue(rosterRows() as any);
    jest.spyOn(prisma.playerSuspension, 'findMany').mockResolvedValue([]);
    jest.spyOn(prisma.playerSuspension, 'findFirst').mockResolvedValue(null);
    jest.spyOn(prisma.matchTeamRegistration, 'upsert').mockResolvedValue({
      id: 'registration-1',
      matchId: 'match-1',
      teamId: 'team-1',
    } as any);
  });

  it('submits a valid 11 starter and 5 substitute lineup', async () => {
    const actor = { id: 'manager-1', role: 'TEAM_MANAGER' };
    const result = await service.submitLineup(
      'match-1',
      lineupPayload(),
      actor,
    );

    expect(result.id).toBe('registration-1');
    expect(teamManagerScope.assertCanManageTeam).toHaveBeenCalledWith(
      actor,
      'team-1',
    );
    expect(prisma.matchTeamRegistration.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { matchId_teamId: { matchId: 'match-1', teamId: 'team-1' } },
        create: expect.objectContaining({
          matchId: 'match-1',
          teamId: 'team-1',
          formation: '4-4-2',
          status: 'SUBMITTED',
          lineupPlayers: {
            create: expect.arrayContaining([
              expect.objectContaining({
                playerId: 'player-1',
                role: 'STARTER',
              }),
              expect.objectContaining({
                playerId: 'player-16',
                role: 'SUBSTITUTE',
              }),
            ]),
          },
        }),
      }),
    );
  });

  it('notifies admins when a club submits a match lineup', async () => {
    jest.spyOn(prisma.matchTeamRegistration, 'upsert').mockResolvedValue({
      id: 'registration-1',
      matchId: 'match-1',
      teamId: 'team-1',
      team: { name: 'Hà Nội FC' },
    } as any);

    await service.submitLineup('match-1', lineupPayload(), {
      id: 'manager-1',
      role: 'TEAM_MANAGER',
    });

    expect((notificationService as any).notifyAdmins).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'CLB nộp đội hình',
        message: expect.stringContaining('Hà Nội FC'),
        type: 'SYSTEM',
        entityType: 'match',
        entityId: 'match-1',
      }),
    );
  });

  it('rejects lineup submission after the match is locked', async () => {
    jest.spyOn(prisma.match, 'findUnique').mockResolvedValue({
      ...match,
      status: 'LOCKED',
    } as any);

    await expect(
      service.submitLineup('match-1', lineupPayload()),
    ).rejects.toThrow('Chỉ được nộp danh sách đăng ký khi trận đang mở');

    expect(prisma.matchTeamRegistration.upsert).not.toHaveBeenCalled();
  });

  it('rejects lineup review after the match is finished', async () => {
    jest.spyOn(prisma.match, 'findUnique').mockResolvedValue({
      ...match,
      status: 'FINISHED',
    } as any);

    await expect(
      service.reviewLineup('match-1', 'team-1', { status: 'APPROVED' } as any),
    ).rejects.toThrow('Không thể xét duyệt đội hình khi trận đã kết thúc');

    expect(prisma.matchTeamRegistration.update).not.toHaveBeenCalled();
  });

  it('rejects reviewing a lineup that is no longer submitted', async () => {
    jest.spyOn(prisma.matchTeamRegistration, 'findUnique').mockResolvedValue({
      id: 'registration-1',
      status: 'APPROVED',
    } as any);

    await expect(
      service.reviewLineup('match-1', 'team-1', {
        status: 'REJECTED',
        reviewNote: 'Sai danh sách',
      }),
    ).rejects.toThrow('Chỉ được xét duyệt danh sách đang chờ duyệt');

    expect(prisma.matchTeamRegistration.update).not.toHaveBeenCalled();
  });

  it('requires a rejection reason and notifies managed users when rejecting a submitted lineup', async () => {
    jest
      .spyOn(prisma.matchTeamRegistration, 'findUnique')
      .mockResolvedValueOnce({
        id: 'registration-1',
        status: 'SUBMITTED',
      } as any)
      .mockResolvedValueOnce({
        id: 'registration-1',
        status: 'SUBMITTED',
        team: {
          name: 'Ha Noi FC',
          managedUsers: [{ id: 'manager-1' }],
        },
      } as any);

    await expect(
      service.reviewLineup('match-1', 'team-1', { status: 'REJECTED' } as any),
    ).rejects.toThrow('Vui lòng nhập lý do từ chối');

    jest.spyOn(prisma.matchTeamRegistration, 'update').mockResolvedValue({
      id: 'registration-1',
      teamId: 'team-1',
      status: 'REJECTED',
      reviewNote: 'Thiếu thủ môn dự bị',
    } as any);

    await service.reviewLineup('match-1', 'team-1', {
      status: 'REJECTED',
      reviewNote: 'Thiếu thủ môn dự bị',
    });

    expect(notificationService.createForUser).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'manager-1',
        title: 'Đội hình bị từ chối',
        message: expect.stringContaining('Thiếu thủ môn dự bị'),
        type: 'SYSTEM',
        entityType: 'match_lineup',
        entityId: 'registration-1',
      }),
    );
  });

  it('rejects team managers submitting a lineup for another club', async () => {
    jest
      .spyOn(teamManagerScope, 'assertCanManageTeam')
      .mockRejectedValue(new ForbiddenException('wrong club'));

    await expect(
      service.submitLineup(
        'match-1',
        { ...lineupPayload(), teamId: 'team-2' },
        { id: 'manager-1', role: 'TEAM_MANAGER' },
      ),
    ).rejects.toThrow(ForbiddenException);

    expect(prisma.matchTeamRegistration.upsert).not.toHaveBeenCalled();
  });

  it('rejects lineups that do not contain exactly 16 players', async () => {
    await expect(
      service.submitLineup(
        'match-1',
        lineupPayload(Array.from({ length: 15 }, (_, i) => `p-${i}`)),
      ),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.matchTeamRegistration.upsert).not.toHaveBeenCalled();
  });

  it('rejects more than 3 foreign starters', async () => {
    jest
      .spyOn(prisma.teamPlayer, 'findMany')
      .mockResolvedValue(rosterRows(4) as any);

    await expect(
      service.submitLineup('match-1', lineupPayload()),
    ).rejects.toThrow('Đội hình chính chỉ được có tối đa 3 cầu thủ ngoại');
    expect(regulationHelper.getNumericValue).toHaveBeenCalledWith(
      'season-1',
      'MAX_FOREIGN_PLAYERS_ON_FIELD',
      3,
    );
  });

  it('rejects suspended players', async () => {
    jest
      .spyOn(prisma.playerSuspension, 'findMany')
      .mockResolvedValue([{ playerId: 'player-1', reason: 'RED_CARD' }] as any);

    await expect(
      service.submitLineup('match-1', lineupPayload()),
    ).rejects.toThrow('Cầu thủ đang bị treo giò');
  });

  it('creates same-match and next-match suspensions from red card events', async () => {
    jest
      .spyOn(prisma.matchEvent, 'findMany')
      .mockResolvedValue([
        { type: 'RED_CARD', playerId: 'player-1', teamId: 'team-1' },
      ] as any);
    jest
      .spyOn(prisma.match, 'findFirst')
      .mockResolvedValue({ id: 'match-2' } as any);
    jest
      .spyOn(prisma.playerSuspension, 'create')
      .mockResolvedValue({ id: 'suspension-1' } as any);

    await service.syncSuspensionsForMatch('match-1');

    expect(prisma.playerSuspension.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          playerId: 'player-1',
          teamId: 'team-1',
          seasonId: 'season-1',
          sourceMatchId: 'match-1',
          effectiveMatchId: 'match-1',
          reason: 'RED_CARD',
          status: 'ACTIVE',
        }),
      }),
    );
    expect(prisma.playerSuspension.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          playerId: 'player-1',
          teamId: 'team-1',
          seasonId: 'season-1',
          sourceMatchId: 'match-1',
          effectiveMatchId: 'match-2',
          reason: 'RED_CARD',
          status: 'ACTIVE',
        }),
      }),
    );
  });
});

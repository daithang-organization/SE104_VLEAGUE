import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from '../notification/notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { StandingsService } from '../standings/standings.service';
import { TeamInvitationService } from './team-invitation.service';

describe('TeamInvitationService', () => {
  let service: TeamInvitationService;
  let prisma: PrismaService;
  let notificationService: NotificationService;
  let standingsService: StandingsService;

  const now = new Date('2026-05-01T00:00:00.000Z');
  const season = { id: 'season-1', name: 'V.League 2026', year: 2026 };
  const previousSeason = {
    id: 'season-previous',
    name: 'V.League 2025',
    year: 2025,
    status: 'COMPLETED',
  };
  const team = { id: 'team-1', name: 'Hà Nội FC' };
  const managerAssignment = {
    id: 'assignment-1',
    userId: 'manager-1',
    seasonId: season.id,
    teamId: team.id,
    user: { id: 'manager-1', email: 'manager.hanoi@demo.local' },
  };
  const managerUser = {
    id: 'manager-1',
    email: 'manager.hanoi@demo.local',
    name: null,
    role: 'TEAM_MANAGER',
    managedTeamId: team.id,
  };
  const invitation = {
    id: 'invitation-1',
    seasonId: season.id,
    teamId: team.id,
    sourceType: 'PREVIOUS_TOP_8',
    status: 'SENT',
    sentAt: now,
    deadlineAt: new Date('2026-05-15T00:00:00.000Z'),
    responseAt: null,
    responseReason: null,
    regulationsSnapshot: {
      MIN_ROSTER: '16',
      MAX_ROSTER: '22',
      PARTICIPATION_FEE_VND: '1000000000',
    },
    season,
    team,
  };

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(now);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamInvitationService,
        {
          provide: PrismaService,
          useValue: {
            season: { findUnique: jest.fn(), findFirst: jest.fn() },
            team: { findUnique: jest.fn(), findMany: jest.fn() },
            user: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              findUnique: jest.fn(),
            },
            teamManagerAssignment: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              upsert: jest.fn(),
            },
            regulation: { findMany: jest.fn() },
            teamInvitation: {
              count: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              upsert: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
            },
            seasonTeam: {
              count: jest.fn(),
              findMany: jest.fn(),
              upsert: jest.fn(),
              updateMany: jest.fn(),
            },
          },
        },
        {
          provide: NotificationService,
          useValue: {
            createForUser: jest.fn(),
          },
        },
        {
          provide: StandingsService,
          useValue: {
            getStandings: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TeamInvitationService>(TeamInvitationService);
    prisma = module.get<PrismaService>(PrismaService);
    notificationService = module.get<NotificationService>(NotificationService);
    standingsService = module.get<StandingsService>(StandingsService);

    jest.spyOn(prisma.season, 'findUnique').mockResolvedValue(season as any);
    jest.spyOn(prisma.team, 'findUnique').mockResolvedValue(team as any);
    jest.spyOn(prisma.user, 'findMany').mockResolvedValue([managerUser] as any);
    jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(managerUser as any);
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(managerUser as any);
    jest
      .spyOn(prisma.teamManagerAssignment, 'findMany')
      .mockResolvedValue([] as any);
    jest
      .spyOn(prisma.teamManagerAssignment, 'upsert')
      .mockResolvedValue(managerAssignment as any);
    jest.spyOn(prisma.regulation, 'findMany').mockResolvedValue([
      { key: 'MIN_ROSTER', value: '16', valueType: 'number' },
      { key: 'MAX_ROSTER', value: '22', valueType: 'number' },
      { key: 'MAX_FOREIGN_PLAYERS', value: '5', valueType: 'number' },
      { key: 'MAX_FOREIGN_PLAYERS_ON_FIELD', value: '3', valueType: 'number' },
      { key: 'MIN_STADIUM_CAPACITY', value: '10000', valueType: 'number' },
      { key: 'MIN_STADIUM_FIFA_STARS', value: '2', valueType: 'number' },
      {
        key: 'PARTICIPATION_FEE_VND',
        value: '1000000000',
        valueType: 'number',
      },
    ] as any);
    jest
      .spyOn(prisma.teamInvitation, 'upsert')
      .mockResolvedValue(invitation as any);
    jest
      .spyOn(notificationService, 'createForUser')
      .mockResolvedValue({ id: 'notification-1' } as any);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('sendInvitation', () => {
    it('creates a season invitation with a 14-day deadline and notifies the team manager', async () => {
      const result = await service.sendInvitation('season-1', {
        teamId: 'team-1',
        sourceType: 'PREVIOUS_TOP_8',
      });

      expect(result).toEqual(invitation);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { role: 'TEAM_MANAGER', managedTeamId: 'team-1' },
        select: { id: true, email: true, name: true },
      });
      expect(prisma.teamManagerAssignment.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId_seasonId: { userId: 'manager-1', seasonId: 'season-1' },
          },
          create: {
            userId: 'manager-1',
            seasonId: 'season-1',
            teamId: 'team-1',
          },
          update: { teamId: 'team-1' },
        }),
      );
      expect(prisma.teamInvitation.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            seasonId_teamId: { seasonId: 'season-1', teamId: 'team-1' },
          },
          create: expect.objectContaining({
            seasonId: 'season-1',
            teamId: 'team-1',
            sourceType: 'PREVIOUS_TOP_8',
            status: 'SENT',
            deadlineAt: new Date('2026-05-15T00:00:00.000Z'),
            regulationsSnapshot: expect.objectContaining({
              MIN_ROSTER: '16',
              PARTICIPATION_FEE_VND: '1000000000',
            }),
          }),
          update: expect.objectContaining({
            status: 'SENT',
            responseAt: null,
            responseReason: null,
          }),
          include: expect.any(Object),
        }),
      );
      expect(notificationService.createForUser).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'manager-1',
          type: 'TEAM_INVITATION',
          entityType: 'team_invitation',
          entityId: 'invitation-1',
        }),
      );
    });

    it('rejects sending when the team has no fixed team-manager account', async () => {
      jest.spyOn(prisma.user, 'findMany').mockResolvedValue([]);

      await expect(
        service.sendInvitation('season-1', {
          teamId: 'team-1',
          sourceType: 'PROMOTED',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.teamInvitation.upsert).not.toHaveBeenCalled();
    });

    it('creates the season assignment from the fixed CLB manager before sending', async () => {
      const result = await service.sendInvitation('season-1', {
        teamId: 'team-1',
        sourceType: 'PROMOTED',
      });

      expect(result).toEqual(invitation);
      expect(prisma.teamManagerAssignment.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId_seasonId: { userId: 'manager-1', seasonId: 'season-1' },
          },
          create: {
            userId: 'manager-1',
            seasonId: 'season-1',
            teamId: 'team-1',
          },
          update: { teamId: 'team-1' },
        }),
      );
      expect(notificationService.createForUser).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'manager-1',
          type: 'TEAM_INVITATION',
        }),
      );
    });
  });

  describe('getInvitationCandidates', () => {
    const finalStandings = Array.from({ length: 9 }, (_, index) => ({
      position: index + 1,
      teamId: `team-${index + 1}`,
      teamName: `CLB ${index + 1}`,
      played: 18,
      won: 10 - index,
      drawn: 2,
      lost: index,
      goalsFor: 30 - index,
      goalsAgainst: 10 + index,
      goalDifference: 20 - index * 2,
      points: 32 - index,
      recentForm: [],
    }));

    beforeEach(() => {
      jest
        .spyOn(prisma.season, 'findFirst')
        .mockResolvedValue(previousSeason as any);
      jest
        .spyOn(standingsService, 'getStandings')
        .mockResolvedValue(finalStandings as any);
      jest.spyOn(prisma.team, 'findMany').mockImplementation((args: any) => {
        const ids = new Set(args.where.id.in);
        return Promise.resolve(
          finalStandings
            .slice(0, 8)
            .filter((standing) => ids.has(standing.teamId))
            .map((standing) => ({
              id: standing.teamId,
              name: standing.teamName,
              shortName: null,
              city: 'Hà Nội',
              logoUrl: null,
              status: 'ACTIVE',
            })),
        ) as any;
      });
      jest
        .spyOn(prisma.teamInvitation, 'findMany')
        .mockImplementation((args: any) => {
          if (args.where.sourceType === 'PROMOTED') {
            return Promise.resolve([
              {
                id: 'promoted-invitation-1',
                teamId: 'promoted-1',
                sourceType: 'PROMOTED',
                status: 'SENT',
                responseReason: null,
                deadlineAt: new Date('2026-05-15T00:00:00.000Z'),
                sentAt: now,
                createdAt: now,
                team: {
                  id: 'promoted-1',
                  name: 'CLB Thăng hạng 1',
                  shortName: 'TH1',
                  city: 'Đà Nẵng',
                  logoUrl: null,
                  status: 'ACTIVE',
                },
              },
            ]) as any;
          }

          return Promise.resolve([
            {
              ...invitation,
              teamId: 'team-1',
              sourceType: 'PREVIOUS_TOP_8',
              status: 'SENT',
            },
          ]) as any;
        });
      jest.spyOn(prisma.seasonTeam, 'findMany').mockResolvedValue([
        {
          teamId: 'promoted-2',
          registeredAt: now,
          team: {
            id: 'promoted-2',
            name: 'CLB Thăng hạng 2',
            shortName: 'TH2',
            city: 'Huế',
            logoUrl: null,
            status: 'ACTIVE',
          },
        },
      ] as any);
      jest
        .spyOn(prisma.teamInvitation, 'updateMany')
        .mockResolvedValue({ count: 0 } as any);
    });

    it('builds the initial invitation candidates from top 8 and two promoted teams', async () => {
      const result = await (service as any).getInvitationCandidates('season-1');

      expect(prisma.season.findFirst).toHaveBeenCalledWith({
        where: { year: 2025 },
        orderBy: { year: 'desc' },
      });
      expect(standingsService.getStandings).toHaveBeenCalledWith(
        'season-previous',
        'final',
      );
      expect(result.previousSeason).toEqual(previousSeason);
      expect(result.requiredTopLeagueSlots).toBe(8);
      expect(result.requiredPromotedSlots).toBe(2);
      expect(result.candidates).toHaveLength(10);
      expect(
        result.candidates.filter(
          (candidate: any) => candidate.sourceType === 'PREVIOUS_TOP_8',
        ),
      ).toHaveLength(8);
      expect(
        result.candidates.filter(
          (candidate: any) => candidate.sourceType === 'PROMOTED',
        ),
      ).toHaveLength(2);
      expect(result.candidates[0]).toEqual(
        expect.objectContaining({
          teamId: 'team-1',
          sourceType: 'PREVIOUS_TOP_8',
          sourceRank: 1,
          invitationStatus: 'SENT',
        }),
      );
      expect(result.candidates[8]).toEqual(
        expect.objectContaining({
          teamId: 'promoted-1',
          sourceType: 'PROMOTED',
          sourceRank: 1,
          invitationStatus: 'SENT',
        }),
      );
      expect(result.candidates[9]).toEqual(
        expect.objectContaining({
          teamId: 'promoted-2',
          sourceType: 'PROMOTED',
          sourceRank: 2,
          invitationStatus: null,
        }),
      );
    });

    it('rejects candidate generation until the previous season is completed', async () => {
      jest.spyOn(prisma.season, 'findFirst').mockResolvedValue({
        ...previousSeason,
        status: 'IN_PROGRESS',
      } as any);

      await expect(
        (service as any).getInvitationCandidates('season-1'),
      ).rejects.toThrow(BadRequestException);
      expect(standingsService.getStandings).not.toHaveBeenCalled();
    });
  });

  describe('getPendingForManager', () => {
    it('loads pending invitations for teams assigned to the manager', async () => {
      jest
        .spyOn(prisma.teamInvitation, 'findMany')
        .mockResolvedValue([invitation] as any);

      const result = await service.getPendingForManager('manager-1');

      expect(result).toEqual([invitation]);
      expect(prisma.teamInvitation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            status: 'SENT',
            deadlineAt: { gte: now },
            teamId: 'team-1',
          },
        }),
      );
    });
  });

  describe('getReplacementCandidates', () => {
    it('counts distinct accepted and approved teams when calculating replacement slots', async () => {
      jest.spyOn(prisma.teamInvitation, 'count').mockResolvedValue(8);
      jest.spyOn(prisma.seasonTeam, 'count').mockResolvedValue(8);
      jest
        .spyOn(prisma.teamInvitation, 'findMany')
        .mockImplementation((args: any) => {
          if (args.where?.status === 'ACCEPTED') {
            return Promise.resolve(
              Array.from({ length: 8 }, (_, index) => ({
                teamId: `team-${index + 1}`,
              })),
            ) as any;
          }

          if (args.where?.status?.in) {
            return Promise.resolve([]) as any;
          }

          return Promise.resolve(
            Array.from({ length: 8 }, (_, index) => ({
              teamId: `team-${index + 1}`,
            })),
          ) as any;
        });
      jest
        .spyOn(prisma.seasonTeam, 'findMany')
        .mockImplementation((args: any) => {
          if (args.where?.status === 'APPROVED') {
            return Promise.resolve(
              Array.from({ length: 8 }, (_, index) => ({
                teamId: `team-${index + 3}`,
              })),
            ) as any;
          }

          return Promise.resolve(
            Array.from({ length: 8 }, (_, index) => ({
              teamId: `team-${index + 3}`,
            })),
          ) as any;
        });
      jest.spyOn(prisma.team, 'findMany').mockResolvedValue([] as any);

      const result = await service.getReplacementCandidates('season-1');

      expect(result.filledSlots).toBe(10);
      expect(result.slotsNeeded).toBe(0);
    });
  });

  describe('respondToInvitation', () => {
    beforeEach(() => {
      jest
        .spyOn(prisma.teamInvitation, 'findUnique')
        .mockResolvedValue(invitation as any);
      jest
        .spyOn(prisma.user, 'findFirst')
        .mockResolvedValue(managerUser as any);
      jest.spyOn(prisma.teamInvitation, 'update').mockResolvedValue({
        ...invitation,
        status: 'ACCEPTED',
        responseAt: now,
      } as any);
      jest.spyOn(prisma.seasonTeam, 'upsert').mockResolvedValue({
        id: 'season-team-1',
        status: 'REGISTERED',
      } as any);
    });

    it('accepts an invitation and registers the team for season review', async () => {
      const result = await service.respondToInvitation(
        'invitation-1',
        'manager-1',
        {
          responseStatus: 'ACCEPTED',
        },
      );

      expect(result.status).toBe('ACCEPTED');
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'manager-1',
          role: 'TEAM_MANAGER',
          managedTeamId: 'team-1',
        },
        select: { id: true },
      });
      expect(prisma.teamManagerAssignment.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId_seasonId: { userId: 'manager-1', seasonId: 'season-1' },
          },
          create: {
            userId: 'manager-1',
            seasonId: 'season-1',
            teamId: 'team-1',
          },
          update: { teamId: 'team-1' },
        }),
      );
      expect(prisma.seasonTeam.upsert).toHaveBeenCalledWith({
        where: { seasonId_teamId: { seasonId: 'season-1', teamId: 'team-1' } },
        create: {
          seasonId: 'season-1',
          teamId: 'team-1',
          status: 'REGISTERED',
        },
        update: {
          status: 'REGISTERED',
          approvedAt: null,
        },
      });
    });

    it('prevents a manager from responding for another team', async () => {
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(null);

      await expect(
        service.respondToInvitation('invitation-1', 'manager-2', {
          responseStatus: 'ACCEPTED',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('marks expired invitations before rejecting the response', async () => {
      jest.spyOn(prisma.teamInvitation, 'findUnique').mockResolvedValue({
        ...invitation,
        deadlineAt: new Date('2026-04-30T00:00:00.000Z'),
      } as any);

      await expect(
        service.respondToInvitation('invitation-1', 'manager-1', {
          responseStatus: 'ACCEPTED',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.teamInvitation.updateMany).toHaveBeenCalledWith({
        where: {
          id: 'invitation-1',
          status: 'SENT',
          deadlineAt: { lt: now },
        },
        data: {
          status: 'EXPIRED',
          responseAt: now,
          responseReason: 'Quá hạn phản hồi',
        },
      });
      expect(prisma.teamInvitation.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the invitation does not exist', async () => {
      jest.spyOn(prisma.teamInvitation, 'findUnique').mockResolvedValue(null);

      await expect(
        service.respondToInvitation('missing', 'manager-1', {
          responseStatus: 'ACCEPTED',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});

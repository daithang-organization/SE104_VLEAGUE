import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from '../notification/notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { TeamInvitationService } from './team-invitation.service';

describe('TeamInvitationService', () => {
  let service: TeamInvitationService;
  let prisma: PrismaService;
  let notificationService: NotificationService;

  const now = new Date('2026-05-01T00:00:00.000Z');
  const season = { id: 'season-1', name: 'V.League 2026', year: 2026 };
  const team = { id: 'team-1', name: 'Hà Nội FC' };
  const managerAssignment = {
    id: 'assignment-1',
    userId: 'manager-1',
    seasonId: season.id,
    teamId: team.id,
    user: { id: 'manager-1', email: 'manager.hanoi@demo.local' },
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
            season: { findUnique: jest.fn() },
            team: { findUnique: jest.fn() },
            teamManagerAssignment: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
            },
            regulation: { findMany: jest.fn() },
            teamInvitation: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              upsert: jest.fn(),
              update: jest.fn(),
            },
            seasonTeam: {
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
      ],
    }).compile();

    service = module.get<TeamInvitationService>(TeamInvitationService);
    prisma = module.get<PrismaService>(PrismaService);
    notificationService = module.get<NotificationService>(NotificationService);

    jest.spyOn(prisma.season, 'findUnique').mockResolvedValue(season as any);
    jest.spyOn(prisma.team, 'findUnique').mockResolvedValue(team as any);
    jest
      .spyOn(prisma.teamManagerAssignment, 'findMany')
      .mockResolvedValue([managerAssignment] as any);
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

    it('rejects sending when the team has no manager assignment for the season', async () => {
      jest
        .spyOn(prisma.teamManagerAssignment, 'findMany')
        .mockResolvedValue([]);

      await expect(
        service.sendInvitation('season-1', {
          teamId: 'team-1',
          sourceType: 'PROMOTED',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.teamInvitation.upsert).not.toHaveBeenCalled();
    });
  });

  describe('getPendingForManager', () => {
    it('loads pending invitations for teams assigned to the manager', async () => {
      jest
        .spyOn(prisma.teamManagerAssignment, 'findMany')
        .mockResolvedValue([{ seasonId: 'season-1', teamId: 'team-1' }] as any);
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
            OR: [{ seasonId: 'season-1', teamId: 'team-1' }],
          },
        }),
      );
    });
  });

  describe('respondToInvitation', () => {
    beforeEach(() => {
      jest
        .spyOn(prisma.teamInvitation, 'findUnique')
        .mockResolvedValue(invitation as any);
      jest
        .spyOn(prisma.teamManagerAssignment, 'findFirst')
        .mockResolvedValue(managerAssignment as any);
      jest.spyOn(prisma.teamInvitation, 'update').mockResolvedValue({
        ...invitation,
        status: 'ACCEPTED',
        responseAt: now,
      } as any);
      jest
        .spyOn(prisma.seasonTeam, 'upsert')
        .mockResolvedValue({
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
      jest
        .spyOn(prisma.teamManagerAssignment, 'findFirst')
        .mockResolvedValue(null);

      await expect(
        service.respondToInvitation('invitation-1', 'manager-2', {
          responseStatus: 'ACCEPTED',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('rejects expired invitations before recording a response', async () => {
      jest.spyOn(prisma.teamInvitation, 'findUnique').mockResolvedValue({
        ...invitation,
        deadlineAt: new Date('2026-04-30T00:00:00.000Z'),
      } as any);

      await expect(
        service.respondToInvitation('invitation-1', 'manager-1', {
          responseStatus: 'ACCEPTED',
        }),
      ).rejects.toThrow(BadRequestException);
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

import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from '../notification/notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { SchedulingService } from './scheduling.service';

describe('SchedulingService', () => {
  let service: SchedulingService;
  let prisma: PrismaService;
  let notificationService: NotificationService;

  const mockMatches = [
    {
      id: 'match-1',
      seasonId: 'season-1',
      roundNo: 1,
      leg: 1,
      homeTeamId: 'team-1',
      awayTeamId: 'team-2',
      stadiumId: 'stadium-1',
      kickoffAt: new Date('2024-01-15T19:00:00Z'),
      homeScore: 0,
      awayScore: 0,
      status: 'DRAFT',
      homeTeam: { id: 'team-1', name: 'Team A', shortName: 'TA' },
      awayTeam: { id: 'team-2', name: 'Team B', shortName: 'TB' },
      stadium: { id: 'stadium-1', name: 'Stadium A', city: 'City A' },
    },
    {
      id: 'match-2',
      seasonId: 'season-1',
      roundNo: 1,
      leg: 2,
      homeTeamId: 'team-2',
      awayTeamId: 'team-1',
      stadiumId: 'stadium-2',
      kickoffAt: new Date('2024-01-22T19:00:00Z'),
      homeScore: 0,
      awayScore: 0,
      status: 'DRAFT',
      homeTeam: { id: 'team-2', name: 'Team B', shortName: 'TB' },
      awayTeam: { id: 'team-1', name: 'Team A', shortName: 'TA' },
      stadium: { id: 'stadium-2', name: 'Stadium B', city: 'City B' },
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulingService,
        {
          provide: NotificationService,
          useValue: {
            createForUser: jest
              .fn()
              .mockResolvedValue({ id: 'notification-1' }),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            match: {
              findMany: jest.fn(),
              createMany: jest.fn(),
              deleteMany: jest.fn(),
              updateMany: jest.fn(),
            },
            season: {
              findFirst: jest.fn(),
              findUnique: jest.fn(),
            },
            seasonTeam: {
              findMany: jest.fn(),
            },
            team: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<SchedulingService>(SchedulingService);
    prisma = module.get<PrismaService>(PrismaService);
    notificationService = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSchedule', () => {
    it('should return all matches with team/stadium relations', async () => {
      jest
        .spyOn(prisma.match, 'findMany')
        .mockResolvedValue(mockMatches as any);

      const result = await service.getSchedule();

      expect(result.ok).toBe(true);
      expect(result.matches).toHaveLength(2);
      expect(result.matches[0].roundNo).toBe(1);
    });

    it('should include homeTeam, awayTeam, stadium in query', async () => {
      jest
        .spyOn(prisma.match, 'findMany')
        .mockResolvedValue(mockMatches as any);

      await service.getSchedule();

      expect(prisma.match.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          homeTeam: {
            select: { id: true, name: true, shortName: true, coachName: true },
          },
          awayTeam: {
            select: { id: true, name: true, shortName: true, coachName: true },
          },
          stadium: { select: { id: true, name: true, city: true } },
        },
        orderBy: [{ leg: 'asc' }, { roundNo: 'asc' }],
      });
    });

    it('should return empty array when no matches exist', async () => {
      jest.spyOn(prisma.match, 'findMany').mockResolvedValue([]);

      const result = await service.getSchedule();

      expect(result.ok).toBe(true);
      expect(result.matches).toHaveLength(0);
    });

    it('should filter by seasonId when provided', async () => {
      jest.spyOn(prisma.match, 'findMany').mockResolvedValue([]);

      await service.getSchedule('season-123');

      expect(prisma.match.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { seasonId: 'season-123' },
        }),
      );
    });
  });

  describe('generate', () => {
    it('should generate 18 rounds and 90 matches for exactly 10 approved teams', async () => {
      const teams = Array.from({ length: 10 }, (_, index) => ({
        id: `t${index + 1}`,
        name: `Team ${index + 1}`,
        stadiumId: `s${index + 1}`,
      }));

      jest
        .spyOn(prisma.season, 'findFirst')
        .mockResolvedValue({ id: 'season-1', name: 'V.League 2024' } as any);
      jest
        .spyOn(prisma.seasonTeam, 'findMany')
        .mockResolvedValue(teams.map((team) => ({ team })) as any);
      jest.spyOn(prisma.match, 'deleteMany').mockResolvedValue({ count: 0 });
      jest.spyOn(prisma.match, 'createMany').mockResolvedValue({ count: 90 });
      jest
        .spyOn(prisma.season, 'findUnique')
        .mockResolvedValue({ name: 'V.League 2024' } as any);

      const result = await service.generate();

      expect(result.ok).toBe(true);
      expect(result.totalMatches).toBe(90);
      expect(prisma.seasonTeam.findMany).toHaveBeenCalledWith({
        where: { seasonId: 'season-1', status: 'APPROVED' },
        include: {
          team: { select: { id: true, name: true, stadiumId: true } },
        },
        orderBy: { registeredAt: 'asc' },
      });
      expect(prisma.match.createMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({
              leg: 1,
              homeTeamId: expect.any(String),
              awayTeamId: expect.any(String),
              seasonId: 'season-1',
              status: 'DRAFT',
            }),
          ]),
        }),
      );

      const data = (prisma.match.createMany as jest.Mock).mock.calls[0][0].data;
      expect(data).toHaveLength(90);
      expect(new Set(data.map((match: any) => match.roundNo)).size).toBe(18);
      for (let roundNo = 1; roundNo <= 18; roundNo++) {
        expect(
          data.filter((match: any) => match.roundNo === roundNo),
        ).toHaveLength(5);
      }
      for (const team of teams) {
        expect(
          data.filter((match: any) => match.homeTeamId === team.id),
        ).toHaveLength(9);
        expect(
          data.filter((match: any) => match.awayTeamId === team.id),
        ).toHaveLength(9);
      }
    });

    it('should reject schedule generation until exactly 10 teams are approved', async () => {
      const teams = Array.from({ length: 9 }, (_, index) => ({
        id: `t${index + 1}`,
        name: `Team ${index + 1}`,
        stadiumId: `s${index + 1}`,
      }));

      jest
        .spyOn(prisma.season, 'findFirst')
        .mockResolvedValue({ id: 'season-1', name: 'V.League 2024' } as any);
      jest
        .spyOn(prisma.seasonTeam, 'findMany')
        .mockResolvedValue(teams.map((team) => ({ team })) as any);

      await expect(service.generate()).rejects.toThrow(
        'Cần đúng 10 đội đã được duyệt',
      );
      expect(prisma.match.deleteMany).not.toHaveBeenCalled();
      expect(prisma.match.createMany).not.toHaveBeenCalled();
    });
  });

  describe('publish', () => {
    it('should update DRAFT matches to PUBLISHED', async () => {
      jest.spyOn(prisma.match, 'updateMany').mockResolvedValue({ count: 12 });
      jest.spyOn(prisma.seasonTeam, 'findMany').mockResolvedValue([]);

      const result = await service.publish();

      expect(result.ok).toBe(true);
      expect(result.message).toContain('12');
      expect(prisma.match.updateMany).toHaveBeenCalledWith({
        where: { status: 'DRAFT' },
        data: { status: 'PUBLISHED' },
      });
    });

    it('notifies approved team managers when a season schedule is published', async () => {
      jest.spyOn(prisma.match, 'updateMany').mockResolvedValue({ count: 90 });
      jest.spyOn(prisma.seasonTeam, 'findMany').mockResolvedValue([
        {
          team: {
            name: 'Hà Nội FC',
            managedUsers: [{ id: 'manager-1' }, { id: 'manager-2' }],
          },
        },
      ] as any);

      await service.publish('season-1');

      expect(prisma.seasonTeam.findMany).toHaveBeenCalledWith({
        where: { seasonId: 'season-1', status: 'APPROVED' },
        include: {
          team: {
            select: {
              name: true,
              managedUsers: { select: { id: true } },
            },
          },
        },
      });
      expect(notificationService.createForUser).toHaveBeenCalledTimes(2);
      expect(notificationService.createForUser).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'manager-1',
          title: 'Lịch thi đấu đã được công bố',
          type: 'SCHEDULE_CHANGE',
          entityType: 'season',
          entityId: 'season-1',
        }),
      );
    });
  });
});

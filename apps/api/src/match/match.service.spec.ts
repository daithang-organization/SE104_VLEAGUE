import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MatchLineupService } from '../match-lineup/match-lineup.service';
import { NotificationService } from '../notification/notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegulationHelper } from '../regulation/regulation.helper';
import { StandingsService } from '../standings/standings.service';
import { MatchGateway } from './match.gateway';
import { MatchService } from './match.service';

describe('MatchService', () => {
  let service: MatchService;
  let prisma: PrismaService;
  let standingsService: StandingsService;
  let regulationHelper: RegulationHelper;
  let matchLineupService: MatchLineupService;

  const mockMatch = {
    id: 'match-1',
    seasonId: 'season-1',
    roundNo: 1,
    homeTeamId: 'team-1',
    awayTeamId: 'team-2',
    stadiumId: 'stadium-1',
    kickoffAt: new Date(),
    homeScore: 0,
    awayScore: 0,
    status: 'DRAFT',
    homeTeam: { id: 'team-1', name: 'Hà Nội FC' },
    awayTeam: { id: 'team-2', name: 'Viettel FC' },
    stadium: { id: 'stadium-1', name: 'Sân Mỹ Đình' },
    season: { id: 'season-1', name: 'VLeague 2024' },
    events: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchService,
        {
          provide: PrismaService,
          useValue: {
            match: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
            },
            matchEvent: {
              create: jest.fn(),
              findFirst: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            matchReport: {
              findUnique: jest.fn(),
              updateMany: jest.fn(),
            },
            disciplineReport: {
              findUnique: jest.fn(),
            },
            matchTeamRegistration: {
              count: jest.fn(),
            },
            matchOfficialAssignment: {
              count: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
        {
          provide: StandingsService,
          useValue: {
            getStandings: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: RegulationHelper,
          useValue: {
            getNumericValue: jest.fn().mockResolvedValue(96),
          },
        },
        {
          provide: MatchGateway,
          useValue: {
            emitMatchEvent: jest.fn(),
            emitScoreUpdate: jest.fn(),
            emitStatusChange: jest.fn(),
          },
        },
        {
          provide: NotificationService,
          useValue: {
            notifyMatchStatusChange: jest.fn().mockResolvedValue(undefined),
            notifyMatchResult: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: MatchLineupService,
          useValue: {
            markServedSuspensionsForMatch: jest
              .fn()
              .mockResolvedValue(undefined),
            syncSuspensionsForMatch: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<MatchService>(MatchService);
    prisma = module.get<PrismaService>(PrismaService);
    standingsService = module.get<StandingsService>(StandingsService);
    regulationHelper = module.get<RegulationHelper>(RegulationHelper);
    matchLineupService = module.get<MatchLineupService>(MatchLineupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMatchById', () => {
    it('should return a match with all relations', async () => {
      jest
        .spyOn(prisma.match, 'findUnique')
        .mockResolvedValue(mockMatch as any);

      const result = await service.getMatchById('match-1');

      expect(result.id).toBe('match-1');
      expect(result.homeTeam.name).toBe('Hà Nội FC');
      expect(result.events).toEqual([]);
    });

    it('includes the home team stadium for match-detail fallback display', async () => {
      jest
        .spyOn(prisma.match, 'findUnique')
        .mockResolvedValue(mockMatch as any);

      await service.getMatchById('match-1');

      expect(prisma.match.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            homeTeam: {
              select: expect.objectContaining({
                stadium: { select: { id: true, name: true, city: true } },
              }),
            },
          }),
        }),
      );
    });

    it('should throw NotFoundException if match not found', async () => {
      jest.spyOn(prisma.match, 'findUnique').mockResolvedValue(null);

      await expect(service.getMatchById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated matches', async () => {
      jest
        .spyOn(prisma.match, 'findMany')
        .mockResolvedValue([mockMatch] as any);
      jest.spyOn(prisma.match, 'count').mockResolvedValue(1);

      const result = await service.findAll();

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });

    it('includes club coach names for fixture display', async () => {
      jest.spyOn(prisma.match, 'findMany').mockResolvedValue([] as any);
      jest.spyOn(prisma.match, 'count').mockResolvedValue(0);

      await service.findAll();

      expect(prisma.match.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            homeTeam: {
              select: expect.objectContaining({ coachName: true }),
            },
            awayTeam: {
              select: expect.objectContaining({ coachName: true }),
            },
          }),
        }),
      );
    });

    it('should filter by seasonId if provided', async () => {
      jest
        .spyOn(prisma.match, 'findMany')
        .mockResolvedValue([mockMatch] as any);
      jest.spyOn(prisma.match, 'count').mockResolvedValue(1);

      await service.findAll('season-1');

      expect(prisma.match.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { seasonId: 'season-1' },
        }),
      );
    });

    it('should filter assigned matches by official email and referee roles', async () => {
      jest.spyOn(prisma.match, 'findMany').mockResolvedValue([] as any);
      jest.spyOn(prisma.match, 'count').mockResolvedValue(0);

      await service.findAssignedToOfficial(
        {
          id: 'user-1',
          email: 'referee@demo.local',
          role: 'REFEREE',
        },
        'season-1',
        { page: 1, limit: 10 },
      );

      const assignmentFilter = {
        some: {
          role: {
            in: ['MAIN_REFEREE', 'ASSISTANT_REFEREE', 'FOURTH_OFFICIAL'],
          },
          official: {
            email: { equals: 'referee@demo.local', mode: 'insensitive' },
            status: 'ACTIVE',
          },
        },
      };

      expect(prisma.match.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            seasonId: 'season-1',
            officialAssignments: assignmentFilter,
          }),
        }),
      );
      expect(prisma.match.count).toHaveBeenCalledWith({
        where: expect.objectContaining({
          seasonId: 'season-1',
          officialAssignments: assignmentFilter,
        }),
      });
    });

    it('should filter assigned matches by supervisor role', async () => {
      jest.spyOn(prisma.match, 'findMany').mockResolvedValue([] as any);
      jest.spyOn(prisma.match, 'count').mockResolvedValue(0);

      await service.findAssignedToOfficial({
        id: 'user-1',
        email: 'supervisor@demo.local',
        role: 'SUPERVISOR',
      });

      expect(prisma.match.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            officialAssignments: expect.objectContaining({
              some: expect.objectContaining({
                role: { in: ['SUPERVISOR'] },
              }),
            }),
          }),
        }),
      );
    });
  });

  describe('updateMatch', () => {
    it('rejects score updates on finished matches with a specific reason', async () => {
      jest.spyOn(prisma.match, 'findUnique').mockResolvedValue({
        ...mockMatch,
        status: 'FINISHED',
      } as any);

      await expect(
        service.updateMatch('match-1', {
          homeScore: 3,
          awayScore: 0,
        }),
      ).rejects.toThrow(
        'Trận đấu đã kết thúc nên không thể cập nhật tỉ số. Hãy mở lại trạng thái trận đấu trước khi chỉnh sửa tỉ số.',
      );
    });

    it('rejects score updates on locked matches with a specific reason', async () => {
      jest.spyOn(prisma.match, 'findUnique').mockResolvedValue({
        ...mockMatch,
        status: 'LOCKED',
      } as any);

      await expect(
        service.updateMatch('match-1', {
          homeScore: 1,
          awayScore: 1,
        }),
      ).rejects.toThrow(
        'Trận đấu đang khóa nên không thể cập nhật tỉ số. Hãy chuyển trạng thái trận đấu trước khi chỉnh sửa tỉ số.',
      );
    });

    it('syncs an existing match report score when the admin score is updated', async () => {
      jest
        .spyOn(prisma.match, 'findUnique')
        .mockResolvedValue(mockMatch as any);
      jest.spyOn(prisma.match, 'update').mockResolvedValue({
        ...mockMatch,
        homeScore: 3,
        awayScore: 0,
      } as any);

      const result = await service.updateMatch('match-1', {
        homeScore: 3,
        awayScore: 0,
      });

      expect(result.homeScore).toBe(3);
      expect(prisma.matchReport.updateMany).toHaveBeenCalledWith({
        where: { matchId: 'match-1' },
        data: { homeScore: 3, awayScore: 0 },
      });
      expect(prisma.match.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ scoreSource: 'ADMIN' }),
        }),
      );
    });
  });

  describe('addEvent', () => {
    it('should create a match event', async () => {
      jest
        .spyOn(prisma.match, 'findUnique')
        .mockResolvedValue(mockMatch as any);
      jest.spyOn(prisma.matchEvent, 'create').mockResolvedValue({
        id: 'event-1',
        matchId: 'match-1',
        minute: 45,
        type: 'GOAL',
        teamId: 'team-1',
        player: { id: 'p1', fullName: 'Player 1' },
        team: { id: 'team-1', name: 'Hà Nội FC' },
      } as any);
      jest.spyOn(prisma.matchEvent, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.match, 'update').mockResolvedValue(mockMatch as any);

      const result = await service.addEvent('match-1', {
        minute: 45,
        type: 'GOAL' as any,
        teamId: 'team-1',
      });

      expect(result.ok).toBe(true);
      expect(result.createdEvent.minute).toBe(45);
    });

    it('should throw NotFoundException if match not found', async () => {
      jest.spyOn(prisma.match, 'findUnique').mockResolvedValue(null);

      await expect(
        service.addEvent('non-existent', {
          minute: 45,
          type: 'GOAL' as any,
          teamId: 'team-1',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject adding event to FINISHED match', async () => {
      const finishedMatch = { ...mockMatch, status: 'FINISHED' };
      jest
        .spyOn(prisma.match, 'findUnique')
        .mockResolvedValue(finishedMatch as any);

      await expect(
        service.addEvent('match-1', {
          minute: 45,
          type: 'GOAL' as any,
          teamId: 'team-1',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects a second red card for the same player in one match', async () => {
      jest
        .spyOn(prisma.match, 'findUnique')
        .mockResolvedValue(mockMatch as any);
      jest.spyOn(prisma.matchEvent, 'findFirst').mockResolvedValue({
        id: 'event-red-1',
      } as any);

      await expect(
        service.addEvent('match-1', {
          minute: 80,
          type: 'RED_CARD' as any,
          teamId: 'team-1',
          playerId: 'player-1',
        }),
      ).rejects.toThrow(BadRequestException);

      expect(prisma.matchEvent.create).not.toHaveBeenCalled();
    });

    it('syncs suspensions when a red card event is added', async () => {
      jest
        .spyOn(prisma.match, 'findUnique')
        .mockResolvedValue(mockMatch as any);
      jest.spyOn(prisma.matchEvent, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prisma.matchEvent, 'create').mockResolvedValue({
        id: 'event-red-1',
        matchId: 'match-1',
        minute: 80,
        type: 'RED_CARD',
        teamId: 'team-1',
        playerId: 'player-1',
      } as any);

      await service.addEvent('match-1', {
        minute: 80,
        type: 'RED_CARD' as any,
        teamId: 'team-1',
        playerId: 'player-1',
      });

      expect(matchLineupService.syncSuspensionsForMatch).toHaveBeenCalledWith(
        'match-1',
      );
    });
  });

  describe('removeEvent', () => {
    it('should delete an event', async () => {
      jest.spyOn(prisma.matchEvent, 'findFirst').mockResolvedValue({
        id: 'event-1',
        type: 'YELLOW_CARD',
      } as any);
      jest.spyOn(prisma.matchEvent, 'delete').mockResolvedValue({} as any);

      const result = await service.removeEvent('match-1', 'event-1');

      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException if event not found', async () => {
      jest.spyOn(prisma.matchEvent, 'findFirst').mockResolvedValue(null);

      await expect(service.removeEvent('match-1', 'event-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should reject removing event from FINISHED match', async () => {
      jest.spyOn(prisma.matchEvent, 'findFirst').mockResolvedValue({
        id: 'event-1',
        type: 'GOAL',
        matchId: 'match-1',
      } as any);
      jest.spyOn(prisma.match, 'findUnique').mockResolvedValue({
        id: 'match-1',
        status: 'FINISHED',
      } as any);

      await expect(service.removeEvent('match-1', 'event-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateEvent', () => {
    it('should update an event and recalculate score when goal state changes', async () => {
      jest.spyOn(prisma.matchEvent, 'findFirst').mockResolvedValue({
        id: 'event-1',
        matchId: 'match-1',
        type: 'YELLOW_CARD',
      } as any);
      jest
        .spyOn(prisma.match, 'findUnique')
        .mockResolvedValue(mockMatch as any);
      jest.spyOn(prisma.matchEvent, 'update').mockResolvedValue({
        id: 'event-1',
        matchId: 'match-1',
        minute: 55,
        type: 'GOAL',
        teamId: 'team-1',
      } as any);
      jest.spyOn(prisma.matchEvent, 'findMany').mockResolvedValue([
        {
          id: 'event-1',
          matchId: 'match-1',
          type: 'GOAL',
          teamId: 'team-1',
        },
      ] as any);
      jest.spyOn(prisma.match, 'update').mockResolvedValue({
        ...mockMatch,
        homeScore: 1,
        awayScore: 0,
      } as any);

      const result = await service.updateEvent('match-1', 'event-1', {
        minute: 55,
        type: 'GOAL' as any,
        teamId: 'team-1',
      });

      expect(result.ok).toBe(true);
      expect(result.updatedEvent.minute).toBe(55);
      expect(prisma.matchEvent.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'event-1' },
          data: expect.objectContaining({
            minute: 55,
            type: 'GOAL',
            teamId: 'team-1',
          }),
        }),
      );
      expect(prisma.match.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'match-1' },
          data: { homeScore: 1, awayScore: 0 },
        }),
      );
    });

    it('should reject updating event from FINISHED match', async () => {
      jest.spyOn(prisma.matchEvent, 'findFirst').mockResolvedValue({
        id: 'event-1',
        matchId: 'match-1',
        type: 'GOAL',
      } as any);
      jest.spyOn(prisma.match, 'findUnique').mockResolvedValue({
        ...mockMatch,
        status: 'FINISHED',
      } as any);

      await expect(
        service.updateEvent('match-1', 'event-1', {
          minute: 55,
          type: 'GOAL' as any,
          teamId: 'team-1',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateStatus', () => {
    it('should allow DRAFT → PUBLISHED transition', async () => {
      const match = { ...mockMatch, status: 'DRAFT' };
      jest.spyOn(prisma.match, 'findUnique').mockResolvedValue(match as any);
      jest.spyOn(prisma.match, 'update').mockResolvedValue({
        ...match,
        status: 'PUBLISHED',
      } as any);

      const result = await service.updateStatus('match-1', 'PUBLISHED');

      expect(result.status).toBe('PUBLISHED');
    });

    it('should allow PUBLISHED → LOCKED transition', async () => {
      const match = { ...mockMatch, status: 'PUBLISHED' };
      jest.spyOn(prisma.match, 'findUnique').mockResolvedValue(match as any);
      jest.spyOn(prisma.matchTeamRegistration, 'count').mockResolvedValue(2);
      jest
        .spyOn(prisma.matchOfficialAssignment, 'count')
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(1);
      jest.spyOn(prisma.matchOfficialAssignment, 'findMany').mockResolvedValue([
        { officialId: 'official-referee', role: 'MAIN_REFEREE' },
        { officialId: 'official-supervisor', role: 'SUPERVISOR' },
      ] as any);
      jest.spyOn(prisma.match, 'update').mockResolvedValue({
        ...match,
        status: 'LOCKED',
      } as any);

      const result = await service.updateStatus('match-1', 'LOCKED');

      expect(result.status).toBe('LOCKED');
    });

    it('should reject PUBLISHED → LOCKED when both teams do not have approved lineups', async () => {
      const match = { ...mockMatch, status: 'PUBLISHED' };
      jest.spyOn(prisma.match, 'findUnique').mockResolvedValue(match as any);
      jest.spyOn(prisma.matchTeamRegistration, 'count').mockResolvedValue(1);
      jest.spyOn(prisma.match, 'update').mockResolvedValue({
        ...match,
        status: 'LOCKED',
      } as any);

      await expect(service.updateStatus('match-1', 'LOCKED')).rejects.toThrow(
        'Phải có đội hình đã được BTC duyệt cho cả hai đội trước khi khóa trận.',
      );

      expect(prisma.match.update).not.toHaveBeenCalled();
    });

    it('should reject PUBLISHED → LOCKED when no referee has been assigned', async () => {
      const match = { ...mockMatch, status: 'PUBLISHED' };
      jest.spyOn(prisma.match, 'findUnique').mockResolvedValue(match as any);
      jest.spyOn(prisma.matchTeamRegistration, 'count').mockResolvedValue(2);
      jest
        .spyOn(prisma.matchOfficialAssignment, 'count')
        .mockResolvedValueOnce(0);
      jest.spyOn(prisma.match, 'update').mockResolvedValue({
        ...match,
        status: 'LOCKED',
      } as any);

      await expect(service.updateStatus('match-1', 'LOCKED')).rejects.toThrow(
        'Phải phân công trọng tài trước khi khóa trận.',
      );

      expect(prisma.match.update).not.toHaveBeenCalled();
    });

    it('should reject PUBLISHED → LOCKED when no supervisor has been assigned', async () => {
      const match = { ...mockMatch, status: 'PUBLISHED' };
      jest.spyOn(prisma.match, 'findUnique').mockResolvedValue(match as any);
      jest.spyOn(prisma.matchTeamRegistration, 'count').mockResolvedValue(2);
      jest
        .spyOn(prisma.matchOfficialAssignment, 'count')
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(0);
      jest.spyOn(prisma.match, 'update').mockResolvedValue({
        ...match,
        status: 'LOCKED',
      } as any);

      await expect(service.updateStatus('match-1', 'LOCKED')).rejects.toThrow(
        'Phải phân công giám sát trước khi khóa trận.',
      );

      expect(prisma.match.update).not.toHaveBeenCalled();
    });

    it('should reject PUBLISHED → LOCKED when one official is assigned as both referee and supervisor', async () => {
      const match = { ...mockMatch, status: 'PUBLISHED' };
      jest.spyOn(prisma.match, 'findUnique').mockResolvedValue(match as any);
      jest.spyOn(prisma.matchTeamRegistration, 'count').mockResolvedValue(2);
      jest
        .spyOn(prisma.matchOfficialAssignment, 'count')
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(1);
      jest.spyOn(prisma.matchOfficialAssignment, 'findMany').mockResolvedValue([
        { officialId: 'official-1', role: 'MAIN_REFEREE' },
        { officialId: 'official-1', role: 'SUPERVISOR' },
      ] as any);
      jest.spyOn(prisma.match, 'update').mockResolvedValue({
        ...match,
        status: 'LOCKED',
      } as any);

      await expect(service.updateStatus('match-1', 'LOCKED')).rejects.toThrow(
        'Trọng tài và giám sát phải là 2 người khác nhau trước khi khóa trận.',
      );

      expect(prisma.match.update).not.toHaveBeenCalled();
    });

    it('should allow LOCKED → FINISHED transition', async () => {
      const match = { ...mockMatch, status: 'LOCKED' };
      jest.spyOn(prisma.match, 'findUnique').mockResolvedValue(match as any);
      jest
        .spyOn(prisma.matchReport, 'findUnique')
        .mockResolvedValue({ id: 'report-1' } as any);
      jest
        .spyOn(prisma.disciplineReport, 'findUnique')
        .mockResolvedValue({ id: 'discipline-1' } as any);
      jest.spyOn(prisma.match, 'update').mockResolvedValue({
        ...match,
        status: 'FINISHED',
      } as any);

      const result = await service.updateStatus('match-1', 'FINISHED');

      expect(result.status).toBe('FINISHED');
    });

    it('should reject LOCKED → FINISHED when the referee report is missing', async () => {
      const match = {
        ...mockMatch,
        status: 'LOCKED',
        homeScore: 2,
        awayScore: 1,
      };
      jest.spyOn(prisma.match, 'findUnique').mockResolvedValue(match as any);
      jest.spyOn(prisma.matchReport, 'findUnique').mockResolvedValue(null);
      jest
        .spyOn(prisma.disciplineReport, 'findUnique')
        .mockResolvedValue({ id: 'discipline-1' } as any);
      jest.spyOn(prisma.match, 'update').mockResolvedValue({
        ...match,
        status: 'FINISHED',
      } as any);

      await expect(service.updateStatus('match-1', 'FINISHED')).rejects.toThrow(
        'Phải có biên bản trọng tài trước khi kết thúc trận đấu.',
      );

      expect(prisma.match.update).not.toHaveBeenCalled();
    });

    it('should reject LOCKED → FINISHED when the supervisor report is missing', async () => {
      const match = {
        ...mockMatch,
        status: 'LOCKED',
        homeScore: 2,
        awayScore: 1,
      };
      jest.spyOn(prisma.match, 'findUnique').mockResolvedValue(match as any);
      jest
        .spyOn(prisma.matchReport, 'findUnique')
        .mockResolvedValue({ id: 'report-1' } as any);
      jest.spyOn(prisma.disciplineReport, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.match, 'update').mockResolvedValue({
        ...match,
        status: 'FINISHED',
      } as any);

      await expect(service.updateStatus('match-1', 'FINISHED')).rejects.toThrow(
        'Phải có báo cáo giám sát trước khi kết thúc trận đấu.',
      );

      expect(prisma.match.update).not.toHaveBeenCalled();
    });

    it('should reject invalid transition DRAFT → FINISHED', async () => {
      const match = { ...mockMatch, status: 'DRAFT' };
      jest.spyOn(prisma.match, 'findUnique').mockResolvedValue(match as any);

      await expect(service.updateStatus('match-1', 'FINISHED')).rejects.toThrow(
        'Không thể chuyển trạng thái',
      );
    });

    it('should reject invalid transition FINISHED → DRAFT', async () => {
      const match = { ...mockMatch, status: 'FINISHED' };
      jest.spyOn(prisma.match, 'findUnique').mockResolvedValue(match as any);

      await expect(service.updateStatus('match-1', 'DRAFT')).rejects.toThrow(
        'Không thể chuyển trạng thái',
      );
    });

    it('should allow DRAFT → POSTPONED transition', async () => {
      const match = { ...mockMatch, status: 'DRAFT' };
      jest.spyOn(prisma.match, 'findUnique').mockResolvedValue(match as any);
      jest.spyOn(prisma.match, 'update').mockResolvedValue({
        ...match,
        status: 'POSTPONED',
      } as any);

      const result = await service.updateStatus('match-1', 'POSTPONED');

      expect(result.status).toBe('POSTPONED');
    });

    it('should throw NotFoundException for non-existent match', async () => {
      jest.spyOn(prisma.match, 'findUnique').mockResolvedValue(null);

      await expect(
        service.updateStatus('non-existent', 'PUBLISHED'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject LOCKED → FINISHED when scores are null', async () => {
      const match = {
        ...mockMatch,
        status: 'LOCKED',
        homeScore: null,
        awayScore: null,
      };
      jest.spyOn(prisma.match, 'findUnique').mockResolvedValue(match as any);

      await expect(service.updateStatus('match-1', 'FINISHED')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should trigger standings recalculation on FINISHED', async () => {
      const match = {
        ...mockMatch,
        status: 'LOCKED',
        homeScore: 2,
        awayScore: 1,
        seasonId: 'season-1',
      };
      jest.spyOn(prisma.match, 'findUnique').mockResolvedValue(match as any);
      jest
        .spyOn(prisma.matchReport, 'findUnique')
        .mockResolvedValue({ id: 'report-1' } as any);
      jest
        .spyOn(prisma.disciplineReport, 'findUnique')
        .mockResolvedValue({ id: 'discipline-1' } as any);
      jest.spyOn(prisma.match, 'update').mockResolvedValue({
        ...match,
        status: 'FINISHED',
      } as any);

      await service.updateStatus('match-1', 'FINISHED');

      expect(standingsService.getStandings).toHaveBeenCalledWith('season-1');
    });
  });

  describe('addEvent - MAX_GOAL_TIME validation', () => {
    it('should reject goal event when minute exceeds MAX_GOAL_TIME', async () => {
      const match = { ...mockMatch, seasonId: 'season-1' };
      jest.spyOn(prisma.match, 'findUnique').mockResolvedValue(match as any);
      jest.spyOn(regulationHelper, 'getNumericValue').mockResolvedValue(96);

      await expect(
        service.addEvent('match-1', {
          minute: 120,
          type: 'GOAL' as any,
          teamId: 'team-1',
        }),
      ).rejects.toThrow('vượt quá 96');
    });
  });
});

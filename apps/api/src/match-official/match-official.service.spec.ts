import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MatchLineupService } from '../match-lineup/match-lineup.service';
import { NotificationService } from '../notification/notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { MatchOfficialService } from './match-official.service';

describe('MatchOfficialService', () => {
  let service: MatchOfficialService;
  let prisma: PrismaService;
  let notificationService: NotificationService;
  let matchLineupService: MatchLineupService;

  const match = {
    id: 'match-1',
    seasonId: 'season-1',
    roundNo: 1,
    homeTeamId: 'team-home',
    awayTeamId: 'team-away',
    homeScore: null,
    awayScore: null,
    scoreSource: null,
  };
  const official = {
    id: 'official-1',
    fullName: 'Nguyễn Văn Trọng',
    email: 'referee@demo.local',
    status: 'ACTIVE',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchOfficialService,
        {
          provide: PrismaService,
          useValue: {
            official: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            user: {
              findMany: jest.fn(),
            },
            match: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            matchOfficialAssignment: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              count: jest.fn(),
              upsert: jest.fn(),
              deleteMany: jest.fn(),
            },
            matchReport: {
              findUnique: jest.fn(),
              upsert: jest.fn(),
            },
            disciplineReport: {
              findUnique: jest.fn(),
              upsert: jest.fn(),
            },
            matchEvent: {
              createMany: jest.fn(),
              deleteMany: jest.fn(),
              findFirst: jest.fn(),
            },
          },
        },
        {
          provide: NotificationService,
          useValue: {
            notifyAdmins: jest.fn().mockResolvedValue(undefined),
            notifyDisciplinaryReferralToAdmins: jest
              .fn()
              .mockResolvedValue(undefined),
          },
        },
        {
          provide: MatchLineupService,
          useValue: {
            syncSuspensionsForMatch: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<MatchOfficialService>(MatchOfficialService);
    prisma = module.get<PrismaService>(PrismaService);
    notificationService = module.get<NotificationService>(NotificationService);
    matchLineupService = module.get<MatchLineupService>(MatchLineupService);

    jest.spyOn(prisma.match, 'findUnique').mockResolvedValue(match as any);
    jest
      .spyOn(prisma.official, 'findUnique')
      .mockResolvedValue(official as any);
    jest.spyOn(prisma.matchOfficialAssignment, 'findFirst').mockResolvedValue({
      id: 'assignment-1',
      matchId: 'match-1',
      officialId: 'official-1',
      role: 'MAIN_REFEREE',
    } as any);
    jest.spyOn(prisma.matchReport, 'findUnique').mockResolvedValue(null);
    jest.spyOn(prisma.disciplineReport, 'findUnique').mockResolvedValue(null);
    jest.spyOn(prisma.matchEvent, 'findFirst').mockResolvedValue(null);
    jest
      .spyOn(prisma.matchOfficialAssignment, 'findMany')
      .mockResolvedValue([]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates an official that can be assigned to matches', async () => {
    jest.spyOn(prisma.official, 'create').mockResolvedValue(official as any);

    const result = await service.createOfficial({
      fullName: 'Nguyễn Văn Trọng',
      email: 'referee@demo.local',
      phone: '0900000000',
    });

    expect(result).toEqual(official);
    expect(prisma.official.create).toHaveBeenCalledWith({
      data: {
        fullName: 'Nguyễn Văn Trọng',
        email: 'referee@demo.local',
        phone: '0900000000',
        status: 'ACTIVE',
      },
    });
  });

  it('adds matching user account roles to the officials directory', async () => {
    jest.spyOn(prisma.official, 'findMany').mockResolvedValue([
      official,
      {
        id: 'official-2',
        fullName: 'Đỗ Quốc Hưng',
        email: 'supervisor@demo.local',
        status: 'ACTIVE',
      },
    ] as any);
    jest.spyOn(prisma.user, 'findMany').mockResolvedValue([
      { email: 'referee@demo.local', role: 'REFEREE' },
      { email: 'supervisor@demo.local', role: 'SUPERVISOR' },
    ] as any);

    const result = await service.listOfficials();

    expect(result).toEqual([
      expect.objectContaining({ id: 'official-1', accountRole: 'REFEREE' }),
      expect.objectContaining({ id: 'official-2', accountRole: 'SUPERVISOR' }),
    ]);
  });

  it('adds matching user account roles to listed match assignments', async () => {
    jest.spyOn(prisma.matchOfficialAssignment, 'findMany').mockResolvedValue([
      {
        id: 'assignment-1',
        matchId: 'match-1',
        officialId: 'official-1',
        role: 'MAIN_REFEREE',
        official,
      },
    ] as any);
    jest
      .spyOn(prisma.user, 'findMany')
      .mockResolvedValue([
        { email: 'referee@demo.local', role: 'REFEREE' },
      ] as any);

    const result = await service.listAssignments('match-1');

    expect(result[0].official).toEqual(
      expect.objectContaining({ accountRole: 'REFEREE' }),
    );
  });

  it('assigns a referee to a match and stores publish metadata', async () => {
    jest.spyOn(prisma.matchOfficialAssignment, 'count').mockResolvedValue(0);
    jest.spyOn(prisma.matchOfficialAssignment, 'upsert').mockResolvedValue({
      id: 'assignment-1',
      matchId: 'match-1',
      officialId: 'official-1',
      role: 'MAIN_REFEREE',
      publishedAt: expect.any(Date),
    } as any);

    const result = await service.assignOfficial('match-1', {
      officialId: 'official-1',
      role: 'MAIN_REFEREE',
      note: 'Trọng tài chính',
    });

    expect(result.matchId).toBe('match-1');
    expect(prisma.matchOfficialAssignment.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          matchId_officialId_role: {
            matchId: 'match-1',
            officialId: 'official-1',
            role: 'MAIN_REFEREE',
          },
        },
        create: expect.objectContaining({
          matchId: 'match-1',
          officialId: 'official-1',
          role: 'MAIN_REFEREE',
          note: 'Trọng tài chính',
        }),
      }),
    );
  });

  it('rejects assigning more than one supervisor to one match', async () => {
    jest.spyOn(prisma.matchOfficialAssignment, 'count').mockResolvedValue(1);

    await expect(
      service.assignOfficial('match-1', {
        officialId: 'official-1',
        role: 'SUPERVISOR',
      }),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.matchOfficialAssignment.upsert).not.toHaveBeenCalled();
  });

  it('rejects assigning one official to multiple roles in the same match', async () => {
    jest.spyOn(prisma.matchOfficialAssignment, 'findMany').mockResolvedValue([
      {
        id: 'assignment-existing',
        matchId: 'match-1',
        officialId: 'official-1',
        role: 'SUPERVISOR',
      },
    ] as any);

    await expect(
      service.assignOfficial('match-1', {
        officialId: 'official-1',
        role: 'MAIN_REFEREE',
      }),
    ).rejects.toThrow(
      'Một trọng tài/giám sát viên chỉ được đảm nhận 1 vai trò trong cùng một trận.',
    );

    expect(prisma.matchOfficialAssignment.upsert).not.toHaveBeenCalled();
  });

  it('throws when assigning an official to a missing match', async () => {
    jest.spyOn(prisma.match, 'findUnique').mockResolvedValue(null);

    await expect(
      service.assignOfficial('missing-match', {
        officialId: 'official-1',
        role: 'MAIN_REFEREE',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('removes an official assignment from a match', async () => {
    jest
      .spyOn(prisma.matchOfficialAssignment, 'deleteMany')
      .mockResolvedValue({ count: 1 } as any);

    const result = await service.removeAssignment('match-1', 'assignment-1');

    expect(result).toEqual({ success: true });
    expect(prisma.matchOfficialAssignment.deleteMany).toHaveBeenCalledWith({
      where: { id: 'assignment-1', matchId: 'match-1' },
    });
  });

  it('throws when removing a missing official assignment', async () => {
    jest
      .spyOn(prisma.matchOfficialAssignment, 'deleteMany')
      .mockResolvedValue({ count: 0 } as any);

    await expect(
      service.removeAssignment('match-1', 'missing-assignment'),
    ).rejects.toThrow(NotFoundException);
  });

  it('submits a referee report, updates the score when admin has not supplied one, stores best player, and records events', async () => {
    jest.spyOn(prisma.match, 'update').mockResolvedValue({
      ...match,
      homeScore: 2,
      awayScore: 1,
      scoreSource: 'REFEREE',
    } as any);
    jest
      .spyOn(prisma.matchEvent, 'createMany')
      .mockResolvedValue({ count: 4 } as any);
    jest.spyOn(prisma.matchReport, 'upsert').mockResolvedValue({
      id: 'report-1',
      matchId: 'match-1',
      submittedByUserId: 'user-referee',
      homeScore: 2,
      awayScore: 1,
      bestPlayerId: 'player-1',
    } as any);

    const result = await service.submitMatchReport(
      'match-1',
      { id: 'user-referee', email: 'referee@demo.local', role: 'REFEREE' },
      {
        homeScore: 2,
        awayScore: 1,
        bestPlayerId: 'player-1',
        technicalStats: { shots: { home: 8, away: 5 } },
        note: 'Trận đấu hợp lệ',
        events: [
          {
            minute: 12,
            type: 'GOAL',
            teamId: 'team-home',
            playerId: 'player-1',
          },
          {
            minute: 35,
            type: 'GOAL',
            teamId: 'team-home',
            playerId: 'player-2',
          },
          {
            minute: 52,
            type: 'GOAL',
            teamId: 'team-away',
            playerId: 'player-8',
          },
          {
            minute: 88,
            type: 'YELLOW_CARD',
            teamId: 'team-away',
            playerId: 'player-9',
          },
        ],
      },
    );

    expect(result.bestPlayerId).toBe('player-1');
    expect(prisma.match.update).toHaveBeenCalledWith({
      where: { id: 'match-1' },
      data: { homeScore: 2, awayScore: 1, scoreSource: 'REFEREE' },
    });
    expect(prisma.matchEvent.deleteMany).toHaveBeenCalledWith({
      where: { matchId: 'match-1', source: 'MATCH_REPORT' },
    });
    expect(prisma.matchEvent.createMany).toHaveBeenCalledWith({
      data: [
        {
          matchId: 'match-1',
          minute: 12,
          type: 'GOAL',
          teamId: 'team-home',
          playerId: 'player-1',
          relatedPlayerId: undefined,
          goalType: undefined,
          note: undefined,
          source: 'MATCH_REPORT',
        },
        {
          matchId: 'match-1',
          minute: 35,
          type: 'GOAL',
          teamId: 'team-home',
          playerId: 'player-2',
          relatedPlayerId: undefined,
          goalType: undefined,
          note: undefined,
          source: 'MATCH_REPORT',
        },
        {
          matchId: 'match-1',
          minute: 52,
          type: 'GOAL',
          teamId: 'team-away',
          playerId: 'player-8',
          relatedPlayerId: undefined,
          goalType: undefined,
          note: undefined,
          source: 'MATCH_REPORT',
        },
        {
          matchId: 'match-1',
          minute: 88,
          type: 'YELLOW_CARD',
          teamId: 'team-away',
          playerId: 'player-9',
          relatedPlayerId: undefined,
          goalType: undefined,
          note: undefined,
          source: 'MATCH_REPORT',
        },
      ],
    });
    expect(prisma.matchReport.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { matchId: 'match-1' },
        create: expect.objectContaining({
          submittedByUserId: 'user-referee',
          bestPlayerId: 'player-1',
        }),
      }),
    );
    expect((notificationService as any).notifyAdmins).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Trọng tài nộp biên bản',
        message: expect.stringContaining('2 - 1'),
        type: 'SYSTEM',
        entityType: 'match',
        entityId: 'match-1',
      }),
    );
    expect(matchLineupService.syncSuspensionsForMatch).toHaveBeenCalledWith(
      'match-1',
    );
  });

  it('includes referee and match details in the admin notification when a referee submits a report', async () => {
    jest.spyOn(prisma.match, 'findUnique').mockResolvedValue({
      ...match,
      homeTeam: { name: 'Hà Nội FC' },
      awayTeam: { name: 'Trường Tươi Đồng Nai' },
    } as any);
    jest.spyOn(prisma.matchOfficialAssignment, 'findFirst').mockResolvedValue({
      id: 'assignment-1',
      matchId: 'match-1',
      officialId: 'official-1',
      role: 'MAIN_REFEREE',
      official,
    } as any);
    jest.spyOn(prisma.match, 'update').mockResolvedValue({
      ...match,
      homeScore: 1,
      awayScore: 0,
      scoreSource: 'REFEREE',
    } as any);
    jest.spyOn(prisma.matchReport, 'upsert').mockResolvedValue({
      id: 'report-1',
      matchId: 'match-1',
      submittedByUserId: 'user-referee',
      homeScore: 1,
      awayScore: 0,
    } as any);

    await service.submitMatchReport(
      'match-1',
      { id: 'user-referee', email: 'referee@demo.local', role: 'REFEREE' },
      {
        homeScore: 1,
        awayScore: 0,
        events: [{ minute: 12, type: 'GOAL', teamId: 'team-home' }],
      },
    );

    const notification = (notificationService.notifyAdmins as jest.Mock).mock
      .calls[0][0];
    expect(notification).toEqual(
      expect.objectContaining({
        title: 'Trọng tài nộp biên bản',
        type: 'SYSTEM',
        entityType: 'match',
        entityId: 'match-1',
      }),
    );
    expect(notification.message).toContain('Nguyễn Văn Trọng');
    expect(notification.message).toContain('Hà Nội FC vs Trường Tươi Đồng Nai');
    expect(notification.message).toContain('1 - 0');
  });

  it('rejects a referee report with two red cards for the same player', async () => {
    await expect(
      service.submitMatchReport(
        'match-1',
        { id: 'user-referee', email: 'referee@demo.local', role: 'REFEREE' },
        {
          homeScore: 0,
          awayScore: 0,
          events: [
            {
              minute: 50,
              type: 'RED_CARD',
              teamId: 'team-home',
              playerId: 'player-1',
            },
            {
              minute: 80,
              type: 'RED_CARD',
              teamId: 'team-home',
              playerId: 'player-1',
            },
          ],
        },
      ),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.matchEvent.createMany).not.toHaveBeenCalled();
  });

  it('keeps the official admin score when a referee report submits a different calculated score', async () => {
    jest.spyOn(prisma.match, 'findUnique').mockResolvedValue({
      ...match,
      homeScore: 4,
      awayScore: 0,
      scoreSource: 'ADMIN',
    } as any);
    jest.spyOn(prisma.matchReport, 'upsert').mockResolvedValue({
      id: 'report-1',
      matchId: 'match-1',
      homeScore: 4,
      awayScore: 0,
    } as any);

    await service.submitMatchReport(
      'match-1',
      { id: 'user-referee', email: 'referee@demo.local', role: 'REFEREE' },
      {
        homeScore: 2,
        awayScore: 0,
        events: [
          { minute: 1, type: 'GOAL', teamId: 'team-home' },
          { minute: 2, type: 'GOAL', teamId: 'team-home' },
          { minute: 3, type: 'GOAL', teamId: 'team-home' },
          { minute: 4, type: 'GOAL', teamId: 'team-home' },
        ],
      },
    );

    expect(prisma.match.update).not.toHaveBeenCalled();
    expect(prisma.matchReport.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          homeScore: 4,
          awayScore: 0,
        }),
        update: expect.objectContaining({
          homeScore: 4,
          awayScore: 0,
        }),
      }),
    );
  });

  it('rejects a referee report when goal events do not match the submitted score', async () => {
    await expect(
      service.submitMatchReport(
        'match-1',
        { id: 'user-referee', email: 'referee@demo.local', role: 'REFEREE' },
        {
          homeScore: 2,
          awayScore: 1,
          events: [{ minute: 12, type: 'GOAL', teamId: 'team-home' }],
        },
      ),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.match.update).not.toHaveBeenCalled();
    expect(prisma.matchEvent.deleteMany).not.toHaveBeenCalled();
    expect(prisma.matchEvent.createMany).not.toHaveBeenCalled();
    expect(prisma.matchReport.upsert).not.toHaveBeenCalled();
  });

  it('rejects a second referee report submission', async () => {
    jest.spyOn(prisma.matchReport, 'findUnique').mockResolvedValue({
      id: 'report-1',
    } as any);

    await expect(
      service.submitMatchReport(
        'match-1',
        { id: 'user-referee', email: 'referee@demo.local', role: 'REFEREE' },
        {
          homeScore: 0,
          awayScore: 0,
          events: [],
        },
      ),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.match.update).not.toHaveBeenCalled();
    expect(prisma.matchEvent.deleteMany).not.toHaveBeenCalled();
    expect(prisma.matchReport.upsert).not.toHaveBeenCalled();
  });

  it('submits supervisor discipline report with issue notes', async () => {
    jest.spyOn(prisma.disciplineReport, 'upsert').mockResolvedValue({
      id: 'discipline-1',
      matchId: 'match-1',
      supervisorId: 'official-1',
      organizationRating: 'GOOD',
      sentToDisciplinaryAt: new Date('2026-05-27T10:00:00.000Z'),
    } as any);

    const result = await service.submitDisciplineReport(
      'match-1',
      {
        id: 'user-supervisor',
        email: 'referee@demo.local',
        role: 'SUPERVISOR',
      },
      {
        supervisorId: 'official-1',
        organizationRating: 'GOOD',
        refereeIssues: 'Không có',
        playerIssues: 'Một cầu thủ phản ứng trọng tài',
        organizerIssues: 'Không có',
        notes: 'Gửi BTC kỷ luật theo dõi',
        sendToDisciplinary: true,
      },
    );

    expect(result.id).toBe('discipline-1');
    expect(prisma.disciplineReport.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { matchId: 'match-1' },
        create: expect.objectContaining({
          matchId: 'match-1',
          supervisorId: 'official-1',
          playerIssues: 'Một cầu thủ phản ứng trọng tài',
          sentToDisciplinaryAt: expect.any(Date),
        }),
      }),
    );
    expect((notificationService as any).notifyAdmins).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Giám sát viên nộp báo cáo kỷ luật',
        message: expect.stringContaining('GOOD'),
        type: 'SYSTEM',
        entityType: 'match',
        entityId: 'match-1',
      }),
    );
    expect(
      notificationService.notifyDisciplinaryReferralToAdmins,
    ).not.toHaveBeenCalled();
  });

  it('notifies admins when supervisor sends an issues-found report to discipline board', async () => {
    jest.spyOn(prisma.disciplineReport, 'upsert').mockResolvedValue({
      id: 'discipline-1',
      matchId: 'match-1',
      supervisorId: 'official-1',
      organizationRating: 'ISSUES_FOUND',
    } as any);
    jest
      .spyOn(prisma.match, 'findUnique')
      .mockResolvedValueOnce(match as any)
      .mockResolvedValueOnce({
        id: 'match-1',
        kickoffAt: new Date('2026-05-31T10:00:00.000Z'),
        homeTeam: { name: 'Home FC' },
        awayTeam: { name: 'Away FC' },
      } as any);

    await service.submitDisciplineReport(
      'match-1',
      {
        id: 'user-supervisor',
        email: 'referee@demo.local',
        role: 'SUPERVISOR',
      },
      {
        supervisorId: 'official-1',
        organizationRating: 'ISSUES_FOUND',
        sendToDisciplinary: true,
      },
    );

    expect(
      notificationService.notifyDisciplinaryReferralToAdmins,
    ).toHaveBeenCalledWith({
      matchId: 'match-1',
      homeTeam: 'Home FC',
      awayTeam: 'Away FC',
      kickoffAt: new Date('2026-05-31T10:00:00.000Z'),
      supervisorName: official.fullName,
    });
  });

  it('rejects a second supervisor discipline report submission', async () => {
    jest
      .spyOn(prisma.disciplineReport, 'findUnique')
      .mockResolvedValue({ id: 'discipline-1' } as any);

    await expect(
      service.submitDisciplineReport(
        'match-1',
        {
          id: 'user-supervisor',
          email: 'referee@demo.local',
          role: 'SUPERVISOR',
        },
        {
          supervisorId: 'official-1',
          organizationRating: 'GOOD',
        },
      ),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.disciplineReport.upsert).not.toHaveBeenCalled();
  });

  it('allows admin to update an existing supervisor discipline report', async () => {
    jest
      .spyOn(prisma.disciplineReport, 'findUnique')
      .mockResolvedValue({ id: 'discipline-1' } as any);
    jest.spyOn(prisma.disciplineReport, 'upsert').mockResolvedValue({
      id: 'discipline-1',
      matchId: 'match-1',
      supervisorId: 'official-1',
      organizationRating: 'ACCEPTABLE',
    } as any);

    const result = await service.submitDisciplineReport(
      'match-1',
      {
        id: 'user-admin',
        email: 'admin@demo.local',
        role: 'ADMIN',
      },
      {
        supervisorId: 'official-1',
        organizationRating: 'ACCEPTABLE',
      },
    );

    expect(result.organizationRating).toBe('ACCEPTABLE');
    expect(prisma.disciplineReport.upsert).toHaveBeenCalled();
  });
});

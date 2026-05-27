import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { MatchOfficialService } from './match-official.service';

describe('MatchOfficialService', () => {
  let service: MatchOfficialService;
  let prisma: PrismaService;

  const match = {
    id: 'match-1',
    seasonId: 'season-1',
    roundNo: 1,
    homeTeamId: 'team-home',
    awayTeamId: 'team-away',
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
            match: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            matchOfficialAssignment: {
              findMany: jest.fn(),
              count: jest.fn(),
              upsert: jest.fn(),
            },
            matchReport: {
              upsert: jest.fn(),
            },
            disciplineReport: {
              upsert: jest.fn(),
            },
            matchEvent: {
              createMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<MatchOfficialService>(MatchOfficialService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.spyOn(prisma.match, 'findUnique').mockResolvedValue(match as any);
    jest
      .spyOn(prisma.official, 'findUnique')
      .mockResolvedValue(official as any);
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

  it('throws when assigning an official to a missing match', async () => {
    jest.spyOn(prisma.match, 'findUnique').mockResolvedValue(null);

    await expect(
      service.assignOfficial('missing-match', {
        officialId: 'official-1',
        role: 'MAIN_REFEREE',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('submits a referee report, updates score, stores best player, and records events', async () => {
    jest.spyOn(prisma.match, 'update').mockResolvedValue({
      ...match,
      homeScore: 2,
      awayScore: 1,
    } as any);
    jest
      .spyOn(prisma.matchEvent, 'createMany')
      .mockResolvedValue({ count: 2 } as any);
    jest.spyOn(prisma.matchReport, 'upsert').mockResolvedValue({
      id: 'report-1',
      matchId: 'match-1',
      submittedByUserId: 'user-referee',
      homeScore: 2,
      awayScore: 1,
      bestPlayerId: 'player-1',
    } as any);

    const result = await service.submitMatchReport('match-1', 'user-referee', {
      homeScore: 2,
      awayScore: 1,
      bestPlayerId: 'player-1',
      technicalStats: { shots: { home: 8, away: 5 } },
      note: 'Trận đấu hợp lệ',
      events: [
        { minute: 12, type: 'GOAL', teamId: 'team-home', playerId: 'player-1' },
        {
          minute: 88,
          type: 'YELLOW_CARD',
          teamId: 'team-away',
          playerId: 'player-9',
        },
      ],
    });

    expect(result.bestPlayerId).toBe('player-1');
    expect(prisma.match.update).toHaveBeenCalledWith({
      where: { id: 'match-1' },
      data: { homeScore: 2, awayScore: 1 },
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
        },
      ],
      skipDuplicates: true,
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
  });

  it('submits supervisor discipline report with issue notes', async () => {
    jest.spyOn(prisma.disciplineReport, 'upsert').mockResolvedValue({
      id: 'discipline-1',
      matchId: 'match-1',
      supervisorId: 'official-1',
      organizationRating: 'GOOD',
      sentToDisciplinaryAt: new Date('2026-05-27T10:00:00.000Z'),
    } as any);

    const result = await service.submitDisciplineReport('match-1', {
      supervisorId: 'official-1',
      organizationRating: 'GOOD',
      refereeIssues: 'Không có',
      playerIssues: 'Một cầu thủ phản ứng trọng tài',
      organizerIssues: 'Không có',
      notes: 'Gửi BTC kỷ luật theo dõi',
      sendToDisciplinary: true,
    });

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
  });
});

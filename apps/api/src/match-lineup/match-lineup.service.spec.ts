import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { RegulationHelper } from '../regulation/regulation.helper';
import type { SubmitMatchLineupDto } from './dto/match-lineup.dto';
import { MatchLineupService } from './match-lineup.service';

const match = {
  id: 'match-1',
  seasonId: 'season-1',
  roundNo: 1,
  homeTeamId: 'team-1',
  awayTeamId: 'team-2',
  kickoffAt: new Date('2025-02-01T12:00:00Z'),
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
              updateMany: jest.fn(),
              upsert: jest.fn(),
            },
            matchEvent: {
              findMany: jest.fn(),
            },
            matchTeamRegistration: {
              findMany: jest.fn(),
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
      ],
    }).compile();

    service = module.get(MatchLineupService);
    prisma = module.get(PrismaService);
    regulationHelper = module.get(RegulationHelper);

    jest.spyOn(prisma.match, 'findUnique').mockResolvedValue(match as any);
    jest
      .spyOn(prisma.teamPlayer, 'findMany')
      .mockResolvedValue(rosterRows() as any);
    jest.spyOn(prisma.playerSuspension, 'findMany').mockResolvedValue([]);
    jest.spyOn(prisma.matchTeamRegistration, 'upsert').mockResolvedValue({
      id: 'registration-1',
      matchId: 'match-1',
      teamId: 'team-1',
    } as any);
  });

  it('submits a valid 11 starter and 5 substitute lineup', async () => {
    const result = await service.submitLineup('match-1', lineupPayload());

    expect(result.id).toBe('registration-1');
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

  it('creates a next-match suspension from red card events', async () => {
    jest
      .spyOn(prisma.matchEvent, 'findMany')
      .mockResolvedValue([
        { type: 'RED_CARD', playerId: 'player-1', teamId: 'team-1' },
      ] as any);
    jest
      .spyOn(prisma.match, 'findFirst')
      .mockResolvedValue({ id: 'match-2' } as any);
    jest
      .spyOn(prisma.playerSuspension, 'upsert')
      .mockResolvedValue({ id: 'suspension-1' } as any);

    await service.syncSuspensionsForMatch('match-1');

    expect(prisma.playerSuspension.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          playerId_sourceMatchId_reason: {
            playerId: 'player-1',
            sourceMatchId: 'match-1',
            reason: 'RED_CARD',
          },
        },
        create: expect.objectContaining({
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

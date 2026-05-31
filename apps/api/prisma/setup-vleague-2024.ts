import { PrismaPg } from '@prisma/adapter-pg';
import {
  EventType,
  MatchKitType,
  MatchLineupRole,
  MatchLineupStatus,
  MatchOfficialRole,
  MatchStatus,
  OfficialStatus,
  PlayerPosition,
  PlayerSuspensionStatus,
  PrismaClient,
  PromotionCandidateStatus,
  PromotionQualificationType,
  SeasonStatus,
  SeasonTeamStatus,
  TeamInvitationSourceType,
  TeamInvitationStatus,
  UserRole,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env['DATABASE_URL'] });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEMO_PASSWORD = 'Demo@12345';
const CORE_DEMO_USERS = [
  { email: 'admin@demo.local', role: UserRole.ADMIN, name: 'Admin Demo' },
  { email: 'referee@demo.local', role: UserRole.REFEREE, name: 'Referee Demo' },
  {
    email: 'supervisor@demo.local',
    role: UserRole.SUPERVISOR,
    name: 'Supervisor Demo',
  },
] as const;
const DEMO_OFFICIALS = [
  {
    fullName: 'Referee Demo',
    email: 'referee@demo.local',
    role: MatchOfficialRole.MAIN_REFEREE,
    note: 'Demo main referee assignment',
  },
  {
    fullName: 'Supervisor Demo',
    email: 'supervisor@demo.local',
    role: MatchOfficialRole.SUPERVISOR,
    note: 'Demo supervisor assignment',
  },
] as const;
const REAL_TEAMS = [
  'Thép Xanh Nam Định',
  'Hà Nội FC',
  'Công An Hà Nội',
  'Thể Công-Viettel',
  'Becamex Bình Dương',
  'Hải Phòng FC',
  'Đông Á Thanh Hóa',
  'LPBank Hoàng Anh Gia Lai',
  'TP.HCM FC',
  'Sông Lam Nghệ An',
  'MerryLand Quy Nhơn Bình Định',
  'Quảng Nam FC',
  'Hồng Lĩnh Hà Tĩnh',
  'SHB Đà Nẵng',
];

const REAL_TEAM_COACHES = new Map<string, string>([
  ['Thể Công-Viettel', 'Velizar Popov'],
  ['Becamex Bình Dương', 'Hứa Hiền Vinh'],
  ['Đông Á Thanh Hóa', 'Nguyễn Anh Đức'],
  ['Thép Xanh Nam Định', 'Vũ Hồng Việt'],
  ['Sông Lam Nghệ An', 'Văn Sỹ Sơn'],
  ['Hải Phòng FC', 'Đặng Văn Thành'],
  ['TP.HCM FC', 'Phùng Thanh Phương'],
  ['Công An Hà Nội', 'Alexandre Polking'],
  ['Hà Nội FC', 'Harry Kewell'],
  ['LPBank Hoàng Anh Gia Lai', 'Lê Quang Trãi'],
]);

const REQUIRED_APPROVED_TEAMS = 10;
const DEFAULT_SEASON_NAME = 'V.League 2024-2025';
const LEGACY_SEASON_NAME = 'V.League 2024-25';
const INVITATION_REGULATION_KEYS = [
  'MIN_ROSTER',
  'MAX_ROSTER',
  'MAX_FOREIGN_PLAYERS',
  'MAX_FOREIGN_PLAYERS_ON_FIELD',
  'MIN_STADIUM_CAPACITY',
  'MIN_STADIUM_FIFA_STARS',
  'PARTICIPATION_FEE_VND',
];
const DEMO_LINEUP_FORMATION = '4-4-2';
const RESULT_SEED_ROUNDS = 10;
const DEMO_STARTER_SHAPE: { position: PlayerPosition; count: number }[] = [
  { position: PlayerPosition.GK, count: 1 },
  { position: PlayerPosition.DF, count: 4 },
  { position: PlayerPosition.MF, count: 4 },
  { position: PlayerPosition.FW, count: 2 },
];

type DemoRosterRow = {
  playerId: string;
  jerseyNumber: number | null;
  player: { position: PlayerPosition };
};

type DemoMatch = {
  id: string;
  roundNo: number;
  homeTeamId: string;
  awayTeamId: string;
};

function slugTeamName(name: string) {
  return name
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');
}

function getManagerEmail(teamName: string) {
  return `manager.${slugTeamName(teamName)}@demo.local`;
}

async function seedCoreDemoUsersAndOfficialAssignments(
  seasonId: string,
  passwordHash: string,
) {
  console.log('\n🧑‍⚖️ Seeding admin/referee/supervisor demo accounts...');

  for (const user of CORE_DEMO_USERS) {
    const role = await prisma.role.upsert({
      where: { name: user.role },
      update: {},
      create: { name: user.role },
    });

    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        role: user.role,
        roleId: role.id,
        passwordHash,
        emailVerified: true,
        name: user.name,
      },
      create: {
        email: user.email,
        role: user.role,
        roleId: role.id,
        passwordHash,
        emailVerified: true,
        name: user.name,
      },
    });
  }
  console.log(`  ✅ ${CORE_DEMO_USERS.length} core demo accounts upserted.`);

  const seasonMatches = await prisma.match.findMany({
    where: { seasonId },
    select: { id: true },
  });

  for (const officialData of DEMO_OFFICIALS) {
    const existingOfficial = await prisma.official.findFirst({
      where: { email: { equals: officialData.email, mode: 'insensitive' } },
      orderBy: { createdAt: 'asc' },
    });
    const official = existingOfficial
      ? await prisma.official.update({
          where: { id: existingOfficial.id },
          data: {
            fullName: officialData.fullName,
            email: officialData.email,
            status: OfficialStatus.ACTIVE,
          },
        })
      : await prisma.official.create({
          data: {
            fullName: officialData.fullName,
            email: officialData.email,
            status: OfficialStatus.ACTIVE,
          },
        });

    for (const match of seasonMatches) {
      await prisma.matchOfficialAssignment.upsert({
        where: {
          matchId_officialId_role: {
            matchId: match.id,
            officialId: official.id,
            role: officialData.role,
          },
        },
        create: {
          matchId: match.id,
          officialId: official.id,
          role: officialData.role,
          note: officialData.note,
        },
        update: { note: officialData.note },
      });
    }
  }

  console.log(
    `  ✅ Demo referee/supervisor assigned to ${seasonMatches.length} matches.`,
  );
}

function getInvitationSource(index: number) {
  if (index < 8) return TeamInvitationSourceType.PREVIOUS_TOP_8;
  if (index < REQUIRED_APPROVED_TEAMS) return TeamInvitationSourceType.PROMOTED;
  return TeamInvitationSourceType.REPLACEMENT;
}

function randomInt(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function pickRandom<T>(items: T[]) {
  if (items.length === 0) return undefined;
  return items[randomInt(0, items.length - 1)];
}

function randomGoalMinute(goalIndex: number) {
  return Math.min(90, randomInt(4, 38) + goalIndex * randomInt(8, 17));
}

function randomCardMinute() {
  return randomInt(18, 90);
}

function takeRosterRows(
  rows: DemoRosterRow[],
  selectedIds: Set<string>,
  position: PlayerPosition,
  count: number,
) {
  const picked = rows
    .filter(
      (row) =>
        row.player.position === position && !selectedIds.has(row.playerId),
    )
    .slice(0, count);
  picked.forEach((row) => selectedIds.add(row.playerId));
  return picked;
}

function buildDemoLineupRows(rosterRows: DemoRosterRow[]) {
  const selectedIds = new Set<string>();
  const starters = DEMO_STARTER_SHAPE.flatMap((shape) =>
    takeRosterRows(rosterRows, selectedIds, shape.position, shape.count),
  );

  if (starters.length < 11) {
    const filler = rosterRows
      .filter((row) => !selectedIds.has(row.playerId))
      .slice(0, 11 - starters.length);
    filler.forEach((row) => selectedIds.add(row.playerId));
    starters.push(...filler);
  }

  const substitutes = rosterRows
    .filter((row) => !selectedIds.has(row.playerId))
    .slice(0, 5);

  return [
    ...starters.map((row) => ({
      playerId: row.playerId,
      role: MatchLineupRole.STARTER,
      position: row.player.position,
      shirtNumber: row.jerseyNumber,
    })),
    ...substitutes.map((row) => ({
      playerId: row.playerId,
      role: MatchLineupRole.SUBSTITUTE,
      position: row.player.position,
      shirtNumber: row.jerseyNumber,
    })),
  ];
}

async function createGoalEvents(
  match: DemoMatch,
  teamId: string,
  goalCount: number,
) {
  if (goalCount <= 0) return;

  const players = await prisma.teamPlayer.findMany({
    where: { teamId, leftAt: null },
    take: 18,
  });

  if (players.length === 0) {
    console.warn(
      `  ⚠️ Skipping goal events for match ${match.id}: team ${teamId} has no active players.`,
    );
    return;
  }

  for (let index = 0; index < goalCount; index++) {
    const scorer = pickRandom(players);
    if (!scorer) continue;

    await prisma.matchEvent.create({
      data: {
        matchId: match.id,
        teamId,
        playerId: scorer.playerId,
        type: EventType.GOAL,
        minute: randomGoalMinute(index),
      },
    });
  }
}

async function createCardEvents(match: DemoMatch, teamId: string) {
  const players = await prisma.teamPlayer.findMany({
    where: { teamId, leftAt: null },
    include: { player: { select: { position: true } } },
    take: 18,
  });

  const cardCandidates = players.filter(
    (row) => row.player.position !== PlayerPosition.GK,
  );
  const pool = cardCandidates.length > 0 ? cardCandidates : players;
  if (pool.length === 0) return;

  const usedPlayerIds = new Set<string>();
  const takeCardPlayer = () => {
    const available = pool.filter((row) => !usedPlayerIds.has(row.playerId));
    const selected = pickRandom(available.length > 0 ? available : pool);
    if (selected) usedPlayerIds.add(selected.playerId);
    return selected;
  };

  const yellowCards = randomInt(0, 4);
  const redCards = Math.random() < 0.18 ? 1 : 0;

  for (let index = 0; index < yellowCards; index++) {
    const player = takeCardPlayer();
    if (!player) continue;

    await prisma.matchEvent.create({
      data: {
        matchId: match.id,
        teamId,
        playerId: player.playerId,
        type: EventType.YELLOW_CARD,
        minute: randomCardMinute(),
      },
    });
  }

  for (let index = 0; index < redCards; index++) {
    const player = takeCardPlayer();
    if (!player) continue;

    await prisma.matchEvent.create({
      data: {
        matchId: match.id,
        teamId,
        playerId: player.playerId,
        type: EventType.RED_CARD,
        minute: randomCardMinute(),
      },
    });
  }
}

async function seedRandomResult(match: DemoMatch) {
  const homeScore = randomInt(0, 4);
  const awayScore = randomInt(0, 4);

  await prisma.match.update({
    where: { id: match.id },
    data: {
      homeScore,
      awayScore,
      status: MatchStatus.FINISHED,
    },
  });

  await createGoalEvents(match, match.homeTeamId, homeScore);
  await createGoalEvents(match, match.awayTeamId, awayScore);
  await createCardEvents(match, match.homeTeamId);
  await createCardEvents(match, match.awayTeamId);
}

async function seedDemoLineupsAndSuspensions(
  seasonId: string,
  round1Matches: DemoMatch[],
) {
  const sourceMatch = round1Matches[0];
  if (!sourceMatch) {
    console.warn('  ⚠️ Skipping demo suspension: no Round 1 match found.');
    return;
  }

  const suspendedTeamId = sourceMatch.homeTeamId;
  const cardCandidates = await prisma.teamPlayer.findMany({
    where: { teamId: suspendedTeamId, leftAt: null },
    include: {
      player: { select: { fullName: true, position: true } },
    },
    orderBy: [{ jerseyNumber: 'asc' }, { joinedAt: 'asc' }],
    take: 16,
  });
  const suspendedPlayer =
    cardCandidates.find((row) => row.player.position !== PlayerPosition.GK) ??
    cardCandidates[0];

  if (!suspendedPlayer) {
    console.warn(
      '  ⚠️ Skipping demo suspension: selected team has no active players.',
    );
    return;
  }

  const nextMatch = await prisma.match.findFirst({
    where: {
      seasonId,
      roundNo: { gt: sourceMatch.roundNo },
      status: { not: MatchStatus.FINISHED },
      OR: [{ homeTeamId: suspendedTeamId }, { awayTeamId: suspendedTeamId }],
    },
    orderBy: [{ roundNo: 'asc' }, { kickoffAt: 'asc' }],
  });

  if (!nextMatch) {
    console.warn('  ⚠️ Skipping demo suspension: no next match found.');
    return;
  }

  await prisma.match.update({
    where: { id: nextMatch.id },
    data: { status: MatchStatus.PUBLISHED },
  });

  await prisma.matchEvent.create({
    data: {
      matchId: sourceMatch.id,
      teamId: suspendedTeamId,
      playerId: suspendedPlayer.playerId,
      type: EventType.RED_CARD,
      minute: 88,
      note: 'Demo treo giò vòng kế tiếp',
    },
  });

  const existingDemoSuspension = await prisma.playerSuspension.findFirst({
    where: {
      playerId: suspendedPlayer.playerId,
      sourceMatchId: sourceMatch.id,
      effectiveMatchId: nextMatch.id,
      reason: 'RED_CARD',
    },
    select: { id: true },
  });

  if (existingDemoSuspension) {
    await prisma.playerSuspension.update({
      where: { id: existingDemoSuspension.id },
      data: {
        status: PlayerSuspensionStatus.ACTIVE,
        servedAt: null,
      },
    });
  } else {
    await prisma.playerSuspension.create({
      data: {
        playerId: suspendedPlayer.playerId,
        teamId: suspendedTeamId,
        seasonId,
        sourceMatchId: sourceMatch.id,
        effectiveMatchId: nextMatch.id,
        reason: 'RED_CARD',
        status: PlayerSuspensionStatus.ACTIVE,
      },
    });
  }

  for (const teamId of [nextMatch.homeTeamId, nextMatch.awayTeamId]) {
    const rosterRows = await prisma.teamPlayer.findMany({
      where: {
        teamId,
        leftAt: null,
        ...(teamId === suspendedTeamId
          ? { playerId: { not: suspendedPlayer.playerId } }
          : {}),
      },
      include: {
        player: { select: { position: true } },
      },
      orderBy: [{ jerseyNumber: 'asc' }, { joinedAt: 'asc' }],
    });
    const lineupPlayers = buildDemoLineupRows(rosterRows);

    if (lineupPlayers.length !== 16) {
      console.warn(
        `  ⚠️ Skipping demo lineup for team ${teamId}: only ${lineupPlayers.length}/16 eligible players.`,
      );
      continue;
    }

    await prisma.matchTeamRegistration.upsert({
      where: { matchId_teamId: { matchId: nextMatch.id, teamId } },
      create: {
        matchId: nextMatch.id,
        teamId,
        kitType:
          teamId === nextMatch.homeTeamId
            ? MatchKitType.PRIMARY
            : MatchKitType.BACKUP,
        formation: DEMO_LINEUP_FORMATION,
        status: MatchLineupStatus.APPROVED,
        submittedAt: new Date(),
        reviewedAt: new Date(),
        lineupPlayers: { create: lineupPlayers },
      },
      update: {
        kitType:
          teamId === nextMatch.homeTeamId
            ? MatchKitType.PRIMARY
            : MatchKitType.BACKUP,
        formation: DEMO_LINEUP_FORMATION,
        status: MatchLineupStatus.APPROVED,
        submittedAt: new Date(),
        reviewedAt: new Date(),
        reviewNote: null,
        lineupPlayers: {
          deleteMany: {},
          create: lineupPlayers,
        },
      },
    });
  }

  console.log(
    `✅ Seeded demo lineups and suspension for round ${nextMatch.roundNo}. Suspended: ${suspendedPlayer.player.fullName}.`,
  );
}

async function main() {
  console.log(`🏆 Setting up ${DEFAULT_SEASON_NAME} Season...\n`);

  // 1. Create Season
  let season = await prisma.season.findUnique({
    where: { name: DEFAULT_SEASON_NAME },
  });
  const legacySeason = season
    ? null
    : await prisma.season.findUnique({ where: { name: LEGACY_SEASON_NAME } });
  const existingSeason = season ?? legacySeason;
  if (existingSeason) {
    season = await prisma.season.update({
      where: { id: existingSeason.id },
      data: {
        name: DEFAULT_SEASON_NAME,
        year: 2024,
        startDate: new Date('2024-09-14'),
        endDate: new Date('2025-06-21'),
        status: SeasonStatus.IN_PROGRESS,
      },
    });
  } else {
    season = await prisma.season.create({
      data: {
        name: DEFAULT_SEASON_NAME,
        year: 2024,
        startDate: new Date('2024-09-14'),
        endDate: new Date('2025-06-21'),
        status: SeasonStatus.IN_PROGRESS,
      },
    });
  }
  console.log(`✅ Season: ${season.name} (ID: ${season.id})`);

  // 1.5 Seed Regulations for this season
  console.log('📏 Seeding regulations...');
  const defaultRegulations = [
    { key: 'MIN_AGE', value: '16', valueType: 'number' },
    { key: 'MAX_AGE', value: '40', valueType: 'number' },
    { key: 'MIN_ROSTER', value: '16', valueType: 'number' },
    { key: 'MAX_ROSTER', value: '22', valueType: 'number' },
    { key: 'MAX_FOREIGN_PLAYERS', value: '5', valueType: 'number' },
    { key: 'MAX_FOREIGN_PLAYERS_ON_FIELD', value: '3', valueType: 'number' },
    { key: 'MIN_STADIUM_CAPACITY', value: '10000', valueType: 'number' },
    { key: 'MIN_STADIUM_FIFA_STARS', value: '2', valueType: 'number' },
    { key: 'PARTICIPATION_FEE_VND', value: '1000000000', valueType: 'number' },
    { key: 'WIN_POINTS', value: '3', valueType: 'number' },
    { key: 'DRAW_POINTS', value: '1', valueType: 'number' },
    { key: 'LOSS_POINTS', value: '0', valueType: 'number' },
    { key: 'MAX_GOAL_TIME', value: '96', valueType: 'number' },
  ];

  for (const reg of defaultRegulations) {
    await prisma.regulation.upsert({
      where: { seasonId_key: { seasonId: season.id, key: reg.key } },
      update: { value: reg.value, valueType: reg.valueType },
      create: {
        seasonId: season.id,
        key: reg.key,
        value: reg.value,
        valueType: reg.valueType,
      },
    });
  }
  console.log(`  ✅ ${defaultRegulations.length} regulations upserted.`);

  // 2. Register and Approve Teams
  const teams = await prisma.team.findMany({
    where: { name: { in: REAL_TEAMS } },
  });

  if (teams.length < 14) {
    throw new Error(
      `Only found ${teams.length}/14 real teams. Run seed-stadiums.ts, seed-teams.ts, and seed-players.ts before setup-vleague-2024.ts.`,
    );
  }

  const teamOrder = new Map(REAL_TEAMS.map((name, index) => [name, index]));
  teams.sort(
    (a, b) =>
      (teamOrder.get(a.name) ?? Number.MAX_SAFE_INTEGER) -
      (teamOrder.get(b.name) ?? Number.MAX_SAFE_INTEGER),
  );

  console.log('\n🧢 Seeding team coach names...');
  for (const team of teams) {
    const coachName = REAL_TEAM_COACHES.get(team.name);
    if (!coachName) continue;

    await prisma.team.update({
      where: { id: team.id },
      data: { coachName },
    });
    console.log(`  ✅ ${team.name}: ${coachName}`);
  }

  // 2.1 Seed manager accounts and assignments for invitation popup demo
  console.log('\n👤 Seeding team manager demo accounts...');
  const teamManagerRole = await prisma.role.upsert({
    where: { name: 'TEAM_MANAGER' },
    update: { description: 'Quản lý đội bóng' },
    create: { name: 'TEAM_MANAGER', description: 'Quản lý đội bóng' },
  });
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  for (const team of teams) {
    const email = getManagerEmail(team.name);
    const manager = await prisma.user.upsert({
      where: { email },
      update: {
        role: UserRole.TEAM_MANAGER,
        roleId: teamManagerRole.id,
        managedTeamId: team.id,
        passwordHash,
        emailVerified: true,
        name: `Manager ${team.shortName ?? team.name}`,
      },
      create: {
        email,
        role: UserRole.TEAM_MANAGER,
        roleId: teamManagerRole.id,
        managedTeamId: team.id,
        passwordHash,
        emailVerified: true,
        name: `Manager ${team.shortName ?? team.name}`,
      },
    });

    await prisma.teamManagerAssignment.upsert({
      where: {
        userId_seasonId: { userId: manager.id, seasonId: season.id },
      },
      update: { teamId: team.id },
      create: {
        userId: manager.id,
        seasonId: season.id,
        teamId: team.id,
      },
    });
    console.log(`  ✅ ${team.name}: ${email}`);
  }

  const approvedTeams = teams.slice(0, REQUIRED_APPROVED_TEAMS);
  const reserveTeams = teams.slice(REQUIRED_APPROVED_TEAMS);

  for (const team of approvedTeams) {
    await prisma.seasonTeam.upsert({
      where: { seasonId_teamId: { seasonId: season.id, teamId: team.id } },
      update: {
        status: SeasonTeamStatus.APPROVED,
        approvedAt: new Date(),
        ownerName: `Công ty chủ quản ${team.name}`,
        ownerCountry: 'Việt Nam',
        ownerAddress: team.city ?? 'Việt Nam',
        teamIntroduction: `${team.name} đăng ký tham dự V.League 2024-2025.`,
        primaryKit: 'Áo màu chính thức theo nhận diện CLB',
        backupKit: 'Áo dự bị màu tương phản',
        participationFeePaid: true,
        feePaidAt: new Date(),
        feeReceiptCode: `FEE-${slugTeamName(team.name).toUpperCase()}`,
        externalCompetitionSchedule: 'Cúp Quốc gia 2024-2025',
        applicationSubmittedAt: new Date(),
        applicationReviewNote: null,
      },
      create: {
        seasonId: season.id,
        teamId: team.id,
        status: SeasonTeamStatus.APPROVED,
        approvedAt: new Date(),
        ownerName: `Công ty chủ quản ${team.name}`,
        ownerCountry: 'Việt Nam',
        ownerAddress: team.city ?? 'Việt Nam',
        teamIntroduction: `${team.name} đăng ký tham dự V.League 2024-2025.`,
        primaryKit: 'Áo màu chính thức theo nhận diện CLB',
        backupKit: 'Áo dự bị màu tương phản',
        participationFeePaid: true,
        feePaidAt: new Date(),
        feeReceiptCode: `FEE-${slugTeamName(team.name).toUpperCase()}`,
        externalCompetitionSchedule: 'Cúp Quốc gia 2024-2025',
        applicationSubmittedAt: new Date(),
      },
    });
    console.log(`  ✅ Registered & Approved: ${team.name}`);
  }

  for (const team of reserveTeams) {
    await prisma.seasonTeam.upsert({
      where: { seasonId_teamId: { seasonId: season.id, teamId: team.id } },
      update: {
        status: SeasonTeamStatus.REGISTERED,
        approvedAt: null,
        participationFeePaid: false,
        feePaidAt: null,
        applicationSubmittedAt: null,
        applicationReviewNote: null,
      },
      create: {
        seasonId: season.id,
        teamId: team.id,
        status: SeasonTeamStatus.REGISTERED,
      },
    });
    console.log(`  🕒 Reserve/registered only: ${team.name}`);
  }

  console.log('\n🏅 Seeding promotion ranking snapshot...');
  const promotedSnapshot = [
    {
      team: teams[8],
      rank: 1,
      qualificationType: PromotionQualificationType.CHAMPION,
      status: PromotionCandidateStatus.ACCEPTED,
      note: 'Vô địch V.League 2 2024',
    },
    {
      team: teams[9],
      rank: 2,
      qualificationType: PromotionQualificationType.RUNNER_UP,
      status: PromotionCandidateStatus.ACCEPTED,
      note: 'Á quân V.League 2 2024',
    },
  ];

  for (const entry of promotedSnapshot) {
    if (!entry.team) continue;
    await prisma.promotionCandidate.upsert({
      where: {
        seasonId_teamId: {
          seasonId: season.id,
          teamId: entry.team.id,
        },
      },
      update: {
        rank: entry.rank,
        sourceCompetition: 'V.League 2 2024',
        qualificationType: entry.qualificationType,
        status: entry.status,
        note: entry.note,
      },
      create: {
        seasonId: season.id,
        teamId: entry.team.id,
        rank: entry.rank,
        sourceCompetition: 'V.League 2 2024',
        qualificationType: entry.qualificationType,
        status: entry.status,
        note: entry.note,
      },
    });
    console.log(`  ✅ #${entry.rank} ${entry.team.name}: ${entry.note}`);
  }

  // 2.2 Seed invitations: approved teams are treated as accepted; reserve teams stay pending
  console.log('\n📨 Seeding team invitations and popup notifications...');
  const invitationSnapshot = Object.fromEntries(
    defaultRegulations
      .filter((reg) => INVITATION_REGULATION_KEYS.includes(reg.key))
      .map((reg) => [reg.key, reg.value]),
  );
  const sentAt = new Date();
  const deadlineAt = new Date(sentAt);
  deadlineAt.setDate(deadlineAt.getDate() + 14);

  for (const [index, team] of teams.entries()) {
    const isApprovedTeam = index < REQUIRED_APPROVED_TEAMS;
    const status = isApprovedTeam
      ? TeamInvitationStatus.ACCEPTED
      : TeamInvitationStatus.SENT;
    const sourceType = getInvitationSource(index);
    const promotionNote =
      sourceType === TeamInvitationSourceType.PROMOTED
        ? index === 8
          ? 'Vô địch V.League 2 2024'
          : 'Á quân V.League 2 2024'
        : null;
    const invitation = await prisma.teamInvitation.upsert({
      where: { seasonId_teamId: { seasonId: season.id, teamId: team.id } },
      update: {
        sourceType,
        status,
        sentAt,
        deadlineAt,
        responseAt: isApprovedTeam ? sentAt : null,
        responseReason: null,
        regulationsSnapshot: invitationSnapshot,
        promotionNote,
      },
      create: {
        seasonId: season.id,
        teamId: team.id,
        sourceType,
        status,
        sentAt,
        deadlineAt,
        responseAt: isApprovedTeam ? sentAt : null,
        regulationsSnapshot: invitationSnapshot,
        promotionNote,
      },
    });

    if (status === TeamInvitationStatus.SENT) {
      const managerAssignment = await prisma.teamManagerAssignment.findFirst({
        where: { seasonId: season.id, teamId: team.id },
      });
      if (managerAssignment) {
        const existingNotification = await prisma.notification.findFirst({
          where: {
            userId: managerAssignment.userId,
            entityType: 'team_invitation',
            entityId: invitation.id,
          },
        });
        if (!existingNotification) {
          await prisma.notification.create({
            data: {
              userId: managerAssignment.userId,
              title: `Lời mời tham dự ${season.name}`,
              message: `BTC mời ${team.name} tham dự ${season.name}. Hạn phản hồi: 14 ngày sau ngày gửi. Lệ phí tham dự: 1.000.000.000 VND.`,
              type: 'TEAM_INVITATION',
              entityType: 'team_invitation',
              entityId: invitation.id,
            },
          });
        }
      }
    }

    console.log(
      `  ${status === TeamInvitationStatus.SENT ? '📩' : '✅'} ${team.name}: ${status}`,
    );
  }

  // 3. Generate Schedule (Round Robin)
  console.log('\n📅 Generating Round Robin Schedule (18 Rounds)...');

  // Clean up existing matches for this season if any
  const matchCount = await prisma.match.count({
    where: { seasonId: season.id },
  });
  if (matchCount > 0) {
    console.log(`  🗑️ Removing ${matchCount} existing matches...`);
    await prisma.match.deleteMany({ where: { seasonId: season.id } });
  }

  const teamIds = approvedTeams.map((t) => t.id);
  const n = teamIds.length;
  if (n % 2 !== 0) {
    console.error(
      '❌ Team count must be even for round-robin (add a bye if needed)',
    );
    return;
  }

  const rounds = n - 1;
  const matchesPerRound = n / 2;

  // Circle method for round-robin
  const circle = [...teamIds];
  const fixed = circle.shift()!;

  const matches: any[] = [];

  // Leg 1 (Rounds 1-13)
  for (let r = 0; r < rounds; r++) {
    const roundNo = r + 1;

    // Fixed team vs circle[0]
    matches.push({
      seasonId: season.id,
      roundNo,
      leg: 1,
      homeTeamId: r % 2 === 0 ? fixed : circle[0],
      awayTeamId: r % 2 === 0 ? circle[0] : fixed,
      status: MatchStatus.PUBLISHED,
      kickoffAt: new Date(
        (season.startDate?.getTime() ?? Date.now()) +
          r * 7 * 24 * 60 * 60 * 1000,
      ),
    });

    for (let i = 1; i < matchesPerRound; i++) {
      const home = circle[i];
      const away = circle[n - 1 - i];
      matches.push({
        seasonId: season.id,
        roundNo,
        leg: 1,
        homeTeamId: r % 2 === 0 ? home : away,
        awayTeamId: r % 2 === 0 ? away : home,
        status: MatchStatus.PUBLISHED,
        kickoffAt: new Date(
          (season.startDate?.getTime() ?? Date.now()) +
            r * 7 * 24 * 60 * 60 * 1000,
        ),
      });
    }

    // Rotate circle
    circle.push(circle.shift()!);
  }

  // Leg 2 (Rounds 14-26) - Swap home/away
  const leg1Matches = [...matches];
  for (const m of leg1Matches) {
    matches.push({
      ...m,
      roundNo: m.roundNo + rounds,
      leg: 2,
      homeTeamId: m.awayTeamId,
      awayTeamId: m.homeTeamId,
      kickoffAt: new Date(
        (m.kickoffAt?.getTime() ?? Date.now()) +
          rounds * 7 * 24 * 60 * 60 * 1000,
      ),
    });
  }

  // Bulk insert matches
  // Prisma createMany is faster
  await prisma.match.createMany({ data: matches });
  console.log(`✅ Generated ${matches.length} matches.`);

  // 4. Seed random results and discipline events for the first 10 rounds.
  console.log(
    `\n⚽ Seeding random results for ${RESULT_SEED_ROUNDS} rounds...`,
  );
  const resultSeedMatches = await prisma.match.findMany({
    where: {
      seasonId: season.id,
      roundNo: { lte: RESULT_SEED_ROUNDS },
    },
    orderBy: [{ roundNo: 'asc' }, { kickoffAt: 'asc' }],
  });

  for (const match of resultSeedMatches) {
    await seedRandomResult(match);
  }
  console.log(
    `✅ Seeded ${resultSeedMatches.length} matches with random scores, goals, and cards.`,
  );

  const round1Matches = resultSeedMatches.filter(
    (match) => match.roundNo === 1,
  );
  await seedDemoLineupsAndSuspensions(season.id, round1Matches);
  await seedCoreDemoUsersAndOfficialAssignments(season.id, passwordHash);

  console.log(`\n🚀 ${DEFAULT_SEASON_NAME} Setup Complete!`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 Team manager demo accounts use password:', DEMO_PASSWORD);
  console.log(
    `   Example pending invitation account: ${getManagerEmail(reserveTeams[0]?.name ?? teams[0].name)}`,
  );
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await prisma.$disconnect();
  await pool.end();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  await pool.end();
  process.exit(1);
});

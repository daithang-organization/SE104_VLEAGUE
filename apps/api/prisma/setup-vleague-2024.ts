import { PrismaPg } from '@prisma/adapter-pg';
import {
  EventType,
  MatchKitType,
  MatchLineupRole,
  MatchLineupStatus,
  MatchStatus,
  PlayerPosition,
  PlayerSuspensionStatus,
  PrismaClient,
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

function getInvitationSource(index: number) {
  if (index < 8) return TeamInvitationSourceType.PREVIOUS_TOP_8;
  if (index < REQUIRED_APPROVED_TEAMS) return TeamInvitationSourceType.PROMOTED;
  return TeamInvitationSourceType.REPLACEMENT;
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

  await prisma.playerSuspension.upsert({
    where: {
      playerId_sourceMatchId_reason: {
        playerId: suspendedPlayer.playerId,
        sourceMatchId: sourceMatch.id,
        reason: 'RED_CARD',
      },
    },
    create: {
      playerId: suspendedPlayer.playerId,
      teamId: suspendedTeamId,
      seasonId,
      sourceMatchId: sourceMatch.id,
      effectiveMatchId: nextMatch.id,
      reason: 'RED_CARD',
      status: PlayerSuspensionStatus.ACTIVE,
    },
    update: {
      effectiveMatchId: nextMatch.id,
      status: PlayerSuspensionStatus.ACTIVE,
      servedAt: null,
    },
  });

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

  // 4. Seed some results for Round 1
  console.log('\n⚽ Seeding results for Round 1...');
  const round1Matches = await prisma.match.findMany({
    where: { seasonId: season.id, roundNo: 1 },
  });

  for (const m of round1Matches) {
    const homeScore = Math.floor(Math.random() * 4);
    const awayScore = Math.floor(Math.random() * 3);

    await prisma.match.update({
      where: { id: m.id },
      data: {
        homeScore,
        awayScore,
        status: MatchStatus.FINISHED,
      },
    });

    // Seed some goals
    const totalGoals = homeScore + awayScore;
    if (totalGoals > 0) {
      const homePlayers = await prisma.teamPlayer.findMany({
        where: { teamId: m.homeTeamId, leftAt: null },
        take: 5,
      });
      const awayPlayers = await prisma.teamPlayer.findMany({
        where: { teamId: m.awayTeamId, leftAt: null },
        take: 5,
      });

      for (let i = 0; i < homeScore; i++) {
        const p = homePlayers[Math.floor(Math.random() * homePlayers.length)];
        if (!p) {
          console.warn(
            `  ⚠️ Skipping home goal event for match ${m.id}: no active players in roster`,
          );
          continue;
        }
        await prisma.matchEvent.create({
          data: {
            matchId: m.id,
            teamId: m.homeTeamId,
            playerId: p.playerId,
            type: 'GOAL',
            minute: 10 + i * 20,
          },
        });
      }
      for (let i = 0; i < awayScore; i++) {
        const p = awayPlayers[Math.floor(Math.random() * awayPlayers.length)];
        if (!p) {
          console.warn(
            `  ⚠️ Skipping away goal event for match ${m.id}: no active players in roster`,
          );
          continue;
        }
        await prisma.matchEvent.create({
          data: {
            matchId: m.id,
            teamId: m.awayTeamId,
            playerId: p.playerId,
            type: 'GOAL',
            minute: 15 + i * 25,
          },
        });
      }
    }
  }
  console.log('✅ Seeded Round 1 results and goals.');

  await seedDemoLineupsAndSuspensions(season.id, round1Matches);

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

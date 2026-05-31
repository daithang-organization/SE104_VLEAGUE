import { PrismaPg } from '@prisma/adapter-pg';
import {
  MatchOfficialRole,
  MatchStatus,
  OfficialStatus,
  PlayerPosition,
  PlayerType,
  PrismaClient,
  SeasonStatus,
  SeasonTeamStatus,
  TeamStatus,
  UserRole,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env['DATABASE_URL'] });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEMO_PASSWORD = 'Demo@12345';

// Định nghĩa roles để seed vào bảng Role
const roles = [
  { name: 'ADMIN', description: 'Quản trị viên hệ thống' },
  { name: 'TEAM_MANAGER', description: 'Quản lý đội bóng' },
  { name: 'REFEREE', description: 'Trọng tài' },
  { name: 'SUPERVISOR', description: 'Giám sát viên' },
  { name: 'PUBLIC', description: 'Người dùng công khai' },
] as const;

// Demo users cho từng vai trò
const demoUsers = [
  { email: 'admin@demo.local', role: UserRole.ADMIN },
  { email: 'teammanager@demo.local', role: UserRole.TEAM_MANAGER },
  { email: 'referee@demo.local', role: UserRole.REFEREE },
  { email: 'supervisor@demo.local', role: UserRole.SUPERVISOR },
  { email: 'public@demo.local', role: UserRole.PUBLIC },
] as const;

const demoOfficials = [
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

// Teams demo
const teams = [
  { name: 'Hà Nội FC', status: TeamStatus.ACTIVE },
  { name: 'TP.HCM FC', status: TeamStatus.ACTIVE },
] as const;

// Players demo
const playersData = [
  {
    fullName: 'Nguyễn Văn A',
    dob: new Date('2000-01-10'),
    nationality: 'Vietnam',
    position: PlayerPosition.MF,
    playerType: PlayerType.DOMESTIC,
  },
  {
    fullName: 'Trần Văn B',
    dob: new Date('1999-03-22'),
    nationality: 'Vietnam',
    position: PlayerPosition.DF,
    playerType: PlayerType.DOMESTIC,
  },
  {
    fullName: 'Lê Văn C',
    dob: new Date('2001-07-05'),
    nationality: 'Vietnam',
    position: PlayerPosition.FW,
    playerType: PlayerType.DOMESTIC,
  },
  {
    fullName: 'Phạm Văn D',
    dob: new Date('1998-11-12'),
    nationality: 'Vietnam',
    position: PlayerPosition.GK,
    playerType: PlayerType.DOMESTIC,
  },
  {
    fullName: 'Hoàng Văn E',
    dob: new Date('2002-02-18'),
    nationality: 'Vietnam',
    position: PlayerPosition.MF,
    playerType: PlayerType.DOMESTIC,
  },
  {
    fullName: 'Võ Văn F',
    dob: new Date('2000-08-09'),
    nationality: 'Vietnam',
    position: PlayerPosition.DF,
    playerType: PlayerType.DOMESTIC,
  },
  {
    fullName: 'Đặng Văn G',
    dob: new Date('1999-12-01'),
    nationality: 'Vietnam',
    position: PlayerPosition.FW,
    playerType: PlayerType.DOMESTIC,
  },
  {
    fullName: 'Bùi Văn H',
    dob: new Date('2001-04-14'),
    nationality: 'Vietnam',
    position: PlayerPosition.MF,
    playerType: PlayerType.DOMESTIC,
  },
  {
    fullName: 'Đỗ Văn I',
    dob: new Date('1997-06-30'),
    nationality: 'Vietnam',
    position: PlayerPosition.DF,
    playerType: PlayerType.DOMESTIC,
  },
  {
    fullName: 'Ngô Văn K',
    dob: new Date('2003-09-21'),
    nationality: 'Vietnam',
    position: PlayerPosition.FW,
    playerType: PlayerType.DOMESTIC,
  },
];

// Tham số quy định mặc định cho mùa giải (QĐ1–QĐ6)
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
  { key: 'MAX_GOAL_TIME', value: '96', valueType: 'number' },
  { key: 'WIN_POINTS', value: '3', valueType: 'number' },
  { key: 'DRAW_POINTS', value: '1', valueType: 'number' },
  { key: 'LOSS_POINTS', value: '0', valueType: 'number' },
  {
    key: 'RANK_TIEBREAK_ORDER_FINAL',
    value: '["points","goal_diff","head_to_head","draw_lot"]',
    valueType: 'json',
  },
  { key: 'TOTAL_LEGS', value: '2', valueType: 'number' },
  { key: 'ROUNDS_PER_SEASON', value: '18', valueType: 'number' },
  { key: 'MATCHES_PER_ROUND', value: '5', valueType: 'number' },
];

const defaultSeasonData = {
  name: 'V.League 2024-2025',
  year: 2024,
  status: SeasonStatus.IN_PROGRESS,
  startDate: new Date('2024-09-14'),
  endDate: new Date('2025-06-30'),
} as const;

async function main() {
  console.log('🌱 Starting idempotent seed...');

  // 1) Upsert roles (idempotent)
  console.log('📋 Seeding roles...');
  for (const r of roles) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: { name: r.name, description: r.description },
    });
  }
  console.log(`   ✓ ${roles.length} roles upserted`);

  // 2) Upsert demo users (idempotent by email)
  console.log('👥 Seeding demo users...');
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  for (const u of demoUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        role: u.role,
        emailVerified: true,
      },
      create: {
        email: u.email,
        role: u.role,
        passwordHash,
        emailVerified: true,
      },
    });
  }
  console.log(`   ✓ ${demoUsers.length} demo users upserted`);

  // 3) Upsert teams (idempotent by name)
  console.log('🏟️  Seeding teams...');
  for (const t of teams) {
    await prisma.team.upsert({
      where: { name: t.name },
      update: { status: t.status },
      create: { name: t.name, status: t.status },
    });
  }
  console.log(`   ✓ ${teams.length} teams upserted`);

  const defaultManagedTeam = await prisma.team.findFirst({
    where: { name: 'Hà Nội FC' },
  });
  if (defaultManagedTeam) {
    await prisma.user.updateMany({
      where: { email: 'teammanager@demo.local', role: UserRole.TEAM_MANAGER },
      data: { managedTeamId: defaultManagedTeam.id },
    });
    console.log(
      `   ✓ teammanager@demo.local linked to ${defaultManagedTeam.name}`,
    );
  }

  // 4) Seed players nếu chưa có (không có unique field nên check count)
  console.log('⚽ Seeding players...');
  const existingPlayersCount = await prisma.player.count();
  if (existingPlayersCount === 0) {
    await prisma.player.createMany({ data: playersData });
    console.log(`   ✓ ${playersData.length} players created`);
  } else {
    console.log(
      `   ⏭️  Skipped (${existingPlayersCount} players already exist)`,
    );
  }

  // 5) Seed season nếu chưa có
  console.log('📅 Seeding season...');
  let season = await prisma.season.findUnique({
    where: { name: defaultSeasonData.name },
  });
  const legacySeason = season
    ? null
    : ((await prisma.season.findUnique({
        where: { name: 'VLeague 2024-2025' },
      })) ??
      (await prisma.season.findUnique({ where: { name: 'VLeague 2024' } })));
  const activeSeason =
    season || legacySeason
      ? null
      : await prisma.season.findFirst({
          where: { status: SeasonStatus.IN_PROGRESS },
        });
  season = season ?? legacySeason ?? activeSeason;
  if (!season) {
    season = await prisma.season.findUnique({
      where: { name: 'VLeague 2024' },
    });
  }
  if (!season) {
    season = await prisma.season.create({
      data: defaultSeasonData,
    });
    console.log('   ✓ Season created');
  } else {
    season = await prisma.season.update({
      where: { id: season.id },
      data: defaultSeasonData,
    });
    console.log(`   ✓ Season updated (${season.name})`);
  }

  // 6) Seed regulations cho mùa giải (idempotent by season_id + key)
  console.log('📏 Seeding regulations...');
  let regulationCount = 0;
  for (const reg of defaultRegulations) {
    await prisma.regulation.upsert({
      where: {
        seasonId_key: { seasonId: season.id, key: reg.key },
      },
      update: { value: reg.value, valueType: reg.valueType },
      create: {
        seasonId: season.id,
        key: reg.key,
        value: reg.value,
        valueType: reg.valueType,
      },
    });
    regulationCount++;
  }
  console.log(`   ✓ ${regulationCount} regulations upserted`);

  // 7) Seed season_teams (đăng ký đội vào mùa giải)
  console.log('📝 Seeding season_teams...');
  const allTeams = await prisma.team.findMany();
  let stCount = 0;
  for (const t of allTeams) {
    const existing = await prisma.seasonTeam.findUnique({
      where: { seasonId_teamId: { seasonId: season.id, teamId: t.id } },
    });
    if (!existing) {
      await prisma.seasonTeam.create({
        data: {
          seasonId: season.id,
          teamId: t.id,
          status: SeasonTeamStatus.APPROVED,
          approvedAt: new Date(),
        },
      });
      stCount++;
    }
  }
  console.log(
    `   ✓ ${stCount} season_teams created (${allTeams.length - stCount} already existed)`,
  );

  // 8) Seed matches nếu chưa có
  console.log('📅 Seeding matches...');
  const existingMatchesCount = await prisma.match.count();
  if (existingMatchesCount === 0) {
    const teamRecords = await prisma.team.findMany({
      orderBy: { name: 'asc' },
    });
    if (teamRecords.length >= 2) {
      await prisma.match.createMany({
        data: [
          {
            seasonId: season.id,
            roundNo: 1,
            leg: 1,
            homeTeamId: teamRecords[0].id,
            awayTeamId: teamRecords[1].id,
            stadiumId: null,
            kickoffAt: null,
            status: MatchStatus.DRAFT,
          },
          {
            seasonId: season.id,
            roundNo: 1,
            leg: 2,
            homeTeamId: teamRecords[1].id,
            awayTeamId: teamRecords[0].id,
            stadiumId: null,
            kickoffAt: null,
            status: MatchStatus.DRAFT,
          },
        ],
      });
      console.log('   ✓ 2 matches created');
    }
  } else {
    console.log(
      `   ⏭️  Skipped (${existingMatchesCount} matches already exist)`,
    );
  }

  // 9) Seed demo officials and assign them to the season matches.
  console.log('🧑‍⚖️ Seeding referee/supervisor demo assignments...');
  const seasonMatches = await prisma.match.findMany({
    where: { seasonId: season.id },
    select: { id: true },
  });
  for (const officialData of demoOfficials) {
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
    `   ✓ Demo officials assigned to ${seasonMatches.length} matches`,
  );

  console.log('\n✅ Seed done!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 Demo accounts (password for all):', DEMO_PASSWORD);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  for (const u of demoUsers) {
    console.log(`   ${u.role.padEnd(15)} → ${u.email}`);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

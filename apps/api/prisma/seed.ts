import { PrismaPg } from '@prisma/adapter-pg';
import {
    MatchStatus,
    PlayerPosition,
    PrismaClient,
    SeasonStatus,
    TeamStatus,
    UserRole
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
  },
  {
    fullName: 'Trần Văn B',
    dob: new Date('1999-03-22'),
    nationality: 'Vietnam',
    position: PlayerPosition.DF,
  },
  {
    fullName: 'Lê Văn C',
    dob: new Date('2001-07-05'),
    nationality: 'Vietnam',
    position: PlayerPosition.FW,
  },
  {
    fullName: 'Phạm Văn D',
    dob: new Date('1998-11-12'),
    nationality: 'Vietnam',
    position: PlayerPosition.GK,
  },
  {
    fullName: 'Hoàng Văn E',
    dob: new Date('2002-02-18'),
    nationality: 'Vietnam',
    position: PlayerPosition.MF,
  },
  {
    fullName: 'Võ Văn F',
    dob: new Date('2000-08-09'),
    nationality: 'Vietnam',
    position: PlayerPosition.DF,
  },
  {
    fullName: 'Đặng Văn G',
    dob: new Date('1999-12-01'),
    nationality: 'Vietnam',
    position: PlayerPosition.FW,
  },
  {
    fullName: 'Bùi Văn H',
    dob: new Date('2001-04-14'),
    nationality: 'Vietnam',
    position: PlayerPosition.MF,
  },
  {
    fullName: 'Đỗ Văn I',
    dob: new Date('1997-06-30'),
    nationality: 'Vietnam',
    position: PlayerPosition.DF,
  },
  {
    fullName: 'Ngô Văn K',
    dob: new Date('2003-09-21'),
    nationality: 'Vietnam',
    position: PlayerPosition.FW,
  },
];

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
        // Không update passwordHash để tránh đổi password nếu team đang test
        // Nếu muốn luôn reset password mỗi lần seed thì uncomment dòng dưới:
        // passwordHash,
      },
      create: {
        email: u.email,
        role: u.role,
        passwordHash,
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
  let season = await prisma.season.findFirst({
    where: { status: SeasonStatus.IN_PROGRESS },
  });
  if (!season) {
    season = await prisma.season.create({
      data: {
        name: 'VLeague 2024',
        year: 2024,
        status: SeasonStatus.IN_PROGRESS,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      },
    });
    console.log('   ✓ Season created');
  } else {
    console.log(`   ⏭️  Skipped (season "${season.name}" already exists)`);
  }

  // 6) Seed matches nếu chưa có
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
            homeTeamId: teamRecords[0].id,
            awayTeamId: teamRecords[1].id,
            stadiumId: null,
            kickoffAt: null,
            status: MatchStatus.DRAFT,
          },
          {
            seasonId: season.id,
            roundNo: 1,
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

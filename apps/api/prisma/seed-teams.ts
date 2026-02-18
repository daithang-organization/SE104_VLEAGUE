import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, TeamStatus } from '@prisma/client';
import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env['DATABASE_URL'] });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// CLB → Sân vận động mapping (tên sân phải khớp với seed-stadiums.ts)
const TEAM_STADIUM_MAP: Record<string, string> = {
  'Hoàng Anh Gia Lai': 'Sân vận động Pleiku',
  'Viettel FC': 'Sân vận động Hàng Đẫy',
  'Hải Phòng FC': 'Sân vận động Lạch Tray',
  'SHB Đà Nẵng': 'Sân vận động Hòa Xuân',
  'Sông Lam Nghệ An': 'Sân vận động Vinh',
  'Bình Định FC': 'Sân vận động Quy Nhơn',
  'Nam Định FC': 'Sân vận động Thiên Trường',
  'Thanh Hóa FC': 'Sân vận động Thanh Hóa',
  'Hà Nội FC': 'Sân vận động Hàng Đẫy',
  'TP.HCM FC': 'Sân vận động Thống Nhất',
};

const TEAMS = [
  { name: 'Hoàng Anh Gia Lai', shortName: 'HAGL', city: 'Pleiku' },
  { name: 'Viettel FC', shortName: 'VTL', city: 'Hà Nội' },
  { name: 'Hải Phòng FC', shortName: 'HP', city: 'Hải Phòng' },
  { name: 'SHB Đà Nẵng', shortName: 'DNang', city: 'Đà Nẵng' },
  { name: 'Sông Lam Nghệ An', shortName: 'SLNA', city: 'Vinh' },
  { name: 'Bình Định FC', shortName: 'BD', city: 'Quy Nhơn' },
  { name: 'Nam Định FC', shortName: 'ND', city: 'Nam Định' },
  { name: 'Thanh Hóa FC', shortName: 'TH', city: 'Thanh Hóa' },
];

async function main() {
  console.log('🔌 Seeding teams with stadium links...\n');

  // Get all stadiums
  const stadiums = await prisma.stadium.findMany();
  const stadiumMap = new Map(stadiums.map((s) => [s.name, s.id]));
  console.log(`📊 Found ${stadiums.length} stadiums in DB\n`);

  for (const team of TEAMS) {
    const stadiumName = TEAM_STADIUM_MAP[team.name];
    const stadiumId = stadiumName ? stadiumMap.get(stadiumName) : undefined;

    const t = await prisma.team.upsert({
      where: { name: team.name },
      update: {
        shortName: team.shortName,
        city: team.city,
        stadiumId: stadiumId ?? undefined,
      },
      create: {
        name: team.name,
        shortName: team.shortName,
        city: team.city,
        status: TeamStatus.ACTIVE,
        stadiumId: stadiumId ?? undefined,
      },
    });
    console.log(
      `✅ ${t.name} (${t.shortName}) → ${stadiumName || 'no stadium'} ${stadiumId ? '✓' : '✗'}`,
    );
  }

  // Also update existing teams (Hà Nội FC, TP.HCM FC) from original seed
  for (const [teamName, stadiumName] of Object.entries(TEAM_STADIUM_MAP)) {
    const stadiumId = stadiumMap.get(stadiumName);
    if (!stadiumId) continue;

    const team = await prisma.team.findUnique({ where: { name: teamName } });
    if (!team) continue;
    if (team.stadiumId === stadiumId) continue; // already linked

    await prisma.team.update({
      where: { id: team.id },
      data: { stadiumId },
    });
    console.log(`🔗 ${teamName} → ${stadiumName}`);
  }

  // Show final result
  const allTeams = await prisma.team.findMany({
    where: { status: TeamStatus.ACTIVE },
    orderBy: { name: 'asc' },
    include: { stadium: { select: { name: true } } },
  });
  console.log(`\n📋 Final team → stadium mapping:`);
  allTeams.forEach((t) =>
    console.log(`  ${t.name} → ${t.stadium?.name || '❌ No stadium'}`),
  );

  await prisma.$disconnect();
  await pool.end();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  await pool.end();
  process.exit(1);
});

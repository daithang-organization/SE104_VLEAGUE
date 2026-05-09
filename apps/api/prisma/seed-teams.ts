import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, TeamStatus } from '@prisma/client';
import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env['DATABASE_URL'] });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// CLB → Sân vận động mapping (tên sân phải khớp với seed-stadiums.ts)
const TEAM_STADIUM_MAP: Record<string, string> = {
  'Thép Xanh Nam Định': 'Sân vận động Thiên Trường',
  'Hà Nội FC': 'Sân vận động Hàng Đẫy',
  'Công An Hà Nội': 'Sân vận động Hàng Đẫy',
  'Thể Công-Viettel': 'Sân vận động Mỹ Đình',
  'Becamex Bình Dương': 'Sân vận động Gò Đậu',
  'Hải Phòng FC': 'Sân vận động Lạch Tray',
  'Đông Á Thanh Hóa': 'Sân vận động Thanh Hóa',
  'LPBank Hoàng Anh Gia Lai': 'Sân vận động Pleiku',
  'TP.HCM FC': 'Sân vận động Thống Nhất',
  'Sông Lam Nghệ An': 'Sân vận động Vinh',
  'MerryLand Quy Nhơn Bình Định': 'Sân vận động Quy Nhơn',
  'Quảng Nam FC': 'Sân vận động Tam Kỳ',
  'Hồng Lĩnh Hà Tĩnh': 'Sân vận động Hà Tĩnh',
  'SHB Đà Nẵng': 'Sân vận động Hòa Xuân',
};

const TEAMS = [
  { name: 'Thép Xanh Nam Định', shortName: 'TXND', city: 'Nam Định' },
  { name: 'Hà Nội FC', shortName: 'HN', city: 'Hà Nội' },
  { name: 'Công An Hà Nội', shortName: 'CAHN', city: 'Hà Nội' },
  { name: 'Thể Công-Viettel', shortName: 'TCVT', city: 'Hà Nội' },
  { name: 'Becamex Bình Dương', shortName: 'BBD', city: 'Thủ Dầu Một' },
  { name: 'Hải Phòng FC', shortName: 'HP', city: 'Hải Phòng' },
  { name: 'Đông Á Thanh Hóa', shortName: 'DATH', city: 'Thanh Hóa' },
  { name: 'LPBank Hoàng Anh Gia Lai', shortName: 'HAGL', city: 'Pleiku' },
  { name: 'TP.HCM FC', shortName: 'HCM', city: 'TP. Hồ Chí Minh' },
  { name: 'Sông Lam Nghệ An', shortName: 'SLNA', city: 'Vinh' },
  { name: 'MerryLand Quy Nhơn Bình Định', shortName: 'QNBD', city: 'Quy Nhơn' },
  { name: 'Quảng Nam FC', shortName: 'QN', city: 'Tam Kỳ' },
  { name: 'Hồng Lĩnh Hà Tĩnh', shortName: 'HLHT', city: 'Hà Tĩnh' },
  { name: 'SHB Đà Nẵng', shortName: 'ĐN', city: 'Đà Nẵng' },
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

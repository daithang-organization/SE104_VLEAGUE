import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, TeamStatus } from '@prisma/client';
import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env['DATABASE_URL'] });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
  console.log('🔌 Connecting to database...\n');

  for (const team of TEAMS) {
    const t = await prisma.team.upsert({
      where: { name: team.name },
      update: { shortName: team.shortName, city: team.city },
      create: {
        name: team.name,
        shortName: team.shortName,
        city: team.city,
        status: TeamStatus.ACTIVE,
      },
    });
    console.log(`✅ ${t.name} (${t.shortName}) — ${t.city}`);
  }

  const allTeams = await prisma.team.findMany({
    where: { status: TeamStatus.ACTIVE },
    orderBy: { name: 'asc' },
  });
  console.log(`\n📋 Total ACTIVE teams: ${allTeams.length}`);
  allTeams.forEach((t, i) =>
    console.log(`  ${i + 1}. ${t.name} (${t.shortName || '-'})`),
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

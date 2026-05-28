import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env['DATABASE_URL'] });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🗑️  Cleaning up stale seasons and data...');

  // 1. Find the season we want to keep
  const keepSeason = await prisma.season.findUnique({
    where: { name: 'V.League 2024-2025' },
  });

  if (!keepSeason) {
    console.error('❌ Could not find "V.League 2024-2025" season to keep.');
    return;
  }

  console.log(`✅ Keeping season: ${keepSeason.name} (${keepSeason.id})`);

  // 2. Delete all other seasons (cascading will handle matches, etc.)
  const deleted = await prisma.season.deleteMany({
    where: {
      id: { not: keepSeason.id },
    },
  });

  console.log(`✅ Deleted ${deleted.count} other seasons.`);

  // 3. Ensure "V.League 2024-2025" is IN_PROGRESS
  await prisma.season.update({
    where: { id: keepSeason.id },
    data: { status: 'IN_PROGRESS' },
  });

  console.log('✅ Set "V.League 2024-2025" to IN_PROGRESS.');

  await prisma.$disconnect();
  await pool.end();
}

main().catch(async (e) => {
  console.error('❌ Cleanup failed:', e);
  await prisma.$disconnect();
  await pool.end();
  process.exit(1);
});

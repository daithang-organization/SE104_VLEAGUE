import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env['DATABASE_URL'] });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Find matches with no stadium and no kickoff (stale)
  const stale = await prisma.match.findMany({
    where: { stadiumId: null, kickoffAt: null },
  });
  console.log(`Found ${stale.length} stale matches`);

  for (const m of stale) {
    console.log(
      `  Deleting ${m.id} (seasonId=${m.seasonId}, round=${m.roundNo})`,
    );
    await prisma.match.delete({ where: { id: m.id } });
  }

  const remaining = await prisma.match.count();
  console.log(`\nRemaining matches: ${remaining}`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  await pool.end();
  process.exit(1);
});

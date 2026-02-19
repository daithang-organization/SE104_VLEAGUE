import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, SeasonTeamStatus, TeamStatus } from '@prisma/client';
import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env['DATABASE_URL'] });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Find the active season
  const season = await prisma.season.findFirst({
    where: { status: { in: ['IN_PROGRESS', 'UPCOMING'] } },
    orderBy: { year: 'desc' },
  });

  if (!season) {
    console.error('❌ No active season found');
    return;
  }
  console.log(`📅 Season: ${season.name} (${season.status})\n`);

  // Get all ACTIVE teams
  const teams = await prisma.team.findMany({
    where: { status: TeamStatus.ACTIVE },
    orderBy: { name: 'asc' },
  });
  console.log(`📋 Found ${teams.length} ACTIVE teams`);

  // Register all teams to the season
  for (const team of teams) {
    try {
      await prisma.seasonTeam.upsert({
        where: {
          seasonId_teamId: {
            seasonId: season.id,
            teamId: team.id,
          },
        },
        update: {},
        create: {
          seasonId: season.id,
          teamId: team.id,
          status: SeasonTeamStatus.REGISTERED,
        },
      });
      console.log(`  ✅ ${team.name} → registered`);
    } catch (e) {
      console.log(`  ⚠️  ${team.name}: ${(e as Error).message}`);
    }
  }

  const registered = await prisma.seasonTeam.count({
    where: { seasonId: season.id },
  });
  console.log(`\n🏟️  Total registered to ${season.name}: ${registered} teams`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  await pool.end();
  process.exit(1);
});

import { PrismaPg } from '@prisma/adapter-pg';
import {
  MatchOfficialRole,
  OfficialStatus,
  PrismaClient,
  SeasonStatus,
} from '@prisma/client';
import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env['DATABASE_URL'] });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function ensureOfficial(fullName: string, email: string) {
  const existing = await prisma.official.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
    orderBy: { createdAt: 'asc' },
  });

  if (existing) {
    return prisma.official.update({
      where: { id: existing.id },
      data: { fullName, email, status: OfficialStatus.ACTIVE },
    });
  }

  return prisma.official.create({
    data: { fullName, email, status: OfficialStatus.ACTIVE },
  });
}

async function main() {
  const season =
    (await prisma.season.findFirst({
      where: { status: SeasonStatus.IN_PROGRESS },
      orderBy: { startDate: 'desc' },
    })) ??
    (await prisma.season.findFirst({
      orderBy: { startDate: 'desc' },
    }));

  if (!season) {
    console.warn('No season found. Skipping official demo seed.');
    return;
  }

  const [referee, supervisor] = await Promise.all([
    ensureOfficial('Referee Demo', 'referee@demo.local'),
    ensureOfficial('Supervisor Demo', 'supervisor@demo.local'),
  ]);

  const matches = await prisma.match.findMany({
    where: { seasonId: season.id },
    select: { id: true },
  });

  for (const match of matches) {
    await prisma.matchOfficialAssignment.upsert({
      where: {
        matchId_officialId_role: {
          matchId: match.id,
          officialId: referee.id,
          role: MatchOfficialRole.MAIN_REFEREE,
        },
      },
      create: {
        matchId: match.id,
        officialId: referee.id,
        role: MatchOfficialRole.MAIN_REFEREE,
        note: 'Demo main referee assignment',
      },
      update: { note: 'Demo main referee assignment' },
    });

    await prisma.matchOfficialAssignment.upsert({
      where: {
        matchId_officialId_role: {
          matchId: match.id,
          officialId: supervisor.id,
          role: MatchOfficialRole.SUPERVISOR,
        },
      },
      create: {
        matchId: match.id,
        officialId: supervisor.id,
        role: MatchOfficialRole.SUPERVISOR,
        note: 'Demo supervisor assignment',
      },
      update: { note: 'Demo supervisor assignment' },
    });
  }

  console.log(
    `Seeded demo officials for ${matches.length} matches in ${season.name}.`,
  );
}

main()
  .catch((error) => {
    console.error('Official demo seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
  SeasonStatus,
  SeasonTeamStatus,
  TeamStatus,
} from '@prisma/client';
import 'dotenv/config';
import pg from 'pg';
import {
  buildTieScenarioSeason,
  summarizeHeadToHeadAggregate,
  TIE_SCENARIO_DEFINITIONS,
  TIE_SCENARIO_SLUGS,
  TIE_SCENARIO_TEAM_SEEDS,
  TieScenarioSlug,
  TieScenarioTeamSeed,
} from '../src/standings/standings-tie-scenarios.seed';

const pool = new pg.Pool({ connectionString: process.env['DATABASE_URL'] });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEFAULT_REGULATIONS = [
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
  { key: 'TOTAL_LEGS', value: '2', valueType: 'number' },
  { key: 'ROUNDS_PER_SEASON', value: '18', valueType: 'number' },
  { key: 'MATCHES_PER_ROUND', value: '5', valueType: 'number' },
  {
    key: 'RANK_TIEBREAK_ORDER_FINAL',
    value: '["points","goal_diff","head_to_head","draw_lot"]',
    valueType: 'json',
  },
] as const;

async function upsertTeam(row: TieScenarioTeamSeed) {
  const stadium = await prisma.stadium.upsert({
    where: { name: row.stadium.name },
    update: {
      address: row.stadium.address,
      city: row.stadium.city,
      country: 'Viet Nam',
      capacity: row.stadium.capacity,
      fifaStars: 2,
    },
    create: {
      name: row.stadium.name,
      address: row.stadium.address,
      city: row.stadium.city,
      country: 'Viet Nam',
      capacity: row.stadium.capacity,
      fifaStars: 2,
    },
  });

  return prisma.team.upsert({
    where: { name: row.name },
    update: {
      shortName: row.shortName,
      city: row.city,
      coachName: row.coachName,
      status: TeamStatus.ACTIVE,
      stadiumId: stadium.id,
    },
    create: {
      name: row.name,
      shortName: row.shortName,
      city: row.city,
      coachName: row.coachName,
      status: TeamStatus.ACTIVE,
      stadiumId: stadium.id,
    },
  });
}

type SeedTeamRecord = Awaited<ReturnType<typeof upsertTeam>>;

async function seedRegulations(seasonId: string) {
  for (const regulation of DEFAULT_REGULATIONS) {
    await prisma.regulation.upsert({
      where: { seasonId_key: { seasonId, key: regulation.key } },
      update: {
        value: regulation.value,
        valueType: regulation.valueType,
      },
      create: {
        seasonId,
        key: regulation.key,
        value: regulation.value,
        valueType: regulation.valueType,
      },
    });
  }
}

async function resetScenarioSeason(seasonId: string) {
  await prisma.drawLotResult.deleteMany({ where: { seasonId } });
  await prisma.standing.deleteMany({ where: { seasonId } });
  await prisma.match.deleteMany({ where: { seasonId } });
  await prisma.seasonTeam.deleteMany({ where: { seasonId } });
}

async function seedScenario(scenario: TieScenarioSlug) {
  const definition = TIE_SCENARIO_DEFINITIONS[scenario];
  const season = await prisma.season.upsert({
    where: { name: definition.seasonName },
    update: {
      year: definition.year,
      status: SeasonStatus.COMPLETED,
      startDate: definition.startDate,
      endDate: definition.endDate,
    },
    create: {
      name: definition.seasonName,
      year: definition.year,
      status: SeasonStatus.COMPLETED,
      startDate: definition.startDate,
      endDate: definition.endDate,
    },
  });

  await resetScenarioSeason(season.id);
  await seedRegulations(season.id);

  const teams: SeedTeamRecord[] = [];
  for (const row of TIE_SCENARIO_TEAM_SEEDS) {
    teams.push(await upsertTeam(row));
  }

  await prisma.seasonTeam.createMany({
    data: teams.map((team, index) => ({
      seasonId: season.id,
      teamId: team.id,
      status: SeasonTeamStatus.APPROVED,
      registeredAt: new Date(`${definition.year}-08-01T00:00:00.000Z`),
      approvedAt: new Date(`${definition.year}-08-15T00:00:00.000Z`),
      ownerName: `Tie Test Owner ${TIE_SCENARIO_TEAM_SEEDS[index].shortName}`,
      ownerCountry: 'Viet Nam',
      ownerAddress: TIE_SCENARIO_TEAM_SEEDS[index].city,
      teamIntroduction: `${team.name} participates in ${definition.seasonName}.`,
      primaryKit: 'Primary kit',
      backupKit: 'Backup kit',
      participationFeePaid: true,
      feePaidAt: new Date(`${definition.year}-08-10T00:00:00.000Z`),
      feeReceiptCode: `TIE-${definition.year}-${TIE_SCENARIO_TEAM_SEEDS[index].shortName}`,
      externalCompetitionSchedule: 'None',
      applicationSubmittedAt: new Date(
        `${definition.year}-08-01T00:00:00.000Z`,
      ),
    })),
  });

  const homeStadiumIdByTeamId = new Map(
    teams.map((team) => [team.id, team.stadiumId]),
  );
  const generatedSeason = buildTieScenarioSeason({
    scenario,
    seasonId: season.id,
    teamIds: teams.map((team) => team.id),
    startDate: definition.startDate,
  });

  await prisma.match.createMany({
    data: generatedSeason.matches.map((match) => ({
      ...match,
      stadiumId: homeStadiumIdByTeamId.get(match.homeTeamId),
    })),
  });
  await prisma.standing.createMany({ data: generatedSeason.standings });

  const alpha = generatedSeason.standings.find(
    (standing) => standing.teamId === teams[0].id,
  )!;
  const bravo = generatedSeason.standings.find(
    (standing) => standing.teamId === teams[1].id,
  )!;
  const headToHead = summarizeHeadToHeadAggregate(
    generatedSeason.matches,
    teams[0].id,
    teams[1].id,
  );

  console.log(
    `Seeded ${definition.seasonName}: ${teams.length} teams, ${generatedSeason.matches.length} finished matches.`,
  );
  console.log(
    `  ${teams[0].name}: ${alpha.points} pts, GD ${alpha.goalDiff}, rank ${alpha.rank}.`,
  );
  console.log(
    `  ${teams[1].name}: ${bravo.points} pts, GD ${bravo.goalDiff}, rank ${bravo.rank}.`,
  );
  console.log(
    `  Head-to-head aggregate: ${teams[0].shortName} ${headToHead.firstGoals}-${headToHead.secondGoals} ${teams[1].shortName}.`,
  );
  console.log(`  Scenario intent: ${definition.description}`);
}

function parseScenarioArgs(args: string[]): TieScenarioSlug[] {
  if (args.length === 0 || args.includes('all')) {
    return [...TIE_SCENARIO_SLUGS];
  }

  const invalidArgs = args.filter(
    (arg) => !TIE_SCENARIO_SLUGS.includes(arg as TieScenarioSlug),
  );
  if (invalidArgs.length > 0) {
    throw new Error(
      `Unknown tie scenario "${invalidArgs.join(', ')}". Use one of: all, ${TIE_SCENARIO_SLUGS.join(', ')}.`,
    );
  }

  return [...new Set(args as TieScenarioSlug[])];
}

async function main() {
  const scenarios = parseScenarioArgs(process.argv.slice(2));

  for (const scenario of scenarios) {
    await seedScenario(scenario);
  }
}

main()
  .catch((error) => {
    console.error('Standings tie scenario seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

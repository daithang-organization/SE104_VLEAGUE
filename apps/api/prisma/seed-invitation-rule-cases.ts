import { PrismaPg } from '@prisma/adapter-pg';
import {
  PlayerPosition,
  PlayerType,
  PrismaClient,
  type Team,
} from '@prisma/client';
import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env['DATABASE_URL'] });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SEED_NOW = new Date('2026-06-02T00:00:00.000Z');
const JOINED_AT = new Date('2026-07-01T00:00:00.000Z');

type TeamRuleCase = {
  teamName: string;
  activeRosterCount?: number;
  playerAge?: number;
};

const RULE_CASES: TeamRuleCase[] = [
  { teamName: 'Dong Thap FC', activeRosterCount: 0 },
  { teamName: 'Tre PVF CAND', activeRosterCount: 23 },
  { teamName: 'Truong Tuoi Dong Nai', playerAge: 45 },
  { teamName: 'Xuan Thien Phu Tho FC', playerAge: 9 },
];

const TEAM_NAME_ALIASES: Record<string, string[]> = {
  'Dong Thap FC': ['Dong Thap FC', 'Đồng Tháp FC'],
  'Tre PVF CAND': ['Tre PVF CAND', 'Trẻ PVF CAND'],
  'Truong Tuoi Dong Nai': ['Truong Tuoi Dong Nai', 'Trường Tươi Đồng Nai'],
  'Xuan Thien Phu Tho FC': ['Xuan Thien Phu Tho FC', 'Xuân Thiện Phú Thọ FC'],
};

function dobForAge(age: number) {
  return new Date(
    Date.UTC(
      SEED_NOW.getUTCFullYear() - age,
      SEED_NOW.getUTCMonth(),
      SEED_NOW.getUTCDate(),
    ),
  );
}

function casePlayerName(team: Team, suffix: string) {
  return `${team.shortName ?? team.name} Rule Case ${suffix}`;
}

async function findTeam(name: string) {
  return prisma.team.findFirst({
    where: { name: { in: TEAM_NAME_ALIASES[name] ?? [name] } },
  });
}

async function getActiveRoster(teamId: string) {
  return prisma.teamPlayer.findMany({
    where: { teamId, leftAt: null },
    include: { player: true },
    orderBy: [
      { jerseyNumber: 'asc' },
      { joinedAt: 'asc' },
      { createdAt: 'asc' },
    ],
  });
}

async function createRosterPlayer(team: Team, index: number) {
  const fullName = casePlayerName(team, `Player ${index}`);
  const playerData = {
    fullName,
    dob: new Date(Date.UTC(1998 + (index % 8), index % 12, 1 + (index % 27))),
    nationality: 'Viet Nam',
    position: index % 5 === 0 ? PlayerPosition.GK : PlayerPosition.FW,
    playerType: PlayerType.DOMESTIC,
    birthPlace: team.city ?? team.name,
    heightCm: 170 + (index % 12),
    weightKg: 64 + (index % 14),
    careerSummary: `${fullName} is generated for invitation rule testing.`,
  };
  const existingPlayer = await prisma.player.findFirst({ where: { fullName } });
  const player = existingPlayer
    ? await prisma.player.update({
        where: { id: existingPlayer.id },
        data: playerData,
      })
    : await prisma.player.create({ data: playerData });

  const activeRow = await prisma.teamPlayer.findFirst({
    where: { teamId: team.id, playerId: player.id, leftAt: null },
  });
  if (activeRow) return;

  await prisma.teamPlayer.create({
    data: {
      teamId: team.id,
      playerId: player.id,
      jerseyNumber: index,
      joinedAt: new Date(JOINED_AT.getTime() + index * 1000),
    },
  });
}

async function setActiveRosterCount(team: Team, targetCount: number) {
  const activeRoster = await getActiveRoster(team.id);
  if (activeRoster.length > targetCount) {
    await prisma.teamPlayer.updateMany({
      where: {
        id: { in: activeRoster.slice(targetCount).map((row) => row.id) },
      },
      data: { leftAt: SEED_NOW },
    });
  }

  let currentCount = Math.min(activeRoster.length, targetCount);
  while (currentCount < targetCount) {
    currentCount += 1;
    await createRosterPlayer(team, currentCount);
  }
}

async function setOneActivePlayerAge(team: Team, age: number) {
  let activeRoster = await getActiveRoster(team.id);
  if (activeRoster.length === 0) {
    await createRosterPlayer(team, 1);
    activeRoster = await getActiveRoster(team.id);
  }

  const targetPlayer = activeRoster[0]?.player;
  if (!targetPlayer) return;

  await prisma.player.update({
    where: { id: targetPlayer.id },
    data: {
      fullName: casePlayerName(team, `${age}yo`),
      dob: dobForAge(age),
      nationality: 'Viet Nam',
      playerType: PlayerType.DOMESTIC,
      birthPlace: team.city ?? team.name,
    },
  });
}

async function main() {
  for (const ruleCase of RULE_CASES) {
    const team = await findTeam(ruleCase.teamName);
    if (!team) {
      console.warn(
        `[seed-invitation-rule-cases] Missing team: ${ruleCase.teamName}`,
      );
      continue;
    }

    if (ruleCase.activeRosterCount !== undefined) {
      await setActiveRosterCount(team, ruleCase.activeRosterCount);
    }

    if (ruleCase.playerAge !== undefined) {
      await setOneActivePlayerAge(team, ruleCase.playerAge);
    }
  }

  console.log('Seeded invitation rule test cases.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

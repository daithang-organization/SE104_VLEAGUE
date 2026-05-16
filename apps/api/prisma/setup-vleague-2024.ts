import { PrismaPg } from '@prisma/adapter-pg';
import {
  MatchStatus,
  PrismaClient,
  SeasonStatus,
  SeasonTeamStatus,
} from '@prisma/client';
import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env['DATABASE_URL'] });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const REAL_TEAMS = [
  'Thép Xanh Nam Định',
  'Hà Nội FC',
  'Công An Hà Nội',
  'Thể Công-Viettel',
  'Becamex Bình Dương',
  'Hải Phòng FC',
  'Đông Á Thanh Hóa',
  'LPBank Hoàng Anh Gia Lai',
  'TP.HCM FC',
  'Sông Lam Nghệ An',
  'MerryLand Quy Nhơn Bình Định',
  'Quảng Nam FC',
  'Hồng Lĩnh Hà Tĩnh',
  'SHB Đà Nẵng',
];

async function main() {
  console.log('🏆 Setting up V.League 2024-25 Season...\n');

  // 1. Create Season
  const season = await prisma.season.upsert({
    where: { name: 'V.League 2024-25' },
    update: {
      status: SeasonStatus.IN_PROGRESS,
    },
    create: {
      name: 'V.League 2024-25',
      year: 2024,
      startDate: new Date('2024-09-14'),
      endDate: new Date('2025-06-21'),
      status: SeasonStatus.IN_PROGRESS,
    },
  });
  console.log(`✅ Season: ${season.name} (ID: ${season.id})`);

  // 1.5 Seed Regulations for this season
  console.log('📏 Seeding regulations...');
  const defaultRegulations = [
    { key: 'MIN_AGE', value: '16', valueType: 'number' },
    { key: 'MAX_AGE', value: '40', valueType: 'number' },
    { key: 'MIN_ROSTER', value: '15', valueType: 'number' },
    { key: 'MAX_ROSTER', value: '30', valueType: 'number' },
    { key: 'MAX_FOREIGN_PLAYERS', value: '3', valueType: 'number' },
    { key: 'WIN_POINTS', value: '3', valueType: 'number' },
    { key: 'DRAW_POINTS', value: '1', valueType: 'number' },
    { key: 'LOSS_POINTS', value: '0', valueType: 'number' },
    { key: 'MAX_GOAL_TIME', value: '96', valueType: 'number' },
  ];

  for (const reg of defaultRegulations) {
    await prisma.regulation.upsert({
      where: { seasonId_key: { seasonId: season.id, key: reg.key } },
      update: { value: reg.value, valueType: reg.valueType },
      create: {
        seasonId: season.id,
        key: reg.key,
        value: reg.value,
        valueType: reg.valueType,
      },
    });
  }
  console.log(`  ✅ ${defaultRegulations.length} regulations upserted.`);

  // 2. Register and Approve Teams
  const teams = await prisma.team.findMany({
    where: { name: { in: REAL_TEAMS } },
  });

  if (teams.length < 14) {
    console.warn(`⚠️ Only found ${teams.length}/14 real teams. Check naming.`);
  }

  for (const team of teams) {
    await prisma.seasonTeam.upsert({
      where: { seasonId_teamId: { seasonId: season.id, teamId: team.id } },
      update: { status: SeasonTeamStatus.APPROVED },
      create: {
        seasonId: season.id,
        teamId: team.id,
        status: SeasonTeamStatus.APPROVED,
        approvedAt: new Date(),
      },
    });
    console.log(`  ✅ Registered & Approved: ${team.name}`);
  }

  // 3. Generate Schedule (Round Robin)
  console.log('\n📅 Generating Round Robin Schedule (26 Rounds)...');

  // Clean up existing matches for this season if any
  const matchCount = await prisma.match.count({
    where: { seasonId: season.id },
  });
  if (matchCount > 0) {
    console.log(`  🗑️ Removing ${matchCount} existing matches...`);
    await prisma.match.deleteMany({ where: { seasonId: season.id } });
  }

  const teamIds = teams.map((t) => t.id);
  const n = teamIds.length;
  if (n % 2 !== 0) {
    console.error(
      '❌ Team count must be even for round-robin (add a bye if needed)',
    );
    return;
  }

  const rounds = n - 1;
  const matchesPerRound = n / 2;

  // Circle method for round-robin
  const circle = [...teamIds];
  const fixed = circle.shift()!;

  const matches: any[] = [];

  // Leg 1 (Rounds 1-13)
  for (let r = 0; r < rounds; r++) {
    const roundNo = r + 1;

    // Fixed team vs circle[0]
    matches.push({
      seasonId: season.id,
      roundNo,
      leg: 1,
      homeTeamId: r % 2 === 0 ? fixed : circle[0],
      awayTeamId: r % 2 === 0 ? circle[0] : fixed,
      status: MatchStatus.PUBLISHED,
      kickoffAt: new Date(
        (season.startDate?.getTime() ?? Date.now()) +
          r * 7 * 24 * 60 * 60 * 1000,
      ),
    });

    for (let i = 1; i < matchesPerRound; i++) {
      const home = circle[i];
      const away = circle[n - 1 - i];
      matches.push({
        seasonId: season.id,
        roundNo,
        leg: 1,
        homeTeamId: r % 2 === 0 ? home : away,
        awayTeamId: r % 2 === 0 ? away : home,
        status: MatchStatus.PUBLISHED,
        kickoffAt: new Date(
          (season.startDate?.getTime() ?? Date.now()) +
            r * 7 * 24 * 60 * 60 * 1000,
        ),
      });
    }

    // Rotate circle
    circle.push(circle.shift()!);
  }

  // Leg 2 (Rounds 14-26) - Swap home/away
  const leg1Matches = [...matches];
  for (const m of leg1Matches) {
    matches.push({
      ...m,
      roundNo: m.roundNo + rounds,
      leg: 2,
      homeTeamId: m.awayTeamId,
      awayTeamId: m.homeTeamId,
      kickoffAt: new Date(
        (m.kickoffAt?.getTime() ?? Date.now()) +
          rounds * 7 * 24 * 60 * 60 * 1000,
      ),
    });
  }

  // Bulk insert matches
  // Prisma createMany is faster
  await prisma.match.createMany({ data: matches });
  console.log(`✅ Generated ${matches.length} matches.`);

  // 4. Seed some results for Round 1
  console.log('\n⚽ Seeding results for Round 1...');
  const round1Matches = await prisma.match.findMany({
    where: { seasonId: season.id, roundNo: 1 },
  });

  for (const m of round1Matches) {
    const homeScore = Math.floor(Math.random() * 4);
    const awayScore = Math.floor(Math.random() * 3);

    await prisma.match.update({
      where: { id: m.id },
      data: {
        homeScore,
        awayScore,
        status: MatchStatus.FINISHED,
      },
    });

    // Seed some goals
    const totalGoals = homeScore + awayScore;
    if (totalGoals > 0) {
      const homePlayers = await prisma.teamPlayer.findMany({
        where: { teamId: m.homeTeamId, leftAt: null },
        take: 5,
      });
      const awayPlayers = await prisma.teamPlayer.findMany({
        where: { teamId: m.awayTeamId, leftAt: null },
        take: 5,
      });

      for (let i = 0; i < homeScore; i++) {
        const p = homePlayers[Math.floor(Math.random() * homePlayers.length)];
        await prisma.matchEvent.create({
          data: {
            matchId: m.id,
            teamId: m.homeTeamId,
            playerId: p.playerId,
            type: 'GOAL',
            minute: 10 + i * 20,
          },
        });
      }
      for (let i = 0; i < awayScore; i++) {
        const p = awayPlayers[Math.floor(Math.random() * awayPlayers.length)];
        await prisma.matchEvent.create({
          data: {
            matchId: m.id,
            teamId: m.awayTeamId,
            playerId: p.playerId,
            type: 'GOAL',
            minute: 15 + i * 25,
          },
        });
      }
    }
  }
  console.log('✅ Seeded Round 1 results and goals.');

  console.log('\n🚀 V.League 2024-25 Setup Complete!');

  await prisma.$disconnect();
  await pool.end();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  await pool.end();
  process.exit(1);
});

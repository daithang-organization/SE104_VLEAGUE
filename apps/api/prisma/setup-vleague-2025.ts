import { PrismaPg } from '@prisma/adapter-pg';
import {
  MatchStatus,
  PrismaClient,
  PromotionCandidateStatus,
  PromotionQualificationType,
  SeasonStatus,
  SeasonTeamStatus,
  TeamStatus,
  UserRole,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env['DATABASE_URL'] });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEMO_PASSWORD = 'Demo@12345';
const COMPLETED_SEASON_NAME = 'V.League 2025-2026';
const TARGET_SEASON_NAME = 'VLeague 2026-2027';
const SEED_NOW = new Date('2026-05-24T12:00:00.000Z');

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

type TeamSeedRow = {
  name: string;
  shortName: string;
  city: string;
  stadium: {
    name: string;
    city: string;
    address: string;
    capacity: number;
  };
};

const VLEAGUE_2025_FINAL_ORDER: TeamSeedRow[] = [
  {
    name: 'Thép Xanh Nam Định',
    shortName: 'TXND',
    city: 'Nam Định',
    stadium: {
      name: 'Sân vận động Thiên Trường',
      city: 'Ninh Bình',
      address: 'P. Nam Định, Ninh Bình',
      capacity: 30000,
    },
  },
  {
    name: 'Hà Nội FC',
    shortName: 'HN',
    city: 'Hà Nội',
    stadium: {
      name: 'Sân vận động Hàng Đẫy',
      city: 'Hà Nội',
      address: 'Trịnh Hoài Đức, Đống Đa, Hà Nội',
      capacity: 22500,
    },
  },
  {
    name: 'Công An Hà Nội',
    shortName: 'CAHN',
    city: 'Hà Nội',
    stadium: {
      name: 'Sân vận động Hàng Đẫy',
      city: 'Hà Nội',
      address: 'Trịnh Hoài Đức, Đống Đa, Hà Nội',
      capacity: 22500,
    },
  },
  {
    name: 'Thể Công-Viettel',
    shortName: 'TCVT',
    city: 'Hà Nội',
    stadium: {
      name: 'Sân vận động Mỹ Đình',
      city: 'Hà Nội',
      address: 'Nam Từ Liêm, Hà Nội',
      capacity: 40192,
    },
  },
  {
    name: 'Đông Á Thanh Hóa',
    shortName: 'DATH',
    city: 'Thanh Hóa',
    stadium: {
      name: 'Sân vận động Thanh Hóa',
      city: 'Thanh Hóa',
      address: 'TP. Thanh Hóa',
      capacity: 14000,
    },
  },
  {
    name: 'LPBank Hoàng Anh Gia Lai',
    shortName: 'HAGL',
    city: 'Pleiku',
    stadium: {
      name: 'Sân vận động Pleiku',
      city: 'Gia Lai',
      address: 'TP. Pleiku, Gia Lai',
      capacity: 12000,
    },
  },
  {
    name: 'Hải Phòng FC',
    shortName: 'HP',
    city: 'Hải Phòng',
    stadium: {
      name: 'Sân vận động Lạch Tray',
      city: 'Hải Phòng',
      address: 'Lê Lợi, Ngô Quyền, Hải Phòng',
      capacity: 30000,
    },
  },
  {
    name: 'Becamex Bình Dương',
    shortName: 'BBD',
    city: 'Thủ Dầu Một',
    stadium: {
      name: 'Sân vận động Gò Đậu',
      city: 'TP. Hồ Chí Minh',
      address: 'P. Thủ Dầu Một, TP. Hồ Chí Minh',
      capacity: 18250,
    },
  },
  {
    name: 'TP.HCM FC',
    shortName: 'HCM',
    city: 'TP. Hồ Chí Minh',
    stadium: {
      name: 'Sân vận động Thống Nhất',
      city: 'TP. Hồ Chí Minh',
      address: 'Quận 10, TP. Hồ Chí Minh',
      capacity: 25000,
    },
  },
  {
    name: 'Sông Lam Nghệ An',
    shortName: 'SLNA',
    city: 'Vinh',
    stadium: {
      name: 'Sân vận động Vinh',
      city: 'Nghệ An',
      address: 'P. Vinh, Nghệ An',
      capacity: 18000,
    },
  },
];

type PromotionSeedRow = TeamSeedRow & {
  rank: number;
  logoUrl: string;
  qualificationType: PromotionQualificationType;
  note: string;
};

const VLEAGUE_2_2025_PROMOTION_ORDER: PromotionSeedRow[] = [
  {
    rank: 1,
    name: 'Bắc Ninh FC',
    shortName: 'BN',
    city: 'Bắc Ninh',
    logoUrl: '/promo_candidates/Bắc Ninh FC.svg',
    stadium: {
      name: 'Sân vận động Việt Yên',
      city: 'Bắc Ninh',
      address: 'Việt Yên, Bắc Ninh',
      capacity: 18000,
    },
    qualificationType: PromotionQualificationType.CHAMPION,
    note: 'Vô địch V.League 2 2025-26',
  },
  {
    rank: 2,
    name: 'Long An FC',
    shortName: 'LA',
    city: 'Tây Ninh',
    logoUrl: '/promo_candidates/Long An FC.png',
    stadium: {
      name: 'Sân vận động Long An',
      city: 'Tây Ninh',
      address: 'P. Long An, Tây Ninh',
      capacity: 19975,
    },
    qualificationType: PromotionQualificationType.RUNNER_UP,
    note: 'Á quân V.League 2 2025-26',
  },
  {
    rank: 3,
    name: 'Quy Nhơn United',
    shortName: 'QNU',
    city: 'Gia Lai',
    logoUrl: '/promo_candidates/Quy Nhơn United.png',
    stadium: {
      name: 'Sân vận động Quy Nhơn',
      city: 'Gia Lai',
      address: 'Quy Nhơn, Gia Lai',
      capacity: 20000,
    },
    qualificationType: PromotionQualificationType.PLAYOFF,
    note: 'Suất play-off V.League 2 2025-26',
  },
  {
    rank: 4,
    name: 'Quảng Ninh FC',
    shortName: 'QNINH',
    city: 'Quảng Ninh',
    logoUrl: '/promo_candidates/Quảng Ninh FC.png',
    stadium: {
      name: 'Sân vận động Cẩm Phả',
      city: 'Quảng Ninh',
      address: 'Cẩm Phả, Quảng Ninh',
      capacity: 16000,
    },
    qualificationType: PromotionQualificationType.REPLACEMENT_POOL,
    note: 'Danh sách dự phòng thăng hạng',
  },
  {
    rank: 5,
    name: 'Sanna Khánh Hòa FC',
    shortName: 'SKH',
    city: 'Khánh Hòa',
    logoUrl: '/promo_candidates/Sanna Khánh Hòa FC.png',
    stadium: {
      name: 'Sân vận động 19 Tháng 8',
      city: 'Khánh Hòa',
      address: 'TP. Nha Trang, Khánh Hòa',
      capacity: 18000,
    },
    qualificationType: PromotionQualificationType.REPLACEMENT_POOL,
    note: 'Danh sách dự phòng thăng hạng',
  },
  {
    rank: 6,
    name: 'Thanh Niên TP Hồ Chí Minh FC',
    shortName: 'TNHCM',
    city: 'TP. Hồ Chí Minh',
    logoUrl: '/promo_candidates/Thanh Niên TP Hồ Chí Minh FC.png',
    stadium: {
      name: 'Sân vận động Pleiku',
      city: 'Gia Lai',
      address: 'TP. Pleiku, Gia Lai',
      capacity: 12000,
    },
    qualificationType: PromotionQualificationType.REPLACEMENT_POOL,
    note: 'Danh sách dự phòng thăng hạng',
  },
  {
    rank: 7,
    name: 'Trường Tươi Đồng Nai',
    shortName: 'TTDN',
    city: 'Đồng Nai',
    logoUrl: '/promo_candidates/Trường Tươi Đồng Nai.png',
    stadium: {
      name: 'Sân vận động Bình Phước',
      city: 'Đồng Nai',
      address: 'P. Bình Phước, Đồng Nai',
      capacity: 11000,
    },
    qualificationType: PromotionQualificationType.REPLACEMENT_POOL,
    note: 'Danh sách dự phòng thăng hạng',
  },
  {
    rank: 8,
    name: 'Trẻ PVF CAND',
    shortName: 'PVF',
    city: 'Hưng Yên',
    logoUrl: '/promo_candidates/Trẻ PVF CAND.png',
    stadium: {
      name: 'Sân vận động PVF',
      city: 'Hưng Yên',
      address: 'Nghĩa Trụ, Hưng Yên',
      capacity: 4600,
    },
    qualificationType: PromotionQualificationType.REPLACEMENT_POOL,
    note: 'Danh sách dự phòng thăng hạng',
  },
  {
    rank: 9,
    name: 'Xuân Thiện Phú Thọ FC',
    shortName: 'PT',
    city: 'Phú Thọ',
    logoUrl: '/promo_candidates/Xuân Thiện Phú Thọ FC.png',
    stadium: {
      name: 'Sân vận động Việt Trì',
      city: 'Phú Thọ',
      address: 'Thanh Miếu, Phú Thọ',
      capacity: 20000,
    },
    qualificationType: PromotionQualificationType.REPLACEMENT_POOL,
    note: 'Danh sách dự phòng thăng hạng',
  },
  {
    rank: 10,
    name: 'Đại học Văn Hiến FC',
    shortName: 'VHU',
    city: 'TP. Hồ Chí Minh',
    logoUrl: '/promo_candidates/Đại học Văn Hiến FC.png',
    stadium: {
      name: 'Sân vận động Bà Rịa',
      city: 'TP. Hồ Chí Minh',
      address: 'P. Bà Rịa, TP. Hồ Chí Minh',
      capacity: 16000,
    },
    qualificationType: PromotionQualificationType.REPLACEMENT_POOL,
    note: 'Danh sách dự phòng thăng hạng',
  },
  {
    rank: 11,
    name: 'Đồng Tháp FC',
    shortName: 'DT',
    city: 'Đồng Tháp',
    logoUrl: '/promo_candidates/Đồng Tháp FC.png',
    stadium: {
      name: 'Sân vận động Cao Lãnh',
      city: 'Đồng Tháp',
      address: 'Mỹ Trà, Đồng Tháp',
      capacity: 23000,
    },
    qualificationType: PromotionQualificationType.REPLACEMENT_POOL,
    note: 'Danh sách dự phòng thăng hạng',
  },
];

type TeamRecord = {
  id: string;
  name: string;
  shortName: string | null;
};

type StandingStats = {
  teamId: string;
  played: number;
  win: number;
  draw: number;
  loss: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
};

function slugTeamName(name: string) {
  return name
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')
    .replace(/\.+/g, '.');
}

function getManagerEmail(teamName: string) {
  return `manager.${slugTeamName(teamName)}@demo.local`;
}

async function upsertTeam(row: TeamSeedRow, logoUrl?: string) {
  const stadium = await prisma.stadium.upsert({
    where: { name: row.stadium.name },
    update: {
      address: row.stadium.address,
      city: row.stadium.city,
      country: 'Việt Nam',
      capacity: row.stadium.capacity,
      fifaStars: 2,
    },
    create: {
      name: row.stadium.name,
      address: row.stadium.address,
      city: row.stadium.city,
      country: 'Việt Nam',
      capacity: row.stadium.capacity,
      fifaStars: 2,
    },
  });

  return prisma.team.upsert({
    where: { name: row.name },
    update: {
      shortName: row.shortName,
      city: row.city,
      logoUrl,
      status: TeamStatus.ACTIVE,
      stadiumId: stadium.id,
    },
    create: {
      name: row.name,
      shortName: row.shortName,
      city: row.city,
      logoUrl,
      status: TeamStatus.ACTIVE,
      stadiumId: stadium.id,
    },
  });
}

async function upsertManager(
  team: TeamRecord,
  seasonIds: string[],
  passwordHash: string,
) {
  const managerRole = await prisma.role.upsert({
    where: { name: UserRole.TEAM_MANAGER },
    update: { description: 'Quản lý đội bóng' },
    create: { name: UserRole.TEAM_MANAGER, description: 'Quản lý đội bóng' },
  });

  const manager = await prisma.user.upsert({
    where: { email: getManagerEmail(team.name) },
    update: {
      role: UserRole.TEAM_MANAGER,
      roleId: managerRole.id,
      managedTeamId: team.id,
      passwordHash,
      emailVerified: true,
      name: `Manager ${team.shortName ?? team.name}`,
    },
    create: {
      email: getManagerEmail(team.name),
      role: UserRole.TEAM_MANAGER,
      roleId: managerRole.id,
      managedTeamId: team.id,
      passwordHash,
      emailVerified: true,
      name: `Manager ${team.shortName ?? team.name}`,
    },
  });

  for (const seasonId of seasonIds) {
    await prisma.teamManagerAssignment.upsert({
      where: { userId_seasonId: { userId: manager.id, seasonId } },
      update: { teamId: team.id },
      create: { userId: manager.id, seasonId, teamId: team.id },
    });
  }
}

async function upsertSeason(
  name: string,
  data: Parameters<typeof prisma.season.create>[0]['data'],
) {
  const legacyNames =
    name === COMPLETED_SEASON_NAME
      ? [COMPLETED_SEASON_NAME, 'VLeague 2025-2026', 'V.League 2025-26']
      : [TARGET_SEASON_NAME, 'V.League 2026-2027', 'VLeague 2026-27'];

  const existing = await prisma.season.findFirst({
    where: { name: { in: legacyNames } },
    orderBy: { createdAt: 'asc' },
  });

  if (!existing) {
    return prisma.season.create({ data });
  }

  return prisma.season.update({
    where: { id: existing.id },
    data,
  });
}

function emptyStats(teamId: string): StandingStats {
  return {
    teamId,
    played: 0,
    win: 0,
    draw: 0,
    loss: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
  };
}

function recordMatch(
  stats: Map<string, StandingStats>,
  homeTeamId: string,
  awayTeamId: string,
  homeScore: number,
  awayScore: number,
) {
  const home = stats.get(homeTeamId)!;
  const away = stats.get(awayTeamId)!;

  home.played++;
  away.played++;
  home.goalsFor += homeScore;
  home.goalsAgainst += awayScore;
  away.goalsFor += awayScore;
  away.goalsAgainst += homeScore;

  if (homeScore > awayScore) {
    home.win++;
    home.points += 3;
    away.loss++;
  } else if (homeScore < awayScore) {
    away.win++;
    away.points += 3;
    home.loss++;
  } else {
    home.draw++;
    away.draw++;
    home.points++;
    away.points++;
  }
}

function buildScore(
  homeTeamId: string,
  awayTeamId: string,
  strengthByTeamId: Map<string, number>,
) {
  const homeStrength = strengthByTeamId.get(homeTeamId)!;
  const awayStrength = strengthByTeamId.get(awayTeamId)!;
  const goalGap = 2 + (Math.abs(homeStrength - awayStrength) % 2);

  return homeStrength < awayStrength
    ? { homeScore: goalGap, awayScore: 0 }
    : { homeScore: 0, awayScore: goalGap };
}

function buildRoundRobin(teamIds: string[], seasonId: string, startDate: Date) {
  const stats = new Map(teamIds.map((teamId) => [teamId, emptyStats(teamId)]));
  const strengthByTeamId = new Map(
    teamIds.map((teamId, index) => [teamId, index]),
  );
  const firstLegFixtures: Array<{
    roundNo: number;
    homeTeamId: string;
    awayTeamId: string;
  }> = [];
  const circle = [...teamIds];
  const fixed = circle.shift()!;
  const rounds = teamIds.length - 1;
  const matchesPerRound = teamIds.length / 2;

  for (let roundIndex = 0; roundIndex < rounds; roundIndex++) {
    firstLegFixtures.push({
      roundNo: roundIndex + 1,
      homeTeamId: roundIndex % 2 === 0 ? fixed : circle[0],
      awayTeamId: roundIndex % 2 === 0 ? circle[0] : fixed,
    });

    for (let index = 1; index < matchesPerRound; index++) {
      const left = circle[index];
      const right = circle[teamIds.length - 1 - index];
      firstLegFixtures.push({
        roundNo: roundIndex + 1,
        homeTeamId: roundIndex % 2 === 0 ? left : right,
        awayTeamId: roundIndex % 2 === 0 ? right : left,
      });
    }

    circle.push(circle.shift()!);
  }

  const allFixtures = [
    ...firstLegFixtures.map((fixture) => ({ ...fixture, leg: 1 })),
    ...firstLegFixtures.map((fixture) => ({
      roundNo: fixture.roundNo + rounds,
      leg: 2,
      homeTeamId: fixture.awayTeamId,
      awayTeamId: fixture.homeTeamId,
    })),
  ];

  const matches = allFixtures.map((fixture) => {
    const kickoffAt = new Date(startDate);
    kickoffAt.setDate(startDate.getDate() + (fixture.roundNo - 1) * 7);
    kickoffAt.setHours(18, 0, 0, 0);

    const { homeScore, awayScore } = buildScore(
      fixture.homeTeamId,
      fixture.awayTeamId,
      strengthByTeamId,
    );
    recordMatch(
      stats,
      fixture.homeTeamId,
      fixture.awayTeamId,
      homeScore,
      awayScore,
    );

    return {
      seasonId,
      roundNo: fixture.roundNo,
      leg: fixture.leg,
      homeTeamId: fixture.homeTeamId,
      awayTeamId: fixture.awayTeamId,
      kickoffAt,
      homeScore,
      awayScore,
      status: MatchStatus.FINISHED,
    };
  });

  return { matches, stats: [...stats.values()] };
}

async function seedRegulations(seasonId: string) {
  for (const regulation of DEFAULT_REGULATIONS) {
    await prisma.regulation.upsert({
      where: { seasonId_key: { seasonId, key: regulation.key } },
      update: { value: regulation.value, valueType: regulation.valueType },
      create: {
        seasonId,
        key: regulation.key,
        value: regulation.value,
        valueType: regulation.valueType,
      },
    });
  }
}

async function main() {
  console.log(
    `Seeding ${COMPLETED_SEASON_NAME} as previous completed season...`,
  );

  await prisma.role.upsert({
    where: { name: UserRole.ADMIN },
    update: { description: 'Quản trị viên hệ thống' },
    create: { name: UserRole.ADMIN, description: 'Quản trị viên hệ thống' },
  });

  const completedSeason = await upsertSeason(COMPLETED_SEASON_NAME, {
    name: COMPLETED_SEASON_NAME,
    year: 2025,
    status: SeasonStatus.COMPLETED,
    startDate: new Date('2025-09-01T00:00:00.000Z'),
    endDate: new Date('2026-05-24T00:00:00.000Z'),
  });

  const targetSeason = await upsertSeason(TARGET_SEASON_NAME, {
    name: TARGET_SEASON_NAME,
    year: 2026,
    status: SeasonStatus.UPCOMING,
    startDate: new Date('2026-09-01T00:00:00.000Z'),
    endDate: new Date('2027-06-30T00:00:00.000Z'),
  });

  await seedRegulations(completedSeason.id);
  await seedRegulations(targetSeason.id);

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const leagueTeams: TeamRecord[] = [];

  for (const row of VLEAGUE_2025_FINAL_ORDER) {
    const team = await upsertTeam(row);
    leagueTeams.push(team);
    await upsertManager(
      team,
      [completedSeason.id, targetSeason.id],
      passwordHash,
    );
  }

  const leagueTeamIds = leagueTeams.map((team) => team.id);

  await prisma.match.deleteMany({ where: { seasonId: completedSeason.id } });
  await prisma.standing.deleteMany({ where: { seasonId: completedSeason.id } });
  await prisma.drawLotResult.deleteMany({
    where: { seasonId: completedSeason.id },
  });
  await prisma.seasonTeam.deleteMany({
    where: {
      seasonId: completedSeason.id,
      teamId: { notIn: leagueTeamIds },
    },
  });

  for (const team of leagueTeams) {
    await prisma.seasonTeam.upsert({
      where: {
        seasonId_teamId: {
          seasonId: completedSeason.id,
          teamId: team.id,
        },
      },
      update: {
        status: SeasonTeamStatus.APPROVED,
        registeredAt: new Date('2025-08-01T00:00:00.000Z'),
        approvedAt: new Date('2025-08-15T00:00:00.000Z'),
        ownerName: `Công ty chủ quản ${team.name}`,
        ownerCountry: 'Việt Nam',
        ownerAddress: team.name,
        teamIntroduction: `${team.name} tham dự ${COMPLETED_SEASON_NAME}.`,
        primaryKit: 'Áo màu chính thức theo nhận diện CLB',
        backupKit: 'Áo dự bị màu tương phản',
        participationFeePaid: true,
        feePaidAt: new Date('2025-08-10T00:00:00.000Z'),
        feeReceiptCode: `FEE-2025-${slugTeamName(team.name).toUpperCase()}`,
        externalCompetitionSchedule: 'Cúp Quốc gia 2025-2026',
        applicationSubmittedAt: new Date('2025-08-01T00:00:00.000Z'),
        applicationReviewNote: null,
      },
      create: {
        seasonId: completedSeason.id,
        teamId: team.id,
        status: SeasonTeamStatus.APPROVED,
        registeredAt: new Date('2025-08-01T00:00:00.000Z'),
        approvedAt: new Date('2025-08-15T00:00:00.000Z'),
        ownerName: `Công ty chủ quản ${team.name}`,
        ownerCountry: 'Việt Nam',
        ownerAddress: team.name,
        teamIntroduction: `${team.name} tham dự ${COMPLETED_SEASON_NAME}.`,
        primaryKit: 'Áo màu chính thức theo nhận diện CLB',
        backupKit: 'Áo dự bị màu tương phản',
        participationFeePaid: true,
        feePaidAt: new Date('2025-08-10T00:00:00.000Z'),
        feeReceiptCode: `FEE-2025-${slugTeamName(team.name).toUpperCase()}`,
        externalCompetitionSchedule: 'Cúp Quốc gia 2025-2026',
        applicationSubmittedAt: new Date('2025-08-01T00:00:00.000Z'),
      },
    });
  }

  const { matches, stats } = buildRoundRobin(
    leagueTeamIds,
    completedSeason.id,
    new Date('2025-09-06T00:00:00.000Z'),
  );
  await prisma.match.createMany({ data: matches });

  const standings = stats
    .map((standing) => ({
      ...standing,
      goalDiff: standing.goalsFor - standing.goalsAgainst,
    }))
    .sort((a, b) => b.points - a.points || b.goalDiff - a.goalDiff);

  for (const [index, standing] of standings.entries()) {
    await prisma.standing.upsert({
      where: {
        seasonId_teamId: {
          seasonId: completedSeason.id,
          teamId: standing.teamId,
        },
      },
      update: {
        played: standing.played,
        win: standing.win,
        draw: standing.draw,
        loss: standing.loss,
        goalsFor: standing.goalsFor,
        goalsAgainst: standing.goalsAgainst,
        goalDiff: standing.goalDiff,
        points: standing.points,
        rank: index + 1,
      },
      create: {
        seasonId: completedSeason.id,
        teamId: standing.teamId,
        played: standing.played,
        win: standing.win,
        draw: standing.draw,
        loss: standing.loss,
        goalsFor: standing.goalsFor,
        goalsAgainst: standing.goalsAgainst,
        goalDiff: standing.goalDiff,
        points: standing.points,
        rank: index + 1,
      },
    });
  }

  for (const row of VLEAGUE_2_2025_PROMOTION_ORDER) {
    const team = await upsertTeam(row, row.logoUrl);
    await upsertManager(team, [targetSeason.id], passwordHash);

    await prisma.promotionCandidate.upsert({
      where: {
        seasonId_teamId: {
          seasonId: targetSeason.id,
          teamId: team.id,
        },
      },
      update: {
        rank: row.rank,
        sourceCompetition: 'V.League 2 2025-26',
        qualificationType: row.qualificationType,
        status: PromotionCandidateStatus.ELIGIBLE,
        note: row.note,
      },
      create: {
        seasonId: targetSeason.id,
        teamId: team.id,
        rank: row.rank,
        sourceCompetition: 'V.League 2 2025-26',
        qualificationType: row.qualificationType,
        status: PromotionCandidateStatus.ELIGIBLE,
        note: row.note,
      },
    });
  }

  await prisma.season.update({
    where: { id: completedSeason.id },
    data: { status: SeasonStatus.COMPLETED, endDate: SEED_NOW },
  });

  console.log(
    `Seeded ${COMPLETED_SEASON_NAME}: ${leagueTeams.length} teams, ${matches.length} finished matches.`,
  );
  console.log(`Top 8 source ready for ${targetSeason.name}.`);
  console.log('Top 8 previous-season teams:');
  leagueTeams.slice(0, 8).forEach((team, index) => {
    console.log(`  #${index + 1} ${team.name}`);
  });
  console.log('Promotion snapshot ready for target season:');
  VLEAGUE_2_2025_PROMOTION_ORDER.slice(0, 2).forEach((team) => {
    console.log(`  #${team.rank} ${team.name} - ${team.note}`);
  });
  console.log(`Demo manager password: ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error('V.League 2025-2026 seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

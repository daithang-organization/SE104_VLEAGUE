import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
  PromotionCandidateStatus,
  PromotionQualificationType,
  SeasonStatus,
  TeamStatus,
  UserRole,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env['DATABASE_URL'] });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEMO_PASSWORD = 'Demo@12345';
const SOURCE_COMPETITION = 'V.League 2 2025-26';
const DEFAULT_PROMOTION_CITY = 'Vi\u1ec7t Nam';
const DEFAULT_TARGET_SEASON = {
  name: 'VLeague 2026-2027',
  year: 2026,
  startDate: new Date('2026-09-01'),
  endDate: new Date('2027-06-30'),
};

type PromotionSeedRow = {
  rank: number;
  fileName: string;
  shortName: string;
  city?: string;
  stadium: {
    name: string;
    city: string;
    address: string;
    capacity: number;
  };
  qualificationType: PromotionQualificationType;
  note: string;
};

const PROMOTION_CANDIDATES: PromotionSeedRow[] = [
  {
    rank: 1,
    fileName: 'Bắc Ninh FC.svg',
    shortName: 'BN',
    city: 'Bắc Ninh',
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
    fileName: 'Long An FC.png',
    shortName: 'LA',
    city: 'Tây Ninh',
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
    fileName: 'Quy Nhơn United.png',
    shortName: 'QNU',
    city: 'Gia Lai',
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
    fileName: 'Quảng Ninh FC.png',
    shortName: 'QNINH',
    city: 'Quảng Ninh',
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
    fileName: 'Sanna Khánh Hòa FC.png',
    shortName: 'SKH',
    city: 'Khánh Hòa',
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
    fileName: 'Thanh Niên TP Hồ Chí Minh FC.png',
    shortName: 'TNHCM',
    city: 'TP. Hồ Chí Minh',
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
    fileName: 'Trường Tươi Đồng Nai.png',
    shortName: 'TTDN',
    city: 'Đồng Nai',
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
    fileName: 'Trẻ PVF CAND.png',
    shortName: 'PVF',
    city: 'Hưng Yên',
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
    fileName: 'Xuân Thiện Phú Thọ FC.png',
    shortName: 'PT',
    city: 'Phú Thọ',
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
    fileName: 'Đại học Văn Hiến FC.png',
    shortName: 'VHU',
    city: 'TP. Hồ Chí Minh',
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
    fileName: 'Đồng Tháp FC.png',
    shortName: 'DT',
    city: 'Đồng Tháp',
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

function getRepoRoot() {
  return path.basename(process.cwd()) === 'api'
    ? path.resolve(process.cwd(), '../..')
    : process.cwd();
}

function teamNameFromFile(fileName: string) {
  return path.parse(fileName).name;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')
    .replace(/\.+/g, '.');
}

async function findTargetSeason() {
  const targetSeasonId = process.env['PROMOTION_TARGET_SEASON_ID'];
  if (targetSeasonId) {
    return prisma.season.findUnique({ where: { id: targetSeasonId } });
  }

  const targetSeasonName = process.env['PROMOTION_TARGET_SEASON_NAME'];
  if (targetSeasonName) {
    return prisma.season.findFirst({ where: { name: targetSeasonName } });
  }

  const upcomingSeason = await prisma.season.findFirst({
    where: { status: SeasonStatus.UPCOMING },
    orderBy: { year: 'desc' },
  });

  if (upcomingSeason) return upcomingSeason;

  return prisma.season.upsert({
    where: { name: DEFAULT_TARGET_SEASON.name },
    update: {
      year: DEFAULT_TARGET_SEASON.year,
      startDate: DEFAULT_TARGET_SEASON.startDate,
      endDate: DEFAULT_TARGET_SEASON.endDate,
      status: SeasonStatus.UPCOMING,
    },
    create: {
      ...DEFAULT_TARGET_SEASON,
      status: SeasonStatus.UPCOMING,
    },
  });
}

async function main() {
  const repoRoot = getRepoRoot();
  const sourceDir = path.join(repoRoot, 'promo_candidates');
  const missingFiles = PROMOTION_CANDIDATES.filter(
    (row) => !fs.existsSync(path.join(sourceDir, row.fileName)),
  );

  if (missingFiles.length > 0) {
    throw new Error(
      `Missing promotion candidate logo files: ${missingFiles
        .map((row) => row.fileName)
        .join(', ')}`,
    );
  }

  const targetSeason = await findTargetSeason();
  if (!targetSeason) {
    throw new Error(
      'No target season found. Set PROMOTION_TARGET_SEASON_ID or PROMOTION_TARGET_SEASON_NAME.',
    );
  }

  const managerRole = await prisma.role.upsert({
    where: { name: UserRole.TEAM_MANAGER },
    update: {},
    create: {
      name: UserRole.TEAM_MANAGER,
      description: 'Quản lý đội bóng',
    },
  });
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  for (const row of PROMOTION_CANDIDATES) {
    const teamName = teamNameFromFile(row.fileName);
    const logoUrl = `/promo_candidates/${row.fileName}`;
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

    const team = await prisma.team.upsert({
      where: { name: teamName },
      update: {
        shortName: row.shortName,
        city: row.city ?? DEFAULT_PROMOTION_CITY,
        logoUrl,
        status: TeamStatus.ACTIVE,
        stadiumId: stadium.id,
      },
      create: {
        name: teamName,
        shortName: row.shortName,
        city: row.city ?? DEFAULT_PROMOTION_CITY,
        logoUrl,
        status: TeamStatus.ACTIVE,
        stadiumId: stadium.id,
      },
    });

    const managerEmail = `manager.${slugify(teamName)}@demo.local`;
    const manager = await prisma.user.upsert({
      where: { email: managerEmail },
      update: {
        role: UserRole.TEAM_MANAGER,
        roleId: managerRole.id,
        managedTeamId: team.id,
        passwordHash,
        emailVerified: true,
        name: `Manager ${teamName}`,
      },
      create: {
        email: managerEmail,
        role: UserRole.TEAM_MANAGER,
        roleId: managerRole.id,
        managedTeamId: team.id,
        passwordHash,
        emailVerified: true,
        name: `Manager ${teamName}`,
      },
    });

    await prisma.teamManagerAssignment.upsert({
      where: {
        userId_seasonId: {
          userId: manager.id,
          seasonId: targetSeason.id,
        },
      },
      update: { teamId: team.id },
      create: {
        userId: manager.id,
        seasonId: targetSeason.id,
        teamId: team.id,
      },
    });

    await prisma.promotionCandidate.upsert({
      where: {
        seasonId_teamId: {
          seasonId: targetSeason.id,
          teamId: team.id,
        },
      },
      update: {
        rank: row.rank,
        sourceCompetition: SOURCE_COMPETITION,
        qualificationType: row.qualificationType,
        note: row.note,
      },
      create: {
        seasonId: targetSeason.id,
        teamId: team.id,
        rank: row.rank,
        sourceCompetition: SOURCE_COMPETITION,
        qualificationType: row.qualificationType,
        note: row.note,
        status: PromotionCandidateStatus.ELIGIBLE,
      },
    });

    console.log(
      `#${row.rank} ${teamName} -> ${row.stadium.name} -> ${logoUrl}`,
    );
  }

  console.log(
    `Promotion candidates ready for ${targetSeason.name}. Demo manager password: ${DEMO_PASSWORD}`,
  );
}

main()
  .catch((error) => {
    console.error('Promotion candidate seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

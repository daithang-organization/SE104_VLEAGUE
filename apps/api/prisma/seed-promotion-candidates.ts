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

type PromotionSeedRow = {
  rank: number;
  fileName: string;
  shortName: string;
  city?: string;
  qualificationType: PromotionQualificationType;
  note: string;
};

const PROMOTION_CANDIDATES: PromotionSeedRow[] = [
  {
    rank: 1,
    fileName: 'Bắc Ninh FC.svg',
    shortName: 'BN',
    qualificationType: PromotionQualificationType.CHAMPION,
    note: 'Vô địch V.League 2 2025-26',
  },
  {
    rank: 2,
    fileName: 'Long An FC.png',
    shortName: 'LA',
    city: 'Long An',
    qualificationType: PromotionQualificationType.RUNNER_UP,
    note: 'Á quân V.League 2 2025-26',
  },
  {
    rank: 3,
    fileName: 'Quy Nhơn United.png',
    shortName: 'QNU',
    qualificationType: PromotionQualificationType.PLAYOFF,
    note: 'Suất play-off V.League 2 2025-26',
  },
  {
    rank: 4,
    fileName: 'Quảng Ninh FC.png',
    shortName: 'QNINH',
    qualificationType: PromotionQualificationType.REPLACEMENT_POOL,
    note: 'Danh sách dự phòng thăng hạng',
  },
  {
    rank: 5,
    fileName: 'Sanna Khánh Hòa FC.png',
    shortName: 'SKH',
    qualificationType: PromotionQualificationType.REPLACEMENT_POOL,
    note: 'Danh sách dự phòng thăng hạng',
  },
  {
    rank: 6,
    fileName: 'Thanh Niên TP Hồ Chí Minh FC.png',
    shortName: 'TNHCM',
    qualificationType: PromotionQualificationType.REPLACEMENT_POOL,
    note: 'Danh sách dự phòng thăng hạng',
  },
  {
    rank: 7,
    fileName: 'Trường Tươi Đồng Nai.png',
    shortName: 'TTDN',
    qualificationType: PromotionQualificationType.REPLACEMENT_POOL,
    note: 'Danh sách dự phòng thăng hạng',
  },
  {
    rank: 8,
    fileName: 'Trẻ PVF CAND.png',
    shortName: 'PVF',
    qualificationType: PromotionQualificationType.REPLACEMENT_POOL,
    note: 'Danh sách dự phòng thăng hạng',
  },
  {
    rank: 9,
    fileName: 'Xuân Thiện Phú Thọ FC.png',
    shortName: 'PT',
    qualificationType: PromotionQualificationType.REPLACEMENT_POOL,
    note: 'Danh sách dự phòng thăng hạng',
  },
  {
    rank: 10,
    fileName: 'Đại học Văn Hiến FC.png',
    shortName: 'VHU',
    qualificationType: PromotionQualificationType.REPLACEMENT_POOL,
    note: 'Danh sách dự phòng thăng hạng',
  },
  {
    rank: 11,
    fileName: 'Đồng Tháp FC.png',
    shortName: 'DT',
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

  return prisma.season.findFirst({
    where: { status: SeasonStatus.UPCOMING },
    orderBy: { year: 'desc' },
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
    const team = await prisma.team.upsert({
      where: { name: teamName },
      update: {
        shortName: row.shortName,
        city: row.city ?? DEFAULT_PROMOTION_CITY,
        logoUrl,
        status: TeamStatus.ACTIVE,
      },
      create: {
        name: teamName,
        shortName: row.shortName,
        city: row.city ?? DEFAULT_PROMOTION_CITY,
        logoUrl,
        status: TeamStatus.ACTIVE,
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

    console.log(`#${row.rank} ${teamName} -> ${logoUrl}`);
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

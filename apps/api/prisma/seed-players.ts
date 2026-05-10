import { PrismaPg } from '@prisma/adapter-pg';
import { PlayerPosition, PlayerType, PrismaClient } from '@prisma/client';
import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env['DATABASE_URL'] });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ── Vietnamese player name parts ──
const HO = [
  'Nguyễn',
  'Trần',
  'Lê',
  'Phạm',
  'Hoàng',
  'Huỳnh',
  'Phan',
  'Vũ',
  'Võ',
  'Đặng',
  'Bùi',
  'Đỗ',
  'Hồ',
  'Ngô',
  'Dương',
  'Lý',
  'Đinh',
];
const DEM = [
  'Văn',
  'Hữu',
  'Đức',
  'Quốc',
  'Công',
  'Xuân',
  'Minh',
  'Tiến',
  'Anh',
  'Tấn',
];
const TEN = [
  'Hùng',
  'Dũng',
  'Thắng',
  'Tuấn',
  'Long',
  'Phong',
  'Hải',
  'Sơn',
  'Đức',
  'Bình',
  'Toàn',
  'Hoàng',
  'Nam',
  'Quang',
  'Vũ',
  'Trung',
  'Khánh',
  'Tùng',
  'Linh',
  'Hiếu',
  'Đạt',
  'Kiên',
  'Lâm',
  'Tài',
  'Nghĩa',
  'Hưng',
  'Trường',
  'Phúc',
  'Thiện',
  'Minh',
  'Thành',
  'Cường',
  'Khải',
  'Vinh',
  'Bảo',
  'Nhật',
  'Trí',
  'An',
  'Khoa',
  'Mạnh',
];

// ── Foreign player names ──
const FOREIGN_NAMES = [
  'Rimario Gordon',
  'Hendrio Silva',
  'Bruno Cunha',
  'Lucas Souza',
  'Rafaelson',
  'Geovane Magno',
  'Diego Fagan',
  'Olaha Friday',
  'Janclesio Santos',
  'Pedro Paulo',
  'Anderson Lima',
  'Josue Homma',
  'Felipe Martins',
  'Caique Oliveira',
  'Negueba',
  'Dayo Olalekan',
  'Mpande Kalombo',
  'Ewerton Silva',
  'Kevin Njoku',
  'Alan Grafite',
  'Vitor Araújo',
  'Stefan Mueller',
  'Carlos Bernal',
  'Adriano Costa',
  'Moses Oloya',
  'Abass Mohammed',
  'Oseni Ibrahim',
  'John Mary',
  'Emmanuel Nduka',
  'Brandon Aguilera',
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function generateVietnameseName(usedNames: Set<string>): string {
  let name: string;
  let attempts = 0;
  do {
    name = `${randomItem(HO)} ${randomItem(DEM)} ${randomItem(TEN)}`;
    attempts++;
    if (attempts > 100) {
      // Append random number suffix to avoid infinite loop
      name = `${name} ${Math.floor(Math.random() * 100)}`;
    }
  } while (usedNames.has(name));
  usedNames.add(name);
  return name;
}

function randomDob(): Date {
  // Born between 1993-2004 (age 21-32 in 2025)
  const year = 1993 + Math.floor(Math.random() * 12);
  const month = Math.floor(Math.random() * 12);
  const day = 1 + Math.floor(Math.random() * 28);
  return new Date(year, month, day);
}

// Each team gets: 3 GK, 8 DF, 10 MF, 5 FW (domestic) + 3 foreign = 29 players total
const SQUAD_TEMPLATE: { position: PlayerPosition; count: number }[] = [
  { position: PlayerPosition.GK, count: 3 },
  { position: PlayerPosition.DF, count: 8 },
  { position: PlayerPosition.MF, count: 10 },
  { position: PlayerPosition.FW, count: 5 },
];

async function main() {
  console.log('🏟️  Seeding players and rosters...\n');

  const teams = await prisma.team.findMany({ orderBy: { name: 'asc' } });
  console.log(`📊 Found ${teams.length} teams\n`);

  if (teams.length === 0) {
    console.log('❌ No teams found. Run seed-teams.ts first.');
    return;
  }

  const usedNames = new Set<string>();
  let foreignNamesIdx = 0;
  let totalPlayersCreated = 0;
  let totalRosterEntries = 0;

  for (const team of teams) {
    console.log(`\n🔵 ${team.name}`);

    const players: {
      id: string;
      fullName: string;
      position: PlayerPosition;
      isForeign: boolean;
    }[] = [];

    // Create domestic players
    for (const tmpl of SQUAD_TEMPLATE) {
      for (let i = 0; i < tmpl.count; i++) {
        const name = generateVietnameseName(usedNames);
        const player = await prisma.player.create({
          data: {
            fullName: name,
            dob: randomDob(),
            nationality: 'Việt Nam',
            position: tmpl.position,
            playerType: PlayerType.DOMESTIC,
            heightCm: 165 + Math.floor(Math.random() * 20),
            weightKg: 60 + Math.floor(Math.random() * 20),
          },
        });
        players.push({
          id: player.id,
          fullName: player.fullName,
          position: tmpl.position,
          isForeign: false,
        });
        totalPlayersCreated++;
      }
    }

    // Create 3 foreign players (1 DF, 1 MF, 1 FW)
    const foreignPositions: PlayerPosition[] = [
      PlayerPosition.DF,
      PlayerPosition.MF,
      PlayerPosition.FW,
    ];
    for (const pos of foreignPositions) {
      const name = FOREIGN_NAMES[foreignNamesIdx % FOREIGN_NAMES.length]!;
      foreignNamesIdx++;
      const player = await prisma.player.create({
        data: {
          fullName: name,
          dob: randomDob(),
          nationality:
            pos === PlayerPosition.FW
              ? 'Brazil'
              : pos === PlayerPosition.MF
                ? 'Nigeria'
                : 'Brazil',
          position: pos,
          playerType: PlayerType.FOREIGN,
          heightCm: 170 + Math.floor(Math.random() * 15),
          weightKg: 65 + Math.floor(Math.random() * 20),
        },
      });
      players.push({
        id: player.id,
        fullName: player.fullName,
        position: pos,
        isForeign: true,
      });
      totalPlayersCreated++;
    }

    // Assign all players to roster (TeamPlayer)
    let jersey = 1;
    for (const p of players) {
      await prisma.teamPlayer.create({
        data: {
          teamId: team.id,
          playerId: p.id,
          jerseyNumber: jersey,
        },
      });
      const flag = p.isForeign ? '🌍' : '🇻🇳';
      console.log(`  ${flag} #${jersey} ${p.fullName} (${p.position})`);
      jersey++;
      totalRosterEntries++;
    }
  }

  console.log(`\n✅ Created ${totalPlayersCreated} players`);
  console.log(`✅ Created ${totalRosterEntries} roster entries`);
  console.log(
    `\n📊 Summary per team: 15 domestic + 3 foreign = 18 players each`,
  );

  await prisma.$disconnect();
  await pool.end();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  await pool.end();
  process.exit(1);
});

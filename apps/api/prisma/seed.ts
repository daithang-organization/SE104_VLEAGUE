import { PrismaClient, PlayerPosition, TeamStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

const pool = new pg.Pool({ connectionString: process.env['DATABASE_URL'] });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // clear data (dev only)
  await prisma.player.deleteMany();
  await prisma.team.deleteMany();

  const teams = await prisma.team.createMany({
    data: [
      { name: 'Hà Nội FC', status: TeamStatus.ACTIVE },
      { name: 'TP.HCM FC', status: TeamStatus.ACTIVE },
    ],
  });

  // lấy lại team records để seed player (vì createMany không return ids)
  const [team1, team2] = await prisma.team.findMany({ orderBy: { name: 'asc' } });

  // 10 players dummy
  const playersData = [
    { fullName: 'Nguyễn Văn A', dob: new Date('2000-01-10'), nationality: 'Vietnam', position: PlayerPosition.MF },
    { fullName: 'Trần Văn B', dob: new Date('1999-03-22'), nationality: 'Vietnam', position: PlayerPosition.DF },
    { fullName: 'Lê Văn C', dob: new Date('2001-07-05'), nationality: 'Vietnam', position: PlayerPosition.FW },
    { fullName: 'Phạm Văn D', dob: new Date('1998-11-12'), nationality: 'Vietnam', position: PlayerPosition.GK },
    { fullName: 'Hoàng Văn E', dob: new Date('2002-02-18'), nationality: 'Vietnam', position: PlayerPosition.MF },

    { fullName: 'Võ Văn F', dob: new Date('2000-08-09'), nationality: 'Vietnam', position: PlayerPosition.DF },
    { fullName: 'Đặng Văn G', dob: new Date('1999-12-01'), nationality: 'Vietnam', position: PlayerPosition.FW },
    { fullName: 'Bùi Văn H', dob: new Date('2001-04-14'), nationality: 'Vietnam', position: PlayerPosition.MF },
    { fullName: 'Đỗ Văn I', dob: new Date('1997-06-30'), nationality: 'Vietnam', position: PlayerPosition.DF },
    { fullName: 'Ngô Văn K', dob: new Date('2003-09-21'), nationality: 'Vietnam', position: PlayerPosition.FW },
  ];

  // Chia đều 5-5 cho 2 đội (AC không yêu cầu teamId, nên seed vào bảng players độc lập cũng OK)
  // Nhưng nếu sau này bạn muốn players gắn teamId, thì Sprint 0 bạn chưa cần.
  await prisma.player.createMany({ data: playersData });

  console.log('Seeded:', { teams: teams.count, players: playersData.length });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

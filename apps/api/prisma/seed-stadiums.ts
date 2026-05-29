import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env['DATABASE_URL'] });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Danh sách sân vận động đạt tiêu chuẩn VLeague
const STADIUMS = [
  {
    name: 'Sân vận động Mỹ Đình',
    address: 'Nam Từ Liêm, Hà Nội',
    city: 'Hà Nội',
    capacity: 40192,
  },
  {
    name: 'Sân vận động Hàng Đẫy',
    address: 'Trịnh Hoài Đức, Đống Đa, Hà Nội',
    city: 'Hà Nội',
    capacity: 22500,
  },
  {
    name: 'Sân vận động Thống Nhất',
    address: 'Quận 10, TP. Hồ Chí Minh',
    city: 'TP. Hồ Chí Minh',
    capacity: 25000,
  },
  {
    name: 'Sân vận động Lạch Tray',
    address: 'Lê Lợi, Ngô Quyền, Hải Phòng',
    city: 'Hải Phòng',
    capacity: 30000,
  },
  {
    name: 'Sân vận động Thiên Trường',
    address: 'P. Nam Định, Ninh Bình',
    city: 'Ninh Bình',
    capacity: 30000,
  },
  {
    name: 'Sân vận động Pleiku',
    address: 'TP. Pleiku, Gia Lai',
    city: 'Gia Lai',
    capacity: 12000,
  },
  {
    name: 'Sân vận động Hòa Xuân',
    address: 'Cẩm Lệ, Đà Nẵng',
    city: 'Đà Nẵng',
    capacity: 20500,
  },
  {
    name: 'Sân vận động Vinh',
    address: 'P. Vinh, Nghệ An',
    city: 'Nghệ An',
    capacity: 18000,
  },
  {
    name: 'Sân vận động Quy Nhơn',
    address: 'Quy Nhơn, Gia Lai',
    city: 'Gia Lai',
    capacity: 20000,
  },
  {
    name: 'Sân vận động Thanh Hóa',
    address: 'TP. Thanh Hóa',
    city: 'Thanh Hóa',
    capacity: 14000,
  },
  {
    name: 'Sân vận động Gò Đậu',
    address: 'P. Thủ Dầu Một, TP. Hồ Chí Minh',
    city: 'TP. Hồ Chí Minh',
    capacity: 18250,
  },
  {
    name: 'Sân vận động Cần Thơ',
    address: 'Ninh Kiều, TP. Cần Thơ',
    city: 'Cần Thơ',
    capacity: 50000,
  },
  {
    name: 'Sân vận động Bà Rịa',
    address: 'P. Bà Rịa, TP. Hồ Chí Minh',
    city: 'TP. Hồ Chí Minh',
    capacity: 16000,
  },
  {
    name: 'Sân vận động Tự Do',
    address: 'TP. Huế, Thừa Thiên Huế',
    city: 'Huế',
    capacity: 25000,
  },
  {
    name: 'Sân vận động Long An',
    address: 'P. Long An, Tây Ninh',
    city: 'Tây Ninh',
    capacity: 19975,
  },
  {
    name: 'Sân vận động 19 Tháng 8',
    address: 'TP. Nha Trang, Khánh Hòa',
    city: 'Khánh Hòa',
    capacity: 18000,
  },
  {
    name: 'Sân vận động Việt Trì',
    address: 'Thanh Miếu, Phú Thọ',
    city: 'Phú Thọ',
    capacity: 20000,
  },
  {
    name: 'Sân vận động Cao Lãnh',
    address: 'Mỹ Trà, Đồng Tháp',
    city: 'Đồng Tháp',
    capacity: 23000,
  },
  {
    name: 'Sân vận động Hà Tĩnh',
    address: 'TP Hà Tĩnh, Hà Tĩnh',
    city: 'Hà Tĩnh',
    capacity: 18000,
  },
  {
    name: 'Sân vận động Tam Kỳ',
    address: 'P. Tam Kỳ, Đà Nẵng',
    city: 'Đà Nẵng',
    capacity: 15000,
  },
  {
    name: 'Sân vận động Việt Yên',
    address: 'Việt Yên, Bắc Ninh',
    city: 'Bắc Ninh',
    capacity: 18000,
  },
  {
    name: 'Sân vận động Cẩm Phả',
    address: 'Cẩm Phả, Quảng Ninh',
    city: 'Quảng Ninh',
    capacity: 16000,
  },
  {
    name: 'Sân vận động Bình Phước',
    address: 'P. Bình Phước, Đồng Nai',
    city: 'Đồng Nai',
    capacity: 11000,
  },
  {
    name: 'Sân vận động PVF',
    address: 'Nghĩa Trụ, Hưng Yên',
    city: 'Hưng Yên',
    capacity: 4600,
  },
];

async function main() {
  console.log('🏟️  Seeding Vietnamese VLeague stadiums...\n');

  for (const stadium of STADIUMS) {
    const s = await prisma.stadium.upsert({
      where: { name: stadium.name },
      update: {
        address: stadium.address,
        city: stadium.city,
        country: 'Việt Nam',
        capacity: stadium.capacity,
        fifaStars: 2,
      },
      create: {
        ...stadium,
        country: 'Việt Nam',
        fifaStars: 2,
      },
    });
    console.log(
      `  ✅ ${s.name} (${s.city}) — ${s.capacity?.toLocaleString() ?? '?'} chỗ`,
    );
  }

  const total = await prisma.stadium.count();
  console.log(`\n📊 Total stadiums in DB: ${total}`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  await pool.end();
  process.exit(1);
});

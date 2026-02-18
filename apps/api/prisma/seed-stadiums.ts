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
    address: 'Quận 10, TP.HCM',
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
    address: 'TP. Nam Định',
    city: 'Nam Định',
    capacity: 30000,
  },
  {
    name: 'Sân vận động Pleiku',
    address: 'TP. Pleiku, Gia Lai',
    city: 'Pleiku',
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
    address: 'TP. Vinh, Nghệ An',
    city: 'Vinh',
    capacity: 18000,
  },
  {
    name: 'Sân vận động Quy Nhơn',
    address: 'TP. Quy Nhơn, Bình Định',
    city: 'Quy Nhơn',
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
    address: 'TP. Thủ Dầu Một, Bình Dương',
    city: 'Bình Dương',
    capacity: 18250,
  },
  {
    name: 'Sân vận động Cần Thơ',
    address: 'Ninh Kiều, Cần Thơ',
    city: 'Cần Thơ',
    capacity: 50000,
  },
  {
    name: 'Sân vận động Bà Rịa',
    address: 'TP. Bà Rịa, Bà Rịa-Vũng Tàu',
    city: 'Bà Rịa',
    capacity: 15000,
  },
  {
    name: 'Sân vận động Tự Do',
    address: 'TP. Huế, Thừa Thiên Huế',
    city: 'Huế',
    capacity: 25000,
  },
  {
    name: 'Sân vận động Long An',
    address: 'TP. Tân An, Long An',
    city: 'Long An',
    capacity: 20000,
  },
  {
    name: 'Sân vận động 19 Tháng 8',
    address: 'Nha Trang, Khánh Hòa',
    city: 'Nha Trang',
    capacity: 22000,
  },
  {
    name: 'Sân vận động Việt Trì',
    address: 'TP. Việt Trì, Phú Thọ',
    city: 'Việt Trì',
    capacity: 20000,
  },
  {
    name: 'Sân vận động Cao Lãnh',
    address: 'TP. Cao Lãnh, Đồng Tháp',
    city: 'Cao Lãnh',
    capacity: 18000,
  },
  {
    name: 'Sân vận động Hà Tĩnh',
    address: 'TP Hà Tĩnh, Hà Tĩnh',
    city: 'Hà Tĩnh',
    capacity: 18000,
  },
  {
    name: 'Sân vận động Tam Kỳ',
    address: 'TP. Tam Kỳ, Quảng Nam',
    city: 'Tam Kỳ',
    capacity: 15000,
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
        capacity: stadium.capacity,
      },
      create: stadium,
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

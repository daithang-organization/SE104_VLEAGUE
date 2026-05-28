import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env['DATABASE_URL'] });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEMO_PASSWORD = 'Demo@12345';

const roles = [
  { name: 'ADMIN', description: 'Quản trị viên hệ thống' },
  { name: 'TEAM_MANAGER', description: 'Quản lý đội bóng' },
  { name: 'REFEREE', description: 'Trọng tài' },
  { name: 'SUPERVISOR', description: 'Giám sát viên' },
  { name: 'PUBLIC', description: 'Người dùng công khai' },
] as const;

const demoUsers = [
  { email: 'admin@demo.local', role: UserRole.ADMIN, name: 'Admin Demo' },
  {
    email: 'teammanager@demo.local',
    role: UserRole.TEAM_MANAGER,
    name: 'Team Manager Demo',
  },
  { email: 'referee@demo.local', role: UserRole.REFEREE, name: 'Referee Demo' },
  {
    email: 'supervisor@demo.local',
    role: UserRole.SUPERVISOR,
    name: 'Supervisor Demo',
  },
  { email: 'public@demo.local', role: UserRole.PUBLIC, name: 'Public Demo' },
] as const;

async function main() {
  console.log('Seeding roles and demo users...');

  const roleIds = new Map<string, string>();
  for (const roleData of roles) {
    const role = await prisma.role.upsert({
      where: { name: roleData.name },
      update: { description: roleData.description },
      create: roleData,
    });
    roleIds.set(role.name, role.id);
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  for (const userData of demoUsers) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        role: userData.role,
        roleId: roleIds.get(userData.role),
        passwordHash,
        emailVerified: true,
        name: userData.name,
      },
      create: {
        email: userData.email,
        role: userData.role,
        roleId: roleIds.get(userData.role),
        passwordHash,
        emailVerified: true,
        name: userData.name,
      },
    });
  }

  console.log(`Demo users ready. Password for all accounts: ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error('Demo user seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

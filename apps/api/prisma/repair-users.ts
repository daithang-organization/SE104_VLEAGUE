import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env['DATABASE_URL'] });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🔧 Repairing User Roles and Passwords...');

  // 1. Get all defined roles from the database
  const roles = await prisma.role.findMany();
  const roleMap = new Map(roles.map((r) => [r.name, r.id]));
  console.log(`📊 Found ${roles.length} roles in DB.`);

  // 2. Hash the default password inside the current environment
  const DEFAULT_PASS = 'Demo@12345';
  const passwordHash = await bcrypt.hash(DEFAULT_PASS, 10);

  // 3. Update all existing users
  const users = await prisma.user.findMany();
  console.log(`👤 Processing ${users.length} users...`);

  for (const user of users) {
    const roleId = roleMap.get(user.role); // Match Enum role string to Role table ID

    await prisma.user.update({
      where: { id: user.id },
      data: {
        roleId: roleId || undefined,
        passwordHash: passwordHash, // Reset password to ensure bcrypt compatibility
        emailVerified: true,
      },
    });
    console.log(
      `  ✅ Fixed: ${user.email} (${user.role} -> ${roleId ? 'RoleID set' : 'No RoleID found'})`,
    );
  }

  console.log('\n✨ Repair complete! Try logging in with:');
  console.log('📧 Email: admin@demo.local');
  console.log('🔑 Password:', DEFAULT_PASS);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(async (e) => {
  console.error('❌ Repair failed:', e);
  await prisma.$disconnect();
  await pool.end();
  process.exit(1);
});

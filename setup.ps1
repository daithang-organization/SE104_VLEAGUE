docker compose up -d db

pnpm --filter api exec prisma generate
pnpm --filter api exec prisma migrate deploy

pnpm --filter api exec tsx prisma/seed-stadiums.ts
pnpm --filter api exec tsx prisma/seed-teams.ts
pnpm --filter api exec tsx prisma/seed-players.ts
pnpm --filter api exec tsx prisma/setup-vleague-2024.ts
pnpm --filter api exec tsx prisma/setup-vleague-2025.ts
pnpm --filter api exec tsx prisma/seed-report-demo.ts
pnpm --filter api exec tsx prisma/seed-promotion-candidates.ts

pnpm dev

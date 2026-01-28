---
name: Database Management
description: Guide for managing PostgreSQL database using Prisma migrations, seeding, and schema evolution for SE104_VLEAGUE
---

# Database Management Skill

This skill covers all aspects of database management in the SE104_VLEAGUE project using Prisma ORM with PostgreSQL.

## Database Architecture

- **Database**: PostgreSQL 15+
- **ORM**: Prisma 7.x
- **Schema Location**: `apps/api/prisma/schema.prisma`
- **Migrations**: `apps/api/prisma/migrations/`
- **Connection**: PostgreSQL adapter (@prisma/adapter-pg)

## Current Database Schema

The database includes the following main entities:

### Teams
- **Table**: `teams`
- **Fields**: id (UUID), name (unique), status (ACTIVE/INACTIVE), timestamps
- **Purpose**: Store football team information

### Players
- **Table**: `players`
- **Fields**: id (UUID), fullName, dob, nationality, position (GK/DF/MF/FW), timestamps
- **Purpose**: Store player information

### Matches
- **Table**: `matches`
- **Fields**: id (UUID), roundNo, homeTeamId, awayTeamId, stadiumId, kickoffAt, status (DRAFT/PUBLISHED/LOCKED), timestamps
- **Purpose**: Store match information and scheduling

## Schema Development Workflow

### 1. Modify Schema

Edit `apps/api/prisma/schema.prisma`:

```prisma
model NewEntity {
  id        String   @id @default(uuid())
  fieldName String   @map("field_name")
  
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("new_entities")
}
```

### 2. Create Migration

> [!IMPORTANT]
> Always create a migration after modifying the schema. Never apply schema changes directly to the database without a migration.

```bash
cd apps/api
pnpm dlx prisma migrate dev --name descriptive_migration_name
```

This command will:
1. Generate SQL migration file in `prisma/migrations/`
2. Apply the migration to your local database
3. Regenerate Prisma Client

### 3. Migration Naming Convention

Use descriptive, snake_case names that explain the change:

```bash
# Good examples
pnpm dlx prisma migrate dev --name add_user_table
pnpm dlx prisma migrate dev --name add_team_status_field
pnpm dlx prisma migrate dev --name create_player_team_relation

# Avoid generic names
pnpm dlx prisma migrate dev --name update
pnpm dlx prisma migrate dev --name changes
```

## Schema Evolution Patterns

### Adding a New Field

```prisma
model Team {
  id        String     @id @default(uuid())
  name      String     @unique
  status    TeamStatus @default(ACTIVE)
  
  // New field added
  logoUrl   String?    @map("logo_url")  // Optional field
  
  createdAt DateTime   @default(now()) @map("created_at")
  updatedAt DateTime   @updatedAt @map("updated_at")

  @@map("teams")
}
```

### Adding a New Enum

```prisma
enum MatchStatus {
  DRAFT
  PUBLISHED
  LOCKED
  COMPLETED    // New value added
  CANCELLED    // New value added
}
```

> [!WARNING]
> **Enum Migration Considerations**: Adding new enum values is safe, but removing or renaming existing values requires careful migration to handle existing data.

### Adding Relationships

```prisma
model Team {
  id      String   @id @default(uuid())
  name    String   @unique
  
  // Add relation
  players Player[]
  
  @@map("teams")
}

model Player {
  id       String @id @default(uuid())
  fullName String @map("full_name")
  
  // Add foreign key
  teamId   String? @map("team_id")
  team     Team?   @relation(fields: [teamId], references: [id])
  
  @@map("players")
}
```

### Adding Indexes

```prisma
model Match {
  id         String      @id @default(uuid())
  roundNo    Int         @map("round_no")
  kickoffAt  DateTime?   @map("kickoff_at")
  
  // Add index for better query performance
  @@index([roundNo])
  @@index([kickoffAt])
  @@map("matches")
}
```

## Database Seeding

### Seed Script Location

`apps/api/prisma/seed.ts`

### Current Seed Data

The seed script creates:
- 2 example teams (Hoang Anh Gia Lai, Cong An Ha Noi)
- 2 example players
- 1 example draft match

### Running Seeds

```bash
cd apps/api
pnpm run db:seed
```

### Adding New Seed Data

Edit `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data (optional, use with caution)
  await prisma.match.deleteMany();
  await prisma.player.deleteMany();
  await prisma.team.deleteMany();

  // Create teams
  const team1 = await prisma.team.create({
    data: {
      name: 'Team Name',
      status: 'ACTIVE',
    },
  });

  // Create players
  await prisma.player.create({
    data: {
      fullName: 'Player Name',
      dob: new Date('1995-01-01'),
      nationality: 'Vietnam',
      position: 'FW',
    },
  });

  console.log('Seeding completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

> [!CAUTION]
> **deleteMany in production**: Never use `deleteMany()` in production seed scripts. Only use for local development and testing.

## Common Database Operations

### Reset Local Database

> [!WARNING]
> This will DELETE all data and recreate the database schema.

```bash
cd apps/api
pnpm dlx prisma migrate reset
```

This command will:
1. Drop the database
2. Create a new database
3. Apply all migrations
4. Run seed script

### View Database in Prisma Studio

```bash
cd apps/api
pnpm dlx prisma studio
```

Opens a GUI at http://localhost:5555 to browse and edit data.

### Generate Prisma Client

After pulling changes that include schema updates:

```bash
cd apps/api
pnpm dlx prisma generate
```

> [!NOTE]
> The project has a `postinstall` script, so Prisma Client is automatically generated after `pnpm install`.

### Check Migration Status

```bash
cd apps/api
pnpm dlx prisma migrate status
```

### Create Migration Without Applying

```bash
cd apps/api
pnpm dlx prisma migrate dev --create-only --name migration_name
```

Then manually edit the migration file in `prisma/migrations/` before applying.

## Environment Configuration

### Local Development

Create `apps/api/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vleague"
PORT=8080
```

### Docker PostgreSQL

The project includes Docker Compose configuration:

```bash
# Start PostgreSQL
docker compose -f infra/docker-compose.db.yml up -d

# Stop PostgreSQL
docker compose -f infra/docker-compose.db.yml down

# View logs
docker compose -f infra/docker-compose.db.yml logs -f
```

Default connection:
- **Host**: localhost
- **Port**: 5432
- **User**: postgres
- **Password**: postgres
- **Database**: vleague

## Migration Best Practices

> [!TIP]
> **Commit migrations**: Always commit migration files to Git. They are the source of truth for database schema history.

> [!TIP]
> **Review SQL**: Before applying migrations, review the generated SQL in `prisma/migrations/*/migration.sql` to ensure it does what you expect.

> [!TIP]
> **Incremental changes**: Make small, incremental schema changes rather than large sweeping changes. This makes migrations easier to review and rollback if needed.

## Troubleshooting

### Migration Conflicts

If you have conflicting migrations (e.g., after pulling from Git):

```bash
# Reset your local database
cd apps/api
pnpm dlx prisma migrate reset

# Or resolve manually
pnpm dlx prisma migrate resolve --applied <migration_name>
```

### Prisma Client Not Generated

If you see "Cannot find module '@prisma/client'":

```bash
cd apps/api
pnpm dlx prisma generate
```

### Connection Issues

1. Check PostgreSQL is running:
   ```bash
   docker ps | grep postgres
   ```

2. Verify DATABASE_URL in `.env`

3. Test connection:
   ```bash
   cd apps/api
   pnpm dlx prisma db pull
   ```

### Schema Drift Detection

Check if database schema matches Prisma schema:

```bash
cd apps/api
pnpm dlx prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datasource prisma/schema.prisma
```

## Schema Naming Conventions

> [!IMPORTANT]
> Follow these naming conventions consistently:

- **Models**: PascalCase (e.g., `Team`, `Player`, `MatchEvent`)
- **Fields**: camelCase (e.g., `fullName`, `kickoffAt`)
- **Database tables**: snake_case via `@@map("table_name")`
- **Database columns**: snake_case via `@map("column_name")`
- **Enums**: UPPER_SNAKE_CASE for values (e.g., `ACTIVE`, `DRAFT`)

## Production Considerations

> [!CAUTION]
> **Production migrations**: In production, migrations should be applied during deployment, not manually. The CI/CD pipeline should handle this.

For production databases:
1. Use `prisma migrate deploy` (not `prisma migrate dev`)
2. Never use `prisma db push` (it can cause data loss)
3. Always test migrations on staging first
4. Have a backup and rollback plan

## Useful Prisma CLI Commands

```bash
# Development
pnpm dlx prisma migrate dev          # Create and apply migration
pnpm dlx prisma generate              # Generate Prisma Client
pnpm dlx prisma studio                # Open database GUI
pnpm dlx prisma db seed               # Run seed script

# Inspection
pnpm dlx prisma migrate status        # Check migration status
pnpm dlx prisma db pull               # Introspect existing database
pnpm dlx prisma validate              # Validate schema file

# Production
pnpm dlx prisma migrate deploy        # Apply pending migrations

# Troubleshooting
pnpm dlx prisma migrate reset         # Reset database (DEV ONLY)
pnpm dlx prisma migrate resolve       # Mark migration as applied/rolled-back
pnpm dlx prisma format                # Format schema file
```

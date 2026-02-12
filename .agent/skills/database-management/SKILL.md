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

## Current Database Schema (14 Tables)

All primary keys (PK) and foreign keys (FK) use native PostgreSQL `UUID` type (`@db.Uuid` in Prisma).

### Enums (9)

`TeamStatus`, `PlayerPosition`, `PlayerType`, `MatchStatus`, `SeasonStatus`, `SeasonTeamStatus`, `EventType`, `UserRole`, `OtpType`

### Tables

| #   | Table            | Key Columns                                                                                                          | Notes                         |
| --- | ---------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| 1   | `roles`          | id, name (unique), description                                                                                       | RBAC roles                    |
| 2   | `users`          | id, email, role (enum), roleId (FK→roles), passwordHash, emailVerified                                               | Dual auth: enum + FK          |
| 3   | `refresh_tokens` | id, tokenHash, userId (FK→users), expiresAt, revokedAt                                                               | Session management            |
| 4   | `otp_codes`      | id, code, type, userId (FK→users), expiresAt                                                                         | Email verify + password reset |
| 5   | `stadiums`       | id, name (unique), address, city, capacity                                                                           | Venues                        |
| 6   | `teams`          | id, name (unique), shortName, logoUrl, city, status, stadiumId (FK→stadiums)                                         | Clubs                         |
| 7   | `seasons`        | id, name (unique), year, status, startDate, endDate                                                                  | League seasons                |
| 8   | `players`        | id, fullName, dob, nationality, position, playerType, birthPlace, heightCm, weightKg                                 | Players                       |
| 9   | `team_players`   | id, teamId (FK), playerId (FK), jerseyNumber, joinedAt, leftAt                                                       | Roster join-table             |
| 10  | `season_teams`   | id, seasonId (FK), teamId (FK), status, registeredAt, approvedAt                                                     | Season registration           |
| 11  | `matches`        | id, roundNo, leg, seasonId (FK), homeTeamId/awayTeamId (FK), stadiumId (FK), kickoffAt, status, homeScore, awayScore | Match scheduling              |
| 12  | `match_events`   | id, matchId (FK), minute, type, goalType, playerId (FK), relatedPlayerId (FK), teamId (FK)                           | In-match events               |
| 13  | `regulations`    | id, seasonId (FK), key, value, valueType                                                                             | Season config params          |
| 14  | `standings`      | id, seasonId (FK), teamId (FK), played, win, draw, loss, goalsFor, goalsAgainst, goalDiff, points, rank              | League table                  |

### Key Constraints

- `team_players`: `@@unique([teamId, playerId, joinedAt])`
- `season_teams`: `@@unique([seasonId, teamId])`
- `regulations`: `@@unique([seasonId, key])`
- `standings`: `@@unique([seasonId, teamId])`
- `matches`: `@@index([seasonId, roundNo])`

## Schema Development Workflow

### 1. Modify Schema

Edit `apps/api/prisma/schema.prisma`:

```prisma
model NewEntity {
  id        String   @id @default(uuid()) @db.Uuid
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
  id        String     @id @default(uuid()) @db.Uuid
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
  id      String   @id @default(uuid()) @db.Uuid
  name    String   @unique

  // Add relation
  players Player[]

  @@map("teams")
}

model Player {
  id       String @id @default(uuid()) @db.Uuid
  fullName String @map("full_name")

  // Add foreign key
  teamId   String? @map("team_id") @db.Uuid
  team     Team?   @relation(fields: [teamId], references: [id])

  @@map("players")
}
```

### Adding Indexes

```prisma
model Match {
  id         String      @id @default(uuid()) @db.Uuid
  roundNo    Int         @map("round_no")
  seasonId   String?     @map("season_id") @db.Uuid
  kickoffAt  DateTime?   @map("kickoff_at")

  // Add indexes for better query performance
  @@index([roundNo])
  @@index([kickoffAt])
  @@index([seasonId, roundNo])  // Composite index
  @@map("matches")
}
```

## Database Seeding

### Seed Script Location

`apps/api/prisma/seed.ts`

### Current Seed Data

The seed script creates:

- **5 roles**: ADMIN, TEAM_MANAGER, REFEREE, SUPERVISOR, PUBLIC
- **3 demo users**: admin, referee, viewer — each linked to its role via `roleId` FK
- **Default regulations**: min/max player age, max foreign players, scoring rules

> [!IMPORTANT]
> When adding new seeded users, always find the matching `Role` record and set `roleId` to ensure the RBAC FK relationship is populated.

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

## Backup and Restore

### Backup Database

```bash
# Using pg_dump (recommended)
docker exec vleague-postgres pg_dump -U postgres -d vleague > backup_$(date +%Y%m%d).sql

# Compressed backup
docker exec vleague-postgres pg_dump -U postgres -d vleague | gzip > backup_$(date +%Y%m%d).sql.gz

# Custom format (supports parallel restore)
docker exec vleague-postgres pg_dump -U postgres -d vleague -Fc > backup.dump
```

### Restore Database

```bash
# From SQL file
docker exec -i vleague-postgres psql -U postgres -d vleague < backup.sql

# From compressed file
gunzip -c backup.sql.gz | docker exec -i vleague-postgres psql -U postgres -d vleague

# From custom format
docker exec -i vleague-postgres pg_restore -U postgres -d vleague < backup.dump
```

> [!CAUTION]
> Always backup before major migrations or data changes. Test restore process regularly.

## Soft Delete Pattern

### Schema with Soft Delete

```prisma
model Team {
  id        String    @id @default(uuid()) @db.Uuid
  name      String    @unique
  status    TeamStatus @default(ACTIVE)

  deletedAt DateTime? @map("deleted_at")  // Soft delete field

  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")

  @@map("teams")
}
```

### Prisma Middleware for Soft Delete

```typescript
// prisma/soft-delete.middleware.ts
import { Prisma } from '@prisma/client';

export function softDeleteMiddleware(): Prisma.Middleware {
  return async (params, next) => {
    // Intercept delete operations
    if (params.action === 'delete') {
      params.action = 'update';
      params.args['data'] = { deletedAt: new Date() };
    }

    if (params.action === 'deleteMany') {
      params.action = 'updateMany';
      if (params.args.data !== undefined) {
        params.args.data['deletedAt'] = new Date();
      } else {
        params.args['data'] = { deletedAt: new Date() };
      }
    }

    // Filter out soft-deleted records
    if (params.action === 'findUnique' || params.action === 'findFirst') {
      params.action = 'findFirst';
      params.args.where['deletedAt'] = null;
    }

    if (params.action === 'findMany') {
      if (params.args.where) {
        if (params.args.where.deletedAt === undefined) {
          params.args.where['deletedAt'] = null;
        }
      } else {
        params.args['where'] = { deletedAt: null };
      }
    }

    return next(params);
  };
}
```

### Register Middleware

```typescript
// prisma.service.ts
import { softDeleteMiddleware } from './soft-delete.middleware';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    this.$use(softDeleteMiddleware());
    await this.$connect();
  }
}
```

## Query Optimization

### Using Indexes Effectively

```prisma
model Match {
  id         String      @id @default(uuid()) @db.Uuid
  roundNo    Int         @map("round_no")
  seasonId   String?     @map("season_id") @db.Uuid
  kickoffAt  DateTime?   @map("kickoff_at")
  status     MatchStatus @default(DRAFT)

  // Single column indexes
  @@index([roundNo])
  @@index([kickoffAt])
  @@index([status])

  // Composite index for common queries
  @@index([seasonId, roundNo])
  @@index([seasonId, status])

  @@map("matches")
}
```

### Query Analysis

```bash
# Enable query logging in development
# Add to .env
DEBUG="prisma:query"

# Or in Prisma Client
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

### Efficient Queries

```typescript
// ❌ N+1 Problem
const teams = await prisma.team.findMany();
for (const team of teams) {
  const players = await prisma.player.findMany({ where: { teamId: team.id } });
}

// ✅ Use include for relations
const teams = await prisma.team.findMany({
  include: { players: true },
});

// ✅ Select only needed fields
const teams = await prisma.team.findMany({
  select: {
    id: true,
    name: true,
    _count: { select: { players: true } },
  },
});

// ✅ Pagination
const teams = await prisma.team.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { name: 'asc' },
});
```

## Database Testing

### Test Database Configuration

```env
# .env.test
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vleague_test"
```

### Jest Setup for Database Tests

```typescript
// test/setup.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Connect to test database
  await prisma.$connect();
});

beforeEach(async () => {
  // Clean database before each test
  await prisma.$transaction([
    prisma.match.deleteMany(),
    prisma.player.deleteMany(),
    prisma.team.deleteMany(),
  ]);
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

### Database Test Example

```typescript
// teams.integration.spec.ts
describe('Teams Integration', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.team.deleteMany();
  });

  it('should create and retrieve team', async () => {
    const team = await prisma.team.create({
      data: { name: 'Test Team', status: 'ACTIVE' },
    });

    const found = await prisma.team.findUnique({
      where: { id: team.id },
    });

    expect(found).toBeDefined();
    expect(found?.name).toBe('Test Team');
  });
});
```

> [!TIP]
> Use a separate test database to avoid polluting development data. Consider using Docker for isolated test environments.

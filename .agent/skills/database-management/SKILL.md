---
name: Database Management
description: Prisma schema, migrations, seeding, and database operations for SE104_VLEAGUE
---

# Database Management Skill

## Database Architecture

**PostgreSQL 16** with **Prisma 7** (using `@prisma/adapter-pg` driver adapter with raw `pg.Pool`).

- **12 models**, **10 enums**, **13 migrations**
- All IDs: native PostgreSQL UUID (`@db.Uuid`)
- All tables: `snake_case` via `@@map()`
- All columns: `snake_case` via `@map()`

---

## Complete Table Reference

| Table            | Purpose                                  | Key Relations                                                   |
| ---------------- | ---------------------------------------- | --------------------------------------------------------------- |
| `users`          | User accounts (auth, profile, role)      | → Role, ← RefreshTokens, ← OtpCodes                             |
| `roles`          | Role definitions (RBAC)                  | ← Users                                                         |
| `refresh_tokens` | JWT refresh tokens (hashed)              | → User                                                          |
| `otp_codes`      | OTP codes (email verify, password reset) | → User                                                          |
| `teams`          | Football teams                           | → Stadium, ← TeamPlayers, ← SeasonTeams, ← Matches, ← Standings |
| `players`        | Football players                         | ← TeamPlayers, ← MatchEvents                                    |
| `stadiums`       | Stadiums                                 | ← Teams, ← Matches                                              |
| `seasons`        | League seasons                           | ← Matches, ← SeasonTeams, ← Regulations, ← Standings            |
| `team_players`   | Team-player roster (join table)          | → Team, → Player                                                |
| `season_teams`   | Season-team registration (join table)    | → Season, → Team                                                |
| `matches`        | Match records                            | → Season, → HomeTeam, → AwayTeam, → Stadium, ← MatchEvents      |
| `match_events`   | Match events (goals, cards, subs)        | → Match, → Player, → RelatedPlayer, → Team                      |
| `regulations`    | Season-scoped key-value configs          | → Season                                                        |
| `standings`      | League standings (computed/cached)       | → Season, → Team                                                |

---

## Entity Relationship Diagram

```mermaid
erDiagram
    users ||--o{ refresh_tokens : has
    users ||--o{ otp_codes : has
    users }o--|| roles : belongs_to
    teams }o--|| stadiums : home_stadium
    teams ||--o{ team_players : roster
    players ||--o{ team_players : roster
    seasons ||--o{ matches : contains
    seasons ||--o{ season_teams : registrations
    seasons ||--o{ regulations : config
    seasons ||--o{ standings : table
    teams ||--o{ season_teams : registered
    teams ||--o{ standings : ranked
    matches ||--o{ match_events : events
    matches }o--|| teams : home_team
    matches }o--|| teams : away_team
    matches }o--|| stadiums : venue
    match_events }o--|| players : player
    match_events }o--|| players : related_player
    match_events }o--|| teams : team
```

---

## Schema Development Workflow

### 1. Modify Schema

Edit `apps/api/prisma/schema.prisma`

### 2. Create Migration

```bash
cd apps/api
pnpm dlx prisma migrate dev --name descriptive_name
```

### 3. Migration Naming Convention

```
YYYYMMDDHHMMSS_descriptive_name
# Examples:
20260128113243_init_registration
20260129180318_add_auth_models
20260201000000_add_indexes
```

### 4. Generate Client

```bash
pnpm dlx prisma generate
```

> **NOTE**: `postinstall` script auto-runs `prisma generate` after `pnpm install`.

---

## Current Migrations (13)

| Migration                                | Purpose                                     |
| ---------------------------------------- | ------------------------------------------- |
| `init_registration`                      | Teams, players, team_players tables         |
| `init_matches`                           | Matches, match_events tables                |
| `add_auth_models`                        | Users, refresh_tokens                       |
| `add_team_manager_referee_roles`         | Role enum expansion                         |
| `add_roles_table`                        | Separate roles table                        |
| `add_otp_and_email_verification`         | OTP codes, email verification               |
| `add_session_profile_oauth`              | Session tracking, OAuth fields, profile     |
| `add_season_stadium_roster_models`       | Seasons, stadiums, roster                   |
| `add_indexes`                            | Performance indexes                         |
| `add_regulations_season_teams_standings` | Regulations, season_teams, standings        |
| `convert_text_to_uuid`                   | Migrate text IDs to native UUID             |
| `add_role_id_to_users`                   | Add roleId FK to users                      |
| `add_penalty_event_types`                | Add PENALTY, PENALTY_MISS to EventType enum |

---

## Database Seeding

### Master Seeder (`prisma/seed.ts`)

Chains all seed scripts in order:

```bash
cd apps/api && pnpm run db:seed
```

### Seed Scripts (7)

| Script                        | Purpose                                                       |
| ----------------------------- | ------------------------------------------------------------- |
| `seed.ts`                     | Master orchestrator                                           |
| `verify-demo-users.ts`        | 5 demo accounts (admin, manager, referee, supervisor, user)   |
| `seed-teams.ts`               | 10 V-League teams with stadium mappings                       |
| `seed-players.ts`             | 100+ Vietnamese + foreign players, randomized positions/stats |
| `seed-stadiums.ts`            | 15 Vietnamese stadiums                                        |
| `register-teams-to-season.ts` | Auto-register teams to active season                          |
| `cleanup-stale-matches.ts`    | Remove orphaned match records                                 |

---

## Common Database Operations

```bash
# Reset database (drop all, re-migrate, re-seed)
pnpm dlx prisma migrate reset

# Open Prisma Studio GUI
pnpm dlx prisma studio

# Generate client after schema change
pnpm dlx prisma generate

# Check migration status
pnpm dlx prisma migrate status

# Apply migrations in production
pnpm dlx prisma migrate deploy

# Format schema file
pnpm dlx prisma format
```

---

## Schema Patterns

### Soft Delete (Roster)

```prisma
model TeamPlayer {
  joinedAt DateTime @default(now()) @map("joined_at")
  leftAt   DateTime? @map("left_at")        // null = active, set = removed
}
```

### Enum with Default

```prisma
model Team {
  status TeamStatus @default(ACTIVE)
}
```

### Many-to-Many via Join Table

```prisma
model Team {
  roster TeamPlayer[]               // Relation name: "roster"
}
model Player {
  roster TeamPlayer[]               // Same relation name
}
model TeamPlayer {
  team   Team   @relation(fields: [teamId], references: [id])
  player Player @relation(fields: [playerId], references: [id])
}
```

> **CRITICAL**: Prisma relation name is `roster`, not `teamPlayers`. Use `include: { roster: true }`.

### Indexes

```prisma
model Match {
  @@index([seasonId])
  @@index([homeTeamId])
  @@index([awayTeamId])
  @@index([status])
}
```

---

## Query Optimization Tips

1. **Select only needed fields**: Use `select` instead of returning entire records
2. **Pagination**: Always use `skip`/`take` with `count()` for large tables
3. **Avoid N+1**: Use `include` for relations instead of separate queries
4. **Parallel queries**: Use `Promise.all([findMany(), count()])` for paginated results
5. **Indexes**: Key fields (seasonId, teamId, status) are already indexed
6. **Driver adapter**: Prisma 7's `@prisma/adapter-pg` uses raw `pg.Pool` for better performance

---

## Environment Configuration

```env
DATABASE_URL="postgresql://vleague:password@localhost:5432/vleague_db"
```

### Docker Database

```bash
# Start PostgreSQL only
docker compose -f infra/docker-compose.db.yml up -d

# Connection: postgresql://vleague:vleague@localhost:5432/vleague
```

---

## Backup & Restore

```bash
# Backup
pg_dump -U vleague -h localhost -d vleague_db > backup.sql

# Restore
psql -U vleague -h localhost -d vleague_db < backup.sql
```

---

## Troubleshooting

| Problem                       | Solution                                                       |
| ----------------------------- | -------------------------------------------------------------- |
| "Prisma client not generated" | Run `pnpm dlx prisma generate`                                 |
| Migration conflict            | Run `pnpm dlx prisma migrate reset` (dev only)                 |
| Connection refused            | Check PostgreSQL is running + DATABASE_URL is correct          |
| Schema drift                  | Run `pnpm dlx prisma migrate dev` to reconcile                 |
| UUID type mismatch            | Ensure all ID fields use `@db.Uuid`                            |
| Relation not found            | Check Prisma relation names (e.g., `roster` not `teamPlayers`) |

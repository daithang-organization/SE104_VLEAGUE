---
name: NestJS + Prisma Development
description: Complete guide for the SE104_VLEAGUE NestJS backend — modules, endpoints, Prisma schema, guards, interceptors, and patterns
---

# NestJS + Prisma Development Skill

## Project Structure

```
apps/api/
├── src/
│   ├── app.module.ts          # Root module (imports all feature modules)
│   ├── main.ts                # Bootstrap: ValidationPipe, CORS, Helmet, Swagger, Pino
│   ├── auth/                  # Authentication & authorization (JWT, OAuth, OTP, RBAC)
│   ├── common/                # Shared: filters, interceptors, middleware, logger
│   ├── config/                # ConfigModule wrapper
│   ├── health/                # Health check (/api/health)
│   ├── mail/                  # Email service (Handlebars templates, OTP, welcome)
│   ├── match/                 # Match management & events
│   ├── prisma/                # PrismaService (driver adapter with pg.Pool)
│   ├── registration/          # Teams & players CRUD + CSV import
│   ├── regulation/            # Season-scoped key-value regulations
│   ├── roster/                # Team-player assignments & jersey numbers
│   ├── scheduling/            # Round-robin schedule generation
│   ├── search/                # Global search across all entities
│   ├── season/                # Season CRUD & team registration workflow
│   ├── stadium/               # Stadium CRUD
│   ├── standings/             # League table, top scorers, card/team stats, exports
│   ├── upload/                # Image upload (Multer, 5MB, JPEG/PNG/WebP/GIF)
│   └── users/                 # Admin user management
├── prisma/
│   ├── schema.prisma          # 12 models, 10 enums
│   ├── seed.ts                # Master seeder (chains all seed scripts)
│   ├── seed-teams.ts          # 10 V-League teams with stadium mappings
│   ├── seed-players.ts        # 100+ randomized Vietnamese + foreign players
│   ├── seed-stadiums.ts       # 15 stadiums
│   ├── verify-demo-users.ts   # Ensure 5 demo role accounts exist
│   ├── register-teams-to-season.ts
│   ├── cleanup-stale-matches.ts
│   └── migrations/            # 13 migrations
└── test/                      # E2E specs (Supertest)
```

## Core Technologies

| Layer      | Technology                          | Version |
| ---------- | ----------------------------------- | ------- |
| Framework  | NestJS                              | 11.x    |
| ORM        | Prisma (with `@prisma/adapter-pg`)  | 7.x     |
| Database   | PostgreSQL                          | 16      |
| Auth       | Passport (JWT, Google, Facebook)    | 0.7.x   |
| Rate Limit | @nestjs/throttler                   | 6.x     |
| Cache      | @nestjs/cache-manager               | 3.x     |
| Logging    | nestjs-pino                         | 4.x     |
| Email      | @nestjs-modules/mailer + Handlebars |         |
| Testing    | Jest + ts-jest + Supertest          |         |

## Global Infrastructure (main.ts)

```typescript
// Bootstrap configuration (already applied globally)
app.setGlobalPrefix('api'); // All routes: /api/...
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // Strip unknown props
    forbidNonWhitelisted: true, // Reject unexpected props
    transform: true, // Auto-transform to DTO classes
    transformOptions: { enableImplicitConversion: true }, // "1" → 1
  }),
);
app.useGlobalFilters(new HttpExceptionFilter()); // Unified error shape
app.useGlobalInterceptors(new LoggingInterceptor()); // Perf timing + Server-Timing header
app.enableCors({ origin: CORS_ORIGIN, credentials: true });

// Static assets
app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads/' });

// Swagger at /api/docs
SwaggerModule.setup('docs', app, document);
```

### Global Guards (via APP_GUARD)

| Guard            | Scope  | Purpose                                                                     |
| ---------------- | ------ | --------------------------------------------------------------------------- |
| `JwtAuthGuard`   | Global | JWT Bearer auth; skipped on `@Public()` endpoints                           |
| `RolesGuard`     | Global | RBAC; checks `@Roles()` metadata vs `req.user.role`                         |
| `ThrottlerGuard` | Global | Rate limiting: default(100/60s), short(20/1s), medium(50/10s), long(30/60s) |

### Interceptors

| Interceptor           | Scope                  | Purpose                                                          |
| --------------------- | ---------------------- | ---------------------------------------------------------------- |
| `LoggingInterceptor`  | Global                 | Logs timing (🟢<100ms 🟡<500ms 🔴>500ms), `Server-Timing` header |
| `AuditLogInterceptor` | Available (not global) | Logs POST/PATCH/PUT/DELETE mutations (entity, action, user, IP)  |
| `CacheInterceptor`    | StandingsController    | `@nestjs/cache-manager` with `@CacheTTL(30000)`                  |

### Filters & Middleware

| Component             | Scope  | Purpose                                                         |
| --------------------- | ------ | --------------------------------------------------------------- |
| `HttpExceptionFilter` | Global | Unified error: `{code, message, details, requestId, timestamp}` |
| `SecurityMiddleware`  | Module | Helmet: CSP, HSTS, frameguard, noSniff, XSS filter              |

---

## Prisma Schema (12 Models, 10 Enums)

### Enums

| Enum               | Values                                                                     |
| ------------------ | -------------------------------------------------------------------------- |
| `TeamStatus`       | ACTIVE, INACTIVE                                                           |
| `PlayerPosition`   | GK, DF, MF, FW                                                             |
| `PlayerType`       | DOMESTIC, FOREIGN                                                          |
| `MatchStatus`      | DRAFT, PUBLISHED, LOCKED, FINISHED, POSTPONED                              |
| `SeasonStatus`     | UPCOMING, IN_PROGRESS, COMPLETED                                           |
| `SeasonTeamStatus` | REGISTERED, APPROVED, REJECTED, WITHDRAWN                                  |
| `EventType`        | GOAL, OWN_GOAL, YELLOW_CARD, RED_CARD, SUBSTITUTION, PENALTY, PENALTY_MISS |
| `UserRole`         | ADMIN, TEAM_MANAGER, REFEREE, SUPERVISOR, PUBLIC                           |
| `OtpType`          | EMAIL_VERIFICATION, PASSWORD_RESET                                         |

### Models

| Model          | Table            | Key Fields                                                                                             |
| -------------- | ---------------- | ------------------------------------------------------------------------------------------------------ |
| `User`         | `users`          | id, email, passwordHash, role, emailVerified, name, avatarUrl, googleId, facebookId, roleId            |
| `Role`         | `roles`          | id, name, description                                                                                  |
| `OtpCode`      | `otp_codes`      | id, code, type, userId, usedAt, expiresAt                                                              |
| `RefreshToken` | `refresh_tokens` | id, tokenHash, userId, userAgent, ipAddress, deviceName, lastUsedAt, revokedAt, expiresAt              |
| `Team`         | `teams`          | id, name, shortName, city, logoUrl, status, stadiumId                                                  |
| `Player`       | `players`        | id, fullName, dob, nationality, position, birthPlace, heightCm, weightKg, playerType                   |
| `Stadium`      | `stadiums`       | id, name, address, city, capacity                                                                      |
| `Season`       | `seasons`        | id, name, year, status, startDate, endDate                                                             |
| `TeamPlayer`   | `team_players`   | id, teamId, playerId, jerseyNumber, joinedAt, leftAt                                                   |
| `SeasonTeam`   | `season_teams`   | id, seasonId, teamId, status, registeredAt, approvedAt                                                 |
| `Match`        | `matches`        | id, roundNo, leg, seasonId, homeTeamId, awayTeamId, stadiumId, kickoffAt, homeScore, awayScore, status |
| `MatchEvent`   | `match_events`   | id, matchId, minute, type, goalType, playerId, relatedPlayerId, teamId, note                           |
| `Regulation`   | `regulations`    | id, seasonId, key, value, valueType                                                                    |
| `Standing`     | `standings`      | id, seasonId, teamId, played, win, draw, loss, goalsFor, goalsAgainst, goalDiff, points, rank          |

### Schema Conventions

```prisma
model EntityName {
  id        String   @id @default(uuid()) @db.Uuid   // Always UUID
  fieldName String   @map("field_name")               // snake_case in DB
  status    EnumType @default(VALUE)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  @@map("table_name")                                 // snake_case table
}
```

> **IMPORTANT**: All PK and FK use `@db.Uuid`. Prisma 7 uses `@prisma/adapter-pg` driver adapter with raw `pg.Pool`.

### Prisma Relation Names

> **WARNING**: The relation field on `Team` and `Player` for the join table is named `roster` (from `TeamPlayer[]`), NOT `teamPlayers`. Always use `roster` in `include` and `where`:
>
> ```typescript
> // ✅ Correct
> this.prisma.player.findMany({ include: { roster: { include: { team: true } } } });
> // ❌ Wrong
> this.prisma.player.findMany({ include: { teamPlayers: true } });
> ```

### Prisma Enum Casting

> **TIP**: When assigning string literals to Prisma-generated enum fields, use `as never`:
>
> ```typescript
> position: dto.position as never,
> playerType: (dto.playerType ?? 'DOMESTIC') as never,
> ```

---

## All Modules & Endpoints

### 1. AuthModule (`/api/auth`) — 19 endpoints

| Method | Endpoint                    | Auth          | Rate Limit   | Description                          |
| ------ | --------------------------- | ------------- | ------------ | ------------------------------------ |
| POST   | `/auth/register`            | Public        | 5/min        | Register + send OTP email            |
| POST   | `/auth/verify-email`        | Public        | 5/10s        | Verify email with OTP                |
| POST   | `/auth/resend-otp`          | Public        | 3/min        | Resend verification OTP              |
| POST   | `/auth/forgot-password`     | Public        | 3/min        | Request password reset OTP           |
| POST   | `/auth/reset-password`      | Public        | 5/10s        | Reset password with OTP              |
| POST   | `/auth/login`               | Public        | 5/min        | Login, returns access+refresh tokens |
| POST   | `/auth/refresh`             | Public        | SkipThrottle | Refresh access token                 |
| POST   | `/auth/logout`              | Public        | SkipThrottle | Revoke refresh token                 |
| GET    | `/auth/me`                  | JWT           | SkipThrottle | Current user profile                 |
| POST   | `/auth/change-password`     | JWT           | SkipThrottle | Change password                      |
| POST   | `/auth/logout-all`          | JWT           | SkipThrottle | Revoke all sessions                  |
| PATCH  | `/auth/profile`             | JWT           | SkipThrottle | Update name/avatarUrl                |
| GET    | `/auth/sessions`            | JWT           | SkipThrottle | List active sessions                 |
| DELETE | `/auth/sessions/:sessionId` | JWT           | SkipThrottle | Revoke specific session              |
| POST   | `/auth/set-password`        | JWT           | SkipThrottle | Set password for OAuth users         |
| GET    | `/auth/google`              | GoogleGuard   | SkipThrottle | Start Google OAuth                   |
| GET    | `/auth/google/callback`     | GoogleGuard   | SkipThrottle | Google OAuth callback                |
| GET    | `/auth/facebook`            | FacebookGuard | SkipThrottle | Start Facebook OAuth                 |
| GET    | `/auth/facebook/callback`   | FacebookGuard | SkipThrottle | Facebook OAuth callback              |

### 2. RegistrationModule (`/api/teams`, `/api/players`) — 11 endpoints

| Method | Endpoint          | Auth                | Description                                                            |
| ------ | ----------------- | ------------------- | ---------------------------------------------------------------------- |
| GET    | `/teams`          | Public              | List teams (paginated, search, filter by status)                       |
| GET    | `/teams/:id`      | Public              | Team detail (roster, matches, standings)                               |
| POST   | `/teams`          | ADMIN               | Create team                                                            |
| PATCH  | `/teams/:id`      | ADMIN               | Update team                                                            |
| DELETE | `/teams/:id`      | ADMIN               | Delete team                                                            |
| GET    | `/players`        | Public              | List players (paginated, filter by search/position/nationality/teamId) |
| GET    | `/players/:id`    | Public              | Player detail (history, events)                                        |
| POST   | `/players`        | ADMIN, TEAM_MANAGER | Create player (age validation via regulation)                          |
| PATCH  | `/players/:id`    | ADMIN, TEAM_MANAGER | Update player (handles team reassignment)                              |
| DELETE | `/players/:id`    | ADMIN, TEAM_MANAGER | Delete player                                                          |
| POST   | `/players/import` | ADMIN               | CSV bulk import (max 2MB, per-row errors)                              |

### 3. MatchModule (`/api/matches`) — 6 endpoints

| Method | Endpoint                       | Auth           | Description                                            |
| ------ | ------------------------------ | -------------- | ------------------------------------------------------ |
| GET    | `/matches`                     | All roles      | List matches (filter: seasonId, round, status, teamId) |
| GET    | `/matches/:id`                 | All roles      | Match detail (events, teams, stadium)                  |
| POST   | `/matches/:id/events`          | ADMIN, REFEREE | Add event (auto-recalculates scores)                   |
| DELETE | `/matches/:id/events/:eventId` | ADMIN, REFEREE | Remove event                                           |
| PATCH  | `/matches/:id`                 | ADMIN          | Update match (stadium, kickoff, scores)                |
| PATCH  | `/matches/:id/status`          | ADMIN          | Status transition (state machine)                      |

### 4. SchedulingModule (`/api/schedule`) — 3 endpoints

| Method | Endpoint             | Auth      | Description                               |
| ------ | -------------------- | --------- | ----------------------------------------- |
| POST   | `/schedule/generate` | ADMIN     | Auto-generate double round-robin schedule |
| POST   | `/schedule/publish`  | ADMIN     | Bulk publish DRAFT → PUBLISHED            |
| GET    | `/schedule`          | All roles | Get schedule with relations               |

### 5. SeasonModule (`/api/seasons`) — 11 endpoints

| Method | Endpoint                                  | Auth   | Description                             |
| ------ | ----------------------------------------- | ------ | --------------------------------------- |
| GET    | `/seasons`                                | Public | List all seasons (ordered by year desc) |
| GET    | `/seasons/current`                        | Public | Get IN_PROGRESS season                  |
| GET    | `/seasons/:id`                            | Public | Season detail                           |
| POST   | `/seasons`                                | ADMIN  | Create season                           |
| PATCH  | `/seasons/:id`                            | ADMIN  | Update season                           |
| DELETE | `/seasons/:id`                            | ADMIN  | Delete season                           |
| PATCH  | `/seasons/:id/status`                     | ADMIN  | Status transition (state machine)       |
| GET    | `/seasons/:seasonId/teams`                | Public | List registered teams                   |
| POST   | `/seasons/:seasonId/teams`                | ADMIN  | Register team to season                 |
| PATCH  | `/seasons/:seasonId/teams/:teamId/status` | ADMIN  | Update registration status              |
| DELETE | `/seasons/:seasonId/teams/:teamId`        | ADMIN  | Remove team from season                 |

### 6. StadiumModule (`/api/stadiums`) — 5 endpoints

| Method | Endpoint        | Auth   | Description                     |
| ------ | --------------- | ------ | ------------------------------- |
| GET    | `/stadiums`     | Public | List all stadiums               |
| GET    | `/stadiums/:id` | Public | Stadium detail (teams, matches) |
| POST   | `/stadiums`     | ADMIN  | Create stadium                  |
| PATCH  | `/stadiums/:id` | ADMIN  | Update stadium                  |
| DELETE | `/stadiums/:id` | ADMIN  | Delete stadium                  |

### 7. RosterModule (`/api/teams/:teamId/roster`) — 4 endpoints

| Method | Endpoint                          | Auth                | Description                                      |
| ------ | --------------------------------- | ------------------- | ------------------------------------------------ |
| GET    | `/teams/:teamId/roster`           | Public              | Get team roster                                  |
| POST   | `/teams/:teamId/roster`           | ADMIN, TEAM_MANAGER | Add player (validates max roster, foreign limit) |
| PATCH  | `/teams/:teamId/roster/:playerId` | ADMIN, TEAM_MANAGER | Update jersey number                             |
| DELETE | `/teams/:teamId/roster/:playerId` | ADMIN, TEAM_MANAGER | Soft remove (sets leftAt)                        |

### 8. RegulationModule (`/api/seasons/:seasonId/regulations`) — 5 endpoints

| Method | Endpoint                                       | Auth   | Description                |
| ------ | ---------------------------------------------- | ------ | -------------------------- |
| GET    | `/seasons/:seasonId/regulations`               | Public | List regulations           |
| GET    | `/seasons/:seasonId/regulations/:key`          | Public | Get by key                 |
| PUT    | `/seasons/:seasonId/regulations`               | ADMIN  | Upsert regulation          |
| DELETE | `/seasons/:seasonId/regulations/:key`          | ADMIN  | Delete regulation          |
| POST   | `/seasons/:seasonId/regulations/seed-defaults` | ADMIN  | Seed 9 default regulations |

### 9. StandingsModule (`/api/standings`) — 11 endpoints

| Method | Endpoint                            | Auth   | Description                               |
| ------ | ----------------------------------- | ------ | ----------------------------------------- |
| GET    | `/standings`                        | Public | League table (cached 30s)                 |
| GET    | `/standings/:seasonId`              | Public | Standings by season                       |
| GET    | `/standings/top-scorers`            | Public | Top scorers                               |
| GET    | `/standings/card-stats`             | Public | Card statistics                           |
| GET    | `/standings/team-stats`             | Public | Team aggregated stats (inc. clean sheets) |
| GET    | `/standings/head-to-head`           | Public | Head-to-head between 2 teams              |
| GET    | `/standings/player-stats/:playerId` | Public | Individual player stats                   |
| GET    | `/standings/export/standings`       | Public | CSV export - standings                    |
| GET    | `/standings/export/top-scorers`     | Public | CSV export - scorers                      |
| GET    | `/standings/export/card-stats`      | Public | CSV export - cards                        |
| GET    | `/standings/export/team-stats`      | Public | CSV export - team stats                   |

### 10. UsersModule (`/api/users`) — 4 endpoints (ADMIN only)

| Method | Endpoint          | Auth  | Description                |
| ------ | ----------------- | ----- | -------------------------- |
| GET    | `/users`          | ADMIN | List all users             |
| POST   | `/users`          | ADMIN | Create user (pre-verified) |
| PATCH  | `/users/:id/role` | ADMIN | Update user role           |
| DELETE | `/users/:id`      | ADMIN | Delete user + related      |

### 11. UploadModule (`/api/upload`) — 1 endpoint

| Method | Endpoint        | Auth                | Description                               |
| ------ | --------------- | ------------------- | ----------------------------------------- |
| POST   | `/upload/image` | ADMIN, TEAM_MANAGER | Upload image (JPEG/PNG/WebP/GIF, max 5MB) |

### 12. SearchModule (`/api/search`) — 1 endpoint

| Method | Endpoint                  | Auth   | Rate Limit | Description                                               |
| ------ | ------------------------- | ------ | ---------- | --------------------------------------------------------- |
| GET    | `/search?q=...&limit=...` | Public | 10/5s      | Global search: teams, players, matches, stadiums, seasons |

### 13. HealthModule (`/api/health`) — 1 endpoint

| Method | Endpoint  | Auth                  | Description                           |
| ------ | --------- | --------------------- | ------------------------------------- |
| GET    | `/health` | Public (SkipThrottle) | DB connectivity + memory heap (150MB) |

### 14. MailModule (internal service, no controller)

- `sendEmailVerificationOtp`, `sendPasswordResetOtp`, `sendWelcomeEmail`
- Dev mode: `MAIL_SKIP_SEND=true` logs OTP to console
- Handlebars templates: `email-verification.hbs`, `password-reset.hbs`, `welcome.hbs`

### 15. PrismaModule (internal service)

- `PrismaService` extends `PrismaClient` with `@prisma/adapter-pg` driver adapter
- Lifecycle: `onModuleInit` → `$connect()`, `onModuleDestroy` → `$disconnect()`

---

## Guards & Decorators

### Guards

| Guard               | Location                             | Purpose                       |
| ------------------- | ------------------------------------ | ----------------------------- |
| `JwtAuthGuard`      | `auth/guards/jwt-auth.guard.ts`      | JWT Bearer; skips `@Public()` |
| `RolesGuard`        | `auth/guards/roles.guard.ts`         | RBAC vs `@Roles()` metadata   |
| `GoogleAuthGuard`   | `auth/guards/google-auth.guard.ts`   | Passport Google OAuth 2.0     |
| `FacebookAuthGuard` | `auth/guards/facebook-auth.guard.ts` | Passport Facebook OAuth       |
| `ThrottlerGuard`    | Global (APP_GUARD)                   | Multi-config rate limiting    |

### Decorators

| Decorator         | Usage                                   |
| ----------------- | --------------------------------------- |
| `@Public()`       | Skip JWT auth on endpoint               |
| `@Roles(...)`     | Require specific UserRole(s)            |
| `@CurrentUser()`  | Extract `req.user` as param decorator   |
| `@SkipThrottle()` | Bypass rate limiting                    |
| `@Throttle()`     | Override rate limit config per endpoint |
| `@CacheTTL(ms)`   | Set cache duration for endpoint         |

### Strategies

| Strategy           | Purpose                                   |
| ------------------ | ----------------------------------------- |
| `JwtStrategy`      | Validate JWT from `Authorization: Bearer` |
| `GoogleStrategy`   | Google OAuth 2.0 via Passport             |
| `FacebookStrategy` | Facebook OAuth via Passport               |

---

## Cross-Module Dependencies

```
MatchModule → imports StandingsModule, RegulationModule
  - StandingsService: auto-recalculate on match FINISHED
  - RegulationHelper: MAX_GOAL_TIME validation

RegistrationModule → imports RegulationModule
  - RegulationHelper: MIN_AGE, MAX_AGE validation

RosterModule → imports RegulationModule
  - RegulationHelper: MAX_ROSTER, MAX_FOREIGN_PLAYERS validation

RegulationModule → exports RegulationService, RegulationHelper
  - RegulationHelper.getNumericValue(seasonId, key, fallback)
```

---

## Common Module (`src/common/`)

| Directory       | File                       | Purpose                                      |
| --------------- | -------------------------- | -------------------------------------------- |
| `errors/`       | `app-error.ts`             | Custom `AppError` class with error codes     |
| `filters/`      | `http-exception.filter.ts` | Unified error response shape (global filter) |
| `interceptors/` | `logging.interceptor.ts`   | Request/response performance logging         |
| `interceptors/` | `audit-log.interceptor.ts` | Optional mutation logging                    |
| `logger/`       | `logger.module.ts`         | `nestjs-pino` structured logging             |
| `middleware/`   | `security.middleware.ts`   | Helmet security headers                      |

---

## DTO & Validation Patterns

```typescript
// Create DTO
export class CreateTeamDto {
  @ApiProperty({ description: 'Team name', example: 'Hoàng Anh Gia Lai' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ enum: TeamStatus, default: TeamStatus.ACTIVE })
  @IsOptional()
  @IsEnum(TeamStatus)
  status?: TeamStatus;
}

// Update DTO (partial of Create)
export class UpdateTeamDto extends PartialType(CreateTeamDto) {}

// Barrel export: dto/index.ts
export * from './create-team.dto';
export * from './update-team.dto';
```

---

## Testing

**23 test suites, 233+ tests** covering services, controllers, and E2E.

### Test Pattern

```typescript
describe('ModuleNameService', () => {
  let service: ModuleNameService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ModuleNameService,
        {
          provide: PrismaService,
          useValue: {
            modelName: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();
    service = module.get(ModuleNameService);
    prisma = module.get(PrismaService);
  });
});
```

### Auth Service Tests: `jest.mock('bcrypt')` at module level

### E2E Tests: `test/*.e2e-spec.ts` with Supertest

---

## Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/vleague"
PORT=8080
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=...
MAIL_PASS=...
MAIL_FROM=noreply@vleague.local
MAIL_SKIP_SEND=true              # Dev: log OTP to console
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:8080/api/auth/google/callback
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
FACEBOOK_CALLBACK_URL=http://localhost:8080/api/auth/facebook/callback
FRONTEND_URL=http://localhost:5173
```

---

## Common Commands

```bash
cd apps/api
pnpm dev                         # Start dev server (watch mode)
pnpm test                        # Unit tests (23 suites, 233+ tests)
pnpm test:e2e                    # E2E tests
pnpm test:cov                    # Coverage report
pnpm dlx prisma migrate dev      # Create migration
pnpm dlx prisma generate         # Generate Prisma client
pnpm dlx prisma studio           # Open Prisma Studio GUI
pnpm run db:seed                 # Seed database
pnpm lint                        # ESLint
```

---

## Notable Patterns

1. **Prisma 7 Driver Adapter**: Uses `@prisma/adapter-pg` with raw `pg.Pool` instead of binary engine
2. **Vietnamese messages**: All user-facing error messages in Vietnamese
3. **CSV export with BOM**: `toCsv()` helper prepends `\uFEFF` for Excel Vietnamese support
4. **Structured error codes**: `AUTH_EMAIL_EXISTS`, `AUTH_OTP_INVALID`, etc. for deterministic client handling
5. **Device-aware sessions**: Refresh tokens track userAgent, ipAddress, deviceName, lastUsedAt
6. **OAuth account linking**: Google/Facebook auto-link to existing email; users can set password post-OAuth
7. **WebSocket deps present**: `@nestjs/websockets` + `socket.io` in deps but no gateway implemented yet
8. **Regulation-driven rules**: Core limits (age, roster, foreign players, goal time) configurable per-season
9. **RegulationHelper fallback**: DB value → defaults → hardcoded fallback
10. **Standings computed live**: From match events, not from Standing model directly

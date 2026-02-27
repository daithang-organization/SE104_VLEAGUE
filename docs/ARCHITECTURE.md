<h1 align="center">🏗️ Kiến trúc Hệ thống</h1>

<p align="center">
  <strong>Tài liệu kiến trúc chi tiết cho VLeague Management System</strong>
</p>

---

## 📋 Mục lục

- [🎯 Tổng quan](#-tổng-quan)
- [🏛️ System Architecture](#️-system-architecture)
- [🔌 Backend Architecture](#-backend-architecture)
- [🌐 Frontend Architecture](#-frontend-architecture)
- [🗄️ Database Design](#️-database-design)
- [🔄 Data Flow](#-data-flow)
- [🔐 Security](#-security)
- [📦 Deployment](#-deployment)

---

## 🎯 Tổng quan

### Tech Stack Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     VLEAGUE MANAGEMENT SYSTEM                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    FRONTEND LAYER                        │    │
│  │  React 19 + Vite + TypeScript + Ant Design              │    │
│  │  Port: 5173                                              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              │ REST API (HTTP)                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    BACKEND LAYER                         │    │
│  │  NestJS + TypeScript + Prisma ORM                       │    │
│  │  Port: 8080                                              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              │ Prisma Client                     │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    DATABASE LAYER                        │    │
│  │  PostgreSQL 16                                          │    │
│  │  Port: 5432                                              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Công nghệ sử dụng

| Layer        | Công nghệ      | Phiên bản | Mô tả            |
| ------------ | -------------- | --------- | ---------------- |
| **Frontend** | React          | 19        | UI Library       |
|              | Vite           | 7.x       | Build tool       |
|              | TypeScript     | 5.x       | Language         |
|              | Ant Design     | 6.x       | UI Components    |
|              | React Router   | 7.x       | Routing          |
| **Backend**  | NestJS         | 11.x      | Framework        |
|              | Prisma         | 7.x       | ORM              |
|              | TypeScript     | 5.x       | Language         |
| **Database** | PostgreSQL     | 16        | RDBMS            |
| **DevOps**   | Docker         | Latest    | Containerization |
|              | Docker Compose | Latest    | Orchestration    |
|              | GitHub Actions | -         | CI/CD            |

---

## 🏛️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                              CLIENT                                  │
│                           (Web Browser)                              │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
                                  │ HTTPS
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                             │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐        │
│  │  Pages    │  │Components │  │ Services  │  │  Context  │        │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘        │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
                                  │ REST API
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         BACKEND (NestJS)                             │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                        API Layer                               │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐     │  │
│  │  │  Auth  │ │ Teams  │ │Schedule│ │ Match  │ │ Season │     │  │
│  │  └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘     │  │
│  │  ┌───┴────┐ ┌───┴────┐ ┌───┴────┐ ┌───┴────┐ ┌───┴────┐     │  │
│  │  │Stadium │ │Standing│ │ Roster │ │Regulat.│ │ Users  │     │  │
│  │  └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘     │  │
│  │  ┌───┴────┐ ┌───┴────┐ ┌───┴────┐                           │  │
│  │  │Upload  │ │ Health │ │  Mail  │                           │  │
│  │  └────────┘ └────────┘ └────────┘                           │  │
│  │              14 Modules — Business Logic Layer               │  │
│  └──────────────────────────────┬───────────────────────────────┘  │
│                                 │                                   │
│  ┌──────────────────────────────┴───────────────────────────────┐  │
│  │                     Prisma Service                            │  │
│  │                    (Data Access Layer)                        │  │
│  └──────────────────────────────┬───────────────────────────────┘  │
└─────────────────────────────────┼───────────────────────────────────┘
                                  │
                                  │ TCP/IP
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        DATABASE (PostgreSQL)                         │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐           │
│  │ users  │ │ teams  │ │players │ │matches │ │seasons │           │
│  ├────────┤ ├────────┤ ├────────┤ ├────────┤ ├────────┤           │
│  │stadiums│ │  team  │ │ season │ │ match  │ │regulat.│           │
│  │        │ │players │ │ teams  │ │ events │ │        │           │
│  ├────────┤ ├────────┤ ├────────┤ ├────────┤ ├────────┤           │
│  │standing│ │  roles │ │refresh │ │otp_code│ │        │           │
│  │   s    │ │        │ │tokens  │ │   s    │ │        │           │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘           │
└─────────────────────────────────────────────────────────────────────┘
```

### Monorepo Structure

```
SE104_VLEAGUE/                    # Root workspace
├── apps/
│   ├── api/                      # Backend app
│   └── web/                      # Frontend app
├── docs/                         # Documentation
├── infra/                        # Infrastructure
└── scripts/                      # Build scripts
```

---

## 🔌 Backend Architecture

### Module Structure

```
apps/api/src/
│
├── main.ts                       # Application entry point
├── app.module.ts                 # Root module (14 modules)
│
├── prisma/                       # 🗄️ Data Access Layer
│   ├── prisma.module.ts
│   └── prisma.service.ts         # Prisma client wrapper
│
├── auth/                         # 🔐 Authentication (19 endpoints)
│   ├── auth.module.ts
│   ├── auth.controller.ts        # /auth endpoints
│   ├── auth.service.ts           # JWT, OAuth, OTP logic
│   ├── strategies/               # Passport strategies
│   └── guards/                   # JwtAuthGuard, RolesGuard
│
├── registration/                 # 👥 Teams & Players (11 endpoints)
│   ├── registration.module.ts
│   ├── teams.controller.ts       # /teams CRUD
│   ├── players.controller.ts     # /players CRUD + import
│   └── registration.service.ts
│
├── scheduling/                   # 📅 Schedule (3 endpoints)
│   ├── scheduling.module.ts
│   ├── scheduling.controller.ts  # generate, publish, get
│   └── scheduling.service.ts     # Round-robin algorithm
│
├── match/                        # ⚽ Matches (5 endpoints)
│   ├── match.module.ts
│   ├── match.controller.ts       # CRUD + events + status
│   ├── match.service.ts
│   └── dto/
│
├── season/                       # 📆 Seasons (7 endpoints)
│   ├── season.module.ts
│   ├── season.controller.ts      # CRUD + status
│   ├── season.service.ts
│   ├── season-team.controller.ts # /seasons/:id/teams
│   └── season-team.service.ts
│
├── stadium/                      # 🏟️ Stadiums (5 endpoints)
│   ├── stadium.module.ts
│   ├── stadium.controller.ts
│   └── stadium.service.ts
│
├── standings/                    # 📊 Standings (5 endpoints)
│   ├── standings.module.ts
│   ├── standings.controller.ts   # standings, top-scorers, cards
│   └── standings.service.ts
│
├── roster/                       # 📋 Roster (4 endpoints)
│   ├── roster.module.ts
│   ├── roster.controller.ts      # /teams/:id/roster
│   └── roster.service.ts
│
├── regulation/                   # ⚙️ Regulations (5 endpoints)
│   ├── regulation.module.ts
│   ├── regulation.controller.ts  # /seasons/:id/regulations
│   ├── regulation.service.ts
│   └── regulation.helper.ts      # RegulationHelper utility
│
├── users/                        # 👤 User Admin (4 endpoints)
│   ├── users.module.ts
│   ├── users.controller.ts
│   └── users.service.ts
│
├── upload/                       # 📤 File Upload (1 endpoint)
│   ├── upload.module.ts
│   └── upload.controller.ts
│
├── health/                       # 💚 Health Check (1 endpoint)
│   └── health.controller.ts
│
├── mail/                         # 📧 Email Service
│   ├── mail.module.ts
│   ├── mail.service.ts
│   └── templates/                # Handlebars email templates
│
├── config/                       # ⚙️ Configuration
│   └── configuration.ts
│
└── common/                       # 🔧 Shared Utilities
    ├── filters/                  # HttpExceptionFilter
    ├── interceptors/             # LoggingInterceptor
    └── logger/                   # Pino structured logging
```

### NestJS Module Pattern

```typescript
// Mỗi module follow pattern này:

@Module({
  imports: [PrismaModule], // Dependencies
  controllers: [XxxController], // HTTP handlers
  providers: [XxxService], // Business logic
  exports: [XxxService], // Shared services
})
export class XxxModule {}
```

### Request Flow

```
HTTP Request
     │
     ▼
┌─────────────────┐
│   Controller    │ ──── Validate input, parse params
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Service      │ ──── Business logic
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Prisma Service  │ ──── Database operations
└────────┬────────┘
         │
         ▼
    PostgreSQL
```

### API Endpoints Overview (58 endpoints across 15 modules)

| Module           | Endpoints    | Description                               |
| ---------------- | ------------ | ----------------------------------------- |
| **Auth**         | 19 endpoints | Register, login, OAuth, sessions, profile |
| **Teams**        | 5 endpoints  | CRUD đội bóng                             |
| **Players**      | 6 endpoints  | CRUD cầu thủ + CSV import                 |
| **Schedule**     | 3 endpoints  | Generate, publish, view                   |
| **Matches**      | 5 endpoints  | CRUD + events + status                    |
| **Seasons**      | 7 endpoints  | CRUD + status transitions                 |
| **Season Teams** | 4 endpoints  | Register/approve/reject teams             |
| **Stadiums**     | 5 endpoints  | CRUD sân vận động                         |
| **Standings**    | 5 endpoints  | BXH, vua phá lưới, thẻ phạt               |
| **Roster**       | 4 endpoints  | Quản lý cầu thủ trong đội                 |
| **Regulations**  | 5 endpoints  | Quy định giải đấu theo mùa                |
| **Users**        | 4 endpoints  | Admin quản lý người dùng                  |
| **Upload**       | 1 endpoint   | Upload ảnh                                |
| **Health**       | 1 endpoint   | Health check                              |

> 📖 Chi tiết đầy đủ xem tại [API_DOCS.md](API_DOCS.md)

---

## 🌐 Frontend Architecture

### Component Structure

```
apps/web/src/
│
├── main.tsx                      # Entry point
├── App.tsx                       # Root component + Routes (27 pages)
│
├── auth/                         # 🔐 Auth Context & Guards
│   ├── AuthContext.tsx           # Auth state management
│   ├── RequireAuth.tsx           # Protected route guard
│   └── RequireRole.tsx           # Role-based route guard
│
├── shell/                        # 🏠 Layout
│   ├── AppShell.tsx              # Sidebar + header layout
│   └── menu.ts                   # Menu configuration
│
├── components/                   # 🧩 Reusable Components
│   ├── LoadingSkeleton.tsx       # Loading states
│   └── ErrorBoundary.tsx         # Error handling
│
├── pages/                        # 📄 Page Components (27 pages)
│   ├── LoginPage.tsx             # /login
│   ├── RegisterPage.tsx          # /register
│   ├── VerifyEmailPage.tsx       # /verify-email
│   ├── ForgotPasswordPage.tsx    # /forgot-password
│   ├── ResetPasswordPage.tsx     # /reset-password
│   ├── OAuthCallbackPage.tsx     # /auth/oauth-callback
│   ├── DashboardPage.tsx         # /
│   ├── TeamsPage.tsx             # /teams
│   ├── PlayersPage.tsx           # /players
│   ├── SeasonsPage.tsx           # /seasons
│   ├── StadiumsPage.tsx          # /stadiums
│   ├── SchedulePage.tsx          # /schedule
│   ├── MatchesPage.tsx           # /matches
│   ├── StandingsPage.tsx         # /standings
│   ├── RegulationsPage.tsx       # /regulations
│   ├── ReportsPage.tsx           # /reports
│   ├── UsersPage.tsx             # /users (ADMIN)
│   ├── ProfilePage.tsx           # /profile
│   ├── ChangePasswordPage.tsx    # /change-password
│   ├── SessionsPage.tsx          # /sessions
│   └── ForbiddenPage.tsx         # /403
│
├── services/                     # 🔌 API Service Layer (14 services)
│   ├── http.ts                   # Axios client with interceptors
│   ├── authApi.ts                # Auth endpoints
│   ├── teamApi.ts                # Teams CRUD
│   ├── playerApi.ts              # Players CRUD
│   ├── seasonApi.ts              # Seasons CRUD
│   ├── seasonTeamApi.ts          # Season team registration
│   ├── stadiumApi.ts             # Stadiums CRUD
│   ├── scheduleApi.ts            # Schedule management
│   ├── matchApi.ts               # Matches + events
│   ├── standingsApi.ts           # Standings + stats
│   ├── regulationApi.ts          # Regulations
│   ├── userApi.ts                # Admin user management
│   └── uploadApi.ts              # File upload
│
├── lib/                          # 🔧 Utilities
│   └── api.ts                    # API base configuration
│
├── utils/                        # 🛠️ Helper Functions
│
└── assets/                       # 🖼️ Static assets
```

### Routing Structure

```tsx
<Routes>
  {/* Public auth routes */}
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  <Route path="/verify-email" element={<VerifyEmailPage />} />
  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
  <Route path="/reset-password" element={<ResetPasswordPage />} />
  <Route path="/auth/oauth-callback" element={<OAuthCallbackPage />} />

  {/* Public data routes */}
  <Route path="/public/standings" element={<StandingsPage />} />
  <Route path="/public/schedule" element={<SchedulePage />} />
  <Route path="/public/results" element={<MatchesPage />} />

  {/* Protected routes (RequireAuth + AppShell) */}
  <Route
    element={
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    }
  >
    <Route path="/" element={<DashboardPage />} />
    <Route path="/teams" element={<TeamsPage />} />
    <Route path="/players" element={<PlayersPage />} />
    <Route path="/seasons" element={<SeasonsPage />} />
    <Route path="/stadiums" element={<StadiumsPage />} />
    <Route path="/schedule" element={<SchedulePage />} />
    <Route path="/matches" element={<MatchesPage />} />
    <Route path="/standings" element={<StandingsPage />} />
    <Route path="/regulations" element={<RegulationsPage />} />
    <Route path="/reports" element={<ReportsPage />} />
    <Route path="/users" element={<UsersPage />} />
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="/change-password" element={<ChangePasswordPage />} />
    <Route path="/sessions" element={<SessionsPage />} />
  </Route>

  <Route path="/403" element={<ForbiddenPage />} />
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

### State Management

```
┌─────────────────────────────────────────────────────────────────┐
│                      STATE MANAGEMENT                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    React Context                         │    │
│  │  ┌───────────────┐                                      │    │
│  │  │  AuthContext  │ ─── User state, login/logout         │    │
│  │  └───────────────┘                                      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   Component State                        │    │
│  │  useState() ─── Local component state                   │    │
│  │  useEffect() ─── Side effects, API calls                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Design

### Entity Relationship Diagram

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│    Season    │    │   Stadium    │    │     Role     │
├──────────────┤    ├──────────────┤    ├──────────────┤
│ id (PK, UUID)│    │ id (PK, UUID)│    │ id (PK, UUID)│
│ name (unique)│    │ name (unique)│    │ name (unique)│
│ year         │    │ address      │    │ description  │
│ status       │    │ city         │    └──────────────┘
│ startDate    │    │ capacity     │           │
│ endDate      │    └──────┬───────┘           │
└──────┬───────┘           │                   │
       │                   │                   │
       │    ┌──────────────┴───────────────┐   │
       │    │            Team              │   │
       │    ├──────────────────────────────┤   │
       │    │ id (PK, UUID)               │   │
       │    │ name (unique)               │   │
       │    │ shortName, city, logoUrl    │   │
       │    │ status (ACTIVE/INACTIVE)    │   │
       │    │ stadiumId (FK) ──▶ Stadium  │   │
       │    └──┬───────┬──────────────────┘   │
       │       │       │                       │
  ┌────┴───┐   │  ┌────┴──────┐  ┌────────────┴──────┐
  │Season  │   │  │TeamPlayer │  │       User        │
  │ Team   │   │  ├───────────┤  ├───────────────────┤
  ├────────┤   │  │ teamId FK │  │ id (PK, UUID)     │
  │seasonId│   │  │ playerId  │  │ email (unique)    │
  │ teamId │   │  │ jerseyNo  │  │ role (enum)       │
  │ status │   │  │ joinedAt  │  │ roleId FK ──▶Role │
  └────────┘   │  └─────┬─────┘  │ googleId, fbId    │
               │        │        └───────────────────┘
          ┌────┴────────┴─┐
          │    Player     │
          ├───────────────┤
          │ id (PK, UUID) │
          │ fullName      │
          │ dob, position │
          │ nationality   │
          │ playerType    │
          │ heightCm, etc │
          └───────────────┘

  ┌────────────────────────────┐    ┌──────────────┐
  │          Match             │    │  Regulation   │
  ├────────────────────────────┤    ├──────────────┤
  │ id (PK, UUID)              │    │ seasonId FK  │
  │ roundNo, leg               │    │ key          │
  │ seasonId FK ──▶ Season     │    │ value        │
  │ homeTeamId FK ──▶ Team     │    │ valueType    │
  │ awayTeamId FK ──▶ Team     │    └──────────────┘
  │ stadiumId FK ──▶ Stadium   │
  │ homeScore, awayScore       │    ┌──────────────┐
  │ status (5 states)          │    │   Standing   │
  └──────────┬─────────────────┘    ├──────────────┤
             │                      │ seasonId FK  │
       ┌─────┴──────┐               │ teamId FK    │
       │MatchEvent  │               │ played, win  │
       ├────────────┤               │ draw, loss   │
       │ matchId FK  │               │ goalsFor/Agt │
       │ minute     │               │ points, rank │
       │ type (enum)│               └──────────────┘
       │ playerId FK│
       │ teamId FK  │
       └────────────┘
```

### Database Tables (14 tables)

| Table            | Description              |
| ---------------- | ------------------------ |
| `users`          | Người dùng hệ thống      |
| `otp_codes`      | Mã OTP xác thực          |
| `refresh_tokens` | JWT refresh tokens       |
| `roles`          | Vai trò (bảng phụ)       |
| `teams`          | Đội bóng                 |
| `players`        | Cầu thủ                  |
| `stadiums`       | Sân vận động             |
| `seasons`        | Mùa giải                 |
| `team_players`   | Roster (đội ↔ cầu thủ)   |
| `season_teams`   | Đăng ký đội vào mùa giải |
| `matches`        | Trận đấu                 |
| `match_events`   | Sự kiện trận đấu         |
| `regulations`    | Quy định giải đấu        |
| `standings`      | Bảng xếp hạng            |

---

## 🔄 Data Flow

### Ví dụ: Lấy danh sách đội bóng

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ Browser │────▶│  React  │────▶│ NestJS  │────▶│ Prisma  │────▶│Postgres │
│         │     │  Page   │     │ API     │     │         │     │         │
└─────────┘     └─────────┘     └─────────┘     └─────────┘     └─────────┘
    │               │               │               │               │
    │  1. Navigate  │               │               │               │
    │──────────────▶│               │               │               │
    │               │  2. GET /teams│               │               │
    │               │──────────────▶│               │               │
    │               │               │ 3. findMany() │               │
    │               │               │──────────────▶│               │
    │               │               │               │  4. SELECT    │
    │               │               │               │──────────────▶│
    │               │               │               │               │
    │               │               │               │◀──────────────│
    │               │               │◀──────────────│  5. Results   │
    │               │◀──────────────│  6. JSON      │               │
    │◀──────────────│  7. Render   │               │               │
    │   8. Display  │               │               │               │
```

### Ví dụ: Thêm sự kiện trận đấu

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ Browser │────▶│  React  │────▶│ NestJS  │────▶│ Prisma  │────▶│Postgres │
│         │     │  Form   │     │ API     │     │         │     │         │
└─────────┘     └─────────┘     └─────────┘     └─────────┘     └─────────┘
    │               │               │               │               │
    │  1. Submit    │               │               │               │
    │──────────────▶│               │               │               │
    │               │  2. POST      │               │               │
    │               │  /matches/    │               │               │
    │               │  {id}/events  │               │               │
    │               │──────────────▶│               │               │
    │               │               │  3. Validate  │               │
    │               │               │     DTO       │               │
    │               │               │  4. create()  │               │
    │               │               │──────────────▶│               │
    │               │               │               │  5. INSERT    │
    │               │               │               │──────────────▶│
    │               │               │               │◀──────────────│
    │               │               │◀──────────────│  6. Created   │
    │               │◀──────────────│  7. Response  │               │
    │◀──────────────│  8. Success  │               │               │
```

---

## 🔐 Security

### Authentication Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                      AUTHENTICATION FLOW                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. User Login                                                    │
│     ┌─────────┐      ┌─────────┐      ┌─────────┐               │
│     │ Client  │─────▶│  API    │─────▶│   DB    │               │
│     │         │      │         │      │         │               │
│     │ email   │      │ verify  │      │ users   │               │
│     │ password│      │ creds   │      │         │               │
│     └─────────┘      └─────────┘      └─────────┘               │
│                           │                                       │
│                           ▼                                       │
│                      Generate Token                               │
│                           │                                       │
│                           ▼                                       │
│  2. Authenticated Requests                                        │
│     ┌─────────┐      ┌─────────┐                                │
│     │ Client  │─────▶│  API    │                                │
│     │         │      │         │                                │
│     │ Token   │      │ Verify  │                                │
│     │ Header  │      │ Token   │                                │
│     └─────────┘      └─────────┘                                │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Security Best Practices

| Aspect               | Implementation                     |
| -------------------- | ---------------------------------- |
| **Input Validation** | DTOs với class-validator           |
| **SQL Injection**    | Prisma ORM (parameterized queries) |
| **XSS**              | React auto-escaping                |
| **CORS**             | NestJS CORS middleware             |
| **Environment**      | .env files, không commit secrets   |

---

## 📦 Deployment

### Docker Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      DOCKER COMPOSE                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    vleague_web                           │    │
│  │                    (React + Nginx)                       │    │
│  │                    Port: 5173                            │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              │ HTTP                              │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    vleague_api                           │    │
│  │                    (NestJS)                              │    │
│  │                    Port: 8080                            │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              │ TCP                               │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    vleague_db                            │    │
│  │                    (PostgreSQL)                          │    │
│  │                    Port: 5432                            │    │
│  │                    Volume: vleague_pgdata                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### CI/CD Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                     GITHUB ACTIONS CI/CD                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Push/PR to main                                                 │
│        │                                                         │
│        ▼                                                         │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐     │
│  │  Lint    │──▶│   Test   │──▶│  Build   │──▶│ Artifact │     │
│  │          │   │          │   │          │   │  Upload  │     │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘     │
│                                                                  │
│  Jobs:                                                           │
│  - api: lint → test → build                                     │
│  - web: lint → build                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📚 Tài liệu liên quan

- [README.md](../README.md) - Tổng quan dự án
- [CONTRIBUTING.md](CONTRIBUTING.md) - Hướng dẫn đóng góp
- [GIT_WORKFLOW.md](GIT_WORKFLOW.md) - Quy trình Git
- [LOCAL_DEV.md](LOCAL_DEV.md) - Phát triển local
- [api-outline.md](api-outline.md) - API endpoints

---

<p align="center">
  <strong>VLeague Architecture Documentation 🏗️</strong>
</p>

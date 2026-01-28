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

| Layer | Công nghệ | Phiên bản | Mô tả |
|-------|-----------|-----------|-------|
| **Frontend** | React | 19 | UI Library |
| | Vite | 7.x | Build tool |
| | TypeScript | 5.x | Language |
| | Ant Design | 6.x | UI Components |
| | React Router | 7.x | Routing |
| **Backend** | NestJS | 11.x | Framework |
| | Prisma | 7.x | ORM |
| | TypeScript | 5.x | Language |
| **Database** | PostgreSQL | 16 | RDBMS |
| **DevOps** | Docker | Latest | Containerization |
| | Docker Compose | Latest | Orchestration |
| | GitHub Actions | - | CI/CD |

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
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │  │
│  │  │   Auth   │  │  Teams   │  │ Schedule │  │  Match   │      │  │
│  │  │Controller│  │Controller│  │Controller│  │Controller│      │  │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘      │  │
│  └───────┼─────────────┼─────────────┼─────────────┼────────────┘  │
│          │             │             │             │                │
│  ┌───────┼─────────────┼─────────────┼─────────────┼────────────┐  │
│  │       ▼             ▼             ▼             ▼            │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │  │
│  │  │   Auth   │  │  Regist  │  │ Schedule │  │  Match   │     │  │
│  │  │ Service  │  │ Service  │  │ Service  │  │ Service  │     │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │  │
│  │                      Business Logic Layer                    │  │
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
│  ┌───────────┐  ┌───────────┐  ┌───────────┐                       │
│  │   teams   │  │  players  │  │  matches  │                       │
│  └───────────┘  └───────────┘  └───────────┘                       │
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
├── app.module.ts                 # Root module
│
├── prisma/                       # 🗄️ Data Access Layer
│   ├── prisma.module.ts
│   └── prisma.service.ts         # Prisma client wrapper
│
├── auth/                         # 🔐 Authentication Module
│   ├── auth.module.ts
│   ├── auth.controller.ts        # /auth endpoints
│   └── auth.service.ts           # Auth business logic
│
├── registration/                 # 👥 Registration Module
│   ├── registration.module.ts
│   ├── teams.controller.ts       # /teams endpoints
│   ├── players.controller.ts     # /players endpoints
│   └── registration.service.ts   # Registration logic
│
├── scheduling/                   # 📅 Scheduling Module
│   ├── scheduling.module.ts
│   ├── scheduling.controller.ts  # /schedule endpoints
│   └── scheduling.service.ts     # Scheduling logic
│
└── match/                        # ⚽ Match Module
    ├── match.module.ts
    ├── match.controller.ts       # /matches endpoints
    ├── match.service.ts          # Match logic
    └── dto/                      # Data Transfer Objects
        ├── add-match-event.dto.ts
        └── match-response.dto.ts
```

### NestJS Module Pattern

```typescript
// Mỗi module follow pattern này:

@Module({
  imports: [PrismaModule],        // Dependencies
  controllers: [XxxController],   // HTTP handlers
  providers: [XxxService],        // Business logic
  exports: [XxxService],          // Shared services
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

### API Endpoints Overview

| Module | Endpoint | Method | Description |
|--------|----------|--------|-------------|
| **Auth** | `/auth/login` | POST | Đăng nhập |
| | `/auth/logout` | POST | Đăng xuất |
| **Teams** | `/teams` | GET | Danh sách đội |
| | `/teams/:id` | GET | Chi tiết đội |
| **Players** | `/players` | GET | Danh sách cầu thủ |
| **Schedule** | `/schedule` | GET | Lịch thi đấu |
| | `/schedule/generate` | POST | Tạo lịch |
| | `/schedule/publish` | POST | Xuất bản lịch |
| **Match** | `/matches/:id` | GET | Chi tiết trận |
| | `/matches/:id/events` | POST | Thêm sự kiện |

---

## 🌐 Frontend Architecture

### Component Structure

```
apps/web/src/
│
├── main.tsx                      # Entry point
├── App.tsx                       # Root component + Routes
│
├── auth/                         # 🔐 Auth Context
│   ├── AuthContext.tsx           # Auth provider
│   └── auth.types.ts             # Type definitions
│
├── pages/                        # 📄 Page Components
│   ├── LoginPage.tsx             # /login
│   ├── StandingsPage.tsx         # /standings
│   └── ReportsPage.tsx           # /reports
│
├── services/                     # 🔌 API Layer
│   ├── http.ts                   # HTTP client
│   └── authApi.ts                # Auth API calls
│
└── assets/                       # 🖼️ Static assets
```

### Routing Structure

```tsx
<Routes>
  <Route path="/" element={<Navigate to="/standings" />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/standings" element={<StandingsPage />} />
  <Route path="/reports" element={<ReportsPage />} />
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
┌─────────────────┐         ┌─────────────────┐
│      Team       │         │     Player      │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │         │ id (PK)         │
│ name            │         │ fullName        │
│ status          │         │ dob             │
│ createdAt       │         │ nationality     │
│ updatedAt       │         │ position        │
└─────────────────┘         │ createdAt       │
                            │ updatedAt       │
                            └─────────────────┘

┌─────────────────────────────────────────────┐
│                   Match                      │
├─────────────────────────────────────────────┤
│ id (PK)                                     │
│ roundNo                                     │
│ homeTeamId (FK) ────────▶ Team.id           │
│ awayTeamId (FK) ────────▶ Team.id           │
│ stadiumId                                   │
│ kickoffAt                                   │
│ status (DRAFT | PUBLISHED | LOCKED)         │
│ createdAt                                   │
│ updatedAt                                   │
└─────────────────────────────────────────────┘
```

### Prisma Schema

```prisma
// Enums
enum TeamStatus {
  ACTIVE
  INACTIVE
}

enum PlayerPosition {
  GK    // Goalkeeper
  DF    // Defender
  MF    // Midfielder
  FW    // Forward
}

enum MatchStatus {
  DRAFT      // Đang soạn
  PUBLISHED  // Đã xuất bản
  LOCKED     // Đã khóa
}

// Models
model Team {
  id        String     @id @default(uuid())
  name      String     @unique
  status    TeamStatus @default(ACTIVE)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

model Player {
  id          String         @id @default(uuid())
  fullName    String
  dob         DateTime
  nationality String
  position    PlayerPosition
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
}

model Match {
  id         String      @id @default(uuid())
  roundNo    Int
  homeTeamId String
  awayTeamId String
  stadiumId  String?
  kickoffAt  DateTime?
  status     MatchStatus @default(DRAFT)
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
}
```

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

| Aspect | Implementation |
|--------|----------------|
| **Input Validation** | DTOs với class-validator |
| **SQL Injection** | Prisma ORM (parameterized queries) |
| **XSS** | React auto-escaping |
| **CORS** | NestJS CORS middleware |
| **Environment** | .env files, không commit secrets |

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

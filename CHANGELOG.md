# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Backend: Coach Module** — Full CRUD for managing coaches with team assignment, license type, paginated list with search/filter
- **Backend: Lineup Module** — Set/view/remove official match lineups (starting XI + substitutes) per team per match
- **Backend: Notification Module** — In-app notifications with unread count, mark-read, broadcast to roles, paginated list
- **Backend: Audit Log** — Global interceptor auto-logs all POST/PATCH/PUT/DELETE actions with entity, user, old/new values, IP
- **Backend: Global Search** — Unified search across teams, players, stadiums, seasons, coaches via `/search?q=`
- **Backend: Head-to-Head** — `GET /standings/head-to-head?team1=&team2=&seasonId=` returns win/draw/goal stats + match history
- **Backend: Player Stats** — `GET /standings/player-stats/:id?seasonId=` returns goals, assists, cards, goals-by-round chart data
- **Backend: WebSocket Gateway** — Socket.IO `/live` namespace for real-time match events, score updates, schedule publish, notifications
- **Database Schema** — Added `Coach`, `MatchLineup`, `Notification`, `AuditLog` models + `LineupRole`, `NotificationType` enums
- **Frontend: Dark Mode** — Theme toggle in header with localStorage persistence, Ant Design `darkAlgorithm` integration
- **Frontend: Global Search Bar** — Debounced autocomplete search in AppShell header, navigates to matched entity
- **Frontend: Notification Bell** — Bell icon with unread badge, popover with notification list, mark-read, auto-poll every 30s
- **Frontend: Charts** — Recharts-powered visual tab in Reports (top scorers bar, goals pie, team W/D/L stacked bar)
- **Frontend: PDF Export** — jsPDF + autotable export buttons on Reports page for top scorers and team stats
- **Frontend: Coaches Page** — Full CRUD table with search, modal form, team assignment, license type management
- **Frontend: Head-to-Head Page** — Team selector, season filter, comparison stats with match history table
- **Frontend: Enhanced Player Stats** — Advanced stats tab with overview + goals-by-round bar chart powered by new API
- **Frontend: Match Lineup UI** — Official lineup display (starting/substitutes) + modal to set lineup from roster
- **Frontend: i18n** — Vietnamese + English translations via react-i18next with language toggle in header
- **Frontend: Rate Limit Handler** — 429 response interceptor dispatches `api:rate-limited` custom event
- **Frontend API Services** — `coachApi`, `lineupApi`, `notificationApi`, `searchApi` with full TypeScript types

- **Frontend Page Tests**: 7 new page-level component tests — TeamsPage (6 tests), PlayersPage (6 tests), MatchesPage (6 tests), SeasonsPage (6 tests), SchedulePage (6 tests), RegulationsPage (6 tests), ProfilePage (6 tests) with vi.hoisted mocks and Ant Design rendering
- **Test Infrastructure**: Added `ResizeObserver` polyfill to `vitest.setup.ts` for Ant Design Tabs/Collapse components
- **Frontend Tests**: 12 new test files for all API service modules (83 tests total) — authApi, teamApi, playerApi, stadiumApi, seasonApi, seasonTeamApi, matchApi, scheduleApi, standingsApi, regulationApi, userApi, uploadApi
- **Frontend Page Tests**: 3 new page-level component tests — DashboardPage (6 tests), StandingsPage (6 tests), LoginPage (6 tests) with full mock setup
- **Backend Tests**: `users.service.spec.ts` (15 tests) — listUsers, findOne, updateRole, createUser, deleteUser with full coverage
- **Backend Tests**: `users.controller.spec.ts` (5 tests) — controller delegation tests for all endpoints
- **Backend Tests**: `upload.controller.spec.ts` (6 tests) — upload validation, URL format, error handling
- **Backend Controller Specs**: 7 new controller spec files — auth (19 tests), teams (6), players (6), season (8), season-team (5), match (7), scheduling (7), regulation (6)
- **Backend E2E Tests**: 4 new E2E spec files — scheduling, roster, users, upload (auth guard tests)
- **CI**: Added `pnpm test` step to Web CI job so frontend tests run on every PR
- **Test Infrastructure**: Added `window.matchMedia` polyfill to `vitest.setup.ts` for Ant Design component testing

### Fixed

- **Backend**: Renamed Prisma `include` key from `teamPlayers` to `roster` in `registration.service.ts` to match schema relation name
- **Backend**: Fixed import paths in `players-import.controller.ts` (`../../auth` → `../auth`, `../registration.service` → `./registration.service`)
- **Backend**: Fixed Prisma enum type casting in `players-import.controller.ts` — use `as never` for `PlayerPosition` / `PlayerType` assignments
- **Frontend**: Added missing `useNavigate` import from `react-router-dom` in `StadiumsPage.tsx`
- **Frontend**: Fixed `useRef` call in `PublicStandingsPage.tsx` — React 19 requires explicit initial value (`useRef<T>(undefined)`)
- **Tests**: Updated `registration.service.spec.ts` test expectations from `teamPlayers` to `roster`

---

## [1.1.0] - 2026-02-26

### Added

- **Season Module**: Full CRUD API for managing seasons (UPCOMING → IN_PROGRESS → COMPLETED)
- **Stadium Module**: Full CRUD API for stadium management with address, city, capacity
- **Standings Module**: Auto-calculated league standings with points, goal difference, ranking tiebreaks
- **Top Scorers API**: Vua phá lưới endpoint (`GET /standings/top-scorers`)
- **Card Stats API**: Card statistics endpoint (`GET /standings/card-stats`)
- **Team Stats API**: Per-team season statistics (`GET /standings/team-stats`)
- **Roster Module**: Team-Player relationship management (add/remove/update roster entries)
- **Season Teams Module**: Team registration per season with approval workflow (REGISTERED → APPROVED/REJECTED → WITHDRAWN)
- **MatchEvent Model**: Database storage for goals, cards, substitutions with minute tracking
- **Regulation Module**: Configurable tournament regulations per season (MIN_AGE, MAX_ROSTER, WIN_POINTS, etc.)
- **Auto Score Calculation**: Match scores auto-calculated from goal events
- **CSV Export**: Export standings, top scorers, and card stats as CSV
- **PlayerType enum**: Distinguish DOMESTIC vs FOREIGN players with foreign player limit enforcement
- **EventType enum**: GOAL, OWN_GOAL, YELLOW_CARD, RED_CARD, SUBSTITUTION, PENALTY, PENALTY_MISS
- **UUID migration**: All primary/foreign keys converted from TEXT to native PostgreSQL UUID
- **Role FK on User**: Users now have optional FK to `roles` table for extended role management

### Changed

- Updated Prisma schema with 7 new models: Season, Stadium, TeamPlayer, SeasonTeam, MatchEvent, Regulation, Standing
- Enhanced Match model: `homeScore`, `awayScore`, `leg`, `seasonId` fields; FINISHED and POSTPONED statuses
- Enhanced Team model: `shortName`, `city`, `logoUrl`, `stadiumId` fields with Stadium relation
- Enhanced Player model: `birthPlace`, `heightCm`, `weightKg`, `playerType` fields
- Prisma schema now fully synced with database migrations (was previously out of date)

---

## [1.0.0] - 2026-02-02

### Added

#### Authentication & Authorization

- User registration with email/password
- Email verification with OTP (6-digit code)
- Login/Logout functionality
- JWT-based authentication with access & refresh tokens
- Password reset flow via email OTP
- Change password for authenticated users
- OAuth integration (Google, Facebook)
- Session management (view/revoke active sessions)
- Role-based access control (ADMIN, TEAM_MANAGER, REFEREE, SUPERVISOR, PUBLIC)
- Rate limiting on sensitive endpoints

#### Team Management

- List all registered teams
- Team status tracking (ACTIVE/INACTIVE)

#### Player Management

- List all registered players
- Player info: name, date of birth, nationality, position

#### Match Scheduling

- Auto-generate match schedule
- Publish/unpublish schedule
- View schedule with match details
- Add match events (GOAL, YELLOW_CARD, RED_CARD, SUBSTITUTION)

#### Infrastructure & DevOps

- Docker containerization (API, Web, PostgreSQL)
- Docker Compose for local development
- GitHub Actions CI/CD pipeline
- CodeQL security scanning
- Dependabot for dependency updates
- PR labeling automation

#### Documentation

- Swagger/OpenAPI documentation at `/docs`
- Postman collection export
- Comprehensive README with setup instructions
- Architecture documentation
- Contributing guidelines
- Git workflow documentation

### Technical Stack

- **Backend**: NestJS, Prisma, PostgreSQL, TypeScript
- **Frontend**: React 19, Vite, Ant Design, React Router
- **Tools**: pnpm, Docker, GitHub Actions, ESLint, Prettier

---

## [0.1.0] - 2026-01-15

### Added

- Initial project setup
- Monorepo structure with pnpm workspaces
- Basic NestJS API scaffold
- Basic React frontend scaffold
- PostgreSQL database with Prisma ORM
- Docker Compose configuration

[Unreleased]: https://github.com/daithang-organization/SE104_VLEAGUE/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/daithang-organization/SE104_VLEAGUE/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/daithang-organization/SE104_VLEAGUE/compare/v0.1.0...v1.0.0
[0.1.0]: https://github.com/daithang-organization/SE104_VLEAGUE/releases/tag/v0.1.0

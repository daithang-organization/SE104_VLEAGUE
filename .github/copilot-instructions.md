# GitHub Copilot Instructions

## Project Overview

VLeague Management System — a monorepo for managing the Vietnamese professional football league. Built as a university project (SE104 - UIT).

## Tech Stack

| Layer              | Technology                      | Version                                 |
| ------------------ | ------------------------------- | --------------------------------------- |
| **Backend**        | NestJS + Prisma + PostgreSQL    | NestJS 11, Prisma 7 (adapter-pg), PG 16 |
| **Frontend**       | React + Vite + Ant Design       | React 19, Vite 7, AntD 6                |
| **Testing (API)**  | Jest + ts-jest + Supertest      |                                         |
| **Testing (Web)**  | Vitest + @testing-library/react | Vitest 4                                |
| **Monorepo**       | pnpm workspaces                 |                                         |
| **CI/CD**          | GitHub Actions                  |                                         |
| **i18n**           | i18next (vi + en)               | i18next 25, react-i18next 16            |
| **Charts**         | Recharts                        | 3.x                                     |
| **Error Tracking** | @sentry/react                   | 10.x                                    |

## Project Structure

```
apps/api/         # NestJS backend (port 8080) — 15 modules, ~65 endpoints
apps/web/         # React frontend (port 5173) — 25+ pages, 12 services
docs/             # Documentation
infra/            # Docker configs
.agent/skills/    # Agent skill guides (11 skills)
scripts/          # Setup scripts (PowerShell + Bash)
```

## Backend Architecture Summary

- **15 modules**: Auth, Registration, Match, Scheduling, Season, Stadium, Roster, Regulation, Standings, Users, Upload, Search, Health, Mail, Prisma
- **12 Prisma models**, **10 enums**, **13 migrations**
- **Global**: ValidationPipe, HttpExceptionFilter, LoggingInterceptor, JwtAuthGuard, RolesGuard, ThrottlerGuard
- **Swagger** at `/api/docs`
- **All IDs**: native PostgreSQL UUID (`@db.Uuid`)
- **Prisma 7**: uses `@prisma/adapter-pg` driver adapter with raw `pg.Pool`

## Frontend Architecture Summary

- **25+ pages** with React.lazy() code splitting
- **12 API service files** using Axios (`lib/api.ts`) with token refresh interceptor
- **Auth**: `AuthContext` (access token in-memory, refresh in localStorage)
- **Shell**: `AppShell` (protected with role-based menu) + `PublicLayout` (public pages)
- **i18n**: Vietnamese (vi) + English (en) with ~1,200 translation keys each
- **Theme**: Dark/light mode via `ThemeContext`
- **Charts**: Recharts for statistics visualization
- **Exports**: CSV (with UTF-8 BOM) + PDF (jsPDF)

## Coding Conventions

### Backend (NestJS)

- Each module: `module.ts`, `controller.ts`, `service.ts`, `dto/`
- Tests co-located: `*.spec.ts` next to source files
- Use `PrismaService` for all DB access
- All IDs are UUID (`@db.Uuid` in Prisma schema)
- Use DTOs with class-validator for input validation
- File naming: `kebab-case` (e.g., `match.service.ts`)
- Vietnamese user-facing error messages with structured error codes
- Prisma relation name for TeamPlayer is `roster` (NOT `teamPlayers`)
- Use `as never` for Prisma enum casting: `position: dto.position as never`
- Cross-module deps via `RegulationHelper.getNumericValue()` for business rules

### Frontend (React)

- Page components in `src/pages/` (PascalCase: `TeamsPage.tsx`)
- API services in `src/services/` (camelCase: `teamApi.ts`)
- Primary HTTP client: `src/lib/api.ts` (Axios with token refresh)
- Legacy HTTP client: `src/services/http.ts` (fetch, NOT used)
- Auth state via `AuthContext` (React Context, no Redux)
- Theme state via `ThemeContext` (light/dark)
- Use Ant Design components for all UI
- Translations via `useTranslation()` hook from react-i18next
- Use `Promise.allSettled` for parallel API calls (Dashboard, Reports)

### Testing Conventions

#### Backend Tests

- Service specs: `*.service.spec.ts` — mock `PrismaService`, test business logic
- Controller specs: `*.controller.spec.ts` — mock service, test delegation
- E2E specs: `test/*.e2e-spec.ts` — full HTTP tests with Supertest
- Use `Test.createTestingModule()` for DI setup
- Mock bcrypt at module level: `jest.mock('bcrypt')`
- Use `as any` for Prisma mock return types
- Mock cross-module deps: `StandingsService`, `RegulationHelper`

#### Frontend Tests

- API service tests: `src/services/__tests__/*.test.ts`
- Page tests: `src/pages/__tests__/*.test.tsx`
- Auth tests: `src/auth/AuthContext.test.tsx`, `RequireAuth.test.tsx`
- **Always use `vi.hoisted()`** for mock variables inside `vi.mock()`
- Mock `../../lib/api` for service tests
- Mock individual service files + `react-router-dom` for page tests
- Use `getAllByText()` instead of `getByText()` when Ant Design renders duplicate text
- Import paths from `__tests__/` must go up one level: `../ComponentName`

#### Test Polyfills (`vitest.setup.ts`)

- `@testing-library/jest-dom/vitest` for custom matchers
- i18n initialized with Vietnamese (no language detector)
- `ResizeObserver` polyfill (Ant Design Tabs, Collapse)
- `window.matchMedia` polyfill (Ant Design responsive)

## Running Tests

```bash
# Backend
cd apps/api && pnpm test          # Unit tests (23 suites, 233+ tests)
cd apps/api && pnpm test:e2e      # E2E tests
cd apps/api && pnpm test:cov      # Coverage

# Frontend
cd apps/web && pnpm test          # Vitest (24 suites, 143+ tests)
cd apps/web && pnpm exec vitest   # Watch mode
```

## CI Pipeline

Both API and Web tests run in GitHub Actions CI on every PR/push to `main`.

## Key Business Rules

- **5 user roles**: ADMIN, TEAM_MANAGER, REFEREE, SUPERVISOR, PUBLIC
- **9 configurable regulations** per season (age, roster, foreign players, scoring, goal time)
- **Match FSM**: DRAFT → PUBLISHED → LOCKED → FINISHED (+ POSTPONED side paths)
- **Season FSM**: UPCOMING → IN_PROGRESS → COMPLETED (single direction)
- **Auto score recalculation** on event add/remove (GOAL, OWN_GOAL, PENALTY)
- **Standings auto-recalculate** when match transitions to FINISHED
- **Double round-robin scheduling** with BYE handling

## Useful References

- [NestJS + Prisma Skill](./../.agent/skills/nestjs-prisma-development/SKILL.md)
- [React + Ant Design Skill](./../.agent/skills/react-antd-frontend/SKILL.md)
- [Testing & CI/CD Skill](./../.agent/skills/testing-cicd/SKILL.md)
- [Business Rules Skill](./../.agent/skills/business-rules/SKILL.md)
- [Auth & RBAC Skill](./../.agent/skills/authentication-authorization/SKILL.md)
- [Database Skill](./../.agent/skills/database-management/SKILL.md)
- [Error Handling Skill](./../.agent/skills/error-handling/SKILL.md)
- [Performance Skill](./../.agent/skills/performance-monitoring/SKILL.md)
- [Docker Setup Skill](./../.agent/skills/docker-environment-setup/SKILL.md)
- [Deployment Skill](./../.agent/skills/deployment/SKILL.md)
- [API Docs Skill](./../.agent/skills/api-documentation/SKILL.md)
- [Architecture Docs](./../docs/ARCHITECTURE.md)
- [Contributing Guide](./../docs/CONTRIBUTING.md)

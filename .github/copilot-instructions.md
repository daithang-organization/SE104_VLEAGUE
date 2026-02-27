# GitHub Copilot Instructions

## Project Overview

VLeague Management System — a monorepo for managing the Vietnamese professional football league. Built as a university project (SE104 - UIT).

## Tech Stack

| Layer             | Technology                      | Version                    |
| ----------------- | ------------------------------- | -------------------------- |
| **Backend**       | NestJS + Prisma + PostgreSQL    | NestJS 11, Prisma 7, PG 16 |
| **Frontend**      | React + Vite + Ant Design       | React 19, Vite 7, AntD 6   |
| **Testing (API)** | Jest + ts-jest + Supertest      |                            |
| **Testing (Web)** | Vitest + @testing-library/react | Vitest 4                   |
| **Monorepo**      | pnpm workspaces                 |                            |
| **CI/CD**         | GitHub Actions                  |                            |

## Project Structure

```
apps/api/         # NestJS backend (port 8080)
apps/web/         # React frontend (port 5173)
docs/             # Documentation
infra/            # Docker configs
.agent/skills/    # Agent skill guides
```

## Coding Conventions

### Backend (NestJS)

- Each module: `module.ts`, `controller.ts`, `service.ts`, `dto/`
- Tests co-located: `*.spec.ts` next to source files
- Use `PrismaService` for all DB access
- All IDs are UUID (`@db.Uuid` in Prisma schema)
- Use DTOs with class-validator for input validation
- File naming: `kebab-case` (e.g., `match.service.ts`)

### Frontend (React)

- Page components in `src/pages/` (PascalCase: `TeamsPage.tsx`)
- API services in `src/services/` (camelCase: `teamApi.ts`)
- Primary HTTP client: `src/lib/api.ts` (Axios with token refresh)
- Auth state via `AuthContext` (React Context)
- Use Ant Design components for all UI

### Testing Conventions

#### Backend Tests

- Service specs: `*.service.spec.ts` — mock `PrismaService`, test business logic
- Controller specs: `*.controller.spec.ts` — mock service, test delegation
- E2E specs: `test/*.e2e-spec.ts` — full HTTP tests with Supertest
- Use `Test.createTestingModule()` for DI setup
- Mock bcrypt at module level: `jest.mock('bcrypt')`
- Use `as any` for Prisma mock return types

#### Frontend Tests

- API service tests: `src/services/__tests__/*.test.ts`
- Page tests: `src/pages/__tests__/*.test.tsx`
- **Always use `vi.hoisted()`** for mock variables inside `vi.mock()`
- Mock `../../lib/api` for service tests
- Mock individual service files + `react-router-dom` for page tests
- Use `getAllByText()` instead of `getByText()` when Ant Design renders duplicate text
- Import paths from `__tests__/` must go up one level: `../ComponentName`

#### Test Polyfills (`vitest.setup.ts`)

- `@testing-library/jest-dom/vitest` for custom matchers
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

## Useful References

- [Testing & CI/CD Skill](./../.agent/skills/testing-cicd/SKILL.md)
- [React + Ant Design Skill](./../.agent/skills/react-antd-frontend/SKILL.md)
- [NestJS + Prisma Skill](./../.agent/skills/nestjs-prisma-development/SKILL.md)
- [Architecture Docs](./../docs/ARCHITECTURE.md)
- [Contributing Guide](./../docs/CONTRIBUTING.md)

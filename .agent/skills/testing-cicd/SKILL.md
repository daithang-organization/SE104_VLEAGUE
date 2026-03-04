---
name: Testing & CI/CD
description: Complete guide for testing patterns, test structure, CI pipeline, and development workflow for SE104_VLEAGUE
---

# Testing & CI/CD Skill

## Test Coverage Summary

| Area                  | Suites | Framework                       |
| --------------------- | ------ | ------------------------------- |
| API Unit + Controller | 23     | Jest + ts-jest                  |
| API E2E               | 13     | Jest + Supertest                |
| Web Unit + Component  | 30     | Vitest + @testing-library/react |

---

## Backend Testing (Jest)

### Test File Structure

```
apps/api/src/
├── app.controller.spec.ts
├── auth/
│   ├── auth.service.spec.ts           # 30+ tests
│   └── auth.controller.spec.ts        # 19 tests
├── registration/
│   ├── registration.service.spec.ts
│   ├── teams.controller.spec.ts       # 6 tests
│   └── players.controller.spec.ts     # 6 tests
├── match/
│   ├── match.service.spec.ts
│   └── match.controller.spec.ts       # 7 tests
├── scheduling/
│   ├── scheduling.service.spec.ts
│   └── scheduling.controller.spec.ts  # 7 tests
├── season/
│   ├── season.service.spec.ts
│   ├── season.controller.spec.ts      # 8 tests
│   └── season-team.controller.spec.ts # 5 tests
├── stadium/
│   └── stadium.service.spec.ts
├── standings/
│   ├── standings.service.spec.ts
│   └── standings.controller.spec.ts
├── roster/
│   ├── roster.service.spec.ts
│   └── roster.controller.spec.ts
├── regulation/
│   ├── regulation.service.spec.ts
│   └── regulation.controller.spec.ts  # 6 tests
├── users/
│   ├── users.service.spec.ts          # 15 tests
│   └── users.controller.spec.ts       # 5 tests
└── upload/
    └── upload.controller.spec.ts      # 6 tests

apps/api/test/                          # E2E tests
├── app.e2e-spec.ts
├── auth.e2e-spec.ts
├── matches.e2e-spec.ts
├── regulations.e2e-spec.ts
├── roster.e2e-spec.ts
├── scheduling.e2e-spec.ts
├── seasons.e2e-spec.ts
├── stadiums.e2e-spec.ts
├── standings.e2e-spec.ts
├── teams.e2e-spec.ts
├── upload.e2e-spec.ts
├── users.e2e-spec.ts
└── jest-e2e.json
```

### Unit Test Pattern (Service)

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ModuleService } from './module.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ModuleService', () => {
  let service: ModuleService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModuleService,
        {
          provide: PrismaService,
          useValue: {
            modelName: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ModuleService>(ModuleService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should return paginated results', async () => {
    const mockData = [{ id: 'uuid-1', name: 'Test' }];
    (prisma.modelName.findMany as jest.Mock).mockResolvedValue(mockData);
    (prisma.modelName.count as jest.Mock).mockResolvedValue(1);

    const result = await service.findAll({ page: 1, limit: 10 });
    expect(result.data).toEqual(mockData);
    expect(result.total).toBe(1);
  });
});
```

### Controller Test Pattern

```typescript
describe('ModuleController', () => {
  let controller: ModuleController;
  let service: ModuleService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [ModuleController],
      providers: [
        {
          provide: ModuleService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(ModuleController);
    service = module.get(ModuleService);
  });

  it('should delegate to service', async () => {
    const mockResult = { id: 'uuid-1' };
    (service.findOne as jest.Mock).mockResolvedValue(mockResult);
    expect(await controller.findOne('uuid-1')).toBe(mockResult);
  });
});
```

### Auth Service Test Pattern

```typescript
// IMPORTANT: Mock bcrypt at module level
jest.mock('bcrypt');
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  // ... setup with mocked PrismaService, JwtService, MailService, ConfigService

  it('should login successfully', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    // ... test login flow
  });
});
```

### E2E Test Pattern

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('TeamsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/teams (GET)', () => {
    return request(app.getHttpServer()).get('/api/teams').expect(200);
  });
});
```

### Backend Test Tips

- Use `as any` for Prisma mock return types when TypeScript complains
- Mock cross-module services (e.g., `StandingsService`, `RegulationHelper`) when testing modules that import them
- For `MatchService` tests: mock `StandingsService.recalculate()` and `RegulationHelper.getNumericValue()`
- For `RosterService` tests: mock `RegulationHelper` for MAX_ROSTER, MAX_FOREIGN_PLAYERS validation

---

## Frontend Testing (Vitest)

### Test File Structure

```
apps/web/src/
├── auth/
│   ├── AuthContext.test.tsx
│   └── RequireAuth.test.tsx
├── pages/__tests__/
│   ├── DashboardPage.test.tsx
│   ├── TeamsPage.test.tsx
│   ├── PlayersPage.test.tsx
│   ├── SeasonsPage.test.tsx
│   ├── MatchesPage.test.tsx
│   ├── SchedulePage.test.tsx
│   ├── StandingsPage.test.tsx
│   ├── RegulationsPage.test.tsx
│   ├── ProfilePage.test.tsx
│   └── LoginPage.test.tsx
└── services/__tests__/
    ├── authApi.test.ts
    ├── teamApi.test.ts
    ├── playerApi.test.ts
    ├── stadiumApi.test.ts
    ├── seasonApi.test.ts
    ├── seasonTeamApi.test.ts
    ├── matchApi.test.ts
    ├── scheduleApi.test.ts
    ├── standingsApi.test.ts
    ├── regulationApi.test.ts
    ├── searchApi.test.ts
    ├── userApi.test.ts
    └── uploadApi.test.ts
```

### Service Test Pattern

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

// CRITICAL: Use vi.hoisted() for mock variables
const mockApi = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
  put: vi.fn(),
}));

vi.mock('../../lib/api', () => ({
  default: mockApi,
}));

import { apiGetTeams, apiCreateTeam } from '../teamApi';

describe('teamApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch teams', async () => {
    const mockResponse = { data: { data: [], total: 0, page: 1, limit: 10 } };
    mockApi.get.mockResolvedValue(mockResponse);
    const result = await apiGetTeams({ page: 1, limit: 10 });
    expect(mockApi.get).toHaveBeenCalledWith('/teams', { params: { page: 1, limit: 10 } });
    expect(result).toEqual(mockResponse.data);
  });
});
```

### Page Component Test Pattern

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock services
vi.mock('../../services/teamApi', () => ({
  apiGetTeams: vi.fn().mockResolvedValue({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 }),
}));

// Mock react-router-dom partially
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: vi.fn(() => vi.fn()) };
});

// Import paths from __tests__/ go up one level
import TeamsPage from '../TeamsPage';

describe('TeamsPage', () => {
  it('renders without crashing', async () => {
    render(
      <MemoryRouter>
        <TeamsPage />
      </MemoryRouter>
    );
    await waitFor(() => {
      // Use getAllByText for Ant Design duplicate rendering
      expect(screen.getAllByText(/teams/i).length).toBeGreaterThan(0);
    });
  });
});
```

### Test Setup (`vitest.setup.ts`)

```typescript
import '@testing-library/jest-dom/vitest';

// i18n — Vietnam, no language detector
import './lib/i18n';

// ResizeObserver polyfill (Ant Design Tabs, Collapse)
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// window.matchMedia polyfill (Ant Design responsive)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

### Frontend Test Gotchas

1. **`vi.hoisted()` is MANDATORY** for mock variables used inside `vi.mock()` — Vitest hoists `vi.mock()` to top of file
2. **Ant Design duplicate text**: Use `getAllByText()` instead of `getByText()` — AntD often renders text in multiple DOM nodes
3. **Import paths**: Tests in `__tests__/` must import components with `../ComponentName`
4. **LoginPage button**: The submit button renders as `<button>` inside AntD Form — query by role: `getByRole('button', { name: /login/i })`
5. **Mock individual services**: Don't mock the entire services directory — mock specific service files
6. **Vitest config**: `environment: 'jsdom'`, `globals: true`, `css: false`

---

## CI/CD Pipeline (GitHub Actions)

### Workflow Structure

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request] → main

jobs:
  api-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env: POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB
        ports: ["5432:5432"]
    steps:
      - Checkout
      - Setup Node.js + pnpm
      - Install dependencies
      - Generate Prisma client
      - Run migrations (migrate deploy)
      - Seed database
      - Run unit tests (pnpm test)
      - Run E2E tests (pnpm test:e2e)

  web-test:
    runs-on: ubuntu-latest
    steps:
      - Checkout
      - Setup Node.js + pnpm
      - Install dependencies
      - Run Vitest (pnpm test)
```

### Additional CI Features

- **PR Labeler**: Auto-labels PRs based on file paths
- **CodeQL**: Security scanning
- **Dependabot**: Automated dependency updates

---

## Development Workflow

### Branch Strategy

```
main (protected)
  ├── feature/VL-xxx-description
  ├── fix/VL-xxx-description
  └── chore/description
```

### Commit Convention (Conventional Commits)

```
feat(module): add new feature
fix(module): fix bug description
test(module): add/update tests
docs: update documentation
chore: maintenance tasks
refactor(module): code restructuring
```

### PR Flow

1. Create feature branch from `main`
2. Implement + add tests
3. Push → CI runs automatically
4. PR review → merge to `main`

### Branch Protection Rules

- Require CI passing before merge
- Require PR review
- No direct push to `main`

---

## Running Tests

```bash
# Backend
cd apps/api
pnpm test                    # Unit tests (23 suites)
pnpm test:watch              # Watch mode
pnpm test:cov                # Coverage report
pnpm test:e2e                # E2E tests (requires DB)

# Frontend
cd apps/web
pnpm test                    # Vitest (30 suites)
pnpm exec vitest             # Watch mode
pnpm exec vitest --coverage  # Coverage

# Run single test file
cd apps/api && pnpm test -- auth.service.spec
cd apps/web && pnpm exec vitest src/services/__tests__/teamApi.test.ts
```

---

## Troubleshooting

### API Tests

- **"Cannot find module 'bcrypt'"**: Ensure `jest.mock('bcrypt')` is at module level (before imports)
- **Prisma type errors in mocks**: Use `as any` for mock return values
- **E2E tests fail**: Check PostgreSQL is running and DATABASE_URL is correct
- **Cross-module injection errors**: Ensure mock providers include all injected services

### Web Tests

- **"ReferenceError: vi is not defined"**: Add `globals: true` to vitest.config.ts
- **"ResizeObserver is not defined"**: Check vitest.setup.ts polyfill is loaded
- **"Cannot find module"**: Verify import paths (from `__tests__/` → `../Component`)
- **Ant Design matcher failures**: Use `getAllByText` or `queryAllByText` instead of singular variants
- **Mock not working**: Ensure `vi.hoisted()` wraps mock variables, and `vi.mock()` path matches import exactly

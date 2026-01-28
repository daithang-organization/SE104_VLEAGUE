---
name: Testing & CI/CD
description: Guide for running tests, understanding CI pipelines, and following development workflows for SE104_VLEAGUE
---

# Testing & CI/CD Skill

This skill covers testing strategies, CI/CD pipelines, and development workflows for the SE104_VLEAGUE project.

## Testing Overview

The project uses different testing strategies for API and Web:

- **API (apps/api)**: Jest for unit tests + Supertest for E2E tests
- **Web (apps/web)**: ESLint for code quality
- **All workspaces**: Prettier for code formatting

## API Testing

### Test Structure

```
apps/api/
├── src/
│   └── **/*.spec.ts         # Unit tests (co-located with source)
└── test/
    └── **/*.e2e-spec.ts     # E2E tests
```

### Running Tests

```bash
cd apps/api

# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:cov

# Run E2E tests
pnpm test:e2e

# Run specific test file
pnpm test -- teams.service.spec.ts
```

### Unit Test Example

```typescript
// src/registration/teams.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { TeamsService } from './teams.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TeamsService', () => {
  let service: TeamsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamsService,
        {
          provide: PrismaService,
          useValue: {
            team: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<TeamsService>(TeamsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of teams', async () => {
      const mockTeams = [
        { id: '1', name: 'Team A', status: 'ACTIVE' },
        { id: '2', name: 'Team B', status: 'ACTIVE' },
      ];

      jest.spyOn(prisma.team, 'findMany').mockResolvedValue(mockTeams);

      const result = await service.findAll();
      expect(result).toEqual(mockTeams);
      expect(prisma.team.findMany).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new team', async () => {
      const createDto = { name: 'New Team', status: 'ACTIVE' };
      const mockTeam = { id: '1', ...createDto };

      jest.spyOn(prisma.team, 'create').mockResolvedValue(mockTeam);

      const result = await service.create(createDto);
      expect(result).toEqual(mockTeam);
      expect(prisma.team.create).toHaveBeenCalledWith({ data: createDto });
    });
  });
});
```

### E2E Test Example

```typescript
// test/teams.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Teams API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/teams (GET) - should return list of teams', () => {
    return request(app.getHttpServer())
      .get('/teams')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/teams (POST) - should create a new team', () => {
    const createDto = {
      name: 'Test Team',
      status: 'ACTIVE',
    };

    return request(app.getHttpServer())
      .post('/teams')
      .send(createDto)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toBe(createDto.name);
      });
  });
});
```

### Test Configuration

Jest configuration is in `apps/api/package.json`:

```json
{
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": ["**/*.(t|j)s"],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
```

## Linting and Formatting

### Running Linters

```bash
# Root level (all workspaces)
pnpm lint        # Run ESLint on all workspaces
pnpm format      # Run Prettier on all files

# API only
cd apps/api
pnpm lint        # ESLint with auto-fix

# Web only
cd apps/web
pnpm lint        # ESLint
```

### ESLint Configuration

**API**: `apps/api/eslint.config.mjs`
**Web**: `apps/web/eslint.config.js`

Both use TypeScript ESLint with project-specific rules.

### Prettier Configuration

**Root level**: `.prettierrc.cjs`

```javascript
module.exports = {
  semi: true,
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
};
```

## CI/CD Pipeline

### GitHub Actions Workflow

Location: `.github/workflows/ci.yml` (or similar)

The CI pipeline runs on:
- Push to `main` branch
- Pull Requests to `main`

### CI Pipeline Steps

1. **Setup**:
   - Checkout code
   - Setup Node.js 20
   - Enable corepack for pnpm
   - Install dependencies

2. **API Checks**:
   - Lint: `pnpm --filter api lint`
   - Test: `pnpm --filter api test`
   - Build: `pnpm --filter api build`

3. **Web Checks**:
   - Lint: `pnpm --filter web lint`
   - Build: `pnpm --filter web build`

4. **PR Title Check**:
   - Validates PR title follows Conventional Commits format

### Example CI Configuration

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  api:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: vleague_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Enable Corepack
        run: corepack enable
        
      - name: Install dependencies
        run: pnpm install
        
      - name: Generate Prisma Client
        working-directory: apps/api
        run: pnpm dlx prisma generate
        
      - name: Lint
        working-directory: apps/api
        run: pnpm lint
        
      - name: Test
        working-directory: apps/api
        run: pnpm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/vleague_test
        
      - name: Build
        working-directory: apps/api
        run: pnpm build

  web:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Enable Corepack
        run: corepack enable
        
      - name: Install dependencies
        run: pnpm install
        
      - name: Lint
        working-directory: apps/web
        run: pnpm lint
        
      - name: Build
        working-directory: apps/web
        run: pnpm build
```

## Conventional Commits

### PR Title Format

All PRs to `main` must follow Conventional Commits format:

```
<type>: <summary>
```

**Allowed types**:
- `feat`: New feature
- `fix`: Bug fix
- `chore`: Maintenance tasks
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `ci`: CI/CD changes

**Examples**:
- ✅ `feat: add team registration endpoint`
- ✅ `fix: resolve match scheduling conflict`
- ✅ `chore: update dependencies`
- ✅ `docs: update README with setup instructions`
- ❌ `Add new feature` (missing type)
- ❌ `Feature: add teams` (wrong capitalization)

### PR Title Validation

The CI pipeline includes a PR title check that validates the format using a GitHub Action.

## Branch Protection

### Rules for `main` branch:

1. **Require Pull Request**: Direct pushes to `main` are blocked
2. **Require Approvals**: At least 1 approval needed
3. **Required Status Checks**:
   - API lint must pass
   - API test must pass
   - API build must pass
   - Web lint must pass
   - Web build must pass
   - PR title check must pass
4. **Up-to-date branches**: Branch must be up-to-date with `main`

## Development Workflow

### Standard Workflow

1. **Create Feature Branch**:
   ```bash
   git checkout -b feat/add-player-management
   ```

2. **Make Changes**:
   - Write code
   - Write tests
   - Run tests locally

3. **Lint and Format**:
   ```bash
   pnpm lint
   pnpm format
   ```

4. **Commit Changes**:
   ```bash
   git add .
   git commit -m "feat: add player management endpoints"
   ```

5. **Push and Create PR**:
   ```bash
   git push origin feat/add-player-management
   ```
   - Create PR with Conventional Commits title
   - Wait for CI to pass
   - Request review

6. **Merge**:
   - Once approved and CI passes
   - Squash and merge to `main`

### Pre-commit Checklist

Before pushing code, ensure:

- [ ] Code compiles without errors
- [ ] All tests pass (`pnpm test`)
- [ ] No linting errors (`pnpm lint`)
- [ ] Code is formatted (`pnpm format`)
- [ ] New features have tests
- [ ] Database migrations are created if schema changed
- [ ] Environment variables documented if added

## CI/CD Best Practices

> [!TIP]
> **Test Locally First**: Always run `pnpm lint` and `pnpm test` locally before pushing to avoid CI failures.

> [!TIP]
> **Small PRs**: Keep PRs small and focused. Easier to review and faster to merge.

> [!IMPORTANT]
> **Prisma Generate**: The project has a `postinstall` script that runs `prisma generate`. This ensures CI has the Prisma Client available.

> [!WARNING]
> **Environment Variables**: Never commit `.env` files or secrets to Git. Use GitHub Secrets for sensitive data in CI.

## Troubleshooting CI Failures

### API Build Fails

**Cause**: Prisma Client not generated

**Solution**: The `postinstall` script should handle this, but if it fails:
```yaml
- name: Generate Prisma Client
  working-directory: apps/api
  run: pnpm dlx prisma generate
```

### Tests Fail in CI but Pass Locally

**Causes**:
1. Missing environment variables
2. Database connection issues
3. Different Node.js versions

**Solutions**:
1. Check `DATABASE_URL` is set in workflow
2. Verify PostgreSQL service is running
3. Match Node.js version (20.x) in workflow

### Lint Errors

**Cause**: Code doesn't follow ESLint rules

**Solution**:
```bash
cd apps/api  # or apps/web
pnpm lint    # Shows errors
```

Fix manually or use auto-fix where possible.

### PR Title Check Fails

**Cause**: PR title doesn't follow Conventional Commits

**Solution**: Edit PR title to match format:
```
feat: description
```

## Common Commands Summary

```bash
# Testing
pnpm test              # Run all tests (root)
pnpm --filter api test # API tests only
pnpm test:watch        # Watch mode
pnpm test:cov          # Coverage report

# Linting & Formatting
pnpm lint              # Lint all workspaces
pnpm format            # Format all files
pnpm --filter api lint # API only
pnpm --filter web lint # Web only

# Building
pnpm build             # Build all workspaces
pnpm --filter api build
pnpm --filter web build

# CI Simulation (run what CI runs)
pnpm lint && pnpm test && pnpm build
```

## Build Artifacts

After successful CI runs, the following artifacts are produced:

- **API**: `apps/api/dist/` - Compiled JavaScript
- **Web**: `apps/web/dist/` - Optimized static files

> [!NOTE]
> Currently, artifacts are built but not deployed. Deployment configuration may be added in the future.

## Monitoring CI

### View CI Runs

1. Go to GitHub repository
2. Click "Actions" tab
3. View workflow runs

### CI Status Badge

Add to README.md:
```markdown
![CI](https://github.com/username/SE104_VLEAGUE/workflows/CI/badge.svg)
```

## Future CI/CD Enhancements

Potential additions:
- [ ] Automated deployment to staging
- [ ] E2E tests with Playwright/Cypress
- [ ] Performance testing
- [ ] Security scanning
- [ ] Dependency vulnerability checks
- [ ] Docker image publishing
- [ ] Automated releases with semantic versioning

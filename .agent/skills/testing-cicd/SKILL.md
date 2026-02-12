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

### Authentication Service Test Pattern

When testing auth service with multiple dependencies:

```typescript
// auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';

// Mock bcrypt at module level
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    role: 'USER',
    roleId: null, // Required: UUID FK to roles table
    emailVerified: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            otpCode: {
              create: jest.fn(),
              findFirst: jest.fn(),
            },
            refreshToken: {
              create: jest.fn(),
              findUnique: jest.fn(),
              updateMany: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('mock-token'),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendEmailVerificationOtp: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);
      jest.spyOn(prisma.refreshToken, 'create').mockResolvedValue({} as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login('test@example.com', 'password');

      expect(result.accessToken).toBeDefined();
      expect(result.user.email).toBe(mockUser.email);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login('test@example.com', 'wrong')).rejects.toThrow();
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

### GitHub Actions Workflows

The project has multiple CI/CD workflows in `.github/workflows/`:

| Workflow   | File             | Purpose                                    |
| ---------- | ---------------- | ------------------------------------------ |
| CI         | `ci.yml`         | Main CI pipeline (lint, test, build)       |
| PR Labeler | `pr-labeler.yml` | Auto-label PRs based on title, files, size |
| CodeQL     | `codeql.yml`     | Security analysis for JS/TS                |

### CI Pipeline Features

The main CI pipeline (`ci.yml`) includes:

1. **Concurrency Control**: Cancels in-progress runs when new commits are pushed
2. **pnpm Caching**: Speeds up dependency installation
3. **TypeScript Type Checking**: Runs `tsc --noEmit` before build
4. **Security Audit**: Checks for vulnerable dependencies
5. **Test Coverage**: Uploads coverage reports to Codecov
6. **Build Artifacts**: Uploads build outputs for deployment

### CI Pipeline Jobs

```
┌─────────────────────────────────────────────────────────────┐
│                        CI Pipeline                          │
├─────────────────────────────────────────────────────────────┤
│  api                │  web                │  security       │
│  ├─ Lint            │  ├─ Lint            │  └─ pnpm audit  │
│  ├─ Type Check      │  ├─ Type Check      │                 │
│  ├─ Test + Coverage │  └─ Build           │                 │
│  └─ Build           │                     │                 │
├─────────────────────────────────────────────────────────────┤
│  pr-title           │  pr-branch          │  pr-size        │
│  (Conventional)     │  (Naming)           │  (Warnings)     │
├─────────────────────────────────────────────────────────────┤
│                      ci-success                             │
│                 (Final status gate)                         │
└─────────────────────────────────────────────────────────────┘
```

### Running CI Locally

Simulate what CI runs locally:

```bash
# Full CI simulation
pnpm lint && pnpm test && pnpm build

# API only
cd apps/api
pnpm lint
pnpm exec tsc --noEmit
pnpm test
pnpm test:cov
pnpm build

# Web only
cd apps/web
pnpm lint
pnpm exec tsc --noEmit
pnpm build

# Security audit
pnpm audit --audit-level high
```

### Environment Variables in CI

CI uses these environment variables:

| Variable       | Purpose                          |
| -------------- | -------------------------------- |
| `NODE_VERSION` | Node.js version (20)             |
| `STORE_PATH`   | pnpm store directory for caching |

### Dependabot Configuration

The project uses Dependabot (`.github/dependabot.yml`) for automatic dependency updates:

- **NPM dependencies**: Weekly updates on Monday
- **GitHub Actions**: Monthly updates
- **Grouping**: Minor/patch updates are grouped to reduce PR noise
- **Labels**: Auto-labeled with `dependencies`, `type:chore`, and area labels

### CodeQL Security Analysis

The CodeQL workflow (`.github/workflows/codeql.yml`) provides:

- JavaScript/TypeScript security scanning
- Runs on push, PRs, and weekly schedule
- Reports vulnerabilities in GitHub Security tab

### PR Auto-Labeling

The PR labeler workflow adds labels based on:

1. **PR Title** (Conventional Commits):
   - `feat:` → `type:feature`
   - `fix:` → `type:bugfix`
   - `chore:` → `type:chore`
   - etc.

2. **Changed Files**:
   - `apps/api/*` → `area:api`
   - `apps/web/*` → `area:web`
   - `.github/*` → `area:ci`
   - `*.md` → `area:docs`

3. **PR Size**:
   - `size:XS` (<10 changes)
   - `size:S` (10-49 changes)
   - `size:M` (50-199 changes)
   - `size:L` (200-499 changes)
   - `size:XL` (500+ changes)

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

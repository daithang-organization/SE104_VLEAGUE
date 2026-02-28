# SE104_VLEAGUE Agent Skills

This directory contains specialized agent skills for working with the SE104_VLEAGUE project. Each skill provides comprehensive guidance on specific aspects of the project.

## Available Skills

### 🔧 [NestJS + Prisma Development](./nestjs-prisma-development/SKILL.md)

Guide for developing backend features using NestJS framework with Prisma ORM.

**Use this skill when**:

- Creating new API modules, controllers, or services
- Working with Prisma schema and database models
- Writing DTOs and implementing validation
- Implementing business logic in services
- Writing backend unit tests (service/controller specs)

**Key topics**:

- Module structure and organization
- Controller and service patterns
- Prisma schema conventions
- Error handling
- Unit testing with Jest (23 suites, 233+ tests)

---

### 🗄️ [Database Management](./database-management/SKILL.md)

Guide for managing PostgreSQL database using Prisma migrations and seeding.

**Use this skill when**:

- Creating or modifying database schema
- Running migrations
- Seeding data
- Troubleshooting database connections
- Managing schema evolution

**Key topics**:

- Prisma migration workflow
- Schema development patterns
- Database seeding
- Prisma CLI commands
- Connection troubleshooting

---

### ⚛️ [React + Ant Design Frontend](./react-antd-frontend/SKILL.md)

Guide for developing frontend features using React, TypeScript, Vite, and Ant Design.

**Use this skill when**:

- Creating new pages or components
- Integrating with backend APIs
- Using Ant Design components
- Implementing forms and tables
- Managing component state
- Writing frontend tests with Vitest

**Key topics**:

- Component patterns and structure
- API service layer
- TypeScript types and interfaces
- Ant Design component usage
- Routing with React Router
- Frontend testing with Vitest + @testing-library/react

---

### 🐳 [Docker & Environment Setup](./docker-environment-setup/SKILL.md)

Guide for Docker infrastructure, environment configuration, and local development setup.

**Use this skill when**:

- Setting up local development environment
- Working with Docker Compose
- Configuring environment variables
- Troubleshooting infrastructure issues
- Understanding port configurations

**Key topics**:

- Docker Compose workflows
- Environment variable management
- Local development setup
- PostgreSQL in Docker
- Common infrastructure issues

---

### ✅ [Testing & CI/CD](./testing-cicd/SKILL.md)

Guide for running tests, understanding CI pipelines, and following development workflows.

**Use this skill when**:

- Writing or running tests (backend Jest or frontend Vitest)
- Understanding CI/CD pipeline
- Following Conventional Commits
- Troubleshooting CI failures
- Understanding branch protection rules

**Key topics**:

- Jest unit and E2E testing (API — 23 suites, 233+ tests)
- Vitest + @testing-library/react (Web — 24 suites, 143+ tests)
- Frontend test patterns (`vi.hoisted()`, mocking, Ant Design polyfills)
- ESLint and Prettier
- GitHub Actions workflow
- Conventional Commits format
- Development workflow best practices

---

## How to Use These Skills

1. **Read the relevant skill** when starting work on a specific area
2. **Follow the patterns** and examples provided
3. **Reference commands** as needed during development
4. **Check troubleshooting sections** when encountering issues

## Project Quick Reference

### Key Technologies

- **Backend**: NestJS 11, Prisma 7, PostgreSQL, TypeScript
- **Frontend**: React 19, Vite 7, Ant Design 6, TypeScript
- **Infrastructure**: Docker, pnpm workspaces
- **CI/CD**: GitHub Actions, Conventional Commits

### Common Commands

```bash
# Development
pnpm dev                    # Start all services
pnpm --filter api dev       # API only
pnpm --filter web dev       # Web only

# Database
cd apps/api
pnpm dlx prisma migrate dev # Create migration
pnpm dlx prisma studio      # Open database GUI
pnpm run db:seed           # Seed database

# Testing & Linting
pnpm test                  # Run all tests
pnpm lint                  # Lint all workspaces
pnpm format                # Format all files
pnpm build                 # Build all workspaces

# Docker
docker compose -f infra/docker-compose.db.yml up -d  # Start PostgreSQL
docker compose up --build                             # Start all services
```

### Project Structure

```
SE104_VLEAGUE/
├── apps/
│   ├── api/              # NestJS backend
│   │   ├── src/          # Source code
│   │   ├── prisma/       # Database schema & migrations
│   │   └── test/         # E2E tests
│   └── web/              # React frontend
│       └── src/          # Source code
├── docs/                 # Documentation
├── infra/                # Docker configurations
└── .github/              # CI/CD workflows
```

### Ports

| Service    | Port | URL                   |
| ---------- | ---- | --------------------- |
| PostgreSQL | 5432 | localhost:5432        |
| API        | 8080 | http://localhost:8080 |
| Web        | 5173 | http://localhost:5173 |

## Need Help?

1. Check the relevant skill document
2. Review `docs/` directory for additional documentation
3. Check project README for quick start guide
4. Review existing code for patterns and examples

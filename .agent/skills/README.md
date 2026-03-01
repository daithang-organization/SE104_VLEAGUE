# Agent Skills Index

Quick reference for all skill guides in this project. Each skill covers a specific domain of the SE104_VLEAGUE system.

## Skills Directory

| #   | Skill                  | Path                                                                   | Covers                                                                   |
| --- | ---------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 1   | **NestJS + Prisma**    | [nestjs-prisma-development/](nestjs-prisma-development/SKILL.md)       | 15 modules, 65+ endpoints, Prisma schema, guards, interceptors, patterns |
| 2   | **React + Ant Design** | [react-antd-frontend/](react-antd-frontend/SKILL.md)                   | 25+ pages, 12 services, auth flow, i18n, shell, components               |
| 3   | **Testing & CI/CD**    | [testing-cicd/](testing-cicd/SKILL.md)                                 | Jest (23 suites), Vitest (24 suites), E2E, GitHub Actions                |
| 4   | **Business Rules**     | [business-rules/](business-rules/SKILL.md)                             | Regulations, scoring, state machines, RBAC matrix, constraints           |
| 5   | **Auth & RBAC**        | [authentication-authorization/](authentication-authorization/SKILL.md) | JWT, OAuth (Google/Facebook), OTP, sessions, 5 roles                     |
| 6   | **Database**           | [database-management/](database-management/SKILL.md)                   | 12 models, 10 enums, migrations, seeding, ERD                            |
| 7   | **Error Handling**     | [error-handling/](error-handling/SKILL.md)                             | HttpExceptionFilter, error codes, frontend handling                      |
| 8   | **Performance**        | [performance-monitoring/](performance-monitoring/SKILL.md)             | Pino logging, caching, rate limiting, health, Sentry                     |
| 9   | **API Documentation**  | [api-documentation/](api-documentation/SKILL.md)                       | Swagger/OpenAPI setup, decorators, DTO docs                              |
| 10  | **Docker Setup**       | [docker-environment-setup/](docker-environment-setup/SKILL.md)         | Docker Compose, env vars, dev workflows, ports                           |
| 11  | **Deployment**         | [deployment/](deployment/SKILL.md)                                     | Production Docker, migrations, SSL, security                             |

## Quick Reference

### Tech Stack

| Layer          | Technology                      | Version     |
| -------------- | ------------------------------- | ----------- |
| Backend        | NestJS + Prisma + PostgreSQL    | 11 / 7 / 16 |
| Frontend       | React + Vite + Ant Design       | 19 / 7 / 6  |
| Backend Tests  | Jest + ts-jest + Supertest      | —           |
| Frontend Tests | Vitest + @testing-library/react | 4 / 16      |
| i18n           | i18next (vi + en)               | 25          |
| Charts         | Recharts                        | 3           |
| Error Tracking | @sentry/react                   | 10          |

### Common Commands

```bash
# Development
cd apps/api && pnpm dev          # API on :8080
cd apps/web && pnpm dev          # Web on :5173

# Database
cd apps/api
pnpm dlx prisma migrate dev     # Create migration
pnpm dlx prisma generate        # Generate client
pnpm dlx prisma studio          # GUI at :5555
pnpm run db:seed                # Seed data

# Testing
cd apps/api && pnpm test         # API: 23 suites, 233+ tests
cd apps/api && pnpm test:e2e     # E2E tests
cd apps/web && pnpm test         # Web: 24 suites, 143 tests

# Docker
docker compose -f infra/docker-compose.db.yml up -d   # PostgreSQL only
docker compose up -d --build                            # Full stack
```

### Project Structure

```
SE104_VLEAGUE/
├── apps/api/              # NestJS backend (15 modules, ~65 endpoints)
│   ├── src/               # Source code (auth, match, season, standings, ...)
│   ├── prisma/            # Schema (12 models, 10 enums), migrations, seeds
│   └── test/              # E2E specs
├── apps/web/              # React frontend (25+ pages, 12 services)
│   └── src/               # Pages, services, components, auth, shell, i18n
├── .agent/skills/         # This directory — 11 skill guides
├── .github/               # CI workflows, copilot-instructions.md
├── docs/                  # Architecture, API docs, guides
├── infra/                 # Docker Compose configs
└── scripts/               # Setup scripts (PowerShell + Bash)
```

### Key URLs (Development)

| URL                              | Purpose         |
| -------------------------------- | --------------- |
| `http://localhost:5173`          | Frontend (Vite) |
| `http://localhost:8080/api`      | Backend API     |
| `http://localhost:8080/api/docs` | Swagger UI      |
| `http://localhost:5555`          | Prisma Studio   |

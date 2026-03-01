---
name: Docker & Environment Setup
description: Docker Compose configs, environment setup, and development workflows for SE104_VLEAGUE
---

# Docker & Environment Setup Skill

## Quick Start (Fresh Clone)

```bash
# 1. Install dependencies
pnpm install

# 2. Start PostgreSQL
docker compose -f infra/docker-compose.db.yml up -d

# 3. Configure environment
cp apps/api/.env.example apps/api/.env
# Edit DATABASE_URL, JWT secrets, etc.

# 4. Run migrations + seed
cd apps/api
pnpm dlx prisma migrate dev
pnpm run db:seed

# 5. Start development servers
cd apps/api && pnpm dev    # Port 8080
cd apps/web && pnpm dev    # Port 5173
```

---

## Docker Compose Configurations

### Database Only (`infra/docker-compose.db.yml`)

```yaml
services:
  db:
    image: postgres:16-alpine
    ports: ['5432:5432']
    environment:
      POSTGRES_USER: vleague
      POSTGRES_PASSWORD: vleague
      POSTGRES_DB: vleague
    volumes: [pgdata:/var/lib/postgresql/data]
```

```bash
docker compose -f infra/docker-compose.db.yml up -d
```

### Full Stack (`docker-compose.yml`)

Runs DB + API + Web together. Used for production-like testing.

```bash
docker compose up -d --build
```

---

## Port Configuration

| Service       | Port | URL                                                   |
| ------------- | ---- | ----------------------------------------------------- |
| PostgreSQL    | 5432 | `postgresql://vleague:vleague@localhost:5432/vleague` |
| API (NestJS)  | 8080 | `http://localhost:8080/api`                           |
| Web (Vite)    | 5173 | `http://localhost:5173`                               |
| Swagger       | 8080 | `http://localhost:8080/api/docs`                      |
| Prisma Studio | 5555 | `http://localhost:5555`                               |

---

## Environment Variables

### API (`apps/api/.env`)

```env
DATABASE_URL="postgresql://vleague:vleague@localhost:5432/vleague"
PORT=8080
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=dev-jwt-secret
JWT_REFRESH_SECRET=dev-refresh-secret
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
MAIL_SKIP_SEND=true
FRONTEND_URL=http://localhost:5173
# Optional OAuth (leave empty to skip):
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
# GOOGLE_CALLBACK_URL=http://localhost:8080/api/auth/google/callback
# FACEBOOK_APP_ID=
# FACEBOOK_APP_SECRET=
# FACEBOOK_CALLBACK_URL=http://localhost:8080/api/auth/facebook/callback
```

### Web (`apps/web/.env`)

```env
VITE_API_BASE_URL=http://localhost:8080/api
# Optional:
# VITE_SENTRY_DSN=
# VITE_APP_VERSION=dev
```

---

## Development Workflows

### Workflow 1: Local (Recommended)

- DB in Docker, API + Web running locally via `pnpm dev`
- Best for development with hot reload

### Workflow 2: Full Docker

- All services in Docker via `docker compose up`
- Good for testing production-like setup

### Workflow 3: Hybrid

- DB in Docker, API in Docker, Web locally
- Good for testing API in container

---

## Docker Commands Reference

```bash
# Start services
docker compose -f infra/docker-compose.db.yml up -d

# Stop services
docker compose -f infra/docker-compose.db.yml down

# View logs
docker compose -f infra/docker-compose.db.yml logs -f

# Reset database volume
docker compose -f infra/docker-compose.db.yml down -v

# Rebuild and start
docker compose up -d --build

# Execute command in running container
docker compose exec db psql -U vleague
```

---

## Troubleshooting

| Problem                           | Solution                                                                             |
| --------------------------------- | ------------------------------------------------------------------------------------ |
| Port 5432 already in use          | Stop local PostgreSQL or change port in docker-compose                               |
| Port 8080 already in use          | Change `PORT` in `.env`                                                              |
| Connection refused from API to DB | Ensure DATABASE_URL uses correct host (localhost for local, `db` for Docker network) |
| Container won't start             | Check `docker compose logs` for errors                                               |
| Prisma can't connect              | Wait for DB healthcheck, then retry                                                  |
| Hot reload not working            | Ensure Vite/NestJS dev servers are running (not Docker build)                        |
| CORS errors                       | Verify `CORS_ORIGIN` matches frontend URL exactly                                    |

---

## Setup Script

```bash
# Windows
.\scripts\setup.ps1

# Linux/Mac
./scripts/setup.sh
```

Automates: dependency install, Docker DB start, env file creation, migrations, seeding.

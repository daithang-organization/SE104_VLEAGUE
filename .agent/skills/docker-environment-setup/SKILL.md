---
name: Docker & Environment Setup
description: Guide for Docker infrastructure, environment configuration, and local development setup for SE104_VLEAGUE
---

# Docker & Environment Setup Skill

This skill covers all aspects of Docker infrastructure, environment configuration, and local development setup for the SE104_VLEAGUE project.

## Infrastructure Overview

The project uses Docker for:

- **PostgreSQL Database**: Running PostgreSQL 15+ locally
- **Optional Full Stack**: Running API + Web + Database together

## Docker Compose Configurations

### Database Only (Recommended for Development)

Location: `infra/docker-compose.db.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: vleague-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: vleague
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**Usage**:

```bash
# Start PostgreSQL
docker compose -f infra/docker-compose.db.yml up -d

# Stop PostgreSQL
docker compose -f infra/docker-compose.db.yml down

# View logs
docker compose -f infra/docker-compose.db.yml logs -f

# Remove everything including volumes (WARNING: deletes data)
docker compose -f infra/docker-compose.db.yml down -v
```

### Full Stack (Root docker-compose.yml)

Location: `docker-compose.yml`

Includes:

- PostgreSQL
- API (NestJS)
- Web (React + Vite)

```bash
# Build and start all services
docker compose up --build

# Start in detached mode
docker compose up -d

# Stop all services
docker compose down

# View logs for specific service
docker compose logs api
docker compose logs web
docker compose logs postgres
```

## Environment Variables

### API Environment (.env for apps/api)

Create or copy from example:

```bash
cp apps/api/.env.example apps/api/.env
```

**Required variables**:

```env
# Database connection
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vleague"

# Server configuration
PORT=8080
NODE_ENV=development
```

> [!IMPORTANT]
> When running API in Docker, change `localhost` to `postgres` (the service name) in DATABASE_URL.

**Docker version**:

```env
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/vleague"
```

### Web Environment (.env for apps/web)

Create or copy from example:

```bash
cp apps/web/.env.example apps/web/.env
```

**Required variables**:

```env
# API base URL
VITE_API_BASE_URL=http://localhost:8080
```

> [!NOTE]
> All Vite environment variables must be prefixed with `VITE_` to be accessible in the browser.

## Local Development Setup

### Quick Start (Fresh Clone)

> [!TIP]
> See `docs/FRESH_CLONE_CHECKLIST.md` for the complete setup guide.

1. **Prerequisites**:

   ```bash
   # Check Node.js version (>= 20)
   node --version

   # Enable corepack for pnpm
   corepack enable
   ```

2. **Install Dependencies**:

   ```bash
   pnpm install
   ```

3. **Start PostgreSQL**:

   ```bash
   docker compose -f infra/docker-compose.db.yml up -d
   ```

4. **Setup Environment Files**:

   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

5. **Setup Database**:

   ```bash
   cd apps/api
   pnpm dlx prisma migrate dev --name init
   pnpm run db:seed
   cd ../..
   ```

6. **Start Development Servers**:

   ```bash
   pnpm dev
   ```

   This runs both API and Web in parallel:
   - API: http://localhost:8080
   - Web: http://localhost:5173

### Ports Configuration

| Service    | Port | URL                         |
| ---------- | ---- | --------------------------- |
| PostgreSQL | 5432 | postgresql://localhost:5432 |
| API        | 8080 | http://localhost:8080       |
| Web        | 5173 | http://localhost:5173       |

> [!WARNING]
> **Port Conflicts**: Make sure these ports are available on your system before starting services.

## Docker Best Practices

### For Development

1. **Use Database-Only Docker**:
   - Run only PostgreSQL in Docker
   - Run API and Web locally with hot-reload
   - Faster feedback loop for development

   ```bash
   docker compose -f infra/docker-compose.db.yml up -d
   pnpm dev
   ```

2. **Check Container Status**:

   ```bash
   docker ps                    # List running containers
   docker compose ps            # List project containers
   ```

3. **View Container Logs**:

   ```bash
   docker compose logs postgres -f
   ```

4. **Access PostgreSQL CLI**:
   ```bash
   docker exec -it vleague-postgres psql -U postgres -d vleague
   ```

### For Production/Testing

1. **Use Full Stack Docker**:

   ```bash
   docker compose up --build
   ```

2. **Environment Variables**:
   - Use `.env` files or environment-specific configs
   - Never commit `.env` files with secrets

3. **Volume Management**:

   ```bash
   # List volumes
   docker volume ls

   # Inspect volume
   docker volume inspect <volume_name>

   # Remove unused volumes
   docker volume prune
   ```

## Troubleshooting

### PostgreSQL Connection Issues

**Problem**: Cannot connect to PostgreSQL

**Solutions**:

1. Check if container is running:

   ```bash
   docker ps | grep postgres
   ```

2. Check logs:

   ```bash
   docker compose -f infra/docker-compose.db.yml logs postgres
   ```

3. Verify DATABASE_URL in `.env`:

   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vleague"
   ```

4. Test connection:
   ```bash
   cd apps/api
   pnpm dlx prisma db pull
   ```

### Port Already in Use

**Problem**: Port 5432/8080/5173 already in use

**Solutions**:

1. Find and kill the process:

   ```bash
   # Windows PowerShell
   Get-Process -Id (Get-NetTCPConnection -LocalPort 5432).OwningProcess
   Stop-Process -Id <PID>

   # Or change port in docker-compose
   ports:
     - "5433:5432"  # Use different host port
   ```

2. Update DATABASE_URL to match new port

### Docker Container Won't Start

**Problem**: Container exits immediately

**Solutions**:

1. Check logs for errors:

   ```bash
   docker compose logs
   ```

2. Remove and recreate:

   ```bash
   docker compose down -v
   docker compose up --build
   ```

3. Check disk space:
   ```bash
   docker system df
   docker system prune  # Clean up
   ```

### Database Data Persists After down

This is **expected behavior** - Docker volumes persist data.

**To completely reset**:

```bash
docker compose -f infra/docker-compose.db.yml down -v
docker compose -f infra/docker-compose.db.yml up -d
cd apps/api
pnpm dlx prisma migrate dev
pnpm run db:seed
```

> [!CAUTION]
> **Data Loss**: The `-v` flag removes volumes and **deletes all database data**. Use with caution.

## Environment-Specific Configurations

### Development

```env
# apps/api/.env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vleague"
PORT=8080
NODE_ENV=development
```

### Docker Compose

```env
# apps/api/.env (when running in Docker)
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/vleague"
PORT=8080
NODE_ENV=production
```

### CI/CD (GitHub Actions)

```yaml
# .github/workflows/ci.yml
env:
  DATABASE_URL: postgresql://postgres:postgres@localhost:5432/vleague_test
```

## Docker Compose Commands Reference

```bash
# Start services
docker compose up                    # Foreground
docker compose up -d                 # Background (detached)
docker compose up --build            # Rebuild images

# Stop services
docker compose stop                  # Stop without removing
docker compose down                  # Stop and remove containers
docker compose down -v               # Stop and remove volumes (DELETE DATA)

# View status and logs
docker compose ps                    # List containers
docker compose logs                  # All logs
docker compose logs -f api           # Follow API logs
docker compose logs --tail=100 web   # Last 100 lines

# Execute commands in containers
docker compose exec api sh           # Shell in API container
docker compose exec postgres psql -U postgres -d vleague

# Restart services
docker compose restart api           # Restart specific service
docker compose restart               # Restart all

# Build
docker compose build                 # Build all services
docker compose build --no-cache api  # Rebuild without cache
```

## Development Workflows

### Workflow 1: Local Development (Recommended)

```bash
# 1. Start only PostgreSQL
docker compose -f infra/docker-compose.db.yml up -d

# 2. Run API and Web locally
pnpm dev

# Hot-reload enabled for both API and Web
```

**Advantages**:

- ✅ Fast hot-reload
- ✅ Easy debugging
- ✅ Direct access to code

### Workflow 2: Full Docker

```bash
# Run everything in Docker
docker compose up --build

# Rebuild on code changes
docker compose up --build
```

**Advantages**:

- ✅ Production-like environment
- ✅ Consistent across machines

**Disadvantages**:

- ❌ Slower feedback loop
- ❌ Need to rebuild on changes

### Workflow 3: Hybrid

```bash
# PostgreSQL in Docker
docker compose -f infra/docker-compose.db.yml up -d

# API locally
cd apps/api
pnpm dev

# Web in Docker or locally
cd apps/web
pnpm dev
```

## Health Checks

### Check PostgreSQL

```bash
# Via Docker
docker compose exec postgres pg_isready -U postgres

# Via psql
docker exec -it vleague-postgres psql -U postgres -d vleague -c "SELECT 1;"
```

### Check API

```bash
curl http://localhost:8080/health
```

Should return: `{"status":"ok"}`

### Check Web

Open browser: http://localhost:5173

## File Locations Reference

| Purpose                   | File Path                       |
| ------------------------- | ------------------------------- |
| Database Docker Compose   | `infra/docker-compose.db.yml`   |
| Full Stack Docker Compose | `docker-compose.yml`            |
| API Environment           | `apps/api/.env`                 |
| API Environment Example   | `apps/api/.env.example`         |
| Web Environment           | `apps/web/.env`                 |
| Web Environment Example   | `apps/web/.env.example`         |
| Fresh Clone Guide         | `docs/FRESH_CLONE_CHECKLIST.md` |
| Local Dev Guide           | `docs/LOCAL_DEV.md`             |

## Common Issues and Solutions

### "Prisma Client Not Found"

**Cause**: Prisma Client not generated after schema changes

**Solution**:

```bash
cd apps/api
pnpm dlx prisma generate
```

### "Migration Failed"

**Cause**: Database state conflicts with migrations

**Solution**:

```bash
cd apps/api
pnpm dlx prisma migrate reset  # WARNING: Deletes all data
pnpm run db:seed
```

### ".env File Not Loaded"

**Cause**: Missing or incorrectly named file

**Solution**:

1. Check file name is exactly `.env` (not `.env.txt`)
2. Check file location matches service root
3. Restart the development server

### Docker Volume Permission Issues

**Cause**: Volume ownership conflicts (rare on Windows)

**Solution**:

```bash
docker compose down -v
docker volume prune
docker compose up -d
```

## Multi-Stage Dockerfile

### Production-Optimized API Dockerfile

```dockerfile
# apps/api/Dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile --prod=false

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm dlx prisma generate
RUN pnpm --filter api build

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy built assets
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/prisma ./prisma

USER nestjs
EXPOSE 8080
CMD ["node", "dist/main.js"]
```

### Production Web Dockerfile

```dockerfile
# apps/web/Dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter web build

# Stage 2: Serve with nginx
FROM nginx:alpine AS runner
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

> [!TIP]
> Multi-stage builds reduce final image size significantly (from ~1GB to ~200MB).

## Docker Healthchecks

### PostgreSQL Healthcheck

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:15
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres -d vleague']
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
```

### API Healthcheck

```yaml
services:
  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    healthcheck:
      test: ['CMD', 'wget', '-q', '--spider', 'http://localhost:8080/health']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    depends_on:
      postgres:
        condition: service_healthy
```

### Health Endpoint in NestJS

```typescript
// health.controller.ts
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
```

## Remote Debugging

### Debug Configuration for Docker

```yaml
# docker-compose.debug.yml
services:
  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile.dev
    ports:
      - '8080:8080'
      - '9229:9229' # Debug port
    command: ['node', '--inspect=0.0.0.0:9229', 'dist/main.js']
    volumes:
      - ./apps/api/src:/app/src:ro
```

### VS Code Debug Configuration

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Docker: Attach to Node",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "address": "localhost",
      "localRoot": "${workspaceFolder}/apps/api",
      "remoteRoot": "/app",
      "protocol": "inspector",
      "restart": true
    }
  ]
}
```

### Development Dockerfile with Hot Reload

```dockerfile
# apps/api/Dockerfile.dev
FROM node:20-alpine
WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
RUN pnpm install

COPY . .
RUN pnpm dlx prisma generate

EXPOSE 8080 9229
CMD ["pnpm", "--filter", "api", "dev"]
```

> [!TIP]
> Use `docker compose -f docker-compose.yml -f docker-compose.debug.yml up` to enable debugging.

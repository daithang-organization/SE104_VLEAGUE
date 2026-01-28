# SE104_VLEAGUE

## Prerequisites

- Node.js >= 20
- pnpm (via corepack)
- Docker (for local PostgreSQL)
- Git

## Repo structure

- apps/api: NestJS + Prisma + PostgreSQL (REST)
- apps/web: Vite + React + TypeScript + Ant Design
- infra: docker-compose, infra scripts
- docs: documentation

## Quick start (local)

### 1) Install dependencies

```bash
corepack enable
pnpm install
```

### 2) Start PostgreSQL (Docker)

```bash
docker compose -f infra/docker-compose.db.yml up -d
```

### 3) Setup env files

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

### 4) Setup DB schema (Prisma)

```bash
cd apps/api
pnpm dlx prisma migrate dev --name init
cd ../..
```

### 5) Run dev (api + web)

```bash
pnpm dev
```

- API: http://localhost:3000/health
- Web: http://localhost:5173

## Common commands

- **Dev all**: `pnpm dev`
- **Lint all**: `pnpm lint`
- **Format all**: `pnpm format`
- **Build all**: `pnpm build`

## Env

- `apps/api/.env`: DATABASE_URL, PORT
- `apps/web/.env`: VITE_API_BASE_URL

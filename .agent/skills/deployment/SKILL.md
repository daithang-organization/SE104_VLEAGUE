---
name: Deployment
description: Production deployment, Docker, SSL, scaling for SE104_VLEAGUE
---

# Deployment Skill

## Production Deployment Checklist

1. Set all environment variables (see below)
2. Build Docker images
3. Run database migrations (`prisma migrate deploy`)
4. Seed database (if fresh)
5. Start services via Docker Compose
6. Verify health check (`/api/health`)
7. Configure reverse proxy (Nginx) with SSL

---

## Production Environment Variables

### API

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@db:5432/vleague
PORT=8080
CORS_ORIGIN=https://yourdomain.com
JWT_SECRET=<strong-random-string>
JWT_REFRESH_SECRET=<strong-random-string>
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
MAIL_HOST=smtp.provider.com
MAIL_PORT=587
MAIL_USER=...
MAIL_PASS=...
MAIL_FROM=noreply@yourdomain.com
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
FACEBOOK_CALLBACK_URL=https://yourdomain.com/api/auth/facebook/callback
FRONTEND_URL=https://yourdomain.com
```

### Web

```env
VITE_API_BASE_URL=https://yourdomain.com/api
VITE_SENTRY_DSN=https://...@sentry.io/...
VITE_APP_VERSION=1.0.0
```

---

## Docker Setup

### Multi-Stage Dockerfiles

**API** (`apps/api/Dockerfile`):

- Stage 1: Install dependencies + generate Prisma client
- Stage 2: Build NestJS
- Stage 3: Production image (slim)

**Web** (`apps/web/Dockerfile`):

- Stage 1: Install + build Vite
- Stage 2: Serve with Nginx

### Docker Compose (Production)

```yaml
# docker-compose.yml
services:
  db:
    image: postgres:16-alpine
    volumes: [pgdata:/var/lib/postgresql/data]
    environment: [POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB]
    healthcheck: pg_isready

  api:
    build: ./apps/api
    ports: ['8080:8080']
    depends_on: [db]
    environment: [DATABASE_URL, JWT_SECRET, ...]

  web:
    build: ./apps/web
    ports: ['80:80']
    depends_on: [api]
```

---

## Database Migrations in Production

```bash
# Apply all pending migrations (no interactive prompts)
pnpm dlx prisma migrate deploy

# In Docker entrypoint (apps/api/docker-entrypoint.sh):
npx prisma migrate deploy
node dist/main.js
```

---

## Health Check Endpoint

`GET /api/health` returns:

```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "memory_heap": { "status": "up" }
  }
}
```

Use in Docker healthcheck:

```yaml
healthcheck:
  test: ['CMD', 'curl', '-f', 'http://localhost:8080/api/health']
  interval: 30s
  timeout: 10s
  retries: 3
```

---

## Security Checklist

- [ ] Strong JWT secrets (min 32 chars)
- [ ] CORS restricted to production domain
- [ ] Helmet security headers enabled (production only)
- [ ] Rate limiting active (ThrottlerGuard)
- [ ] Database credentials rotated
- [ ] MAIL_SKIP_SEND=false in production
- [ ] Sentry DSN configured
- [ ] HTTPS via Nginx + Let's Encrypt
- [ ] Static uploads directory permissions

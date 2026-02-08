---
name: Deployment
description: Guide for deploying SE104_VLEAGUE to production including Docker, environment configuration, and scaling
---

# Deployment Skill

This skill covers production deployment, environment configuration, SSL setup, and scaling for the SE104_VLEAGUE project.

## Production Deployment Checklist

### Pre-Deployment

- [ ] All tests pass (`pnpm test`)
- [ ] No linting errors (`pnpm lint`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] SSL certificates obtained
- [ ] Secrets stored securely

### Deployment Steps

- [ ] Deploy database (or run migrations)
- [ ] Deploy API application
- [ ] Deploy Web application
- [ ] Configure DNS
- [ ] Test health endpoints
- [ ] Monitor logs for errors

## Environment Configuration

### Production Environment Variables

```env
# API Production (.env.production)
NODE_ENV=production
PORT=8080

# Database (use managed service like Supabase, Neon, or RDS)
DATABASE_URL="postgresql://user:password@host:5432/vleague?sslmode=require"

# JWT (use strong, random secrets)
JWT_SECRET="generate-with-openssl-rand-base64-64"
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_CALLBACK_URL=https://api.yourdomain.com/auth/google/callback

# URLs
FRONTEND_URL=https://yourdomain.com
API_URL=https://api.yourdomain.com

# Logging
LOG_LEVEL=info
```

### Web Production Variables

```env
# Web Production (.env.production)
VITE_API_BASE_URL=https://api.yourdomain.com
```

## Docker Production Build

### Multi-Stage Dockerfile (API)

```dockerfile
# apps/api/Dockerfile.prod
FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile --prod=false

FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm dlx prisma generate
RUN pnpm --filter api build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/prisma ./prisma

USER nestjs
EXPOSE 8080

# Run migrations then start
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
```

### Docker Compose Production

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile.prod
    container_name: vleague-api
    restart: unless-stopped
    env_file:
      - ./apps/api/.env.production
    ports:
      - '8080:8080'
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ['CMD', 'wget', '-q', '--spider', 'http://localhost:8080/health']
      interval: 30s
      timeout: 10s
      retries: 3

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile.prod
    container_name: vleague-web
    restart: unless-stopped
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./certs:/etc/nginx/certs:ro

  postgres:
    image: postgres:15-alpine
    container_name: vleague-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: vleague
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${DB_USER}']
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

## Database Migrations in Production

### Running Migrations

```bash
# Apply pending migrations (safe for production)
pnpm dlx prisma migrate deploy

# Check migration status
pnpm dlx prisma migrate status
```

> [!WARNING]
> Never use `prisma migrate dev` in production. Always use `prisma migrate deploy`.

### Rollback Strategy

```bash
# Prisma doesn't have built-in rollback
# For rollbacks, create a new migration that reverts changes

# Example: Roll back by creating down migration
pnpm dlx prisma migrate dev --name rollback_last_change --create-only
# Then edit the migration SQL to reverse changes
```

## SSL/HTTPS Setup

### Nginx Configuration with SSL

```nginx
# apps/web/nginx.conf
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    root /usr/share/nginx/html;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://api:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Let's Encrypt with Certbot

```bash
# Install certbot
apt install certbot

# Generate certificate
certbot certonly --standalone -d yourdomain.com -d api.yourdomain.com

# Certificates stored at:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem

# Auto-renewal (add to crontab)
0 0 * * * certbot renew --quiet
```

## Scaling Considerations

### Horizontal Scaling with Docker

```yaml
# docker-compose.prod.yml
services:
  api:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M

  nginx:
    image: nginx:alpine
    depends_on:
      - api
    # Load balances across API replicas
```

### Database Connection Pooling

```typescript
// For high traffic, use connection pooling
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Use external pooler like PgBouncer
  // directUrl = env("DIRECT_DATABASE_URL")
}
```

## Monitoring in Production

### Health Check Endpoint

Ensure `/health` endpoint is available:

```typescript
// Already covered in Performance skill
GET /health
{
  "status": "ok",
  "database": "healthy",
  "memory": "healthy",
  "timestamp": "2024-..."
}
```

### Log Aggregation

```bash
# View Docker logs
docker compose logs -f api

# Stream to logging service
docker run --log-driver=syslog --log-opt syslog-address=udp://logs.example.com:514
```

## Deployment Commands Summary

```bash
# Build production images
docker compose -f docker-compose.prod.yml build

# Deploy with zero downtime
docker compose -f docker-compose.prod.yml up -d --scale api=3

# Run migrations
docker compose exec api npx prisma migrate deploy

# View logs
docker compose logs -f --tail=100

# Restart services
docker compose restart api

# Scale up
docker compose up -d --scale api=5
```

## Security Checklist

- [ ] All secrets in environment variables (not in code)
- [ ] HTTPS enabled with valid certificate
- [ ] CORS configured for production domains only
- [ ] Rate limiting enabled
- [ ] Helmet.js for security headers
- [ ] SQL injection protection (Prisma handles this)
- [ ] XSS protection enabled
- [ ] Regular dependency updates

> [!CAUTION]
> Never commit `.env` files with production secrets to version control.

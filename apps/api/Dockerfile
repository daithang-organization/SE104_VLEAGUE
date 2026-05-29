FROM node:22-slim

WORKDIR /app

# pnpm
RUN corepack enable

# Cài pg_isready để có thể tự wait DB nếu cần mở rộng (không bắt buộc vì compose đã depends_on healthcheck)
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

# Copy workspace manifests trước để cache tốt hơn
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/

# Copy prisma schema trước để postinstall (prisma generate) hoạt động
COPY apps/api/prisma apps/api/prisma
COPY apps/api/prisma.config.ts apps/api/

# Install tất cả deps (workspace hoisting + shamefully-hoist cho Docker)
RUN pnpm install --frozen-lockfile --shamefully-hoist

# Copy source
COPY apps/api apps/api
COPY promo_candidates promo_candidates

EXPOSE 8080

WORKDIR /app/apps/api

# Copy entrypoint script
COPY apps/api/docker-entrypoint.sh /app/apps/api/
RUN chmod +x /app/apps/api/docker-entrypoint.sh

# Dev mode - chạy migration, seed, rồi start server
ENTRYPOINT ["/app/apps/api/docker-entrypoint.sh"]

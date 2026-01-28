FROM node:20-slim

WORKDIR /app

# pnpm
RUN corepack enable

# Cài pg_isready để có thể tự wait DB nếu cần mở rộng (không bắt buộc vì compose đã depends_on healthcheck)
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

# Copy workspace manifests trước để cache tốt hơn
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/

# Install tất cả deps (workspace hoisting + shamefully-hoist cho Docker)
RUN pnpm install --frozen-lockfile --shamefully-hoist

# Copy source
COPY apps/api apps/api

EXPOSE 8080

WORKDIR /app/apps/api

# Dev mode - chạy nest CLI từ root node_modules
CMD ["node", "../../node_modules/@nestjs/cli/bin/nest.js", "start", "--watch"]

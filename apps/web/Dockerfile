FROM node:22-slim

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/

# Copy prisma schema trước để postinstall (prisma generate) của api hoạt động
COPY apps/api/prisma apps/api/prisma
COPY apps/api/prisma.config.ts apps/api/

# Install tất cả deps (workspace hoisting + shamefully-hoist cho Docker)
RUN pnpm install --frozen-lockfile --shamefully-hoist

COPY apps/web apps/web

EXPOSE 5173

WORKDIR /app/apps/web

# Vite - chạy vite CLI từ root node_modules
CMD ["node", "../../node_modules/vite/bin/vite.js", "--host", "0.0.0.0", "--port", "5173"]

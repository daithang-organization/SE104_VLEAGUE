# Apps Directory

Thư mục này chứa tất cả các ứng dụng (applications) trong monorepo của dự án VLeague.

## Cấu trúc

```
apps/
├── api/          # Backend API server (NestJS)
└── web/          # Frontend web application (React + Vite)
```

## Mô tả

### `api/`
Backend API server được xây dựng bằng NestJS framework. Cung cấp RESTful API endpoints cho toàn bộ hệ thống quản lý giải đấu VLeague.

**Công nghệ chính:**
- NestJS
- Prisma ORM
- PostgreSQL
- TypeScript

**Chi tiết:** Xem [api/README.md](./api/README.md)

### `web/`
Frontend web application được xây dựng bằng React và Vite. Giao diện người dùng cho hệ thống quản lý VLeague.

**Công nghệ chính:**
- React 19
- TypeScript
- Vite
- Ant Design (antd)

**Chi tiết:** Xem [web/README.md](./web/README.md)

## Quản lý Dependencies

Dự án sử dụng pnpm workspace để quản lý dependencies chung giữa các ứng dụng. Các dependencies được định nghĩa trong:
- `package.json` ở root cho shared dependencies
- `package.json` trong mỗi app cho app-specific dependencies

## Chạy ứng dụng

Từ root directory:

```bash
# Chạy API server
pnpm --filter api dev

# Chạy Web app
pnpm --filter web dev

# Chạy tất cả
pnpm dev
```

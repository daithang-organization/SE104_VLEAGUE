# Prisma Directory

Thư mục này chứa tất cả các file liên quan đến Prisma ORM, bao gồm schema, migrations và seed data.

## Cấu trúc

```
prisma/
├── schema.prisma           # Database schema definition
├── seed.ts                 # Database seeding script
└── migrations/             # Database migration files
    ├── migration_lock.toml
    ├── 20260128113243_init_registration/
    └── 20260128145248_init_matches/
```

## Mô tả

### `schema.prisma`
File định nghĩa schema của database bao gồm:
- Models (tables)
- Relations (quan hệ giữa các bảng)
- Indexes
- Database provider configuration
- Prisma Client generator settings

**Vai trò:**
- Là single source of truth cho database structure
- Được sử dụng để generate Prisma Client
- Được sử dụng để tạo migrations

### `seed.ts`
Script để populate database với initial/test data.

**Vai trò:**
- Tạo dữ liệu mẫu cho development
- Tạo dữ liệu cơ bản cho testing
- Có thể được chạy với: `pnpm prisma db seed`

### `migrations/`
Thư mục chứa tất cả các database migration files được Prisma tự động generate.

**Migrations hiện tại:**
- `20260128113243_init_registration/` - Initial migration cho registration system (teams, players, etc.)
- `20260128145248_init_matches/` - Migration cho match management system

**Vai trò:**
- Version control cho database schema
- Đảm bảo database schema consistency across environments
- Cho phép rollback nếu cần

## Các lệnh thường dùng

```bash
# Generate Prisma Client sau khi update schema
pnpm prisma generate

# Tạo migration mới
pnpm prisma migrate dev --name <migration_name>

# Apply migrations
pnpm prisma migrate deploy

# Seed database
pnpm prisma db seed

# Open Prisma Studio (database GUI)
pnpm prisma studio

# Reset database (xóa tất cả data và re-run migrations)
pnpm prisma migrate reset
```

## Workflow

1. **Thay đổi schema:**
   - Chỉnh sửa `schema.prisma`
   - Chạy `pnpm prisma migrate dev --name descriptive_name`
   - Prisma sẽ tự động generate migration và apply

2. **Sync schema với database:**
   - Development: `pnpm prisma migrate dev`
   - Production: `pnpm prisma migrate deploy`

3. **Update Prisma Client:**
   - Sau mỗi schema change: `pnpm prisma generate`

## Lưu ý

- **Không** chỉnh sửa migration files đã được committed
- **Luôn** tạo migration mới cho schema changes
- **Kiểm tra** migration SQL trước khi apply lên production
- **Backup** database trước khi chạy migrations quan trọng

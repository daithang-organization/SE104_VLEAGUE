<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS"/>
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma"/>
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
</p>

<h1 align="center">🔌 VLeague API</h1>

<p align="center">
  <strong>Backend REST API cho hệ thống quản lý giải VLeague</strong>
</p>

---

## 📋 Tổng quan

**VLeague API** là backend service được xây dựng bằng NestJS framework, cung cấp REST API cho hệ thống quản lý giải bóng đá VLeague.

### ✨ Tính năng chính

- 🔐 **Authentication** — Xác thực JWT, OAuth (Google/Facebook), OTP email, session management
- 👥 **Registration** — Quản lý đội bóng và cầu thủ (CRUD + CSV import)
- 📆 **Season** — Quản lý mùa giải (UPCOMING → IN_PROGRESS → COMPLETED)
- 📋 **Season Teams** — Đăng ký và duyệt đội tham gia mùa giải
- 🏟️ **Stadium** — Quản lý sân vận động
- 📅 **Scheduling** — Lập lịch thi đấu tự động (round-robin 2 lượt)
- ⚽ **Match** — Quản lý trận đấu, sự kiện, tỉ số tự động
- 📊 **Standings** — Bảng xếp hạng, vua phá lưới, thống kê thẻ
- 📋 **Roster** — Quản lý danh sách cầu thủ theo đội
- ⚙️ **Regulation** — Quy định giải đấu tùy chỉnh theo mùa giải
- 👤 **Users** — Quản trị người dùng và phân quyền (5 roles)
- 📤 **Upload** — Upload ảnh (JPEG/PNG/WebP/GIF)
- 💚 **Health** — Kiểm tra trạng thái hệ thống

---

## 🏗 Cấu trúc thư mục

```
apps/api/
├── 📂 prisma/                     # Database Schema & Migrations
│   ├── 📄 schema.prisma           # Prisma schema (14 models, 8 enums)
│   ├── 📄 seed.ts                 # Database seeding script
│   └── 📂 migrations/             # Migration history (13 migrations)
│
├── 📂 src/
│   ├── 📄 main.ts                 # Entry point
│   ├── 📄 app.module.ts           # Root module (14 modules)
│   │
│   ├── 📂 auth/                   # 🔐 Authentication (19 endpoints)
│   ├── 📂 registration/           # 👥 Teams & Players (11 endpoints)
│   ├── 📂 scheduling/             # 📅 Scheduling (3 endpoints)
│   ├── 📂 match/                  # ⚽ Matches (5 endpoints)
│   ├── 📂 season/                 # 📆 Seasons + Season Teams (11 endpoints)
│   ├── 📂 stadium/                # 🏟️ Stadiums (5 endpoints)
│   ├── 📂 standings/              # 📊 Standings (5 endpoints)
│   ├── 📂 roster/                 # 📋 Roster (4 endpoints)
│   ├── 📂 regulation/             # ⚙️ Regulations (5 endpoints)
│   ├── 📂 users/                  # 👤 User Admin (4 endpoints)
│   ├── 📂 upload/                 # 📤 File Upload (1 endpoint)
│   ├── 📂 health/                 # 💚 Health Check (1 endpoint)
│   ├── 📂 prisma/                 # 🗄️ Prisma ORM Service
│   ├── 📂 mail/                   # 📧 Email Service (Handlebars templates)
│   ├── 📂 config/                 # ⚙️ Configuration
│   └── 📂 common/                 # 🔧 Shared (filters, interceptors, logger)
│
└── 📂 test/                       # E2E Tests
    ├── app.e2e-spec.ts
    ├── auth.e2e-spec.ts
    ├── matches.e2e-spec.ts
    ├── teams.e2e-spec.ts
    └── jest-e2e.json
```

---

## 🚀 Bắt đầu

### Yêu cầu

- Node.js >= 20
- pnpm >= 8
- PostgreSQL (hoặc Docker)

### Cài đặt

```bash
# Từ root của project
cd apps/api

# Cài đặt dependencies (nếu chưa chạy ở root)
pnpm install
```

### Cấu hình Environment

Tạo file `.env` từ template:

```bash
cp .env.example .env
```

Nội dung file `.env`:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vleague?schema=public"

# Server
PORT=8080
NODE_ENV=development
```

### 📧 Cấu hình Email (Mailtrap)

Hệ thống sử dụng email để gửi **OTP xác thực** và **reset mật khẩu**. Có 3 chế độ:

#### 1. Development Mode (Khuyến nghị cho dev)

Không cần cấu hình SMTP - OTP sẽ được log ra console:

```env
MAIL_SKIP_SEND=true
```

Khi user đăng ký hoặc quên mật khẩu, OTP sẽ hiện lên console như sau:

```
╔══════════════════════════════════════════╗
║  🔑 EMAIL VERIFICATION OTP               ║
║  Email: user@example.com                 ║
║  OTP:   123456                           ║
╚══════════════════════════════════════════╝
```

#### 2. Test với Mailtrap (Khuyến nghị để test email template)

[Mailtrap](https://mailtrap.io) là service để test email mà không gửi thật.

**Cách setup:**

1. Đăng ký tài khoản tại https://mailtrap.io
2. Vào **Email Testing** → **Inboxes** → Chọn inbox
3. Chọn **SMTP Settings** → Copy credentials

```env
MAIL_SKIP_SEND=false
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=your-mailtrap-user      # Từ Mailtrap
MAIL_PASS=your-mailtrap-pass      # Từ Mailtrap
MAIL_FROM=noreply@vleague.local
```

> 💡 **Tip**: Tất cả email sẽ được "bắt" vào inbox Mailtrap để xem preview, không gửi ra ngoài.

#### 3. Production (Gmail hoặc SMTP khác)

```env
MAIL_SKIP_SEND=false
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password       # App Password, không phải mật khẩu Gmail
MAIL_FROM=noreply@vleague.com
```

> ⚠️ **Lưu ý Gmail**: Phải tạo [App Password](https://support.google.com/accounts/answer/185833) và bật 2FA.

#### Email Templates

Các template email nằm trong `src/mail/templates/`:

| Template                 | Mô tả                          |
| ------------------------ | ------------------------------ |
| `email-verification.hbs` | OTP xác thực email khi đăng ký |
| `password-reset.hbs`     | OTP đặt lại mật khẩu           |
| `welcome.hbs`            | Email chào mừng sau xác thực   |

#### Flow xác thực Email

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant MailService
    participant Mailtrap/Gmail

    User->>Frontend: Đăng ký (email, password)
    Frontend->>API: POST /auth/register
    API->>API: Tạo user (emailVerified=false)
    API->>API: Generate OTP (6 số, 10 phút)
    API->>MailService: sendEmailVerificationOtp()

    alt MAIL_SKIP_SEND=true
        MailService->>MailService: Log OTP to console
    else MAIL_SKIP_SEND=false
        MailService->>Mailtrap/Gmail: Gửi email chứa OTP
    end

    API-->>Frontend: { message, email }
    Frontend->>User: Hiển thị form nhập OTP
    User->>Frontend: Nhập OTP
    Frontend->>API: POST /auth/verify-email
    API->>API: Verify OTP
    API-->>Frontend: { success }
```

### Khởi động Database

```bash
# Chạy PostgreSQL với Docker
docker compose -f ../../infra/docker-compose.db.yml up -d
```

### Chạy Migrations

```bash
# Tạo và chạy migrations
pnpm dlx prisma migrate dev

# Generate Prisma Client
pnpm dlx prisma generate
```

### Chạy Development Server

```bash
pnpm dev
```

API sẽ chạy tại: **http://localhost:8080**

---

## 📝 Các lệnh thường dùng

### Development

| Lệnh               | Mô tả                      |
| ------------------ | -------------------------- |
| `pnpm dev`         | Chạy server với hot-reload |
| `pnpm start`       | Chạy server                |
| `pnpm start:debug` | Chạy với debug mode        |
| `pnpm build`       | Build production           |
| `pnpm start:prod`  | Chạy production build      |

### Testing

| Lệnh              | Mô tả                     |
| ----------------- | ------------------------- |
| `pnpm test`       | Chạy unit tests           |
| `pnpm test:watch` | Chạy tests với watch mode |
| `pnpm test:cov`   | Chạy tests với coverage   |
| `pnpm test:e2e`   | Chạy E2E tests            |

### Database (Prisma)

| Lệnh                                        | Mô tả                    |
| ------------------------------------------- | ------------------------ |
| `pnpm dlx prisma migrate dev`               | Tạo & chạy migration     |
| `pnpm dlx prisma migrate dev --name <name>` | Tạo migration với tên    |
| `pnpm dlx prisma migrate deploy`            | Deploy migrations (prod) |
| `pnpm dlx prisma generate`                  | Generate Prisma Client   |
| `pnpm dlx prisma studio`                    | Mở Prisma Studio GUI     |
| `pnpm dlx prisma db push`                   | Push schema (dev only)   |
| `pnpm dlx prisma db seed`                   | Seed database            |
| `pnpm db:seed`                              | Seed database (shortcut) |

### Code Quality

| Lệnh          | Mô tả                    |
| ------------- | ------------------------ |
| `pnpm lint`   | Kiểm tra và fix ESLint   |
| `pnpm format` | Format code với Prettier |

---

## 🗄️ Database Schema

### Các Models chính

#### Team (Đội bóng)

| Field       | Type    | Description       |
| ----------- | ------- | ----------------- |
| `id`        | UUID    | Primary key       |
| `name`      | String  | Tên đội (unique)  |
| `shortName` | String? | Tên viết tắt      |
| `city`      | String? | Thành phố         |
| `logoUrl`   | String? | URL logo          |
| `status`    | Enum    | ACTIVE / INACTIVE |
| `stadiumId` | UUID?   | FK đến Stadium    |

#### Player (Cầu thủ)

| Field         | Type     | Description        |
| ------------- | -------- | ------------------ |
| `id`          | UUID     | Primary key        |
| `fullName`    | String   | Họ tên             |
| `dob`         | DateTime | Ngày sinh          |
| `nationality` | String   | Quốc tịch          |
| `position`    | Enum     | GK / DF / MF / FW  |
| `playerType`  | Enum     | DOMESTIC / FOREIGN |
| `birthPlace`  | String?  | Nơi sinh           |
| `heightCm`    | Int?     | Chiều cao (cm)     |
| `weightKg`    | Int?     | Cân nặng (kg)      |

#### Match (Trận đấu)

| Field        | Type      | Description                                       |
| ------------ | --------- | ------------------------------------------------- |
| `id`         | UUID      | Primary key                                       |
| `roundNo`    | Int       | Vòng đấu                                          |
| `leg`        | Int       | Lượt (1/2)                                        |
| `seasonId`   | UUID?     | FK đến Season                                     |
| `homeTeamId` | UUID      | Đội nhà                                           |
| `awayTeamId` | UUID      | Đội khách                                         |
| `stadiumId`  | UUID?     | Sân vận động                                      |
| `kickoffAt`  | DateTime? | Thời gian                                         |
| `homeScore`  | Int?      | Tỉ số đội nhà                                     |
| `awayScore`  | Int?      | Tỉ số đội khách                                   |
| `status`     | Enum      | DRAFT / PUBLISHED / LOCKED / FINISHED / POSTPONED |

#### Season (Mùa giải)

| Field       | Type      | Description                        |
| ----------- | --------- | ---------------------------------- |
| `id`        | UUID      | Primary key                        |
| `name`      | String    | Tên mùa giải (unique)              |
| `year`      | Int       | Năm                                |
| `status`    | Enum      | UPCOMING / IN_PROGRESS / COMPLETED |
| `startDate` | DateTime? | Ngày bắt đầu                       |
| `endDate`   | DateTime? | Ngày kết thúc                      |

#### Stadium (Sân vận động)

| Field      | Type    | Description      |
| ---------- | ------- | ---------------- |
| `id`       | UUID    | Primary key      |
| `name`     | String  | Tên sân (unique) |
| `address`  | String? | Địa chỉ          |
| `city`     | String  | Thành phố        |
| `capacity` | Int?    | Sức chứa         |

---

## 🔗 API Endpoints

### Health Check

```
GET /health → { status: 'ok' }
```

### Authentication (19 endpoints)

```
POST /auth/register              → Đăng ký
POST /auth/verify-email          → Xác thực email OTP
POST /auth/login                 → Đăng nhập
POST /auth/logout                → Đăng xuất
POST /auth/refresh               → Làm mới token
GET  /auth/me                    → Thông tin hiện tại
PATCH /auth/profile              → Cập nhật hồ sơ
GET  /auth/sessions              → Phiên đăng nhập
GET  /auth/google                → Google OAuth
GET  /auth/facebook              → Facebook OAuth
...và các endpoint khác
```

### Teams & Players (11 endpoints)

```
GET  /teams                      → Danh sách đội bóng
GET  /teams/:id                  → Chi tiết đội
POST /teams                      → Tạo đội (ADMIN)
PATCH /teams/:id                 → Sửa đội (ADMIN)
DELETE /teams/:id                → Xóa đội (ADMIN)
GET  /players                    → Danh sách cầu thủ
POST /players                    → Tạo cầu thủ (ADMIN/TM)
POST /players/import             → Import CSV (ADMIN)
```

### Seasons & Season Teams (11 endpoints)

```
GET  /seasons                    → Danh sách mùa giải
GET  /seasons/current            → Mùa giải hiện tại
POST /seasons                    → Tạo mùa giải (ADMIN)
PATCH /seasons/:id/status        → Đổi trạng thái
GET  /seasons/:sId/teams         → Đội trong mùa giải
POST /seasons/:sId/teams         → Đăng ký đội
PATCH /seasons/:sId/teams/:tId/status → Duyệt/từ chối
```

### Stadiums (5 endpoints)

```
GET  /stadiums                   → Danh sách sân
POST /stadiums                   → Tạo sân (ADMIN)
```

### Scheduling (3 endpoints)

```
GET  /schedule                   → Lịch thi đấu
POST /schedule/generate          → Tạo lịch round-robin
POST /schedule/publish           → Công bố lịch
```

### Matches (5 endpoints)

```
GET  /matches                    → Danh sách trận
GET  /matches/:id                → Chi tiết trận
POST /matches/:id/events         → Thêm sự kiện (ADMIN/REF)
PATCH /matches/:id/status        → Đổi trạng thái
```

### Standings (5 endpoints)

```
GET  /standings                  → Bảng xếp hạng
GET  /standings/top-scorers      → Vua phá lưới
GET  /standings/card-stats       → Thống kê thẻ
GET  /standings/team-stats       → Thống kê đội
```

### Roster (4 endpoints)

```
GET  /teams/:tId/roster          → Danh sách cầu thủ đội
POST /teams/:tId/roster          → Thêm vào đội
```

### Regulations (5 endpoints)

```
GET  /seasons/:sId/regulations   → Quy định mùa giải
PUT  /seasons/:sId/regulations   → Tạo/sửa quy định (ADMIN)
POST /seasons/:sId/regulations/seed-defaults → Seed mặc định
```

### Users (4 endpoints — ADMIN only)

```
GET  /users                      → Danh sách người dùng
POST /users                      → Tạo người dùng
PATCH /users/:id/role            → Đổi role
DELETE /users/:id                → Xóa người dùng
```

> 📖 Chi tiết đầy đủ (58 endpoints) xem tại: [docs/API_DOCS.md](../../docs/API_DOCS.md)

---

## 🧪 Testing

### Unit Tests

```bash
# Chạy tất cả unit tests
pnpm test

# Chạy với watch mode
pnpm test:watch

# Chạy với coverage report
pnpm test:cov
```

### E2E Tests

```bash
# Đảm bảo database đang chạy
pnpm test:e2e
```

---

## 🐛 Debugging

### VS Code Launch Config

Thêm vào `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Attach NestJS",
      "port": 9229,
      "restart": true
    }
  ]
}
```

Chạy với debug mode:

```bash
pnpm start:debug
```

---

## 📁 Hướng dẫn thêm Module mới

### 1. Tạo module với NestJS CLI

```bash
# Tạo module
npx nest g module <module-name>

# Tạo controller
npx nest g controller <module-name>

# Tạo service
npx nest g service <module-name>
```

### 2. Cấu trúc thư mục chuẩn

```
src/<module-name>/
├── <module-name>.controller.ts
├── <module-name>.service.ts
├── <module-name>.module.ts
└── dto/
    ├── create-<module-name>.dto.ts
    └── update-<module-name>.dto.ts
```

### 3. Import vào AppModule

```typescript
// app.module.ts
import { NewModule } from './new-module/new-module.module';

@Module({
  imports: [
    // ... existing modules
    NewModule,
  ],
})
export class AppModule {}
```

---

## 🔒 Best Practices

### 1. Validation

- Sử dụng `class-validator` cho DTOs
- Validate input ở controller level

### 2. Error Handling

- Sử dụng NestJS Exception Filters
- Trả về consistent error response

### 3. Database

- Không truy cập Prisma trực tiếp từ controller
- Luôn đi qua service layer
- Sử dụng transactions cho nhiều operations

### 4. Testing

- Unit test cho services
- E2E test cho endpoints quan trọng

---

## 📚 Tài liệu tham khảo

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

<p align="center">
  <em>VLeague API - Backend Service</em>
</p>

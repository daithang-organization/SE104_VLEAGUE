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
- 🔐 **Authentication** - Xác thực và phân quyền người dùng (JWT, OAuth)
- 📧 **Email Verification** - Xác thực email với OTP (Mailtrap/SMTP)
- 👥 **Registration** - Quản lý đăng ký đội bóng và cầu thủ
- 📅 **Scheduling** - Lập lịch thi đấu tự động
- ⚽ **Match** - Quản lý trận đấu và ghi nhận kết quả

---

## 🏗 Cấu trúc thư mục

```
apps/api/
├── 📂 prisma/                     # Database Schema & Migrations
│   ├── 📄 schema.prisma           # Prisma schema definition
│   ├── 📄 seed.ts                 # Database seeding script
│   └── 📂 migrations/             # Migration history
│
├── 📂 src/
│   ├── 📄 main.ts                 # Entry point
│   ├── 📄 app.module.ts           # Root module
│   │
│   ├── 📂 auth/                   # 🔐 Authentication Module
│   │   ├── auth.controller.ts     # Auth endpoints
│   │   ├── auth.service.ts        # Auth business logic
│   │   └── auth.module.ts         # Module definition
│   │
│   ├── 📂 match/                  # ⚽ Match Module
│   │   ├── match.controller.ts    # Match endpoints
│   │   ├── match.service.ts       # Match business logic
│   │   ├── match.module.ts        # Module definition
│   │   └── 📂 dto/                # Data Transfer Objects
│   │
│   ├── 📂 prisma/                 # 🗄️ Prisma Module
│   │   ├── prisma.service.ts      # Prisma client wrapper
│   │   └── prisma.module.ts       # Module definition
│   │
│   ├── 📂 registration/           # 👥 Registration Module
│   │   ├── teams.controller.ts    # Teams endpoints
│   │   ├── players.controller.ts  # Players endpoints
│   │   ├── registration.service.ts
│   │   └── registration.module.ts
│   │
│   ├── 📂 mail/                    # 📧 Mail Module
│   │   ├── mail.service.ts        # Email sending logic
│   │   ├── mail.module.ts         # Module definition
│   │   └── 📂 templates/          # Handlebars email templates
│   │       ├── email-verification.hbs
│   │       ├── password-reset.hbs
│   │       └── welcome.hbs
│   │
│   └── 📂 scheduling/             # 📅 Scheduling Module
│       ├── scheduling.controller.ts
│       ├── scheduling.service.ts
│       └── scheduling.module.ts
│
└── 📂 test/                       # E2E Tests
    ├── app.e2e-spec.ts
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

| Template | Mô tả |
|----------|-------|
| `email-verification.hbs` | OTP xác thực email khi đăng ký |
| `password-reset.hbs` | OTP đặt lại mật khẩu |
| `welcome.hbs` | Email chào mừng sau xác thực |

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

| Lệnh | Mô tả |
|------|-------|
| `pnpm dev` | Chạy server với hot-reload |
| `pnpm start` | Chạy server |
| `pnpm start:debug` | Chạy với debug mode |
| `pnpm build` | Build production |
| `pnpm start:prod` | Chạy production build |

### Testing

| Lệnh | Mô tả |
|------|-------|
| `pnpm test` | Chạy unit tests |
| `pnpm test:watch` | Chạy tests với watch mode |
| `pnpm test:cov` | Chạy tests với coverage |
| `pnpm test:e2e` | Chạy E2E tests |

### Database (Prisma)

| Lệnh | Mô tả |
|------|-------|
| `pnpm dlx prisma migrate dev` | Tạo & chạy migration |
| `pnpm dlx prisma migrate dev --name <name>` | Tạo migration với tên |
| `pnpm dlx prisma migrate deploy` | Deploy migrations (prod) |
| `pnpm dlx prisma generate` | Generate Prisma Client |
| `pnpm dlx prisma studio` | Mở Prisma Studio GUI |
| `pnpm dlx prisma db push` | Push schema (dev only) |
| `pnpm dlx prisma db seed` | Seed database |
| `pnpm db:seed` | Seed database (shortcut) |

### Code Quality

| Lệnh | Mô tả |
|------|-------|
| `pnpm lint` | Kiểm tra và fix ESLint |
| `pnpm format` | Format code với Prettier |

---

## 🗄️ Database Schema

### Các Models chính

#### Team (Đội bóng)
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `name` | String | Tên đội (unique) |
| `status` | Enum | ACTIVE / INACTIVE |
| `createdAt` | DateTime | Ngày tạo |
| `updatedAt` | DateTime | Ngày cập nhật |

#### Player (Cầu thủ)
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `fullName` | String | Họ tên |
| `dob` | DateTime | Ngày sinh |
| `nationality` | String | Quốc tịch |
| `position` | Enum | GK / DF / MF / FW |
| `createdAt` | DateTime | Ngày tạo |
| `updatedAt` | DateTime | Ngày cập nhật |

#### Match (Trận đấu)
| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `roundNo` | Int | Vòng đấu |
| `homeTeamId` | UUID | Đội nhà |
| `awayTeamId` | UUID | Đội khách |
| `stadiumId` | UUID? | Sân vận động |
| `kickoffAt` | DateTime? | Thời gian thi đấu |
| `status` | Enum | DRAFT / PUBLISHED / LOCKED |

---

## 🔗 API Endpoints

### Health Check
```
GET /health → { status: 'ok' }
```

### Authentication
```
POST /auth/login
POST /auth/logout
```

### Teams
```
GET  /teams          → Danh sách đội bóng
GET  /teams/:id      → Chi tiết đội bóng
POST /teams          → Tạo đội bóng mới
```

### Players
```
GET  /players        → Danh sách cầu thủ
GET  /players/:id    → Chi tiết cầu thủ
POST /players        → Tạo cầu thủ mới
```

### Scheduling
```
GET  /schedule       → Lấy lịch thi đấu
POST /schedule/generate → Tạo lịch thi đấu
POST /schedule/publish  → Xuất bản lịch
```

### Matches
```
GET  /matches/:id         → Chi tiết trận đấu
POST /matches/:id/events  → Thêm sự kiện trận đấu
```

> 📖 Chi tiết API xem tại: [docs/api-outline.md](../../docs/api-outline.md)

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

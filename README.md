<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS"/>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma"/>
  <img src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/>
</p>

<h1 align="center">⚽ VLeague Management System</h1>

<p align="center">
  <strong>Hệ thống quản lý giải bóng đá VLeague - Đồ án môn SE104</strong>
</p>

<p align="center">
  <a href="#-tổng-quan">Tổng quan</a> •
  <a href="#-tính-năng">Tính năng</a> •
  <a href="#-công-nghệ">Công nghệ</a> •
  <a href="#-test-coverage">Tests</a> •
  <a href="#-cài-đặt">Cài đặt</a> •
  <a href="#-cấu-trúc-dự-án">Cấu trúc</a> •
  <a href="#-đội-ngũ-phát-triển">Đội ngũ</a>
</p>

---

## 📋 Tổng quan

**VLeague Management System** là hệ thống quản lý giải bóng đá chuyên nghiệp, được xây dựng như đồ án môn học **SE104 - Nhập môn Công nghệ Phần mềm** tại **Trường Đại học Công nghệ Thông tin - ĐHQG TP.HCM (UIT)**.

Hệ thống cung cấp các công cụ để quản lý:

- 🏆 Thông tin đội bóng và cầu thủ
- 📅 Lịch thi đấu các vòng đấu
- 📊 Bảng xếp hạng và thống kê
- ⚽ Kết quả trận đấu và sự kiện (bàn thắng, thẻ phạt,...)
- 📈 Báo cáo và phân tích dữ liệu

---

## ✨ Tính năng

### 🔐 Xác thực & Phân quyền

- Đăng nhập/Đăng ký với email, Google OAuth, Facebook OAuth
- Xác thực email qua OTP, quên/đặt lại mật khẩu
- Phân quyền 5 vai trò: Admin, Team Manager, Referee, Supervisor, Public
- Quản lý phiên đăng nhập (nhiều thiết bị)
- JWT access/refresh token pattern

### 🏆 Quản lý Mùa giải & Quy định

- CRUD mùa giải với trạng thái (Upcoming → In Progress → Completed)
- Đăng ký đội bóng tham gia mùa giải (duyệt/từ chối/rút lui)
- Quy định giải đấu tùy chỉnh theo mùa (tuổi cầu thủ, số lượng ngoại binh, điểm thắng/thua/hòa,...)
- Seeding quy định mặc định

### 👥 Quản lý Đội bóng & Cầu thủ

- Đăng ký đội bóng tham gia giải
- Quản lý thông tin cầu thủ (tên, ngày sinh, quốc tịch, vị trí)
- Quản lý đội hình (roster) với số áo, giới hạn ngoại binh

### 🏟️ Quản lý Sân vận động

- CRUD thông tin sân vận động (tên, địa chỉ, sức chứa)

### 📅 Lập lịch thi đấu

- Tự động tạo lịch thi đấu theo vòng tròn (round-robin)
- Quản lý sân vận động và thời gian thi đấu
- Xuất bản lịch thi đấu

### ⚽ Ghi nhận kết quả

- Cập nhật tỷ số trận đấu
- Ghi nhận sự kiện (bàn thắng, phản lưới, thẻ vàng, thẻ đỏ, thay người)
- Trạng thái trận đấu (Draft → Published → Locked → Finished)

### 📊 Bảng xếp hạng & Báo cáo

- Bảng xếp hạng real-time với caching
- Thống kê vua phá lưới, thẻ phạt, đội bóng
- So sánh đối đầu giữa 2 đội (Head-to-Head)
- Thống kê cá nhân cầu thủ
- Báo cáo tổng hợp theo mùa giải
- Xuất dữ liệu CSV/PDF (bảng xếp hạng, vua phá lưới, thẻ phạt, thống kê đội)
- Tìm kiếm toàn cục (đội, cầu thủ, trận đấu, sân, mùa giải)

### 👤 Quản lý Người dùng (Admin)

- CRUD tài khoản người dùng
- Phân quyền và thay đổi vai trò

---

## 🛠 Công nghệ sử dụng

### Backend

| Công nghệ                         | Phiên bản | Mô tả                                   |
| --------------------------------- | --------- | --------------------------------------- |
| **NestJS**                        | 11.x      | Framework Node.js cho việc xây dựng API |
| **Prisma** (`@prisma/adapter-pg`) | 7.x       | ORM hiện đại với driver adapter         |
| **PostgreSQL**                    | 16        | Hệ quản trị CSDL quan hệ                |
| **TypeScript**                    | 5.9       | Ngôn ngữ lập trình typed                |
| **Passport** (JWT, Google, FB)    | 0.7.x     | Xác thực đa phương thức                 |
| **nestjs-pino**                   | 4.x       | Structured logging                      |
| **@nestjs/throttler**             | 6.x       | Rate limiting                           |
| **@nestjs/cache-manager**         | 3.x       | In-memory caching                       |

### Frontend

| Công nghệ        | Phiên bản | Mô tả                  |
| ---------------- | --------- | ---------------------- |
| **React**        | 19.x      | Thư viện UI hiện đại   |
| **Vite**         | 7.x       | Build tool nhanh chóng |
| **Ant Design**   | 6.x       | UI Component Library   |
| **React Router** | 7.x       | Routing cho SPA        |
| **i18next**      | 25.x      | Đa ngôn ngữ (Vi/En)    |
| **Recharts**     | 3.x       | Biểu đồ thống kê       |
| **Axios**        | 1.x       | HTTP Client            |
| **Sentry**       | 10.x      | Error tracking         |

### DevOps & Tools

| Công nghệ             | Mô tả                         |
| --------------------- | ----------------------------- |
| **Docker**            | Container hóa ứng dụng        |
| **Docker Compose**    | Orchestration cho development |
| **pnpm**              | Package manager hiệu quả      |
| **GitHub Actions**    | CI/CD pipeline                |
| **ESLint + Prettier** | Code quality tools            |

---

## 🏗 Kiến trúc hệ thống

![System Architecture](docs/architecture.png)

---

## 📐 Sơ đồ Use Case

[Tài liệu Use Case Diagram v2](docs/usecase_diagram.md)

README hiện tham chiếu bản use case mới nhất tại `docs/usecase_diagram.md`, bao gồm:

- Nguồn PlantUML để render lại sơ đồ
- Tóm tắt các thay đổi từ v1 sang v2
- Ma trận actor/use case theo từng vai trò

Các cập nhật chính của sơ đồ mới:

- Bổ sung actor cha `User` và quan hệ kế thừa cho 5 vai trò
- Chuyển `OAuth` thành quan hệ `<<extend>>` của `Đăng nhập`
- Tách các nhóm nghiệp vụ lớn thành các use case CRUD rõ ràng hơn
- Bổ sung các quyền public như xem lịch thi đấu, kết quả trận đấu, bảng xếp hạng và tìm kiếm
- Làm rõ vai trò `Supervisor`, `Referee`, `Team Manager` theo đúng nghiệp vụ hiện tại

---

## 🧪 Test Coverage

| Layer        | Framework                       | Suites | Chạy lệnh                      |
| ------------ | ------------------------------- | ------ | ------------------------------ |
| **Backend**  | Jest + ts-jest                  | 23     | `cd apps/api && pnpm test`     |
| **Frontend** | Vitest + @testing-library/react | 30     | `cd apps/web && pnpm test`     |
| **E2E**      | Jest + Supertest                | 13     | `cd apps/api && pnpm test:e2e` |

### Backend Tests (23 suites)

- **Service specs** (10): auth, match, scheduling, season, regulation, standings, roster, registration, stadium, users
- **Controller specs** (12): auth, teams, players, players-import(?), season, season-team, match, scheduling, regulation, users, upload, roster, standings
- **E2E specs** (13): app, auth, scheduling, roster, users, upload, teams, matches, seasons, stadiums, standings, regulations

### Frontend Tests (30 suites)

- **API service tests** (13): auth, team, player, stadium, season, seasonTeam, match, schedule, standings, regulation, search, user, upload
- **Page component tests** (15): Dashboard, Standings, Login, Teams, Players, Matches, Seasons, Schedule, Regulations, Profile, Stadiums, HeadToHead, Reports, Users, Sessions
- **Auth tests** (2): AuthContext, RequireAuth

---

## 📁 Cấu trúc dự án

```
SE104_VLEAGUE/
├── 📂 apps/
│   ├── 📂 api/                    # Backend NestJS
│   │   ├── 📂 prisma/             # Schema, migrations & seed
│   │   ├── 📂 src/
│   │   │   ├── 📂 auth/           # Xác thực (JWT, OAuth, OTP)
│   │   │   ├── 📂 registration/   # Đăng ký đội (teams) & cầu thủ (players)
│   │   │   ├── 📂 season/         # Quản lý mùa giải
│   │   │   ├── 📂 stadium/        # Quản lý sân vận động
│   │   │   ├── 📂 scheduling/     # Lập lịch thi đấu
│   │   │   ├── 📂 match/          # Quản lý trận đấu & sự kiện
│   │   │   ├── 📂 roster/         # Quản lý đội hình
│   │   │   ├── 📂 standings/      # Bảng xếp hạng & thống kê
│   │   │   ├── 📂 regulation/     # Quy định giải đấu
│   │   │   ├── 📂 users/          # Quản lý người dùng (ADMIN)
│   │   │   ├── 📂 health/         # Health check endpoint
│   │   │   ├── 📂 common/         # Filters, guards, interceptors, logger
│   │   │   ├── 📂 config/         # App configuration
│   │   │   ├── 📂 mail/           # Email service (OTP, verification)
│   │   │   ├── 📂 upload/         # Image upload (Multer)
│   │   │   ├── 📂 search/         # Global search
│   │   │   └── 📂 prisma/         # Prisma service (driver adapter)
│   │   └── 📂 test/               # E2E tests
│   │
│   └── 📂 web/                    # Frontend React
│       └── 📂 src/
│           ├── 📂 auth/           # Auth context, guards & types
│           ├── 📂 shell/          # AppShell layout & menu
│           ├── 📂 components/     # Shared components
│           ├── 📂 lib/            # API client (Axios) & utilities
│           ├── 📂 pages/          # 28 trang UI (inc. public + detail)
│           └── 📂 services/       # 14 API service files
│
├── 📂 docs/                       # Tài liệu dự án
├── 📂 infra/                      # Docker configs
├── 📂 scripts/                    # Utility scripts
├── 📂 .agent/                     # Agent skills & workflows
├── 📂 .github/                    # GitHub Actions CI/CD
│
├── 📄 docker-compose.yml          # Full stack compose
├── 📄 package.json                # Workspace config
├── 📄 pnpm-workspace.yaml         # pnpm monorepo config
└── 📄 README.md                   # File này
```

---

## 🚀 Cài đặt & Chạy

### Yêu cầu hệ thống

| Phần mềm | Phiên bản |
| -------- | --------- |
| Node.js  | >= 20.0.0 |
| pnpm     | >= 8.0.0  |
| Docker   | Latest    |
| Git      | Latest    |

### Cách 1: Chạy với Docker (Khuyến nghị)

```bash
# 1. Clone repository
git clone https://github.com/daithang-organization/SE104_VLEAGUE.git
cd SE104_VLEAGUE

# 2. Chạy toàn bộ stack
docker compose up --build

# 3. (Tùy chọn) Seed dữ liệu mẫu
docker exec -it vleague_api npx prisma db seed
```

🎉 **Xong!** Truy cập:

- 🌐 Web: http://localhost:5173
- 🔌 API: http://localhost:8080
- 🗄️ Database: localhost:5432

---

## 🔑 Demo Accounts

Password chung cho tất cả demo users: `Demo@12345`

| Role             | Email                  | Mô tả                  |
| ---------------- | ---------------------- | ---------------------- |
| **ADMIN**        | admin@demo.local       | Quản trị viên hệ thống |
| **TEAM_MANAGER** | teammanager@demo.local | Quản lý đội bóng       |
| **REFEREE**      | referee@demo.local     | Trọng tài              |
| **SUPERVISOR**   | supervisor@demo.local  | Giám sát viên          |
| **PUBLIC**       | public@demo.local      | Người dùng công khai   |

### Chạy Seed

```bash
cd apps/api
pnpm dlx prisma migrate dev   # Áp dụng migrations
pnpm run db:seed              # Seed demo data (idempotent)
```

> 💡 **Note:** Seed script là idempotent - có thể chạy nhiều lần mà không tạo duplicate data.
> Seed bao gồm: 5 demo accounts, 2 đội, 10 cầu thủ, 1 mùa giải, quy định mặc định.

---

### Cách 2: Chạy Local (Development)

```bash
# 1. Clone repository
git clone https://github.com/daithang-organization/SE104_VLEAGUE.git
cd SE104_VLEAGUE

# 2. Cài đặt dependencies
corepack enable
pnpm install

# 3. Khởi động PostgreSQL
docker compose -f infra/docker-compose.db.yml up -d

# 4. Cấu hình environment
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 5. Chạy migration database
cd apps/api
pnpm dlx prisma migrate dev

# 6. (Tùy chọn) Seed dữ liệu mẫu
pnpm db:seed
cd ../..

# 7. Chạy development server
pnpm dev
```

---

## 📝 Các lệnh thường dùng

| Lệnh          | Mô tả                                   |
| ------------- | --------------------------------------- |
| `pnpm dev`    | Chạy cả API và Web ở chế độ development |
| `pnpm build`  | Build production cho tất cả apps        |
| `pnpm lint`   | Kiểm tra code style                     |
| `pnpm format` | Format code với Prettier                |
| `pnpm test`   | Chạy tất cả tests (API + Web)           |

### API Commands (trong `apps/api/`)

| Lệnh            | Mô tả                   |
| --------------- | ----------------------- |
| `pnpm dev`      | Chạy API với hot-reload |
| `pnpm build`    | Build production        |
| `pnpm test`     | Chạy unit tests (Jest)  |
| `pnpm test:e2e` | Chạy E2E tests          |
| `pnpm test:cov` | Chạy tests + coverage   |
| `pnpm db:seed`  | Seed dữ liệu mẫu        |

### Web Commands (trong `apps/web/`)

| Lệnh               | Mô tả                   |
| ------------------ | ----------------------- |
| `pnpm dev`         | Chạy Web với hot-reload |
| `pnpm build`       | Build production        |
| `pnpm test`        | Chạy tests (Vitest)     |
| `pnpm exec vitest` | Watch mode              |

### Prisma Commands

| Lệnh                          | Mô tả                  |
| ----------------------------- | ---------------------- |
| `pnpm dlx prisma migrate dev` | Tạo & chạy migration   |
| `pnpm dlx prisma studio`      | Mở Prisma Studio GUI   |
| `pnpm dlx prisma generate`    | Generate Prisma Client |
| `pnpm dlx prisma db push`     | Push schema (dev)      |

---

## 🔧 Cấu hình Environment

### Backend (`apps/api/.env`)

```env
DATABASE_URL="postgresql://vleague:vleague@localhost:5432/vleague"
PORT=8080
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=dev-jwt-secret
JWT_REFRESH_SECRET=dev-refresh-secret
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
MAIL_SKIP_SEND=true
FRONTEND_URL=http://localhost:5173
```

### Frontend (`apps/web/.env`)

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## 🌿 Git Workflow

### Branch Naming Convention

```
<type>/<short-description>
```

**Ví dụ:**

- `feat/standings-api` - Tính năng mới
- `fix/auth-token-expiry` - Sửa lỗi
- `chore/update-deps` - Cập nhật dependencies
- `docs/api-documentation` - Tài liệu

### Commit Message Convention

Sử dụng [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <description>

[optional body]
```

**Types:** `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`

### Pull Request Flow

1. Tạo branch từ `main`
2. Develop và commit changes
3. Push và tạo Pull Request
4. Code review bởi ít nhất 1 thành viên
5. CI checks pass
6. Merge vào `main`

> 📖 Xem chi tiết tại [docs/GIT_WORKFLOW.md](docs/GIT_WORKFLOW.md)

---

## 📚 Tài liệu bổ sung

| Tài liệu                                     | Mô tả                       |
| -------------------------------------------- | --------------------------- |
| [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | Hướng dẫn đóng góp code     |
| [docs/GIT_WORKFLOW.md](docs/GIT_WORKFLOW.md) | Quy trình làm việc với Git  |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Kiến trúc hệ thống chi tiết |
| [docs/LOCAL_DEV.md](docs/LOCAL_DEV.md)       | Hướng dẫn phát triển local  |
| [docs/api-outline.md](docs/api-outline.md)   | API endpoints outline       |
| [apps/api/README.md](apps/api/README.md)     | Hướng dẫn Backend           |
| [apps/web/README.md](apps/web/README.md)     | Hướng dẫn Frontend          |

---

## 👥 Đội ngũ phát triển

<table>
  <tr>
    <th>MSSV</th>
    <th>Họ và Tên</th>
    <th>Vai trò</th>
  </tr>
  <tr>
    <td>23521422</td>
    <td><strong>Huỳnh Lê Đại Thắng</strong></td>
    <td>👑 Team Leader</td>
  </tr>
  <tr>
    <td>23520468</td>
    <td><strong>Bùi Nguyễn Công Hiếu</strong></td>
    <td>💻 Developer</td>
  </tr>
  <tr>
    <td>23520541</td>
    <td><strong>Trần Nguyễn Việt Hoàng</strong></td>
    <td>💻 Developer</td>
  </tr>
  <tr>
    <td>23521572</td>
    <td><strong>Lê Quang Tiến</strong></td>
    <td>💻 Developer</td>
  </tr>
</table>

---

## 📄 License

Dự án này được phân phối dưới giấy phép **MIT License**. Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

---

<p align="center">
  <strong>⚽ VLeague Management System ⚽</strong><br/>
  <em>Đồ án môn SE104 - Nhập môn Công nghệ Phần mềm</em><br/>
  <em>Trường Đại học Công nghệ Thông tin - ĐHQG TP.HCM</em>
</p>

<p align="center">
  Made with ❤️ by Team SE104
</p>

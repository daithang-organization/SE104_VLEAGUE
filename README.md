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
- Báo cáo tổng hợp theo mùa giải
- Xuất dữ liệu CSV (bảng xếp hạng, vua phá lưới, thẻ phạt)

### 👤 Quản lý Người dùng (Admin)

- CRUD tài khoản người dùng
- Phân quyền và thay đổi vai trò

---

## 🛠 Công nghệ sử dụng

### Backend

| Công nghệ      | Mô tả                                   |
| -------------- | --------------------------------------- |
| **NestJS**     | Framework Node.js cho việc xây dựng API |
| **Prisma**     | ORM hiện đại cho TypeScript             |
| **PostgreSQL** | Hệ quản trị CSDL quan hệ                |
| **TypeScript** | Ngôn ngữ lập trình typed                |

### Frontend

| Công nghệ        | Mô tả                  |
| ---------------- | ---------------------- |
| **React 19**     | Thư viện UI hiện đại   |
| **Vite**         | Build tool nhanh chóng |
| **Ant Design**   | UI Component Library   |
| **React Router** | Routing cho SPA        |

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

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                         │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              Frontend (React 19 + Vite + Ant Design)            │
│                        :5173                                    │
│  21 pages · 12 API services · Auth context + protected routes   │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTP/REST (Axios)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Backend (NestJS) :8080                         │
│                                                                  │
│  ┌──────────┐ ┌──────────────┐ ┌────────────┐ ┌──────────┐      │
│  │   Auth   │ │ Registration │ │ Scheduling │ │  Match   │      │
│  └──────────┘ └──────────────┘ └────────────┘ └──────────┘      │
│  ┌──────────┐ ┌──────────────┐ ┌────────────┐ ┌──────────┐      │
│  │  Season  │ │   Stadium    │ │   Roster   │ │Standings │      │
│  └──────────┘ └──────────────┘ └────────────┘ └──────────┘      │
│  ┌──────────┐ ┌──────────────┐ ┌────────────┐                   │
│  │Regulation│ │    Users     │ │   Health   │                   │
│  └──────────┘ └──────────────┘ └────────────┘                   │
│                                                                  │
│  Swagger docs: /api/docs · Rate limiting · Caching              │
└─────────────────────────────┬───────────────────────────────────┘
                              │ Prisma ORM
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              Database (PostgreSQL) :5432                         │
│         14 tables · 9 enums · UUID primary keys                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧪 Test Coverage

| Layer        | Framework                       | Suites | Tests | Chạy lệnh                  |
| ------------ | ------------------------------- | ------ | ----- | -------------------------- |
| **Backend**  | Jest + ts-jest                  | 23     | 233+  | `cd apps/api && pnpm test` |
| **Frontend** | Vitest + @testing-library/react | 24     | 143+  | `cd apps/web && pnpm test` |

### Backend Tests

- **Service specs** (10 files): auth, match, scheduling, season, regulation, standings, roster, registration, stadium, users
- **Controller specs** (11 files): auth, teams, players, season, season-team, match, scheduling, regulation, users, upload, roster
- **E2E specs** (8+ files): scheduling, roster, users, upload, teams, matches, seasons, stadiums, standings, regulations

### Frontend Tests

- **API service tests** (12 files, 83 tests): tất cả các service trong `src/services/`
- **Page component tests** (10 files, 60 tests): Dashboard, Standings, Login, Teams, Players, Matches, Seasons, Schedule, Regulations, Profile

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
│   │   │   ├── 📂 common/         # Filters, guards, interceptors
│   │   │   ├── 📂 config/         # App configuration
│   │   │   ├── 📂 mail/           # Email service (OTP, verification)
│   │   │   └── 📂 prisma/         # Prisma service & middleware
│   │   └── 📂 test/               # E2E tests
│   │
│   └── 📂 web/                    # Frontend React
│       └── 📂 src/
│           ├── 📂 auth/           # Auth context, guards & types
│           ├── 📂 shell/          # AppShell layout & menu
│           ├── 📂 components/     # Shared components
│           ├── 📂 lib/            # API client (Axios) & utilities
│           ├── 📂 pages/          # 21 trang UI
│           └── 📂 services/       # 12 API service files
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

## 🔑 Demo Accounts (Sprint 1)

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
pnpm prisma migrate dev   # Áp dụng migrations
pnpm prisma db seed       # Seed demo data (idempotent - chạy bao nhiêu lần cũng OK)
```

> 💡 **Note:** Seed script là idempotent - có thể chạy nhiều lần mà không tạo duplicate data.

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
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vleague?schema=public"
PORT=8080
NODE_ENV=development
```

### Frontend (`apps/web/.env`)

```env
VITE_API_BASE_URL=http://localhost:8080
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

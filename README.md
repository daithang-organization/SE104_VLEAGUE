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
- Đăng nhập/Đăng xuất
- Phân quyền người dùng (Admin, Manager, Viewer)

### 👥 Quản lý Đội bóng & Cầu thủ
- Đăng ký đội bóng tham gia giải
- Quản lý thông tin cầu thủ (tên, ngày sinh, quốc tịch, vị trí)
- Theo dõi trạng thái đội bóng

### 📅 Lập lịch thi đấu
- Tự động tạo lịch thi đấu theo vòng tròn
- Quản lý sân vận động và thời gian thi đấu
- Xuất bản lịch thi đấu

### ⚽ Ghi nhận kết quả
- Cập nhật tỷ số trận đấu
- Ghi nhận sự kiện (bàn thắng, thẻ vàng, thẻ đỏ)
- Trạng thái trận đấu (Nháp, Đã xuất bản, Khóa)

### 📊 Bảng xếp hạng & Báo cáo
- Bảng xếp hạng real-time
- Thống kê vua phá lưới
- Báo cáo tổng hợp theo mùa giải

---

## 🛠 Công nghệ sử dụng

### Backend
| Công nghệ | Mô tả |
|-----------|-------|
| **NestJS** | Framework Node.js cho việc xây dựng API |
| **Prisma** | ORM hiện đại cho TypeScript |
| **PostgreSQL** | Hệ quản trị CSDL quan hệ |
| **TypeScript** | Ngôn ngữ lập trình typed |

### Frontend
| Công nghệ | Mô tả |
|-----------|-------|
| **React 19** | Thư viện UI hiện đại |
| **Vite** | Build tool nhanh chóng |
| **Ant Design** | UI Component Library |
| **React Router** | Routing cho SPA |

### DevOps & Tools
| Công nghệ | Mô tả |
|-----------|-------|
| **Docker** | Container hóa ứng dụng |
| **Docker Compose** | Orchestration cho development |
| **pnpm** | Package manager hiệu quả |
| **GitHub Actions** | CI/CD pipeline |
| **ESLint + Prettier** | Code quality tools |

---

## 🏗 Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                          │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                      │
│                        :5173                                     │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTP/REST
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend (NestJS)                            │
│                        :8080                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐ │
│  │    Auth     │ │Registration │ │ Scheduling  │ │   Match    │ │
│  │   Module    │ │   Module    │ │   Module    │ │   Module   │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └────────────┘ │
└─────────────────────────────┬───────────────────────────────────┘
                              │ Prisma ORM
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Database (PostgreSQL)                          │
│                        :5432                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Cấu trúc dự án

```
SE104_VLEAGUE/
├── 📂 apps/
│   ├── 📂 api/                    # Backend NestJS
│   │   ├── 📂 prisma/             # Schema & migrations
│   │   ├── 📂 src/
│   │   │   ├── 📂 auth/           # Xác thực người dùng
│   │   │   ├── 📂 match/          # Quản lý trận đấu
│   │   │   ├── 📂 prisma/         # Prisma service
│   │   │   ├── 📂 registration/   # Đăng ký đội/cầu thủ
│   │   │   └── 📂 scheduling/     # Lập lịch thi đấu
│   │   └── 📂 test/               # E2E tests
│   │
│   └── 📂 web/                    # Frontend React
│       └── 📂 src/
│           ├── 📂 auth/           # Auth context & types
│           ├── 📂 pages/          # Các trang UI
│           └── 📂 services/       # API services
│
├── 📂 docs/                       # Tài liệu dự án
├── 📂 infra/                      # Docker configs
├── 📂 scripts/                    # Utility scripts
├── 📂 .github/                    # GitHub workflows & templates
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
|----------|-----------|
| Node.js | >= 20.0.0 |
| pnpm | >= 8.0.0 |
| Docker | Latest |
| Git | Latest |

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

> 📌 **Tài khoản mặc định sau khi seed:**
> - Email: `admin@vleague.local`
> - Password: `Admin@12345`

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

| Lệnh | Mô tả |
|------|-------|
| `pnpm dev` | Chạy cả API và Web ở chế độ development |
| `pnpm build` | Build production cho tất cả apps |
| `pnpm lint` | Kiểm tra code style |
| `pnpm format` | Format code với Prettier |
| `pnpm test` | Chạy unit tests |

### API Commands (trong `apps/api/`)

| Lệnh | Mô tả |
|------|-------|
| `pnpm dev` | Chạy API với hot-reload |
| `pnpm build` | Build production |
| `pnpm test` | Chạy unit tests |
| `pnpm test:e2e` | Chạy E2E tests |
| `pnpm db:seed` | Seed dữ liệu mẫu |

### Prisma Commands

| Lệnh | Mô tả |
|------|-------|
| `pnpm dlx prisma migrate dev` | Tạo & chạy migration |
| `pnpm dlx prisma studio` | Mở Prisma Studio GUI |
| `pnpm dlx prisma generate` | Generate Prisma Client |
| `pnpm dlx prisma db push` | Push schema (dev) |

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

| Tài liệu | Mô tả |
|----------|-------|
| [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | Hướng dẫn đóng góp code |
| [docs/GIT_WORKFLOW.md](docs/GIT_WORKFLOW.md) | Quy trình làm việc với Git |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Kiến trúc hệ thống chi tiết |
| [docs/LOCAL_DEV.md](docs/LOCAL_DEV.md) | Hướng dẫn phát triển local |
| [docs/api-outline.md](docs/api-outline.md) | API endpoints outline |
| [apps/api/README.md](apps/api/README.md) | Hướng dẫn Backend |
| [apps/web/README.md](apps/web/README.md) | Hướng dẫn Frontend |

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

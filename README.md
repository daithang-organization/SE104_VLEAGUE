<p align="center">
  <img src="https://img.shields.io/badge/NestJS-11-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS 11"/>
  <img src="https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19"/>
  <img src="https://img.shields.io/badge/PostgreSQL-16-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL 16"/>
  <img src="https://img.shields.io/badge/Prisma-7-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma 7"/>
  <img src="https://img.shields.io/badge/Docker-Compose-2CA5E0?style=for-the-badge&logo=docker&logoColor=white" alt="Docker Compose"/>
</p>

<h1 align="center">VLeague Management System</h1>

<p align="center">
  Hệ thống quản lý giải bóng đá V.League<br/>
  Đồ án môn SE104 - Nhập môn Công nghệ Phần mềm
</p>

## Tổng quan

VLeague Management System là nền tảng quản lý tập trung cho toàn bộ vòng đời giải bóng đá: chuẩn bị mùa giải, mời và xét duyệt đội tham dự, quản lý câu lạc bộ và cầu thủ, lập lịch, đăng ký đội hình, điều hành trận đấu, ghi nhận biên bản, xử lý kỷ luật và tổng hợp báo cáo.

Hệ thống hiện hỗ trợ 5 vai trò:

| Vai trò        | Nghiệp vụ chính                                                                                                       |
| -------------- | --------------------------------------------------------------------------------------------------------------------- |
| `ADMIN`        | Quản trị dữ liệu, mùa giải, lịch thi đấu, lời mời, yêu cầu của quản lý đội, trọng tài, kết quả và bốc thăm phân hạng  |
| `TEAM_MANAGER` | Quản lý câu lạc bộ được giao, gửi yêu cầu thay đổi, nộp hồ sơ mùa giải, phản hồi lời mời và đăng ký đội hình trận đấu |
| `REFEREE`      | Theo dõi trận được phân công, xét duyệt đội hình, ghi nhận sự kiện và nộp biên bản trận đấu                           |
| `SUPERVISOR`   | Theo dõi trận được phân công và nộp báo cáo giám sát/kỷ luật                                                          |
| `PUBLIC`       | Xem đội bóng, cầu thủ, lịch, kết quả, bảng xếp hạng và báo cáo thống kê                                               |

## Tính năng hiện tại

### Xác thực, tài khoản và nền tảng

- Đăng ký, đăng nhập bằng email; xác thực email và đặt lại mật khẩu bằng OTP.
- Đăng nhập Google OAuth và Facebook OAuth.
- JWT access/refresh token, quản lý nhiều phiên đăng nhập và thu hồi phiên.
- Phân quyền theo 5 vai trò; quản trị viên có thể tạo tài khoản và đổi vai trò.
- Cập nhật hồ sơ, đổi mật khẩu, thiết lập mật khẩu cho tài khoản OAuth.
- Thông báo trong ứng dụng, đánh dấu đã đọc và điều hướng đến đối tượng liên quan.
- Audit log cho các thao tác thay đổi quan trọng; structured logging và health check.
- Tìm kiếm toàn cục theo đội, cầu thủ, sân vận động, mùa giải và trận đấu.

### Mùa giải, lời mời và đăng ký tham dự

- CRUD mùa giải và chuyển trạng thái `UPCOMING -> IN_PROGRESS -> COMPLETED`.
- Cấu hình quy định theo mùa: độ tuổi, số lượng cầu thủ, ngoại binh, sân vận động, điểm số và thứ tự phân hạng.
- Quản lý đội tham dự với trạng thái đăng ký, duyệt, từ chối và rút lui.
- Lập danh sách đội đủ điều kiện từ top mùa trước, đội thăng hạng và đội thay thế.
- Gửi lời mời riêng lẻ hoặc duyệt hàng loạt danh sách ứng viên.
- Quản lý ứng viên thăng hạng và nhập danh sách ứng viên từ dữ liệu chuẩn bị sẵn.
- Quản lý phản hồi lời mời và hồ sơ đăng ký mùa giải của quản lý đội.

### Quản lý đội bóng, cầu thủ và sân vận động

- CRUD đội bóng, cầu thủ và sân vận động; upload logo/hình ảnh.
- Import cầu thủ từ CSV.
- Quản lý roster theo đội với số áo và thời gian tham gia.
- Áp dụng các giới hạn theo quy định mùa giải, bao gồm tuổi và số lượng ngoại binh.
- Gán quản lý đội theo từng mùa giải.

### Quy trình yêu cầu của Team Manager

- Gửi yêu cầu tạo đội mới hoặc nhận quản lý một đội hiện có.
- Gửi yêu cầu cập nhật hoặc xóa đội đang quản lý.
- Gửi yêu cầu thêm, cập nhật hoặc loại cầu thủ khỏi đội.
- Gửi yêu cầu tạo, cập nhật hoặc gỡ sân nhà.
- Theo dõi lịch sử và trạng thái `PENDING`, `APPROVED`, `REJECTED`.
- Admin xét duyệt yêu cầu; dữ liệu nghiệp vụ được cập nhật khi yêu cầu được chấp thuận.

### Lịch thi đấu và vận hành trận đấu

- Tạo lịch round-robin theo mùa, công bố lịch và quản lý vòng đấu.
- Quản lý trạng thái trận: `DRAFT`, `PUBLISHED`, `LOCKED`, `FINISHED`, `POSTPONED`.
- Team Manager đăng ký đội hình gồm 11 cầu thủ chính thức, 5 dự bị, sơ đồ chiến thuật và bộ trang phục.
- Kiểm tra cầu thủ bị treo giò và giới hạn ngoại binh trong đội hình.
- Admin/Referee xét duyệt hoặc từ chối đội hình.
- Phân công trọng tài chính, trợ lý, trọng tài bàn và giám sát viên.
- Referee xem các trận được phân công và nộp biên bản sau trận.
- Supervisor nộp báo cáo giám sát, ghi nhận vấn đề và chuyển hồ sơ kỷ luật.
- Ghi nhận bàn thắng, phản lưới, penalty, thẻ phạt và thay người.
- Tự động tính tỷ số từ sự kiện; phân biệt nguồn kết quả từ Admin hoặc Referee.
- Tự động tạo và theo dõi án treo giò.
- Cập nhật trực tiếp diễn biến, tỷ số và trạng thái trận qua Socket.IO.

### Bảng xếp hạng và báo cáo

- Bảng xếp hạng theo mùa với điểm, hiệu số, thành tích thắng/hòa/thua.
- Xử lý tiêu chí phụ, đối đầu trực tiếp và bốc thăm khi vẫn đồng hạng.
- Admin thực hiện, xác nhận hoặc hủy kết quả bốc thăm phân hạng.
- Báo cáo vua phá lưới, kiến tạo, cầu thủ xuất sắc trận, thẻ phạt và treo giò.
- Thống kê đội, giải thưởng mùa giải, biểu đồ và đối đầu giữa hai đội.
- Thống kê chi tiết từng cầu thủ.
- Xuất CSV từ API và xuất PDF từ giao diện báo cáo.
- Các trang công khai không yêu cầu đăng nhập: bảng xếp hạng, lịch thi đấu và kết quả.

### Trải nghiệm giao diện

- Giao diện React + Ant Design, responsive.
- Dark mode có lưu lựa chọn trên trình duyệt.
- Đa ngôn ngữ Tiếng Việt/Tiếng Anh.
- Lazy loading trang, error boundary và Sentry tùy chọn.
- Thanh tìm kiếm toàn cục và chuông thông báo.

## Công nghệ

| Thành phần        | Công nghệ                                                        |
| ----------------- | ---------------------------------------------------------------- |
| Backend           | NestJS 11, TypeScript, Prisma 7, PostgreSQL driver adapter       |
| Database          | PostgreSQL 16, Prisma migrations                                 |
| Authentication    | Passport, JWT, Google OAuth, Facebook OAuth, bcrypt              |
| Frontend          | React 19, Vite 7, Ant Design 6, React Router 7                   |
| Báo cáo           | Recharts, jsPDF, jsPDF AutoTable                                 |
| Real-time         | Socket.IO                                                        |
| Quan sát hệ thống | Pino logging, Audit Log, Health Check, Sentry tùy chọn           |
| Kiểm thử          | Jest, Supertest, Vitest, Testing Library                         |
| Công cụ           | pnpm workspace, Docker Compose, GitHub Actions, ESLint, Prettier |

## Kiến trúc và dữ liệu

![System Architecture](docs/architecture.png)

- Prisma schema: [`apps/api/prisma/schema.prisma`](apps/api/prisma/schema.prisma)
- Database dump dùng để bàn giao: [`database/vleague_database.sql`](database/vleague_database.sql)
- ERD tổng quan: [`docs/erd/report-overview.dbml`](docs/erd/report-overview.dbml)
- ERD đầy đủ: [`docs/schema.dbml`](docs/schema.dbml)
- ERD vận hành trận đấu: [`docs/erd/match-operations.dbml`](docs/erd/match-operations.dbml)
- ERD mùa giải/đăng ký: [`docs/erd/season-registration.dbml`](docs/erd/season-registration.dbml)
- ERD yêu cầu quản lý đội: [`docs/erd/manager-requests.dbml`](docs/erd/manager-requests.dbml)
- Use Case Diagram: [`docs/usecase_diagram.md`](docs/usecase_diagram.md)

Database hiện có 30 model nghiệp vụ/hệ thống và 39 Prisma migrations. File dump bao gồm 31 bảng khi tính cả bảng `_prisma_migrations`.

## Chạy nhanh bằng Docker

### Yêu cầu

- Docker Desktop
- Git

### Khởi chạy toàn bộ hệ thống

```bash
git clone https://github.com/daithang-organization/SE104_VLEAGUE.git
cd SE104_VLEAGUE
docker compose up --build
```

API container sẽ tự chờ PostgreSQL, chạy migrations và tạo các tài khoản demo.

| Dịch vụ    | Địa chỉ                        |
| ---------- | ------------------------------ |
| Web        | http://localhost:5175          |
| API        | http://localhost:8080/api      |
| Swagger    | http://localhost:8080/api/docs |
| PostgreSQL | localhost:5432                 |

### Khởi chạy với database bàn giao

Thực hiện trên database mới hoặc volume không chứa dữ liệu cần giữ:

```bash
docker compose up -d db
docker cp database/vleague_database.sql vleague_db:/tmp/vleague_database.sql
docker exec -i vleague_db psql -U postgres -d vleague -f /tmp/vleague_database.sql
docker compose up --build api web
```

File dump chứa cấu trúc, migrations và dữ liệu nghiệp vụ mẫu/thực tế. Dữ liệu `refresh_tokens` và `otp_codes` được chủ động loại khỏi file bàn giao.

## Chạy local để phát triển

### Yêu cầu

| Phần mềm       | Phiên bản     |
| -------------- | ------------- |
| Node.js        | `>= 20`       |
| pnpm           | `>= 8`        |
| Docker Desktop | Phiên bản mới |
| Git            | Phiên bản mới |

### Cài đặt tự động

```bash
git clone https://github.com/daithang-organization/SE104_VLEAGUE.git
cd SE104_VLEAGUE
corepack enable
pnpm setup
pnpm dev
```

### Cài đặt thủ công

```bash
corepack enable
pnpm install

# Khởi động riêng PostgreSQL
docker compose -f infra/docker-compose.db.yml up -d

# Tạo environment files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Áp dụng schema và tạo dữ liệu demo
cd apps/api
pnpm prisma migrate deploy
pnpm db:seed
cd ../..

# Chạy API và Web
pnpm dev
```

Khi chạy local, Web mặc định tại `http://localhost:5173`; API tại `http://localhost:8080`.

## Khôi phục database

### Dùng PostgreSQL cài trực tiếp

```bash
createdb -U postgres vleague
psql -U postgres -d vleague -f database/vleague_database.sql
```

### Dùng PostgreSQL container trong `infra`

```bash
docker compose -f infra/docker-compose.db.yml up -d
docker cp database/vleague_database.sql vleague-db:/tmp/vleague_database.sql
docker exec -i vleague-db psql -U postgres -d vleague -f /tmp/vleague_database.sql
```

## Tài khoản demo

Mật khẩu chung: `Demo@12345`

| Vai trò      | Email                    |
| ------------ | ------------------------ |
| Admin        | `admin@demo.local`       |
| Team Manager | `teammanager@demo.local` |
| Referee      | `referee@demo.local`     |
| Supervisor   | `supervisor@demo.local`  |
| Public       | `public@demo.local`      |

## Environment

### Backend: `apps/api/.env`

```env
NODE_ENV=development
PORT=8080
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/vleague?schema=public

JWT_ACCESS_SECRET=dev-access-secret-change-in-production
JWT_ACCESS_TTL=15m
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production
JWT_REFRESH_TTL=7d

MAIL_SKIP_SEND=true
FRONTEND_URL=http://localhost:5173
```

OAuth và SMTP là tùy chọn. Xem toàn bộ biến tại [`apps/api/.env.example`](apps/api/.env.example).

### Frontend: `apps/web/.env`

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_SENTRY_DSN=
VITE_APP_VERSION=dev
```

## Lệnh thường dùng

### Workspace

| Lệnh                      | Mô tả                                                       |
| ------------------------- | ----------------------------------------------------------- |
| `pnpm setup`              | Cài dependencies, tạo env, chạy database/migrations và seed |
| `pnpm dev`                | Chạy API và Web ở chế độ development                        |
| `pnpm build`              | Build toàn bộ workspace                                     |
| `pnpm test`               | Chạy test API và Web                                        |
| `pnpm lint`               | Chạy lint toàn bộ workspace                                 |
| `pnpm format`             | Format source và tài liệu                                   |
| `pnpm db:seed`            | Chạy Prisma seed mặc định                                   |
| `pnpm seed:real`          | Seed dữ liệu V.League thực tế                               |
| `pnpm seed:vleague-2025`  | Chuẩn bị mùa giải V.League 2025                             |
| `pnpm seed:tie-scenarios` | Tạo dữ liệu kiểm thử đồng hạng/bốc thăm                     |

### API: chạy trong `apps/api`

| Lệnh                             | Mô tả                           |
| -------------------------------- | ------------------------------- |
| `pnpm dev`                       | Chạy NestJS hot reload          |
| `pnpm build`                     | Build API                       |
| `pnpm test`                      | Chạy unit tests                 |
| `pnpm test:e2e`                  | Chạy E2E tests                  |
| `pnpm test:cov`                  | Chạy test và coverage           |
| `pnpm db:seed`                   | Seed dữ liệu demo               |
| `pnpm seed:official-demo`        | Seed dữ liệu trọng tài/giám sát |
| `pnpm seed:promotion-candidates` | Seed ứng viên thăng hạng        |

### Prisma: chạy trong `apps/api`

| Lệnh                         | Mô tả                                |
| ---------------------------- | ------------------------------------ |
| `pnpm prisma migrate deploy` | Áp dụng migrations có sẵn            |
| `pnpm prisma migrate dev`    | Tạo/chạy migration trong development |
| `pnpm prisma generate`       | Generate Prisma Client               |
| `pnpm prisma studio`         | Mở Prisma Studio                     |

## Kiểm thử

| Nhóm                           | Số file kiểm thử hiện tại | Lệnh                           |
| ------------------------------ | ------------------------: | ------------------------------ |
| Backend unit/integration specs |                        35 | `cd apps/api && pnpm test`     |
| Backend E2E specs              |                        12 | `cd apps/api && pnpm test:e2e` |
| Frontend tests                 |                        44 | `cd apps/web && pnpm test`     |

Các nhóm nghiệp vụ quan trọng đã có kiểm thử gồm auth, phân quyền, đội/cầu thủ/sân, mùa giải, lời mời, Team Manager, lịch, trận đấu, đội hình, trọng tài, báo cáo, bảng xếp hạng và bốc thăm.

## Cấu trúc dự án

```text
SE104_VLEAGUE/
├── apps/
│   ├── api/
│   │   ├── prisma/                 # Schema, 39 migrations và seed scripts
│   │   ├── src/
│   │   │   ├── auth/               # JWT, OAuth, OTP, sessions, RBAC
│   │   │   ├── registration/       # Teams, players và CSV import
│   │   │   ├── season/             # Mùa giải và đội tham dự
│   │   │   ├── team-invitation/    # Lời mời và ứng viên thăng hạng
│   │   │   ├── team-manager/       # Phân công và yêu cầu của quản lý đội
│   │   │   ├── scheduling/         # Tạo/công bố lịch
│   │   │   ├── match/              # Trận đấu, sự kiện và Socket.IO
│   │   │   ├── match-lineup/       # Đăng ký/xét duyệt đội hình, treo giò
│   │   │   ├── match-official/     # Trọng tài, biên bản và kỷ luật
│   │   │   ├── standings/          # BXH, thống kê, bốc thăm và export
│   │   │   ├── roster/             # Cầu thủ thuộc đội
│   │   │   ├── regulation/         # Quy định theo mùa
│   │   │   ├── notification/       # Thông báo
│   │   │   ├── audit/              # Audit log
│   │   │   └── ...                 # Users, stadium, upload, search, health
│   │   └── test/                    # E2E tests
│   └── web/
│       └── src/
│           ├── pages/               # Trang nghiệp vụ và trang public
│           ├── services/            # Typed API clients
│           ├── auth/                # Auth context và route guards
│           ├── shell/               # Layout, menu, theme
│           └── components/          # Thành phần dùng chung
├── database/
│   └── vleague_database.sql         # Database dump dùng để bàn giao
├── docs/                            # Kiến trúc, use case, ERD và tài liệu
├── infra/                           # PostgreSQL Docker Compose
├── scripts/                         # Setup và utility scripts
└── docker-compose.yml               # Full stack: db + api + web
```

## Tài liệu bổ sung

| Tài liệu                                                                               | Nội dung                         |
| -------------------------------------------------------------------------------------- | -------------------------------- |
| [`docs/API_DOCS.md`](docs/API_DOCS.md)                                                 | Tài liệu API                     |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)                                         | Kiến trúc hệ thống               |
| [`docs/LOCAL_DEV.md`](docs/LOCAL_DEV.md)                                               | Hướng dẫn phát triển local       |
| [`docs/rbac.md`](docs/rbac.md)                                                         | Phân quyền vai trò               |
| [`docs/QA_OBSERVABILITY_RUNBOOK.md`](docs/QA_OBSERVABILITY_RUNBOOK.md)                 | QA, logging và quan sát hệ thống |
| [`docs/vleague-api.postman_collection.json`](docs/vleague-api.postman_collection.json) | Postman collection               |
| [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md)                                         | Hướng dẫn đóng góp               |
| [`docs/GIT_WORKFLOW.md`](docs/GIT_WORKFLOW.md)                                         | Quy trình Git                    |

## Đội ngũ phát triển

| MSSV     | Họ và tên              | Vai trò     |
| -------- | ---------------------- | ----------- |
| 23521422 | Huỳnh Lê Đại Thắng     | Team Leader |
| 23520468 | Bùi Nguyễn Công Hiếu   | Developer   |
| 23520541 | Trần Nguyễn Việt Hoàng | Developer   |
| 23521572 | Lê Quang Tiến          | Developer   |

## License

Dự án được phân phối theo giấy phép [MIT](LICENSE).

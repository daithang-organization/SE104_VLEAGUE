<h1 align="center">🐳 Infrastructure</h1>

<p align="center">
  <strong>Cấu hình Docker và Infrastructure cho VLeague</strong>
</p>

---

## 📋 Mục lục

- [🎯 Tổng quan](#-tổng-quan)
- [📁 Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [🐳 Docker Compose Files](#-docker-compose-files)
- [🚀 Hướng dẫn sử dụng](#-hướng-dẫn-sử-dụng)
- [⚙️ Cấu hình chi tiết](#️-cấu-hình-chi-tiết)
- [🛠️ Troubleshooting](#️-troubleshooting)

---

## 🎯 Tổng quan

Thư mục `infra/` chứa các file cấu hình infrastructure, bao gồm:
- Docker Compose files cho local development
- Database configurations
- Network settings

---

## 📁 Cấu trúc thư mục

```
infra/
└── docker-compose.db.yml    # Database only (development)
```

Ngoài ra ở root project còn có:
```
docker-compose.yml           # Full stack (api + web + db)
```

---

## 🐳 Docker Compose Files

### 1. `docker-compose.db.yml` - Database Only

**Dùng khi:** Chạy local development, chỉ cần database

```yaml
services:
  db:
    image: postgres:16
    container_name: vleague-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: vleague
    ports:
      - "5432:5432"
    volumes:
      - vleague_db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d vleague"]
      interval: 5s
      timeout: 5s
      retries: 10
```

### 2. `docker-compose.yml` (root) - Full Stack

**Dùng khi:** Chạy toàn bộ ứng dụng với Docker

```yaml
services:
  db:
    # PostgreSQL database
    ports: ["5432:5432"]
    
  api:
    # NestJS backend
    ports: ["8080:8080"]
    depends_on: db
    
  web:
    # React frontend
    ports: ["5173:5173"]
    depends_on: api
```

---

## 🚀 Hướng dẫn sử dụng

### Chạy Database only (Development)

```bash
# Từ root project
docker compose -f infra/docker-compose.db.yml up -d

# Kiểm tra status
docker ps

# Xem logs
docker logs vleague-db

# Dừng database
docker compose -f infra/docker-compose.db.yml down
```

### Chạy Full Stack

```bash
# Từ root project
docker compose up --build

# Chạy background
docker compose up -d --build

# Xem logs
docker compose logs -f

# Dừng tất cả
docker compose down
```

### Reset Database

```bash
# Xóa data và tạo lại
docker compose -f infra/docker-compose.db.yml down -v
docker compose -f infra/docker-compose.db.yml up -d
```

---

## ⚙️ Cấu hình chi tiết

### PostgreSQL Configuration

| Setting | Value | Mô tả |
|---------|-------|-------|
| Image | `postgres:16` | PostgreSQL version 16 |
| User | `postgres` | Default superuser |
| Password | `postgres` | Development password |
| Database | `vleague` | Default database |
| Port | `5432` | Standard PostgreSQL port |

### Connection Strings

**Local development:**
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vleague?schema=public"
```

**Docker internal (api → db):**
```
DATABASE_URL="postgresql://postgres:postgres@db:5432/vleague?schema=public"
```

### Volumes

| Volume | Path | Mô tả |
|--------|------|-------|
| `vleague_db_data` | `/var/lib/postgresql/data` | Persistent database data |

### Health Checks

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres -d vleague"]
  interval: 5s      # Kiểm tra mỗi 5 giây
  timeout: 5s       # Timeout 5 giây
  retries: 10       # Retry 10 lần trước khi fail
```

---

## 🛠️ Troubleshooting

### Port đã được sử dụng

**Lỗi:** `Port 5432 is already in use`

**Giải pháp:**
```bash
# Tìm process đang dùng port
netstat -ano | findstr :5432

# Hoặc dừng PostgreSQL local
# Windows: Services → PostgreSQL → Stop
```

### Database không kết nối được

**Kiểm tra:**
```bash
# 1. Container đang chạy?
docker ps

# 2. Logs có lỗi không?
docker logs vleague-db

# 3. Health check status?
docker inspect vleague-db --format='{{.State.Health.Status}}'
```

### Reset hoàn toàn

```bash
# Dừng và xóa tất cả
docker compose -f infra/docker-compose.db.yml down -v

# Xóa cả images (nếu cần)
docker compose -f infra/docker-compose.db.yml down -v --rmi all

# Khởi động lại
docker compose -f infra/docker-compose.db.yml up -d
```

### Xem dữ liệu trong database

```bash
# Kết nối vào container
docker exec -it vleague-db psql -U postgres -d vleague

# Các lệnh SQL cơ bản
\dt                    # Liệt kê tables
\d <table_name>        # Describe table
SELECT * FROM teams;   # Query data
\q                     # Thoát
```

---

## 📊 Network Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Docker Network (default)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐                                            │
│  │   vleague_web   │ ◄──── Host: localhost:5173                 │
│  │    (React)      │                                            │
│  └────────┬────────┘                                            │
│           │ http://api:8080                                     │
│           ▼                                                      │
│  ┌─────────────────┐                                            │
│  │   vleague_api   │ ◄──── Host: localhost:8080                 │
│  │    (NestJS)     │                                            │
│  └────────┬────────┘                                            │
│           │ postgresql://db:5432                                │
│           ▼                                                      │
│  ┌─────────────────┐                                            │
│  │   vleague_db    │ ◄──── Host: localhost:5432                 │
│  │  (PostgreSQL)   │                                            │
│  └─────────────────┘                                            │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────┐                                            │
│  │ vleague_pgdata  │ (Docker Volume - Persistent)               │
│  └─────────────────┘                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📚 Tài liệu liên quan

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [LOCAL_DEV.md](../docs/LOCAL_DEV.md) - Hướng dẫn development

---

<p align="center">
  <strong>Infrastructure Configuration 🐳</strong>
</p>

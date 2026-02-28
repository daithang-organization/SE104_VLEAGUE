<p align="center">
  <h1 align="center">🤝 Hướng dẫn Đóng góp Code</h1>
</p>

<p align="center">
  <strong>Cảm ơn bạn đã quan tâm đến việc đóng góp cho VLeague Management System!</strong>
</p>

---

## 📋 Mục lục

- [🚀 Bắt đầu](#-bắt-đầu)
- [📁 Cấu trúc Project](#-cấu-trúc-project)
- [🔄 Quy trình làm việc](#-quy-trình-làm-việc)
- [📝 Coding Standards](#-coding-standards)
- [✅ Checklist trước khi tạo PR](#-checklist-trước-khi-tạo-pr)
- [🔍 Code Review](#-code-review)

---

## 🚀 Bắt đầu

### 1. Clone Repository

```bash
git clone https://github.com/your-org/SE104_VLEAGUE.git
cd SE104_VLEAGUE
```

### 2. Cài đặt Dependencies

```bash
# Bật corepack để sử dụng pnpm
corepack enable

# Cài đặt tất cả dependencies
pnpm install
```

### 3. Thiết lập Environment

```bash
# Copy file .env mẫu
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

### 4. Khởi động Database

```bash
docker compose -f infra/docker-compose.db.yml up -d
```

### 5. Chạy Migrations

```bash
cd apps/api
pnpm dlx prisma migrate dev
cd ../..
```

### 6. Chạy Development Server

```bash
pnpm dev
```

✅ **Xong!** Bạn đã sẵn sàng để code!

---

## 📁 Cấu trúc Project

```
SE104_VLEAGUE/
├── apps/
│   ├── api/          # 🔌 Backend (NestJS + Prisma)
│   └── web/          # 🌐 Frontend (React + Vite)
│
├── docs/             # 📚 Tài liệu
├── infra/            # 🐳 Docker configs
├── scripts/          # 🛠️ Utility scripts
└── .github/          # 🔧 GitHub workflows
```

### Khi nào code ở đâu?

| Loại công việc   | Thư mục            | Mô tả                         |
| ---------------- | ------------------ | ----------------------------- |
| API Endpoint mới | `apps/api/src/`    | Tạo module/controller/service |
| UI Component mới | `apps/web/src/`    | Tạo component/page            |
| Database Schema  | `apps/api/prisma/` | Sửa schema.prisma             |
| Docker Config    | `infra/`           | Sửa docker-compose files      |
| Documentation    | `docs/`            | Thêm/sửa tài liệu             |

---

## 🔄 Quy trình làm việc

### Workflow tổng quan

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   1. Tạo     │───▶│  2. Develop  │───▶│   3. Push    │───▶│  4. Create   │
│   Branch     │    │   & Commit   │    │   & Test     │    │     PR       │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
                                                                    │
                                                                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   8. Delete  │◀───│  7. Merge    │◀───│  6. Approve  │◀───│  5. Review   │
│   Branch     │    │   to main    │    │     PR       │    │   by Team    │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

### Bước 1: Tạo Branch mới

```bash
# Cập nhật main
git checkout main
git pull origin main

# Tạo branch mới
git checkout -b <type>/<short-description>
```

**Branch naming convention:**

| Type       | Mô tả         | Ví dụ                   |
| ---------- | ------------- | ----------------------- |
| `feat`     | Tính năng mới | `feat/standings-table`  |
| `fix`      | Sửa lỗi       | `fix/login-redirect`    |
| `chore`    | Maintenance   | `chore/update-deps`     |
| `docs`     | Documentation | `docs/api-docs`         |
| `refactor` | Refactoring   | `refactor/auth-service` |
| `test`     | Testing       | `test/match-service`    |

### Bước 2: Develop & Commit

```bash
# Thêm files đã thay đổi
git add .

# Commit với message theo convention
git commit -m "<type>: <description>"
```

**Commit message convention:**

```
<type>: <description>

[optional body]

[optional footer]
```

**Ví dụ:**

```bash
git commit -m "feat: add standings table component"
git commit -m "fix: resolve login redirect issue"
git commit -m "docs: update API documentation"
```

### Bước 3: Push & Test

```bash
# Push branch lên remote
git push origin <branch-name>
```

### Bước 4: Tạo Pull Request

1. Vào GitHub repository
2. Click **"Compare & pull request"**
3. Điền thông tin PR theo template
4. Assign reviewers
5. Submit PR

### Bước 5-7: Review & Merge

- Chờ review từ team members
- Fix comments nếu có
- Khi approved → Merge

### Bước 8: Cleanup

```bash
# Xóa branch local
git checkout main
git pull origin main
git branch -d <branch-name>
```

---

## 📝 Coding Standards

### TypeScript/JavaScript

```typescript
// ✅ Good
const getUserById = async (id: string): Promise<User> => {
  return await prisma.user.findUnique({ where: { id } });
};

// ❌ Bad
async function getUserById(id) {
  return await prisma.user.findUnique({ where: { id } });
}
```

### Naming Conventions

| Loại               | Convention  | Ví dụ                                    |
| ------------------ | ----------- | ---------------------------------------- |
| Variables          | camelCase   | `userName`, `matchCount`                 |
| Functions          | camelCase   | `getMatchById`, `calculateScore`         |
| Classes            | PascalCase  | `MatchService`, `UserController`         |
| Constants          | UPPER_SNAKE | `MAX_TEAMS`, `API_BASE_URL`              |
| Files (components) | PascalCase  | `MatchCard.tsx`, `LoginPage.tsx`         |
| Files (services)   | kebab-case  | `match.service.ts`, `auth.controller.ts` |

### React Components

```tsx
// ✅ Good - Functional component với TypeScript
interface MatchCardProps {
  homeTeam: string;
  awayTeam: string;
  score?: string;
}

export function MatchCard({ homeTeam, awayTeam, score }: MatchCardProps) {
  return (
    <div className="match-card">
      <span>{homeTeam}</span>
      <span>{score ?? 'vs'}</span>
      <span>{awayTeam}</span>
    </div>
  );
}
```

### NestJS Services

```typescript
// ✅ Good - Service với dependency injection
@Injectable()
export class MatchService {
  constructor(private prisma: PrismaService) {}

  async getMatchById(id: string): Promise<Match> {
    return await this.prisma.match.findUnique({
      where: { id },
    });
  }
}
```

### Code Formatting

Sử dụng Prettier với config đã có sẵn:

```bash
# Format tất cả files
pnpm format

# Kiểm tra linting
pnpm lint
```

### 🧪 Testing

#### Backend (Jest)

```bash
cd apps/api
pnpm test          # Run all unit/service/controller specs
pnpm test:e2e      # Run E2E tests
pnpm test:cov      # Coverage report
```

- **Service specs**: `src/<module>/*.service.spec.ts` — test business logic with mocked Prisma
- **Controller specs**: `src/<module>/*.controller.spec.ts` — test request delegation
- **E2E specs**: `test/*.e2e-spec.ts` — test HTTP endpoints end-to-end

#### Frontend (Vitest)

```bash
cd apps/web
pnpm test          # Run all tests (vitest run)
pnpm exec vitest   # Watch mode
```

- **Service tests**: `src/services/__tests__/*.test.ts` — mock Axios, verify API calls
- **Page tests**: `src/pages/__tests__/*.test.tsx` — render components, verify UI

#### Test counts

| Layer    | Suites | Tests |
| -------- | ------ | ----- |
| Backend  | 23     | 233+  |
| Frontend | 24     | 143+  |

> 📖 Chi tiết xem tại [.agent/skills/testing-cicd/SKILL.md](../.agent/skills/testing-cicd/SKILL.md)

---

## ✅ Checklist trước khi tạo PR

### Code Quality

- [ ] Code được format với Prettier (`pnpm format`)
- [ ] Không có lỗi ESLint (`pnpm lint`)
- [ ] TypeScript không có lỗi (`pnpm build`)

### Testing

- [ ] Backend unit tests pass (`cd apps/api && pnpm test`)
- [ ] Frontend tests pass (`cd apps/web && pnpm test`)
- [ ] New backend features have service/controller specs
- [ ] New frontend pages have page component tests
- [ ] Đã test manual trên local

### Documentation

- [ ] Comments cho code phức tạp
- [ ] Cập nhật README nếu cần
- [ ] Cập nhật API docs nếu thêm endpoint

### Git

- [ ] Branch name đúng convention
- [ ] Commit messages đúng convention
- [ ] PR title đúng format: `<type>: <description>`

### PR Description

- [ ] Mô tả **What** (thay đổi gì)
- [ ] Mô tả **Why** (tại sao cần thay đổi)
- [ ] Screenshots cho UI changes
- [ ] Link related issues

---

## 🔍 Code Review

### Reviewer Guidelines

Khi review code, kiểm tra:

1. **Functionality** - Code có hoạt động đúng không?
2. **Design** - Code có được tổ chức tốt không?
3. **Complexity** - Code có dễ hiểu không?
4. **Tests** - Có đủ test coverage không?
5. **Naming** - Tên biến, function có ý nghĩa không?
6. **Comments** - Comments có cần thiết và đúng không?
7. **Style** - Code có follow coding standards không?

### Review Response Time

- **Goal:** Review trong vòng 24h
- Nếu bận, comment để author biết

### Cách để lại comment

```
// 💡 Suggestion: Consider using...
// ❓ Question: Why did you...
// 🐛 Bug: This will fail when...
// 📝 Nit: Minor style issue...
```

---

## 🆘 Cần hỗ trợ?

Nếu gặp vấn đề:

1. Xem [docs/LOCAL_DEV.md](LOCAL_DEV.md) để troubleshoot
2. Hỏi trong group chat của team
3. Tạo GitHub Issue

---

<p align="center">
  <strong>Happy Coding! 🚀</strong>
</p>

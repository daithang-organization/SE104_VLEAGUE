<h1 align="center">🌿 Git Workflow</h1>

<p align="center">
  <strong>Quy trình làm việc với Git cho dự án VLeague</strong>
</p>

---

## 📋 Mục lục

- [🌳 Branching Strategy](#-branching-strategy)
- [📝 Commit Convention](#-commit-convention)
- [🔄 Pull Request Flow](#-pull-request-flow)
- [⚡ Quick Reference](#-quick-reference)
- [🛠️ Git Commands](#️-git-commands)
- [❗ Xử lý xung đột](#-xử-lý-xung-đột)

---

## 🌳 Branching Strategy

### Branch chính

| Branch | Mô tả | Bảo vệ |
|--------|-------|--------|
| `main` | Production-ready code | ✅ Protected |

### Branch làm việc

```
<type>/<short-description>
```

### Branch Types

| Type | Mô tả | Ví dụ |
|------|-------|-------|
| `feat` | 🚀 Tính năng mới | `feat/standings-table` |
| `fix` | 🐛 Sửa lỗi | `fix/login-redirect-bug` |
| `chore` | 🔧 Maintenance, cập nhật deps | `chore/update-dependencies` |
| `docs` | 📚 Documentation | `docs/api-documentation` |
| `refactor` | ♻️ Refactoring code | `refactor/auth-service` |
| `test` | 🧪 Thêm/sửa tests | `test/match-service-unit` |
| `ci` | ⚙️ CI/CD changes | `ci/add-build-workflow` |

### Quy tắc đặt tên Branch

```
✅ Đúng:
feat/add-login-page
fix/standings-calculation
chore/update-prisma

❌ Sai:
feature/login         # Dùng "feat" không phải "feature"
fix_standings         # Dùng "/" không phải "_"
LoginPage             # Không có type prefix
```

---

## 📝 Commit Convention

Sử dụng [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>: <description>

[optional body]

[optional footer]
```

### Types

| Type | Emoji | Mô tả |
|------|-------|-------|
| `feat` | ✨ | Tính năng mới |
| `fix` | 🐛 | Sửa lỗi |
| `chore` | 🔧 | Maintenance |
| `docs` | 📚 | Documentation |
| `refactor` | ♻️ | Refactoring |
| `test` | 🧪 | Tests |
| `ci` | ⚙️ | CI/CD |
| `style` | 💄 | Formatting, styling |
| `perf` | ⚡ | Performance |

### Ví dụ

```bash
# Feature
git commit -m "feat: add standings table component"

# Bug fix
git commit -m "fix: resolve login redirect issue"

# Documentation
git commit -m "docs: update API documentation"

# Với body
git commit -m "feat: implement match event recording

- Add AddMatchEventDto
- Create event recording endpoint
- Update match service"

# Breaking change
git commit -m "feat!: change authentication flow

BREAKING CHANGE: JWT token format changed"
```

### Quy tắc viết message

1. **Bắt đầu bằng lowercase** sau type
2. **Không dấu chấm** cuối description
3. **Imperative mood** (add, fix, update - không phải added, fixed)
4. **Ngắn gọn** - dưới 72 ký tự

```
✅ Đúng:
feat: add login page
fix: resolve null pointer in match service

❌ Sai:
feat: Added login page.    # Quá khứ + dấu chấm
Fix: resolve bug           # Type phải lowercase
feat: add login page component for user authentication when they visit the website  # Quá dài
```

---

## 🔄 Pull Request Flow

### Quy trình tạo PR

```
┌─────────────────────────────────────────────────────────────────┐
│                          WORKFLOW                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐                 │
│  │  Create  │────▶│  Develop │────▶│   Push   │                 │
│  │  Branch  │     │  & Test  │     │  Branch  │                 │
│  └──────────┘     └──────────┘     └──────────┘                 │
│                                          │                       │
│                                          ▼                       │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐                 │
│  │  Merge   │◀────│  Review  │◀────│  Create  │                 │
│  │  to main │     │  & Fix   │     │    PR    │                 │
│  └──────────┘     └──────────┘     └──────────┘                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Bước 1: Tạo Branch

```bash
# Đảm bảo main đã cập nhật
git checkout main
git pull origin main

# Tạo branch mới
git checkout -b feat/my-feature
```

### Bước 2: Develop

```bash
# Làm việc và commit
git add .
git commit -m "feat: add feature X"

# Có thể commit nhiều lần
git commit -m "feat: add feature Y"
git commit -m "fix: resolve issue in X"
```

### Bước 3: Push

```bash
# Push lần đầu
git push -u origin feat/my-feature

# Push các lần sau
git push
```

### Bước 4: Tạo Pull Request

1. Vào GitHub Repository
2. Click **"Compare & pull request"** hoặc **"New pull request"**
3. Chọn base: `main`, compare: `feat/my-feature`
4. Điền thông tin:

```markdown
## What
- Add standings table component
- Integrate with API

## Why
- Required for sprint 2 deliverable
- Users need to view league standings

## Type
- [x] feat: New feature

## Checklist
- [x] Code builds successfully
- [x] Tests pass locally
- [ ] Added/updated tests (if needed)
```

### Bước 5: Review Process

```
Reviewer sẽ:
├── Kiểm tra code quality
├── Chạy tests
├── Để lại comments
└── Approve hoặc Request changes
```

**Nếu có comments:**

```bash
# Fix comments
git add .
git commit -m "fix: address review comments"
git push
```

### Bước 6: Merge

Sau khi được approve:
- Click **"Squash and merge"** (khuyến nghị) hoặc **"Merge"**
- Delete branch sau khi merge

### PR Title Convention

```
<type>: <description>
```

**Ví dụ:**
```
feat: add standings page with table component
fix: resolve authentication token expiry issue
docs: update API documentation for match endpoints
```

---

## ⚡ Quick Reference

### Tạo feature mới

```bash
git checkout main
git pull origin main
git checkout -b feat/my-feature
# ... develop ...
git add .
git commit -m "feat: description"
git push -u origin feat/my-feature
# Tạo PR trên GitHub
```

### Fix bug

```bash
git checkout main
git pull origin main
git checkout -b fix/bug-description
# ... fix ...
git add .
git commit -m "fix: description"
git push -u origin fix/bug-description
# Tạo PR trên GitHub
```

### Cập nhật branch với main

```bash
git checkout main
git pull origin main
git checkout feat/my-feature
git merge main
# Resolve conflicts nếu có
git push
```

---

## 🛠️ Git Commands

### Thường dùng

```bash
# Status
git status                    # Xem trạng thái
git log --oneline            # Xem lịch sử commits
git branch -a                # Xem tất cả branches

# Staging
git add .                    # Stage tất cả files
git add <file>               # Stage file cụ thể
git reset HEAD <file>        # Unstage file

# Commit
git commit -m "message"      # Commit với message
git commit --amend           # Sửa commit cuối

# Branch
git checkout -b <branch>     # Tạo và chuyển branch
git checkout <branch>        # Chuyển branch
git branch -d <branch>       # Xóa branch local
git push origin -d <branch>  # Xóa branch remote

# Remote
git fetch                    # Fetch changes
git pull                     # Pull changes
git push                     # Push changes
```

### Undo changes

```bash
# Undo uncommitted changes
git checkout -- <file>       # Undo file cụ thể
git checkout -- .            # Undo tất cả files

# Undo committed (chưa push)
git reset --soft HEAD~1      # Giữ changes, undo commit
git reset --hard HEAD~1      # Xóa cả changes và commit

# Undo pushed (cẩn thận!)
git revert <commit-hash>     # Tạo commit mới để undo
```

### Stash

```bash
git stash                    # Lưu tạm changes
git stash list              # Xem danh sách stash
git stash pop               # Khôi phục và xóa stash
git stash apply             # Khôi phục, giữ stash
git stash drop              # Xóa stash
```

---

## ❗ Xử lý xung đột

### Khi nào xảy ra?

- Khi merge branch có changes cùng file/dòng với main

### Cách xử lý

```bash
# 1. Pull/Merge và thấy conflict
git merge main
# CONFLICT (content): Merge conflict in <file>

# 2. Mở file có conflict
# Sẽ thấy:
<<<<<<< HEAD
your changes
=======
their changes
>>>>>>> main

# 3. Edit file - giữ code đúng, xóa markers

# 4. Stage và commit
git add <file>
git commit -m "fix: resolve merge conflict"

# 5. Push
git push
```

### Tips tránh conflict

1. **Pull thường xuyên** - `git pull origin main`
2. **Branches nhỏ** - Chia nhỏ features
3. **Communicate** - Báo team khi sửa file chung

---

## 📊 CI/CD Pipeline

Khi tạo PR, GitHub Actions sẽ tự động:

```
┌──────────────────────────────────────────────────────────────┐
│                        CI Pipeline                            │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐      │
│  │  Lint   │──▶│  Test   │──▶│  Build  │──▶│ Upload  │      │
│  │   ✓     │   │   ✓     │   │   ✓     │   │Artifact │      │
│  └─────────┘   └─────────┘   └─────────┘   └─────────┘      │
│                                                               │
│  Nếu fail ở bước nào → PR không thể merge                    │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### Kiểm tra CI status

1. Vào PR trên GitHub
2. Xem phần **"Checks"**
3. Nếu fail, click để xem logs

---

## 📋 Checklist trước khi merge

- [ ] PR title đúng convention
- [ ] Branch name đúng convention
- [ ] CI checks pass
- [ ] Có ít nhất 1 approval
- [ ] Không có unresolved comments
- [ ] Code đã được test

---

<p align="center">
  <strong>Git like a pro! 🚀</strong>
</p>

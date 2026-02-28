# Fresh Clone Checklist

## 1) Clone repo

```bash
git clone <repo>
cd <repo>
```

## 2) Copy env

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

## 3) Install dependencies

```bash
pnpm install
```

## 4) Run local

```bash
pnpm dev
```

## 5) Verify

- ✅ API responds on http://localhost:8080 (Nest default route OK)
- ✅ Web runs on http://localhost:5173

## 6) Run tests

```bash
# Backend tests (23 suites, 233+ tests)
cd apps/api
pnpm test

# Frontend tests (24 suites, 143+ tests)
cd ../web
pnpm test
```

- ✅ All backend tests pass
- ✅ All frontend tests pass

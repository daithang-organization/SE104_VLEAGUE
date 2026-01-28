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

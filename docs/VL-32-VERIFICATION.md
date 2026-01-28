# VL-32 Verification

## DB migration
- Run:
  - pnpm -C apps/api prisma migrate dev
- Verify table exists: matches
- Columns: id, round_no, home_team_id, away_team_id, stadium_id (nullable), kickoff_at (nullable), status

## Seed (optional)
- Run: pnpm -C apps/api db:seed
- Verify matches exist OR empty is acceptable

## Endpoints (expect 200)
- POST http://localhost:8080/schedule/generate
- POST http://localhost:8080/schedule/publish
- GET  http://localhost:8080/schedule

## Smoke test

### Start API
```bash
pnpm -C apps/api dev
```

### Test endpoints (curl)
```bash
curl -X POST http://localhost:8080/schedule/generate
curl -X POST http://localhost:8080/schedule/publish
curl http://localhost:8080/schedule
```

### ✅ Expected Results

- 2 POST requests return: `{ ok: true, message: ... }`
- GET request returns: `{ ok: true, matches: [...] }` or `matches: []` but still 200.

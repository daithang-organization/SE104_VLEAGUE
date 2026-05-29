# QA And Observability Runbook

## Smoke QA Before Release

Run these checks after migrations and before handing the system to real users.

### Admin

- Create or select a season.
- Invite 10 eligible clubs and confirm replacements can be invited when a club declines.
- Approve a club only after its application has owner info, kits, fee paid flag, fee receipt code or URL, roster, and eligible stadium.
- Generate the schedule and confirm it creates 18 rounds, 90 matches, 5 matches per round.
- Publish the schedule and confirm team managers receive schedule notifications.

### Team Manager

- Open the dashboard with a fixed managed club.
- Submit a season application with:
  - owner company in Vietnam
  - team introduction
  - primary and backup kits
  - `feeReceiptCode` or `feeReceiptUrl`
  - external competition schedule when applicable
- Create or update players with `careerSummary`.
- Submit a match lineup with 11 starters and 5 substitutes.
- Confirm suspended players cannot be selected.

### Referee And Supervisor

- Assign match officials before the match.
- Submit a match report with score, best player, goal/card events, and technical stats.
- Submit the same report again and confirm `MATCH_REPORT` events are replaced, not duplicated.
- Submit a supervisor discipline report with organization rating and issue notes.

### Public

- Open public schedule, results, standings, top scorers, awards, and match center.
- Confirm club logos, scores, cards, scorers, and standings are displayed.

## Automated Smoke Commands

```bash
pnpm --filter api exec prisma migrate status
pnpm --filter api test:e2e -- app.e2e-spec.ts scheduling.e2e-spec.ts --runInBand
pnpm --filter api test -- registration.service.spec.ts team-manager.service.spec.ts season.service.spec.ts scheduling.service.spec.ts match-official.service.spec.ts
pnpm --filter web test -- PlayersPage.test.tsx DashboardPage.test.tsx
pnpm --filter api build
pnpm --filter web build
```

## Health Endpoints

- `GET /api/health/live`: process liveness. Does not depend on database.
- `GET /api/health/ready`: readiness dependencies, including database and heap.
- `GET /api/health`: alias for readiness.

Every response should include `x-request-id`. If the caller sends `x-request-id`, the API echoes it. Otherwise, the API generates one.

## Runtime Configuration

| Variable               | Default                              | Purpose                     |
| ---------------------- | ------------------------------------ | --------------------------- |
| `LOG_LEVEL`            | `debug` in dev, `info` in production | Minimum log level           |
| `HEALTH_HEAP_LIMIT_MB` | `512`                                | Readiness heap threshold    |
| `NODE_ENV`             | `development`                        | `production` uses JSON logs |

## Alert Suggestions

- Page when `/api/health/ready` returns non-2xx for 2 consecutive checks.
- Page when database health is down.
- Warn when p95 API latency exceeds 500ms for 5 minutes.
- Warn when 5xx rate exceeds 1% for 5 minutes.
- Include `x-request-id` in support tickets and production incident notes.

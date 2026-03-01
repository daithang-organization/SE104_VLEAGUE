---
name: Performance & Monitoring
description: Logging, caching, health checks, and query optimization for SE104_VLEAGUE
---

# Performance & Monitoring Skill

## Implementation Status

| Feature                             | Status                              |
| ----------------------------------- | ----------------------------------- |
| Structured logging (nestjs-pino)    | ✅ Implemented                      |
| Request timing (LoggingInterceptor) | ✅ Implemented                      |
| In-memory caching                   | ✅ Implemented (standings)          |
| Health checks                       | ✅ Implemented                      |
| Rate limiting                       | ✅ Implemented (ThrottlerGuard)     |
| Sentry error tracking (frontend)    | ✅ Implemented                      |
| Audit logging                       | ✅ Available (not globally applied) |

---

## Structured Logging (nestjs-pino)

Configured in `src/common/logger/logger.module.ts`:

- **Production**: JSON structured logs, redaction of sensitive fields
- **Development**: Pretty-printed with `pino-pretty`
- **Request ID**: Auto-generated per request, included in all logs
- **Redaction**: Automatically redacts `authorization`, `cookie`, `password` fields

```typescript
// Usage in services
import { Logger } from '@nestjs/common';

@Injectable()
export class MyService {
  private readonly logger = new Logger(MyService.name);

  async doWork() {
    this.logger.log('Processing started');
    this.logger.warn('Slow operation detected');
    this.logger.error('Operation failed', error.stack);
  }
}
```

---

## Request Timing (LoggingInterceptor)

Global interceptor in `src/common/interceptors/logging.interceptor.ts`:

- Logs every request entry and exit with timing
- Visual indicators: 🟢 <100ms, 🟡 <500ms, 🔴 >500ms
- Adds `Server-Timing` header to responses
- Logs response body size

---

## Caching

### Configuration

```typescript
// app.module.ts
CacheModule.register({
  ttl: 60000, // 60s default TTL
  max: 100, // Max 100 items in cache
  isGlobal: true,
});
```

### Usage — Standings Controller

```typescript
@Controller('standings')
@UseInterceptors(CacheInterceptor)
export class StandingsController {
  @Get()
  @CacheTTL(30000) // 30 seconds
  async getStandings(@Query('seasonId') seasonId: string) {}
}
```

---

## Rate Limiting (ThrottlerGuard)

Global guard with 4 named configurations:

| Name      | Limit        | TTL |
| --------- | ------------ | --- |
| `default` | 100 requests | 60s |
| `short`   | 20 requests  | 1s  |
| `medium`  | 50 requests  | 10s |
| `long`    | 30 requests  | 60s |

Override per-endpoint:

```typescript
@Throttle({ short: { limit: 5, ttl: 60000 } })  // 5/min
@Post('login')
async login() {}

@SkipThrottle()  // Bypass entirely
@Get('me')
async getMe() {}
```

---

## Health Checks

`GET /api/health` — Public, skip throttle.

Checks:

1. **Database connectivity**: Prisma `$queryRaw` ping
2. **Memory heap**: Warning if heap exceeds 150MB

Response:

```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "memory_heap": { "status": "up" }
  }
}
```

---

## Sentry (Frontend)

Configured in `main.tsx`:

```typescript
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
  tracesSampleRate: 1.0, // 100% in dev
  replaysSessionSampleRate: 0.1, // 10%
  replaysOnErrorSampleRate: 1.0, // 100% on errors
});
```

`ErrorBoundary` component reports errors to Sentry.

---

## Audit Logging

`AuditLogInterceptor` (`src/common/interceptors/audit-log.interceptor.ts`):

- Logs POST/PATCH/PUT/DELETE mutations
- Captures: entity, action, user ID, IP address
- Available but NOT globally applied — use `@UseInterceptors(AuditLogInterceptor)` selectively

---

## Query Optimization Best Practices

1. **Select fields**: `this.prisma.team.findMany({ select: { id: true, name: true } })`
2. **Pagination**: Always `skip`/`take` with `count()` for large tables
3. **Indexes**: Key columns (seasonId, teamId, status) already indexed
4. **Avoid N+1**: Use `include` for nested relations
5. **Parallel queries**: `Promise.all([findMany(), count()])` for paginated results
6. **Computed standings**: Calculated from match events (not stored), cached 30s via interceptor

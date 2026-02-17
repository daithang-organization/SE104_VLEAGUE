---
name: Performance & Monitoring
description: Guide for logging, monitoring, caching, and performance optimization for SE104_VLEAGUE
---

# Performance & Monitoring Skill

This skill covers logging, monitoring, caching, and performance optimization for the SE104_VLEAGUE project.

### Implementation Status

| Feature                   | Status         | Location                                     |
| ------------------------- | -------------- | -------------------------------------------- |
| Pino structured logging   | ✅ Implemented | `common/logger/logger.module.ts`, `main.ts`  |
| LoggingInterceptor        | ✅ Implemented | `common/interceptors/logging.interceptor.ts` |
| HttpExceptionFilter       | ✅ Implemented | `common/filters/http-exception.filter.ts`    |
| Prisma query logging      | ✅ Implemented | `prisma/prisma.service.ts`                   |
| `@nestjs/cache-manager`   | 📋 Recommended | —                                            |
| `@nestjs/terminus` health | 📋 Recommended | —                                            |
| Timing interceptor        | 📋 Recommended | —                                            |

> [!NOTE]
> Sections marked 📋 below are **recommendations** — not yet implemented in the codebase.

## Structured Logging

### Actual Logging Setup — `nestjs-pino`

The project uses **`nestjs-pino`** (Pino) for structured JSON logging, configured in `src/common/logger/logger.module.ts`:

```typescript
// main.ts — uses Pino Logger globally
const app = await NestFactory.create(AppModule, { bufferLogs: true });
const logger = app.get(Logger); // from 'nestjs-pino'
app.useLogger(logger);
```

### LoggerModule Configuration

```typescript
// src/common/logger/logger.module.ts
PinoLoggerModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const isProduction = configService.get('NODE_ENV') === 'production';
    return {
      pinoHttp: {
        // Auto-assign request ID from header or generate UUID
        genReqId: (req) => req.headers['x-request-id'] || crypto.randomUUID(),

        // Custom log level based on status code
        customLogLevel: (_req, res, err) => {
          if (res.statusCode >= 500 || err) return 'error';
          if (res.statusCode >= 400) return 'warn';
          return 'info';
        },

        // Disable auto-logging (use LoggingInterceptor instead)
        autoLogging: false,

        // Redact sensitive data
        redact: {
          paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'req.body.password',
            'req.body.confirmPassword',
          ],
          censor: '***REDACTED***',
        },

        // Dev: pino-pretty with colors  |  Prod: JSON logs
        transport: isProduction
          ? undefined
          : {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'SYS:HH:mm:ss',
                ignore: 'pid,hostname',
                messageFormat: '{if context}[{context}]{end} {msg}',
                customColors: 'error:red,warn:yellow,info:green,debug:blue,trace:gray',
              },
            },
        level: isProduction ? 'info' : 'debug',
      },
    };
  },
});
```

### Key Features

| Feature                  | Description                                 |
| ------------------------ | ------------------------------------------- |
| Request ID               | Auto-generated UUID per request for tracing |
| Sensitive Data Redaction | Auth headers, cookies, passwords masked     |
| Custom Log Levels        | 5xx → error, 4xx → warn, 2xx/3xx → info     |
| Dev Mode                 | pino-pretty with colors and readable output |
| Production               | Raw JSON for log aggregation tools          |

### Using Logger in Services

```typescript
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);

  async findAll() {
    this.logger.log('Fetching all teams');
    const teams = await this.prisma.team.findMany();
    this.logger.debug(`Found ${teams.length} teams`);
    return teams;
  }

  async create(dto: CreateTeamDto) {
    this.logger.log(`Creating team: ${dto.name}`);
    try {
      const team = await this.prisma.team.create({ data: dto });
      this.logger.log(`Team created with ID: ${team.id}`);
      return team;
    } catch (error) {
      this.logger.error(`Failed to create team: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

## Request Logging Interceptor

```typescript
// common/interceptors/logging.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;
    const userAgent = request.get('user-agent') || '';
    const now = Date.now();

    this.logger.log(`→ ${method} ${url} - ${userAgent}`);

    if (Object.keys(body || {}).length > 0) {
      this.logger.debug(`Request body: ${JSON.stringify(body)}`);
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          this.logger.log(`← ${method} ${url} ${response.statusCode} - ${Date.now() - now}ms`);
        },
        error: (error) => {
          this.logger.error(`← ${method} ${url} ${error.status || 500} - ${Date.now() - now}ms`);
        },
      }),
    );
  }
}
```

## Prisma Query Logging

```typescript
// prisma.service.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('Prisma');

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });
  }

  async onModuleInit() {
    await this.$connect();

    // Log slow queries (> 100ms)
    this.$on('query' as never, (e: any) => {
      if (e.duration > 100) {
        this.logger.warn(`Slow query (${e.duration}ms): ${e.query}`);
      }
    });
  }
}
```

## Caching

### In-Memory Cache

```typescript
// Install: pnpm add @nestjs/cache-manager cache-manager

// app.module.ts
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register({
      ttl: 60, // seconds
      max: 100, // max items in cache
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
```

### Using Cache in Service

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class TeamsService {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  async findAll() {
    const cacheKey = 'teams:all';

    // Check cache first
    const cached = await this.cache.get<Team[]>(cacheKey);
    if (cached) return cached;

    // Fetch from database
    const teams = await this.prisma.team.findMany();

    // Store in cache (TTL: 60 seconds)
    await this.cache.set(cacheKey, teams, 60);

    return teams;
  }

  async create(dto: CreateTeamDto) {
    const team = await this.prisma.team.create({ data: dto });

    // Invalidate cache
    await this.cache.del('teams:all');

    return team;
  }
}
```

### Cache Interceptor

```typescript
// Auto-cache GET endpoints
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';

@Controller('teams')
@UseInterceptors(CacheInterceptor)
export class TeamsController {
  @Get()
  @CacheKey('teams_list')
  @CacheTTL(30)
  findAll() {
    return this.teamsService.findAll();
  }
}
```

## Performance Metrics

### Response Time Tracking

```typescript
// common/interceptors/timing.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class TimingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const duration = Date.now() - start;
        response.setHeader('X-Response-Time', `${duration}ms`);
      }),
    );
  }
}
```

## Health Checks

```typescript
// Install: pnpm add @nestjs/terminus

// health/health.module.ts
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { PrismaHealthIndicator } from './prisma.health';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [PrismaHealthIndicator],
})
export class HealthModule {}

// health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, MemoryHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
    private prisma: PrismaHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.prisma.isHealthy('database'),
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024), // 150MB
    ]);
  }
}

// health/prisma.health.ts
import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  constructor(private prisma: PrismaService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return this.getStatus(key, true);
    } catch (e) {
      throw new HealthCheckError('Prisma check failed', this.getStatus(key, false));
    }
  }
}
```

## Performance Best Practices

> [!TIP]
> **Select Only Needed Fields**: Use Prisma `select` to reduce data transfer.

> [!TIP]
> **Pagination**: Always paginate large result sets.

> [!TIP]
> **Indexes**: Add database indexes for frequently queried fields.

> [!WARNING]
> **N+1 Queries**: Use `include` to eager-load relations instead of separate queries.

### Query Optimization Examples

```typescript
// ❌ Bad: N+1 problem
const teams = await prisma.team.findMany();
for (const team of teams) {
  const players = await prisma.player.findMany({
    where: { teamId: team.id },
  });
}

// ✅ Good: Single query with include
const teams = await prisma.team.findMany({
  include: { players: true },
});

// ✅ Better: Select only needed fields
const teams = await prisma.team.findMany({
  select: {
    id: true,
    name: true,
    _count: { select: { players: true } },
  },
});
```

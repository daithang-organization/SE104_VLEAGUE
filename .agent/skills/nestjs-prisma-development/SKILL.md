---
name: NestJS + Prisma Development
description: Guide for developing backend features using NestJS framework with Prisma ORM for SE104_VLEAGUE project
---

# NestJS + Prisma Development Skill

This skill provides comprehensive guidance for developing backend features in the SE104_VLEAGUE project using NestJS and Prisma.

## Project Structure

The API backend is located at `apps/api/` with the following structure:

```
apps/api/
├── src/
│   ├── app.module.ts          # Root module
│   ├── main.ts               # Application entry point
│   ├── auth/                 # Authentication module
│   ├── common/               # Shared utilities (filters, interceptors, etc.)
│   ├── config/               # Configuration module
│   ├── mail/                 # Email service module
│   ├── match/               # Match management module
│   ├── registration/         # Team & player registration module
│   ├── roster/              # Team roster management module
│   ├── scheduling/           # Match scheduling module
│   ├── season/              # Season management module
│   ├── stadium/             # Stadium management module
│   ├── standings/           # League standings module
│   ├── users/               # User management module (ADMIN)
│   └── prisma/              # Prisma service
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── seed.ts             # Database seeding
│   └── migrations/         # Migration history
└── test/                   # E2E tests
```

## Core Technologies

- **Framework**: NestJS 11.x
- **ORM**: Prisma 7.x with PostgreSQL adapter
- **Database**: PostgreSQL
- **Testing**: Jest (unit) + Supertest (e2e)
- **Validation**: Built-in NestJS validation pipes

## Creating a New Module

### 1. Generate Module Structure

Use NestJS CLI to create a new module:

```bash
cd apps/api
pnpm exec nest generate module <module-name>
pnpm exec nest generate controller <module-name>
pnpm exec nest generate service <module-name>
```

### 2. Module Organization

Each module should follow this pattern:

```typescript
// <module-name>.module.ts
import { Module } from '@nestjs/common';
import { ModuleNameController } from './<module-name>.controller';
import { ModuleNameService } from './<module-name>.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ModuleNameController],
  providers: [ModuleNameService],
  exports: [ModuleNameService],
})
export class ModuleNameModule {}
```

### 3. Controller Pattern

Controllers handle HTTP requests and route them to services:

```typescript
// <module-name>.controller.ts
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ModuleNameService } from './<module-name>.service';
import { CreateDto, ResponseDto } from './dto';

@Controller('api-prefix')
export class ModuleNameController {
  constructor(private readonly service: ModuleNameService) {}

  @Get()
  async findAll(): Promise<ResponseDto[]> {
    return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseDto> {
    return this.service.findOne(id);
  }

  @Post()
  async create(@Body() createDto: CreateDto): Promise<ResponseDto> {
    return this.service.create(createDto);
  }
}
```

### 4. Service Pattern with Prisma

Services contain business logic and interact with the database:

```typescript
// <module-name>.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDto, ResponseDto } from './dto';

@Injectable()
export class ModuleNameService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<ResponseDto[]> {
    const items = await this.prisma.modelName.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return items;
  }

  async findOne(id: string): Promise<ResponseDto> {
    const item = await this.prisma.modelName.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }

    return item;
  }

  async create(createDto: CreateDto): Promise<ResponseDto> {
    return this.prisma.modelName.create({
      data: createDto,
    });
  }
}
```

## Prisma Schema Conventions

### Model Definition

```prisma
model EntityName {
  id        String   @id @default(uuid()) @db.Uuid
  fieldName String   @map("field_name")

  status    EnumType @default(VALUE)

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("table_name")
}
```

> [!IMPORTANT]
> All PK and FK columns must use `@db.Uuid` for native PostgreSQL UUID type. This provides better performance and data integrity compared to `TEXT`.

### Enum Definition

```prisma
enum EnumName {
  VALUE_ONE
  VALUE_TWO
}
```

### Relationships Example

```prisma
model Team {
  id      String   @id @default(uuid()) @db.Uuid
  name    String   @unique
  players Player[]

  @@map("teams")
}

model Player {
  id     String @id @default(uuid()) @db.Uuid
  teamId String @map("team_id") @db.Uuid
  team   Team   @relation(fields: [teamId], references: [id])

  @@map("players")
}
```

## DTOs and Validation

> [!IMPORTANT]
> Always create separate DTOs for requests and responses to maintain clear API contracts.

### Request DTO with Validation

```typescript
// create-team.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum TeamStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class CreateTeamDto {
  @ApiProperty({
    description: 'Team name',
    example: 'Hoàng Anh Gia Lai',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Team status',
    enum: TeamStatus,
    default: TeamStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(TeamStatus)
  status?: TeamStatus;
}
```

### Player DTO with Date Validation

```typescript
// create-player.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export enum PlayerPosition {
  GK = 'GK',
  DF = 'DF',
  MF = 'MF',
  FW = 'FW',
}

export class CreatePlayerDto {
  @ApiProperty({ description: 'Full name', example: 'Nguyễn Quang Hải' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ description: 'Date of birth (ISO 8601)', example: '1997-04-12' })
  @IsDateString()
  dob: string;

  @ApiProperty({ description: 'Nationality', example: 'Vietnam' })
  @IsString()
  @IsNotEmpty()
  nationality: string;

  @ApiProperty({ description: 'Position', enum: PlayerPosition })
  @IsEnum(PlayerPosition)
  position: PlayerPosition;

  @ApiPropertyOptional({ description: 'Team ID', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  teamId?: string;
}
```

### Response DTO Example

```typescript
// team-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class TeamResponseDto {
  @ApiProperty({ description: 'Team ID', format: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Team name' })
  name: string;

  @ApiProperty({ description: 'Status', enum: ['ACTIVE', 'INACTIVE'] })
  status: string;

  @ApiProperty({ description: 'Created date' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated date' })
  updatedAt: Date;
}
```

### Update DTO Pattern (Partial)

```typescript
// update-team.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateTeamDto } from './create-team.dto';

export class UpdateTeamDto extends PartialType(CreateTeamDto) {}
```

### Barrel Export

```typescript
// dto/index.ts
export * from './create-team.dto';
export * from './update-team.dto';
export * from './team-response.dto';
```

## Error Handling

Use NestJS built-in exceptions:

```typescript
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';

// Not found
throw new NotFoundException('Resource not found');

// Bad request
throw new BadRequestException('Invalid input');

// Conflict (duplicate)
throw new ConflictException('Resource already exists');
```

## Testing

### Unit Test Example

```typescript
// <module-name>.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ModuleNameService } from './<module-name>.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ModuleNameService', () => {
  let service: ModuleNameService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModuleNameService,
        {
          provide: PrismaService,
          useValue: {
            modelName: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ModuleNameService>(ModuleNameService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

### E2E Test Example

```typescript
// test/<module-name>.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('ModuleNameController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api-prefix (GET)', () => {
    return request(app.getHttpServer()).get('/api-prefix').expect(200);
  });
});
```

## Common Commands

```bash
# Development
cd apps/api
pnpm dev                    # Start dev server with watch mode

# Database
pnpm dlx prisma migrate dev # Create and apply migration
pnpm dlx prisma generate    # Generate Prisma client
pnpm dlx prisma studio      # Open Prisma Studio GUI
pnpm run db:seed           # Seed database

# Testing
pnpm test                  # Run unit tests
pnpm test:watch           # Run tests in watch mode
pnpm test:cov             # Generate coverage report
pnpm test:e2e             # Run e2e tests

# Linting & Formatting
pnpm lint                 # Run ESLint
pnpm format              # Run Prettier
```

## Best Practices

> [!TIP]
> **Dependency Injection**: Always use constructor injection for services and follow NestJS's dependency injection patterns.

> [!TIP]
> **Prisma Transactions**: For operations that modify multiple tables, use Prisma transactions:
>
> ```typescript
> await this.prisma.$transaction([
>   this.prisma.team.create({ data: teamData }),
>   this.prisma.player.create({ data: playerData }),
> ]);
> ```

> [!WARNING]
> **Don't forget postinstall**: The project has a `postinstall` script that runs `prisma generate`. This ensures Prisma Client is always up-to-date after `npm install`.

> [!TIP]
> **Cross-Module Dependency Injection**: When a service needs functionality from another module, import that module and inject its exported service. Example pattern used by `MatchService`:
>
> ```typescript
> // match.module.ts
> @Module({
>   imports: [PrismaModule, StandingsModule, RegulationModule],
>   providers: [MatchService],
> })
>
> // match.service.ts
> constructor(
>   private prisma: PrismaService,
>   private standingsService: StandingsService,
>   private regulationHelper: RegulationHelper,
> ) {}
> ```
>
> The source module must `export` the service (e.g., `RegulationModule` exports `RegulationHelper`).

## Current Modules Reference

- **`auth/`**: Authentication (JWT, OAuth, OTP, sessions) and authorization (RBAC)
- **`registration/`**: Team and player registration
  - Imports: `PrismaModule`, `RegulationModule`
  - Uses `RegulationHelper` for dynamic age validation (`MIN_AGE`, `MAX_AGE`)
  - `teams.controller.ts`: Team management endpoints
  - `players.controller.ts`: Player management endpoints
  - `registration.service.ts`: Shared registration logic
- **`scheduling/`**: Match scheduling logic
- **`match/`**: Match management and events
  - Imports: `PrismaModule`, `StandingsModule`, `RegulationModule`
  - Uses `StandingsService` for auto-recalculation on FINISHED
  - Uses `RegulationHelper` for MAX_GOAL_TIME validation
- **`season/`**: Season management (CRUD, status transitions)
  - `season.controller.ts`: Season CRUD endpoints
  - `season-team.controller.ts`: Season team registration endpoints (`/seasons/:seasonId/teams`)
    - `GET /` — List registered teams
    - `POST /` — Register a team (ADMIN)
    - `PATCH /:teamId/status` — Approve/Reject/Withdraw (ADMIN)
    - `DELETE /:teamId` — Remove team (ADMIN)
  - `season.service.ts`: Season + team management logic
- **`stadium/`**: Stadium management
- **`roster/`**: Team roster management (player assignments, jersey numbers)
  - Imports: `PrismaModule`, `RegulationModule`
  - Uses `RegulationHelper` for dynamic roster/foreign limits
- **`standings/`**: League standings computation
  - Auto-triggered by `MatchService` when match finishes
- **`regulation/`**: Season-scoped regulations
  - Exports: `RegulationService`, `RegulationHelper`
  - `RegulationHelper` provides `getNumericValue(seasonId, key, fallback)` for cross-module regulation queries
- **`users/`**: User management (ADMIN-only CRUD, role assignment)
  - `users.controller.ts`: User CRUD endpoints (list, create, update role, delete)
  - `users.service.ts`: User management logic
  - `dto/update-role.dto.ts`, `dto/create-user.dto.ts`: Validation DTOs
- **`health/`**: Health check endpoint
- **`mail/`**: Email service (verification OTP, password reset, welcome)
- **`config/`**: Configuration module
- **`common/`**: Shared utilities (filters, interceptors, middleware)
- **`prisma/`**: Database service wrapper

### Database Schema (14 Tables, 9 Enums)

All ID fields use native PostgreSQL `UUID` type. Key tables:

| Table                                     | Purpose                                 |
| ----------------------------------------- | --------------------------------------- |
| `roles`, `users`                          | Authentication & RBAC (dual: enum + FK) |
| `refresh_tokens`, `otp_codes`             | Session & verification                  |
| `stadiums`, `teams`, `seasons`, `players` | Core domain entities                    |
| `team_players`, `season_teams`            | Many-to-many join tables                |
| `matches`, `match_events`                 | Match scheduling & events               |
| `regulations`                             | Per-season config rules                 |
| `standings`                               | League table (computed & cached)        |

## Environment Variables

Required in `apps/api/.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
PORT=8080
```

## Registering Module in App Module

After creating a new module, register it in `src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { YourNewModule } from './your-new/your-new.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    YourNewModule, // Add here
  ],
})
export class AppModule {}
```

## Guards and Custom Decorators

### JWT Auth Guard

```typescript
// auth/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }
}
```

### Role Guard

```typescript
// auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
```

### Custom Decorators

```typescript
// auth/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

// auth/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
```

### Usage in Controllers

```typescript
@Controller('teams')
export class TeamsController {
  @Get()
  @Public() // No auth required
  findAll() {}

  @Post()
  @Roles(UserRole.ADMIN) // Admin only
  create(@Body() dto: CreateTeamDto, @CurrentUser() user: User) {}
}
```

## Interceptors

### Logging Interceptor

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
    const { method, url } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        this.logger.log(`${method} ${url} ${response.statusCode} - ${Date.now() - now}ms`);
      }),
    );
  }
}
```

### Response Transform Interceptor

```typescript
// common/interceptors/transform.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  meta?: { timestamp: string };
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => ({
        data,
        meta: { timestamp: new Date().toISOString() },
      })),
    );
  }
}
```

### Register Interceptors Globally

```typescript
// main.ts
app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());
```

## Exception Filters

### Custom HTTP Exception Filter

```typescript
// common/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      message:
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message,
    };

    this.logger.error(`Status ${status}: ${JSON.stringify(errorResponse)}`);
    response.status(status).json(errorResponse);
  }
}
```

## Pagination Pattern

### Pagination DTO

```typescript
// common/dto/pagination.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export class PaginatedResponseDto<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

### Pagination Service

```typescript
// common/services/pagination.service.ts
import { Injectable } from '@nestjs/common';
import { PaginationQueryDto, PaginatedResponseDto } from '../dto/pagination.dto';

@Injectable()
export class PaginationService {
  paginate<T>(data: T[], total: number, query: PaginationQueryDto): PaginatedResponseDto<T> {
    const { page = 1, limit = 10 } = query;
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
```

### Usage in Service

```typescript
async findAll(query: PaginationQueryDto): Promise<PaginatedResponseDto<Team>> {
  const { page = 1, limit = 10 } = query;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    this.prisma.team.findMany({ skip, take: limit, orderBy: { name: 'asc' } }),
    this.prisma.team.count(),
  ]);

  return this.paginationService.paginate(data, total, query);
}
```

## File Upload

### Multer Configuration

```typescript
// common/config/multer.config.ts
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';

export const multerConfig = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
      cb(new BadRequestException('Only image files are allowed'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
};
```

### File Upload Controller

```typescript
// teams/teams.controller.ts
import { Controller, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../common/config/multer.config';

@Controller('teams')
export class TeamsController {
  @Post(':id/logo')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  uploadLogo(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.teamsService.updateLogo(id, file.filename);
  }
}
```

> [!IMPORTANT]
> Add `@types/multer` to dev dependencies: `pnpm add -D @types/multer`

## Implemented Modules Reference

### Registration Module (`src/registration/`)

Handles team and player registration.

| Method | Endpoint       | Role                | Description      |
| ------ | -------------- | ------------------- | ---------------- |
| `GET`  | `/api/teams`   | ADMIN, TEAM_MANAGER | List all teams   |
| `GET`  | `/api/players` | Public              | List all players |

> [!NOTE]
> Teams and Players are registered via separate controllers (`teams.controller.ts`, `players.controller.ts`) but share the same `RegistrationService`.

---

### Match Module (`src/match/`)

Manages match details and match events (goals, cards, substitutions).

| Method | Endpoint                  | Role                         | Description                       |
| ------ | ------------------------- | ---------------------------- | --------------------------------- |
| `GET`  | `/api/matches/:id`        | ADMIN, TEAM_MANAGER, REFEREE | Get match details with events     |
| `POST` | `/api/matches/:id/events` | ADMIN, REFEREE               | Add match event (goal, card, sub) |

**Event types:** `GOAL`, `YELLOW_CARD`, `RED_CARD`, `SUBSTITUTION`

---

### Scheduling Module (`src/scheduling/`)

Handles match schedule generation and publishing.

| Method | Endpoint                 | Role                         | Description                  |
| ------ | ------------------------ | ---------------------------- | ---------------------------- |
| `POST` | `/api/schedule/generate` | ADMIN                        | Auto-generate match schedule |
| `POST` | `/api/schedule/publish`  | ADMIN                        | Publish schedule to public   |
| `GET`  | `/api/schedule`          | ADMIN, TEAM_MANAGER, REFEREE | Get all scheduled matches    |

---

### Common Module (`src/common/`)

Shared utilities used across all modules:

| Directory       | File                       | Purpose                                        |
| --------------- | -------------------------- | ---------------------------------------------- |
| `errors/`       | `app-error.ts`             | Custom `AppError` class with error codes       |
| `filters/`      | `http-exception.filter.ts` | Unified error response shape (global filter)   |
| `interceptors/` | `logging.interceptor.ts`   | Request/response performance logging           |
| `logger/`       | `logger.module.ts`         | `nestjs-pino` structured logging configuration |
| `middleware/`   | `security.middleware.ts`   | Security headers middleware                    |

**Error Response Shape** (from `HttpExceptionFilter`):

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

---

### Season Module (`src/season/`)

Manages VLeague seasons (e.g., VLeague 2024, VLeague 2025).

| Method   | Endpoint               | Role   | Description                      |
| -------- | ---------------------- | ------ | -------------------------------- |
| `GET`    | `/api/seasons`         | Public | List all seasons                 |
| `GET`    | `/api/seasons/current` | Public | Get current season (IN_PROGRESS) |
| `GET`    | `/api/seasons/:id`     | Public | Get season details               |
| `POST`   | `/api/seasons`         | ADMIN  | Create new season                |
| `PATCH`  | `/api/seasons/:id`     | ADMIN  | Update season                    |
| `DELETE` | `/api/seasons/:id`     | ADMIN  | Delete season                    |

---

### Stadium Module (`src/stadium/`)

Manages stadium information.

| Method   | Endpoint            | Role   | Description         |
| -------- | ------------------- | ------ | ------------------- |
| `GET`    | `/api/stadiums`     | Public | List all stadiums   |
| `GET`    | `/api/stadiums/:id` | Public | Get stadium details |
| `POST`   | `/api/stadiums`     | ADMIN  | Create stadium      |
| `PATCH`  | `/api/stadiums/:id` | ADMIN  | Update stadium      |
| `DELETE` | `/api/stadiums/:id` | ADMIN  | Delete stadium      |

---

### Roster Module (`src/roster/`)

Manages team-player relationships.

| Method   | Endpoint                              | Role                | Description            |
| -------- | ------------------------------------- | ------------------- | ---------------------- |
| `GET`    | `/api/teams/:teamId/roster`           | Public              | Get team roster        |
| `POST`   | `/api/teams/:teamId/roster`           | ADMIN, TEAM_MANAGER | Add player to team     |
| `PATCH`  | `/api/teams/:teamId/roster/:playerId` | ADMIN, TEAM_MANAGER | Update (jersey number) |
| `DELETE` | `/api/teams/:teamId/roster/:playerId` | ADMIN, TEAM_MANAGER | Remove player          |

**Business Rules:**

- One player can only be in one team at a time
- Jersey numbers must be unique within team

---

### Standings Module (`src/standings/`)

Auto-calculates league standings and top scorers.

| Method | Endpoint                      | Role   | Description                  |
| ------ | ----------------------------- | ------ | ---------------------------- |
| `GET`  | `/api/standings`              | Public | Get current season standings |
| `GET`  | `/api/standings?seasonId=xxx` | Public | Get standings by season      |
| `GET`  | `/api/standings/top-scorers`  | Public | Get top scorers list         |

**Scoring:** Win=3pts, Draw=1pt, Loss=0pts

**Ranking criteria (priority order):**

1. Points
2. Goal difference
3. Goals scored
4. Team name (alphabetically)

---

### Mail Module (`src/mail/`)

Handles email sending with templates.

```typescript
// Usage in services
import { MailService } from './mail';

@Injectable()
export class AuthService {
  constructor(private readonly mail: MailService) {}

  async sendOtp(email: string, otp: string) {
    await this.mail.sendEmailVerificationOtp(email, otp);
  }
}
```

**Templates:**

- `email-verification.hbs` - Email verification OTP
- `password-reset.hbs` - Password reset OTP
- `welcome.hbs` - Welcome email

**Environment Variables:**

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
MAIL_FROM=noreply@vleague.local
```

---

## Global Configuration (main.ts)

The application bootstraps with several global configurations in `src/main.ts`:

### Global Validation Pipe

> [!IMPORTANT]
> **All incoming DTOs are automatically validated.** Fields not in the DTO are stripped (`whitelist`) and rejected if present with `forbidNonWhitelisted`.

```typescript
// main.ts — already configured
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // Strip unknown properties
    forbidNonWhitelisted: true, // Throw on unexpected properties
    transform: true, // Auto-transform payloads to DTO classes
    transformOptions: {
      enableImplicitConversion: true, // Convert string "1" → number 1
    },
  }),
);
```

### Global Exception Filter

```typescript
// main.ts — already configured
app.useGlobalFilters(new HttpExceptionFilter());
```

All exceptions are caught and normalized to `{ code, message, details?, requestId?, timestamp }`. See the **Error Handling** skill for details.

### Global Logging Interceptor

```typescript
// main.ts — already configured
app.useGlobalInterceptors(new LoggingInterceptor());
```

The `LoggingInterceptor` logs request entry/exit with performance timing (🟢 <100ms, 🟡 <500ms, 🔴 >500ms).

### CORS Configuration

```typescript
// main.ts — already configured
app.enableCors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
});
```

### Helmet Security Headers (Production Only)

```typescript
// main.ts — only in production
if (process.env.NODE_ENV === 'production') {
  const helmet = await import('helmet');
  app.use(
    helmet.default({
      contentSecurityPolicy: {
        directives: {
          /* ... */
        },
      },
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
      frameguard: { action: 'deny' },
      hidePoweredBy: true,
      noSniff: true,
      xssFilter: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );
}
```

> [!TIP]
> There is also a `SecurityMiddleware` class in `src/common/middleware/security.middleware.ts` that wraps Helmet as a NestJS middleware. Use it for module-level application via `configure(consumer)` if needed.

### Global API Prefix

```typescript
app.setGlobalPrefix('api');
// All routes become /api/... — Swagger docs at /api/docs (via SwaggerModule.setup('docs', ...))
```

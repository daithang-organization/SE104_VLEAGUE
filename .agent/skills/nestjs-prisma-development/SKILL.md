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
│   ├── registration/         # Team & player registration module
│   ├── scheduling/           # Match scheduling module
│   ├── match/               # Match management module
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
  id        String   @id @default(uuid())
  fieldName String   @map("field_name")

  status    EnumType @default(VALUE)

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("table_name")
}
```

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
  id      String   @id @default(uuid())
  name    String   @unique
  players Player[]

  @@map("teams")
}

model Player {
  id     String @id @default(uuid())
  teamId String @map("team_id")
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

## Current Modules Reference

- **`auth/`**: Authentication and authorization
- **`registration/`**: Team and player registration, includes:
  - `teams.controller.ts`: Team management endpoints
  - `players.controller.ts`: Player management endpoints
  - `registration.service.ts`: Shared registration logic
- **`scheduling/`**: Match scheduling logic
- **`match/`**: Match management and events
- **`prisma/`**: Database service wrapper

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

```

```

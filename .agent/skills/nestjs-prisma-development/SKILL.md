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

### Request DTO Example

```typescript
// create-<entity>.dto.ts
export class CreateEntityDto {
  name: string;
  status: string;
}
```

### Response DTO Example

```typescript
// <entity>-response.dto.ts
export class EntityResponseDto {
  id: string;
  name: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Error Handling

Use NestJS built-in exceptions:

```typescript
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

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
    return request(app.getHttpServer())
      .get('/api-prefix')
      .expect(200);
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

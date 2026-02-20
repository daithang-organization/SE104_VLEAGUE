---
name: API Documentation
description: Guide for API documentation using Swagger/OpenAPI, response standards, and versioning for SE104_VLEAGUE
---

# API Documentation Skill

This skill covers API documentation standards and implementation for the SE104_VLEAGUE project using Swagger/OpenAPI.

## Swagger Setup

### Installation

```bash
cd apps/api
pnpm add @nestjs/swagger
```

### Configuration

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // All routes prefixed with /api
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('VLeague API')
    .setDescription('V-League Football Management System API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT access token',
        in: 'header',
      },
      'access-token', // Security scheme name
    )
    .addTag('Authentication', 'User authentication endpoints')
    .addTag('Health', 'Application health check')
    .addTag('Teams', 'Team management endpoints')
    .addTag('Players', 'Player management endpoints')
    .addTag('Matches', 'Match scheduling and management')
    .addTag('Scheduling', 'Schedule generation and publishing')
    .addTag('Standings', 'League standings and statistics')
    .addTag('Seasons', 'Season management')
    .addTag('Stadiums', 'Stadium management')
    .addTag('Roster', 'Team roster management')
    .addTag('Regulations', 'Season regulation rules')
    .addTag('Users', 'User management (ADMIN)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  // Swagger UI available at: http://localhost:{port}/api/docs
}
bootstrap();
```

Access Swagger UI at: `http://localhost:8080/api`

## Controller Documentation

### Basic Controller

```typescript
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateTeamDto, TeamResponseDto } from './dto';

@ApiTags('teams')
@Controller('teams')
export class TeamsController {
  @Get()
  @ApiOperation({
    summary: 'Get all teams',
    description: 'Retrieve a list of all registered teams',
  })
  @ApiResponse({ status: 200, description: 'List of teams', type: [TeamResponseDto] })
  findAll(): Promise<TeamResponseDto[]> {
    return this.teamsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get team by ID' })
  @ApiResponse({ status: 200, description: 'Team found', type: TeamResponseDto })
  @ApiResponse({ status: 404, description: 'Team not found' })
  findOne(@Param('id') id: string): Promise<TeamResponseDto> {
    return this.teamsService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new team' })
  @ApiResponse({ status: 201, description: 'Team created', type: TeamResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createTeamDto: CreateTeamDto): Promise<TeamResponseDto> {
    return this.teamsService.create(createTeamDto);
  }
}
```

## DTO Documentation

### Request DTO

```typescript
// dto/create-team.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum TeamStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class CreateTeamDto {
  @ApiProperty({
    description: 'Unique team name',
    example: 'Hoàng Anh Gia Lai',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Team status',
    enum: TeamStatus,
    default: TeamStatus.ACTIVE,
    example: TeamStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(TeamStatus)
  status?: TeamStatus;
}
```

### Response DTO

```typescript
// dto/team-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class TeamResponseDto {
  @ApiProperty({
    description: 'Unique team identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Team name',
    example: 'Hoàng Anh Gia Lai',
  })
  name: string;

  @ApiProperty({
    description: 'Team status',
    enum: ['ACTIVE', 'INACTIVE'],
    example: 'ACTIVE',
  })
  status: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;
}
```

## Pagination Documentation

```typescript
// common/dto/paginated-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 10 })
  totalPages: number;
}

export class PaginatedTeamResponseDto {
  @ApiProperty({ type: [TeamResponseDto] })
  data: TeamResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
```

## Error Response Standards

### Standard Error DTO

```typescript
// common/dto/error-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: 'Validation failed' })
  message: string;

  @ApiProperty({ example: ['name must not be empty'], required: false })
  errors?: string[];
}
```

### Common Error Responses

```typescript
@Controller('teams')
export class TeamsController {
  @Post()
  @ApiResponse({ status: 400, description: 'Bad Request', type: ErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @ApiResponse({ status: 409, description: 'Conflict (duplicate)' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  create(@Body() dto: CreateTeamDto) {}
}
```

## API Response Wrapper

### Consistent Response Format

```typescript
// All API responses should follow this structure:
{
  "data": { ... },           // Actual response data
  "meta": {                   // Optional metadata
    "timestamp": "2024-...",
    "page": 1,
    "total": 100
  }
}

// Error responses:
{
  "statusCode": 400,
  "timestamp": "2024-...",
  "message": "Error description",
  "errors": ["field-specific errors"]
}
```

## API Versioning

### URL-Based Versioning

```typescript
// main.ts
app.setGlobalPrefix('api/v1');

// For multiple versions
@Controller({ path: 'teams', version: '1' })
export class TeamsV1Controller {}

@Controller({ path: 'teams', version: '2' })
export class TeamsV2Controller {}
```

### Swagger for Multiple Versions

```typescript
// main.ts
const configV1 = new DocumentBuilder().setTitle('VLeague API v1').setVersion('1.0').build();

const documentV1 = SwaggerModule.createDocument(app, configV1, {
  include: [TeamsV1Module, PlayersV1Module],
});
SwaggerModule.setup('api/v1/docs', app, documentV1);

const configV2 = new DocumentBuilder().setTitle('VLeague API v2').setVersion('2.0').build();

const documentV2 = SwaggerModule.createDocument(app, configV2, {
  include: [TeamsV2Module, PlayersV2Module],
});
SwaggerModule.setup('api/v2/docs', app, documentV2);
```

## Common Decorators Reference

| Decorator                                     | Purpose                    |
| --------------------------------------------- | -------------------------- |
| `@ApiTags('name')`                            | Group endpoints in Swagger |
| `@ApiOperation({ summary, description })`     | Describe endpoint          |
| `@ApiResponse({ status, description, type })` | Document response          |
| `@ApiProperty({ description, example })`      | Document DTO property      |
| `@ApiPropertyOptional()`                      | Mark optional property     |
| `@ApiBearerAuth()`                            | Require JWT auth           |
| `@ApiParam({ name, description })`            | Document URL param         |
| `@ApiQuery({ name, required })`               | Document query param       |
| `@ApiBody({ type })`                          | Document request body      |
| `@ApiHeader({ name })`                        | Document header            |

## Best Practices

> [!TIP]
> **Examples**: Always provide realistic examples in `@ApiProperty` for better documentation.

> [!TIP]
> **Grouping**: Use `@ApiTags` to group related endpoints for easier navigation.

> [!IMPORTANT]
> **Response Types**: Always specify response types for proper TypeScript integration.

> [!WARNING]
> **Security**: Never expose internal error details in production API responses.

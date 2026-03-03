---
name: API Documentation
description: Swagger/OpenAPI setup and documentation patterns for SE104_VLEAGUE
---

# API Documentation Skill

## Swagger Setup

Swagger UI available at `/api/docs` (set up in `main.ts`).

```typescript
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
    'access-token',
  )
  .addTag('Authentication', 'User authentication endpoints')
  .addTag('Teams', 'Team management endpoints')
  .addTag('Players', 'Player management endpoints')
  .addTag('Matches', 'Match scheduling and management')
  .addTag('Scheduling', 'Schedule generation and publishing')
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('docs', app, document);
```

> **NOTE**: Only 5 tags are declared in the `DocumentBuilder`. Additional tags (`Seasons`, `Stadiums`, `Roster`, `Regulations`, `Standings`, `Users`, `Upload`, `Search`, `Health`) are auto-discovered from `@ApiTags()` decorators on controllers and appear in the Swagger UI automatically.

---

## Controller Documentation

```typescript
@ApiTags('Teams')
@Controller('teams')
export class TeamsController {
  @Get()
  @ApiOperation({ summary: 'List all teams' })
  @ApiResponse({ status: 200, description: 'Teams retrieved successfully' })
  @Public()
  findAll(@Query() query: PaginationQueryDto) {}

  @Post()
  @ApiOperation({ summary: 'Create a team' })
  @ApiResponse({ status: 201, description: 'Team created' })
  @ApiResponse({ status: 409, description: 'Team name already exists' })
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateTeamDto) {}
}
```

---

## DTO Documentation

```typescript
export class CreateTeamDto {
  @ApiProperty({ description: 'Team name', example: 'Hoàng Anh Gia Lai' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Short name', example: 'HAGL' })
  @IsOptional()
  @IsString()
  shortName?: string;

  @ApiPropertyOptional({ description: 'City', example: 'Pleiku' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ enum: TeamStatus, default: TeamStatus.ACTIVE })
  @IsOptional()
  @IsEnum(TeamStatus)
  status?: TeamStatus;
}
```

---

## Error Response Shape

All API errors follow this schema:

```json
{
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "details": ["field must be a string"],
  "requestId": "uuid",
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

---

## Decorator Reference

| Decorator                                | Purpose                |
| ---------------------------------------- | ---------------------- |
| `@ApiTags('Tag')`                        | Group endpoints by tag |
| `@ApiOperation({ summary })`             | Endpoint description   |
| `@ApiResponse({ status, description })`  | Response documentation |
| `@ApiBearerAuth()`                       | Mark as JWT-protected  |
| `@ApiProperty({ description, example })` | Required field         |
| `@ApiPropertyOptional({...})`            | Optional field         |
| `@ApiQuery({ name, required, enum })`    | Query parameter        |
| `@ApiParam({ name, description })`       | Path parameter         |
| `@ApiConsumes('multipart/form-data')`    | File upload endpoint   |

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
  .setDescription('VLeague Management System API')
  .setVersion('1.0')
  .addBearerAuth()
  .addTag('Auth', 'Authentication & authorization')
  .addTag('Teams', 'Team management')
  .addTag('Players', 'Player management')
  .addTag('Matches', 'Match management & events')
  .addTag('Schedule', 'Match scheduling')
  .addTag('Seasons', 'Season management')
  .addTag('Stadiums', 'Stadium management')
  .addTag('Roster', 'Team roster management')
  .addTag('Regulations', 'Season regulations')
  .addTag('Standings', 'League standings & statistics')
  .addTag('Users', 'User management (ADMIN)')
  .addTag('Upload', 'File upload')
  .addTag('Search', 'Global search')
  .addTag('Health', 'Health check')
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('docs', app, document);
```

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

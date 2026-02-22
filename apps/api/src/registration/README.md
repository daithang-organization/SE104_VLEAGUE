# Registration Module

Module quản lý đăng ký đội bóng và cầu thủ trong hệ thống VLeague.

## Cấu trúc

```
registration/
├── registration.module.ts        # Module definition
├── registration.service.ts       # Business logic
├── registration.service.spec.ts  # Unit tests
├── teams.controller.ts           # Teams endpoints
├── players.controller.ts         # Players endpoints
└── dto/
    ├── player.dto.ts
    └── team.dto.ts
```

## Module Dependencies

```typescript
@Module({
  imports: [PrismaModule, RegulationModule],
  controllers: [TeamsController, PlayersController],
  providers: [RegistrationService],
})
```

- **RegulationModule** — dynamic age validation via `RegulationHelper`

## API Endpoints

### Teams

| Method   | Endpoint         | Role   | Mô tả                  |
| -------- | ---------------- | ------ | ---------------------- |
| `GET`    | `/api/teams`     | Public | Lấy danh sách đội bóng |
| `GET`    | `/api/teams/:id` | Public | Chi tiết đội           |
| `POST`   | `/api/teams`     | ADMIN  | Tạo đội mới            |
| `PATCH`  | `/api/teams/:id` | ADMIN  | Cập nhật thông tin đội |
| `DELETE` | `/api/teams/:id` | ADMIN  | Xóa đội                |

### Players

| Method   | Endpoint           | Role                | Mô tả                 |
| -------- | ------------------ | ------------------- | --------------------- |
| `GET`    | `/api/players`     | Public              | Lấy danh sách cầu thủ |
| `GET`    | `/api/players/:id` | Public              | Chi tiết cầu thủ      |
| `POST`   | `/api/players`     | ADMIN, TEAM_MANAGER | Tạo cầu thủ mới       |
| `PATCH`  | `/api/players/:id` | ADMIN, TEAM_MANAGER | Cập nhật cầu thủ      |
| `DELETE` | `/api/players/:id` | ADMIN               | Xóa cầu thủ           |

## Player Age Validation (Regulation-based)

Age limits are queried dynamically from the regulations table via `RegulationHelper`:

```typescript
const minAge = await this.regulationHelper.getNumericValue(
  dto.seasonId,
  'MIN_AGE',
  16,
);
const maxAge = await this.regulationHelper.getNumericValue(
  dto.seasonId,
  'MAX_AGE',
  40,
);
```

- If `seasonId` is provided in `CreatePlayerDto`, season-specific age limits are used
- If `seasonId` is null/undefined, defaults from `DEFAULT_REGULATIONS` are used (16–40)
- Age is calculated from `dob` at time of creation

## Key DTOs

### CreatePlayerDto

| Field         | Type   | Required | Description                      |
| ------------- | ------ | -------- | -------------------------------- |
| `fullName`    | string | ✅       | Họ và tên                        |
| `dob`         | string | ✅       | Ngày sinh (ISO 8601)             |
| `nationality` | string | ✅       | Quốc tịch                        |
| `position`    | enum   | ✅       | GK, DF, MF, FW                   |
| `playerType`  | enum   | —        | DOMESTIC (default) or FOREIGN    |
| `teamId`      | UUID   | —        | ID đội bóng                      |
| `seasonId`    | UUID   | —        | ID mùa giải (for age regulation) |

## Testing

```bash
npx jest registration.service.spec --verbose
```

Test coverage includes:

- Team CRUD operations
- Player creation with age validation (default limits)
- Player creation with season-specific age limits (regulation-based)
- Fallback to defaults when no seasonId provided
- Edge cases (exact min/max age, too young, too old)

## Swagger

Tham khảo Swagger docs tại: `http://localhost:8080/docs#/Teams` và `http://localhost:8080/docs#/Players`

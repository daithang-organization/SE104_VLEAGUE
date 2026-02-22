# Roster Module

Quản lý danh sách cầu thủ của từng đội bóng (Team-Player relationship).

## Cấu trúc

```
roster/
├── dto/
│   ├── index.ts
│   └── roster.dto.ts
├── index.ts
├── roster.controller.ts
├── roster.module.ts
├── roster.service.ts
├── roster.service.spec.ts
└── README.md
```

## Module Dependencies

```typescript
@Module({
  imports: [PrismaModule, RegulationModule],
  controllers: [RosterController],
  providers: [RosterService],
  exports: [RosterService],
})
```

- **RegulationModule** — dynamic roster/foreign player limits via `RegulationHelper`

## API Endpoints

| Method   | Endpoint                              | Role                | Mô tả                     |
| -------- | ------------------------------------- | ------------------- | ------------------------- |
| `GET`    | `/api/teams/:teamId/roster`           | Public              | Xem danh sách cầu thủ đội |
| `POST`   | `/api/teams/:teamId/roster`           | ADMIN, TEAM_MANAGER | Thêm cầu thủ vào đội      |
| `PATCH`  | `/api/teams/:teamId/roster/:playerId` | ADMIN, TEAM_MANAGER | Cập nhật (số áo, etc.)    |
| `DELETE` | `/api/teams/:teamId/roster/:playerId` | ADMIN, TEAM_MANAGER | Xóa cầu thủ khỏi đội      |

## Business Rules (Regulation-based)

Roster limits are queried dynamically from the regulations table via `RegulationHelper`:

```typescript
const maxRoster = await this.regulationHelper.getNumericValue(
  dto.seasonId,
  'MAX_ROSTER',
  22,
);
const maxForeign = await this.regulationHelper.getNumericValue(
  dto.seasonId,
  'MAX_FOREIGN_PLAYERS',
  3,
);
```

| Rule            | Default | Regulation Key        | Description                             |
| --------------- | ------- | --------------------- | --------------------------------------- |
| Max roster size | 22      | `MAX_ROSTER`          | Reject if active players ≥ limit        |
| Foreign limit   | 3       | `MAX_FOREIGN_PLAYERS` | Reject if FOREIGN players ≥ limit       |
| Unique jersey   | —       | —                     | Số áo phải unique trong đội             |
| One team only   | —       | —                     | Cầu thủ chỉ thuộc 1 đội tại 1 thời điểm |
| Soft delete     | —       | —                     | Đánh dấu `leftAt` thay vì xóa record    |

> If `seasonId` is provided in `AddPlayerToRosterDto`, season-specific limits are used. Otherwise, defaults from `DEFAULT_REGULATIONS` apply.

## Key DTOs

### AddPlayerToRosterDto

| Field          | Type | Required | Description                         |
| -------------- | ---- | -------- | ----------------------------------- |
| `playerId`     | UUID | ✅       | ID cầu thủ                          |
| `jerseyNumber` | int  | —        | Số áo (1–99)                        |
| `seasonId`     | UUID | —        | ID mùa giải (for roster regulation) |

## Testing

```bash
npx jest roster.service.spec --verbose
```

Test coverage includes:

- Get team roster
- Add player with default limits
- Roster size limit enforcement
- Foreign player limit enforcement
- Season-specific roster limits (regulation-based)
- Season-specific foreign limits (regulation-based)
- Duplicate jersey number rejection

## Swagger

Tham khảo Swagger docs tại: `http://localhost:8080/docs#/Roster`

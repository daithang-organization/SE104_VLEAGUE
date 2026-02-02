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
└── README.md
```

## API Endpoints

| Method | Endpoint | Role | Mô tả |
|--------|----------|------|-------|
| `GET` | `/api/teams/:teamId/roster` | Public | Xem danh sách cầu thủ của đội |
| `POST` | `/api/teams/:teamId/roster` | ADMIN, TEAM_MANAGER | Thêm cầu thủ vào đội |
| `PATCH` | `/api/teams/:teamId/roster/:playerId` | ADMIN, TEAM_MANAGER | Cập nhật (số áo, etc.) |
| `DELETE` | `/api/teams/:teamId/roster/:playerId` | ADMIN, TEAM_MANAGER | Xóa cầu thủ khỏi đội |

## Data Model

```typescript
model TeamPlayer {
  id           String    @id @default(uuid())
  teamId       String
  playerId     String
  jerseyNumber Int?      // Số áo
  joinedAt     DateTime  // Ngày gia nhập
  leftAt       DateTime? // Ngày rời khỏi (null = còn trong đội)

  @@unique([teamId, playerId])
}
```

## Business Rules

1. Một cầu thủ chỉ có thể thuộc **một đội** tại một thời điểm
2. Số áo phải **duy nhất** trong phạm vi đội
3. Khi xóa cầu thủ khỏi đội: đánh dấu `leftAt` thay vì xóa record

## Request Examples

### Thêm cầu thủ vào đội
```json
POST /api/teams/{teamId}/roster
{
  "playerId": "player-uuid",
  "jerseyNumber": 10
}
```

### Response
```json
{
  "teamId": "team-uuid",
  "teamName": "Hà Nội FC",
  "count": 25,
  "players": [
    {
      "id": "uuid",
      "playerId": "player-uuid",
      "fullName": "Nguyễn Quang Hải",
      "position": "MF",
      "jerseyNumber": 19,
      "joinedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## Swagger

Tham khảo Swagger docs tại: `http://localhost:8080/docs#/Roster`

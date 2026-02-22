# Standings Module

Bảng xếp hạng tự động tính toán, danh sách vua phá lưới, thống kê thẻ phạt và thống kê đội.

## Cấu trúc

```
standings/
├── index.ts
├── standings.controller.ts
├── standings.module.ts
├── standings.service.ts
├── standings.service.spec.ts
└── README.md
```

## API Endpoints

| Method | Endpoint                      | Role   | Mô tả                  |
| ------ | ----------------------------- | ------ | ---------------------- |
| `GET`  | `/api/standings`              | Public | BXH mùa giải hiện tại  |
| `GET`  | `/api/standings?seasonId=xxx` | Public | BXH theo mùa giải      |
| `GET`  | `/api/standings/top-scorers`  | Public | Danh sách vua phá lưới |
| `GET`  | `/api/standings/card-stats`   | Public | Thống kê thẻ phạt      |
| `GET`  | `/api/standings/team-stats`   | Public | Thống kê đội bóng      |

## Auto-Recalculation

Standings are automatically recalculated when a match transitions to `FINISHED`:

```
MatchService.updateStatus(matchId, 'FINISHED')
  → validates scores are set
  → updates match status
  → calls StandingsService.getStandings(seasonId)  ← auto-trigger
```

This means standings are always up-to-date after every completed match.

## Tính điểm

| Kết quả | Điểm   |
| ------- | ------ |
| Thắng   | 3 điểm |
| Hòa     | 1 điểm |
| Thua    | 0 điểm |

**Tiêu chí xếp hạng** (theo thứ tự ưu tiên):

1. Điểm số
2. Hiệu số bàn thắng
3. Số bàn thắng ghi được
4. Tên đội (alphabet)

## Response Format

```json
{
  "position": 1,
  "teamId": "uuid",
  "teamName": "Hà Nội FC",
  "played": 10,
  "won": 7,
  "drawn": 2,
  "lost": 1,
  "goalsFor": 20,
  "goalsAgainst": 8,
  "goalDifference": 12,
  "points": 23
}
```

## Swagger

Tham khảo Swagger docs tại: `http://localhost:8080/docs#/Standings`

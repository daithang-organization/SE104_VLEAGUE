# Match Module

Module quản lý thông tin và sự kiện trận đấu trong hệ thống VLeague.

## Mục đích

Cung cấp đầy đủ chức năng quản lý trận đấu:
- CRUD operations cho matches
- Ghi nhận các sự kiện trong trận (goals, cards, substitutions)
- Quản lý kết quả và thống kê
- Real-time match updates

## Cấu trúc

```
match/
├── match.module.ts           # Module definition
├── match.controller.ts       # Match management endpoints
├── match.service.ts          # Match business logic
└── dto/                      # Data Transfer Objects
    ├── add-match-event.dto.ts
    └── match-response.dto.ts
```

## Components

### `match.module.ts`
Định nghĩa Match module và dependencies.

**Imports:**
- `PrismaModule` - Database access
- `AuthModule` - Authentication (nếu cần)

**Exports:**
- `MatchService` - Để modules khác sử dụng

### `match.controller.ts`
HTTP endpoints cho match management.

**Endpoints:**
- `GET /matches` - Lấy danh sách matches (có filter, pagination)
- `GET /matches/:id` - Lấy thông tin chi tiết match
- `POST /matches` - Tạo match mới
- `PATCH /matches/:id` - Cập nhật match info
- `DELETE /matches/:id` - Xóa match
- `POST /matches/:id/events` - Thêm sự kiện trong match
- `GET /matches/:id/events` - Lấy danh sách events của match
- `GET /matches/:id/stats` - Lấy thống kê match

### `match.service.ts`
Business logic cho match management.

**Methods:**
- `create()` - Tạo match mới
- `findAll()` - Lấy danh sách matches với filters
- `findOne()` - Lấy chi tiết một match
- `update()` - Cập nhật match
- `delete()` - Xóa match
- `addEvent()` - Thêm match event (goal, card, etc.)
- `getEvents()` - Lấy events của match
- `calculateStats()` - Tính toán thống kê

### DTOs

#### `add-match-event.dto.ts`
Định nghĩa structure cho match events.

**Fields:**
- `type` - Loại event (GOAL, YELLOW_CARD, RED_CARD, SUBSTITUTION)
- `minute` - Phút xảy ra event
- `playerId` - ID cầu thủ liên quan
- `teamId` - ID đội bóng
- `description` - Mô tả chi tiết

#### `match-response.dto.ts`
Định nghĩa response structure cho match data.

**Fields:**
- Match basic info
- Teams info
- Score
- Status
- Events list
- Statistics

## Match Entity

Typical match structure:
```typescript
{
  id: string,
  homeTeamId: string,
  awayTeamId: string,
  homeScore: number,
  awayScore: number,
  matchDate: Date,
  venue: string,
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED',
  round: number,
  season: string,
  events: MatchEvent[]
}
```

## Match Events

Các loại events được hỗ trợ:
- **GOAL** - Bàn thắng
- **OWN_GOAL** - Phản lưới nhà
- **YELLOW_CARD** - Thẻ vàng
- **RED_CARD** - Thẻ đỏ
- **SUBSTITUTION** - Thay người
- **KICKOFF** - Bắt đầu trận
- **HALFTIME** - Kết thúc hiệp 1
- **FULLTIME** - Kết thúc trận

## Match Status Flow

```
SCHEDULED → LIVE → FINISHED
          ↓
      POSTPONED
```

## Usage Examples

### Tạo match mới
```typescript
POST /matches
{
  "homeTeamId": "team-1",
  "awayTeamId": "team-2",
  "matchDate": "2026-02-15T15:00:00Z",
  "venue": "Sân Mỹ Đình",
  "round": 1,
  "season": "2026"
}
```

### Thêm goal event
```typescript
POST /matches/:id/events
{
  "type": "GOAL",
  "minute": 23,
  "playerId": "player-123",
  "teamId": "team-1",
  "description": "Header from corner kick"
}
```

### Lọc matches
```typescript
GET /matches?status=LIVE&season=2026&round=5
```

## Business Rules

1. **Match Creation:**
   - homeTeam ≠ awayTeam
   - matchDate phải trong tương lai
   - Không được schedule 2 matches cùng venue cùng thời điểm

2. **Match Events:**
   - Chỉ thêm events khi status = LIVE
   - minute phải hợp lệ (0-90+)
   - playerId phải thuộc team tương ứng

3. **Score Calculation:**
   - Auto-update score khi có GOAL event
   - Subtract khi có OWN_GOAL

## Statistics

Các thống kê được tính:
- Possession percentage
- Shots on target
- Corners
- Fouls
- Cards
- Pass accuracy

## Real-time Updates (Future)

Có thể extend với WebSocket hoặc SSE để:
- Push live score updates
- Notify khi có events mới
- Update match statistics real-time

## Testing

```bash
# Run match tests
pnpm test match

# Test scenarios
- Create match
- Add events
- Calculate scores
- Validate business rules
```

## Performance Considerations

- Index trên `matchDate`, `status`, `season`
- Pagination cho danh sách matches
- Cache cho frequently accessed matches
- Optimize events query với proper relations

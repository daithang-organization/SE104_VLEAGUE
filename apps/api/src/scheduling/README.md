# Scheduling Module

Module quản lý lịch thi đấu (scheduling) cho các trận đấu trong hệ thống VLeague.

## Mục đích

Cung cấp chức năng:
- Tạo lịch thi đấu cho mùa giải
- Sắp xếp trận đấu tối ưu
- Phân bổ sân vận động
- Tránh conflict về thời gian và địa điểm
- Tuân thủ các quy định về lịch thi đấu

## Cấu trúc

```
scheduling/
├── scheduling.module.ts         # Module definition
├── scheduling.controller.ts     # Scheduling endpoints
└── scheduling.service.ts        # Scheduling logic & algorithms
```

## Components

### `scheduling.module.ts`
Định nghĩa Scheduling module.

**Imports:**
- `PrismaModule` - Database access
- `MatchModule` - Tạo matches
- `RegistrationModule` - Lấy thông tin teams

**Exports:**
- `SchedulingService`

### `scheduling.controller.ts`
HTTP endpoints cho scheduling operations.

**Endpoints:**
- `POST /scheduling/generate` - Generate lịch cho mùa giải
- `GET /scheduling/preview` - Preview lịch trước khi confirm
- `POST /scheduling/optimize` - Tối ưu lại lịch hiện tại
- `GET /scheduling/conflicts` - Kiểm tra conflicts
- `PATCH /scheduling/matches/:id/reschedule` - Đổi lịch một trận
- `GET /scheduling/statistics` - Thống kê về lịch thi đấu

### `scheduling.service.ts`
Core business logic và algorithms.

**Methods:**
- `generateSeasonSchedule()` - Tạo lịch cho cả mùa
- `roundRobinScheduling()` - Algorithm round-robin
- `allocateVenues()` - Phân bổ sân vận động
- `checkConflicts()` - Kiểm tra conflicts
- `optimizeSchedule()` - Tối ưu hóa lịch
- `rescheduleMatch()` - Đổi lịch một trận
- `validateSchedule()` - Validate lịch thi đấu

## Scheduling Algorithms

### Round-Robin Algorithm
Đảm bảo mỗi đội gặp mọi đội khác:
```
Round 1: Team1 vs Team2, Team3 vs Team4, ...
Round 2: Team1 vs Team3, Team2 vs Team4, ...
...
```

**Đặc điểm:**
- N teams → N-1 rounds (lượt đi)
- N-1 rounds nữa cho lượt về
- Mỗi round: N/2 matches

### Home-Away Balance
```typescript
// Luân phiên sân nhà/sân khách
- Round 1: A (home) vs B (away)
- Round N: B (home) vs A (away)
```

### Constraints

1. **Hard Constraints (bắt buộc):**
   - Không đội nào đá 2 trận trong vòng 48h
   - Không 2 trận cùng sân cùng thời gian
   - Mỗi đội tối đa 3 trận liên tiếp sân nhà/sân khách

2. **Soft Constraints (ưu tiên):**
   - Cân bằng sân nhà/khách
   - Tránh đá xa liên tiếp
   - Derby matches vào thời điểm prime-time
   - Rest period tối ưu giữa các trận

## Scheduling Parameters

```typescript
{
  season: string,              // "2026"
  startDate: Date,             // Ngày bắt đầu mùa giải
  endDate: Date,               // Ngày kết thúc
  matchDayIntervals: number[], // [3, 7] days between matches
  preferredDays: string[],     // ["Saturday", "Sunday"]
  preferredTime: string[],     // ["15:00", "19:00"]
  blackoutDates: Date[],       // Ngày không thể đá (holidays)
  venues: Venue[]              // Danh sách sân khả dụng
}
```

## Conflict Detection

### Time Conflicts
```typescript
// Check overlapping matches
- Same team playing within 48h
- Same venue at same time
- Travel time không đủ cho away matches
```

### Venue Conflicts
```typescript
// Check venue availability
- Venue maintenance schedule
- Other events at venue
- Capacity requirements
```

### Team Conflicts
```typescript
// Check team constraints
- International duty dates
- Too many home/away consecutively
- Insufficient rest period
```

## Schedule Generation Flow

```
1. Lấy danh sách teams cho season
2. Generate round-robin matches
3. Assign dates dựa trên parameters
4. Allocate venues
5. Check conflicts
6. Optimize nếu có conflicts
7. Return schedule hoặc conflicts
```

## Usage Examples

### Generate lịch mùa giải
```typescript
POST /scheduling/generate
{
  "season": "2026",
  "startDate": "2026-03-01",
  "endDate": "2026-11-30",
  "matchDayIntervals": [7],
  "preferredDays": ["Saturday", "Sunday"],
  "preferredTimes": ["15:00", "19:00"]
}
```

### Preview trước khi confirm
```typescript
GET /scheduling/preview?season=2026

Response:
{
  "totalMatches": 182,
  "rounds": 26,
  "conflicts": [],
  "schedule": [...]
}
```

### Reschedule một trận
```typescript
PATCH /scheduling/matches/:id/reschedule
{
  "newDate": "2026-04-15T15:00:00Z",
  "newVenue": "venue-id-123",
  "reason": "Weather conditions"
}
```

## Optimization Strategies

### 1. Travel Distance Minimization
- Sắp xếp away matches gần nhau về mặt địa lý
- Tránh di chuyển xa liên tiếp

### 2. Rest Period Optimization
- Đảm bảo rest period đủ giữa các trận
- Ưu tiên rest dài hơn sau away matches

### 3. Broadcast Optimization
- Prime matches vào thời gian vàng
- Derby matches vào weekend
- Spread big matches throughout season

### 4. Fairness
- Cân bằng số trận home/away
- Đảm bảo mọi đội có điều kiện tương đương

## Special Cases

### Derby Matches
```typescript
// Các trận derby cần special handling
{
  matchType: "DERBY",
  priority: "HIGH",
  preferredTime: "Weekend primetime",
  securityRequirements: true
}
```

### Season Finale
```typescript
// Vòng cuối cùng
- Tất cả matches cùng ngày/giờ
- Đảm bảo công bằng
```

## Validation Rules

1. **Schedule Validity:**
   - Tất cả teams phải có số trận đấu bằng nhau
   - Home/away balance
   - Không có time conflicts

2. **Business Rules:**
   - Tuân thủ league regulations
   - Venue capacity đủ cho expected attendance
   - Broadcasting requirements

## Integration

- **Match Module:** Tạo actual match records
- **Registration Module:** Validate teams
- **Notification System:** Thông báo schedule changes

## Performance Considerations

- Scheduling generation có thể mất thời gian
- Use background jobs cho large schedules
- Cache generated schedules
- Incremental optimization thay vì full regeneration

## Testing

```bash
# Run scheduling tests
pnpm test scheduling

# Test scenarios
- Generate schedule for 14 teams
- Detect time conflicts
- Optimize schedule with constraints
- Reschedule match
- Validate round-robin correctness
```

## Monitoring & Logging

- Log schedule generation time
- Track conflicts frequency
- Monitor rescheduling requests
- Alert on constraint violations

## Future Enhancements

- Machine learning cho optimization
- Weather integration
- TV ratings consideration
- Fan attendance prediction
- Multi-objective optimization

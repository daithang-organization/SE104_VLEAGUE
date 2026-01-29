# Registration Module

Module quản lý đăng ký và thông tin của đội bóng, cầu thủ trong hệ thống VLeague.

## Mục đích

Cung cấp chức năng quản lý:
- Đăng ký đội bóng mới
- Quản lý danh sách cầu thủ
- Đăng ký cầu thủ vào đội
- Chuyển nhượng cầu thủ
- Quản lý thông tin đội và cầu thủ

## Cấu trúc

```
registration/
├── registration.module.ts       # Module definition
├── registration.service.ts      # Business logic
├── teams.controller.ts          # Teams management endpoints
└── players.controller.ts        # Players management endpoints
```

## Components

### `registration.module.ts`
Định nghĩa Registration module.

**Imports:**
- `PrismaModule` - Database access
- `AuthModule` - Authentication & authorization

**Controllers:**
- `TeamsController` - Teams endpoints
- `PlayersController` - Players endpoints

**Providers:**
- `RegistrationService` - Shared business logic

**Exports:**
- `RegistrationService` - Để modules khác sử dụng

### `teams.controller.ts`
HTTP endpoints cho quản lý đội bóng.

**Endpoints:**
- `GET /teams` - Lấy danh sách đội bóng
- `GET /teams/:id` - Lấy thông tin chi tiết đội
- `POST /teams` - Đăng ký đội bóng mới
- `PATCH /teams/:id` - Cập nhật thông tin đội
- `DELETE /teams/:id` - Xóa đội
- `GET /teams/:id/players` - Lấy danh sách cầu thủ của đội
- `GET /teams/:id/stats` - Thống kê của đội

### `players.controller.ts`
HTTP endpoints cho quản lý cầu thủ.

**Endpoints:**
- `GET /players` - Lấy danh sách cầu thủ
- `GET /players/:id` - Lấy thông tin chi tiết cầu thủ
- `POST /players` - Đăng ký cầu thủ mới
- `PATCH /players/:id` - Cập nhật thông tin cầu thủ
- `DELETE /players/:id` - Xóa cầu thủ
- `POST /players/:id/transfer` - Chuyển nhượng cầu thủ
- `GET /players/:id/stats` - Thống kê của cầu thủ

### `registration.service.ts`
Business logic cho registration operations.

**Methods:**
- `registerTeam()` - Đăng ký đội mới
- `updateTeam()` - Cập nhật thông tin đội
- `registerPlayer()` - Đăng ký cầu thủ mới
- `transferPlayer()` - Chuyển nhượng cầu thủ
- `validateTeamRegistration()` - Validate đăng ký đội
- `validatePlayerRegistration()` - Validate đăng ký cầu thủ
- `checkEligibility()` - Kiểm tra tư cách thi đấu

## Team Entity

Typical team structure:
```typescript
{
  id: string,
  name: string,
  shortName: string,
  logo: string,
  foundedYear: number,
  stadium: string,
  city: string,
  coach: string,
  website: string,
  players: Player[],
  registrationDate: Date,
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
}
```

## Player Entity

Typical player structure:
```typescript
{
  id: string,
  firstName: string,
  lastName: string,
  dateOfBirth: Date,
  nationality: string,
  position: 'GK' | 'DF' | 'MF' | 'FW',
  jerseyNumber: number,
  teamId: string,
  joinDate: Date,
  contractEnd: Date,
  status: 'ACTIVE' | 'INJURED' | 'SUSPENDED' | 'TRANSFERRED'
}
```

## Business Rules

### Team Registration
1. **Tên đội:**
   - Phải unique
   - Tối thiểu 3 ký tự
   - Không chứa ký tự đặc biệt

2. **Đội hình:**
   - Tối thiểu 18 cầu thủ
   - Tối đa 30 cầu thủ
   - Ít nhất 2 thủ môn

3. **Sân nhà:**
   - Phải đáp ứng tiêu chuẩn
   - Capacity tối thiểu

### Player Registration
1. **Tuổi:**
   - Tối thiểu 16 tuổi
   - U21 cho giải trẻ

2. **Số áo:**
   - Từ 1-99
   - Unique trong đội
   - Số 1 thường cho thủ môn

3. **Quốc tịch:**
   - Giới hạn số ngoại binh
   - Tùy theo quy định giải

4. **Hợp đồng:**
   - Phải còn hiệu lực
   - Không được đăng ký cho 2 đội cùng lúc

### Player Transfer
1. **Transfer Window:**
   - Chỉ trong thời gian chuyển nhượng
   - Mùa đông và mùa hè

2. **Eligibility:**
   - Đã hoàn thành hợp đồng cũ
   - Không bị cấm thi đấu
   - Qua kiểm tra y tế

3. **Documentation:**
   - International Transfer Certificate (nếu từ nước ngoài)
   - Clear all dues với club cũ

## Validation

### Team Validation
```typescript
{
  name: string (required, min: 3, max: 100),
  shortName: string (required, max: 20),
  foundedYear: number (max: currentYear),
  stadium: string (required),
  coach: string (required)
}
```

### Player Validation
```typescript
{
  firstName: string (required, min: 2),
  lastName: string (required, min: 2),
  dateOfBirth: Date (required, age >= 16),
  position: enum (required),
  jerseyNumber: number (required, 1-99),
  teamId: string (required, exists)
}
```

## Usage Examples

### Đăng ký đội mới
```typescript
POST /teams
{
  "name": "Hoàng Anh Gia Lai",
  "shortName": "HAGL",
  "foundedYear": 2001,
  "stadium": "Sân Pleiku",
  "city": "Pleiku",
  "coach": "Kiatisuk Senamuang"
}
```

### Đăng ký cầu thủ
```typescript
POST /players
{
  "firstName": "Nguyễn",
  "lastName": "Văn A",
  "dateOfBirth": "2000-05-15",
  "nationality": "Vietnam",
  "position": "MF",
  "jerseyNumber": 10,
  "teamId": "team-id-123"
}
```

### Chuyển nhượng
```typescript
POST /players/:id/transfer
{
  "newTeamId": "team-id-456",
  "transferFee": 100000,
  "contractEnd": "2027-12-31"
}
```

## Authorization

- `GET` endpoints: Public hoặc authenticated users
- `POST /teams`: Admin, League Manager
- `PATCH /teams`: Admin, Team Manager
- `POST /players`: Admin, Team Manager
- `POST /players/:id/transfer`: Admin, Team Manager

## Statistics

Thống kê có thể bao gồm:
- Số trận đã đấu
- Bàn thắng/thua
- Thẻ vàng/đỏ
- Phút thi đấu
- Goals/Assists (cho cầu thủ)

## Integration với các modules khác

- **Match Module:** Kiểm tra tư cách thi đấu
- **Scheduling Module:** Validate teams cho matches
- **Auth Module:** Phân quyền quản lý

## Testing

```bash
# Run registration tests
pnpm test registration

# Test scenarios
- Register team with valid data
- Register team with duplicate name (should fail)
- Register player under 16 (should fail)
- Transfer player during transfer window
- Transfer player outside window (should fail)
```

## Performance

- Index trên `teamId`, `jerseyNumber` cho players
- Cache danh sách teams (ít thay đổi)
- Pagination cho danh sách players
- Optimize queries với proper relations

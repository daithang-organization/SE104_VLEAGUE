# Stadium Module

Quản lý sân vận động cho các trận đấu VLeague.

## Cấu trúc

```
stadium/
├── dto/
│   ├── index.ts
│   ├── create-stadium.dto.ts
│   └── update-stadium.dto.ts
├── index.ts
├── stadium.controller.ts
├── stadium.module.ts
├── stadium.service.ts
└── README.md
```

## API Endpoints

| Method | Endpoint | Role | Mô tả |
|--------|----------|------|-------|
| `GET` | `/api/stadiums` | Public | Lấy danh sách sân vận động |
| `GET` | `/api/stadiums/:id` | Public | Lấy chi tiết sân (bao gồm đội sân nhà) |
| `POST` | `/api/stadiums` | ADMIN | Tạo sân mới |
| `PATCH` | `/api/stadiums/:id` | ADMIN | Cập nhật thông tin sân |
| `DELETE` | `/api/stadiums/:id` | ADMIN | Xóa sân |

## Data Model

```typescript
model Stadium {
  id       String  @id @default(uuid())
  name     String  @unique  // "Sân Mỹ Đình"
  city     String           // "Hà Nội"
  capacity Int?             // 40000

  teams    Team[]   // Đội sân nhà
  matches  Match[]  // Các trận đấu diễn ra tại đây
}
```

## Usage

```typescript
// In your module
import { StadiumModule } from './stadium/stadium.module';

@Module({
  imports: [StadiumModule],
})
export class AppModule {}
```

## Swagger

Tham khảo Swagger docs tại: `http://localhost:8080/docs#/Stadiums`

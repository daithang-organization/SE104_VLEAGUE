# Season Module

Quản lý mùa giải (VLeague 2024, VLeague 2025, v.v.)

## Cấu trúc

```
season/
├── dto/
│   ├── index.ts
│   ├── create-season.dto.ts
│   └── update-season.dto.ts
├── index.ts
├── season.controller.ts
├── season.module.ts
├── season.service.ts
└── README.md
```

## API Endpoints

| Method | Endpoint | Role | Mô tả |
|--------|----------|------|-------|
| `GET` | `/api/seasons` | Public | Lấy danh sách mùa giải |
| `GET` | `/api/seasons/current` | Public | Lấy mùa giải hiện tại (IN_PROGRESS) |
| `GET` | `/api/seasons/:id` | Public | Lấy chi tiết mùa giải |
| `POST` | `/api/seasons` | ADMIN | Tạo mùa giải mới |
| `PATCH` | `/api/seasons/:id` | ADMIN | Cập nhật mùa giải |
| `DELETE` | `/api/seasons/:id` | ADMIN | Xóa mùa giải |

## Data Model

```typescript
model Season {
  id        String       @id @default(uuid())
  name      String       @unique  // "VLeague 2024"
  year      Int
  status    SeasonStatus // UPCOMING | IN_PROGRESS | COMPLETED
  startDate DateTime?
  endDate   DateTime?
  matches   Match[]
}
```

## Usage

```typescript
// In your module
import { SeasonModule } from './season/season.module';

@Module({
  imports: [SeasonModule],
})
export class AppModule {}
```

## Swagger

Tham khảo Swagger docs tại: `http://localhost:8080/docs#/Seasons`

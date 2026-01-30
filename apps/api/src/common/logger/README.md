# VLeague API Logging System

Hệ thống logging chuyên nghiệp cho VLeague API sử dụng [nestjs-pino](https://github.com/iamolegga/nestjs-pino) + [pino](https://github.com/pinojs/pino).

## Tính năng

### ✅ Log có màu sắc, dễ đọc (Development)
```
INFO  [12:34:56.789] [Bootstrap] 🚀 Application started successfully
INFO  [12:34:56.790] [Bootstrap] 📍 Server running on: http://localhost:3000
INFO  [12:34:56.791] [HTTP] GET /api/teams completed
DEBUG [12:34:56.792] [RequestPerformance] ➡️  [GET] /api/teams → TeamsController.findAll()
INFO  [12:34:56.890] [RequestPerformance] ⬅️  [GET] /api/teams 🟢 98ms
```

### ✅ JSON logs cho Production
```json
{"level":30,"time":1706620496789,"msg":"GET /api/teams completed","context":"HTTP","req":{"id":"abc-123","method":"GET","url":"/api/teams"},"res":{"statusCode":200}}
```

### ✅ Request ID tracking
- Tự động tạo UUID cho mỗi request
- Hỗ trợ `x-request-id` header từ client/gateway
- Đính kèm trong error response

### ✅ Performance monitoring
- Đo thời gian xử lý của mỗi request
- Hiển thị indicator: 🟢 (<100ms) 🟡 (<500ms) 🔴 (>500ms)

### ✅ Security
- Tự động ẩn sensitive data: `authorization`, `password`, `cookie`

## Sử dụng trong Code

### Inject Logger vào Service/Controller

```typescript
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);

  async create(dto: CreateTeamDto) {
    this.logger.log(`Creating team: ${dto.name}`);
    
    try {
      const team = await this.prisma.team.create({ data: dto });
      this.logger.log(`Team created successfully: ${team.id}`);
      return team;
    } catch (error) {
      this.logger.error(`Failed to create team: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

### Log Levels

| Level | Method | Khi nào dùng |
|-------|--------|--------------|
| `error` | `logger.error()` | Lỗi nghiêm trọng cần fix ngay |
| `warn` | `logger.warn()` | Cảnh báo, có thể xử lý được |
| `log/info` | `logger.log()` | Thông tin quan trọng (default) |
| `debug` | `logger.debug()` | Chi tiết để debug |
| `verbose` | `logger.verbose()` | Chi tiết tối đa |

### Sử dụng PinoLogger (Khuyến nghị)

```typescript
import { Injectable } from '@nestjs/common';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';

@Injectable()
export class TeamsService {
  constructor(
    @InjectPinoLogger(TeamsService.name)
    private readonly logger: PinoLogger,
  ) {}

  async findAll() {
    // Có thể log object để dễ search trong ELK/CloudWatch
    this.logger.info({ action: 'findAll', count: 10 }, 'Fetching all teams');
  }
}
```

## Cấu hình

### Environment Variables

| Variable | Default | Mô tả |
|----------|---------|-------|
| `NODE_ENV` | `development` | `production` = JSON logs, `development` = pretty logs |
| `LOG_LEVEL` | `debug` (dev) / `info` (prod) | Log level tối thiểu |

### Tùy chỉnh trong LoggerModule

Chỉnh sửa file `src/common/logger/logger.module.ts`:

```typescript
// Thêm routes không muốn log
autoLogging: {
  ignore: (req) => {
    const ignorePaths = ['/health', '/favicon.ico', '/metrics'];
    return ignorePaths.includes(req.url || '');
  },
},

// Thêm fields cần ẩn
redact: {
  paths: [
    'req.headers.authorization',
    'req.body.password',
    'req.body.creditCard',  // Thêm field mới
  ],
},
```

## Output Samples

### Request thành công
```
INFO  [14:30:15.123] [HTTP] GET /api/teams completed
DEBUG [14:30:15.100] [RequestPerformance] ➡️  [GET] /api/teams → TeamsController.findAll()
INFO  [14:30:15.123] [RequestPerformance] ⬅️  [GET] /api/teams 🟢 23ms
```

### Request lỗi validation
```
WARN  [14:30:45.456] [HttpExceptionFilter] [POST] /api/teams - 400 - VALIDATION_ERROR: Dữ liệu không hợp lệ
```

### Request lỗi server
```
ERROR [14:31:00.789] [HttpExceptionFilter] Unhandled exception: Connection refused
    at PrismaService.connect (...)
    at ...
ERROR [14:31:00.790] [HttpExceptionFilter] [GET] /api/teams - 500 - INTERNAL_ERROR: Đã xảy ra lỗi không mong muốn
```

## Tips

1. **Luôn dùng context/class name** để dễ filter log
2. **Log action + result** cho các business operation quan trọng
3. **Dùng `debug` level** cho chi tiết internal, sẽ tự động bị ẩn ở production
4. **Log error với stack trace**: `logger.error(message, error.stack)`

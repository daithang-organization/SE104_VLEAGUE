# Source Code Directory

Thư mục chính chứa toàn bộ source code của API server.

## Cấu trúc

```
src/
├── main.ts                    # Application entry point
├── app.module.ts              # Root module
├── app.controller.ts          # Root controller
├── app.controller.spec.ts     # Root controller tests
├── app.service.ts             # Root service
│
├── auth/                      # Authentication & Authorization module
├── match/                     # Match management module
├── prisma/                    # Prisma service module
├── registration/              # Team & Player registration module
└── scheduling/                # Match scheduling module
```

## Mô tả

### Core Files

#### `main.ts`
Entry point của ứng dụng NestJS.

**Vai trò:**
- Bootstrap NestJS application
- Configure CORS
- Setup global pipes, filters, interceptors
- Start HTTP server

#### `app.module.ts`
Root module của ứng dụng.

**Vai trò:**
- Import tất cả feature modules
- Configure global providers
- Setup module dependencies

#### `app.controller.ts` & `app.service.ts`
Root controller và service.

**Vai trò:**
- Health check endpoint
- Application metadata endpoints
- Basic application-level logic

### Feature Modules

Mỗi feature module được tổ chức theo pattern:
```
<module-name>/
├── <module>.module.ts       # Module definition
├── <module>.controller.ts   # HTTP endpoints
├── <module>.service.ts      # Business logic
└── dto/                     # Data Transfer Objects (optional)
```

#### `auth/`
Module xử lý authentication và authorization.

**Chức năng:**
- User login/logout
- JWT token generation & validation
- Role-based access control
- Password hashing

**Chi tiết:** [auth/README.md](./auth/README.md)

#### `match/`
Module quản lý trận đấu.

**Chức năng:**
- CRUD operations cho matches
- Match events (goals, cards, substitutions)
- Match statistics
- Live match updates

**Chi tiết:** [match/README.md](./match/README.md)

#### `prisma/`
Module wrapper cho Prisma Client.

**Chức năng:**
- Provide Prisma service as injectable dependency
- Handle database connections
- Manage connection lifecycle

**Chi tiết:** [prisma/README.md](./prisma/README.md)

#### `registration/`
Module quản lý đăng ký đội bóng và cầu thủ.

**Chức năng:**
- Team registration & management
- Player registration & management
- Player transfers
- Team rosters

**Chi tiết:** [registration/README.md](./registration/README.md)

#### `scheduling/`
Module quản lý lịch thi đấu.

**Chức năng:**
- Create match schedules
- Schedule optimization
- Venue assignment
- Schedule conflicts detection

**Chi tiết:** [scheduling/README.md](./scheduling/README.md)

## Module Organization Best Practices

### Controller
- Handle HTTP requests/responses
- Validate input data (using DTOs)
- Call service methods
- Return appropriate status codes

### Service
- Contain business logic
- Interact with database (via Prisma)
- Handle data transformations
- Throw appropriate exceptions

### Module
- Import required modules
- Export providers for other modules
- Configure module-specific settings

### DTO (Data Transfer Objects)
- Define request/response shapes
- Validation decorators
- Type safety

## Testing

Test files follow the pattern: `<name>.spec.ts`

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run test coverage
pnpm test:cov
```

## Adding New Features

1. Generate new module:
   ```bash
   nest g module <module-name>
   nest g controller <module-name>
   nest g service <module-name>
   ```

2. Create DTOs in `dto/` folder

3. Implement business logic in service

4. Add routes in controller

5. Write tests

6. Import module in `app.module.ts`

## Lưu ý

- **Tuân thủ** NestJS module pattern
- **Separation of concerns**: Controllers ≠ Services
- **DTOs** cho mọi input/output
- **Dependency Injection** thay vì direct imports
- **Error handling** với NestJS exceptions

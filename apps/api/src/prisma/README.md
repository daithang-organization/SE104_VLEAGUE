# Prisma Module

Module wrapper cung cấp Prisma Client như một NestJS injectable service.

## Mục đích

- Tạo centralized Prisma service cho toàn bộ ứng dụng
- Manage database connection lifecycle
- Provide type-safe database access
- Reusable across all modules

## Cấu trúc

```
prisma/
├── prisma.module.ts     # Module definition & exports
└── prisma.service.ts    # Prisma Client service
```

## Components

### `prisma.module.ts`
Định nghĩa Prisma module.

**Providers:**
- `PrismaService` - Instance của Prisma Client

**Exports:**
- `PrismaService` - Để các modules khác có thể inject

**Global:**
- Có thể đánh dấu `@Global()` để tránh import nhiều lần

### `prisma.service.ts`
Service class extends `PrismaClient`.

**Lifecycle Hooks:**
- `onModuleInit()` - Connect to database khi module initialize
- `onModuleDestroy()` - Disconnect khi application shutdown

**Implementation:**
```typescript
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
```

## Usage trong các modules khác

### 1. Import PrismaModule
```typescript
@Module({
  imports: [PrismaModule],
  controllers: [TeamsController],
  providers: [TeamsService],
})
export class TeamsModule {}
```

### 2. Inject PrismaService
```typescript
@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.team.findMany();
  }

  async create(data: CreateTeamDto) {
    return this.prisma.team.create({ data });
  }
}
```

## Database Operations

PrismaService cung cấp full access đến Prisma Client API:

### CRUD Operations
```typescript
// Create
await this.prisma.team.create({ data: {...} });

// Read
await this.prisma.team.findMany();
await this.prisma.team.findUnique({ where: { id } });

// Update
await this.prisma.team.update({ where: { id }, data: {...} });

// Delete
await this.prisma.team.delete({ where: { id } });
```

### Relations
```typescript
// Include relations
await this.prisma.team.findMany({
  include: {
    players: true,
    matches: true,
  }
});

// Select specific fields
await this.prisma.team.findMany({
  select: {
    id: true,
    name: true,
    players: { select: { name: true } }
  }
});
```

### Transactions
```typescript
await this.prisma.$transaction([
  this.prisma.team.create({ data: teamData }),
  this.prisma.player.create({ data: playerData }),
]);

// Or with callback
await this.prisma.$transaction(async (tx) => {
  const team = await tx.team.create({ data: teamData });
  await tx.player.create({
    data: { ...playerData, teamId: team.id }
  });
});
```

### Raw Queries (khi cần)
```typescript
await this.prisma.$queryRaw`SELECT * FROM teams WHERE...`;
await this.prisma.$executeRaw`UPDATE teams SET...`;
```

## Connection Management

### Connection Pool
Prisma tự động quản lý connection pool:
- Default pool size dựa trên database URL
- Configure trong `schema.prisma`:
  ```prisma
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }
  ```

### Graceful Shutdown
```typescript
// Trong main.ts
const app = await NestFactory.create(AppModule);
const prismaService = app.get(PrismaService);
await prismaService.enableShutdownHooks(app);
```

## Error Handling

Prisma throws specific errors:
```typescript
import { Prisma } from '@prisma/client';

try {
  await this.prisma.team.create({ data });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      throw new ConflictException('Record already exists');
    }
  }
  throw error;
}
```

**Common Error Codes:**
- `P2002` - Unique constraint violation
- `P2025` - Record not found
- `P2003` - Foreign key constraint failed

## Type Safety

Prisma provides full TypeScript support:
```typescript
import { Team, Player } from '@prisma/client';

// Type-safe query
const teams: Team[] = await this.prisma.team.findMany();

// Type-safe with relations
type TeamWithPlayers = Team & { players: Player[] };
```

## Middleware (nếu cần)

```typescript
// Trong PrismaService
constructor() {
  super();

  this.$use(async (params, next) => {
    // Logging
    console.log(`Query: ${params.model}.${params.action}`);
    return next(params);
  });
}
```

## Best Practices

- ✅ Luôn handle Prisma errors properly
- ✅ Use transactions cho multi-step operations
- ✅ Leverage TypeScript types từ Prisma Client
- ✅ Use `select` và `include` để optimize queries
- ✅ Index các columns thường query
- ❌ Không expose raw Prisma errors đến client
- ❌ Tránh N+1 query problem (use `include`)

## Testing

Mock PrismaService trong tests:
```typescript
const mockPrismaService = {
  team: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
};

beforeEach(async () => {
  const module = await Test.createTestingModule({
    providers: [
      TeamsService,
      { provide: PrismaService, useValue: mockPrismaService },
    ],
  }).compile();
});
```

## Monitoring

- Connection count
- Query performance
- Error rates
- Use Prisma Studio cho development debugging

import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { PrismaHealthIndicator } from './prisma.health';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
    private prisma: PrismaHealthIndicator,
    private configService: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check application readiness status' })
  check() {
    return this.checkReadiness();
  }

  @Get('ready')
  @HealthCheck()
  @ApiOperation({ summary: 'Check readiness dependencies' })
  checkReadiness() {
    return this.health.check([
      () => this.prisma.isHealthy('database'),
      () => this.memory.checkHeap('memory_heap', this.getHeapLimitBytes()),
    ]);
  }

  @Get('live')
  @ApiOperation({ summary: 'Check process liveness' })
  checkLiveness() {
    return {
      status: 'ok',
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }

  private getHeapLimitBytes() {
    const configuredMb = Number(this.configService.get('HEALTH_HEAP_LIMIT_MB'));
    const heapLimitMb =
      Number.isFinite(configuredMb) && configuredMb > 0 ? configuredMb : 512;

    return heapLimitMb * 1024 * 1024;
  }
}

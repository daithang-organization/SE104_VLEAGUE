import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { LoggerModule } from './common/logger';
import { HealthModule } from './health/health.module';
import { MatchModule } from './match/match.module';
import { NotificationModule } from './notification/notification.module';
import { PrismaModule } from './prisma/prisma.module';
import { RegistrationModule } from './registration/registration.module';
import { RegulationModule } from './regulation/regulation.module';
import { RosterModule } from './roster/roster.module';
import { SchedulingModule } from './scheduling/scheduling.module';
import { SearchModule } from './search/search.module';
import { SeasonModule } from './season/season.module';
import { StadiumModule } from './stadium/stadium.module';
import { StandingsModule } from './standings/standings.module';
import { UploadModule } from './upload/upload.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // In-memory cache - TTL 60 seconds, max 100 items
    CacheModule.register({
      ttl: 60000,
      max: 100,
      isGlobal: true,
    }),
    // Rate limiting - default: 100 requests per 60 seconds
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'default',
          ttl: 60000, // 60 seconds
          limit: 100, // 100 requests
        },
        {
          name: 'short',
          ttl: 1000, // 1 second
          limit: 20, // 20 requests
        },
        {
          name: 'medium',
          ttl: 10000, // 10 seconds
          limit: 50, // 50 requests
        },
        {
          name: 'long',
          ttl: 60000, // 60 seconds
          limit: 30, // 30 requests (for login/register)
        },
      ],
    }),
    LoggerModule,
    PrismaModule,
    HealthModule,
    AuthModule,
    RegistrationModule,
    SchedulingModule,
    MatchModule,
    // New modules
    SeasonModule,
    StadiumModule,
    StandingsModule,
    RosterModule,
    RegulationModule,
    UsersModule,
    UploadModule,
    // v1.2.0 modules
    SearchModule,
    AuditModule,
    NotificationModule,
  ],
  providers: [
    // Apply throttler globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

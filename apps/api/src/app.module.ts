import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { LoggerModule } from './common/logger';
import { MatchModule } from './match/match.module';
import { PrismaModule } from './prisma/prisma.module';
import { RegistrationModule } from './registration/registration.module';
import { RosterModule } from './roster/roster.module';
import { SchedulingModule } from './scheduling/scheduling.module';
import { SeasonModule } from './season/season.module';
import { StadiumModule } from './stadium/stadium.module';
import { StandingsModule } from './standings/standings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Rate limiting - default: 10 requests per 60 seconds
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'default',
          ttl: 60000, // 60 seconds
          limit: 10, // 10 requests
        },
        {
          name: 'short',
          ttl: 1000, // 1 second
          limit: 3, // 3 requests
        },
        {
          name: 'medium',
          ttl: 10000, // 10 seconds
          limit: 5, // 5 requests
        },
        {
          name: 'long',
          ttl: 60000, // 60 seconds
          limit: 5, // 5 requests (for login/register)
        },
      ],
    }),
    LoggerModule,
    PrismaModule,
    AuthModule,
    RegistrationModule,
    SchedulingModule,
    MatchModule,
    // New modules
    SeasonModule,
    StadiumModule,
    StandingsModule,
    RosterModule,
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

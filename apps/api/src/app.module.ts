import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { LoggerModule } from './common/logger';
import { HealthModule } from './health/health.module';
import { MatchLineupModule } from './match-lineup/match-lineup.module';
import { MatchOfficialModule } from './match-official/match-official.module';
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
import { TeamManagerModule } from './team-manager/team-manager.module';
import { TeamInvitationModule } from './team-invitation/team-invitation.module';
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
    LoggerModule,
    PrismaModule,
    HealthModule,
    AuthModule,
    RegistrationModule,
    SchedulingModule,
    MatchModule,
    MatchLineupModule,
    MatchOfficialModule,
    // New modules
    SeasonModule,
    StadiumModule,
    StandingsModule,
    RosterModule,
    RegulationModule,
    UsersModule,
    UploadModule,
    TeamManagerModule,
    TeamInvitationModule,
    // v1.2.0 modules
    SearchModule,
    AuditModule,
    NotificationModule,
  ],
})
export class AppModule {}

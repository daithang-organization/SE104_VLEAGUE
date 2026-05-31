import { Module } from '@nestjs/common';
import { NotificationModule } from '../notification/notification.module';
import { PrismaModule } from '../prisma/prisma.module';
import { RegulationModule } from '../regulation/regulation.module';
import { TeamManagerModule } from '../team-manager/team-manager.module';
import { MatchLineupController } from './match-lineup.controller';
import { MatchLineupService } from './match-lineup.service';

@Module({
  imports: [
    PrismaModule,
    RegulationModule,
    TeamManagerModule,
    NotificationModule,
  ],
  controllers: [MatchLineupController],
  providers: [MatchLineupService],
  exports: [MatchLineupService],
})
export class MatchLineupModule {}

import { Module } from '@nestjs/common';
import { MatchLineupModule } from '../match-lineup/match-lineup.module';
import { NotificationModule } from '../notification/notification.module';
import { PrismaModule } from '../prisma/prisma.module';
import { RegulationModule } from '../regulation/regulation.module';
import { StandingsModule } from '../standings/standings.module';
import { MatchController } from './match.controller';
import { MatchGateway } from './match.gateway';
import { MatchService } from './match.service';

@Module({
  imports: [
    PrismaModule,
    StandingsModule,
    RegulationModule,
    NotificationModule,
    MatchLineupModule,
  ],
  controllers: [MatchController],
  providers: [MatchService, MatchGateway],
  exports: [MatchService],
})
export class MatchModule {}

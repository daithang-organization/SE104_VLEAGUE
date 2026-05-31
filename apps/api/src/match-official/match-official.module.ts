import { Module } from '@nestjs/common';
import { MatchLineupModule } from '../match-lineup/match-lineup.module';
import { NotificationModule } from '../notification/notification.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MatchOfficialController } from './match-official.controller';
import { MatchOfficialService } from './match-official.service';

@Module({
  imports: [PrismaModule, NotificationModule, MatchLineupModule],
  controllers: [MatchOfficialController],
  providers: [MatchOfficialService],
  exports: [MatchOfficialService],
})
export class MatchOfficialModule {}

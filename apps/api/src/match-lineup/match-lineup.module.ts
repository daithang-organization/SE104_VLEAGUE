import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RegulationModule } from '../regulation/regulation.module';
import { MatchLineupController } from './match-lineup.controller';
import { MatchLineupService } from './match-lineup.service';

@Module({
  imports: [PrismaModule, RegulationModule],
  controllers: [MatchLineupController],
  providers: [MatchLineupService],
  exports: [MatchLineupService],
})
export class MatchLineupModule {}

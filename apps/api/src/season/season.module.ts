import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RegulationModule } from '../regulation/regulation.module';
import { SeasonTeamController } from './season-team.controller';
import { SeasonController } from './season.controller';
import { SeasonService } from './season.service';

@Module({
  imports: [PrismaModule, RegulationModule],
  controllers: [SeasonController, SeasonTeamController],
  providers: [SeasonService],
  exports: [SeasonService],
})
export class SeasonModule {}

import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SeasonTeamController } from './season-team.controller';
import { SeasonController } from './season.controller';
import { SeasonService } from './season.service';

@Module({
  imports: [PrismaModule],
  controllers: [SeasonController, SeasonTeamController],
  providers: [SeasonService],
  exports: [SeasonService],
})
export class SeasonModule {}

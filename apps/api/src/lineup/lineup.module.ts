import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LineupController } from './lineup.controller';
import { LineupService } from './lineup.service';

@Module({
  imports: [PrismaModule],
  controllers: [LineupController],
  providers: [LineupService],
  exports: [LineupService],
})
export class LineupModule {}

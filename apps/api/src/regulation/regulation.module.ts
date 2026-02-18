import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RegulationController } from './regulation.controller';
import { RegulationService } from './regulation.service';

@Module({
  imports: [PrismaModule],
  controllers: [RegulationController],
  providers: [RegulationService],
  exports: [RegulationService],
})
export class RegulationModule {}

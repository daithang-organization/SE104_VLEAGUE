import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RegulationController } from './regulation.controller';
import { RegulationHelper } from './regulation.helper';
import { RegulationService } from './regulation.service';

@Module({
  imports: [PrismaModule],
  controllers: [RegulationController],
  providers: [RegulationService, RegulationHelper],
  exports: [RegulationService, RegulationHelper],
})
export class RegulationModule {}

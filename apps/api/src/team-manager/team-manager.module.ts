import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TeamManagerController } from './team-manager.controller';
import { TeamManagerService } from './team-manager.service';

@Module({
  imports: [PrismaModule],
  controllers: [TeamManagerController],
  providers: [TeamManagerService],
})
export class TeamManagerModule {}

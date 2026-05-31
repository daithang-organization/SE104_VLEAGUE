import { Module } from '@nestjs/common';
import { NotificationModule } from '../notification/notification.module';
import { PrismaModule } from '../prisma/prisma.module';
import { TeamManagerController } from './team-manager.controller';
import { TeamManagerScopeService } from './team-manager-scope.service';
import { TeamManagerService } from './team-manager.service';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [TeamManagerController],
  providers: [TeamManagerService, TeamManagerScopeService],
  exports: [TeamManagerScopeService],
})
export class TeamManagerModule {}

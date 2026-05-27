import { Module } from '@nestjs/common';
import { NotificationModule } from '../notification/notification.module';
import { StandingsModule } from '../standings/standings.module';
import { TeamInvitationController } from './team-invitation.controller';
import { TeamInvitationService } from './team-invitation.service';

@Module({
  imports: [NotificationModule, StandingsModule],
  controllers: [TeamInvitationController],
  providers: [TeamInvitationService],
  exports: [TeamInvitationService],
})
export class TeamInvitationModule {}

import { Module } from '@nestjs/common';
import { NotificationModule } from '../notification/notification.module';
import { TeamInvitationController } from './team-invitation.controller';
import { TeamInvitationService } from './team-invitation.service';

@Module({
  imports: [NotificationModule],
  controllers: [TeamInvitationController],
  providers: [TeamInvitationService],
  exports: [TeamInvitationService],
})
export class TeamInvitationModule {}

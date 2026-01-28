import { Module } from '@nestjs/common';
import { PlayersController } from './players.controller';
import { RegistrationService } from './registration.service';
import { TeamsController } from './teams.controller';

@Module({
  controllers: [TeamsController, PlayersController],
  providers: [RegistrationService],
})
export class RegistrationModule {}

import { Module } from '@nestjs/common';
import { TeamsController } from './teams.controller';
import { PlayersController } from './players.controller';
import { RegistrationService } from './registration.service';

@Module({
  controllers: [TeamsController, PlayersController],
  providers: [RegistrationService],
})
export class RegistrationModule {}

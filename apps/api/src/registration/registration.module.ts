import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RegulationModule } from '../regulation/regulation.module';
import { TeamManagerModule } from '../team-manager/team-manager.module';
import { PlayersImportController } from './players-import.controller';
import { PlayersController } from './players.controller';
import { RegistrationService } from './registration.service';
import { TeamsController } from './teams.controller';

@Module({
  imports: [PrismaModule, RegulationModule, TeamManagerModule],
  controllers: [TeamsController, PlayersController, PlayersImportController],
  providers: [RegistrationService],
})
export class RegistrationModule {}

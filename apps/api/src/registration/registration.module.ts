import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RegulationModule } from '../regulation/regulation.module';
import { PlayersController } from './players.controller';
import { RegistrationService } from './registration.service';
import { TeamsController } from './teams.controller';

@Module({
  imports: [PrismaModule, RegulationModule],
  controllers: [TeamsController, PlayersController],
  providers: [RegistrationService],
})
export class RegistrationModule {}

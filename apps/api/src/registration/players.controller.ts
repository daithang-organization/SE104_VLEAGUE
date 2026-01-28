import { Controller, Get } from '@nestjs/common';
import { RegistrationService } from './registration.service';

@Controller()
export class PlayersController {
  constructor(private readonly reg: RegistrationService) {}

  @Get('/players')
  getPlayers() {
    return this.reg.listPlayers();
  }
}

import { Controller, Get } from '@nestjs/common';
import { RegistrationService } from './registration.service';

@Controller()
export class PlayersController {
  constructor(private readonly reg: RegistrationService) {}

  @Get('/players')
  async getPlayers() {
    return await this.reg.listPlayers();
  }
}

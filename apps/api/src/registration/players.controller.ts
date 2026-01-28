import { Controller, Get } from '@nestjs/common';
import { RegistrationService } from './registration.service';

@Controller()
export class PlayersController {
  constructor(private readonly reg: RegistrationService) {}

  @Get('/players')
  async getPlayers(): Promise<
    Awaited<ReturnType<typeof this.reg.listPlayers>>
  > {
    return await this.reg.listPlayers();
  }
}

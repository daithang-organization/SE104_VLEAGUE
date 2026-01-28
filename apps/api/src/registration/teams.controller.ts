import { Controller, Get } from '@nestjs/common';
import { RegistrationService } from './registration.service';

@Controller()
export class TeamsController {
  constructor(private readonly reg: RegistrationService) {}

  @Get('/teams')
  async getTeams(): Promise<Awaited<ReturnType<typeof this.reg.listTeams>>> {
    return await this.reg.listTeams();
  }
}

import { Controller, Get } from '@nestjs/common';
import { RegistrationService } from './registration.service';

@Controller()
export class TeamsController {
  constructor(private readonly reg: RegistrationService) {}

  @Get('/teams')
  getTeams() {
    return this.reg.listTeams();
  }
}

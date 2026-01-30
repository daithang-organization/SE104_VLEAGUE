import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard, Roles, Role } from '../auth';
import { RegistrationService } from './registration.service';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeamsController {
  constructor(private readonly reg: RegistrationService) {}

  @Get('/teams')
  @Roles(Role.ADMIN, Role.TEAM_MANAGER)
  async getTeams(): Promise<Awaited<ReturnType<typeof this.reg.listTeams>>> {
    return await this.reg.listTeams();
  }
}

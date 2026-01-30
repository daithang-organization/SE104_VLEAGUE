import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard, Roles, Role } from '../auth';
import { SchedulingService } from './scheduling.service';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchedulingController {
  constructor(private readonly scheduling: SchedulingService) {}

  @Post('/schedule/generate')
  @Roles(Role.ADMIN)
  generate() {
    return this.scheduling.generateStub();
  }

  @Post('/schedule/publish')
  @Roles(Role.ADMIN)
  publish() {
    return this.scheduling.publishStub();
  }

  @Get('/schedule')
  @Roles(Role.ADMIN, Role.TEAM_MANAGER, Role.REFEREE)
  getSchedule() {
    return this.scheduling.getSchedule();
  }
}

import { Controller, Get, Post } from '@nestjs/common';
import { SchedulingService } from './scheduling.service';

@Controller()
export class SchedulingController {
  constructor(private readonly scheduling: SchedulingService) {}

  @Post('/schedule/generate')
  generate() {
    return this.scheduling.generateStub();
  }

  @Post('/schedule/publish')
  publish() {
    return this.scheduling.publishStub();
  }

  @Get('/schedule')
  getSchedule() {
    return this.scheduling.getSchedule();
  }
}

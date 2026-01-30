import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard, Roles, Role } from '../auth';
import { MatchService } from './match.service';
import type { AddMatchEventDto } from './dto/add-match-event.dto';

@Controller('matches')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MatchController {
  constructor(private readonly match: MatchService) {}

  // GET /matches/{id} - all authenticated roles can view
  @Get(':id')
  @Roles(Role.ADMIN, Role.TEAM_MANAGER, Role.REFEREE)
  getById(@Param('id') id: string) {
    return this.match.getMatchById(id);
  }

  // POST /matches/{id}/events - only ADMIN & REFEREE can add events
  @Post(':id/events')
  @Roles(Role.ADMIN, Role.REFEREE)
  addEvent(@Param('id') id: string, @Body() dto: AddMatchEventDto) {
    return this.match.addEvent(id, dto);
  }
}

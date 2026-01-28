import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MatchService } from './match.service';
import type { AddMatchEventDto } from './dto/add-match-event.dto';

@Controller('matches')
export class MatchController {
  constructor(private readonly match: MatchService) {}

  // GET /matches/{id} (stub)
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.match.getMatchById(id);
  }

  // POST /matches/{id}/events (stub)
  @Post(':id/events')
  addEvent(@Param('id') id: string, @Body() dto: AddMatchEventDto) {
    return this.match.addEvent(id, dto);
  }
}

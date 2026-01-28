import { Injectable } from '@nestjs/common';
import type { AddMatchEventDto } from './dto/add-match-event.dto';

@Injectable()
export class MatchService {
  getMatchById(id: string) {
    // Sprint 0 stub
    return {
      id,
      roundNo: null,
      kickoffAt: null,
      status: 'DRAFT',
      homeTeamId: null,
      awayTeamId: null,
      homeScore: null,
      awayScore: null,
      events: [],
    };
  }

  addEvent(matchId: string, dto: AddMatchEventDto) {
    // Sprint 0 stub: just echo back
    return {
      ok: true,
      matchId,
      createdEvent: {
        id: `evt-${Date.now()}`,
        ...dto,
      },
    };
  }
}

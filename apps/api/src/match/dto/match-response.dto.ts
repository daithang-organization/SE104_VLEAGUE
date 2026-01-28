export type MatchStatus = 'DRAFT' | 'PUBLISHED' | 'LOCKED';

export type MatchEventDto = {
  id: string;
  minute: number;
  type: string;
  playerId?: string;
  teamId?: string;
  note?: string;
};

export type MatchResponseDto = {
  id: string;
  roundNo: number | null;
  kickoffAt: string | null;
  status: MatchStatus;
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeScore: number | null;
  awayScore: number | null;
  events: MatchEventDto[];
};

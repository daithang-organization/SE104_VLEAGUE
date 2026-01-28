export type MatchEventType =
  | 'GOAL'
  | 'YELLOW_CARD'
  | 'RED_CARD'
  | 'SUBSTITUTION';

export type AddMatchEventDto = {
  minute: number;
  type: MatchEventType;
  playerId?: string;
  teamId?: string;
  note?: string;
};

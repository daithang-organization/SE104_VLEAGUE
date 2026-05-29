import type { AddMatchEventPayload, Match, MatchEvent } from '../../services/matchApi';

export type ScoringEventType = 'GOAL' | 'PENALTY' | 'OWN_GOAL';

export type ScoringEventInput = {
  type: MatchEvent['type'] | AddMatchEventPayload['type'];
  teamId?: string | null;
};

export const SCORING_EVENT_TYPES: ScoringEventType[] = ['GOAL', 'PENALTY', 'OWN_GOAL'];

export function isScoringEventType(type: MatchEvent['type'] | AddMatchEventPayload['type']) {
  return SCORING_EVENT_TYPES.includes(type as ScoringEventType);
}

export function getScoringSide(
  event: ScoringEventInput,
  match: Pick<Match, 'homeTeamId' | 'awayTeamId'>,
) {
  if (!event.teamId) return null;
  if ((event.type === 'GOAL' || event.type === 'PENALTY') && event.teamId === match.homeTeamId) {
    return 'home';
  }
  if ((event.type === 'GOAL' || event.type === 'PENALTY') && event.teamId === match.awayTeamId) {
    return 'away';
  }
  if (event.type === 'OWN_GOAL' && event.teamId === match.homeTeamId) return 'away';
  if (event.type === 'OWN_GOAL' && event.teamId === match.awayTeamId) return 'home';
  return null;
}

export function calculateReportScore(
  events: ScoringEventInput[],
  match: Pick<Match, 'homeTeamId' | 'awayTeamId'>,
) {
  return events.reduce(
    (score, event) => {
      const side = getScoringSide(event, match);
      if (side) score[side] += 1;
      return score;
    },
    { home: 0, away: 0 },
  );
}

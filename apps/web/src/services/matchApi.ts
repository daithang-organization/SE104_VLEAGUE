import { api } from '../lib/api';

// ─────────── Types ───────────
export type MatchEvent = {
  id: string;
  minute: number;
  type: 'GOAL' | 'OWN_GOAL' | 'YELLOW_CARD' | 'RED_CARD' | 'SUBSTITUTION';
  goalType?: string | null;
  playerId?: string | null;
  player?: { id: string; fullName: string } | null;
  teamId?: string | null;
  team?: { id: string; name: string } | null;
  relatedPlayerId?: string | null;
  relatedPlayer?: { id: string; fullName: string } | null;
  note?: string | null;
};

export type Match = {
  id: string;
  roundNo: number;
  leg: number;
  seasonId?: string | null;
  season?: { id: string; name: string } | null;
  homeTeamId: string;
  awayTeamId: string;
  homeTeam?: { id: string; name: string };
  awayTeam?: { id: string; name: string };
  homeScore?: number | null;
  awayScore?: number | null;
  stadiumId?: string | null;
  stadium?: { id: string; name: string } | null;
  kickoffAt?: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'LOCKED' | 'FINISHED' | 'POSTPONED';
  events?: MatchEvent[];
  createdAt: string;
  updatedAt: string;
};

export type AddMatchEventPayload = {
  minute: number;
  type: 'GOAL' | 'OWN_GOAL' | 'YELLOW_CARD' | 'RED_CARD' | 'SUBSTITUTION';
  playerId?: string;
  teamId?: string;
  note?: string;
};

// ─────────── API calls ───────────
export function apiGetMatches(seasonId?: string) {
  const params = seasonId ? `?seasonId=${seasonId}` : '';
  return api.get<Match[]>(`/matches${params}`).then((res) => res.data);
}

export function apiGetMatch(id: string) {
  return api.get<Match>(`/matches/${id}`).then((res) => res.data);
}

export function apiAddMatchEvent(matchId: string, data: AddMatchEventPayload) {
  return api
    .post<{
      ok: boolean;
      matchId: string;
      createdEvent: MatchEvent;
    }>(`/matches/${matchId}/events`, data)
    .then((res) => res.data);
}

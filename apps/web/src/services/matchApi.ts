import { api } from '../lib/api';

// ─────────── Types ───────────
export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
export type MatchEvent = {
  id: string;
  minute: number;
  type:
    | 'GOAL'
    | 'OWN_GOAL'
    | 'PENALTY'
    | 'PENALTY_MISS'
    | 'YELLOW_CARD'
    | 'RED_CARD'
    | 'SUBSTITUTION';
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
  homeTeam?: { id: string; name: string; logoUrl?: string | null };
  awayTeam?: { id: string; name: string; logoUrl?: string | null };
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
  type:
    | 'GOAL'
    | 'OWN_GOAL'
    | 'PENALTY'
    | 'PENALTY_MISS'
    | 'YELLOW_CARD'
    | 'RED_CARD'
    | 'SUBSTITUTION';
  playerId?: string;
  teamId: string;
  note?: string;
  goalType?: string;
  relatedPlayerId?: string;
};

export type RosterPlayer = {
  id: string;
  playerId: string;
  fullName: string;
  position: string;
  jerseyNumber?: number | null;
};

export type TeamRoster = {
  teamId: string;
  teamName: string;
  count: number;
  players: RosterPlayer[];
};

// ─────────── API calls ───────────
export function apiGetMatches(seasonId?: string, page = 1, limit = 20) {
  const params: Record<string, string | number> = { page, limit };
  if (seasonId) params.seasonId = seasonId;
  return api.get<PaginatedResponse<Match>>('/matches', { params }).then((res) => res.data);
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

export function apiRemoveMatchEvent(matchId: string, eventId: string) {
  return api.delete(`/matches/${matchId}/events/${eventId}`).then((res) => res.data);
}

export function apiGetTeamRoster(teamId: string) {
  return api.get<TeamRoster>(`/teams/${teamId}/roster`).then((res) => res.data);
}

export function apiUpdateMatch(
  matchId: string,
  data: {
    stadiumId?: string | null;
    kickoffAt?: string | null;
    homeScore?: number | null;
    awayScore?: number | null;
  },
) {
  return api.patch<Match>(`/matches/${matchId}`, data).then((res) => res.data);
}

export function apiUpdateMatchStatus(matchId: string, status: string) {
  return api.patch<Match>(`/matches/${matchId}/status`, { status }).then((res) => res.data);
}

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
  homeTeam?: { id: string; name: string; shortName?: string | null; logoUrl?: string | null };
  awayTeam?: { id: string; name: string; shortName?: string | null; logoUrl?: string | null };
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
  nationality?: string | null;
  dob?: string | null;
  jerseyNumber?: number | null;
};

export type TeamRoster = {
  teamId: string;
  teamName: string;
  count: number;
  players: RosterPlayer[];
};

export type MatchKitType = 'PRIMARY' | 'BACKUP';
export type MatchLineupRole = 'STARTER' | 'SUBSTITUTE';
export type MatchLineupStatus = 'SUBMITTED' | 'APPROVED' | 'REJECTED';
export type PlayerPosition = 'GK' | 'DF' | 'MF' | 'FW';

export type SubmitMatchLineupPlayerPayload = {
  playerId: string;
  role: MatchLineupRole;
  position?: PlayerPosition;
  shirtNumber?: number;
};

export type SubmitMatchLineupPayload = {
  teamId: string;
  kitType: MatchKitType;
  formation: string;
  players: SubmitMatchLineupPlayerPayload[];
};

export type ReviewMatchLineupPayload = {
  status: Extract<MatchLineupStatus, 'APPROVED' | 'REJECTED'>;
  reviewNote?: string;
};

export type MatchLineupPlayer = {
  id: string;
  registrationId: string;
  playerId: string;
  role: MatchLineupRole;
  position?: PlayerPosition | null;
  shirtNumber?: number | null;
  player?: {
    id: string;
    fullName: string;
    position: string;
    playerType?: 'DOMESTIC' | 'FOREIGN' | string;
    nationality?: string | null;
  } | null;
};

export type MatchTeamLineup = {
  id: string;
  matchId: string;
  teamId: string;
  kitType: MatchKitType;
  formation: string;
  status: MatchLineupStatus;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  reviewNote?: string | null;
  team?: { id: string; name: string; shortName?: string | null; logoUrl?: string | null } | null;
  lineupPlayers?: MatchLineupPlayer[];
};

export type MatchSuspension = {
  id: string;
  playerId: string;
  teamId: string;
  seasonId: string;
  sourceMatchId: string;
  effectiveMatchId: string;
  reason: string;
  status: 'ACTIVE' | 'SERVED' | 'CANCELLED' | string;
  servedAt?: string | null;
  createdAt?: string;
  player?: { id: string; fullName: string } | null;
  team?: { id: string; name: string } | null;
  sourceMatch?: { id: string; roundNo: number } | null;
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

export function apiGetMatchLineups(matchId: string) {
  return api.get<MatchTeamLineup[]>(`/matches/${matchId}/lineups`).then((res) => res.data);
}

export function apiSubmitMatchLineup(matchId: string, data: SubmitMatchLineupPayload) {
  return api.post<MatchTeamLineup>(`/matches/${matchId}/lineups`, data).then((res) => res.data);
}

export function apiReviewMatchLineup(
  matchId: string,
  teamId: string,
  data: ReviewMatchLineupPayload,
) {
  return api
    .patch<MatchTeamLineup>(`/matches/${matchId}/lineups/${teamId}/review`, data)
    .then((res) => res.data);
}

export function apiGetMatchSuspensions(matchId: string) {
  return api.get<MatchSuspension[]>(`/matches/${matchId}/suspensions`).then((res) => res.data);
}

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
  source?: string | null;
};

export type Match = {
  id: string;
  roundNo: number;
  leg: number;
  seasonId?: string | null;
  season?: { id: string; name: string } | null;
  homeTeamId: string;
  awayTeamId: string;
  homeTeam?: {
    id: string;
    name: string;
    shortName?: string | null;
    logoUrl?: string | null;
    coachName?: string | null;
    status?: 'ACTIVE' | 'INACTIVE';
  };
  awayTeam?: {
    id: string;
    name: string;
    shortName?: string | null;
    logoUrl?: string | null;
    coachName?: string | null;
    status?: 'ACTIVE' | 'INACTIVE';
  };
  homeScore?: number | null;
  awayScore?: number | null;
  scoreSource?: 'ADMIN' | 'REFEREE' | null;
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

export type OfficialStatus = 'ACTIVE' | 'INACTIVE';
export type AccountRole = 'ADMIN' | 'TEAM_MANAGER' | 'REFEREE' | 'SUPERVISOR' | 'PUBLIC';
export type MatchOfficialRole =
  | 'MAIN_REFEREE'
  | 'ASSISTANT_REFEREE'
  | 'FOURTH_OFFICIAL'
  | 'SUPERVISOR';

export type Official = {
  id: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  status: OfficialStatus;
  accountRole?: AccountRole | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateOfficialPayload = {
  fullName: string;
  email?: string;
  phone?: string;
};

export type AssignMatchOfficialPayload = {
  officialId: string;
  role: MatchOfficialRole;
  note?: string;
};

export type MatchOfficialAssignment = {
  id: string;
  matchId: string;
  officialId: string;
  role: MatchOfficialRole;
  publishedAt?: string;
  note?: string | null;
  official?: Official | null;
};

export type SubmitMatchReportPayload = {
  homeScore: number;
  awayScore: number;
  bestPlayerId?: string;
  technicalStats?: Record<string, unknown>;
  note?: string;
  events?: AddMatchEventPayload[];
};

export type MatchReport = {
  id: string;
  matchId: string;
  submittedByUserId?: string | null;
  homeScore: number;
  awayScore: number;
  bestPlayerId?: string | null;
  bestPlayer?: { id: string; fullName: string } | null;
  technicalStats?: Record<string, unknown> | null;
  note?: string | null;
  submittedAt?: string;
};

export type SubmitDisciplineReportPayload = {
  supervisorId: string;
  organizationRating: string;
  refereeIssues?: string;
  playerIssues?: string;
  organizerIssues?: string;
  notes?: string;
  sendToDisciplinary?: boolean;
};

export type DisciplineReport = {
  id: string;
  matchId: string;
  supervisorId: string;
  supervisor?: Official | null;
  organizationRating: string;
  refereeIssues?: string | null;
  playerIssues?: string | null;
  organizerIssues?: string | null;
  notes?: string | null;
  sentToDisciplinaryAt?: string | null;
  submittedAt?: string;
};

// ─────────── API calls ───────────
export function apiGetMatches(seasonId?: string, page = 1, limit = 20) {
  const params: Record<string, string | number> = { page, limit };
  if (seasonId) params.seasonId = seasonId;
  return api.get<PaginatedResponse<Match>>('/matches', { params }).then((res) => res.data);
}

export function apiGetAssignedMatches(seasonId?: string, page = 1, limit = 20) {
  const params: Record<string, string | number> = { page, limit };
  if (seasonId) params.seasonId = seasonId;
  return api
    .get<PaginatedResponse<Match>>('/matches/assigned-to-me', { params })
    .then((res) => res.data);
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

export function apiUpdateMatchEvent(matchId: string, eventId: string, data: AddMatchEventPayload) {
  return api
    .patch<{
      ok: boolean;
      matchId: string;
      updatedEvent: MatchEvent;
    }>(`/matches/${matchId}/events/${eventId}`, data)
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

export function apiGetOfficials() {
  return api.get<Official[]>('/officials').then((res) => res.data);
}

export function apiCreateOfficial(data: CreateOfficialPayload) {
  return api.post<Official>('/officials', data).then((res) => res.data);
}

export function apiGetMatchOfficials(matchId: string) {
  return api
    .get<MatchOfficialAssignment[]>(`/matches/${matchId}/officials`)
    .then((res) => res.data);
}

export function apiAssignMatchOfficial(matchId: string, data: AssignMatchOfficialPayload) {
  return api
    .post<MatchOfficialAssignment>(`/matches/${matchId}/officials`, data)
    .then((res) => res.data);
}

export function apiRemoveMatchOfficial(matchId: string, assignmentId: string) {
  return api
    .delete<{ success: boolean }>(`/matches/${matchId}/officials/${assignmentId}`)
    .then((res) => res.data);
}

export function apiSubmitMatchReport(matchId: string, data: SubmitMatchReportPayload) {
  return api.post<MatchReport>(`/matches/${matchId}/report`, data).then((res) => res.data);
}

export function apiGetMatchReport(matchId: string) {
  return api.get<MatchReport | null>(`/matches/${matchId}/report`).then((res) => res.data);
}

export function apiSubmitDisciplineReport(matchId: string, data: SubmitDisciplineReportPayload) {
  return api
    .post<DisciplineReport>(`/matches/${matchId}/discipline-report`, data)
    .then((res) => res.data);
}

export function apiGetDisciplineReport(matchId: string) {
  return api
    .get<DisciplineReport | null>(`/matches/${matchId}/discipline-report`)
    .then((res) => res.data);
}

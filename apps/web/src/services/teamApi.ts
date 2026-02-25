import { api } from '../lib/api';

// ─────────── Types ───────────
export type Team = {
  id: string;
  name: string;
  shortName?: string | null;
  logoUrl?: string | null;
  city?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  stadiumId?: string | null;
  stadium?: { id: string; name: string; city?: string } | null;
  createdAt: string;
  updatedAt: string;
};

export type TeamDetail = Team & {
  teamPlayers: {
    id: string;
    jerseyNumber: number | null;
    player: {
      id: string;
      fullName: string;
      position: string;
      nationality: string;
      playerType: string;
      dob: string;
    };
  }[];
  homeMatches: MatchSummary[];
  awayMatches: MatchSummary[];
  standings: {
    id: string;
    played: number;
    win: number;
    draw: number;
    loss: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDiff: number;
    points: number;
    rank: number | null;
    season: { id: string; name: string };
  }[];
};

type MatchSummary = {
  id: string;
  roundNo: number;
  leg: number;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  kickoffAt: string | null;
  homeTeam?: { id: string; name: string; shortName?: string | null };
  awayTeam?: { id: string; name: string; shortName?: string | null };
  stadium?: { name: string } | null;
};

export type CreateTeamPayload = {
  name: string;
  shortName?: string;
  city?: string;
  stadiumId?: string;
  logoUrl?: string;
  status?: 'ACTIVE' | 'INACTIVE';
};

export type UpdateTeamPayload = {
  name?: string;
  shortName?: string;
  city?: string;
  stadiumId?: string;
  logoUrl?: string;
  status?: 'ACTIVE' | 'INACTIVE';
};

export type Stadium = {
  id: string;
  name: string;
  city: string;
  capacity?: number | null;
};

// ─────────── API calls ───────────
export function apiGetTeams() {
  return api.get<Team[]>('/teams').then((res) => res.data);
}

export function apiGetTeam(id: string) {
  return api.get<TeamDetail>(`/teams/${id}`).then((res) => res.data);
}

export function apiCreateTeam(data: CreateTeamPayload) {
  return api.post<Team>('/teams', data).then((res) => res.data);
}

export function apiUpdateTeam(id: string, data: UpdateTeamPayload) {
  return api.patch<Team>(`/teams/${id}`, data).then((res) => res.data);
}

export function apiDeleteTeam(id: string) {
  return api.delete<{ success: boolean }>(`/teams/${id}`).then((res) => res.data);
}

export function apiGetStadiums() {
  return api.get<Stadium[]>('/stadiums').then((res) => res.data);
}

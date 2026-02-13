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

export type CreateTeamPayload = {
  name: string;
  status?: 'ACTIVE' | 'INACTIVE';
};

export type UpdateTeamPayload = {
  name?: string;
  status?: 'ACTIVE' | 'INACTIVE';
};

// ─────────── API calls ───────────
export function apiGetTeams() {
  return api.get<Team[]>('/teams').then((res) => res.data);
}

export function apiGetTeam(id: string) {
  return api.get<Team>(`/teams/${id}`).then((res) => res.data);
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

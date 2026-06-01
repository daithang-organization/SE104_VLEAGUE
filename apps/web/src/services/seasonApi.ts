import { api } from '../lib/api';

// ─────────── Types ───────────
export type Season = {
  id: string;
  name: string;
  year: number;
  status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';
  startDate?: string | null;
  endDate?: string | null;
  _count?: {
    matches?: number;
    seasonTeams?: number;
  };
  createdAt: string;
  updatedAt: string;
};

export type CreateSeasonPayload = {
  name: string;
  year: number;
  status?: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';
  startDate?: string;
  endDate?: string;
};

export type UpdateSeasonPayload = Partial<CreateSeasonPayload>;

// ─────────── API calls ───────────
export function apiGetSeasons() {
  return api.get<Season[]>('/seasons').then((res) => res.data);
}

export function apiGetSeason(id: string) {
  return api.get<Season>(`/seasons/${id}`).then((res) => res.data);
}

export function apiGetCurrentSeason() {
  return api.get<Season | null>('/seasons/current').then((res) => res.data);
}

export function apiCreateSeason(data: CreateSeasonPayload) {
  return api.post<Season>('/seasons', data).then((res) => res.data);
}

export function apiUpdateSeason(id: string, data: UpdateSeasonPayload) {
  return api.patch<Season>(`/seasons/${id}`, data).then((res) => res.data);
}

export function apiDeleteSeason(id: string) {
  return api.delete(`/seasons/${id}`).then((res) => res.data);
}

export function apiUpdateSeasonStatus(id: string, status: string) {
  return api.patch<Season>(`/seasons/${id}/status`, { status }).then((res) => res.data);
}

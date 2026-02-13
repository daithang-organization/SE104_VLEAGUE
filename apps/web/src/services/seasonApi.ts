import { api } from '../lib/api';

// ─────────── Types ───────────
export type Season = {
  id: string;
  name: string;
  year: number;
  status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
};

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

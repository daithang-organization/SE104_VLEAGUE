import { api } from '../lib/api';

// ─────────── Types ───────────
export type ScheduleMatch = {
  id: string;
  roundNo: number;
  leg: number;
  homeTeamId: string;
  awayTeamId: string;
  homeTeam?: { id: string; name: string };
  awayTeam?: { id: string; name: string };
  stadium?: { id: string; name: string } | null;
  stadiumId?: string | null;
  kickoffAt?: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'LOCKED' | 'FINISHED' | 'POSTPONED';
  homeScore?: number | null;
  awayScore?: number | null;
  createdAt: string;
  updatedAt: string;
};

// ─────────── API calls ───────────
export function apiGetSchedule() {
  return api.get<{ ok: boolean; matches: ScheduleMatch[] }>('/schedule').then((res) => res.data);
}

export function apiGenerateSchedule() {
  return api.post<{ ok: boolean; message: string }>('/schedule/generate').then((res) => res.data);
}

export function apiPublishSchedule() {
  return api.post<{ ok: boolean; message: string }>('/schedule/publish').then((res) => res.data);
}

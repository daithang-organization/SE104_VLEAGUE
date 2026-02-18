import { api } from '../lib/api';

// ─────────── Types ───────────
export type ScheduleMatch = {
  id: string;
  roundNo: number;
  leg: number;
  homeTeamId: string;
  awayTeamId: string;
  homeTeam?: { id: string; name: string; shortName?: string | null };
  awayTeam?: { id: string; name: string; shortName?: string | null };
  stadium?: { id: string; name: string; city?: string } | null;
  stadiumId?: string | null;
  kickoffAt?: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'LOCKED' | 'FINISHED' | 'POSTPONED';
  homeScore?: number | null;
  awayScore?: number | null;
  createdAt: string;
  updatedAt: string;
};

// ─────────── API calls ───────────
export function apiGetSchedule(seasonId?: string) {
  const params = seasonId ? { seasonId } : {};
  return api
    .get<{ ok: boolean; matches: ScheduleMatch[] }>('/schedule', { params })
    .then((res) => res.data);
}

export function apiGenerateSchedule(seasonId?: string) {
  const params = seasonId ? { seasonId } : {};
  return api
    .post<{
      ok: boolean;
      message: string;
      totalMatches: number;
    }>('/schedule/generate', null, { params })
    .then((res) => res.data);
}

export function apiPublishSchedule(seasonId?: string) {
  const params = seasonId ? { seasonId } : {};
  return api
    .post<{ ok: boolean; message: string }>('/schedule/publish', null, {
      params,
    })
    .then((res) => res.data);
}

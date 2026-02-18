import { api } from '../lib/api';

// ─────────── Types ───────────
export type Regulation = {
  id: string;
  seasonId: string;
  key: string;
  value: string;
  valueType: string;
  createdAt: string;
  updatedAt: string;
};

// ─────────── API calls ───────────
export function apiGetRegulations(seasonId: string) {
  return api.get<Regulation[]>(`/seasons/${seasonId}/regulations`).then((res) => res.data);
}

export function apiGetRegulation(seasonId: string, key: string) {
  return api.get<Regulation>(`/seasons/${seasonId}/regulations/${key}`).then((res) => res.data);
}

export function apiUpsertRegulation(
  seasonId: string,
  data: { key: string; value: string; valueType?: string },
) {
  return api.put<Regulation>(`/seasons/${seasonId}/regulations`, data).then((res) => res.data);
}

export function apiDeleteRegulation(seasonId: string, key: string) {
  return api.delete(`/seasons/${seasonId}/regulations/${key}`).then((res) => res.data);
}

export function apiSeedDefaultRegulations(seasonId: string) {
  return api
    .post<Regulation[]>(`/seasons/${seasonId}/regulations/seed-defaults`)
    .then((res) => res.data);
}

import { api } from '../lib/api';

// ─────────── Types ───────────

export type Stadium = {
  id: string;
  name: string;
  address?: string | null;
  city: string;
  capacity?: number | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateStadiumPayload = {
  name: string;
  city: string;
  address?: string;
  capacity?: number;
};

export type UpdateStadiumPayload = Partial<CreateStadiumPayload>;

// ─────────── API calls ───────────

export function apiGetStadiums() {
  return api.get<Stadium[]>('/stadiums').then((r) => r.data);
}

export function apiGetStadium(id: string) {
  return api.get<Stadium>(`/stadiums/${id}`).then((r) => r.data);
}

export function apiCreateStadium(data: CreateStadiumPayload) {
  return api.post<Stadium>('/stadiums', data).then((r) => r.data);
}

export function apiUpdateStadium(id: string, data: UpdateStadiumPayload) {
  return api.patch<Stadium>(`/stadiums/${id}`, data).then((r) => r.data);
}

export function apiDeleteStadium(id: string) {
  return api.delete<{ success: boolean }>(`/stadiums/${id}`).then((r) => r.data);
}

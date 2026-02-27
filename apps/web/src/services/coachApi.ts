import { api } from '../lib/api';

// ─────────── Types ───────────
export type Coach = {
  id: string;
  fullName: string;
  nationality?: string | null;
  dob?: string | null;
  licenseType?: string | null;
  avatarUrl?: string | null;
  teamId?: string | null;
  team?: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateCoachPayload = {
  fullName: string;
  nationality?: string;
  dob?: string;
  licenseType?: string;
  avatarUrl?: string;
  teamId?: string;
};

export type UpdateCoachPayload = Partial<CreateCoachPayload> & { teamId?: string | null };

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ─────────── API calls ───────────
export function apiGetCoaches(params?: {
  page?: number;
  limit?: number;
  search?: string;
  teamId?: string;
}) {
  return api.get<PaginatedResponse<Coach>>('/coaches', { params }).then((r) => r.data);
}

export function apiGetCoach(id: string) {
  return api.get<Coach>(`/coaches/${id}`).then((r) => r.data);
}

export function apiCreateCoach(data: CreateCoachPayload) {
  return api.post<Coach>('/coaches', data).then((r) => r.data);
}

export function apiUpdateCoach(id: string, data: UpdateCoachPayload) {
  return api.patch<Coach>(`/coaches/${id}`, data).then((r) => r.data);
}

export function apiDeleteCoach(id: string) {
  return api.delete(`/coaches/${id}`).then((r) => r.data);
}

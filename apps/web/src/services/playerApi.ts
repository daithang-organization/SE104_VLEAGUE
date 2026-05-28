import { api } from '../lib/api';

// ─────────── Types ───────────
export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
export type Player = {
  id: string;
  fullName: string;
  dob: string;
  nationality: string;
  position: 'GK' | 'DF' | 'MF' | 'FW';
  playerType: 'DOMESTIC' | 'FOREIGN';
  birthPlace?: string | null;
  heightCm?: number | null;
  weightKg?: number | null;
  createdAt: string;
  updatedAt: string;
  roster?: Array<{
    team: { id: string; name: string; shortName?: string | null; logoUrl?: string | null };
  }>;
};

export type CreatePlayerPayload = {
  fullName: string;
  dob: string;
  nationality: string;
  position: 'GK' | 'DF' | 'MF' | 'FW';
  playerType?: 'DOMESTIC' | 'FOREIGN';
  birthPlace?: string;
  heightCm?: number;
  weightKg?: number;
  teamId?: string;
};

export type UpdatePlayerPayload = {
  fullName?: string;
  dob?: string;
  nationality?: string;
  position?: 'GK' | 'DF' | 'MF' | 'FW';
  playerType?: 'DOMESTIC' | 'FOREIGN';
  birthPlace?: string;
  heightCm?: number;
  weightKg?: number;
  teamId?: string;
};

// ─────────── API calls ───────────
export function apiGetPlayers(
  page = 1,
  limit = 20,
  filters?: {
    search?: string;
    position?: string;
    nationality?: string;
    teamId?: string;
    playerType?: string;
  },
) {
  const params: Record<string, string | number> = { page, limit };
  if (filters?.search) params.search = filters.search;
  if (filters?.position) params.position = filters.position;
  if (filters?.nationality) params.nationality = filters.nationality;
  if (filters?.teamId) params.teamId = filters.teamId;
  if (filters?.playerType) params.playerType = filters.playerType;
  return api.get<PaginatedResponse<Player>>('/players', { params }).then((res) => res.data);
}

export function apiGetPlayer(id: string) {
  return api.get<Player>(`/players/${id}`).then((res) => res.data);
}

export function apiCreatePlayer(data: CreatePlayerPayload) {
  return api.post<Player>('/players', data).then((res) => res.data);
}

export function apiUpdatePlayer(id: string, data: UpdatePlayerPayload) {
  return api.patch<Player>(`/players/${id}`, data).then((res) => res.data);
}

export function apiDeletePlayer(id: string) {
  return api.delete<{ success: boolean }>(`/players/${id}`).then((res) => res.data);
}

export function apiImportPlayersCsv(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return api
    .post<{
      imported: number;
      errors: string[];
      total: number;
    }>('/players/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((res) => res.data);
}

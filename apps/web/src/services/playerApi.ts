import { api } from '../lib/api';

// ─────────── Types ───────────
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
  teamPlayers?: Array<{
    team: { id: string; name: string };
  }>;
};

export type CreatePlayerPayload = {
  fullName: string;
  dob: string;
  nationality: string;
  position: 'GK' | 'DF' | 'MF' | 'FW';
};

export type UpdatePlayerPayload = {
  fullName?: string;
  dob?: string;
  nationality?: string;
  position?: 'GK' | 'DF' | 'MF' | 'FW';
};

// ─────────── API calls ───────────
export function apiGetPlayers() {
  return api.get<Player[]>('/players').then((res) => res.data);
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

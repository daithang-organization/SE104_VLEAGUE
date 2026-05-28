import { api } from '../lib/api';
import type { Team } from './teamApi';

// ─────────── Types ───────────
export type User = {
  id: string;
  email: string;
  name?: string | null;
  role: 'ADMIN' | 'TEAM_MANAGER' | 'REFEREE' | 'SUPERVISOR' | 'PUBLIC';
  emailVerified: boolean;
  avatarUrl?: string | null;
  googleId?: string | null;
  facebookId?: string | null;
  managedTeamId?: string | null;
  managedTeam?: Team | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateUserPayload = {
  email: string;
  password: string;
  role: string;
  name?: string;
  managedTeamId?: string;
};

// ─────────── API calls ───────────
export function apiGetUsers() {
  return api.get<User[]>('/users').then((res) => res.data);
}

export function apiCreateUser(data: CreateUserPayload) {
  return api.post<User>('/users', data).then((res) => res.data);
}

export function apiUpdateUserRole(id: string, role: string) {
  return api.patch<User>(`/users/${id}/role`, { role }).then((res) => res.data);
}

export function apiDeleteUser(id: string) {
  return api.delete<{ success: boolean }>(`/users/${id}`).then((res) => res.data);
}

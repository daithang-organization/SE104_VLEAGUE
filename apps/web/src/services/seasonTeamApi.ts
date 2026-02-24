import { api } from '../lib/api';

// ─────────── Types ───────────

export type SeasonTeam = {
  id: string;
  seasonId: string;
  teamId: string;
  status: 'REGISTERED' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';
  registeredAt: string;
  approvedAt: string | null;
  team: {
    id: string;
    name: string;
    shortName: string | null;
    logoUrl: string | null;
    city: string | null;
    status: string;
  };
};

// ─────────── API calls ───────────

export function apiGetSeasonTeams(seasonId: string) {
  return api.get<SeasonTeam[]>(`/seasons/${seasonId}/teams`).then((r) => r.data);
}

export function apiRegisterTeam(seasonId: string, teamId: string) {
  return api.post<SeasonTeam>(`/seasons/${seasonId}/teams`, { teamId }).then((r) => r.data);
}

export function apiUpdateSeasonTeamStatus(seasonId: string, teamId: string, status: string) {
  return api
    .patch<SeasonTeam>(`/seasons/${seasonId}/teams/${teamId}/status`, { status })
    .then((r) => r.data);
}

export function apiRemoveSeasonTeam(seasonId: string, teamId: string) {
  return api.delete(`/seasons/${seasonId}/teams/${teamId}`).then((r) => r.data);
}

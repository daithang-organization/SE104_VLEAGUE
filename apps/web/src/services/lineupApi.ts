import { api } from '../lib/api';

// ─────────── Types ───────────
export type LineupPlayer = {
  id: string;
  playerId: string;
  role: 'STARTING' | 'SUBSTITUTE';
  position?: string | null;
  player: { id: string; fullName: string; position: string; playerType: string };
  team: { id: string; name: string };
};

export type MatchLineup = {
  matchId: string;
  home: {
    teamId: string;
    starting: LineupPlayer[];
    substitutes: LineupPlayer[];
  };
  away: {
    teamId: string;
    starting: LineupPlayer[];
    substitutes: LineupPlayer[];
  };
};

export type SetLineupPayload = {
  teamId: string;
  players: Array<{
    playerId: string;
    role: 'STARTING' | 'SUBSTITUTE';
    position?: string;
  }>;
};

// ─────────── API calls ───────────
export function apiGetLineup(matchId: string) {
  return api.get<MatchLineup>(`/matches/${matchId}/lineup`).then((r) => r.data);
}

export function apiSetLineup(matchId: string, data: SetLineupPayload) {
  return api.post<MatchLineup>(`/matches/${matchId}/lineup`, data).then((r) => r.data);
}

export function apiRemoveLineup(matchId: string, teamId: string) {
  return api.delete(`/matches/${matchId}/lineup/${teamId}`).then((r) => r.data);
}

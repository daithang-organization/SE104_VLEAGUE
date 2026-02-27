import { api } from '../lib/api';

// ─────────── Types ───────────
export type TeamStanding = {
  position: number;
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

export type TopScorer = {
  position: number;
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  goals: number;
};

// ─────────── API calls ───────────
export function apiGetStandings(seasonId?: string) {
  const params = seasonId ? `?seasonId=${seasonId}` : '';
  return api.get<TeamStanding[]>(`/standings${params}`).then((res) => res.data);
}

export function apiGetTopScorers(seasonId?: string, limit?: number) {
  const queryParts: string[] = [];
  if (seasonId) queryParts.push(`seasonId=${seasonId}`);
  if (limit) queryParts.push(`limit=${limit}`);
  const query = queryParts.length ? `?${queryParts.join('&')}` : '';
  return api.get<TopScorer[]>(`/standings/top-scorers${query}`).then((res) => res.data);
}

// ─────────── Card Stats ───────────
export type CardStat = {
  position: number;
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  yellowCards: number;
  redCards: number;
  totalCards: number;
};

export function apiGetCardStats(seasonId?: string, limit?: number) {
  const queryParts: string[] = [];
  if (seasonId) queryParts.push(`seasonId=${seasonId}`);
  if (limit) queryParts.push(`limit=${limit}`);
  const query = queryParts.length ? `?${queryParts.join('&')}` : '';
  return api.get<CardStat[]>(`/standings/card-stats${query}`).then((res) => res.data);
}

// ─────────── Team Stats ───────────
export type TeamStat = {
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  cleanSheets: number;
  yellowCards: number;
  redCards: number;
};

export function apiGetTeamStats(seasonId?: string) {
  const params = seasonId ? `?seasonId=${seasonId}` : '';
  return api.get<TeamStat[]>(`/standings/team-stats${params}`).then((res) => res.data);
}

// Re-export from searchApi for convenience
export { apiGetHeadToHead, apiGetPlayerStats } from './searchApi';
export type { HeadToHeadResult, PlayerStats } from './searchApi';

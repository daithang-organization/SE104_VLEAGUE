import { api } from '../lib/api';

// ─────────── Types ───────────
export type SearchResult = {
  type: 'team' | 'player' | 'match' | 'stadium' | 'season';
  id: string;
  title: string;
  subtitle?: string;
  url: string;
};

// ─────────── API calls ───────────
export function apiGlobalSearch(q: string, limit = 10) {
  return api.get<SearchResult[]>('/search', { params: { q, limit } }).then((r) => r.data);
}

// ─────────── Head-to-Head ───────────
export type HeadToHeadResult = {
  totalMatches: number;
  team1: { teamId: string; wins: number; goals: number };
  team2: { teamId: string; wins: number; goals: number };
  draws: number;
  matches: Array<{
    id: string;
    roundNo: number;
    homeTeam: { id: string; name: string };
    awayTeam: { id: string; name: string };
    homeScore: number | null;
    awayScore: number | null;
    kickoffAt: string | null;
    stadium: { id: string; name: string } | null;
    season?: { name: string } | null;
  }>;
};

export function apiGetHeadToHead(team1: string, team2: string, seasonId?: string) {
  const params: Record<string, string> = { team1, team2 };
  if (seasonId) params.seasonId = seasonId;
  return api.get<HeadToHeadResult>('/standings/head-to-head', { params }).then((r) => r.data);
}

// ─────────── Player Stats ───────────
export type PlayerStats = {
  player: { id: string; fullName: string; position: string; nationality: string };
  matchesPlayed: number;
  goals: number;
  assists: number;
  ownGoals: number;
  yellowCards: number;
  redCards: number;
  goalsByRound: Record<number, number>;
  recentEvents: Array<{
    id: string;
    minute: number;
    type: string;
    match: { id: string; roundNo: number; seasonId: string; kickoffAt: string | null };
    team: { id: string; name: string } | null;
  }>;
};

export function apiGetPlayerStats(playerId: string, seasonId?: string) {
  const params: Record<string, string> = {};
  if (seasonId) params.seasonId = seasonId;
  return api
    .get<PlayerStats>(`/standings/player-stats/${playerId}`, { params })
    .then((r) => r.data);
}

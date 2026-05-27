import { api } from '../lib/api';

// ─────────── Types ───────────
export type StandingsMode = 'in_progress' | 'final';

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
  recentForm: Array<'W' | 'D' | 'L'>;
  requiresDrawLot?: boolean;
  headToHeadGoalsFor?: number;
  headToHeadGoalsAgainst?: number;
  tieBreakNote?: string;
};

export type TopScorer = {
  position: number;
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  goals: number;
};

export type TopAssist = {
  position: number;
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  assists: number;
};

export type PlayerOfMatchStat = {
  position: number;
  playerId: string;
  playerName: string;
  awards: number;
};

export type SuspensionStat = {
  id: string;
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  reason: string;
  status: 'ACTIVE' | 'SERVED' | 'CANCELLED';
  sourceMatchId: string;
  sourceRound: number | null;
  effectiveMatchId: string;
  effectiveRound: number | null;
  servedAt: string | null;
};

export type SeasonAwards = {
  seasonId?: string;
  champion: TeamStanding | null;
  runnerUp: TeamStanding | null;
  topScorer: TopScorer | null;
  bestPlayer: PlayerOfMatchStat | null;
  requiresDrawLot: boolean;
  standings: TeamStanding[];
};

function buildQuery(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') searchParams.set(key, String(value));
  }
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

// ─────────── API calls ───────────
export function apiGetStandings(seasonId?: string, mode?: StandingsMode) {
  const query = buildQuery({ seasonId, mode });
  return api.get<TeamStanding[]>(`/standings${query}`).then((res) => res.data);
}

export function apiGetTopScorers(seasonId?: string, limit?: number) {
  const query = buildQuery({ seasonId, limit });
  return api.get<TopScorer[]>(`/standings/top-scorers${query}`).then((res) => res.data);
}

export function apiGetTopAssists(seasonId?: string, limit?: number) {
  const query = buildQuery({ seasonId, limit });
  return api.get<TopAssist[]>(`/standings/top-assists${query}`).then((res) => res.data);
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
  const query = buildQuery({ seasonId, limit });
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
  const query = buildQuery({ seasonId });
  return api.get<TeamStat[]>(`/standings/team-stats${query}`).then((res) => res.data);
}

export function apiGetPlayerOfMatchStats(seasonId?: string, limit?: number) {
  const query = buildQuery({ seasonId, limit });
  return api.get<PlayerOfMatchStat[]>(`/standings/player-of-match${query}`).then((res) => res.data);
}

export function apiGetSuspensionStats(seasonId?: string) {
  const query = buildQuery({ seasonId });
  return api.get<SuspensionStat[]>(`/standings/suspensions${query}`).then((res) => res.data);
}

export function apiGetSeasonAwards(seasonId?: string) {
  const query = buildQuery({ seasonId });
  return api.get<SeasonAwards>(`/standings/awards${query}`).then((res) => res.data);
}

// Re-export from searchApi for convenience
export { apiGetHeadToHead, apiGetPlayerStats } from './searchApi';
export type { HeadToHeadResult, PlayerStats } from './searchApi';

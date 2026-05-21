import { api } from '../lib/api';
import type { Season } from './seasonApi';
import type { Team } from './teamApi';

export type TeamManagerAssignment = {
  id: string;
  userId: string;
  seasonId: string;
  teamId: string;
  season: Season;
  team: Team;
  createdAt: string;
  updatedAt: string;
};

export function apiGetTeamManagerAssignment(seasonId: string) {
  return api
    .get<TeamManagerAssignment | null>('/team-manager/assignment', { params: { seasonId } })
    .then((res) => res.data);
}

export function apiCreateTeamManagerAssignment(seasonId: string, teamId: string) {
  return api
    .post<TeamManagerAssignment>('/team-manager/assignment', { seasonId, teamId })
    .then((res) => res.data);
}

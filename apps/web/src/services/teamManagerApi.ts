import { api } from '../lib/api';
import type { Season } from './seasonApi';
import type { SeasonTeam } from './seasonTeamApi';
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

export type TeamManagerApplication = SeasonTeam & {
  season?: Season;
};

export type SubmitTeamManagerApplicationPayload = {
  seasonId: string;
  ownerName: string;
  ownerCountry: string;
  ownerAddress?: string;
  teamIntroduction: string;
  primaryKit: string;
  backupKit: string;
  participationFeePaid: boolean;
  feeReceiptCode?: string;
  externalCompetitionSchedule?: string;
};

export function apiGetTeamManagerAssignment(seasonId: string) {
  return api
    .get<TeamManagerAssignment | null>('/team-manager/assignment', { params: { seasonId } })
    .then((res) => res.data);
}

export function apiGetTeamManagerManagedTeam() {
  return api.get<Team | null>('/team-manager/managed-team').then((res) => res.data);
}

export function apiCreateTeamManagerAssignment(seasonId: string, teamId: string) {
  return api
    .post<TeamManagerAssignment>('/team-manager/assignment', { seasonId, teamId })
    .then((res) => res.data);
}

export function apiGetTeamManagerApplication(seasonId: string) {
  return api
    .get<TeamManagerApplication | null>('/team-manager/application', { params: { seasonId } })
    .then((res) => res.data);
}

export function apiSubmitTeamManagerApplication(payload: SubmitTeamManagerApplicationPayload) {
  return api
    .post<TeamManagerApplication>('/team-manager/application', payload)
    .then((res) => res.data);
}

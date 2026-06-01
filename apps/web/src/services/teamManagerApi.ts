import { api } from '../lib/api';
import type { Player } from './playerApi';
import type { Season } from './seasonApi';
import type { SeasonTeam } from './seasonTeamApi';
import type { Stadium } from './stadiumApi';
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

export type TeamManagerRequestType =
  | 'CREATE_TEAM'
  | 'CLAIM_EXISTING_TEAM'
  | 'UPDATE_MANAGED_TEAM'
  | 'DELETE_MANAGED_TEAM';
export type TeamManagerRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ManagerRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ManagerPlayerRequestType = 'ADD_PLAYER' | 'UPDATE_PLAYER' | 'REMOVE_FROM_TEAM';
export type ManagerStadiumRequestType =
  | 'CREATE_HOME_STADIUM'
  | 'UPDATE_HOME_STADIUM'
  | 'REMOVE_HOME_STADIUM';

export type TeamManagerRequest = {
  id: string;
  managerId: string;
  manager?: {
    id: string;
    email: string;
    name?: string | null;
    role: string;
    managedTeamId?: string | null;
  };
  requestType: TeamManagerRequestType;
  status: TeamManagerRequestStatus;
  teamId?: string | null;
  team?: Team | null;
  proposedTeamName?: string | null;
  proposedTeamShortName?: string | null;
  proposedTeamCity?: string | null;
  proposedTeamLogoUrl?: string | null;
  proposedStadiumId?: string | null;
  requestNote?: string | null;
  adminNote?: string | null;
  reviewedById?: string | null;
  reviewedBy?: {
    id: string;
    email: string;
    name?: string | null;
  } | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateTeamManagerRequestPayload =
  | {
      requestType: 'CLAIM_EXISTING_TEAM';
      teamId: string;
      requestNote?: string;
    }
  | {
      requestType: 'CREATE_TEAM';
      proposedTeamName: string;
      proposedTeamShortName?: string;
      proposedTeamCity?: string;
      proposedTeamLogoUrl?: string;
      proposedStadiumId?: string;
      requestNote?: string;
    }
  | {
      requestType: 'UPDATE_MANAGED_TEAM';
      teamId: string;
      proposedTeamName: string;
      proposedTeamShortName?: string;
      proposedTeamCity?: string;
      proposedTeamLogoUrl?: string;
      requestNote?: string;
    }
  | {
      requestType: 'DELETE_MANAGED_TEAM';
      teamId: string;
      requestNote?: string;
    };

export type ReviewTeamManagerRequestPayload = {
  status: 'APPROVED' | 'REJECTED';
  adminNote?: string;
};

export type ManagerPlayerRequest = {
  id: string;
  managerId: string;
  manager?: TeamManagerRequest['manager'];
  teamId: string;
  team?: Team;
  playerId?: string | null;
  player?: Player | null;
  requestType: ManagerPlayerRequestType;
  status: ManagerRequestStatus;
  payload: Partial<Player>;
  requestNote?: string | null;
  adminNote?: string | null;
  reviewedBy?: TeamManagerRequest['reviewedBy'];
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateManagerPlayerRequestPayload = {
  requestType: ManagerPlayerRequestType;
  playerId?: string;
  fullName?: string;
  dob?: string;
  nationality?: string;
  position?: 'GK' | 'DF' | 'MF' | 'FW';
  playerType?: 'DOMESTIC' | 'FOREIGN';
  birthPlace?: string;
  heightCm?: number;
  weightKg?: number;
  careerSummary?: string;
  requestNote?: string;
};

export type ManagerStadiumRequest = {
  id: string;
  managerId: string;
  manager?: TeamManagerRequest['manager'];
  teamId: string;
  team?: Team & { stadium?: Stadium | null };
  stadiumId?: string | null;
  stadium?: Stadium | null;
  requestType: ManagerStadiumRequestType;
  status: ManagerRequestStatus;
  payload: Partial<Stadium>;
  requestNote?: string | null;
  adminNote?: string | null;
  reviewedBy?: TeamManagerRequest['reviewedBy'];
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateManagerStadiumRequestPayload = {
  requestType: ManagerStadiumRequestType;
  stadiumId?: string;
  name?: string;
  city?: string;
  address?: string;
  country?: string;
  capacity?: number;
  fifaStars?: number;
  requestNote?: string;
};

export type ReviewManagerChangeRequestPayload = {
  status: 'APPROVED' | 'REJECTED';
  adminNote?: string;
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
  feeReceiptUrl?: string;
  externalCompetitionSchedule: string;
};

export function apiGetTeamManagerAssignment(seasonId: string) {
  return api
    .get<TeamManagerAssignment | null>('/team-manager/assignment', { params: { seasonId } })
    .then((res) => res.data);
}

export function apiGetTeamManagerManagedTeam() {
  return api.get<Team | null>('/team-manager/managed-team').then((res) => res.data);
}

export function apiGetTeamManagerManagementRequest() {
  return api
    .get<TeamManagerRequest | null>('/team-manager/management-request')
    .then((res) => res.data);
}

export function apiGetMyTeamManagerRequests() {
  return api
    .get<TeamManagerRequest[]>('/team-manager/management-requests/mine')
    .then((res) => res.data);
}

export function apiGetTeamManagerClaimableTeams() {
  return api.get<Team[]>('/team-manager/claimable-teams').then((res) => res.data);
}

export function apiCreateTeamManagerRequest(payload: CreateTeamManagerRequestPayload) {
  return api
    .post<TeamManagerRequest>('/team-manager/management-requests', payload)
    .then((res) => res.data);
}

export function apiUpdateTeamManagerRequest(id: string, payload: CreateTeamManagerRequestPayload) {
  return api
    .patch<TeamManagerRequest>(`/team-manager/management-requests/${id}`, payload)
    .then((res) => res.data);
}

export function apiDeleteTeamManagerRequest(id: string) {
  return api
    .delete<{ success: boolean }>(`/team-manager/management-requests/${id}`)
    .then((res) => res.data);
}

export function apiLeaveTeamManagerManagedTeam() {
  return api.delete<{ success: boolean }>('/team-manager/managed-team').then((res) => res.data);
}

export function apiGetTeamManagerRequests(status?: TeamManagerRequestStatus) {
  return api
    .get<TeamManagerRequest[]>('/team-manager/management-requests', { params: { status } })
    .then((res) => res.data);
}

export function apiReviewTeamManagerRequest(id: string, payload: ReviewTeamManagerRequestPayload) {
  return api
    .patch<TeamManagerRequest>(`/team-manager/management-requests/${id}/review`, payload)
    .then((res) => res.data);
}

export function apiGetMyManagerPlayerRequests() {
  return api.get<ManagerPlayerRequest[]>('/team-manager/player-requests/mine').then((r) => r.data);
}

export function apiCreateManagerPlayerRequest(payload: CreateManagerPlayerRequestPayload) {
  return api
    .post<ManagerPlayerRequest>('/team-manager/player-requests', payload)
    .then((r) => r.data);
}

export function apiUpdateManagerPlayerRequest(
  id: string,
  payload: CreateManagerPlayerRequestPayload,
) {
  return api
    .patch<ManagerPlayerRequest>(`/team-manager/player-requests/${id}`, payload)
    .then((r) => r.data);
}

export function apiDeleteManagerPlayerRequest(id: string) {
  return api
    .delete<{ success: boolean }>(`/team-manager/player-requests/${id}`)
    .then((r) => r.data);
}

export function apiGetManagerPlayerRequests(status?: ManagerRequestStatus) {
  return api
    .get<ManagerPlayerRequest[]>('/team-manager/player-requests', { params: { status } })
    .then((r) => r.data);
}

export function apiReviewManagerPlayerRequest(
  id: string,
  payload: ReviewManagerChangeRequestPayload,
) {
  return api
    .patch<ManagerPlayerRequest>(`/team-manager/player-requests/${id}/review`, payload)
    .then((r) => r.data);
}

export function apiGetMyManagerStadiumRequests() {
  return api
    .get<ManagerStadiumRequest[]>('/team-manager/stadium-requests/mine')
    .then((r) => r.data);
}

export function apiCreateManagerStadiumRequest(payload: CreateManagerStadiumRequestPayload) {
  return api
    .post<ManagerStadiumRequest>('/team-manager/stadium-requests', payload)
    .then((r) => r.data);
}

export function apiUpdateManagerStadiumRequest(
  id: string,
  payload: CreateManagerStadiumRequestPayload,
) {
  return api
    .patch<ManagerStadiumRequest>(`/team-manager/stadium-requests/${id}`, payload)
    .then((r) => r.data);
}

export function apiDeleteManagerStadiumRequest(id: string) {
  return api
    .delete<{ success: boolean }>(`/team-manager/stadium-requests/${id}`)
    .then((r) => r.data);
}

export function apiGetManagerStadiumRequests(status?: ManagerRequestStatus) {
  return api
    .get<ManagerStadiumRequest[]>('/team-manager/stadium-requests', { params: { status } })
    .then((r) => r.data);
}

export function apiReviewManagerStadiumRequest(
  id: string,
  payload: ReviewManagerChangeRequestPayload,
) {
  return api
    .patch<ManagerStadiumRequest>(`/team-manager/stadium-requests/${id}/review`, payload)
    .then((r) => r.data);
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

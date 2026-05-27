import { api } from '../lib/api';
import type { Season } from './seasonApi';
import type { Team } from './teamApi';

export type TeamInvitationSourceType = 'PREVIOUS_TOP_8' | 'PROMOTED' | 'REPLACEMENT';
export type TeamInvitationStatus = 'SENT' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';

export type TeamInvitation = {
  id: string;
  seasonId: string;
  teamId: string;
  sourceType: TeamInvitationSourceType;
  status: TeamInvitationStatus;
  sentAt: string;
  deadlineAt: string;
  responseAt: string | null;
  responseReason: string | null;
  regulationsSnapshot: Record<string, string> | null;
  season?: Season;
  team?: Team;
  createdAt: string;
  updatedAt: string;
};

export type InvitationCandidate = {
  teamId: string;
  teamName: string;
  sourceType: TeamInvitationSourceType;
  sourceRank: number;
  points: number;
  goalDifference: number;
  played: number;
  invitationId: string | null;
  invitationStatus: TeamInvitationStatus | null;
  responseReason: string | null;
  deadlineAt: string | null;
  team?: Team | null;
};

export type InvitationCandidateResult = {
  targetSeason: Season;
  previousSeason: Season;
  requiredTopLeagueSlots: number;
  requiredPromotedSlots: number;
  candidates: InvitationCandidate[];
};

export type SendTeamInvitationPayload = {
  teamId: string;
  sourceType: TeamInvitationSourceType;
};

export type RespondTeamInvitationPayload = {
  responseStatus: 'ACCEPTED' | 'DECLINED';
  responseReason?: string;
};

export function apiGetSeasonInvitations(seasonId: string) {
  return api.get<TeamInvitation[]>(`/seasons/${seasonId}/invitations`).then((res) => res.data);
}

export function apiGetInvitationCandidates(seasonId: string, previousSeasonId?: string) {
  const params = previousSeasonId ? { previousSeasonId } : undefined;
  return api
    .get<InvitationCandidateResult>(`/seasons/${seasonId}/invitation-candidates`, { params })
    .then((res) => res.data);
}

export function apiSendTeamInvitation(seasonId: string, payload: SendTeamInvitationPayload) {
  return api
    .post<TeamInvitation>(`/seasons/${seasonId}/invitations`, payload)
    .then((res) => res.data);
}

export function apiGetMyPendingInvitations() {
  return api.get<TeamInvitation[]>('/team-invitations/my-pending').then((res) => res.data);
}

export function apiRespondTeamInvitation(
  invitationId: string,
  payload: RespondTeamInvitationPayload,
) {
  return api
    .patch<TeamInvitation>(`/team-invitations/${invitationId}/respond`, payload)
    .then((res) => res.data);
}

import { api } from '../lib/api';
import type { Season } from './seasonApi';
import type { Team } from './teamApi';

export type TeamInvitationSourceType = 'PREVIOUS_TOP_8' | 'PROMOTED' | 'REPLACEMENT';
export type TeamInvitationStatus = 'SENT' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
export type PromotionQualificationType = 'CHAMPION' | 'RUNNER_UP' | 'PLAYOFF' | 'REPLACEMENT_POOL';
export type PromotionCandidateStatus = 'ELIGIBLE' | 'INVITED' | 'ACCEPTED' | 'DECLINED' | 'SKIPPED';

export type TeamInvitationCompliance = {
  roster: {
    current: number;
    min: number;
    max: number;
    ok: boolean;
  };
  foreignPlayers: {
    current: number;
    max: number;
    maxOnField: number;
    ok: boolean;
  };
  age: {
    min: number;
    max: number;
    total: number;
    invalidCount: number;
    ok: boolean;
  };
  stadium: {
    stadiumId: string | null;
    stadiumName: string | null;
    capacity: number | null;
    fifaStars: number | null;
    minCapacity: number;
    minFifaStars: number;
    ok: boolean;
  };
};

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
  compliance?: TeamInvitationCompliance;
  promotionNote: string | null;
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
  sourceCompetition?: string | null;
  qualificationType?: PromotionQualificationType | null;
  promotionStatus?: PromotionCandidateStatus | null;
  sourceNote?: string | null;
  team?: Team | null;
};

export type InvitationCandidateResult = {
  targetSeason: Season;
  previousSeason: Season;
  requiredTopLeagueSlots: number;
  requiredPromotedSlots: number;
  candidates: InvitationCandidate[];
};

export type ApproveAllInvitationCandidatesResult = {
  approvedCount: number;
  candidates: InvitationCandidate[];
};

export type SendTeamInvitationPayload = {
  teamId: string;
  sourceType: TeamInvitationSourceType;
  promotionNote?: string;
};

export type RespondTeamInvitationPayload = {
  responseStatus: 'ACCEPTED' | 'DECLINED';
  responseReason?: string;
};

export type PromotionCandidate = {
  id: string;
  seasonId: string;
  teamId: string;
  rank: number;
  sourceCompetition: string;
  qualificationType: PromotionQualificationType;
  status: PromotionCandidateStatus;
  note: string | null;
  team?: Team;
  createdAt: string;
  updatedAt: string;
};

export type UpsertPromotionCandidatePayload = {
  teamId: string;
  rank: number;
  sourceCompetition: string;
  qualificationType?: PromotionQualificationType;
  status?: PromotionCandidateStatus;
  note?: string;
};

export type ImportPromotionCandidateRow = {
  rank: number;
  teamId?: string;
  teamName?: string;
  sourceCompetition?: string;
  qualificationType?: PromotionQualificationType;
  status?: PromotionCandidateStatus;
  note?: string;
};

export type ImportPromotionCandidatesPayload = {
  sourceCompetition?: string;
  replaceExisting?: boolean;
  rows: ImportPromotionCandidateRow[];
};

export type ImportPromotionCandidatesResult = {
  importedCount: number;
  replaced: boolean;
  candidates: PromotionCandidate[];
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

export function apiApproveAllInvitationCandidates(seasonId: string) {
  return api
    .post<ApproveAllInvitationCandidatesResult>(
      `/seasons/${seasonId}/invitation-candidates/approve-all`,
    )
    .then((res) => res.data);
}

export function apiGetMyPendingInvitations() {
  return api.get<TeamInvitation[]>('/team-invitations/my-pending').then((res) => res.data);
}

export function apiGetMyInvitations() {
  return api.get<TeamInvitation[]>('/team-invitations/my').then((res) => res.data);
}

export function apiGetPromotionCandidates(seasonId: string) {
  return api
    .get<PromotionCandidate[]>(`/seasons/${seasonId}/promotion-candidates`)
    .then((res) => res.data);
}

export function apiUpsertPromotionCandidate(
  seasonId: string,
  payload: UpsertPromotionCandidatePayload,
) {
  return api
    .post<PromotionCandidate>(`/seasons/${seasonId}/promotion-candidates`, payload)
    .then((res) => res.data);
}

export function apiImportPromotionCandidates(
  seasonId: string,
  payload: ImportPromotionCandidatesPayload,
) {
  return api
    .post<ImportPromotionCandidatesResult>(
      `/seasons/${seasonId}/promotion-candidates/import`,
      payload,
    )
    .then((res) => res.data);
}

export function apiDeletePromotionCandidate(seasonId: string, teamId: string) {
  return api
    .delete<{ count: number }>(`/seasons/${seasonId}/promotion-candidates/${teamId}`)
    .then((res) => res.data);
}

export function apiRespondTeamInvitation(
  invitationId: string,
  payload: RespondTeamInvitationPayload,
) {
  return api
    .patch<TeamInvitation>(`/team-invitations/${invitationId}/respond`, payload)
    .then((res) => res.data);
}

export type ReplacementCandidateResult = {
  totalRequired: number;
  filledSlots: number;
  slotsNeeded: number;
  declinedTeams: TeamInvitation[];
  candidates: Array<
    Team & {
      promotionRank?: number;
      sourceCompetition?: string;
      qualificationType?: PromotionQualificationType;
      promotionStatus?: PromotionCandidateStatus;
      sourceNote?: string | null;
    }
  >;
};

export function apiGetReplacementCandidates(seasonId: string) {
  return api
    .get<ReplacementCandidateResult>(`/seasons/${seasonId}/replacement-candidates`)
    .then((res) => res.data);
}

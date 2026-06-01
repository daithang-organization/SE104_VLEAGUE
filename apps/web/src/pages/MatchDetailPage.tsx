import {
  AimOutlined,
  ArrowLeftOutlined,
  CalendarOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  PlusOutlined,
  SendOutlined,
  SwapOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Flex,
  Input,
  message,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Switch,
  Table,
  Tabs,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useMatchSocket } from '../hooks/useMatchSocket';
import {
  apiGetMatch,
  apiGetDisciplineReport,
  apiGetMatchOfficials,
  apiGetMatchLineups,
  apiGetMatchReport,
  apiGetOfficials,
  apiGetMatchSuspensions,
  apiGetTeamRoster,
  apiAssignMatchOfficial,
  apiRemoveMatchOfficial,
  apiReviewMatchLineup,
  apiSubmitDisciplineReport,
  apiSubmitMatchLineup,
  apiSubmitMatchReport,
  apiUpdateMatchStatus,
  type DisciplineReport,
  type Match,
  type MatchEvent,
  type MatchOfficialAssignment,
  type MatchOfficialRole,
  type MatchKitType,
  type MatchLineupRole,
  type MatchLineupStatus,
  type MatchReport,
  type MatchSuspension,
  type MatchTeamLineup,
  type Official,
  type PlayerPosition,
  type RosterPlayer,
  type SubmitMatchReportPayload,
} from '../services/matchApi';
import { EVENT_TYPE_MAP, POSITION_MAP, STATUS_MAP } from './match-detail/constants';
import EventFormModal from './match-detail/EventFormModal';
import MatchCenter from './match-detail/MatchCenter';
import RefereeMatchReportPanel from './match-detail/RefereeMatchReportPanel';
import MatchStatsPanel from './match-detail/MatchStatsPanel';
import MatchTimeline from './match-detail/MatchTimeline';
import ScoreModal from './match-detail/ScoreModal';
import { getTeamLogoUrl, getTeamTheme } from '../utils/teamLogos';

const { Title, Text } = Typography;

const FORMATION_OPTIONS = ['4-4-2', '4-3-3', '4-2-3-1', '3-5-2', '5-3-2'];

function isForeignNationality(nationality?: string | null) {
  if (!nationality) return false;
  const normalized = nationality
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

  return normalized !== 'viet nam' && normalized !== 'vietnam';
}

function normalizeSearchText(value?: string | number | null) {
  if (value === null || value === undefined) return '';
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const lineupStatusMap: Record<MatchLineupStatus, { color: string; label: string }> = {
    SUBMITTED: { color: 'processing', label: t('matchDetail.lineupStatusSubmitted') },
    APPROVED: { color: 'success', label: t('matchDetail.lineupStatusApproved') },
    REJECTED: { color: 'error', label: t('matchDetail.lineupStatusRejected') },
  };
  const kitTypeLabel: Record<MatchKitType, string> = {
    PRIMARY: t('matchDetail.kitPrimary'),
    BACKUP: t('matchDetail.kitBackup'),
  };
  const suspensionReasonLabel: Record<string, string> = {
    RED_CARD: t('matchDetail.suspensionRedCard'),
    ACCUMULATED_YELLOW_CARDS: t('matchDetail.suspensionAccumulatedYellows'),
  };
  const officialRoleLabel: Record<MatchOfficialRole, string> = {
    MAIN_REFEREE: t('matchDetail.officialRoleMainReferee'),
    ASSISTANT_REFEREE: t('matchDetail.officialRoleAssistantReferee'),
    FOURTH_OFFICIAL: t('matchDetail.officialRoleFourthOfficial'),
    SUPERVISOR: t('matchDetail.officialRoleSupervisor'),
  };
  const officialAccountRoleLabel: Record<NonNullable<Official['accountRole']>, string> = {
    ADMIN: t('roleLabel.ADMIN'),
    TEAM_MANAGER: t('roleLabel.TEAM_MANAGER'),
    REFEREE: t('roleLabel.REFEREE'),
    SUPERVISOR: t('matchDetail.officialRoleSupervisor'),
    PUBLIC: t('roleLabel.PUBLIC'),
  };
  const getOfficialAccountRoleLabel = (role?: Official['accountRole'] | null) =>
    role ? (officialAccountRoleLabel[role] ?? role) : null;
  const renderOfficialNameWithAccountRole = (
    official: Official | null | undefined,
    fallback: string,
  ) => {
    const accountRoleLabel = getOfficialAccountRoleLabel(official?.accountRole);

    return (
      <Space direction="vertical" size={0}>
        <Text>{official?.fullName ?? fallback}</Text>
        {accountRoleLabel && (
          <Text type="secondary" style={{ fontSize: 12, lineHeight: 1.35 }}>
            {t('matchDetail.officialAccountRoleLabel', { role: accountRoleLabel })}
          </Text>
        )}
      </Space>
    );
  };
  const disciplineRatingMeta: Record<
    string,
    { alertType: 'success' | 'warning' | 'error' | 'info'; label: string }
  > = {
    GOOD: { alertType: 'success', label: t('matchDetail.ratingGood') },
    ACCEPTABLE: { alertType: 'warning', label: t('matchDetail.ratingAcceptable') },
    ISSUES_FOUND: { alertType: 'error', label: t('matchDetail.ratingIssuesFound') },
  };

  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  // Rosters
  const [homeRoster, setHomeRoster] = useState<RosterPlayer[]>([]);
  const [awayRoster, setAwayRoster] = useState<RosterPlayer[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);

  // Match registration
  const [lineups, setLineups] = useState<MatchTeamLineup[]>([]);
  const [suspensions, setSuspensions] = useState<MatchSuspension[]>([]);
  const [lineupLoading, setLineupLoading] = useState(false);
  const [selectedLineupTeamId, setSelectedLineupTeamId] = useState<string>();
  const [lineupKitType, setLineupKitType] = useState<MatchKitType>('PRIMARY');
  const [lineupFormation, setLineupFormation] = useState('4-4-2');
  const [lineupRoles, setLineupRoles] = useState<Record<string, MatchLineupRole | undefined>>({});
  const [lineupRosterSearch, setLineupRosterSearch] = useState('');
  const [lineupSubmitting, setLineupSubmitting] = useState(false);
  const [lineupReviewNotes, setLineupReviewNotes] = useState<Record<string, string>>({});
  const [lineupReviewingKey, setLineupReviewingKey] = useState<string | null>(null);

  // Officials and post-match reports
  const [officials, setOfficials] = useState<Official[]>([]);
  const [officialAssignments, setOfficialAssignments] = useState<MatchOfficialAssignment[]>([]);
  const [matchReport, setMatchReport] = useState<MatchReport | null>(null);
  const [disciplineReport, setDisciplineReport] = useState<DisciplineReport | null>(null);
  const [officialLoading, setOfficialLoading] = useState(false);
  const [selectedOfficialId, setSelectedOfficialId] = useState<string>();
  const [selectedOfficialRole, setSelectedOfficialRole] =
    useState<MatchOfficialRole>('MAIN_REFEREE');
  const [officialNote, setOfficialNote] = useState('');
  const [officialAssigning, setOfficialAssigning] = useState(false);
  const [officialDeletingId, setOfficialDeletingId] = useState<string | null>(null);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [disciplineSupervisorId, setDisciplineSupervisorId] = useState<string>();
  const [disciplineRating, setDisciplineRating] = useState('GOOD');
  const [refereeIssues, setRefereeIssues] = useState('');
  const [playerIssues, setPlayerIssues] = useState('');
  const [organizerIssues, setOrganizerIssues] = useState('');
  const [disciplineNotes, setDisciplineNotes] = useState('');
  const [sendToDisciplinary, setSendToDisciplinary] = useState(false);
  const [disciplineSubmitting, setDisciplineSubmitting] = useState(false);

  // Modal visibility
  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<MatchEvent | null>(null);

  const canViewLineupData = useMemo(
    () => user?.role && ['ADMIN', 'TEAM_MANAGER', 'REFEREE', 'SUPERVISOR'].includes(user.role),
    [user],
  );
  const canViewOfficialAssignments = useMemo(
    () =>
      user?.role &&
      ['ADMIN', 'TEAM_MANAGER', 'REFEREE', 'SUPERVISOR', 'PUBLIC'].includes(user.role),
    [user],
  );
  const canViewOfficialsDirectory = useMemo(
    () => user?.role && ['ADMIN', 'REFEREE', 'SUPERVISOR'].includes(user.role),
    [user],
  );
  const canViewMatchReport = useMemo(
    () => user?.role && ['ADMIN', 'REFEREE', 'SUPERVISOR'].includes(user.role),
    [user],
  );
  const canViewDisciplineReport = useMemo(
    () => user?.role === 'ADMIN' || user?.role === 'SUPERVISOR',
    [user],
  );
  const canViewRefereeReportTab =
    user?.role !== 'SUPERVISOR' && Boolean(canViewOfficialAssignments || canViewMatchReport);

  const loadRosters = useCallback(async (m: Match) => {
    setRosterLoading(true);
    try {
      const [home, away] = await Promise.all([
        apiGetTeamRoster(m.homeTeamId),
        apiGetTeamRoster(m.awayTeamId),
      ]);
      setHomeRoster(home.players ?? []);
      setAwayRoster(away.players ?? []);
    } catch (_err) {
      setHomeRoster([]);
      setAwayRoster([]);
    } finally {
      setRosterLoading(false);
    }
  }, []);

  const loadLineupData = useCallback(
    async (matchId: string) => {
      setLineupLoading(true);
      try {
        const [nextLineups, nextSuspensions] = await Promise.all([
          apiGetMatchLineups(matchId),
          apiGetMatchSuspensions(matchId),
        ]);
        setLineups(nextLineups ?? []);
        setSuspensions(nextSuspensions ?? []);
      } catch (_err) {
        setLineups([]);
        setSuspensions([]);
        message.error(t('matchDetail.lineupLoadError'));
      } finally {
        setLineupLoading(false);
      }
    },
    [t],
  );

  const loadOfficialData = useCallback(
    async (matchId: string) => {
      setOfficialLoading(true);
      try {
        const [nextOfficials, nextAssignments, nextReport, nextDisciplineReport] =
          await Promise.all([
            canViewOfficialsDirectory ? apiGetOfficials() : Promise.resolve([]),
            apiGetMatchOfficials(matchId),
            canViewMatchReport ? apiGetMatchReport(matchId) : Promise.resolve(null),
            canViewDisciplineReport ? apiGetDisciplineReport(matchId) : Promise.resolve(null),
          ]);
        setOfficials(nextOfficials ?? []);
        setOfficialAssignments(nextAssignments ?? []);
        setMatchReport(nextReport ?? null);
        setDisciplineReport(nextDisciplineReport ?? null);
        setSelectedOfficialId((current) => current ?? nextOfficials?.[0]?.id);
        const supervisorAssignment = nextAssignments?.find(
          (assignment) => assignment.role === 'SUPERVISOR',
        );
        setDisciplineSupervisorId(
          (current) => current ?? supervisorAssignment?.officialId ?? nextOfficials?.[0]?.id,
        );
      } catch (_err) {
        setOfficials([]);
        setOfficialAssignments([]);
        setMatchReport(null);
        setDisciplineReport(null);
        message.error('Không thể tải dữ liệu trọng tài và báo cáo trận đấu.');
      } finally {
        setOfficialLoading(false);
      }
    },
    [
      canViewDisciplineReport,
      canViewMatchReport,
      canViewOfficialsDirectory,
      setDisciplineSupervisorId,
    ],
  );

  const fetchMatch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await apiGetMatch(id);
      setMatch(data);
      loadRosters(data);
      if (canViewLineupData) {
        loadLineupData(data.id);
      } else {
        setLineups([]);
        setSuspensions([]);
      }
      if (canViewOfficialAssignments) {
        loadOfficialData(data.id);
      } else {
        setOfficials([]);
        setOfficialAssignments([]);
        setMatchReport(null);
        setDisciplineReport(null);
      }
    } catch (_err) {
      message.error(t('matchDetail.loadError'));
    } finally {
      setLoading(false);
    }
  }, [
    canViewLineupData,
    canViewOfficialAssignments,
    id,
    loadLineupData,
    loadOfficialData,
    loadRosters,
    t,
  ]);

  useEffect(() => {
    fetchMatch();
  }, [fetchMatch]);

  useEffect(() => {
    if (match && !selectedLineupTeamId) {
      setSelectedLineupTeamId(match.homeTeamId);
    }
  }, [match, selectedLineupTeamId]);

  useEffect(() => {
    if (!disciplineReport) return;
    setDisciplineSupervisorId(disciplineReport.supervisorId);
    setDisciplineRating(disciplineReport.organizationRating);
    setRefereeIssues(disciplineReport.refereeIssues ?? '');
    setPlayerIssues(disciplineReport.playerIssues ?? '');
    setOrganizerIssues(disciplineReport.organizerIssues ?? '');
    setDisciplineNotes(disciplineReport.notes ?? '');
    setSendToDisciplinary(Boolean(disciplineReport.sentToDisciplinaryAt));
  }, [disciplineReport]);

  // ── Real-time WebSocket updates ──
  const { isConnected } = useMatchSocket({
    matchId: id,
    onMatchEvent: useCallback(() => fetchMatch(), [fetchMatch]),
    onScoreUpdate: useCallback((data: { homeScore: number | null; awayScore: number | null }) => {
      setMatch((prev) =>
        prev ? { ...prev, homeScore: data.homeScore, awayScore: data.awayScore } : prev,
      );
    }, []),
    onStatusChange: useCallback(() => fetchMatch(), [fetchMatch]),
  });

  // ── Status update ──
  const handleStatusChange = async (newStatus: string) => {
    if (!match) return;
    try {
      await apiUpdateMatchStatus(match.id, newStatus);
      message.success(
        t('matchDetail.statusChanged', { status: STATUS_MAP[newStatus]?.label ?? newStatus }),
      );
      fetchMatch();
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      message.error((msg as string) || t('matchDetail.statusChangeError'));
    }
  };

  const getStatusActions = (m: Match) => {
    const transitions: Record<string, string[]> = {
      DRAFT: ['PUBLISHED', 'POSTPONED'],
      PUBLISHED: ['LOCKED', 'POSTPONED'],
      LOCKED: ['FINISHED'],
      FINISHED: [],
      POSTPONED: ['DRAFT'],
    };
    return transitions[m.status] ?? [];
  };

  const canSubmitLineup = user?.role === 'ADMIN' || user?.role === 'TEAM_MANAGER';
  const canSubmitLineupForMatch = match?.status === 'PUBLISHED';
  const canReviewLineup = user?.role === 'ADMIN' || user?.role === 'REFEREE';
  const canAssignOfficials = user?.role === 'ADMIN';
  const canSubmitMatchReport = user?.role === 'ADMIN' || (user?.role === 'REFEREE' && !matchReport);
  const canSubmitDisciplineReport =
    user?.role === 'ADMIN' || (user?.role === 'SUPERVISOR' && !disciplineReport);

  const selectedRoster = useMemo(() => {
    if (!match || !selectedLineupTeamId) return [];
    return selectedLineupTeamId === match.homeTeamId ? homeRoster : awayRoster;
  }, [awayRoster, homeRoster, match, selectedLineupTeamId]);

  const filteredSelectedRoster = useMemo(() => {
    const query = normalizeSearchText(lineupRosterSearch);
    if (!query) return selectedRoster;

    return selectedRoster.filter((player) => {
      const haystack = normalizeSearchText(
        [player.fullName, player.position, player.nationality, player.jerseyNumber].join(' '),
      );
      return haystack.includes(query);
    });
  }, [lineupRosterSearch, selectedRoster]);

  const selectedTeamName = useMemo(() => {
    if (!match || !selectedLineupTeamId) return '—';
    if (selectedLineupTeamId === match.homeTeamId) return match.homeTeam?.name ?? '—';
    if (selectedLineupTeamId === match.awayTeamId) return match.awayTeam?.name ?? '—';
    return '—';
  }, [match, selectedLineupTeamId]);

  const supervisorAssignments = useMemo(
    () => officialAssignments.filter((assignment) => assignment.role === 'SUPERVISOR'),
    [officialAssignments],
  );

  const suspendedPlayerIdsForSelectedTeam = useMemo(
    () =>
      new Set(
        suspensions
          .filter((suspension) => suspension.teamId === selectedLineupTeamId)
          .map((suspension) => suspension.playerId),
      ),
    [selectedLineupTeamId, suspensions],
  );

  const lineupCounts = useMemo(() => {
    const selected = selectedRoster.filter((player) => lineupRoles[player.playerId]);
    const starters = selected.filter((player) => lineupRoles[player.playerId] === 'STARTER');
    const substitutes = selected.filter((player) => lineupRoles[player.playerId] === 'SUBSTITUTE');
    const foreignStarters = starters.filter((player) =>
      isForeignNationality(player.nationality),
    ).length;
    const suspendedSelected = selected.filter((player) =>
      suspendedPlayerIdsForSelectedTeam.has(player.playerId),
    );

    return {
      selected,
      starters,
      substitutes,
      foreignStarters,
      suspendedSelected,
    };
  }, [lineupRoles, selectedRoster, suspendedPlayerIdsForSelectedTeam]);

  const isLineupReady =
    lineupCounts.starters.length === 11 &&
    lineupCounts.substitutes.length === 5 &&
    lineupCounts.foreignStarters <= 3 &&
    lineupCounts.suspendedSelected.length === 0;

  const handleLineupTeamChange = (teamId: string) => {
    setSelectedLineupTeamId(teamId);
    setLineupRoles({});
    setLineupRosterSearch('');
  };

  const handleLineupRoleChange = (playerId: string, role: MatchLineupRole | 'NONE') => {
    setLineupRoles((prev) => ({
      ...prev,
      [playerId]: role === 'NONE' ? undefined : role,
    }));
  };

  const handleAutoFillLineup = () => {
    const availablePlayers = selectedRoster.filter(
      (player) => !suspendedPlayerIdsForSelectedTeam.has(player.playerId),
    );
    const nextRoles: Record<string, MatchLineupRole> = {};
    const starterIds = new Set<string>();
    let foreignStarterCount = 0;

    for (const player of availablePlayers) {
      if (starterIds.size >= 11) break;
      const isForeign = isForeignNationality(player.nationality);
      if (isForeign && foreignStarterCount >= 3) continue;
      starterIds.add(player.playerId);
      if (isForeign) foreignStarterCount += 1;
    }

    availablePlayers
      .filter((player) => starterIds.has(player.playerId))
      .forEach((player) => {
        nextRoles[player.playerId] = 'STARTER';
      });
    availablePlayers
      .filter((player) => !starterIds.has(player.playerId))
      .slice(0, 5)
      .forEach((player) => {
        nextRoles[player.playerId] = 'SUBSTITUTE';
      });
    setLineupRoles(nextRoles);
  };

  const handleSubmitLineup = async () => {
    if (!match || !selectedLineupTeamId) return;

    if (!isLineupReady) {
      message.warning(
        'Danh sách phải có đúng 11 chính thức, 5 dự bị, tối đa 3 cầu thủ ngoại đá chính và không có cầu thủ bị treo giò.',
      );
      return;
    }

    setLineupSubmitting(true);
    try {
      await apiSubmitMatchLineup(match.id, {
        teamId: selectedLineupTeamId,
        kitType: lineupKitType,
        formation: lineupFormation,
        players: lineupCounts.selected.map((player) => ({
          playerId: player.playerId,
          role: lineupRoles[player.playerId] as MatchLineupRole,
          position: player.position as PlayerPosition,
          shirtNumber: player.jerseyNumber ?? undefined,
        })),
      });
      message.success('Đã nộp danh sách đăng ký thi đấu.');
      setLineupRoles({});
      setLineupRosterSearch('');
      loadLineupData(match.id);
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      message.error((msg as string) || 'Không thể nộp danh sách đăng ký thi đấu.');
    } finally {
      setLineupSubmitting(false);
    }
  };

  const handleReviewLineup = async (
    lineup: MatchTeamLineup,
    status: Extract<MatchLineupStatus, 'APPROVED' | 'REJECTED'>,
  ) => {
    if (!match) return;
    const reviewNote = lineupReviewNotes[lineup.teamId]?.trim();
    if (status === 'REJECTED' && !reviewNote) {
      message.warning('Vui lòng nhập lý do từ chối để CLB có thể nộp lại.');
      return;
    }

    setLineupReviewingKey(`${lineup.teamId}:${status}`);
    try {
      await apiReviewMatchLineup(match.id, lineup.teamId, {
        status,
        reviewNote: reviewNote || undefined,
      });
      message.success(status === 'APPROVED' ? 'Đã duyệt đội hình.' : 'Đã từ chối đội hình.');
      setLineupReviewNotes((prev) => ({ ...prev, [lineup.teamId]: '' }));
      loadLineupData(match.id);
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      message.error((msg as string) || 'Không thể cập nhật trạng thái đội hình.');
    } finally {
      setLineupReviewingKey(null);
    }
  };

  const handleAssignOfficial = async () => {
    if (!match || !selectedOfficialId) return;
    setOfficialAssigning(true);
    try {
      await apiAssignMatchOfficial(match.id, {
        officialId: selectedOfficialId,
        role: selectedOfficialRole,
        note: officialNote.trim() || undefined,
      });
      message.success('Đã phân công trọng tài/giám sát viên.');
      setOfficialNote('');
      loadOfficialData(match.id);
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      message.error((msg as string) || 'Không thể phân công trọng tài/giám sát viên.');
    } finally {
      setOfficialAssigning(false);
    }
  };

  const handleRemoveOfficialAssignment = async (assignmentId: string) => {
    if (!match) return;
    setOfficialDeletingId(assignmentId);
    try {
      await apiRemoveMatchOfficial(match.id, assignmentId);
      message.success(t('matchDetail.removeOfficialAssignmentSuccess'));
      loadOfficialData(match.id);
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      message.error((msg as string) || t('matchDetail.removeOfficialAssignmentError'));
    } finally {
      setOfficialDeletingId(null);
    }
  };

  const handleOpenAddEvent = () => {
    setEditingEvent(null);
    setEventModalOpen(true);
  };

  const handleOpenEditEvent = (event: MatchEvent) => {
    setEditingEvent(event);
    setEventModalOpen(true);
  };

  const handleEventModalCancel = () => {
    setEditingEvent(null);
    setEventModalOpen(false);
  };

  const handleSubmitMatchReport = async (payload: SubmitMatchReportPayload) => {
    if (!match) return;
    setReportSubmitting(true);
    try {
      await apiSubmitMatchReport(match.id, payload);
      message.success(t('matchDetail.reportSubmitSuccess'));
      fetchMatch();
      loadOfficialData(match.id);
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      message.error((msg as string) || t('matchDetail.reportSubmitError'));
    } finally {
      setReportSubmitting(false);
    }
  };

  const handleSubmitDisciplineReport = async () => {
    if (!match || !disciplineSupervisorId) return;
    setDisciplineSubmitting(true);
    try {
      await apiSubmitDisciplineReport(match.id, {
        supervisorId: disciplineSupervisorId,
        organizationRating: disciplineRating,
        refereeIssues: refereeIssues.trim() || undefined,
        playerIssues: playerIssues.trim() || undefined,
        organizerIssues: organizerIssues.trim() || undefined,
        notes: disciplineNotes.trim() || undefined,
        sendToDisciplinary,
      });
      message.success('Đã nộp báo cáo giám sát.');
      loadOfficialData(match.id);
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      message.error((msg as string) || 'Không thể nộp báo cáo giám sát.');
    } finally {
      setDisciplineSubmitting(false);
    }
  };

  // ── Helpers ──
  const groupByPlayer = (evts: MatchEvent[]) => {
    const grouped = new Map<
      string,
      { name: string; minutes: { minute: number; type: string }[] }
    >();
    for (const g of evts) {
      const pid = g.player?.id ?? g.id;
      const existing = grouped.get(pid);
      if (existing) {
        existing.minutes.push({ minute: g.minute, type: g.type });
      } else {
        grouped.set(pid, {
          name: g.player?.fullName ?? '—',
          minutes: [{ minute: g.minute, type: g.type }],
        });
      }
    }
    return Array.from(grouped.entries());
  };

  // ── Loading / Not found ──
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!match) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Title level={4}>{t('matchDetail.notFound')}</Title>
        <Button onClick={() => navigate('/matches')}>{t('matchDetail.back')}</Button>
      </div>
    );
  }

  // ── Data derivation ──
  const events = match.events ?? [];
  const homeGoals = events
    .filter(
      (e) =>
        ((e.type === 'GOAL' || e.type === 'PENALTY') && e.team?.id === match.homeTeamId) ||
        (e.type === 'OWN_GOAL' && e.team?.id === match.awayTeamId),
    )
    .sort((a, b) => a.minute - b.minute);
  const awayGoals = events
    .filter(
      (e) =>
        ((e.type === 'GOAL' || e.type === 'PENALTY') && e.team?.id === match.awayTeamId) ||
        (e.type === 'OWN_GOAL' && e.team?.id === match.homeTeamId),
    )
    .sort((a, b) => a.minute - b.minute);
  const homeCards = events
    .filter(
      (e) => (e.type === 'YELLOW_CARD' || e.type === 'RED_CARD') && e.team?.id === match.homeTeamId,
    )
    .sort((a, b) => a.minute - b.minute);
  const awayCards = events
    .filter(
      (e) => (e.type === 'YELLOW_CARD' || e.type === 'RED_CARD') && e.team?.id === match.awayTeamId,
    )
    .sort((a, b) => a.minute - b.minute);

  // Stats derivation
  const homeYellows = homeCards.filter((c) => c.type === 'YELLOW_CARD').length;
  const homeReds = homeCards.filter((c) => c.type === 'RED_CARD').length;
  const awayYellows = awayCards.filter((c) => c.type === 'YELLOW_CARD').length;
  const awayReds = awayCards.filter((c) => c.type === 'RED_CARD').length;
  const homeSubs = events.filter(
    (e) => e.type === 'SUBSTITUTION' && e.team?.id === match.homeTeamId,
  ).length;
  const awaySubs = events.filter(
    (e) => e.type === 'SUBSTITUTION' && e.team?.id === match.awayTeamId,
  ).length;
  const homeTheme = getTeamTheme(match.homeTeam);
  const awayTheme = getTeamTheme(match.awayTeam);
  const scoreHeroStyle = {
    '--match-home-primary': homeTheme.primary,
    '--match-home-secondary': homeTheme.secondary,
    '--match-home-accent': homeTheme.accent,
    '--match-home-border': homeTheme.border,
    '--match-away-primary': awayTheme.primary,
    '--match-away-secondary': awayTheme.secondary,
    '--match-away-accent': awayTheme.accent,
    '--match-away-border': awayTheme.border,
  } as CSSProperties;

  const renderScorers = (goals: MatchEvent[], align: 'left' | 'right' | 'center') => {
    if (goals.length === 0) return null;
    return (
      <div className="match-detail-event-stack">
        {groupByPlayer(goals).map(([pid, { name, minutes }]) => (
          <div key={pid} className="match-detail-event-line" style={{ textAlign: align }}>
            <AimOutlined /> <span className="match-detail-event-player">{name}</span>{' '}
            <span className="match-detail-event-minute">
              {minutes
                .sort((a, b) => a.minute - b.minute)
                .map((m) => {
                  const suffix =
                    m.type === 'OWN_GOAL' ? ' (PL)' : m.type === 'PENALTY' ? ' (P)' : '';
                  return `${m.minute}'${suffix}`;
                })
                .join(', ')}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderCards = (cards: MatchEvent[], align: 'left' | 'right' | 'center') => {
    if (cards.length === 0) return null;
    return (
      <div className="match-detail-event-stack match-detail-card-stack">
        {groupByPlayer(cards).map(([pid, { name, minutes }]) => (
          <div key={pid} className="match-detail-event-line" style={{ textAlign: align }}>
            {minutes
              .sort((a, b) => a.minute - b.minute)
              .map((m, i) => (
                <span key={i}>
                  {i > 0 && ', '}
                  <WarningOutlined
                    style={{ color: m.type === 'RED_CARD' ? '#cf1322' : '#d48806' }}
                  />
                </span>
              ))}{' '}
            <span className="match-detail-event-player">{name}</span>{' '}
            <span className="match-detail-event-minute">
              {minutes
                .sort((a, b) => a.minute - b.minute)
                .map((m) => `${m.minute}'`)
                .join(', ')}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const rosterColumns = [
    {
      title: t('matchDetail.colJersey'),
      dataIndex: 'jerseyNumber',
      key: 'jerseyNumber',
      width: 80,
      sorter: (a: RosterPlayer, b: RosterPlayer) => (a.jerseyNumber ?? 99) - (b.jerseyNumber ?? 99),
      render: (v: number | null) => v ?? '—',
    },
    {
      title: t('matchDetail.colPlayer'),
      dataIndex: 'fullName',
      key: 'fullName',
      render: (name: string, r: RosterPlayer) => (
        <a onClick={() => navigate(`/players/${r.playerId}`)}>{name}</a>
      ),
    },
    {
      title: t('matchDetail.colPosition'),
      dataIndex: 'position',
      key: 'position',
      width: 120,
      render: (pos: string) => {
        const p = POSITION_MAP[pos];
        return <Tag color={p?.color}>{p?.label ?? pos}</Tag>;
      },
    },
  ];

  const lineupSelectionColumns = [
    {
      title: t('matchDetail.colJersey'),
      dataIndex: 'jerseyNumber',
      key: 'jerseyNumber',
      width: 72,
      render: (v: number | null) => v ?? '—',
    },
    {
      title: t('matchDetail.colPlayer'),
      dataIndex: 'fullName',
      key: 'fullName',
      render: (name: string, player: RosterPlayer) => {
        const isSuspended = suspendedPlayerIdsForSelectedTeam.has(player.playerId);
        return (
          <Space direction="vertical" size={0}>
            <a onClick={() => navigate(`/players/${player.playerId}`)}>{name}</a>
            <Space size={4} wrap>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {player.nationality ?? '—'}
              </Text>
              {isForeignNationality(player.nationality) && (
                <Tag color="purple">{t('matchDetail.foreignPlayerTag')}</Tag>
              )}
              {isSuspended && <Tag color="red">{t('matchDetail.suspendedTag')}</Tag>}
            </Space>
          </Space>
        );
      },
    },
    {
      title: t('matchDetail.colPosition'),
      dataIndex: 'position',
      key: 'position',
      width: 110,
      render: (pos: string) => {
        const p = POSITION_MAP[pos];
        return <Tag color={p?.color}>{p?.label ?? pos}</Tag>;
      },
    },
    {
      title: t('matchDetail.colRole'),
      key: 'lineupRole',
      width: 170,
      render: (_: unknown, player: RosterPlayer) => {
        const isSuspended = suspendedPlayerIdsForSelectedTeam.has(player.playerId);
        return (
          <Select
            value={lineupRoles[player.playerId] ?? 'NONE'}
            disabled={isSuspended}
            style={{ width: '100%' }}
            onChange={(value) =>
              handleLineupRoleChange(player.playerId, value as MatchLineupRole | 'NONE')
            }
            options={[
              { value: 'NONE', label: t('matchDetail.lineupRoleNone') },
              { value: 'STARTER', label: t('matchDetail.lineupRoleStarter') },
              { value: 'SUBSTITUTE', label: t('matchDetail.lineupRoleSubstitute') },
            ]}
          />
        );
      },
    },
  ];

  const suspensionColumns = [
    {
      title: t('matchDetail.colPlayer'),
      key: 'player',
      render: (_: unknown, suspension: MatchSuspension) =>
        suspension.player?.fullName ?? suspension.playerId,
    },
    {
      title: t('matchDetail.colTeam'),
      key: 'team',
      render: (_: unknown, suspension: MatchSuspension) =>
        suspension.team?.name ?? suspension.teamId,
    },
    {
      title: t('matchDetail.colReason'),
      dataIndex: 'reason',
      key: 'reason',
      render: (reason: string) => (
        <Tag color={reason === 'RED_CARD' ? 'red' : 'gold'}>
          {suspensionReasonLabel[reason] ?? reason}
        </Tag>
      ),
    },
    {
      title: t('matchDetail.colSourceMatch'),
      key: 'sourceMatch',
      width: 120,
      render: (_: unknown, suspension: MatchSuspension) =>
        suspension.sourceMatch ? `${t('common.round')} ${suspension.sourceMatch.roundNo}` : '—',
    },
  ];

  const submittedLineupColumns = [
    {
      title: t('matchDetail.colJersey'),
      dataIndex: 'shirtNumber',
      key: 'shirtNumber',
      width: 72,
      render: (value: number | null) => value ?? '—',
    },
    {
      title: t('matchDetail.colPlayer'),
      key: 'player',
      render: (_: unknown, player: NonNullable<MatchTeamLineup['lineupPlayers']>[number]) =>
        player.player?.fullName ?? player.playerId,
    },
    {
      title: t('matchDetail.colRole'),
      dataIndex: 'role',
      key: 'role',
      width: 110,
      render: (role: MatchLineupRole) => (
        <Tag color={role === 'STARTER' ? 'green' : 'blue'}>
          {role === 'STARTER'
            ? t('matchDetail.lineupRoleStarter')
            : t('matchDetail.lineupRoleSubstitute')}
        </Tag>
      ),
    },
  ];

  const officialAssignmentColumns = [
    {
      title: t('matchDetail.colRole'),
      dataIndex: 'role',
      key: 'role',
      width: 160,
      render: (role: MatchOfficialRole) => (
        <Tag color={role === 'SUPERVISOR' ? 'purple' : 'blue'}>
          {officialRoleLabel[role] ?? role}
        </Tag>
      ),
    },
    {
      title: t('matchDetail.colFullName'),
      key: 'official',
      render: (_: unknown, assignment: MatchOfficialAssignment) =>
        renderOfficialNameWithAccountRole(assignment.official, assignment.officialId),
    },
    {
      title: t('matchDetail.colNote'),
      dataIndex: 'note',
      key: 'note',
      render: (note: string | null) => note || '—',
    },
    ...(canAssignOfficials
      ? [
          {
            title: t('common.operations'),
            key: 'action',
            width: 120,
            render: (_: unknown, assignment: MatchOfficialAssignment) => (
              <Popconfirm
                title={t('matchDetail.removeOfficialAssignmentConfirm')}
                okText={t('common.confirm')}
                cancelText={t('common.cancel')}
                onConfirm={() => handleRemoveOfficialAssignment(assignment.id)}
              >
                <Button
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  loading={officialDeletingId === assignment.id}
                  aria-label={t('matchDetail.removeOfficialAssignmentBtn')}
                >
                  {t('matchDetail.removeOfficialAssignmentBtn')}
                </Button>
              </Popconfirm>
            ),
          },
        ]
      : []),
  ];

  const renderTeamLogo = (team: Match['homeTeam'], fallback: string) => {
    const logoUrl = getTeamLogoUrl(team);

    if (logoUrl) {
      return (
        <img
          src={logoUrl}
          alt={`${team?.name ?? fallback} logo`}
          className="match-detail-team-logo"
        />
      );
    }

    return (
      <span className="match-detail-team-logo match-detail-team-logo-fallback" aria-hidden="true">
        {(team?.shortName ?? team?.name ?? fallback).slice(0, 3).toUpperCase()}
      </span>
    );
  };

  const refereeReportContent = (
    <RefereeMatchReportPanel
      match={match}
      matchReport={matchReport}
      homeRoster={homeRoster}
      awayRoster={awayRoster}
      canSubmit={Boolean(canSubmitMatchReport)}
      loading={officialLoading}
      submitting={reportSubmitting}
      onSubmit={handleSubmitMatchReport}
    />
  );

  const supervisorReportContent = (
    <Card title={t('matchDetail.supervisorReportTitle')} size="small" loading={officialLoading}>
      {disciplineReport &&
        (() => {
          const ratingMeta = disciplineRatingMeta[disciplineReport.organizationRating] ?? {
            alertType: 'info' as const,
            label: disciplineReport.organizationRating,
          };

          return (
            <Alert
              style={{ marginBottom: 12 }}
              type={ratingMeta.alertType}
              showIcon
              message={t('matchDetail.organizationRatingReported', {
                rating: ratingMeta.label,
              })}
              description={
                <Space direction="vertical" size={2}>
                  <Text>
                    {t('matchDetail.supervisorLabel')}{' '}
                    {disciplineReport.supervisor?.fullName ?? disciplineReport.supervisorId}
                  </Text>
                  {disciplineReport.refereeIssues && (
                    <Text>
                      {t('matchDetail.refereeIssuesLabel')} {disciplineReport.refereeIssues}
                    </Text>
                  )}
                  {disciplineReport.playerIssues && (
                    <Text>
                      {t('matchDetail.playerIssuesLabel')} {disciplineReport.playerIssues}
                    </Text>
                  )}
                  {disciplineReport.organizerIssues && (
                    <Text>
                      {t('matchDetail.organizerIssuesLabel')} {disciplineReport.organizerIssues}
                    </Text>
                  )}
                </Space>
              }
            />
          );
        })()}
      {canSubmitDisciplineReport ? (
        <Space direction="vertical" size={10} style={{ width: '100%' }}>
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Text strong>{t('matchDetail.supervisorFieldLabel')}</Text>
            <Select
              value={disciplineSupervisorId}
              placeholder={t('matchDetail.supervisorSelectPlaceholder')}
              style={{ width: '100%' }}
              onChange={setDisciplineSupervisorId}
              options={
                supervisorAssignments.length
                  ? supervisorAssignments.map((assignment) => ({
                      value: assignment.officialId,
                      label: renderOfficialNameWithAccountRole(
                        assignment.official,
                        assignment.officialId,
                      ),
                    }))
                  : officials.map((official) => ({
                      value: official.id,
                      label: renderOfficialNameWithAccountRole(official, official.id),
                    }))
              }
            />
          </Space>
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Text strong>{t('matchDetail.organizationRatingLabel')}</Text>
            <Select
              value={disciplineRating}
              style={{ width: '100%' }}
              onChange={setDisciplineRating}
              options={[
                { value: 'GOOD', label: t('matchDetail.ratingGood') },
                { value: 'ACCEPTABLE', label: t('matchDetail.ratingAcceptable') },
                { value: 'ISSUES_FOUND', label: t('matchDetail.ratingIssuesFound') },
              ]}
            />
          </Space>
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Text strong>{t('matchDetail.refereeIssuesPlaceholder')}</Text>
            <Input.TextArea
              rows={2}
              value={refereeIssues}
              placeholder={t('matchDetail.refereeIssuesPlaceholder')}
              onChange={(event) => setRefereeIssues(event.target.value)}
            />
          </Space>
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Text strong>{t('matchDetail.playerIssuesPlaceholder')}</Text>
            <Input.TextArea
              rows={2}
              value={playerIssues}
              placeholder={t('matchDetail.playerIssuesPlaceholder')}
              onChange={(event) => setPlayerIssues(event.target.value)}
            />
          </Space>
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Text strong>{t('matchDetail.organizerIssuesPlaceholder')}</Text>
            <Input.TextArea
              rows={2}
              value={organizerIssues}
              placeholder={t('matchDetail.organizerIssuesPlaceholder')}
              onChange={(event) => setOrganizerIssues(event.target.value)}
            />
          </Space>
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Text strong>{t('matchDetail.supervisorNotesPlaceholder')}</Text>
            <Input.TextArea
              rows={2}
              value={disciplineNotes}
              placeholder={t('matchDetail.supervisorNotesPlaceholder')}
              onChange={(event) => setDisciplineNotes(event.target.value)}
            />
          </Space>
          <Flex justify="space-between" align="center" wrap="wrap" gap={8}>
            <Space>
              <Switch checked={sendToDisciplinary} onChange={setSendToDisciplinary} />
              <Text>{t('matchDetail.sendToDiscipline')}</Text>
            </Space>
            <Button
              type="primary"
              icon={<SendOutlined />}
              loading={disciplineSubmitting}
              disabled={!disciplineSupervisorId}
              onClick={handleSubmitDisciplineReport}
            >
              {t('matchDetail.submitSupervisorReportBtn')}
            </Button>
          </Flex>
        </Space>
      ) : (
        <Text type="secondary">{t('matchDetail.supervisorReportReadonly')}</Text>
      )}
    </Card>
  );

  const eventsContent = (
    <Card size="small">
      {events.length === 0 ? (
        <Text type="secondary">{t('matchDetail.noEvents')}</Text>
      ) : (
        <Timeline
          items={[...events]
            .sort((a, b) => a.minute - b.minute)
            .map((e) => {
              const meta = EVENT_TYPE_MAP[e.type] ?? {
                label: e.type,
                color: 'default',
                icon: '•',
              };
              return {
                color: meta.color,
                children: (
                  <Flex justify="space-between" align="flex-start" gap={8}>
                    <div>
                      <strong>
                        {meta.icon} {e.minute}'
                      </strong>{' '}
                      — <Tag color={meta.color}>{meta.label}</Tag>
                      {e.player && (
                        <a onClick={() => navigate(`/players/${e.playerId}`)}>
                          {e.player.fullName}
                        </a>
                      )}
                      {e.relatedPlayer && (
                        <span style={{ color: '#888', marginLeft: 4 }}>
                          (
                          {e.type === 'SUBSTITUTION'
                            ? t('matchDetail.relatedSub', {
                                name: e.relatedPlayer.fullName,
                              })
                            : t('matchDetail.relatedAssist', {
                                name: e.relatedPlayer.fullName,
                              })}
                          )
                        </span>
                      )}
                      {e.team && <span style={{ color: '#888' }}> ({e.team.name})</span>}
                      {e.goalType && <Tag style={{ marginLeft: 4 }}>{e.goalType}</Tag>}
                      {e.note && <span style={{ color: '#888', marginLeft: 8 }}>— {e.note}</span>}
                    </div>
                    {canAssignOfficials && (
                      <Button
                        size="small"
                        icon={<EditOutlined />}
                        aria-label={`Sửa sự kiện ${e.minute}'`}
                        onClick={() => handleOpenEditEvent(e)}
                      >
                        Sửa
                      </Button>
                    )}
                  </Flex>
                ),
              };
            })}
        />
      )}
    </Card>
  );

  const officialAssignmentsContent = (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={14}>
        <Card
          title={t('matchDetail.officialAssignmentsTitle')}
          size="small"
          loading={officialLoading}
        >
          <Table
            dataSource={officialAssignments}
            columns={officialAssignmentColumns}
            rowKey="id"
            pagination={false}
            size="small"
            locale={{ emptyText: t('matchDetail.officialAssignmentsEmpty') }}
          />
        </Card>
      </Col>
      <Col xs={24} lg={10}>
        <Card title={t('matchDetail.assignOfficialsTitle')} size="small" loading={officialLoading}>
          {canAssignOfficials ? (
            <Space direction="vertical" size={10} style={{ width: '100%' }}>
              <Space direction="vertical" size={4} style={{ width: '100%' }}>
                <Text strong>{t('matchDetail.officialSelectLabel')}</Text>
                <Select
                  value={selectedOfficialId}
                  placeholder={t('matchDetail.officialSelectPlaceholder')}
                  style={{ width: '100%' }}
                  onChange={setSelectedOfficialId}
                  options={officials.map((official) => ({
                    value: official.id,
                    label: renderOfficialNameWithAccountRole(official, official.id),
                  }))}
                />
              </Space>
              <Space direction="vertical" size={4} style={{ width: '100%' }}>
                <Text strong>{t('matchDetail.officialRoleLabel')}</Text>
                <Select
                  value={selectedOfficialRole}
                  style={{ width: '100%' }}
                  onChange={(value) => setSelectedOfficialRole(value as MatchOfficialRole)}
                  options={(Object.keys(officialRoleLabel) as MatchOfficialRole[]).map((role) => ({
                    value: role,
                    label: officialRoleLabel[role],
                  }))}
                />
              </Space>
              <Space direction="vertical" size={4} style={{ width: '100%' }}>
                <Text strong>{t('matchDetail.officialNoteLabel')}</Text>
                <Input
                  value={officialNote}
                  placeholder={t('matchDetail.officialNotePlaceholder')}
                  onChange={(event) => setOfficialNote(event.target.value)}
                />
              </Space>
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={officialAssigning}
                disabled={!selectedOfficialId}
                onClick={handleAssignOfficial}
              >
                {t('matchDetail.publishAssignmentBtn')}
              </Button>
            </Space>
          ) : (
            <Text type="secondary">{t('matchDetail.assignOfficialsReadonly')}</Text>
          )}
        </Card>
      </Col>
    </Row>
  );

  return (
    <div>
      {/* Header */}
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/matches')}>
          {t('matchDetail.back')}
        </Button>
        <Title level={4} style={{ margin: 0 }}>
          {t('matchDetail.title', { round: match.roundNo })}
        </Title>
        {isConnected && match.status === 'LOCKED' && (
          <Badge status="processing" text="Live" style={{ marginLeft: 12 }} />
        )}
      </Space>

      {/* Scoreboard */}
      <section
        className="match-detail-score-hero"
        style={scoreHeroStyle}
        aria-label="Bảng tỉ số trận đấu"
      >
        <div className="match-detail-score-hero-top">
          <Space size={8} wrap>
            <Tag color="blue">Vòng {match.roundNo}</Tag>
            <Tag>{match.leg === 1 ? 'Lượt đi' : 'Lượt về'}</Tag>
          </Space>
          <Tag color={STATUS_MAP[match.status]?.color ?? 'default'}>
            {STATUS_MAP[match.status]?.label ?? match.status}
          </Tag>
        </div>

        <div className="match-detail-score-grid">
          <article className="match-detail-score-grid-card match-detail-team-card match-detail-team-card-home">
            <div className="match-detail-team-card-main">
              {renderTeamLogo(match.homeTeam, t('matchDetail.homeLabel'))}
              <div className="match-detail-team-copy">
                <Text className="match-detail-team-role">
                  <HomeOutlined /> {t('matchDetail.homeLabel')}
                </Text>
                <Title level={4} className="match-detail-team-name">
                  {match.homeTeam?.name ?? '—'}
                </Title>
              </div>
            </div>
            <div className="match-detail-team-events">
              {renderScorers(homeGoals, 'left')}
              {renderCards(homeCards, 'left')}
            </div>
          </article>

          <article className="match-detail-score-grid-card match-detail-score-card">
            <Text className="match-detail-score-label">Tỉ số</Text>
            <Title level={1} className="match-detail-score-value">
              {match.homeScore ?? '—'} : {match.awayScore ?? '—'}
            </Title>
            <Text className="match-detail-score-caption">
              {homeGoals.length + awayGoals.length} bàn thắng
            </Text>
          </article>

          <article className="match-detail-score-grid-card match-detail-team-card match-detail-team-card-away">
            <div className="match-detail-team-card-main">
              <div className="match-detail-team-copy">
                <Text className="match-detail-team-role">
                  <SendOutlined /> {t('matchDetail.awayLabel')}
                </Text>
                <Title level={4} className="match-detail-team-name">
                  {match.awayTeam?.name ?? '—'}
                </Title>
              </div>
              {renderTeamLogo(match.awayTeam, t('matchDetail.awayLabel'))}
            </div>
            <div className="match-detail-team-events">
              {renderScorers(awayGoals, 'right')}
              {renderCards(awayCards, 'right')}
            </div>
          </article>
        </div>

        <div className="match-detail-score-meta-grid">
          <div className="match-detail-score-meta-card">
            <CalendarOutlined />
            <span>
              <Text>Thời gian</Text>
              <strong>
                {match.kickoffAt ? dayjs(match.kickoffAt).format('DD/MM/YYYY HH:mm') : '—'}
              </strong>
            </span>
          </div>
          <div className="match-detail-score-meta-card">
            <EnvironmentOutlined />
            <span>
              <Text>Sân vận động</Text>
              <strong>{match.stadium?.name ?? '—'}</strong>
            </span>
          </div>
          <div className="match-detail-score-meta-card">
            <HomeOutlined />
            <span>
              <Text>Mùa giải</Text>
              <strong>{match.season?.name ?? '—'}</strong>
            </span>
          </div>
        </div>
      </section>

      {/* Admin Actions */}
      {canAssignOfficials && (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Flex gap={8} wrap="wrap" align="center">
            <Text strong style={{ marginRight: 8 }}>
              {t('matchDetail.actionsLabel')}
            </Text>
            <Button type="primary" icon={<EditOutlined />} onClick={() => setScoreModalOpen(true)}>
              {t('matchDetail.updateScoreBtn')}
            </Button>
            <Button icon={<PlusOutlined />} onClick={handleOpenAddEvent}>
              {t('matchDetail.addEventBtn')}
            </Button>
            {getStatusActions(match).map((nextStatus) => {
              const s = STATUS_MAP[nextStatus];
              return (
                <Button key={nextStatus} onClick={() => handleStatusChange(nextStatus)}>
                  {t('matchDetail.transitionBtn', { status: s?.label ?? nextStatus })}
                </Button>
              );
            })}
          </Flex>
        </Card>
      )}

      {/* Tabs */}
      <Tabs
        defaultActiveKey="overview"
        items={[
          {
            key: 'overview',
            label: t('matchDetail.tabOverview'),
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Card title={t('matchDetail.matchInfoTitle')} size="small">
                    <Descriptions bordered column={1} size="small">
                      <Descriptions.Item label={t('matchDetail.descRound')}>
                        V{match.roundNo}
                      </Descriptions.Item>
                      <Descriptions.Item label={t('matchDetail.descLeg')}>
                        {match.leg === 1 ? t('common.leg1') : t('common.leg2')}
                      </Descriptions.Item>
                      <Descriptions.Item label={t('matchDetail.descSeason')}>
                        {match.season?.name ?? '—'}
                      </Descriptions.Item>
                      <Descriptions.Item label={t('matchDetail.descStadium')}>
                        {match.stadium?.name ? (
                          <a onClick={() => navigate(`/stadiums/${match.stadiumId}`)}>
                            {match.stadium.name}
                          </a>
                        ) : (
                          '—'
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label={t('matchDetail.descKickoff')}>
                        {match.kickoffAt ? dayjs(match.kickoffAt).format('DD/MM/YYYY HH:mm') : '—'}
                      </Descriptions.Item>
                      <Descriptions.Item label={t('matchDetail.descStatus')}>
                        <Tag color={STATUS_MAP[match.status]?.color}>
                          {STATUS_MAP[match.status]?.label ?? match.status}
                        </Tag>
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card
                    title={t('matchDetail.matchStatsTitle')}
                    size="small"
                    styles={{ body: { padding: 0 } }}
                  >
                    <MatchStatsPanel match={match} events={events} matchReport={matchReport} />
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: 'timeline',
            label: `⏱ ${t('matchDetail.tabTimeline')}`,
            children: (
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <Card size="small">
                  <MatchTimeline
                    events={events}
                    homeTeamId={match.homeTeamId}
                    homeTeamName={match.homeTeam?.name ?? '—'}
                    awayTeamName={match.awayTeam?.name ?? '—'}
                    onPlayerClick={(pid) => navigate(`/players/${pid}`)}
                  />
                </Card>
                {eventsContent}
              </Space>
            ),
          },
          ...(canViewRefereeReportTab
            ? [
                {
                  key: 'referee-report',
                  label: canViewMatchReport
                    ? t('matchDetail.refereeReportTitle')
                    : t('matchDetail.tabOfficials'),
                  children: (
                    <Space direction="vertical" size={16} style={{ width: '100%' }}>
                      {officialAssignmentsContent}
                      {canViewMatchReport && refereeReportContent}
                    </Space>
                  ),
                },
              ]
            : []),
          ...(canViewDisciplineReport
            ? [
                {
                  key: 'supervisor-report',
                  label: t('matchDetail.supervisorReportTitle'),
                  children: supervisorReportContent,
                },
              ]
            : []),
          {
            key: 'lineups',
            label: t('matchDetail.tabLineups'),
            children: (
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <MatchCenter match={match} lineups={lineups} loading={lineupLoading} />
                <Row gutter={[16, 16]}>
                  <Col xs={24} lg={16}>
                    <Card title="Danh sách đã nộp" size="small" loading={lineupLoading}>
                      {lineups.length === 0 ? (
                        <Text type="secondary">Chưa có đội nào nộp danh sách thi đấu.</Text>
                      ) : (
                        <Space direction="vertical" size={12} style={{ width: '100%' }}>
                          {lineups.map((lineup) => {
                            const statusMeta = lineupStatusMap[lineup.status] ?? {
                              color: 'default',
                              label: lineup.status,
                            };
                            const canReviewThisLineup =
                              canReviewLineup && lineup.status === 'SUBMITTED';
                            const rejectionReason =
                              lineup.status === 'REJECTED'
                                ? lineup.reviewNote?.trim() || 'BTC chưa nhập lý do cụ thể.'
                                : null;
                            const lineupPlayers = [...(lineup.lineupPlayers ?? [])].sort((a, b) => {
                              if (a.role !== b.role) return a.role === 'STARTER' ? -1 : 1;
                              return (a.shirtNumber ?? 99) - (b.shirtNumber ?? 99);
                            });
                            const starters = lineupPlayers.filter((p) => p.role === 'STARTER');
                            const substitutes = lineupPlayers.filter(
                              (p) => p.role === 'SUBSTITUTE',
                            );

                            return (
                              <div
                                key={lineup.id}
                                style={{
                                  border: '1px solid #f0f0f0',
                                  borderRadius: 8,
                                  padding: 12,
                                }}
                              >
                                <Flex justify="space-between" align="center" wrap="wrap" gap={8}>
                                  <Space wrap>
                                    <Text strong>{lineup.team?.name ?? lineup.teamId}</Text>
                                    <Tag color={statusMeta.color}>{statusMeta.label}</Tag>
                                    <Tag>{kitTypeLabel[lineup.kitType]}</Tag>
                                    <Tag>{lineup.formation}</Tag>
                                  </Space>
                                  <Text type="secondary">
                                    {starters.length} chính thức · {substitutes.length} dự bị
                                  </Text>
                                </Flex>
                                {rejectionReason ? (
                                  <Alert
                                    style={{ marginTop: 8 }}
                                    showIcon
                                    type="error"
                                    message="Danh sách bị từ chối"
                                    description={
                                      <Space direction="vertical" size={2}>
                                        <Text>{rejectionReason}</Text>
                                        <Text>Vui lòng chỉnh sửa và nộp lại danh sách.</Text>
                                      </Space>
                                    }
                                  />
                                ) : (
                                  lineup.reviewNote && (
                                    <Alert
                                      style={{ marginTop: 8 }}
                                      type="info"
                                      message={lineup.reviewNote}
                                    />
                                  )
                                )}
                                {lineup.status === 'APPROVED' && !lineup.reviewNote && (
                                  <Alert
                                    style={{ marginTop: 8 }}
                                    showIcon
                                    type="success"
                                    message="Đội hình đã được duyệt"
                                  />
                                )}
                                <Table
                                  style={{ marginTop: 8 }}
                                  dataSource={lineupPlayers}
                                  columns={submittedLineupColumns}
                                  rowKey={(player) => player.id}
                                  pagination={false}
                                  size="small"
                                />
                                {canReviewThisLineup && (
                                  <Space
                                    direction="vertical"
                                    size={8}
                                    style={{ width: '100%', marginTop: 12 }}
                                  >
                                    <Text strong>Ghi chú xét duyệt</Text>
                                    <Input.TextArea
                                      rows={2}
                                      placeholder="Ghi chú xét duyệt"
                                      value={lineupReviewNotes[lineup.teamId] ?? ''}
                                      onChange={(event) =>
                                        setLineupReviewNotes((prev) => ({
                                          ...prev,
                                          [lineup.teamId]: event.target.value,
                                        }))
                                      }
                                    />
                                    <Space wrap>
                                      <Button
                                        type="primary"
                                        icon={<CheckOutlined />}
                                        loading={lineupReviewingKey === `${lineup.teamId}:APPROVED`}
                                        onClick={() => handleReviewLineup(lineup, 'APPROVED')}
                                      >
                                        Duyệt
                                      </Button>
                                      <Button
                                        danger
                                        icon={<CloseOutlined />}
                                        loading={lineupReviewingKey === `${lineup.teamId}:REJECTED`}
                                        onClick={() => handleReviewLineup(lineup, 'REJECTED')}
                                      >
                                        Từ chối
                                      </Button>
                                    </Space>
                                  </Space>
                                )}
                              </div>
                            );
                          })}
                        </Space>
                      )}
                    </Card>
                  </Col>
                  <Col xs={24} lg={8}>
                    <Card title="Treo giò trận này" size="small" loading={lineupLoading}>
                      <Table
                        dataSource={suspensions}
                        columns={suspensionColumns}
                        rowKey="id"
                        pagination={false}
                        size="small"
                        locale={{ emptyText: 'Không có cầu thủ bị treo giò.' }}
                      />
                    </Card>
                  </Col>
                </Row>

                {canSubmitLineup && !canSubmitLineupForMatch && (
                  <Alert
                    showIcon
                    type="info"
                    message="Trận đã khóa đội hình; chỉ có thể xem hoặc xét duyệt danh sách đã nộp."
                  />
                )}

                {canSubmitLineup && canSubmitLineupForMatch && (
                  <Card
                    title="Đăng ký thi đấu"
                    size="small"
                    extra={<Text type="secondary">{selectedTeamName}</Text>}
                  >
                    <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
                      <Col xs={24} md={8}>
                        <Text strong>Đội đăng ký</Text>
                        <Select
                          value={selectedLineupTeamId}
                          style={{ width: '100%', marginTop: 6 }}
                          onChange={handleLineupTeamChange}
                          options={[
                            {
                              value: match.homeTeamId,
                              label: match.homeTeam?.name ?? t('matchDetail.homeLabel'),
                            },
                            {
                              value: match.awayTeamId,
                              label: match.awayTeam?.name ?? t('matchDetail.awayLabel'),
                            },
                          ]}
                        />
                      </Col>
                      <Col xs={24} md={8}>
                        <Text strong>Trang phục</Text>
                        <Select
                          value={lineupKitType}
                          style={{ width: '100%', marginTop: 6 }}
                          onChange={setLineupKitType}
                          options={[
                            { value: 'PRIMARY', label: kitTypeLabel.PRIMARY },
                            { value: 'BACKUP', label: kitTypeLabel.BACKUP },
                          ]}
                        />
                      </Col>
                      <Col xs={24} md={8}>
                        <Text strong>Sơ đồ thi đấu</Text>
                        <Select
                          value={lineupFormation}
                          style={{ width: '100%', marginTop: 6 }}
                          onChange={setLineupFormation}
                          options={FORMATION_OPTIONS.map((formation) => ({
                            value: formation,
                            label: formation,
                          }))}
                        />
                      </Col>
                    </Row>

                    <Alert
                      showIcon
                      type={isLineupReady ? 'success' : 'warning'}
                      message="11 chính thức / 5 dự bị"
                      description={`Đã chọn ${lineupCounts.starters.length}/11 chính thức, ${lineupCounts.substitutes.length}/5 dự bị, ${lineupCounts.foreignStarters}/3 ngoại binh đá chính, ${lineupCounts.suspendedSelected.length} cầu thủ treo giò.`}
                      style={{ marginBottom: 12 }}
                    />

                    <Space wrap style={{ marginBottom: 12 }}>
                      <Button onClick={handleAutoFillLineup}>Chọn nhanh 16</Button>
                      <Button onClick={() => setLineupRoles({})}>Xóa chọn</Button>
                      <Button
                        type="primary"
                        icon={<SendOutlined />}
                        loading={lineupSubmitting}
                        disabled={!isLineupReady}
                        onClick={handleSubmitLineup}
                      >
                        Nộp danh sách
                      </Button>
                    </Space>

                    <Space
                      direction="vertical"
                      size={4}
                      style={{ width: '100%', marginBottom: 12 }}
                    >
                      <Text strong>Tìm cầu thủ trong roster</Text>
                      <Input.Search
                        allowClear
                        value={lineupRosterSearch}
                        placeholder="Tìm cầu thủ trong roster"
                        style={{ maxWidth: 360 }}
                        onChange={(event) => setLineupRosterSearch(event.target.value)}
                      />
                    </Space>

                    <Table
                      dataSource={filteredSelectedRoster}
                      columns={lineupSelectionColumns}
                      rowKey="id"
                      pagination={false}
                      size="small"
                      loading={rosterLoading}
                      locale={{ emptyText: t('matchDetail.rosterEmpty') }}
                      scroll={{ x: 720 }}
                    />
                  </Card>
                )}

                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Card
                      title={t('matchDetail.homeRosterTitle', {
                        team: match.homeTeam?.name ?? t('matchDetail.homeLabel'),
                      })}
                      size="small"
                      loading={rosterLoading}
                    >
                      <Table
                        dataSource={homeRoster}
                        columns={rosterColumns}
                        rowKey="id"
                        pagination={false}
                        size="small"
                        locale={{ emptyText: t('matchDetail.rosterEmpty') }}
                      />
                      <div style={{ marginTop: 8, color: '#888', fontSize: 12 }}>
                        {t('matchDetail.rosterTotal', { count: homeRoster.length })}
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card
                      title={t('matchDetail.awayRosterTitle', {
                        team: match.awayTeam?.name ?? t('matchDetail.awayLabel'),
                      })}
                      size="small"
                      loading={rosterLoading}
                    >
                      <Table
                        dataSource={awayRoster}
                        columns={rosterColumns}
                        rowKey="id"
                        pagination={false}
                        size="small"
                        locale={{ emptyText: t('matchDetail.rosterEmpty') }}
                      />
                      <div style={{ marginTop: 8, color: '#888', fontSize: 12 }}>
                        {t('matchDetail.rosterTotal', { count: awayRoster.length })}
                      </div>
                    </Card>
                  </Col>
                </Row>
              </Space>
            ),
          },
        ]}
      />

      {/* ── Modals ── */}
      <ScoreModal
        match={match}
        open={scoreModalOpen}
        onCancel={() => setScoreModalOpen(false)}
        onSuccess={fetchMatch}
      />
      <EventFormModal
        match={match}
        open={eventModalOpen}
        editingEvent={editingEvent}
        homeRoster={homeRoster}
        awayRoster={awayRoster}
        rosterLoading={rosterLoading}
        onCancel={handleEventModalCancel}
        onSuccess={fetchMatch}
      />

      {/* Stats summary row */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title={t('matchDetail.statTotalEvents')} value={events.length} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title={t('matchDetail.statTotalGoals')}
              value={homeGoals.length + awayGoals.length}
              prefix={<AimOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title={t('matchDetail.statTotalCards')}
              value={homeYellows + awayYellows + homeReds + awayReds}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title={t('matchDetail.statSubstitutions')}
              value={homeSubs + awaySubs}
              prefix={<SwapOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

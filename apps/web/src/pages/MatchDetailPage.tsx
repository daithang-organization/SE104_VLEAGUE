import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  PlusOutlined,
  SendOutlined,
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
  InputNumber,
  message,
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
} from '../services/matchApi';
import { CAN_EDIT_ROLES, EVENT_TYPE_MAP, POSITION_MAP, STATUS_MAP } from './match-detail/constants';
import EventFormModal from './match-detail/EventFormModal';
import MatchCenter from './match-detail/MatchCenter';
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
  const [reportHomeScore, setReportHomeScore] = useState(0);
  const [reportAwayScore, setReportAwayScore] = useState(0);
  const [reportBestPlayerId, setReportBestPlayerId] = useState<string>();
  const [reportNote, setReportNote] = useState('');
  const [technicalStatsText, setTechnicalStatsText] = useState('');
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

  const canEdit = useMemo(() => user?.role && CAN_EDIT_ROLES.includes(user.role), [user]);
  const canViewLineupData = useMemo(
    () => user?.role && ['ADMIN', 'TEAM_MANAGER', 'REFEREE', 'SUPERVISOR'].includes(user.role),
    [user],
  );
  const canViewOfficialData = useMemo(
    () =>
      user?.role &&
      ['ADMIN', 'TEAM_MANAGER', 'REFEREE', 'SUPERVISOR', 'PUBLIC'].includes(user.role),
    [user],
  );

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
            apiGetOfficials(),
            apiGetMatchOfficials(matchId),
            apiGetMatchReport(matchId),
            apiGetDisciplineReport(matchId),
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
    [setDisciplineSupervisorId],
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
      if (canViewOfficialData) {
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
    canViewOfficialData,
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
    if (!match) return;
    setReportHomeScore(matchReport?.homeScore ?? match.homeScore ?? 0);
    setReportAwayScore(matchReport?.awayScore ?? match.awayScore ?? 0);
    setReportBestPlayerId(matchReport?.bestPlayerId ?? undefined);
    setReportNote(matchReport?.note ?? '');
    setTechnicalStatsText(
      matchReport?.technicalStats ? JSON.stringify(matchReport.technicalStats, null, 2) : '',
    );
  }, [match, matchReport]);

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
  const canReviewLineup = user?.role === 'ADMIN' || user?.role === 'REFEREE';
  const canAssignOfficials = user?.role === 'ADMIN';
  const canSubmitMatchReport = user?.role === 'ADMIN' || user?.role === 'REFEREE';
  const canSubmitDisciplineReport = user?.role === 'ADMIN' || user?.role === 'SUPERVISOR';

  const selectedRoster = useMemo(() => {
    if (!match || !selectedLineupTeamId) return [];
    return selectedLineupTeamId === match.homeTeamId ? homeRoster : awayRoster;
  }, [awayRoster, homeRoster, match, selectedLineupTeamId]);

  const selectedTeamName = useMemo(() => {
    if (!match || !selectedLineupTeamId) return '—';
    if (selectedLineupTeamId === match.homeTeamId) return match.homeTeam?.name ?? '—';
    if (selectedLineupTeamId === match.awayTeamId) return match.awayTeam?.name ?? '—';
    return '—';
  }, [match, selectedLineupTeamId]);

  const playerOptions = useMemo(
    () =>
      [...homeRoster, ...awayRoster].map((player) => ({
        value: player.playerId,
        label: `${player.fullName}${player.jerseyNumber ? ` #${player.jerseyNumber}` : ''}`,
      })),
    [awayRoster, homeRoster],
  );

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
    availablePlayers.slice(0, 11).forEach((player) => {
      nextRoles[player.playerId] = 'STARTER';
    });
    availablePlayers.slice(11, 16).forEach((player) => {
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
    setLineupReviewingKey(`${lineup.teamId}:${status}`);
    try {
      await apiReviewMatchLineup(match.id, lineup.teamId, {
        status,
        reviewNote: lineupReviewNotes[lineup.teamId]?.trim() || undefined,
      });
      message.success(status === 'APPROVED' ? 'Đã duyệt đội hình.' : 'Đã từ chối đội hình.');
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

  const parseTechnicalStats = () => {
    const trimmed = technicalStatsText.trim();
    if (!trimmed) return undefined;
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
        throw new Error('Technical stats must be an object');
      }
      return parsed as Record<string, unknown>;
    } catch (_err) {
      message.error('Thông số chuyên môn phải là JSON object hợp lệ.');
      return null;
    }
  };

  const handleSubmitMatchReport = async () => {
    if (!match) return;
    const technicalStats = parseTechnicalStats();
    if (technicalStats === null) return;

    setReportSubmitting(true);
    try {
      await apiSubmitMatchReport(match.id, {
        homeScore: reportHomeScore,
        awayScore: reportAwayScore,
        bestPlayerId: reportBestPlayerId,
        technicalStats,
        note: reportNote.trim() || undefined,
      });
      message.success('Đã nộp báo cáo trọng tài.');
      fetchMatch();
      loadOfficialData(match.id);
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      message.error((msg as string) || 'Không thể nộp báo cáo trọng tài.');
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
            ⚽ <span className="match-detail-event-player">{name}</span>{' '}
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
                  {m.type === 'RED_CARD' ? '🟥' : '🟨'}
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
        assignment.official?.fullName ?? assignment.officialId,
    },
    {
      title: t('matchDetail.colNote'),
      dataIndex: 'note',
      key: 'note',
      render: (note: string | null) => note || '—',
    },
  ];

  // Stats table data
  const statsData = [
    {
      key: 'goals',
      stat: t('matchDetail.statGoals'),
      home: homeGoals.length,
      away: awayGoals.length,
    },
    {
      key: 'yellows',
      stat: t('matchDetail.statYellows'),
      home: homeYellows,
      away: awayYellows,
    },
    {
      key: 'reds',
      stat: t('matchDetail.statReds'),
      home: homeReds,
      away: awayReds,
    },
    {
      key: 'subs',
      stat: t('matchDetail.statSubs'),
      home: homeSubs,
      away: awaySubs,
    },
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
        {isConnected && <Badge status="processing" text="Live" style={{ marginLeft: 12 }} />}
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
      {canEdit && (
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
                  <Card title={t('matchDetail.matchStatsTitle')} size="small">
                    <Table
                      dataSource={statsData}
                      rowKey="key"
                      pagination={false}
                      size="small"
                      columns={[
                        {
                          title: match.homeTeam?.name ?? t('matchDetail.colHome'),
                          dataIndex: 'home',
                          align: 'center',
                          width: 80,
                          render: (v: number) => <strong>{v}</strong>,
                        },
                        {
                          title: t('matchDetail.colStat'),
                          dataIndex: 'stat',
                          align: 'center',
                        },
                        {
                          title: match.awayTeam?.name ?? t('matchDetail.colAway'),
                          dataIndex: 'away',
                          align: 'center',
                          width: 80,
                          render: (v: number) => <strong>{v}</strong>,
                        },
                      ]}
                    />
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: 'timeline',
            label: `⏱ ${t('matchDetail.tabTimeline')}`,
            children: (
              <Card size="small">
                <MatchTimeline
                  events={events}
                  homeTeamId={match.homeTeamId}
                  homeTeamName={match.homeTeam?.name ?? '—'}
                  awayTeamName={match.awayTeam?.name ?? '—'}
                  onPlayerClick={(pid) => navigate(`/players/${pid}`)}
                />
              </Card>
            ),
          },
          {
            key: 'events',
            label: t('matchDetail.tabEvents', { count: events.length }),
            children: (
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
                                {e.note && (
                                  <span style={{ color: '#888', marginLeft: 8 }}>— {e.note}</span>
                                )}
                              </div>
                              {canEdit && (
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
            ),
          },
          {
            key: 'officials',
            label: t('matchDetail.tabOfficials'),
            children: (
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
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
                    <Card
                      title={t('matchDetail.assignOfficialsTitle')}
                      size="small"
                      loading={officialLoading}
                    >
                      {canAssignOfficials ? (
                        <Space direction="vertical" size={10} style={{ width: '100%' }}>
                          <Select
                            value={selectedOfficialId}
                            placeholder={t('matchDetail.officialSelectPlaceholder')}
                            style={{ width: '100%' }}
                            onChange={setSelectedOfficialId}
                            options={officials.map((official) => ({
                              value: official.id,
                              label: official.fullName,
                            }))}
                          />
                          <Select
                            value={selectedOfficialRole}
                            style={{ width: '100%' }}
                            onChange={(value) =>
                              setSelectedOfficialRole(value as MatchOfficialRole)
                            }
                            options={(Object.keys(officialRoleLabel) as MatchOfficialRole[]).map(
                              (role) => ({
                                value: role,
                                label: officialRoleLabel[role],
                              }),
                            )}
                          />
                          <Input
                            value={officialNote}
                            placeholder={t('matchDetail.officialNotePlaceholder')}
                            onChange={(event) => setOfficialNote(event.target.value)}
                          />
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

                <Row gutter={[16, 16]}>
                  <Col xs={24} lg={12}>
                    <Card
                      title={t('matchDetail.refereeReportTitle')}
                      size="small"
                      loading={officialLoading}
                    >
                      {matchReport && (
                        <Alert
                          style={{ marginBottom: 12 }}
                          type="success"
                          showIcon
                          message={t('matchDetail.reportedScore', {
                            home: matchReport.homeScore,
                            away: matchReport.awayScore,
                          })}
                          description={
                            <Space direction="vertical" size={2}>
                              <Text>{t('matchDetail.bestPlayer')}</Text>
                              <Text strong>
                                {matchReport.bestPlayer?.fullName ??
                                  matchReport.bestPlayerId ??
                                  t('matchDetail.notSelected')}
                              </Text>
                              {matchReport.note && <Text>{matchReport.note}</Text>}
                            </Space>
                          }
                        />
                      )}
                      {canSubmitMatchReport ? (
                        <Space direction="vertical" size={10} style={{ width: '100%' }}>
                          <Row gutter={8}>
                            <Col span={12}>
                              <Text strong>
                                {match.homeTeam?.name ?? t('scoreModal.homeDefault')}
                              </Text>
                              <InputNumber
                                min={0}
                                value={reportHomeScore}
                                style={{ width: '100%', marginTop: 6 }}
                                onChange={(value) => setReportHomeScore(Number(value ?? 0))}
                              />
                            </Col>
                            <Col span={12}>
                              <Text strong>
                                {match.awayTeam?.name ?? t('scoreModal.awayDefault')}
                              </Text>
                              <InputNumber
                                min={0}
                                value={reportAwayScore}
                                style={{ width: '100%', marginTop: 6 }}
                                onChange={(value) => setReportAwayScore(Number(value ?? 0))}
                              />
                            </Col>
                          </Row>
                          <Select
                            allowClear
                            showSearch
                            value={reportBestPlayerId}
                            placeholder={t('matchDetail.bestPlayerPlaceholder')}
                            optionFilterProp="label"
                            style={{ width: '100%' }}
                            onChange={setReportBestPlayerId}
                            options={playerOptions}
                          />
                          <Input.TextArea
                            rows={3}
                            value={technicalStatsText}
                            placeholder={t('matchDetail.technicalStatsPlaceholder')}
                            onChange={(event) => setTechnicalStatsText(event.target.value)}
                          />
                          <Input.TextArea
                            rows={2}
                            value={reportNote}
                            placeholder={t('matchDetail.refereeReportNotePlaceholder')}
                            onChange={(event) => setReportNote(event.target.value)}
                          />
                          <Button
                            type="primary"
                            icon={<SendOutlined />}
                            loading={reportSubmitting}
                            onClick={handleSubmitMatchReport}
                          >
                            {t('matchDetail.submitRefereeReportBtn')}
                          </Button>
                        </Space>
                      ) : (
                        <Text type="secondary">{t('matchDetail.refereeReportReadonly')}</Text>
                      )}
                    </Card>
                  </Col>

                  <Col xs={24} lg={12}>
                    <Card
                      title={t('matchDetail.supervisorReportTitle')}
                      size="small"
                      loading={officialLoading}
                    >
                      {disciplineReport && (
                        <Alert
                          style={{ marginBottom: 12 }}
                          type={disciplineReport.sentToDisciplinaryAt ? 'warning' : 'info'}
                          showIcon
                          message={t('matchDetail.organizationRatingReported', {
                            rating: disciplineReport.organizationRating,
                          })}
                          description={
                            <Space direction="vertical" size={2}>
                              <Text>
                                {t('matchDetail.supervisorLabel')}{' '}
                                {disciplineReport.supervisor?.fullName ??
                                  disciplineReport.supervisorId}
                              </Text>
                              {disciplineReport.refereeIssues && (
                                <Text>
                                  {t('matchDetail.refereeIssuesLabel')}{' '}
                                  {disciplineReport.refereeIssues}
                                </Text>
                              )}
                              {disciplineReport.playerIssues && (
                                <Text>
                                  {t('matchDetail.playerIssuesLabel')}{' '}
                                  {disciplineReport.playerIssues}
                                </Text>
                              )}
                              {disciplineReport.organizerIssues && (
                                <Text>
                                  {t('matchDetail.organizerIssuesLabel')}{' '}
                                  {disciplineReport.organizerIssues}
                                </Text>
                              )}
                            </Space>
                          }
                        />
                      )}
                      {canSubmitDisciplineReport ? (
                        <Space direction="vertical" size={10} style={{ width: '100%' }}>
                          <Select
                            value={disciplineSupervisorId}
                            placeholder={t('matchDetail.supervisorSelectPlaceholder')}
                            style={{ width: '100%' }}
                            onChange={setDisciplineSupervisorId}
                            options={
                              supervisorAssignments.length
                                ? supervisorAssignments.map((assignment) => ({
                                    value: assignment.officialId,
                                    label: assignment.official?.fullName ?? assignment.officialId,
                                  }))
                                : officials.map((official) => ({
                                    value: official.id,
                                    label: official.fullName,
                                  }))
                            }
                          />
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
                          <Input.TextArea
                            rows={2}
                            value={refereeIssues}
                            placeholder={t('matchDetail.refereeIssuesPlaceholder')}
                            onChange={(event) => setRefereeIssues(event.target.value)}
                          />
                          <Input.TextArea
                            rows={2}
                            value={playerIssues}
                            placeholder={t('matchDetail.playerIssuesPlaceholder')}
                            onChange={(event) => setPlayerIssues(event.target.value)}
                          />
                          <Input.TextArea
                            rows={2}
                            value={organizerIssues}
                            placeholder={t('matchDetail.organizerIssuesPlaceholder')}
                            onChange={(event) => setOrganizerIssues(event.target.value)}
                          />
                          <Input.TextArea
                            rows={2}
                            value={disciplineNotes}
                            placeholder={t('matchDetail.supervisorNotesPlaceholder')}
                            onChange={(event) => setDisciplineNotes(event.target.value)}
                          />
                          <Flex justify="space-between" align="center" wrap="wrap" gap={8}>
                            <Space>
                              <Switch
                                checked={sendToDisciplinary}
                                onChange={setSendToDisciplinary}
                              />
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
                  </Col>
                </Row>
              </Space>
            ),
          },
          {
            key: 'lineups',
            label: t('matchDetail.tabLineups'),
            children: (
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <MatchCenter
                  match={match}
                  events={events}
                  lineups={lineups}
                  matchReport={matchReport}
                  loading={lineupLoading}
                  onPlayerClick={(pid) => navigate(`/players/${pid}`)}
                />
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
                                {lineup.reviewNote && (
                                  <Alert
                                    style={{ marginTop: 8 }}
                                    type={lineup.status === 'REJECTED' ? 'error' : 'info'}
                                    message={lineup.reviewNote}
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
                                {canReviewLineup && (
                                  <Space
                                    direction="vertical"
                                    size={8}
                                    style={{ width: '100%', marginTop: 12 }}
                                  >
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

                {canSubmitLineup && (
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

                    <Table
                      dataSource={selectedRoster}
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
              prefix="⚽"
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title={t('matchDetail.statTotalCards')}
              value={homeYellows + awayYellows + homeReds + awayReds}
              prefix="🃏"
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title={t('matchDetail.statSubstitutions')}
              value={homeSubs + awaySubs}
              prefix="🔄"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

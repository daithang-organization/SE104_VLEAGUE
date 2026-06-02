import {
  EditOutlined,
  FieldTimeOutlined,
  LeftOutlined,
  PlusOutlined,
  ReloadOutlined,
  RightOutlined,
  SendOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  DatePicker,
  Descriptions,
  Flex,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Spin,
  Tabs,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import type { EventFormRow } from '../components';
import {
  AppMenuIcon,
  EventModal,
  MatchFixtureCard,
  PageCover,
  ScoreEditModal,
} from '../components';
import { compareSeasonsByLatest, getLatestSeason } from '../hooks/useSeasonSelection';
import {
  apiAddMatchEvent,
  apiGetAssignedMatches,
  apiGetMatch,
  apiGetMatches,
  apiGetTeamRoster,
  apiUpdateMatch,
  apiUpdateMatchStatus,
  type AddMatchEventPayload,
  type Match,
  type MatchEvent,
  type RosterPlayer,
} from '../services/matchApi';
import { apiGenerateSchedule, apiPublishSchedule } from '../services/scheduleApi';
import { apiGetSeasons, type Season } from '../services/seasonApi';
import { apiGetStadiums, type Stadium } from '../services/teamApi';
import { apiGetTeamManagerManagedTeam } from '../services/teamManagerApi';
import { CAN_EDIT_ROLES, EVENT_TYPE_MAP, STATUS_MAP } from '../utils/constants';
import { getTeamLogoUrl } from '../utils/teamLogos';

function formatMatchDateLabel(kickoffAt?: string | null) {
  if (!kickoffAt) return 'Chưa xếp lịch';
  const date = dayjs(kickoffAt);
  const weekday = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][date.day()];
  return `${weekday}, ${date.format('D/M')}`;
}

function compareMatchesByKickoff(a: Match, b: Match) {
  if (!a.kickoffAt && !b.kickoffAt) return a.id.localeCompare(b.id);
  if (!a.kickoffAt) return 1;
  if (!b.kickoffAt) return -1;

  const timeDiff = new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime();
  return timeDiff || a.id.localeCompare(b.id);
}

function isMatchLockedByInactiveTeam(match: Match) {
  return match.homeTeam?.status === 'INACTIVE' || match.awayTeam?.status === 'INACTIVE';
}

export default function MatchesPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | undefined>();
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [filterTeam, setFilterTeam] = useState<string | undefined>();
  const [activeLeg, setActiveLeg] = useState<string>(() =>
    user?.role === 'REFEREE' || user?.role === 'SUPERVISOR' ? 'assigned' : 'all',
  );
  const [activeRoundNo, setActiveRoundNo] = useState<number | undefined>();
  const [managedTeamId, setManagedTeamId] = useState<string | null>(null);
  const [officialAssignedCount, setOfficialAssignedCount] = useState<number | null>(null);
  const [officialAllCount, setOfficialAllCount] = useState<number | null>(null);
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [generateSeasonId, setGenerateSeasonId] = useState<string | undefined>();
  const [editingScheduleMatch, setEditingScheduleMatch] = useState<Match | null>(null);
  const [scheduleEditOpen, setScheduleEditOpen] = useState(false);
  const [savingScheduleMatch, setSavingScheduleMatch] = useState(false);
  const [scheduleForm] = Form.useForm();

  // Detail modal
  const [detailMatch, setDetailMatch] = useState<Match | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Score edit
  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [scoreMatch, setScoreMatch] = useState<Match | null>(null);
  const [savingScore, setSavingScore] = useState(false);

  // Progress edit
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [progressMatch, setProgressMatch] = useState<Match | null>(null);
  const [savingProgress, setSavingProgress] = useState(false);
  const [progressForm] = Form.useForm<{ status: string }>();

  // Event modal
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [savingEvent, setSavingEvent] = useState(false);
  const [homeRoster, setHomeRoster] = useState<RosterPlayer[]>([]);
  const [awayRoster, setAwayRoster] = useState<RosterPlayer[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);

  const canEdit = useMemo(() => user?.role && CAN_EDIT_ROLES.includes(user.role), [user]);
  const isManager = user?.role === 'TEAM_MANAGER';
  const isAssignedOfficial = user?.role === 'REFEREE' || user?.role === 'SUPERVISOR';
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    let cancelled = false;

    if (!isManager) {
      setManagedTeamId(null);
      return () => {
        cancelled = true;
      };
    }

    apiGetTeamManagerManagedTeam()
      .then((team) => {
        if (!cancelled) setManagedTeamId(team?.id ?? null);
      })
      .catch(() => {
        if (!cancelled) setManagedTeamId(null);
      });

    return () => {
      cancelled = true;
    };
  }, [isManager]);

  useEffect(() => {
    if (!isAdmin) {
      setStadiums([]);
      return;
    }

    apiGetStadiums()
      .then(setStadiums)
      .catch(() => setStadiums([]));
  }, [isAdmin]);

  const loadMatches = useCallback(
    async (
      seasonId?: string,
      search?: string,
      status?: string,
      teamId?: string,
      officialTabKey?: string,
    ) => {
      setLoading(true);
      try {
        const applyLocalFilters = (source: Match[]) => {
          let data = source;
          if (search) {
            const q = search.toLowerCase().trim();
            data = data.filter(
              (m) =>
                m.homeTeam?.name?.toLowerCase().includes(q) ||
                m.awayTeam?.name?.toLowerCase().includes(q),
            );
          }
          if (status) {
            data = data.filter((m) => m.status === status);
          }
          if (teamId) {
            data = data.filter((m) => m.homeTeamId === teamId || m.awayTeamId === teamId);
          }
          return data;
        };

        let data: Match[];

        // Use 1000 limit to ensure we get all matches for local grouping
        if (isAssignedOfficial) {
          const [assignedRes, allRes] = await Promise.all([
            apiGetAssignedMatches(seasonId, 1, 1000),
            apiGetMatches(seasonId, 1, 1000),
          ]);
          const assignedData = applyLocalFilters(assignedRes.data);
          const allData = applyLocalFilters(allRes.data);
          setOfficialAssignedCount(assignedData.length);
          setOfficialAllCount(allData.length);
          data = officialTabKey === 'all' ? allData : assignedData;
        } else {
          const res = await apiGetMatches(seasonId, 1, 1000);
          data = applyLocalFilters(res.data);
          setOfficialAssignedCount(null);
          setOfficialAllCount(null);
        }

        setMatches(data);
      } catch (_err) {
        // Prevent spamming toasts by checking if it's already visible or just using a flag
        message.error(t('matches.loadError'), 3);
      } finally {
        setLoading(false);
      }
    },
    [isAssignedOfficial, t],
  );

  // Initial fetch seasons
  useEffect(() => {
    apiGetSeasons()
      .then((data) => {
        const sortedSeasons = [...data].sort(compareSeasonsByLatest);
        setSeasons(sortedSeasons);
        const latestSeason = getLatestSeason(sortedSeasons);
        if (latestSeason) {
          const initialSeasonId = latestSeason.id;
          setSelectedSeasonId(initialSeasonId);
          loadMatches(
            initialSeasonId,
            undefined,
            undefined,
            undefined,
            isAssignedOfficial ? 'assigned' : 'all',
          );
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, [isAssignedOfficial, loadMatches]);

  const onSearch = (value: string) => {
    setSearchText(value);
    loadMatches(selectedSeasonId, value, filterStatus, filterTeam, activeLeg);
  };

  const onStatusChange = (val: string) => {
    setFilterStatus(val);
    loadMatches(selectedSeasonId, searchText, val, filterTeam, activeLeg);
  };

  const onTeamChange = (val: string) => {
    setFilterTeam(val);
    loadMatches(selectedSeasonId, searchText, filterStatus, val, activeLeg);
  };

  const onSeasonChange = (val: string) => {
    setSelectedSeasonId(val);
    loadMatches(val, searchText, filterStatus, filterTeam, activeLeg);
  };

  const handleReload = () => {
    loadMatches(selectedSeasonId, searchText, filterStatus, filterTeam, activeLeg);
  };

  const onResultTabChange = (key: string) => {
    setActiveLeg(key);
    if (isAssignedOfficial) {
      loadMatches(selectedSeasonId, searchText, filterStatus, filterTeam, key);
    }
  };

  useEffect(() => {
    if (isAssignedOfficial && (activeLeg === '1' || activeLeg === '2' || activeLeg === 'mine')) {
      setActiveLeg('assigned');
    } else if (!isAssignedOfficial && activeLeg === 'assigned') {
      setActiveLeg('all');
    } else if (isManager && (activeLeg === '1' || activeLeg === '2')) {
      setActiveLeg('all');
    } else if (!isManager && activeLeg === 'mine') {
      setActiveLeg('all');
    }
  }, [activeLeg, isAssignedOfficial, isManager]);

  const managerMatches = useMemo(() => {
    if (!managedTeamId) return [];
    return matches.filter(
      (match) => match.homeTeamId === managedTeamId || match.awayTeamId === managedTeamId,
    );
  }, [managedTeamId, matches]);

  // Group matches by round
  const filteredMatches = useMemo(() => {
    if (isAssignedOfficial) return matches;
    if (isManager && activeLeg === 'mine') return managerMatches;
    if (activeLeg === 'all') return matches;
    return matches.filter((m) => m.leg === Number(activeLeg));
  }, [activeLeg, isAssignedOfficial, isManager, managerMatches, matches]);

  const resultTabItems = useMemo(() => {
    if (isManager) {
      return [
        { key: 'all', label: t('schedule.tabAll', { count: matches.length }) },
        {
          key: 'mine',
          label: t('matches.tabMine', { count: managerMatches.length }),
        },
      ];
    }

    if (isAssignedOfficial) {
      return [
        {
          key: 'assigned',
          label: t('matches.tabAssigned', { count: officialAssignedCount ?? matches.length }),
        },
        {
          key: 'all',
          label: t('matches.tabAllMatches', { count: officialAllCount ?? matches.length }),
        },
      ];
    }

    return [
      { key: 'all', label: t('schedule.tabAll', { count: matches.length }) },
      {
        key: '1',
        label: t('schedule.tabLeg1', { count: matches.filter((m) => m.leg === 1).length }),
      },
      {
        key: '2',
        label: t('schedule.tabLeg2', { count: matches.filter((m) => m.leg === 2).length }),
      },
    ];
  }, [
    isAssignedOfficial,
    isManager,
    managerMatches.length,
    matches,
    officialAllCount,
    officialAssignedCount,
    t,
  ]);

  const availableTeams = useMemo(() => {
    const teamMap = new Map<string, string>();
    // We want to see all teams in the filter, so we use the full list of matches
    matches.forEach((match) => {
      if (match.homeTeam) teamMap.set(match.homeTeamId, match.homeTeam.name);
      if (match.awayTeam) teamMap.set(match.awayTeamId, match.awayTeam.name);
    });
    return [...teamMap.entries()].map(([id, name]) => ({ value: id, label: name }));
  }, [matches]);

  // Use roundGroups for the round navigator
  const roundGroups = useMemo(() => {
    const grouped = new Map<number, Match[]>();
    for (const match of filteredMatches) {
      const round = match.roundNo ?? 0;
      if (!grouped.has(round)) grouped.set(round, []);
      grouped.get(round)!.push(match);
    }
    return Array.from(grouped.entries()).sort(([a], [b]) => a - b);
  }, [filteredMatches]);

  useEffect(() => {
    if (roundGroups.length === 0) {
      setActiveRoundNo(undefined);
      return;
    }
    if (!activeRoundNo || !roundGroups.some(([roundNo]) => roundNo === activeRoundNo)) {
      const firstPendingRound = roundGroups.find(([, roundMatches]) =>
        roundMatches.some((m) => m.status !== 'FINISHED'),
      );
      setActiveRoundNo(firstPendingRound?.[0] ?? roundGroups[0][0]);
    }
  }, [activeRoundNo, roundGroups]);

  const activeRoundIndex = roundGroups.findIndex(([roundNo]) => roundNo === activeRoundNo);
  const activeRound = activeRoundIndex >= 0 ? roundGroups[activeRoundIndex] : undefined;
  const activeRoundMatches = useMemo(() => activeRound?.[1] ?? [], [activeRound]);
  const activeRoundFinishedCount = activeRoundMatches.filter((m) => m.status === 'FINISHED').length;
  const activeRoundDates = activeRoundMatches
    .filter((m) => m.kickoffAt)
    .map((m) => dayjs(m.kickoffAt!));
  const activeRoundDateLabel =
    activeRoundDates.length > 0
      ? activeRoundDates.reduce((a, b) => (a.isBefore(b) ? a : b)).format('DD/MM/YYYY')
      : '';
  const activeRoundMatchGroups = useMemo(() => {
    const map = new Map<string, Match[]>();
    [...activeRoundMatches].sort(compareMatchesByKickoff).forEach((match) => {
      const key = match.kickoffAt ? dayjs(match.kickoffAt).format('YYYY-MM-DD') : 'unscheduled';
      const list = map.get(key) ?? [];
      list.push(match);
      map.set(key, list);
    });

    return [...map.entries()].sort(([a], [b]) => {
      if (a === 'unscheduled') return 1;
      if (b === 'unscheduled') return -1;
      return a.localeCompare(b);
    });
  }, [activeRoundMatches]);

  const loadRosters = async (match: Match) => {
    setRosterLoading(true);
    try {
      const [home, away] = await Promise.all([
        apiGetTeamRoster(match.homeTeamId),
        apiGetTeamRoster(match.awayTeamId),
      ]);
      setHomeRoster(home.players ?? []);
      setAwayRoster(away.players ?? []);
    } catch (_err) {
      setHomeRoster([]);
      setAwayRoster([]);
    } finally {
      setRosterLoading(false);
    }
  };

  const openGenerateModal = () => {
    setGenerateSeasonId(selectedSeasonId);
    setGenerateModalOpen(true);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const result = await apiGenerateSchedule(generateSeasonId);
      message.success(result.message || t('schedule.generateSuccess'));
      const nextSeasonId = generateSeasonId ?? selectedSeasonId;
      if (generateSeasonId && generateSeasonId !== selectedSeasonId) {
        setSelectedSeasonId(generateSeasonId);
      }
      setGenerateModalOpen(false);
      loadMatches(nextSeasonId, searchText, filterStatus, filterTeam, activeLeg);
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      message.error((msg as string) || t('schedule.generateError'));
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const result = await apiPublishSchedule(selectedSeasonId);
      message.success(result.message || t('schedule.publishSuccess'));
      loadMatches(selectedSeasonId, searchText, filterStatus, filterTeam, activeLeg);
    } catch (_err) {
      message.error(t('schedule.publishError'));
    } finally {
      setPublishing(false);
    }
  };

  const openScheduleEditModal = (match: Match) => {
    if (isMatchLockedByInactiveTeam(match)) {
      message.warning('CLB đang không hoạt động, không thể chỉnh sửa trận đấu.');
      return;
    }

    setEditingScheduleMatch(match);
    scheduleForm.setFieldsValue({
      stadiumId: match.stadiumId || undefined,
      kickoffAt: match.kickoffAt ? dayjs(match.kickoffAt) : null,
    });
    setScheduleEditOpen(true);
  };

  const handleSaveScheduleMatch = async () => {
    if (!editingScheduleMatch) return;
    if (isMatchLockedByInactiveTeam(editingScheduleMatch)) {
      message.warning('CLB đang không hoạt động, không thể chỉnh sửa trận đấu.');
      return;
    }

    setSavingScheduleMatch(true);
    try {
      const values = scheduleForm.getFieldsValue();
      await apiUpdateMatch(editingScheduleMatch.id, {
        stadiumId: values.stadiumId || null,
        kickoffAt: values.kickoffAt ? (values.kickoffAt as dayjs.Dayjs).toISOString() : null,
      });
      message.success(t('schedule.matchUpdateSuccess'));
      setScheduleEditOpen(false);
      setEditingScheduleMatch(null);
      loadMatches(selectedSeasonId, searchText, filterStatus, filterTeam, activeLeg);
    } catch (_err) {
      message.error(t('schedule.matchUpdateError'));
    } finally {
      setSavingScheduleMatch(false);
    }
  };

  const viewDetail = async (matchId: string) => {
    setDetailLoading(true);
    try {
      const data = await apiGetMatch(matchId);
      setDetailMatch(data);
      loadRosters(data);
    } catch (_err) {
      message.error(t('matches.detailError'));
    } finally {
      setDetailLoading(false);
    }
  };

  // Score update
  const handleSaveScore = async (homeScore: number, awayScore: number) => {
    const targetMatch = scoreMatch ?? detailMatch;
    if (!targetMatch) return;
    try {
      setSavingScore(true);
      await apiUpdateMatch(targetMatch.id, { homeScore, awayScore });
      message.success(t('matches.scoreUpdated'));
      setScoreModalOpen(false);
      setScoreMatch(null);
      if (detailMatch?.id === targetMatch.id) {
        viewDetail(targetMatch.id);
      }
      loadMatches(selectedSeasonId, searchText, filterStatus, filterTeam, activeLeg);
    } catch (err: unknown) {
      message.error(getApiErrorMessage(err) || t('matches.scoreUpdateError'));
    } finally {
      setSavingScore(false);
    }
  };

  const openScoreEditModal = (match: Match) => {
    if (isMatchLockedByInactiveTeam(match)) {
      message.warning('CLB đang không hoạt động, không thể chỉnh sửa trận đấu.');
      return;
    }

    setScoreMatch(match);
    setScoreModalOpen(true);
  };

  // Status update
  const openProgressEditModal = (match: Match) => {
    if (isMatchLockedByInactiveTeam(match)) {
      message.warning('CLB đang không hoạt động, không thể chỉnh sửa trận đấu.');
      return;
    }

    setProgressMatch(match);
    progressForm.setFieldsValue({ status: match.status });
    setProgressModalOpen(true);
  };

  const handleSaveProgress = async ({ status }: { status: string }) => {
    if (!progressMatch) return;

    try {
      setSavingProgress(true);
      await apiUpdateMatchStatus(progressMatch.id, status);
      message.success(t('matches.statusChanged', { status: STATUS_MAP[status]?.label ?? status }));
      setProgressModalOpen(false);
      setProgressMatch(null);
      if (detailMatch?.id === progressMatch.id) {
        viewDetail(progressMatch.id);
      }
      loadMatches(selectedSeasonId, searchText, filterStatus, filterTeam, activeLeg);
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      message.error((msg as string) || t('matches.statusChangeError'));
    } finally {
      setSavingProgress(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!detailMatch) return;
    try {
      await apiUpdateMatchStatus(detailMatch.id, newStatus);
      message.success(
        t('matches.statusChanged', { status: STATUS_MAP[newStatus]?.label ?? newStatus }),
      );
      viewDetail(detailMatch.id);
      loadMatches(selectedSeasonId, searchText, filterStatus, filterTeam, activeLeg);
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      message.error((msg as string) || t('matches.statusChangeError'));
    }
  };

  // Add events (batch)
  const handleAddEvent = async (teamSide: 'home' | 'away', events: EventFormRow[]) => {
    if (!detailMatch) return;
    try {
      setSavingEvent(true);
      const teamId = teamSide === 'home' ? detailMatch.homeTeamId : detailMatch.awayTeamId;
      if (events.length === 0) {
        message.warning(t('matches.eventWarning'));
        return;
      }
      let successCount = 0;
      for (const evt of events) {
        try {
          const payload: AddMatchEventPayload = {
            minute: evt.minute,
            type: evt.type as AddMatchEventPayload['type'],
            teamId,
            playerId: evt.playerId || undefined,
            note: evt.note || undefined,
            goalType: evt.goalType || undefined,
            relatedPlayerId: evt.relatedPlayerId || undefined,
          };
          await apiAddMatchEvent(detailMatch.id, payload);
          successCount++;
        } catch (_err) {
          message.error(t('matches.eventError', { minute: evt.minute }));
        }
      }
      if (successCount > 0) {
        message.success(t('matches.eventSuccess', { count: successCount }));
        setEventModalOpen(false);
        viewDetail(detailMatch.id);
        loadMatches(selectedSeasonId, searchText, filterStatus, filterTeam, activeLeg);
      }
    } catch (_err) {
      message.error(t('matches.eventAddError'));
    } finally {
      setSavingEvent(false);
    }
  };

  const getStatusActions = (match: Match) => {
    const transitions: Record<string, string[]> = {
      DRAFT: ['PUBLISHED', 'POSTPONED'],
      PUBLISHED: ['LOCKED', 'POSTPONED'],
      LOCKED: ['FINISHED'],
      FINISHED: [],
      POSTPONED: ['DRAFT'],
    };
    return transitions[match.status] ?? [];
  };

  const renderResultFixture = (match: Match) => {
    const status = STATUS_MAP[match.status] ?? { label: match.status, color: 'default' };
    const inactiveTeamLocked = isMatchLockedByInactiveTeam(match);

    return (
      <MatchFixtureCard
        key={match.id}
        id={match.id}
        className="results-fixture-row"
        actionClassName="results-fixture-action"
        roundLabel={t('matches.roundLabel', { round: match.roundNo })}
        statusLabel={status.label}
        statusColor={status.color}
        homeTeamId={match.homeTeamId}
        awayTeamId={match.awayTeamId}
        homeTeam={match.homeTeam}
        awayTeam={match.awayTeam}
        homeScore={match.homeScore}
        awayScore={match.awayScore}
        kickoffAt={match.kickoffAt}
        stadiumName={match.stadium?.name}
        stadiumFallback={t('schedule.stadiumNotSet')}
        kickoffFallback={t('schedule.kickoffNotSet')}
        scoreMode="result-placeholder"
        onTeamClick={(teamId) => navigate(`/teams/${teamId}`)}
        onMatchClick={(matchId) => navigate(`/matches/${matchId}`)}
        onScoreClick={canEdit && !inactiveTeamLocked ? () => openScoreEditModal(match) : undefined}
        scoreTitle={canEdit && !inactiveTeamLocked ? t('matches.scoreUpdateTooltip') : undefined}
        onStatusClick={
          canEdit && !inactiveTeamLocked ? () => openProgressEditModal(match) : undefined
        }
        statusTitle={
          canEdit && !inactiveTeamLocked ? t('matches.progressUpdateTooltip') : undefined
        }
        onScheduleClick={
          isAdmin && !inactiveTeamLocked ? () => openScheduleEditModal(match) : undefined
        }
        scheduleTitle={isAdmin && !inactiveTeamLocked ? t('schedule.editTooltip') : undefined}
      />
    );
  };
  const finishedMatches = matches.filter((match) => match.status === 'FINISHED').length;
  const openMatches = matches.length - finishedMatches;
  const draftCount = matches.filter((match) => match.status === 'DRAFT').length;
  const scoreEditTarget = scoreMatch ?? detailMatch;
  const progressStatusOptions = progressMatch
    ? [progressMatch.status, ...getStatusActions(progressMatch)]
        .filter((status, index, values) => values.indexOf(status) === index)
        .map((status) => ({
          value: status,
          label: STATUS_MAP[status]?.label ?? status,
        }))
    : [];

  const renderEventTimeline = (events: MatchEvent[]) => {
    if (!events || events.length === 0) {
      return <Typography.Text type="secondary">{t('matches.noEvents')}</Typography.Text>;
    }
    return (
      <Timeline
        items={events.map((e) => {
          const meta = EVENT_TYPE_MAP[e.type] ?? { label: e.type, color: 'default', icon: '•' };
          return {
            color: meta.color,
            children: (
              <div>
                <strong>
                  {meta.icon} {e.minute}'
                </strong>{' '}
                - <Tag color={meta.color}>{meta.label}</Tag>
                {e.player && <span>{e.player.fullName}</span>}
                {e.team && <span style={{ color: '#888' }}> ({e.team.name})</span>}
                {e.note && <span style={{ color: '#888', marginLeft: 8 }}>- {e.note}</span>}
              </div>
            ),
          };
        })}
      />
    );
  };

  return (
    <div className="page-stack">
      <PageCover
        eyebrow={t('menu.matches')}
        title={t('matches.title')}
        description={t('matches.subtitle')}
        icon={<AppMenuIcon menuKey="matches" />}
        metrics={[
          {
            label: t('common.total'),
            value: matches.length.toLocaleString('vi-VN'),
            icon: <TrophyOutlined />,
          },
          {
            label: t('matches.played'),
            value: finishedMatches.toLocaleString('vi-VN'),
            icon: <FieldTimeOutlined />,
          },
          {
            label: t('matches.remaining'),
            value: openMatches.toLocaleString('vi-VN'),
            icon: <FieldTimeOutlined />,
          },
        ]}
      />

      <div className="page-toolbar">
        <Space wrap>
          <Input.Search
            placeholder={t('matches.searchPlaceholder')}
            allowClear
            onSearch={onSearch}
            style={{ width: 220 }}
            loading={loading}
          />
          <Select
            value={selectedSeasonId}
            onChange={onSeasonChange}
            style={{ width: 200 }}
            placeholder={t('matches.seasonPlaceholder')}
            allowClear
            options={seasons.map((s) => ({
              value: s.id,
              label: `${s.name} (${s.year}/${s.year + 1})`,
            }))}
          />
          <Select
            value={filterStatus}
            onChange={onStatusChange}
            style={{ width: 140 }}
            placeholder={t('matches.statusPlaceholder')}
            allowClear
            options={Object.entries(STATUS_MAP).map(([value, { label }]) => ({
              value,
              label,
            }))}
          />
          {!isAssignedOfficial && (
            <Select
              value={filterTeam}
              onChange={onTeamChange}
              style={{ width: 180 }}
              placeholder={t('matches.teamFilterPlaceholder')}
              allowClear
              showSearch
              optionFilterProp="label"
              options={availableTeams}
            />
          )}
          <Button icon={<ReloadOutlined />} onClick={handleReload} loading={loading}>
            {t('schedule.reloadBtn')}
          </Button>
        </Space>
        {isAdmin && (
          <Space wrap>
            <Button icon={<ThunderboltOutlined />} onClick={openGenerateModal} loading={generating}>
              {t('schedule.generateBtn')}
            </Button>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handlePublish}
              loading={publishing}
              disabled={draftCount === 0}
            >
              {t('schedule.publishBtn')}
            </Button>
          </Space>
        )}
      </div>

      <Card className="schedule-page-card">
        <Tabs
          activeKey={activeLeg}
          onChange={onResultTabChange}
          items={resultTabItems}
          style={{ marginBottom: 12 }}
        />
        <Spin spinning={loading && matches.length > 0} tip={t('common.loading')}>
          {loading && matches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
              {t('common.loading')}
            </div>
          ) : roundGroups.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
              {searchText
                ? t('matches.noSearchResult', { query: searchText })
                : t('matches.noMatches')}
            </div>
          ) : (
            <div>
              <Flex justify="center" align="center" gap={18} style={{ margin: '12px 0 20px' }}>
                <Button
                  shape="circle"
                  size="large"
                  icon={<LeftOutlined />}
                  disabled={activeRoundIndex <= 0}
                  onClick={() => setActiveRoundNo(roundGroups[activeRoundIndex - 1][0])}
                />
                <div style={{ minWidth: 240, textAlign: 'center' }}>
                  <Typography.Title level={4} style={{ margin: 0 }}>
                    {activeRound
                      ? t('matches.roundLabel', { round: activeRound[0] })
                      : t('matches.title')}
                  </Typography.Title>
                  <Typography.Text type="secondary">
                    {activeRound
                      ? `${t('matches.roundMatches', { count: activeRoundMatches.length })}${
                          activeRoundDateLabel ? ` · ${activeRoundDateLabel}` : ''
                        } · ${t('matches.roundProgress', {
                          finished: activeRoundFinishedCount,
                          total: activeRoundMatches.length,
                        })}`
                      : ''}
                  </Typography.Text>
                </div>
                <Button
                  shape="circle"
                  size="large"
                  icon={<RightOutlined />}
                  disabled={activeRoundIndex < 0 || activeRoundIndex >= roundGroups.length - 1}
                  onClick={() => setActiveRoundNo(roundGroups[activeRoundIndex + 1][0])}
                />
              </Flex>
              <div className="schedule-fixture-list">
                {activeRoundMatchGroups.map(([dayKey, dayMatches]) => (
                  <div key={dayKey} className="schedule-fixture-day-group">
                    <Typography.Title level={5} className="schedule-fixture-date">
                      {formatMatchDateLabel(dayMatches[0]?.kickoffAt)}
                    </Typography.Title>
                    <div className="schedule-fixture-day-list">
                      {dayMatches.map((match) => renderResultFixture(match))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Spin>
      </Card>

      <Modal
        title={
          editingScheduleMatch
            ? t('schedule.editModalTitleSpecific', {
                home: editingScheduleMatch.homeTeam?.name ?? '?',
                away: editingScheduleMatch.awayTeam?.name ?? '?',
                round: editingScheduleMatch.roundNo,
              })
            : t('schedule.editModalTitle')
        }
        open={scheduleEditOpen}
        onCancel={() => {
          setScheduleEditOpen(false);
          setEditingScheduleMatch(null);
        }}
        onOk={handleSaveScheduleMatch}
        confirmLoading={savingScheduleMatch}
        okText={t('common.save')}
        cancelText={t('common.cancel')}
      >
        <Form form={scheduleForm} layout="vertical">
          <Form.Item name="stadiumId" label={t('schedule.formStadium')}>
            <Select
              placeholder={t('schedule.formStadiumPlaceholder')}
              allowClear
              showSearch
              optionFilterProp="label"
              options={stadiums.map((s) => ({
                value: s.id,
                label: `${s.name}${s.city ? ` (${s.city})` : ''}`,
              }))}
            />
          </Form.Item>
          <Form.Item name="kickoffAt" label={t('schedule.formKickoff')}>
            <DatePicker
              showTime={{ format: 'HH:mm' }}
              format="DD/MM/YYYY HH:mm"
              style={{ width: '100%' }}
              placeholder={t('schedule.formKickoffPlaceholder')}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          <Space>
            <ThunderboltOutlined style={{ color: '#faad14' }} />
            <span>{t('schedule.generateModalTitle')}</span>
          </Space>
        }
        open={generateModalOpen}
        onCancel={() => setGenerateModalOpen(false)}
        onOk={handleGenerate}
        confirmLoading={generating}
        okText={t('schedule.generateModalOk')}
        cancelText={t('common.cancel')}
        okButtonProps={{ type: 'primary', icon: <ThunderboltOutlined /> }}
      >
        <div style={{ marginBottom: 16 }}>
          <Typography.Text>{t('schedule.generateModalDesc')}</Typography.Text>
        </div>
        <Select
          value={generateSeasonId}
          onChange={(v) => setGenerateSeasonId(v)}
          style={{ width: '100%', marginBottom: 16 }}
          placeholder={t('schedule.generateModalSeasonPlaceholder')}
          size="large"
          options={seasons.map((s) => ({
            value: s.id,
            label: `${s.name} (${s.year}/${s.year + 1})`,
          }))}
        />
        <div
          style={{
            background: '#fffbe6',
            border: '1px solid #ffe58f',
            borderRadius: 8,
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <WarningOutlined style={{ color: '#faad14', fontSize: 16 }} />
          <Typography.Text style={{ fontSize: 13 }}>
            {t('schedule.generateModalWarning')}
          </Typography.Text>
        </div>
      </Modal>

      {/* Match Detail Modal */}
      <Modal
        title={t('matches.detailModalTitle')}
        open={!!detailMatch}
        onCancel={() => {
          setDetailMatch(null);
          setHomeRoster([]);
          setAwayRoster([]);
        }}
        footer={null}
        width={750}
        loading={detailLoading}
      >
        {detailMatch && (
          <div>
            {/* Score display with goal scorers + cards */}
            {(() => {
              const events = detailMatch.events ?? [];
              // Home goals: scored by home team (GOAL/PENALTY) OR own-goal by away team
              const homeGoals = events
                .filter(
                  (e) =>
                    ((e.type === 'GOAL' || e.type === 'PENALTY') &&
                      e.team?.id === detailMatch.homeTeamId) ||
                    (e.type === 'OWN_GOAL' && e.team?.id === detailMatch.awayTeamId),
                )
                .sort((a, b) => (a.minute ?? 0) - (b.minute ?? 0));
              // Away goals: scored by away team (GOAL/PENALTY) OR own-goal by home team
              const awayGoals = events
                .filter(
                  (e) =>
                    ((e.type === 'GOAL' || e.type === 'PENALTY') &&
                      e.team?.id === detailMatch.awayTeamId) ||
                    (e.type === 'OWN_GOAL' && e.team?.id === detailMatch.homeTeamId),
                )
                .sort((a, b) => (a.minute ?? 0) - (b.minute ?? 0));
              // Cards per team
              const homeCards = events
                .filter(
                  (e) =>
                    (e.type === 'YELLOW_CARD' || e.type === 'RED_CARD') &&
                    e.team?.id === detailMatch.homeTeamId,
                )
                .sort((a, b) => (a.minute ?? 0) - (b.minute ?? 0));
              const awayCards = events
                .filter(
                  (e) =>
                    (e.type === 'YELLOW_CARD' || e.type === 'RED_CARD') &&
                    e.team?.id === detailMatch.awayTeamId,
                )
                .sort((a, b) => (a.minute ?? 0) - (b.minute ?? 0));

              // Group events by player -> { name, minutes[] }
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
                      name: g.player?.fullName ?? '-',
                      minutes: [{ minute: g.minute, type: g.type }],
                    });
                  }
                }
                return Array.from(grouped.entries());
              };

              const renderScorers = (goals: MatchEvent[], align: 'left' | 'right' | 'center') => {
                if (goals.length === 0) return null;
                return (
                  <div style={{ marginTop: 6 }}>
                    {groupByPlayer(goals).map(([pid, { name, minutes }]) => (
                      <div
                        key={pid}
                        style={{ fontSize: 12, color: '#555', textAlign: align, lineHeight: 1.7 }}
                      >
                        ⚽ <span style={{ fontWeight: 500 }}>{name}</span>{' '}
                        <span style={{ color: '#999' }}>
                          {minutes
                            .sort((a, b) => a.minute - b.minute)
                            .map((m) => {
                              const suffix =
                                m.type === 'OWN_GOAL'
                                  ? ' (PL)'
                                  : m.type === 'PENALTY'
                                    ? ' (P)'
                                    : '';
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
                  <div style={{ marginTop: 4 }}>
                    {groupByPlayer(cards).map(([pid, { name, minutes }]) => (
                      <div
                        key={pid}
                        style={{ fontSize: 11, color: '#777', textAlign: align, lineHeight: 1.7 }}
                      >
                        {minutes
                          .sort((a, b) => a.minute - b.minute)
                          .map((m, i) => (
                            <span key={i}>
                              {i > 0 && ', '}
                              {m.type === 'RED_CARD' ? '🟥' : '🟨'}
                            </span>
                          ))}{' '}
                        <span style={{ fontWeight: 500 }}>{name}</span>{' '}
                        <span style={{ color: '#aaa' }}>
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

              return (
                <div
                  style={{
                    padding: '20px 16px',
                    background: 'var(--ant-color-bg-layout)',
                    borderRadius: 8,
                    marginBottom: 16,
                  }}
                >
                  <Flex justify="center" align="flex-start" gap={24}>
                    <div style={{ textAlign: 'center', minWidth: 150, flex: 1 }}>
                      {getTeamLogoUrl(detailMatch.homeTeam) && (
                        <div style={{ marginBottom: 4 }}>
                          <img
                            src={getTeamLogoUrl(detailMatch.homeTeam)}
                            alt={`${detailMatch.homeTeam?.name ?? 'Home team'} logo`}
                            style={{ width: 40, height: 40, objectFit: 'contain' }}
                          />
                        </div>
                      )}
                      <Typography.Text strong style={{ fontSize: 16 }}>
                        {detailMatch.homeTeam?.name ?? '-'}
                      </Typography.Text>
                      <div style={{ color: '#888', fontSize: 12, marginBottom: 2 }}>
                        {t('matches.homeTeamLabel')}
                      </div>
                      {renderScorers(homeGoals, 'center')}
                      {renderCards(homeCards, 'center')}
                    </div>
                    <div style={{ textAlign: 'center', minWidth: 80 }}>
                      <Typography.Title level={2} style={{ margin: 0 }}>
                        {detailMatch.homeScore ?? '-'} : {detailMatch.awayScore ?? '-'}
                      </Typography.Title>
                      <Tag
                        color={STATUS_MAP[detailMatch.status]?.color ?? 'default'}
                        style={{ marginTop: 4 }}
                      >
                        {STATUS_MAP[detailMatch.status]?.label ?? detailMatch.status}
                      </Tag>
                    </div>
                    <div style={{ textAlign: 'center', minWidth: 150, flex: 1 }}>
                      {getTeamLogoUrl(detailMatch.awayTeam) && (
                        <div style={{ marginBottom: 4 }}>
                          <img
                            src={getTeamLogoUrl(detailMatch.awayTeam)}
                            alt={`${detailMatch.awayTeam?.name ?? 'Away team'} logo`}
                            style={{ width: 40, height: 40, objectFit: 'contain' }}
                          />
                        </div>
                      )}
                      <Typography.Text strong style={{ fontSize: 16 }}>
                        {detailMatch.awayTeam?.name ?? '-'}
                      </Typography.Text>
                      <div style={{ color: '#888', fontSize: 12, marginBottom: 2 }}>
                        {t('matches.awayTeamLabel')}
                      </div>
                      {renderScorers(awayGoals, 'center')}
                      {renderCards(awayCards, 'center')}
                    </div>
                  </Flex>
                </div>
              );
            })()}

            <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label={t('matches.roundDescLabel')}>
                V{detailMatch.roundNo}
              </Descriptions.Item>
              <Descriptions.Item label={t('matches.legDescLabel')}>
                {detailMatch.leg === 1 ? t('common.leg1') : t('common.leg2')}
              </Descriptions.Item>
              <Descriptions.Item label={t('matches.stadiumDescLabel')}>
                {detailMatch.stadium?.name ?? '-'}
              </Descriptions.Item>
              <Descriptions.Item label={t('matches.timeDescLabel')}>
                {detailMatch.kickoffAt
                  ? dayjs(detailMatch.kickoffAt).format('DD/MM/YYYY HH:mm')
                  : '-'}
              </Descriptions.Item>
            </Descriptions>

            {/* Admin Actions */}
            {canEdit && (
              <Flex gap={8} style={{ marginBottom: 16 }} wrap="wrap">
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setScoreMatch(null);
                    setScoreModalOpen(true);
                  }}
                >
                  {t('matches.scoreUpdateBtn')}
                </Button>
                {getStatusActions(detailMatch).map((nextStatus) => {
                  const s = STATUS_MAP[nextStatus];
                  return (
                    <Button key={nextStatus} onClick={() => handleStatusChange(nextStatus)}>
                      {t('matches.transitionBtn', { status: s?.label ?? nextStatus })}
                    </Button>
                  );
                })}
              </Flex>
            )}

            {/* Events */}
            <div style={{ marginTop: 8 }}>
              <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
                <Typography.Title level={5} style={{ margin: 0 }}>
                  {t('matches.eventTitle')}
                </Typography.Title>
                {canEdit && (
                  <Button
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => setEventModalOpen(true)}
                  >
                    {t('matches.addEventBtn')}
                  </Button>
                )}
              </Flex>
              {renderEventTimeline(detailMatch.events ?? [])}
            </div>
          </div>
        )}
      </Modal>

      {/* Score Edit Modal */}
      {scoreEditTarget && (
        <ScoreEditModal
          open={scoreModalOpen}
          onCancel={() => {
            setScoreModalOpen(false);
            setScoreMatch(null);
          }}
          onOk={handleSaveScore}
          loading={savingScore}
          homeTeamName={scoreEditTarget.homeTeam?.name ?? t('matches.homeTeamLabel')}
          awayTeamName={scoreEditTarget.awayTeam?.name ?? t('matches.awayTeamLabel')}
          initialHomeScore={scoreEditTarget.homeScore}
          initialAwayScore={scoreEditTarget.awayScore}
        />
      )}

      <Modal
        title={t('matches.progressModalTitle')}
        open={progressModalOpen}
        onCancel={() => {
          setProgressModalOpen(false);
          setProgressMatch(null);
        }}
        footer={null}
        width={420}
      >
        <Form form={progressForm} layout="vertical" onFinish={handleSaveProgress}>
          <Form.Item
            name="status"
            label={t('matches.statusPlaceholder')}
            rules={[{ required: true, message: t('matches.statusRequired') }]}
          >
            <Select options={progressStatusOptions} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button
                onClick={() => {
                  setProgressModalOpen(false);
                  setProgressMatch(null);
                }}
              >
                {t('common.cancel')}
              </Button>
              <Button type="primary" htmlType="submit" loading={savingProgress}>
                {t('common.save')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Event Modal (Batch) */}
      {detailMatch && (
        <EventModal
          open={eventModalOpen}
          onCancel={() => setEventModalOpen(false)}
          onSubmit={handleAddEvent}
          loading={savingEvent}
          homeTeamName={detailMatch.homeTeam?.name ?? t('matches.homeTeamLabel')}
          awayTeamName={detailMatch.awayTeam?.name ?? t('matches.awayTeamLabel')}
          homeRoster={homeRoster}
          awayRoster={awayRoster}
          rosterLoading={rosterLoading}
        />
      )}
    </div>
  );
}

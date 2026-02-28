import { EditOutlined, EyeOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Badge,
  Button,
  Card,
  Collapse,
  Descriptions,
  Flex,
  Input,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import type { EventFormRow } from '../components';
import { EventModal, ScoreEditModal } from '../components';
import {
  apiAddMatchEvent,
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
import { apiGetSeasons, type Season } from '../services/seasonApi';
import { CAN_EDIT_ROLES, EVENT_TYPE_MAP, STATUS_MAP } from '../utils/constants';

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

  // Detail modal
  const [detailMatch, setDetailMatch] = useState<Match | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Score edit
  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [savingScore, setSavingScore] = useState(false);

  // Event modal
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [savingEvent, setSavingEvent] = useState(false);
  const [homeRoster, setHomeRoster] = useState<RosterPlayer[]>([]);
  const [awayRoster, setAwayRoster] = useState<RosterPlayer[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);

  const canEdit = useMemo(() => user?.role && CAN_EDIT_ROLES.includes(user.role), [user]);

  // Fetch seasons
  useEffect(() => {
    apiGetSeasons().then((data) => {
      setSeasons(data);
      if (data.length > 0) setSelectedSeasonId(data[0].id);
    });
  }, []);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGetMatches(selectedSeasonId, 1, 200);
      setMatches(res.data);
    } catch {
      message.error(t('matches.loadError'));
    } finally {
      setLoading(false);
    }
  }, [selectedSeasonId]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  // ── Group matches by round, filter by search + status + team ──
  const filteredAndGrouped = useMemo(() => {
    const q = searchText.toLowerCase().trim();
    let filtered = matches;
    if (q) {
      filtered = filtered.filter(
        (m) =>
          m.homeTeam?.name?.toLowerCase().includes(q) ||
          m.awayTeam?.name?.toLowerCase().includes(q),
      );
    }
    if (filterStatus) {
      filtered = filtered.filter((m) => m.status === filterStatus);
    }
    if (filterTeam) {
      filtered = filtered.filter((m) => m.homeTeamId === filterTeam || m.awayTeamId === filterTeam);
    }

    const grouped = new Map<number, Match[]>();
    for (const m of filtered) {
      const round = m.roundNo ?? 0;
      if (!grouped.has(round)) grouped.set(round, []);
      grouped.get(round)!.push(m);
    }
    return Array.from(grouped.entries()).sort(([a], [b]) => a - b);
  }, [matches, searchText, filterStatus, filterTeam]);

  // Find which rounds contain the search match to auto-open
  const activeKeys = useMemo(() => {
    if (searchText.trim()) {
      return filteredAndGrouped.map(([roundNo]) => String(roundNo));
    }
    // By default open all rounds that have unfinished matches
    const keys: string[] = [];
    for (const [roundNo, roundMatches] of filteredAndGrouped) {
      if (roundMatches.some((m) => m.status !== 'FINISHED')) {
        keys.push(String(roundNo));
        if (keys.length >= 2) break; // Only auto-open first 2 unfinished rounds
      }
    }
    return keys.length > 0 ? keys : filteredAndGrouped.slice(0, 1).map(([r]) => String(r));
  }, [filteredAndGrouped, searchText]);

  const loadRosters = async (match: Match) => {
    setRosterLoading(true);
    try {
      const [home, away] = await Promise.all([
        apiGetTeamRoster(match.homeTeamId),
        apiGetTeamRoster(match.awayTeamId),
      ]);
      setHomeRoster(home.players ?? []);
      setAwayRoster(away.players ?? []);
    } catch {
      setHomeRoster([]);
      setAwayRoster([]);
    } finally {
      setRosterLoading(false);
    }
  };

  const viewDetail = async (matchId: string) => {
    setDetailLoading(true);
    try {
      const data = await apiGetMatch(matchId);
      setDetailMatch(data);
      loadRosters(data);
    } catch {
      message.error(t('matches.detailError'));
    } finally {
      setDetailLoading(false);
    }
  };

  // ── Score update ──
  const handleSaveScore = async (homeScore: number, awayScore: number) => {
    if (!detailMatch) return;
    try {
      setSavingScore(true);
      await apiUpdateMatch(detailMatch.id, { homeScore, awayScore });
      message.success(t('matches.scoreUpdated'));
      setScoreModalOpen(false);
      viewDetail(detailMatch.id);
      fetchMatches();
    } catch {
      message.error(t('matches.scoreUpdateError'));
    } finally {
      setSavingScore(false);
    }
  };

  // ── Status update ──
  const handleStatusChange = async (newStatus: string) => {
    if (!detailMatch) return;
    try {
      await apiUpdateMatchStatus(detailMatch.id, newStatus);
      message.success(
        t('matches.statusChanged', { status: STATUS_MAP[newStatus]?.label ?? newStatus }),
      );
      viewDetail(detailMatch.id);
      fetchMatches();
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      message.error((msg as string) || t('matches.statusChangeError'));
    }
  };

  // ── Add events (batch) ──
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
        } catch {
          message.error(t('matches.eventError', { minute: evt.minute }));
        }
      }
      if (successCount > 0) {
        message.success(t('matches.eventSuccess', { count: successCount }));
        setEventModalOpen(false);
        viewDetail(detailMatch.id);
        fetchMatches();
      }
    } catch {
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

  // ── Per-round table columns ──
  const roundColumns: ColumnsType<Match> = [
    {
      title: t('matches.colHome'),
      key: 'home',
      width: '22%',
      render: (_, r) => (
        <strong
          style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}
        >
          {r.homeTeam?.name ?? '—'}
          {r.homeTeam?.logoUrl && (
            <img
              src={r.homeTeam.logoUrl}
              alt=""
              style={{ width: 20, height: 20, objectFit: 'contain' }}
            />
          )}
        </strong>
      ),
    },
    {
      title: t('matches.colScore'),
      key: 'score',
      width: 100,
      align: 'center',
      render: (_, r) =>
        r.homeScore != null && r.awayScore != null ? (
          <strong style={{ fontSize: 15 }}>
            {r.homeScore} – {r.awayScore}
          </strong>
        ) : (
          <span style={{ color: '#bbb' }}>— : —</span>
        ),
    },
    {
      title: t('matches.colAway'),
      key: 'away',
      width: '22%',
      render: (_, r) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {r.awayTeam?.logoUrl && (
            <img
              src={r.awayTeam.logoUrl}
              alt=""
              style={{ width: 20, height: 20, objectFit: 'contain' }}
            />
          )}
          {r.awayTeam?.name ?? '—'}
        </span>
      ),
    },
    {
      title: t('matches.colStadium'),
      key: 'stadium',
      width: '20%',
      render: (_, r) => <span style={{ color: '#666' }}>{r.stadium?.name ?? '—'}</span>,
    },
    {
      title: t('matches.colTime'),
      dataIndex: 'kickoffAt',
      width: 130,
      render: (v: string | null) =>
        v ? (
          <span style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
            📅 {dayjs(v).format('DD/MM/YYYY HH:mm')}
          </span>
        ) : (
          '—'
        ),
    },
    {
      title: t('matches.colStatus'),
      dataIndex: 'status',
      width: 100,
      render: (status: string) => {
        const s = STATUS_MAP[status] ?? { label: status, color: 'default' };
        return <Tag color={s.color}>{s.label}</Tag>;
      },
    },
    {
      title: '',
      key: 'actions',
      width: 120,
      render: (_, r) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/matches/${r.id}`)}
          >
            {t('matches.btnDetail')}
          </Button>
          {canEdit && (
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => viewDetail(r.id)}
            >
              {t('matches.btnEdit')}
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // ── Build Collapse items ──
  const collapseItems = filteredAndGrouped.map(([roundNo, roundMatches]) => {
    const finishedCount = roundMatches.filter((m) => m.status === 'FINISHED').length;
    const allFinished = finishedCount === roundMatches.length;
    const numRounds = matches.length > 0 ? Math.max(...matches.map((m) => m.roundNo)) / 2 : 9;
    const isLeg2 = roundNo > numRounds;

    return {
      key: String(roundNo),
      label: (
        <Flex align="center" gap={12}>
          <Badge
            count={`V${roundNo}`}
            style={{
              backgroundColor: allFinished ? '#52c41a' : '#1677ff',
              fontWeight: 600,
              fontSize: 13,
            }}
          />
          <span style={{ fontWeight: 500 }}>
            {t('matches.roundLabel', { round: roundNo })}{' '}
            <Tag color={isLeg2 ? 'volcano' : 'blue'} style={{ marginLeft: 4 }}>
              {isLeg2 ? t('common.leg2') : t('common.leg1')}
            </Tag>
          </span>
          <span style={{ color: '#888', fontSize: 13 }}>
            {t('matches.matchCount', {
              count: roundMatches.length,
              finished: finishedCount,
              total: roundMatches.length,
            })}
          </span>
        </Flex>
      ),
      children: (
        <Table
          columns={roundColumns}
          dataSource={roundMatches}
          rowKey="id"
          pagination={false}
          size="small"
          showHeader={roundNo === filteredAndGrouped[0]?.[0]}
        />
      ),
    };
  });

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
                — <Tag color={meta.color}>{meta.label}</Tag>
                {e.player && <span>{e.player.fullName}</span>}
                {e.team && <span style={{ color: '#888' }}> ({e.team.name})</span>}
                {e.note && <span style={{ color: '#888', marginLeft: 8 }}>— {e.note}</span>}
              </div>
            ),
          };
        })}
      />
    );
  };

  return (
    <Card>
      <Flex
        justify="space-between"
        align="center"
        style={{ marginBottom: 16 }}
        wrap="wrap"
        gap={12}
      >
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t('matches.title')}
        </Typography.Title>
        <Space wrap>
          <Input
            prefix={<SearchOutlined />}
            placeholder={t('matches.searchPlaceholder')}
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 180 }}
          />
          <Select
            value={selectedSeasonId}
            onChange={setSelectedSeasonId}
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
            onChange={setFilterStatus}
            style={{ width: 140 }}
            placeholder={t('matches.statusPlaceholder')}
            allowClear
            options={Object.entries(STATUS_MAP).map(([value, { label }]) => ({
              value,
              label,
            }))}
          />
          <Select
            value={filterTeam}
            onChange={setFilterTeam}
            style={{ width: 180 }}
            placeholder={t('matches.teamFilterPlaceholder')}
            allowClear
            showSearch
            optionFilterProp="label"
            options={(() => {
              const teamMap = new Map<string, string>();
              matches.forEach((m) => {
                if (m.homeTeam) teamMap.set(m.homeTeamId, m.homeTeam.name);
                if (m.awayTeam) teamMap.set(m.awayTeamId, m.awayTeam.name);
              });
              return [...teamMap.entries()].map(([id, name]) => ({ value: id, label: name }));
            })()}
          />
        </Space>
      </Flex>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>{t('common.loading')}</div>
      ) : filteredAndGrouped.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
          {searchText ? t('matches.noSearchResult', { query: searchText }) : t('matches.noMatches')}
        </div>
      ) : (
        <Collapse
          defaultActiveKey={activeKeys}
          items={collapseItems}
          style={{ background: '#fff' }}
        />
      )}

      {/* ── Match Detail Modal ── */}
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

              // Group events by player → { name, minutes[] }
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
                    background: '#f6f6f6',
                    borderRadius: 8,
                    marginBottom: 16,
                  }}
                >
                  <Flex justify="center" align="flex-start" gap={24}>
                    <div style={{ textAlign: 'center', minWidth: 150, flex: 1 }}>
                      {detailMatch.homeTeam?.logoUrl && (
                        <div style={{ marginBottom: 4 }}>
                          <img
                            src={detailMatch.homeTeam.logoUrl}
                            alt=""
                            style={{ width: 40, height: 40, objectFit: 'contain' }}
                          />
                        </div>
                      )}
                      <Typography.Text strong style={{ fontSize: 16 }}>
                        {detailMatch.homeTeam?.name ?? '—'}
                      </Typography.Text>
                      <div style={{ color: '#888', fontSize: 12, marginBottom: 2 }}>
                        {t('matches.homeTeamLabel')}
                      </div>
                      {renderScorers(homeGoals, 'center')}
                      {renderCards(homeCards, 'center')}
                    </div>
                    <div style={{ textAlign: 'center', minWidth: 80 }}>
                      <Typography.Title level={2} style={{ margin: 0 }}>
                        {detailMatch.homeScore ?? '—'} : {detailMatch.awayScore ?? '—'}
                      </Typography.Title>
                      <Tag
                        color={STATUS_MAP[detailMatch.status]?.color ?? 'default'}
                        style={{ marginTop: 4 }}
                      >
                        {STATUS_MAP[detailMatch.status]?.label ?? detailMatch.status}
                      </Tag>
                    </div>
                    <div style={{ textAlign: 'center', minWidth: 150, flex: 1 }}>
                      {detailMatch.awayTeam?.logoUrl && (
                        <div style={{ marginBottom: 4 }}>
                          <img
                            src={detailMatch.awayTeam.logoUrl}
                            alt=""
                            style={{ width: 40, height: 40, objectFit: 'contain' }}
                          />
                        </div>
                      )}
                      <Typography.Text strong style={{ fontSize: 16 }}>
                        {detailMatch.awayTeam?.name ?? '—'}
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
                {detailMatch.stadium?.name ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label={t('matches.timeDescLabel')}>
                {detailMatch.kickoffAt
                  ? dayjs(detailMatch.kickoffAt).format('DD/MM/YYYY HH:mm')
                  : '—'}
              </Descriptions.Item>
            </Descriptions>

            {/* Admin Actions */}
            {canEdit && (
              <Flex gap={8} style={{ marginBottom: 16 }} wrap="wrap">
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => setScoreModalOpen(true)}
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

      {/* ── Score Edit Modal ── */}
      {detailMatch && (
        <ScoreEditModal
          open={scoreModalOpen}
          onCancel={() => setScoreModalOpen(false)}
          onOk={handleSaveScore}
          loading={savingScore}
          homeTeamName={detailMatch.homeTeam?.name ?? t('matches.homeTeamLabel')}
          awayTeamName={detailMatch.awayTeam?.name ?? t('matches.awayTeamLabel')}
          initialHomeScore={detailMatch.homeScore}
          initialAwayScore={detailMatch.awayScore}
        />
      )}

      {/* ── Add Event Modal (Batch) ── */}
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
    </Card>
  );
}

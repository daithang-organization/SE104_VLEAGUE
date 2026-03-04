import { ArrowLeftOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Flex,
  message,
  Row,
  Space,
  Spin,
  Statistic,
  Table,
  Tabs,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useMatchSocket } from '../hooks/useMatchSocket';
import {
  apiGetMatch,
  apiGetTeamRoster,
  apiUpdateMatchStatus,
  type Match,
  type MatchEvent,
  type RosterPlayer,
} from '../services/matchApi';
import { CAN_EDIT_ROLES, EVENT_TYPE_MAP, POSITION_MAP, STATUS_MAP } from './match-detail/constants';
import EventFormModal from './match-detail/EventFormModal';
import MatchTimeline from './match-detail/MatchTimeline';
import ScoreModal from './match-detail/ScoreModal';

const { Title, Text } = Typography;

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  // Rosters
  const [homeRoster, setHomeRoster] = useState<RosterPlayer[]>([]);
  const [awayRoster, setAwayRoster] = useState<RosterPlayer[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);

  // Modal visibility
  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [eventModalOpen, setEventModalOpen] = useState(false);

  const canEdit = useMemo(() => user?.role && CAN_EDIT_ROLES.includes(user.role), [user]);

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

  const fetchMatch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await apiGetMatch(id);
      setMatch(data);
      loadRosters(data);
    } catch (_err) {
      message.error(t('matchDetail.loadError'));
    } finally {
      setLoading(false);
    }
  }, [id, loadRosters]);

  useEffect(() => {
    fetchMatch();
  }, [fetchMatch]);

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

  const renderScorers = (goals: MatchEvent[], align: 'left' | 'right' | 'center') => {
    if (goals.length === 0) return null;
    return (
      <div style={{ marginTop: 6 }}>
        {groupByPlayer(goals).map(([pid, { name, minutes }]) => (
          <div key={pid} style={{ fontSize: 12, color: '#555', textAlign: align, lineHeight: 1.7 }}>
            ⚽ <span style={{ fontWeight: 500 }}>{name}</span>{' '}
            <span style={{ color: '#999' }}>
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
      <div style={{ marginTop: 4 }}>
        {groupByPlayer(cards).map(([pid, { name, minutes }]) => (
          <div key={pid} style={{ fontSize: 11, color: '#777', textAlign: align, lineHeight: 1.7 }}>
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
      <Card
        style={{
          marginBottom: 16,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
        }}
      >
        <Flex justify="center" align="flex-start" gap={32}>
          <div style={{ textAlign: 'center', minWidth: 180, flex: 1 }}>
            <Title level={4} style={{ color: '#fff', margin: 0 }}>
              {match.homeTeam?.name ?? '—'}
            </Title>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 4 }}>
              {t('matchDetail.homeLabel')}
            </div>
            <div style={{ filter: 'brightness(2)' }}>
              {renderScorers(homeGoals, 'center')}
              {renderCards(homeCards, 'center')}
            </div>
          </div>
          <div style={{ textAlign: 'center', minWidth: 100 }}>
            <Title level={1} style={{ color: '#fff', margin: 0, fontSize: 48 }}>
              {match.homeScore ?? '—'} : {match.awayScore ?? '—'}
            </Title>
            <Tag
              color={STATUS_MAP[match.status]?.color ?? 'default'}
              style={{ marginTop: 8, fontSize: 13 }}
            >
              {STATUS_MAP[match.status]?.label ?? match.status}
            </Tag>
            {match.kickoffAt && (
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 6 }}>
                📅 {dayjs(match.kickoffAt).format('DD/MM/YYYY HH:mm')}
              </div>
            )}
          </div>
          <div style={{ textAlign: 'center', minWidth: 180, flex: 1 }}>
            <Title level={4} style={{ color: '#fff', margin: 0 }}>
              {match.awayTeam?.name ?? '—'}
            </Title>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 4 }}>
              {t('matchDetail.awayLabel')}
            </div>
            <div style={{ filter: 'brightness(2)' }}>
              {renderScorers(awayGoals, 'center')}
              {renderCards(awayCards, 'center')}
            </div>
          </div>
        </Flex>
      </Card>

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
            <Button icon={<PlusOutlined />} onClick={() => setEventModalOpen(true)}>
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
                          ),
                        };
                      })}
                  />
                )}
              </Card>
            ),
          },
          {
            key: 'lineups',
            label: t('matchDetail.tabLineups'),
            children: (
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
        homeRoster={homeRoster}
        awayRoster={awayRoster}
        rosterLoading={rosterLoading}
        onCancel={() => setEventModalOpen(false)}
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

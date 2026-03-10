import {
  CalendarOutlined,
  FireOutlined,
  PlusOutlined,
  SettingOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Badge,
  Button,
  Card,
  Col,
  message,
  Progress,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip as AntTooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '../auth/AuthContext';
import { CardSkeleton } from '../components';
import { apiGetMatches, type Match } from '../services/matchApi';
import { apiGetPlayers } from '../services/playerApi';
import { apiGetSchedule, type ScheduleMatch } from '../services/scheduleApi';
import { apiGetCurrentSeason, apiGetSeasons, type Season } from '../services/seasonApi';
import {
  apiGetCardStats,
  apiGetStandings,
  apiGetTopScorers,
  type CardStat,
  type TeamStanding,
  type TopScorer,
} from '../services/standingsApi';
import { apiGetTeams } from '../services/teamApi';

type RecentResult = {
  id: string;
  roundNo: number;
  homeTeam: { name: string };
  awayTeam: { name: string };
  homeScore: number | null;
  awayScore: number | null;
  kickoffAt: string | null;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isAdmin = user?.role === 'ADMIN';
  const [stats, setStats] = useState({
    teams: 0,
    players: 0,
    matches: 0,
    seasons: 0,
  });
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [upcoming, setUpcoming] = useState<ScheduleMatch[]>([]);
  const [recentResults, setRecentResults] = useState<RecentResult[]>([]);
  const [currentSeason, setCurrentSeason] = useState<Season | null>(null);
  const [topScorers, setTopScorers] = useState<TopScorer[]>([]);
  const [cardStats, setCardStats] = useState<CardStat[]>([]);
  const [goalsPerRound, setGoalsPerRound] = useState<{ round: string; goals: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [
          teams,
          players,
          schedule,
          seasons,
          standingsData,
          matchesData,
          curSeason,
          scorersData,
          cardStatsData,
        ] = await Promise.allSettled([
          apiGetTeams(),
          apiGetPlayers(),
          apiGetSchedule(),
          apiGetSeasons(),
          apiGetStandings(),
          apiGetMatches(undefined, 1, 100),
          apiGetCurrentSeason(),
          apiGetTopScorers(undefined, 5),
          apiGetCardStats(undefined, 5),
        ]);

        setStats({
          teams: teams.status === 'fulfilled' ? teams.value.total : 0,
          players: players.status === 'fulfilled' ? players.value.total : 0,
          matches: schedule.status === 'fulfilled' ? (schedule.value.matches?.length ?? 0) : 0,
          seasons: seasons.status === 'fulfilled' ? seasons.value.length : 0,
        });

        if (standingsData.status === 'fulfilled') {
          setStandings(standingsData.value.slice(0, 5));
        }

        if (schedule.status === 'fulfilled') {
          const now = new Date();
          const upcomingMatches = (schedule.value.matches ?? [])
            .filter((m) => m.kickoffAt && new Date(m.kickoffAt) > now && m.status !== 'FINISHED')
            .slice(0, 5);
          setUpcoming(upcomingMatches);
        }

        // Recent finished results
        if (matchesData.status === 'fulfilled') {
          const finished = matchesData.value.data
            .filter((m) => m.status === 'FINISHED')
            .sort((a, b) => {
              if (a.kickoffAt && b.kickoffAt)
                return new Date(b.kickoffAt).getTime() - new Date(a.kickoffAt).getTime();
              return b.roundNo - a.roundNo;
            })
            .slice(0, 5) as RecentResult[];
          setRecentResults(finished);
        }

        if (curSeason.status === 'fulfilled') {
          setCurrentSeason(curSeason.value);
        }

        if (scorersData.status === 'fulfilled') {
          setTopScorers(scorersData.value.slice(0, 5));
        }

        if (cardStatsData.status === 'fulfilled') {
          setCardStats(cardStatsData.value.slice(0, 5));
        }

        // Calculate goals per round from finished matches
        if (matchesData.status === 'fulfilled') {
          const finished = matchesData.value.data.filter((m: Match) => m.status === 'FINISHED');
          const roundGoals = new Map<number, number>();
          finished.forEach((m: Match) => {
            const round = m.roundNo;
            const goals = (m.homeScore ?? 0) + (m.awayScore ?? 0);
            roundGoals.set(round, (roundGoals.get(round) ?? 0) + goals);
          });
          const chartData = [...roundGoals.entries()]
            .sort(([a], [b]) => a - b)
            .slice(0, 15)
            .map(([round, goals]) => ({
              round: `V${round}`,
              goals,
            }));
          setGoalsPerRound(chartData);
        }
      } catch (_err) {
        message.error(t('dashboard.errorLoad'));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const standingsCols: ColumnsType<TeamStanding> = [
    { title: t('dashboard.standingsColRank'), dataIndex: 'position', width: 50 },
    { title: t('dashboard.standingsColTeam'), dataIndex: 'teamName' },
    { title: t('dashboard.standingsColPlayed'), dataIndex: 'played', width: 60 },
    { title: t('dashboard.standingsColPoints'), dataIndex: 'points', width: 60 },
  ];

  const upcomingCols: ColumnsType<ScheduleMatch> = [
    {
      title: t('dashboard.upcomingColRound'),
      dataIndex: 'roundNo',
      width: 70,
      render: (v: number) => `V${v}`,
    },
    {
      title: t('dashboard.upcomingColMatch'),
      key: 'match',
      render: (_, r) => `${r.homeTeam?.name ?? '—'} vs ${r.awayTeam?.name ?? '—'}`,
    },
    {
      title: t('dashboard.upcomingColTime'),
      dataIndex: 'kickoffAt',
      width: 150,
      render: (v: string) => dayjs(v).format('DD/MM HH:mm'),
    },
    {
      title: t('dashboard.upcomingColStatus'),
      dataIndex: 'status',
      width: 110,
      render: (s: string) => <Tag color={s === 'PUBLISHED' ? 'blue' : 'default'}>{s}</Tag>,
    },
  ];

  const recentCols: ColumnsType<RecentResult> = [
    {
      title: t('dashboard.recentColRound'),
      dataIndex: 'roundNo',
      width: 50,
      render: (v: number) => `V${v}`,
    },
    {
      title: t('dashboard.recentColMatch'),
      key: 'match',
      render: (_, r) => (
        <span>
          <strong>{r.homeTeam.name}</strong>
          <Tag color="blue" style={{ margin: '0 6px' }}>
            {r.homeScore ?? 0} – {r.awayScore ?? 0}
          </Tag>
          <strong>{r.awayTeam.name}</strong>
        </span>
      ),
    },
    {
      title: t('dashboard.recentColDate'),
      dataIndex: 'kickoffAt',
      width: 100,
      render: (v: string | null) => (v ? dayjs(v).format('DD/MM') : '—'),
    },
  ];

  // Calculate season progress
  const seasonProgress = (() => {
    if (!currentSeason?.startDate || !currentSeason?.endDate) return null;
    const start = dayjs(currentSeason.startDate);
    const end = dayjs(currentSeason.endDate);
    const now = dayjs();
    const total = end.diff(start, 'day');
    const elapsed = now.diff(start, 'day');
    return total > 0 ? Math.min(100, Math.max(0, Math.round((elapsed / total) * 100))) : 0;
  })();

  return (
    <div>
      <Typography.Title level={3}>{t('dashboard.title')}</Typography.Title>
      <Typography.Paragraph type="secondary">{t('dashboard.welcome')}</Typography.Paragraph>

      {loading ? (
        <Row gutter={[16, 16]}>
          {[1, 2, 3, 4].map((i) => (
            <Col xs={12} sm={6} key={i}>
              <CardSkeleton />
            </Col>
          ))}
          <Col xs={24} md={12}>
            <CardSkeleton />
          </Col>
          <Col xs={24} md={12}>
            <CardSkeleton />
          </Col>
        </Row>
      ) : (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={6}>
              <Card loading={loading}>
                <Statistic
                  title={t('dashboard.statTeams')}
                  value={stats.teams}
                  prefix={<TeamOutlined />}
                  styles={{ content: { color: '#1890ff' } }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card loading={loading}>
                <Statistic
                  title={t('dashboard.statPlayers')}
                  value={stats.players}
                  prefix={<UserOutlined />}
                  styles={{ content: { color: '#52c41a' } }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card loading={loading}>
                <Statistic
                  title={t('dashboard.statMatches')}
                  value={stats.matches}
                  prefix={<CalendarOutlined />}
                  styles={{ content: { color: '#faad14' } }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card loading={loading}>
                <Statistic
                  title={t('dashboard.statSeasons')}
                  value={stats.seasons}
                  prefix={<TrophyOutlined />}
                  styles={{ content: { color: '#eb2f96' } }}
                />
              </Card>
            </Col>
          </Row>

          {/* Current season + Quick actions row */}
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            {currentSeason && (
              <Col xs={24} md={isAdmin ? 16 : 24}>
                <Card size="small" loading={loading}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Space>
                      <Badge status="processing" />
                      <Typography.Text strong>{currentSeason.name}</Typography.Text>
                      <Tag color="green">{t('dashboard.inProgress')}</Tag>
                    </Space>
                    {seasonProgress !== null && (
                      <Progress
                        percent={seasonProgress}
                        size="small"
                        format={(p) => t('dashboard.seasonProgress', { percent: p })}
                      />
                    )}
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {currentSeason.startDate
                        ? dayjs(currentSeason.startDate).format('DD/MM/YYYY')
                        : '?'}{' '}
                      →{' '}
                      {currentSeason.endDate
                        ? dayjs(currentSeason.endDate).format('DD/MM/YYYY')
                        : '?'}
                    </Typography.Text>
                  </Space>
                </Card>
              </Col>
            )}
            {isAdmin && (
              <Col xs={24} md={currentSeason ? 8 : 24}>
                <Card title={t('dashboard.quickActions')} size="small" loading={loading}>
                  <Space wrap>
                    <Button
                      icon={<PlusOutlined />}
                      size="small"
                      onClick={() => navigate('/seasons')}
                    >
                      {t('dashboard.btnSeason')}
                    </Button>
                    <Button icon={<TeamOutlined />} size="small" onClick={() => navigate('/teams')}>
                      {t('dashboard.btnTeam')}
                    </Button>
                    <Button
                      icon={<CalendarOutlined />}
                      size="small"
                      onClick={() => navigate('/schedule')}
                    >
                      {t('dashboard.btnSchedule')}
                    </Button>
                    <Button
                      icon={<SettingOutlined />}
                      size="small"
                      onClick={() => navigate('/regulations')}
                    >
                      {t('dashboard.btnRegulation')}
                    </Button>
                  </Space>
                </Card>
              </Col>
            )}
          </Row>

          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} md={12}>
              <Card title={t('dashboard.standingsTitle')} size="small">
                <Table
                  columns={standingsCols}
                  dataSource={standings}
                  rowKey="teamId"
                  loading={loading}
                  pagination={false}
                  size="small"
                  locale={{ emptyText: t('dashboard.standingsEmpty') }}
                />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title={t('dashboard.upcomingTitle')} size="small">
                <Table
                  columns={upcomingCols}
                  dataSource={upcoming}
                  rowKey="id"
                  loading={loading}
                  pagination={false}
                  size="small"
                  locale={{ emptyText: t('dashboard.upcomingEmpty') }}
                />
              </Card>
            </Col>
          </Row>

          {/* Recent results + Top scorers */}
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} md={14}>
              <Card title={t('dashboard.recentTitle')} size="small">
                <Table
                  columns={recentCols}
                  dataSource={recentResults}
                  rowKey="id"
                  loading={loading}
                  pagination={false}
                  size="small"
                  locale={{ emptyText: t('dashboard.recentEmpty') }}
                />
              </Card>
            </Col>
            <Col xs={24} md={10}>
              <Card title={`🏅 ${t('dashboard.topScorersTitle')}`} size="small">
                <Table
                  dataSource={topScorers}
                  rowKey="playerId"
                  loading={loading}
                  pagination={false}
                  size="small"
                  locale={{ emptyText: t('dashboard.topScorersEmpty') }}
                  columns={[
                    { title: '#', dataIndex: 'position', width: 40 },
                    {
                      title: t('dashboard.topScorersColPlayer'),
                      dataIndex: 'playerName',
                      ellipsis: true,
                    },
                    {
                      title: t('dashboard.topScorersColTeam'),
                      dataIndex: 'teamName',
                      width: 120,
                      ellipsis: true,
                    },
                    {
                      title: '⚽',
                      dataIndex: 'goals',
                      width: 50,
                      align: 'center',
                      render: (v: number) => <strong style={{ color: '#1890ff' }}>{v}</strong>,
                    },
                  ]}
                />
              </Card>
            </Col>
          </Row>

          {/* Team Form (last 5 matches) */}
          {standings.length > 0 && recentResults.length > 0 && (
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Card title={`📊 ${t('dashboard.teamFormTitle')}`} size="small">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                    {standings.map((team) => {
                      // Derive form from recent results for this team
                      const teamResults = recentResults
                        .filter(
                          (r) =>
                            r.homeTeam.name === team.teamName || r.awayTeam.name === team.teamName,
                        )
                        .slice(0, 5)
                        .map((r) => {
                          const isHome = r.homeTeam.name === team.teamName;
                          const ownScore = isHome ? r.homeScore : r.awayScore;
                          const oppScore = isHome ? r.awayScore : r.homeScore;
                          if (ownScore == null || oppScore == null) return 'D';
                          if (ownScore > oppScore) return 'W';
                          if (ownScore < oppScore) return 'L';
                          return 'D';
                        });
                      if (teamResults.length === 0) return null;
                      return (
                        <div
                          key={team.teamId}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '6px 12px',
                            borderRadius: 8,
                            background: 'var(--ant-color-fill-quaternary, #fafafa)',
                            minWidth: 200,
                          }}
                        >
                          <span style={{ fontWeight: 600, minWidth: 100, fontSize: 13 }}>
                            {team.teamName}
                          </span>
                          <Space size={4}>
                            {teamResults.map((result, i) => (
                              <span
                                key={i}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: 24,
                                  height: 24,
                                  borderRadius: '50%',
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: '#fff',
                                  background:
                                    result === 'W'
                                      ? '#52c41a'
                                      : result === 'L'
                                        ? '#ff4d4f'
                                        : '#8c8c8c',
                                }}
                              >
                                {result}
                              </span>
                            ))}
                          </Space>
                          <Tag
                            color={
                              teamResults.filter((r) => r === 'W').length >= 3
                                ? 'green'
                                : teamResults.filter((r) => r === 'L').length >= 3
                                  ? 'red'
                                  : 'default'
                            }
                            style={{ marginLeft: 'auto', fontSize: 11 }}
                          >
                            {teamResults.filter((r) => r === 'W').length}W{' '}
                            {teamResults.filter((r) => r === 'D').length}D{' '}
                            {teamResults.filter((r) => r === 'L').length}L
                          </Tag>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </Col>
            </Row>
          )}

          {/* Goals per round chart + Card stats */}
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            {goalsPerRound.length > 0 && (
              <Col xs={24} md={14}>
                <Card title={`⚽ ${t('dashboard.goalsPerRoundTitle')}`} size="small">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={goalsPerRound}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="round" fontSize={12} />
                      <YAxis allowDecimals={false} fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="goals" fill="#1890ff" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            )}
            {cardStats.length > 0 && (
              <Col xs={24} md={goalsPerRound.length > 0 ? 10 : 24}>
                <Card title={`🟨 ${t('dashboard.cardStatsTitle')}`} size="small">
                  <Table
                    dataSource={cardStats}
                    rowKey="playerId"
                    loading={loading}
                    pagination={false}
                    size="small"
                    locale={{ emptyText: t('dashboard.cardStatsEmpty') }}
                    columns={[
                      { title: '#', key: 'pos', width: 40, render: (_, __, i) => i + 1 },
                      {
                        title: t('dashboard.cardStatsColPlayer'),
                        dataIndex: 'playerName',
                        ellipsis: true,
                      },
                      {
                        title: '🟨',
                        dataIndex: 'yellowCards',
                        width: 50,
                        align: 'center' as const,
                        render: (v: number) => <strong style={{ color: '#faad14' }}>{v}</strong>,
                      },
                      {
                        title: '🟥',
                        dataIndex: 'redCards',
                        width: 50,
                        align: 'center' as const,
                        render: (v: number) => <strong style={{ color: '#ff4d4f' }}>{v}</strong>,
                      },
                    ]}
                  />
                </Card>
              </Col>
            )}
          </Row>
        </>
      )}
    </div>
  );
}

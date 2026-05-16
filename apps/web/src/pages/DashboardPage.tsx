import {
  CalendarOutlined,
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
import { apiGetSeasons, type Season } from '../services/seasonApi';
import {
  apiGetCardStats,
  apiGetStandings,
  apiGetTopScorers,
  type CardStat,
  type TeamStanding,
  type TopScorer,
} from '../services/standingsApi';
import { apiGetTeams } from '../services/teamApi';

// MÃ MÀU ĐỎ CHỦ ĐẠO MỚI
const THEME_RED = '#E32221';

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
  const [seasonProgress, setSeasonProgress] = useState<number | null>(null);
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
          scorersData,
          cardStatsData,
        ] = await Promise.allSettled([
          apiGetTeams(),
          apiGetPlayers(),
          apiGetSchedule(),
          apiGetSeasons(),
          apiGetStandings(),
          apiGetMatches(undefined, 1, 100),
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

        const dashboardSeason =
          seasons.status === 'fulfilled'
            ? (seasons.value.find((season) => {
                if (!season.startDate || !season.endDate) return false;
                const start = dayjs(season.startDate).startOf('day').valueOf();
                const end = dayjs(season.endDate).endOf('day').valueOf();
                const now = dayjs().valueOf();
                return now >= start && now <= end;
              }) ??
              seasons.value.find((season) => season.status === 'IN_PROGRESS') ??
              seasons.value
                .filter((season) => season.startDate)
                .sort((a, b) => dayjs(b.startDate).valueOf() - dayjs(a.startDate).valueOf())[0] ??
              null)
            : null;
        setCurrentSeason(dashboardSeason);

        if (dashboardSeason) {
          const seasonMatches = await apiGetMatches(dashboardSeason.id, 1, 1000);
          const teamIds = new Set<string>();
          let finishedMatches = 0;

          seasonMatches.data.forEach((match) => {
            teamIds.add(match.homeTeamId);
            teamIds.add(match.awayTeamId);
            if (match.status === 'FINISHED') finishedMatches++;
          });

          const roundRobinFixtures = teamIds.size > 1 ? teamIds.size * (teamIds.size - 1) : 0;
          const totalSeasonMatches =
            seasonMatches.total || seasonMatches.data.length || roundRobinFixtures;
          setSeasonProgress(
            totalSeasonMatches > 0
              ? Math.min(100, Math.round((finishedMatches / totalSeasonMatches) * 100))
              : 0,
          );
        } else {
          setSeasonProgress(null);
        }

        if (scorersData.status === 'fulfilled') {
          setTopScorers(scorersData.value.slice(0, 5));
        }

        if (cardStatsData.status === 'fulfilled') {
          setCardStats(cardStatsData.value.slice(0, 5));
        }

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
  }, [t]);

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
      // Đổi tag PUBLISHED sang màu đỏ
      render: (s: string) => <Tag color={s === 'PUBLISHED' ? 'red' : 'default'}>{s}</Tag>,
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
          {/* Đổi tag tỷ số sang màu đỏ */}
          <Tag color="red" style={{ margin: '0 6px' }}>
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

  return (
    <div>
      {/* Thêm chút CSS trực tiếp cho các hiệu ứng hover mượt mà */}
      <style>{`
        /* Khung Card chính */
        .stat-card {
          position: relative;
          background: #152238; /* Phải set cứng màu nền để trùng với màu box bên dưới */
          border: none !important;
          border-radius: 8px;
          overflow: hidden;
          transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        /* Lúc di chuột vẫn nhấc nhẹ cái box lên */
        .stat-card:hover {
          transform: translateY(-5px);
        }

        /* TẠO AURA QUAY (conic-gradient) NẰM LỚP DƯỚI CÙNG */
        .stat-card::before {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: conic-gradient(
            transparent,
            transparent,
            transparent,
            #E32221
          );
          animation: spin-aura 0.75s linear infinite;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 0;
        }

        /* Lớp giả ở giữa (nhỏ hơn thẻ 1 tí) che đi phần ruột của Aura, chỉ để hở 2px viền */
        .stat-card::after {
          content: "";
          position: absolute;
          inset: 3px; /* 2px này chính là độ dày của cái vòng Aura */
          background: #152238; /* Cùng màu nền box để tàng hình */
          border-radius: 6px;
          z-index: 1;
        }

        /* Kéo ruột của Ant Design Card lên lớp trên cùng để không bị che */
        .stat-card .ant-card-body {
          position: relative;
          z-index: 2;
        }

        /* Khi hover thì hiện Aura ra */
        .stat-card:hover::before {
          opacity: 1;
        }

        :root[data-theme='light'] .stat-card {
          background: var(--primary);
        }

        :root[data-theme='light'] .stat-card::before {
          background: conic-gradient(
            transparent,
            transparent,
            transparent,
            #ffffff
          );
        }

        :root[data-theme='light'] .stat-card::after {
          background: var(--primary);
        }

        :root[data-theme='light'] .stat-card .ant-statistic-title,
        :root[data-theme='light'] .stat-card .ant-statistic-content,
        :root[data-theme='light'] .stat-card .ant-statistic-content-prefix,
        :root[data-theme='light'] .stat-card .ant-statistic-content-value {
          color: #ffffff !important;
        }

        /* Keyframe xoay Aura */
        @keyframes spin-aura {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
      }
      `}</style>

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
              <Card loading={loading} hoverable className="stat-card">
                <Statistic
                  title={t('dashboard.statTeams')}
                  value={stats.teams}
                  prefix={<TeamOutlined />}
                  styles={{ content: { color: THEME_RED, fontWeight: 'bold' } }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card loading={loading} hoverable className="stat-card">
                <Statistic
                  title={t('dashboard.statPlayers')}
                  value={stats.players}
                  prefix={<UserOutlined />}
                  styles={{ content: { color: '#fa8c16', fontWeight: 'bold' } }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card loading={loading} hoverable className="stat-card">
                <Statistic
                  title={t('dashboard.statMatches')}
                  value={stats.matches}
                  prefix={<CalendarOutlined />}
                  styles={{ content: { color: THEME_RED, fontWeight: 'bold' } }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card loading={loading} hoverable className="stat-card">
                <Statistic
                  title={t('dashboard.statSeasons')}
                  value={stats.seasons}
                  prefix={<TrophyOutlined />}
                  styles={{ content: { color: '#eb2f96', fontWeight: 'bold' } }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            {currentSeason && (
              <Col xs={24} md={isAdmin ? 16 : 24}>
                <Card
                  size="small"
                  loading={loading}
                  style={{ borderTop: `3px solid ${THEME_RED}` }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Space>
                      <Badge color={THEME_RED} />
                      <Typography.Text strong>{currentSeason.name}</Typography.Text>
                      <Tag color="red">{t('dashboard.inProgress')}</Tag>
                    </Space>
                    {seasonProgress !== null && (
                      <Progress
                        percent={seasonProgress}
                        size="small"
                        strokeColor={{
                          '0%': '#52c41a', // Bắt đầu: Xanh lá cây mướt mắt
                          '50%': '#faad14', // Giữa mùa: Chuyển sang vàng cam cho mượt
                          '100%': '#E32221', // Cuối mùa: Đỏ rực VLeague
                        }}
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
              <Card title={t('dashboard.standingsTitle')} size="small" hoverable>
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
              <Card title={t('dashboard.upcomingTitle')} size="small" hoverable>
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

          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} md={14}>
              <Card title={t('dashboard.recentTitle')} size="small" hoverable>
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
              <Card title={`🏅 ${t('dashboard.topScorersTitle')}`} size="small" hoverable>
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
                      render: (v: number) => <strong style={{ color: THEME_RED }}>{v}</strong>,
                    },
                  ]}
                />
              </Card>
            </Col>
          </Row>

          {standings.length > 0 && recentResults.length > 0 && (
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Card title={`📊 ${t('dashboard.teamFormTitle')}`} size="small" hoverable>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                    {standings.map((team) => {
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
                            background: 'var(--ant-color-fill-quaternary)', // Chỉ giữ lại biến màu linh hoạt của Antd
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
                                      ? '#52c41a' // Thắng giữ màu xanh lá
                                      : result === 'L'
                                        ? THEME_RED // Thua cho màu đỏ
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

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            {goalsPerRound.length > 0 && (
              <Col xs={24} md={14}>
                <Card title={`⚽ ${t('dashboard.goalsPerRoundTitle')}`} size="small" hoverable>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={goalsPerRound}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="round" fontSize={12} axisLine={false} tickLine={false} />
                      <YAxis
                        allowDecimals={false}
                        fontSize={12}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(227, 34, 33, 0.1)' }}
                        contentStyle={{
                          borderRadius: '8px',
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                      />
                      {/* Đổi màu cột sang đỏ */}
                      <Bar dataKey="goals" fill={THEME_RED} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            )}
            {cardStats.length > 0 && (
              <Col xs={24} md={goalsPerRound.length > 0 ? 10 : 24}>
                <Card title={`🟨 ${t('dashboard.cardStatsTitle')}`} size="small" hoverable>
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
                        render: (v: number) => <strong style={{ color: THEME_RED }}>{v}</strong>,
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

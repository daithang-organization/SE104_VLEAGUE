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
import { useAuth } from '../auth/AuthContext';
import { CardSkeleton } from '../components';
import { apiGetMatches } from '../services/matchApi';
import { apiGetPlayers } from '../services/playerApi';
import { apiGetSchedule, type ScheduleMatch } from '../services/scheduleApi';
import { apiGetCurrentSeason, apiGetSeasons, type Season } from '../services/seasonApi';
import { apiGetStandings, type TeamStanding } from '../services/standingsApi';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [teams, players, schedule, seasons, standingsData, matchesData, curSeason] =
          await Promise.allSettled([
            apiGetTeams(),
            apiGetPlayers(),
            apiGetSchedule(),
            apiGetSeasons(),
            apiGetStandings(),
            apiGetMatches(undefined, 1, 100),
            apiGetCurrentSeason(),
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
      } catch {
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
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card loading={loading}>
                <Statistic
                  title={t('dashboard.statPlayers')}
                  value={stats.players}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card loading={loading}>
                <Statistic
                  title={t('dashboard.statMatches')}
                  value={stats.matches}
                  prefix={<CalendarOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card loading={loading}>
                <Statistic
                  title={t('dashboard.statSeasons')}
                  value={stats.seasons}
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: '#eb2f96' }}
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

          {/* Recent results */}
          <Row gutter={[16, 16]}>
            <Col xs={24}>
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
          </Row>
        </>
      )}
    </div>
  );
}

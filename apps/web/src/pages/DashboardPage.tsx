import { CalendarOutlined, TeamOutlined, TrophyOutlined, UserOutlined } from '@ant-design/icons';
import { Card, Col, message, Row, Statistic, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { apiGetPlayers } from '../services/playerApi';
import { apiGetSchedule, type ScheduleMatch } from '../services/scheduleApi';
import { apiGetSeasons } from '../services/seasonApi';
import { apiGetStandings, type TeamStanding } from '../services/standingsApi';
import { apiGetTeams } from '../services/teamApi';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    teams: 0,
    players: 0,
    matches: 0,
    seasons: 0,
  });
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [upcoming, setUpcoming] = useState<ScheduleMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [teams, players, schedule, seasons, standingsData] = await Promise.allSettled([
          apiGetTeams(),
          apiGetPlayers(),
          apiGetSchedule(),
          apiGetSeasons(),
          apiGetStandings(),
        ]);

        setStats({
          teams: teams.status === 'fulfilled' ? teams.value.length : 0,
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
      } catch {
        message.error('Không thể tải dữ liệu dashboard');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const standingsCols: ColumnsType<TeamStanding> = [
    { title: '#', dataIndex: 'position', width: 50 },
    { title: 'Đội', dataIndex: 'teamName' },
    { title: 'Trận', dataIndex: 'played', width: 60 },
    { title: 'Điểm', dataIndex: 'points', width: 60 },
  ];

  const upcomingCols: ColumnsType<ScheduleMatch> = [
    {
      title: 'Vòng',
      dataIndex: 'roundNo',
      width: 70,
      render: (v: number) => `V${v}`,
    },
    {
      title: 'Trận đấu',
      key: 'match',
      render: (_, r) => `${r.homeTeam?.name ?? '—'} vs ${r.awayTeam?.name ?? '—'}`,
    },
    {
      title: 'Thời gian',
      dataIndex: 'kickoffAt',
      width: 150,
      render: (v: string) => dayjs(v).format('DD/MM HH:mm'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 110,
      render: (s: string) => <Tag color={s === 'PUBLISHED' ? 'blue' : 'default'}>{s}</Tag>,
    },
  ];

  return (
    <div>
      <Typography.Title level={3}>Dashboard</Typography.Title>
      <Typography.Paragraph type="secondary">
        Chào mừng đến với VLeague Admin! Tổng quan hệ thống:
      </Typography.Paragraph>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card loading={loading}>
            <Statistic
              title="Đội bóng"
              value={stats.teams}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card loading={loading}>
            <Statistic
              title="Cầu thủ"
              value={stats.players}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card loading={loading}>
            <Statistic
              title="Trận đấu"
              value={stats.matches}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card loading={loading}>
            <Statistic
              title="Mùa giải"
              value={stats.seasons}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="🏆 Bảng xếp hạng (Top 5)" size="small">
            <Table
              columns={standingsCols}
              dataSource={standings}
              rowKey="teamId"
              loading={loading}
              pagination={false}
              size="small"
              locale={{ emptyText: 'Chưa có dữ liệu BXH' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="📅 Trận đấu sắp tới" size="small">
            <Table
              columns={upcomingCols}
              dataSource={upcoming}
              rowKey="id"
              loading={loading}
              pagination={false}
              size="small"
              locale={{ emptyText: 'Chưa có trận đấu sắp tới' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

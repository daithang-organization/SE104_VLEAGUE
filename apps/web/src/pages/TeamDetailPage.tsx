import {
  ArrowLeftOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Descriptions,
  message,
  Row,
  Space,
  Spin,
  Statistic,
  Table,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiGetTeam, type TeamDetail } from '../services/teamApi';

const { Title } = Typography;

const POSITION_MAP: Record<string, { label: string; color: string }> = {
  GK: { label: 'Thủ môn', color: 'gold' },
  DF: { label: 'Hậu vệ', color: 'blue' },
  MF: { label: 'Tiền vệ', color: 'green' },
  FW: { label: 'Tiền đạo', color: 'red' },
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Bản nháp', color: 'default' },
  PUBLISHED: { label: 'Đã công bố', color: 'blue' },
  LOCKED: { label: 'Đã khóa', color: 'orange' },
  FINISHED: { label: 'Kết thúc', color: 'green' },
  POSTPONED: { label: 'Hoãn', color: 'red' },
};

export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiGetTeam(id)
      .then(setTeam)
      .catch(() => message.error('Không thể tải thông tin đội bóng'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!team) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Title level={4}>Không tìm thấy đội bóng</Title>
        <Button onClick={() => navigate('/teams')}>Quay lại</Button>
      </div>
    );
  }

  // Merge home + away matches, sort by kickoff desc
  const allMatches = [
    ...team.homeMatches.map((m) => ({ ...m, side: 'home' as const })),
    ...team.awayMatches.map((m) => ({ ...m, side: 'away' as const })),
  ].sort((a, b) => {
    if (!a.kickoffAt || !b.kickoffAt) return 0;
    return new Date(b.kickoffAt).getTime() - new Date(a.kickoffAt).getTime();
  });

  const getMatchResult = (m: (typeof allMatches)[0]) => {
    if (m.homeScore == null || m.awayScore == null) return null;
    const isHome = m.side === 'home';
    const ours = isHome ? m.homeScore : m.awayScore;
    const theirs = isHome ? m.awayScore : m.homeScore;
    if (ours > theirs) return { label: 'T', color: 'green' };
    if (ours < theirs) return { label: 'B', color: 'red' };
    return { label: 'H', color: 'orange' };
  };

  const rosterColumns = [
    {
      title: 'Số áo',
      dataIndex: 'jerseyNumber',
      key: 'jerseyNumber',
      width: 80,
      sorter: (a: TeamDetail['teamPlayers'][0], b: TeamDetail['teamPlayers'][0]) =>
        (a.jerseyNumber ?? 99) - (b.jerseyNumber ?? 99),
      render: (v: number | null) => v ?? '—',
    },
    {
      title: 'Tên cầu thủ',
      key: 'fullName',
      render: (_: unknown, r: TeamDetail['teamPlayers'][0]) => (
        <a onClick={() => navigate(`/players/${r.player.id}`)}>{r.player.fullName}</a>
      ),
    },
    {
      title: 'Vị trí',
      key: 'position',
      render: (_: unknown, r: TeamDetail['teamPlayers'][0]) => {
        const p = POSITION_MAP[r.player.position];
        return <Tag color={p?.color}>{p?.label ?? r.player.position}</Tag>;
      },
    },
    {
      title: 'Quốc tịch',
      key: 'nationality',
      render: (_: unknown, r: TeamDetail['teamPlayers'][0]) => r.player.nationality,
    },
    {
      title: 'Loại',
      key: 'playerType',
      render: (_: unknown, r: TeamDetail['teamPlayers'][0]) => (
        <Tag color={r.player.playerType === 'FOREIGN' ? 'purple' : 'cyan'}>
          {r.player.playerType === 'FOREIGN' ? 'Ngoại binh' : 'Nội binh'}
        </Tag>
      ),
    },
  ];

  const matchColumns = [
    {
      title: 'Vòng',
      key: 'round',
      width: 80,
      render: (_: unknown, r: (typeof allMatches)[0]) => `V${r.roundNo}`,
    },
    {
      title: 'Đối thủ',
      key: 'opponent',
      render: (_: unknown, r: (typeof allMatches)[0]) => {
        const opponent = r.side === 'home' ? (r.awayTeam?.name ?? '—') : (r.homeTeam?.name ?? '—');
        const prefix = r.side === 'home' ? '(S)' : '(K)';
        return `${prefix} ${opponent}`;
      },
    },
    {
      title: 'Tỷ số',
      key: 'score',
      width: 100,
      render: (_: unknown, r: (typeof allMatches)[0]) =>
        r.homeScore != null ? `${r.homeScore} - ${r.awayScore}` : '— : —',
    },
    {
      title: 'Kết quả',
      key: 'result',
      width: 80,
      render: (_: unknown, r: (typeof allMatches)[0]) => {
        const res = getMatchResult(r);
        return res ? <Tag color={res.color}>{res.label}</Tag> : '—';
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (s: string) => {
        const st = STATUS_MAP[s];
        return <Tag color={st?.color}>{st?.label ?? s}</Tag>;
      },
    },
    {
      title: 'Ngày',
      key: 'date',
      width: 120,
      render: (_: unknown, r: (typeof allMatches)[0]) =>
        r.kickoffAt ? new Date(r.kickoffAt).toLocaleDateString('vi-VN') : '—',
    },
  ];

  const currentStanding = team.standings.length > 0 ? team.standings[0] : null;

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/teams')}>
          Quay lại
        </Button>
        <Title level={3} style={{ margin: 0 }}>
          {team.name}
        </Title>
        <Tag color={team.status === 'ACTIVE' ? 'green' : 'red'}>
          {team.status === 'ACTIVE' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
        </Tag>
      </Space>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={8}>
          <Card size="small">
            <Statistic title="Cầu thủ" value={team.teamPlayers.length} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card size="small">
            <Statistic title="Trận đấu" value={allMatches.length} prefix={<TrophyOutlined />} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card size="small">
            <Statistic
              title="Sân nhà"
              value={team.stadium?.name ?? 'Chưa có'}
              prefix={<EnvironmentOutlined />}
              valueStyle={{ fontSize: 16 }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs
        defaultActiveKey="info"
        items={[
          {
            key: 'info',
            label: 'Tổng quan',
            children: (
              <Card>
                <Descriptions bordered column={{ xs: 1, sm: 2 }}>
                  <Descriptions.Item label="Tên đội">{team.name}</Descriptions.Item>
                  <Descriptions.Item label="Tên viết tắt">
                    {team.shortName ?? '—'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Thành phố">{team.city ?? '—'}</Descriptions.Item>
                  <Descriptions.Item label="Sân nhà">{team.stadium?.name ?? '—'}</Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    <Tag color={team.status === 'ACTIVE' ? 'green' : 'red'}>
                      {team.status === 'ACTIVE' ? 'Đang hoạt động' : 'Ngừng'}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>

                {currentStanding && (
                  <Card
                    size="small"
                    title={`Thống kê — ${currentStanding.season.name}`}
                    style={{ marginTop: 16 }}
                  >
                    <Row gutter={16}>
                      {[
                        { label: 'Hạng', value: currentStanding.rank ?? '—' },
                        { label: 'Điểm', value: currentStanding.points },
                        { label: 'Trận', value: currentStanding.played },
                        { label: 'Thắng', value: currentStanding.win },
                        { label: 'Hòa', value: currentStanding.draw },
                        { label: 'Thua', value: currentStanding.loss },
                        { label: 'BT', value: currentStanding.goalsFor },
                        { label: 'BN', value: currentStanding.goalsAgainst },
                        { label: 'HS', value: currentStanding.goalDiff },
                      ].map((s) => (
                        <Col key={s.label} span={4} xs={8} sm={4}>
                          <Statistic title={s.label} value={s.value} />
                        </Col>
                      ))}
                    </Row>
                  </Card>
                )}
              </Card>
            ),
          },
          {
            key: 'roster',
            label: `Đội hình (${team.teamPlayers.length})`,
            children: (
              <Table
                dataSource={team.teamPlayers}
                columns={rosterColumns}
                rowKey="id"
                pagination={false}
                size="small"
              />
            ),
          },
          {
            key: 'matches',
            label: `Trận đấu (${allMatches.length})`,
            children: (
              <Table
                dataSource={allMatches}
                columns={matchColumns}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                size="small"
              />
            ),
          },
        ]}
      />
    </div>
  );
}

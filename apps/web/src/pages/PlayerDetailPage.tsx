import { ArrowLeftOutlined, TrophyOutlined, WarningOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Descriptions,
  message,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Table,
  Tabs,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../lib/api';
import { apiGetPlayerStats, type PlayerStats } from '../services/searchApi';

const { Title } = Typography;

const POSITION_MAP: Record<string, { label: string; color: string }> = {
  GK: { label: 'Thủ môn', color: 'gold' },
  DF: { label: 'Hậu vệ', color: 'blue' },
  MF: { label: 'Tiền vệ', color: 'green' },
  FW: { label: 'Tiền đạo', color: 'red' },
};

const EVENT_ICONS: Record<string, string> = {
  GOAL: '⚽',
  OWN_GOAL: '⚽🔴',
  PENALTY: '⚽(P)',
  PENALTY_MISS: '❌(P)',
  YELLOW_CARD: '🟨',
  RED_CARD: '🟥',
  SUBSTITUTION: '🔄',
};

type MatchEvent = {
  id: string;
  minute: number;
  type: string;
  goalType?: string | null;
  note?: string | null;
  match: {
    id: string;
    roundNo: number;
    kickoffAt: string | null;
    season?: { id: string; name: string } | null;
  };
  team?: { id: string; name: string } | null;
};

type TeamHistory = {
  id: string;
  jerseyNumber: number | null;
  joinedAt: string;
  leftAt: string | null;
  team: { id: string; name: string; shortName?: string | null };
};

type PlayerDetail = {
  id: string;
  fullName: string;
  dob: string;
  nationality: string;
  position: string;
  playerType: string;
  birthPlace?: string | null;
  heightCm?: number | null;
  weightKg?: number | null;
  teamPlayers: TeamHistory[];
  matchEvents: MatchEvent[];
};

export default function PlayerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<PlayerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsSeason, setStatsSeason] = useState<string>();
  const [seasons, setSeasons] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    api
      .get<{ data: { id: string; name: string }[] }>('/seasons', { params: { limit: 50 } })
      .then((r) => setSeasons(r.data.data ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const fetchPlayer = async () => {
      try {
        const res = await api.get<PlayerDetail>(`/players/${id}`);
        if (!cancelled) setPlayer(res.data);
      } catch {
        if (!cancelled) message.error('Không thể tải thông tin cầu thủ');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    setLoading(true);
    fetchPlayer();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Fetch advanced player stats
  useEffect(() => {
    if (!id) return;
    setStatsLoading(true);
    apiGetPlayerStats(id, statsSeason)
      .then(setPlayerStats)
      .catch(() => setPlayerStats(null))
      .finally(() => setStatsLoading(false));
  }, [id, statsSeason]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!player) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Title level={4}>Không tìm thấy cầu thủ</Title>
        <Button onClick={() => navigate('/players')}>Quay lại</Button>
      </div>
    );
  }

  const currentTeam = player.teamPlayers.find((tp) => !tp.leftAt);
  const pos = POSITION_MAP[player.position];

  // Stats
  const goals = player.matchEvents.filter((e) => e.type === 'GOAL' || e.type === 'PENALTY').length;
  const ownGoals = player.matchEvents.filter((e) => e.type === 'OWN_GOAL').length;
  const yellowCards = player.matchEvents.filter((e) => e.type === 'YELLOW_CARD').length;
  const redCards = player.matchEvents.filter((e) => e.type === 'RED_CARD').length;

  const age = new Date().getFullYear() - new Date(player.dob).getFullYear();

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/players')}>
          Quay lại
        </Button>
        <Title level={3} style={{ margin: 0 }}>
          {player.fullName}
        </Title>
        <Tag color={pos?.color}>{pos?.label ?? player.position}</Tag>
        <Tag color={player.playerType === 'FOREIGN' ? 'purple' : 'cyan'}>
          {player.playerType === 'FOREIGN' ? 'Ngoại binh' : 'Nội binh'}
        </Tag>
      </Space>

      {/* Stats Summary */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="Bàn thắng" value={goals} prefix={<TrophyOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Thẻ vàng"
              value={yellowCards}
              valueStyle={{ color: '#faad14' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Thẻ đỏ"
              value={redCards}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="Phản lưới" value={ownGoals} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Player Info */}
        <Col xs={24} md={12}>
          <Card title="Thông tin cá nhân" size="small">
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Họ tên">{player.fullName}</Descriptions.Item>
              <Descriptions.Item label="Ngày sinh">
                {new Date(player.dob).toLocaleDateString('vi-VN')} ({age} tuổi)
              </Descriptions.Item>
              <Descriptions.Item label="Quốc tịch">{player.nationality}</Descriptions.Item>
              <Descriptions.Item label="Nơi sinh">{player.birthPlace ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="Vị trí">
                <Tag color={pos?.color}>{pos?.label ?? player.position}</Tag>
              </Descriptions.Item>
              {player.heightCm && (
                <Descriptions.Item label="Chiều cao">{player.heightCm} cm</Descriptions.Item>
              )}
              {player.weightKg && (
                <Descriptions.Item label="Cân nặng">{player.weightKg} kg</Descriptions.Item>
              )}
              <Descriptions.Item label="Đội hiện tại">
                {currentTeam ? (
                  <a onClick={() => navigate(`/teams/${currentTeam.team.id}`)}>
                    {currentTeam.team.name}
                    {currentTeam.jerseyNumber ? ` (số ${currentTeam.jerseyNumber})` : ''}
                  </a>
                ) : (
                  <Tag color="default">Chưa thuộc đội nào</Tag>
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Team History */}
        <Col xs={24} md={12}>
          <Card title="Lịch sử đội bóng" size="small">
            <Table
              dataSource={player.teamPlayers}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                {
                  title: 'Đội',
                  key: 'team',
                  render: (_: unknown, r: TeamHistory) => (
                    <a onClick={() => navigate(`/teams/${r.team.id}`)}>{r.team.name}</a>
                  ),
                },
                {
                  title: 'Số áo',
                  dataIndex: 'jerseyNumber',
                  width: 70,
                  render: (v: number | null) => v ?? '—',
                },
                {
                  title: 'Từ',
                  key: 'from',
                  width: 100,
                  render: (_: unknown, r: TeamHistory) =>
                    new Date(r.joinedAt).toLocaleDateString('vi-VN'),
                },
                {
                  title: 'Đến',
                  key: 'to',
                  width: 100,
                  render: (_: unknown, r: TeamHistory) =>
                    r.leftAt ? new Date(r.leftAt).toLocaleDateString('vi-VN') : 'Hiện tại',
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Match Events Timeline */}
      {player.matchEvents.length > 0 && (
        <Card title="Sự kiện thi đấu" size="small" style={{ marginTop: 16 }}>
          <Timeline
            items={player.matchEvents.slice(0, 30).map((evt) => ({
              color:
                evt.type === 'GOAL' || evt.type === 'PENALTY'
                  ? 'green'
                  : evt.type === 'RED_CARD'
                    ? 'red'
                    : evt.type === 'YELLOW_CARD'
                      ? 'orange'
                      : 'blue',
              children: (
                <Space>
                  <span>{EVENT_ICONS[evt.type] ?? '•'}</span>
                  <span>Phút {evt.minute}'</span>
                  <Tag>{evt.team?.name ?? '—'}</Tag>
                  <span style={{ color: '#888' }}>
                    V{evt.match.roundNo}
                    {evt.match.season ? ` — ${evt.match.season.name}` : ''}
                  </span>
                  {evt.note && <span style={{ color: '#aaa' }}>({evt.note})</span>}
                </Space>
              ),
            }))}
          />
          {player.matchEvents.length > 30 && (
            <div style={{ textAlign: 'center', color: '#888' }}>
              ... và {player.matchEvents.length - 30} sự kiện khác
            </div>
          )}
        </Card>
      )}

      {/* Advanced Stats with Chart */}
      <Card
        title="Thống kê nâng cao"
        size="small"
        style={{ marginTop: 16 }}
        extra={
          <Select
            placeholder="Mùa giải"
            value={statsSeason}
            onChange={setStatsSeason}
            allowClear
            style={{ width: 180 }}
            size="small"
          >
            {seasons.map((s) => (
              <Select.Option key={s.id} value={s.id}>
                {s.name}
              </Select.Option>
            ))}
          </Select>
        }
      >
        {statsLoading ? (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <Spin />
          </div>
        ) : playerStats ? (
          <Tabs
            items={[
              {
                key: 'overview',
                label: 'Tổng quan',
                children: (
                  <Row gutter={[16, 16]}>
                    <Col xs={8} sm={4}>
                      <Statistic title="Trận" value={playerStats.matchesPlayed} />
                    </Col>
                    <Col xs={8} sm={4}>
                      <Statistic
                        title="Bàn thắng"
                        value={playerStats.goals}
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Col>
                    <Col xs={8} sm={4}>
                      <Statistic title="Kiến tạo" value={playerStats.assists} />
                    </Col>
                    <Col xs={8} sm={4}>
                      <Statistic title="Phản lưới" value={playerStats.ownGoals} />
                    </Col>
                    <Col xs={8} sm={4}>
                      <Statistic
                        title="Thẻ vàng"
                        value={playerStats.yellowCards}
                        valueStyle={{ color: '#faad14' }}
                      />
                    </Col>
                    <Col xs={8} sm={4}>
                      <Statistic
                        title="Thẻ đỏ"
                        value={playerStats.redCards}
                        valueStyle={{ color: '#ff4d4f' }}
                      />
                    </Col>
                  </Row>
                ),
              },
              {
                key: 'chart',
                label: 'Biểu đồ bàn thắng',
                children:
                  playerStats.goalsByRound && playerStats.goalsByRound.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={playerStats.goalsByRound}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="round" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar
                          dataKey="goals"
                          fill="#1890ff"
                          name="Bàn thắng"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ textAlign: 'center', padding: 24, color: '#888' }}>
                      Chưa có dữ liệu bàn thắng theo vòng đấu
                    </div>
                  ),
              },
            ]}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: 24, color: '#888' }}>
            Không thể tải thống kê nâng cao
          </div>
        )}
      </Card>
    </div>
  );
}

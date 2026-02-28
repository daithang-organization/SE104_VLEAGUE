import { Card, Col, Row } from 'antd';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TeamStat, TopScorer } from '../../services/standingsApi';

const PIE_COLORS = [
  '#1890ff',
  '#52c41a',
  '#faad14',
  '#f5222d',
  '#722ed1',
  '#13c2c2',
  '#eb2f96',
  '#fa8c16',
];

interface Props {
  scorers: TopScorer[];
  teamStats: TeamStat[];
  loading: boolean;
}

export default function ChartsTab({ scorers, teamStats, loading }: Props) {
  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}>Đang tải...</div>;

  const scorerBarData = scorers.slice(0, 10).map((s) => ({
    name: s.playerName.length > 12 ? s.playerName.slice(0, 12) + '…' : s.playerName,
    goals: s.goals,
  }));

  const goalsPieData = teamStats.map((t) => ({
    name: t.teamName.length > 15 ? t.teamName.slice(0, 15) + '…' : t.teamName,
    value: t.goalsFor,
  }));

  const pointsBarData = teamStats.map((t) => ({
    name: t.teamName.length > 10 ? t.teamName.slice(0, 10) + '…' : t.teamName,
    points: t.points,
    won: t.won,
    drawn: t.drawn,
    lost: t.lost,
  }));

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <Card title="Top 10 Vua phá lưới" size="small">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={scorerBarData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="goals" fill="#1890ff" name="Bàn thắng" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Col>

      <Col xs={24} lg={12}>
        <Card title="Tỉ lệ bàn thắng theo đội" size="small">
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={goalsPieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label
              >
                {goalsPieData.map((_, idx) => (
                  <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </Col>

      <Col xs={24}>
        <Card title="Điểm số & Thành tích các đội" size="small">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={pointsBarData} margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="won" stackId="a" fill="#52c41a" name="Thắng" />
              <Bar dataKey="drawn" stackId="a" fill="#faad14" name="Hòa" />
              <Bar dataKey="lost" stackId="a" fill="#f5222d" name="Thua" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Col>
    </Row>
  );
}

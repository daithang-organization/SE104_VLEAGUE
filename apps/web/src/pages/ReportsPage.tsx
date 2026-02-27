import { DownloadOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Col, Flex, Row, Space, Table, Tabs, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useEffect, useState } from 'react';
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
import ExportButton from '../components/ExportButton';
import {
  apiGetCardStats,
  apiGetTeamStats,
  apiGetTopScorers,
  type CardStat,
  type TeamStat,
  type TopScorer,
} from '../services/standingsApi';

/* ────────── Top Scorers Tab ────────── */

const scorerColumns: ColumnsType<TopScorer> = [
  {
    title: '#',
    dataIndex: 'position',
    width: 50,
    align: 'center',
    render: (pos: number) => (pos <= 3 ? <Tag color="gold">{pos}</Tag> : pos),
  },
  { title: 'Cầu thủ', dataIndex: 'playerName', ellipsis: true },
  { title: 'Đội', dataIndex: 'teamName', ellipsis: true },
  {
    title: 'Bàn thắng',
    dataIndex: 'goals',
    width: 110,
    align: 'center',
    sorter: (a, b) => a.goals - b.goals,
    render: (g: number) => <strong>{g}</strong>,
  },
];

function TopScorersTab() {
  const [data, setData] = useState<TopScorer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    apiGetTopScorers(undefined, 20)
      .then(setData)
      .catch((e) => setError(e?.message || 'Lỗi tải dữ liệu'))
      .finally(() => setLoading(false));
  }, []);

  if (error) return <Alert type="error" message={error} showIcon />;
  return (
    <>
      <Flex justify="flex-end" style={{ marginBottom: 8 }}>
        <ExportButton
          columns={[
            { title: '#', key: 'position' },
            { title: 'Cầu thủ', key: 'playerName' },
            { title: 'Đội', key: 'teamName' },
            { title: 'Bàn thắng', key: 'goals' },
          ]}
          dataSource={data as unknown as Record<string, unknown>[]}
          filename="vua-pha-luoi"
        />
      </Flex>
      <Table
        rowKey="playerId"
        columns={scorerColumns}
        dataSource={data}
        loading={loading}
        pagination={false}
        size="middle"
        locale={{ emptyText: 'Chưa có dữ liệu bàn thắng' }}
      />
    </>
  );
}

/* ────────── Card Stats Tab ────────── */

const cardColumns: ColumnsType<CardStat> = [
  { title: '#', dataIndex: 'position', width: 50, align: 'center' },
  { title: 'Cầu thủ', dataIndex: 'playerName', ellipsis: true },
  { title: 'Đội', dataIndex: 'teamName', ellipsis: true },
  {
    title: 'Thẻ vàng',
    dataIndex: 'yellowCards',
    width: 100,
    align: 'center',
    sorter: (a, b) => a.yellowCards - b.yellowCards,
    render: (v: number) =>
      v > 0 ? (
        <Space size={4}>
          <span
            style={{
              display: 'inline-block',
              width: 12,
              height: 16,
              background: '#fadb14',
              borderRadius: 2,
            }}
          />
          {v}
        </Space>
      ) : (
        '–'
      ),
  },
  {
    title: 'Thẻ đỏ',
    dataIndex: 'redCards',
    width: 100,
    align: 'center',
    sorter: (a, b) => a.redCards - b.redCards,
    render: (v: number) =>
      v > 0 ? (
        <Space size={4}>
          <span
            style={{
              display: 'inline-block',
              width: 12,
              height: 16,
              background: '#f5222d',
              borderRadius: 2,
            }}
          />
          {v}
        </Space>
      ) : (
        '–'
      ),
  },
  {
    title: 'Tổng',
    dataIndex: 'totalCards',
    width: 80,
    align: 'center',
    sorter: (a, b) => a.totalCards - b.totalCards,
    render: (v: number) => <strong>{v}</strong>,
  },
];

function CardStatsTab() {
  const [data, setData] = useState<CardStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    apiGetCardStats(undefined, 30)
      .then(setData)
      .catch((e) => setError(e?.message || 'Lỗi tải dữ liệu'))
      .finally(() => setLoading(false));
  }, []);

  if (error) return <Alert type="error" message={error} showIcon />;
  return (
    <>
      <Flex justify="flex-end" style={{ marginBottom: 8 }}>
        <ExportButton
          columns={[
            { title: '#', key: 'position' },
            { title: 'Cầu thủ', key: 'playerName' },
            { title: 'Đội', key: 'teamName' },
            { title: 'Thẻ vàng', key: 'yellowCards' },
            { title: 'Thẻ đỏ', key: 'redCards' },
            { title: 'Tổng', key: 'totalCards' },
          ]}
          dataSource={data as unknown as Record<string, unknown>[]}
          filename="the-phat"
        />
      </Flex>
      <Table
        rowKey="playerId"
        columns={cardColumns}
        dataSource={data}
        loading={loading}
        pagination={false}
        size="middle"
        locale={{ emptyText: 'Chưa có dữ liệu thẻ phạt' }}
      />
    </>
  );
}

/* ────────── Team Stats Tab ────────── */

const teamColumns: ColumnsType<TeamStat> = [
  { title: 'Đội', dataIndex: 'teamName', ellipsis: true, fixed: 'left', width: 160 },
  { title: 'Trận', dataIndex: 'played', width: 60, align: 'center' },
  { title: 'T', dataIndex: 'won', width: 50, align: 'center' },
  { title: 'H', dataIndex: 'drawn', width: 50, align: 'center' },
  { title: 'B', dataIndex: 'lost', width: 50, align: 'center' },
  {
    title: 'BT',
    dataIndex: 'goalsFor',
    width: 60,
    align: 'center',
    sorter: (a, b) => a.goalsFor - b.goalsFor,
  },
  {
    title: 'BB',
    dataIndex: 'goalsAgainst',
    width: 60,
    align: 'center',
    sorter: (a, b) => a.goalsAgainst - b.goalsAgainst,
  },
  {
    title: '+/–',
    dataIndex: 'goalDifference',
    width: 60,
    align: 'center',
    sorter: (a, b) => a.goalDifference - b.goalDifference,
    render: (v: number) => (
      <span style={{ color: v > 0 ? '#389e0d' : v < 0 ? '#cf1322' : undefined }}>
        {v > 0 ? `+${v}` : v}
      </span>
    ),
  },
  {
    title: 'Điểm',
    dataIndex: 'points',
    width: 65,
    align: 'center',
    sorter: (a, b) => a.points - b.points,
    render: (v: number) => <strong>{v}</strong>,
  },
  {
    title: 'Sạch lưới',
    dataIndex: 'cleanSheets',
    width: 90,
    align: 'center',
    sorter: (a, b) => a.cleanSheets - b.cleanSheets,
  },
  {
    title: '🟨',
    dataIndex: 'yellowCards',
    width: 55,
    align: 'center',
    sorter: (a, b) => a.yellowCards - b.yellowCards,
  },
  {
    title: '🟥',
    dataIndex: 'redCards',
    width: 55,
    align: 'center',
    sorter: (a, b) => a.redCards - b.redCards,
  },
];

function TeamStatsTab() {
  const [data, setData] = useState<TeamStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    apiGetTeamStats()
      .then(setData)
      .catch((e) => setError(e?.message || 'Lỗi tải dữ liệu'))
      .finally(() => setLoading(false));
  }, []);

  if (error) return <Alert type="error" message={error} showIcon />;
  return (
    <Table
      rowKey="teamId"
      columns={teamColumns}
      dataSource={data}
      loading={loading}
      pagination={false}
      size="middle"
      scroll={{ x: 900 }}
      locale={{ emptyText: 'Chưa có dữ liệu thống kê đội' }}
    />
  );
}

/* ────────── Charts / Visual Tab ────────── */

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

function ChartsTab() {
  const [scorers, setScorers] = useState<TopScorer[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    Promise.allSettled([apiGetTopScorers(undefined, 10), apiGetTeamStats()])
      .then(([scorerRes, teamRes]) => {
        if (scorerRes.status === 'fulfilled') setScorers(scorerRes.value);
        if (teamRes.status === 'fulfilled') setTeamStats(teamRes.value);
      })
      .catch((e) => setError(e?.message ?? 'Lỗi'))
      .finally(() => setLoading(false));
  }, []);

  if (error) return <Alert type="error" message={error} showIcon />;
  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}>Đang tải...</div>;

  // Top scorers bar chart
  const scorerBarData = scorers.slice(0, 10).map((s) => ({
    name: s.playerName.length > 12 ? s.playerName.slice(0, 12) + '…' : s.playerName,
    goals: s.goals,
  }));

  // Team goals pie chart
  const goalsPieData = teamStats.map((t) => ({
    name: t.teamName.length > 15 ? t.teamName.slice(0, 15) + '…' : t.teamName,
    value: t.goalsFor,
  }));

  // Team points bar chart
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

/* ────────── PDF Export Utility ────────── */

function exportPdf(title: string, headers: string[], rows: string[][]) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 14, 20);
  doc.setFontSize(10);
  doc.text(`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`, 14, 28);
  autoTable(doc, {
    startY: 34,
    head: [headers],
    body: rows,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [0, 21, 41] },
  });
  doc.save(`${title.replace(/\s+/g, '-').toLowerCase()}.pdf`);
}

/* ────────── Main Page ────────── */

export default function ReportsPage() {
  const [scorersForPdf, setScorersForPdf] = useState<TopScorer[]>([]);
  const [teamStatsForPdf, setTeamStatsForPdf] = useState<TeamStat[]>([]);

  useEffect(() => {
    apiGetTopScorers(undefined, 50)
      .then(setScorersForPdf)
      .catch(() => {});
    apiGetTeamStats()
      .then(setTeamStatsForPdf)
      .catch(() => {});
  }, []);

  const handleExportScorersPdf = () => {
    exportPdf(
      'VLeague - Vua pha luoi',
      ['#', 'Cau thu', 'Doi', 'Ban thang'],
      scorersForPdf.map((s) => [String(s.position), s.playerName, s.teamName, String(s.goals)]),
    );
  };

  const handleExportTeamStatsPdf = () => {
    exportPdf(
      'VLeague - Thong ke doi',
      ['Doi', 'Tran', 'Thang', 'Hoa', 'Thua', 'BT', 'BB', '+/-', 'Diem'],
      teamStatsForPdf.map((t) => [
        t.teamName,
        String(t.played),
        String(t.won),
        String(t.drawn),
        String(t.lost),
        String(t.goalsFor),
        String(t.goalsAgainst),
        String(t.goalDifference),
        String(t.points),
      ]),
    );
  };

  return (
    <Card>
      <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
        <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 0 }}>
          Báo cáo &amp; Thống kê
        </Typography.Title>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleExportScorersPdf}>
            PDF Vua phá lưới
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleExportTeamStatsPdf}>
            PDF Thống kê đội
          </Button>
        </Space>
      </Flex>

      <Tabs
        defaultActiveKey="scorers"
        items={[
          {
            key: 'scorers',
            label: '🏆 Vua phá lưới',
            children: <TopScorersTab />,
          },
          {
            key: 'cards',
            label: '🟨 Thẻ phạt',
            children: <CardStatsTab />,
          },
          {
            key: 'team-stats',
            label: '📊 Thống kê đội',
            children: <TeamStatsTab />,
          },
          {
            key: 'charts',
            label: '📈 Biểu đồ',
            children: <ChartsTab />,
          },
        ]}
      />
    </Card>
  );
}

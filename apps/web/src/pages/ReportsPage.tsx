import { Alert, Card, Space, Table, Tabs, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
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
    <Table
      rowKey="playerId"
      columns={scorerColumns}
      dataSource={data}
      loading={loading}
      pagination={false}
      size="middle"
      locale={{ emptyText: 'Chưa có dữ liệu bàn thắng' }}
    />
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
    <Table
      rowKey="playerId"
      columns={cardColumns}
      dataSource={data}
      loading={loading}
      pagination={false}
      size="middle"
      locale={{ emptyText: 'Chưa có dữ liệu thẻ phạt' }}
    />
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

/* ────────── Main Page ────────── */

export default function ReportsPage() {
  return (
    <Card>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        Báo cáo &amp; Thống kê
      </Typography.Title>

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
        ]}
      />
    </Card>
  );
}

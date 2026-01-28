import { Card, Empty, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';

type StandingsRow = {
  key: string;
  rank: number;
  teamName: string;
  played: number;
  win: number;
  draw: number;
  loss: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
};

const columns: ColumnsType<StandingsRow> = [
  { title: '#', dataIndex: 'rank', width: 60 },
  { title: 'Team', dataIndex: 'teamName' },
  { title: 'P', dataIndex: 'played', width: 60 },
  { title: 'W', dataIndex: 'win', width: 60 },
  { title: 'D', dataIndex: 'draw', width: 60 },
  { title: 'L', dataIndex: 'loss', width: 60 },
  { title: 'GF', dataIndex: 'gf', width: 70 },
  { title: 'GA', dataIndex: 'ga', width: 70 },
  { title: 'GD', dataIndex: 'gd', width: 70 },
  { title: 'Pts', dataIndex: 'points', width: 70 },
];

export default function StandingsPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<StandingsRow[]>([]);

  // Sprint 0: no real API, simulate loading then empty state
  useEffect(() => {
    const t = setTimeout(() => {
      setRows([]); // empty
      setLoading(false);
    }, 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <Card>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        Standings
      </Typography.Title>

      <Table
        columns={columns}
        dataSource={rows}
        loading={loading}
        pagination={false}
        locale={{
          emptyText: loading ? 'Loading...' : <Empty description="No standings data yet" />,
        }}
        size="middle"
      />
    </Card>
  );
}

import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TeamStat } from '../../services/standingsApi';

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

interface Props {
  data: TeamStat[];
  loading: boolean;
}

export default function TeamStatsTab({ data, loading }: Props) {
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

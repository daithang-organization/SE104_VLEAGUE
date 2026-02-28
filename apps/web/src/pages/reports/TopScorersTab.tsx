import { Flex, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import ExportButton from '../../components/ExportButton';
import type { TopScorer } from '../../services/standingsApi';

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

interface Props {
  data: TopScorer[];
  loading: boolean;
}

export default function TopScorersTab({ data, loading }: Props) {
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

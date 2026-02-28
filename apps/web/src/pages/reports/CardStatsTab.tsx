import { Flex, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import ExportButton from '../../components/ExportButton';
import type { CardStat } from '../../services/standingsApi';

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

interface Props {
  data: CardStat[];
  loading: boolean;
}

export default function CardStatsTab({ data, loading }: Props) {
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

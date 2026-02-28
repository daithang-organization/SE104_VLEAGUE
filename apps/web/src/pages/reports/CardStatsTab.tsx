import { Flex, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import ExportButton from '../../components/ExportButton';
import type { CardStat } from '../../services/standingsApi';

interface Props {
  data: CardStat[];
  loading: boolean;
}

export default function CardStatsTab({ data, loading }: Props) {
  const { t } = useTranslation();

  const cardColumns: ColumnsType<CardStat> = [
    { title: t('cardStatsTab.colRank'), dataIndex: 'position', width: 50, align: 'center' },
    { title: t('cardStatsTab.colPlayer'), dataIndex: 'playerName', ellipsis: true },
    { title: t('cardStatsTab.colTeam'), dataIndex: 'teamName', ellipsis: true },
    {
      title: t('cardStatsTab.colYellowCards'),
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
      title: t('cardStatsTab.colRedCards'),
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
      title: t('cardStatsTab.colTotal'),
      dataIndex: 'totalCards',
      width: 80,
      align: 'center',
      sorter: (a, b) => a.totalCards - b.totalCards,
      render: (v: number) => <strong>{v}</strong>,
    },
  ];

  return (
    <>
      <Flex justify="flex-end" style={{ marginBottom: 8 }}>
        <ExportButton
          columns={[
            { title: t('cardStatsTab.colRank'), key: 'position' },
            { title: t('cardStatsTab.colPlayer'), key: 'playerName' },
            { title: t('cardStatsTab.colTeam'), key: 'teamName' },
            { title: t('cardStatsTab.colYellowCards'), key: 'yellowCards' },
            { title: t('cardStatsTab.colRedCards'), key: 'redCards' },
            { title: t('cardStatsTab.colTotal'), key: 'totalCards' },
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
        locale={{ emptyText: t('cardStatsTab.empty') }}
      />
    </>
  );
}

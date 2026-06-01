import { Flex, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import ExportButton from '../../components/ExportButton';
import type { TopScorer } from '../../services/standingsApi';

interface Props {
  data: TopScorer[];
  loading: boolean;
}

export default function TopScorersTab({ data, loading }: Props) {
  const { t } = useTranslation();

  const scorerColumns: ColumnsType<TopScorer> = [
    {
      title: t('topScorersTab.colRank'),
      dataIndex: 'position',
      width: 50,
      align: 'center',
      render: (pos: number) => (pos <= 3 ? <Tag color="gold">{pos}</Tag> : pos),
    },
    { title: t('topScorersTab.colPlayer'), dataIndex: 'playerName', ellipsis: true },
    { title: t('topScorersTab.colTeam'), dataIndex: 'teamName', ellipsis: true },
    {
      title: t('topScorersTab.colGoals'),
      dataIndex: 'goals',
      width: 110,
      align: 'center',
      sorter: (a, b) => a.goals - b.goals,
      render: (g: number) => <strong>{g}</strong>,
    },
  ];

  return (
    <>
      <Flex justify="flex-end" style={{ marginBottom: 8 }}>
        <ExportButton
          columns={[
            { title: t('topScorersTab.colRank'), key: 'position' },
            { title: t('topScorersTab.colPlayer'), key: 'playerName' },
            { title: t('topScorersTab.colTeam'), key: 'teamName' },
            { title: t('topScorersTab.colGoals'), key: 'goals' },
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
        pagination={{
          defaultPageSize: 20,
          showSizeChanger: true,
          pageSizeOptions: [10, 15, 20, 50],
          showTotal: (total) => t('players.totalCount', { total }),
        }}
        size="middle"
        locale={{ emptyText: t('topScorersTab.empty') }}
      />
    </>
  );
}

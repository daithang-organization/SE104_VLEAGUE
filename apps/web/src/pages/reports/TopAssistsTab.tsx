import { Flex, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import ExportButton from '../../components/ExportButton';
import type { TopAssist } from '../../services/standingsApi';

interface Props {
  data: TopAssist[];
  loading: boolean;
}

export default function TopAssistsTab({ data, loading }: Props) {
  const { t } = useTranslation();

  const assistColumns: ColumnsType<TopAssist> = [
    {
      title: t('topAssistsTab.colRank'),
      dataIndex: 'position',
      width: 50,
      align: 'center',
      render: (pos: number) => (pos <= 3 ? <Tag color="blue">{pos}</Tag> : pos),
    },
    { title: t('topAssistsTab.colPlayer'), dataIndex: 'playerName', ellipsis: true },
    { title: t('topAssistsTab.colTeam'), dataIndex: 'teamName', ellipsis: true },
    {
      title: t('topAssistsTab.colAssists'),
      dataIndex: 'assists',
      width: 120,
      align: 'center',
      sorter: (a, b) => a.assists - b.assists,
      render: (assists: number) => <strong>{assists}</strong>,
    },
  ];

  return (
    <>
      <Flex justify="flex-end" style={{ marginBottom: 8 }}>
        <ExportButton
          columns={[
            { title: t('topAssistsTab.colRank'), key: 'position' },
            { title: t('topAssistsTab.colPlayer'), key: 'playerName' },
            { title: t('topAssistsTab.colTeam'), key: 'teamName' },
            { title: t('topAssistsTab.colAssists'), key: 'assists' },
          ]}
          dataSource={data as unknown as Record<string, unknown>[]}
          filename="top-kien-tao"
        />
      </Flex>
      <Table
        rowKey="playerId"
        columns={assistColumns}
        dataSource={data}
        loading={loading}
        pagination={{
          defaultPageSize: 20,
          showSizeChanger: true,
          pageSizeOptions: [10, 15, 20, 50],
          showTotal: (total) => t('players.totalCount', { total }),
        }}
        size="middle"
        locale={{ emptyText: t('topAssistsTab.empty') }}
      />
    </>
  );
}

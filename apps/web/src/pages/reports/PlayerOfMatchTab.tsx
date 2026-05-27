import { Flex, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import ExportButton from '../../components/ExportButton';
import type { PlayerOfMatchStat } from '../../services/standingsApi';

interface Props {
  data: PlayerOfMatchStat[];
  loading: boolean;
}

export default function PlayerOfMatchTab({ data, loading }: Props) {
  const { t } = useTranslation();

  const columns: ColumnsType<PlayerOfMatchStat> = [
    {
      title: t('playerOfMatchTab.colRank'),
      dataIndex: 'position',
      width: 60,
      align: 'center',
      render: (pos: number) => (pos <= 3 ? <Tag color="gold">{pos}</Tag> : pos),
    },
    { title: t('playerOfMatchTab.colPlayer'), dataIndex: 'playerName', ellipsis: true },
    {
      title: t('playerOfMatchTab.colAwards'),
      dataIndex: 'awards',
      width: 140,
      align: 'center',
      sorter: (a, b) => a.awards - b.awards,
      render: (awards: number) => <strong>{awards}</strong>,
    },
  ];

  return (
    <>
      <Flex justify="flex-end" style={{ marginBottom: 8 }}>
        <ExportButton
          columns={[
            { title: t('playerOfMatchTab.colRank'), key: 'position' },
            { title: t('playerOfMatchTab.colPlayer'), key: 'playerName' },
            { title: t('playerOfMatchTab.colAwards'), key: 'awards' },
          ]}
          dataSource={data as unknown as Record<string, unknown>[]}
          filename="cau-thu-xuat-sac-tran"
        />
      </Flex>
      <Table
        rowKey="playerId"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={false}
        size="middle"
        locale={{ emptyText: t('playerOfMatchTab.empty') }}
      />
    </>
  );
}

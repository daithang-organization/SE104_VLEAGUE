import { Flex, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import type { SuspensionStat } from '../../services/standingsApi';
import ExportButton from '../../components/ExportButton';

interface Props {
  data: SuspensionStat[];
  loading: boolean;
}

export default function SuspensionsTab({ data, loading }: Props) {
  const { t } = useTranslation();

  const statusMeta: Record<SuspensionStat['status'], { color: string; label: string }> = {
    ACTIVE: { color: 'red', label: t('suspensionsTab.statusActive') },
    SERVED: { color: 'green', label: t('suspensionsTab.statusServed') },
    CANCELLED: { color: 'default', label: t('suspensionsTab.statusCancelled') },
  };

  const columns: ColumnsType<SuspensionStat> = [
    {
      title: '#',
      key: 'index',
      width: 50,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    { title: t('suspensionsTab.colPlayer'), dataIndex: 'playerName', ellipsis: true },
    { title: t('suspensionsTab.colTeam'), dataIndex: 'teamName', ellipsis: true },
    { title: t('suspensionsTab.colReason'), dataIndex: 'reason', ellipsis: true },
    {
      title: t('suspensionsTab.colStatus'),
      dataIndex: 'status',
      width: 130,
      align: 'center',
      render: (status: SuspensionStat['status']) => {
        const meta = statusMeta[status];
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: t('suspensionsTab.colSourceRound'),
      dataIndex: 'sourceRound',
      width: 110,
      align: 'center',
      render: (round: number | null) => round ?? '-',
    },
    {
      title: t('suspensionsTab.colEffectiveRound'),
      dataIndex: 'effectiveRound',
      width: 120,
      align: 'center',
      render: (round: number | null) => round ?? '-',
    },
  ];

  return (
    <>
      <Flex justify="flex-end" style={{ marginBottom: 8 }}>
        <ExportButton
          columns={[
            { title: t('suspensionsTab.colPlayer'), key: 'playerName' },
            { title: t('suspensionsTab.colTeam'), key: 'teamName' },
            { title: t('suspensionsTab.colReason'), key: 'reason' },
            { title: t('suspensionsTab.colStatus'), key: 'status' },
            { title: t('suspensionsTab.colSourceRound'), key: 'sourceRound' },
            { title: t('suspensionsTab.colEffectiveRound'), key: 'effectiveRound' },
          ]}
          dataSource={
            data.map((item) => ({
              ...item,
              status: statusMeta[item.status].label,
            })) as unknown as Record<string, unknown>[]
          }
          filename="treo-gio"
        />
      </Flex>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          defaultPageSize: 20,
          showSizeChanger: true,
          pageSizeOptions: [10, 15, 20, 50],
          showTotal: (total) => t('players.totalCount', { total }),
        }}
        size="middle"
        scroll={{ x: 760 }}
        locale={{ emptyText: t('suspensionsTab.empty') }}
      />
    </>
  );
}

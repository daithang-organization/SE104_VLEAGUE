import { WarningOutlined } from '@ant-design/icons';
import { Flex, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import type { TeamStat } from '../../services/standingsApi';
import ExportButton from '../../components/ExportButton';

interface Props {
  data: TeamStat[];
  loading: boolean;
}

export default function TeamStatsTab({ data, loading }: Props) {
  const { t } = useTranslation();

  const teamColumns: ColumnsType<TeamStat> = [
    {
      title: '#',
      key: 'index',
      width: 50,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: t('teamStatsTab.colTeam'),
      dataIndex: 'teamName',
      ellipsis: true,
      fixed: 'left',
      width: 160,
    },
    { title: t('teamStatsTab.colPlayed'), dataIndex: 'played', width: 60, align: 'center' },
    { title: t('teamStatsTab.colWon'), dataIndex: 'won', width: 50, align: 'center' },
    { title: t('teamStatsTab.colDrawn'), dataIndex: 'drawn', width: 50, align: 'center' },
    { title: t('teamStatsTab.colLost'), dataIndex: 'lost', width: 50, align: 'center' },
    {
      title: t('teamStatsTab.colGoalsFor'),
      dataIndex: 'goalsFor',
      width: 60,
      align: 'center',
      sorter: (a, b) => a.goalsFor - b.goalsFor,
    },
    {
      title: t('teamStatsTab.colGoalsAgainst'),
      dataIndex: 'goalsAgainst',
      width: 60,
      align: 'center',
      sorter: (a, b) => a.goalsAgainst - b.goalsAgainst,
    },
    {
      title: t('teamStatsTab.colGoalDiff'),
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
      title: t('teamStatsTab.colPoints'),
      dataIndex: 'points',
      width: 65,
      align: 'center',
      sorter: (a, b) => a.points - b.points,
      render: (v: number) => <strong>{v}</strong>,
    },
    {
      title: t('teamStatsTab.colCleanSheets'),
      dataIndex: 'cleanSheets',
      width: 90,
      align: 'center',
      sorter: (a, b) => a.cleanSheets - b.cleanSheets,
    },
    {
      title: <WarningOutlined style={{ color: '#faad14' }} />,
      dataIndex: 'yellowCards',
      width: 55,
      align: 'center',
      sorter: (a, b) => a.yellowCards - b.yellowCards,
    },
    {
      title: <WarningOutlined style={{ color: '#f5222d' }} />,
      dataIndex: 'redCards',
      width: 55,
      align: 'center',
      sorter: (a, b) => a.redCards - b.redCards,
    },
  ];

  return (
    <>
      <Flex justify="flex-end" style={{ marginBottom: 8 }}>
        <ExportButton
          columns={[
            { title: t('teamStatsTab.colTeam'), key: 'teamName' },
            { title: t('teamStatsTab.colPlayed'), key: 'played' },
            { title: t('teamStatsTab.colWon'), key: 'won' },
            { title: t('teamStatsTab.colDrawn'), key: 'drawn' },
            { title: t('teamStatsTab.colLost'), key: 'lost' },
            { title: t('teamStatsTab.colGoalsFor'), key: 'goalsFor' },
            { title: t('teamStatsTab.colGoalsAgainst'), key: 'goalsAgainst' },
            { title: t('teamStatsTab.colGoalDiff'), key: 'goalDifference' },
            { title: t('teamStatsTab.colPoints'), key: 'points' },
            { title: t('teamStatsTab.colCleanSheets'), key: 'cleanSheets' },
            { title: 'Thẻ vàng', key: 'yellowCards' },
            { title: 'Thẻ đỏ', key: 'redCards' },
          ]}
          dataSource={data as unknown as Record<string, unknown>[]}
          filename="thong-ke-doi"
        />
      </Flex>
      <Table
        rowKey="teamId"
        columns={teamColumns}
        dataSource={data}
        loading={loading}
        pagination={{
          defaultPageSize: 20,
          showSizeChanger: true,
          pageSizeOptions: [10, 15, 20, 50],
          showTotal: (total) => t('common.totalCount', { total }),
        }}
        size="middle"
        scroll={{ x: 900 }}
        locale={{ emptyText: t('teamStatsTab.empty') }}
      />
    </>
  );
}

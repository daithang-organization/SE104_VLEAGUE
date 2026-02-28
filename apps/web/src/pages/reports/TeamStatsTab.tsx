import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import type { TeamStat } from '../../services/standingsApi';

interface Props {
  data: TeamStat[];
  loading: boolean;
}

export default function TeamStatsTab({ data, loading }: Props) {
  const { t } = useTranslation();

  const teamColumns: ColumnsType<TeamStat> = [
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

  return (
    <Table
      rowKey="teamId"
      columns={teamColumns}
      dataSource={data}
      loading={loading}
      pagination={false}
      size="middle"
      scroll={{ x: 900 }}
      locale={{ emptyText: t('teamStatsTab.empty') }}
    />
  );
}

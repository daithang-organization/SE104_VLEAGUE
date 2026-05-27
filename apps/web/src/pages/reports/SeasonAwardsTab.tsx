import { Alert, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import type { SeasonAwards } from '../../services/standingsApi';

interface Props {
  awards: SeasonAwards | null;
  loading: boolean;
}

type AwardRow = {
  key: string;
  category: string;
  winner: string;
  detail: string;
};

export default function SeasonAwardsTab({ awards, loading }: Props) {
  const { t } = useTranslation();

  const rows: AwardRow[] = awards
    ? [
        {
          key: 'champion',
          category: t('seasonAwardsTab.champion'),
          winner: awards.champion?.teamName ?? '-',
          detail: awards.champion
            ? t('seasonAwardsTab.pointsDetail', { count: awards.champion.points })
            : '-',
        },
        {
          key: 'runnerUp',
          category: t('seasonAwardsTab.runnerUp'),
          winner: awards.runnerUp?.teamName ?? '-',
          detail: awards.runnerUp
            ? t('seasonAwardsTab.pointsDetail', { count: awards.runnerUp.points })
            : '-',
        },
        {
          key: 'topScorer',
          category: t('seasonAwardsTab.topScorer'),
          winner: awards.topScorer?.playerName ?? '-',
          detail: awards.topScorer
            ? t('seasonAwardsTab.goalsDetail', { count: awards.topScorer.goals })
            : '-',
        },
        {
          key: 'bestPlayer',
          category: t('seasonAwardsTab.bestPlayer'),
          winner: awards.bestPlayer?.playerName ?? '-',
          detail: awards.bestPlayer
            ? t('seasonAwardsTab.awardsDetail', { count: awards.bestPlayer.awards })
            : '-',
        },
      ]
    : [];

  const columns: ColumnsType<AwardRow> = [
    {
      title: t('seasonAwardsTab.colCategory'),
      dataIndex: 'category',
      width: 180,
      render: (category: string) => <Tag color="gold">{category}</Tag>,
    },
    { title: t('seasonAwardsTab.colWinner'), dataIndex: 'winner', ellipsis: true },
    { title: t('seasonAwardsTab.colDetail'), dataIndex: 'detail', width: 180 },
  ];

  return (
    <Space direction="vertical" size={12} style={{ width: '100%' }}>
      {awards?.requiresDrawLot ? (
        <Alert type="warning" showIcon message={t('seasonAwardsTab.drawLotWarning')} />
      ) : null}
      <Table
        rowKey="key"
        columns={columns}
        dataSource={rows}
        loading={loading}
        pagination={false}
        size="middle"
        locale={{ emptyText: t('seasonAwardsTab.empty') }}
      />
    </Space>
  );
}

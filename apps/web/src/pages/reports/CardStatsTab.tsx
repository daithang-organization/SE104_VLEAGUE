import { WarningOutlined } from '@ant-design/icons';
import { Flex, Space, Table, Typography } from 'antd';
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

  const yellowCardData = data
    .filter((item) => item.yellowCards > 0)
    .sort((a, b) => b.yellowCards - a.yellowCards);
  const redCardData = data
    .filter((item) => item.redCards > 0)
    .sort((a, b) => b.redCards - a.redCards);

  const buildCardColumns = (
    cardType: 'yellowCards' | 'redCards',
    color: string,
  ): ColumnsType<CardStat> => [
    {
      title: t('cardStatsTab.colRank'),
      width: 50,
      align: 'center',
      render: (_value, _record, index) => index + 1,
    },
    { title: t('cardStatsTab.colPlayer'), dataIndex: 'playerName', ellipsis: true },
    { title: t('cardStatsTab.colTeam'), dataIndex: 'teamName', ellipsis: true },
    {
      title:
        cardType === 'yellowCards'
          ? t('cardStatsTab.colYellowCards')
          : t('cardStatsTab.colRedCards'),
      dataIndex: cardType,
      width: 100,
      align: 'center',
      sorter: (a, b) => a[cardType] - b[cardType],
      render: (v: number) =>
        v > 0 ? (
          <Space size={4}>
            <WarningOutlined style={{ color }} />
            {v}
          </Space>
        ) : (
          '-'
        ),
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
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <div>
          <Typography.Title level={5}>{t('cardStatsTab.yellowTitle')}</Typography.Title>
          <Table
            rowKey="playerId"
            columns={buildCardColumns('yellowCards', '#fadb14')}
            dataSource={yellowCardData}
            loading={loading}
            pagination={false}
            size="middle"
            locale={{ emptyText: t('cardStatsTab.emptyYellow') }}
          />
        </div>
        <div>
          <Typography.Title level={5}>{t('cardStatsTab.redTitle')}</Typography.Title>
          <Table
            rowKey="playerId"
            columns={buildCardColumns('redCards', '#f5222d')}
            dataSource={redCardData}
            loading={loading}
            pagination={false}
            size="middle"
            locale={{ emptyText: t('cardStatsTab.emptyRed') }}
          />
        </div>
      </Space>
    </>
  );
}

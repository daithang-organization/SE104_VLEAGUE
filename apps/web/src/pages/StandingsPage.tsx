import { CrownOutlined } from '@ant-design/icons';
import { Card, Empty, Flex, message, Select, Space, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TableSkeleton } from '../components';
import ExportButton from '../components/ExportButton';
import { apiGetSeasons, type Season } from '../services/seasonApi';
import {
  apiGetStandings,
  apiGetTopScorers,
  type TeamStanding,
  type TopScorer,
} from '../services/standingsApi';
import { getTeamLogoUrl } from '../utils/teamLogos';

// VLeague: top 2 qualify for AFC Champions League, bottom 2 get relegated
const AFC_CL_COUNT = 2;
const RELEGATION_COUNT = 2;
const FORM_SLOTS = 5;

export default function StandingsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [topScorers, setTopScorers] = useState<TopScorer[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string | undefined>();

  useEffect(() => {
    apiGetSeasons()
      .then(setSeasons)
      .catch(() => {});
  }, []);

  const fetchData = useCallback(async (seasonId?: string) => {
    setLoading(true);
    try {
      const [standingsData, scorersData] = await Promise.all([
        apiGetStandings(seasonId),
        apiGetTopScorers(seasonId, 10),
      ]);
      setStandings(standingsData);
      setTopScorers(scorersData);
    } catch (_err) {
      message.error(t('standings.loadError'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(selectedSeason);
  }, [selectedSeason, fetchData]);

  const handleSeasonChange = (value: string) => {
    setSelectedSeason(value || undefined);
  };

  const totalTeams = standings.length;

  const renderRecentForm = (recentForm: TeamStanding['recentForm'] = []) => {
    const slots = Array.from({ length: FORM_SLOTS }, (_, index) => recentForm[index]);
    return (
      <Flex gap={6} justify="center" className="standings-form-pool">
        {slots.map((result, index) => (
          <span
            key={`${result ?? 'empty'}-${index}`}
            className={`standings-form-box standings-form-${result?.toLowerCase() ?? 'empty'}`}
            title={result ? t(`standings.form${result}`) : t('standings.formEmpty')}
          >
            {result === 'W' ? '✓' : result === 'D' ? '−' : result === 'L' ? '×' : ''}
          </span>
        ))}
      </Flex>
    );
  };

  const standingsColumns: ColumnsType<TeamStanding> = [
    {
      title: '#',
      dataIndex: 'position',
      width: 50,
      render: (pos: number) => {
        if (pos === 1) {
          return (
            <strong style={{ color: '#d4a017' }}>
              <CrownOutlined style={{ marginRight: 4 }} />
              {pos}
            </strong>
          );
        }
        return <strong>{pos}</strong>;
      },
    },
    {
      title: t('standings.colTeam'),
      dataIndex: 'teamName',
      render: (teamName: string) => {
        const logoUrl = getTeamLogoUrl(teamName);
        return (
          <Flex align="center" gap={8}>
            {logoUrl && (
              <img
                src={logoUrl}
                alt={`${teamName} logo`}
                style={{ width: 28, height: 28, objectFit: 'contain', flex: '0 0 auto' }}
              />
            )}
            <strong>{teamName}</strong>
          </Flex>
        );
      },
    },
    { title: t('standings.colPlayed'), dataIndex: 'played', width: 60, align: 'center' },
    { title: t('standings.colWon'), dataIndex: 'won', width: 60, align: 'center' },
    { title: t('standings.colDrawn'), dataIndex: 'drawn', width: 60, align: 'center' },
    { title: t('standings.colLost'), dataIndex: 'lost', width: 60, align: 'center' },
    { title: t('standings.colGoalsFor'), dataIndex: 'goalsFor', width: 60, align: 'center' },
    {
      title: t('standings.colGoalsAgainst'),
      dataIndex: 'goalsAgainst',
      width: 60,
      align: 'center',
    },
    { title: t('standings.colGoalDiff'), dataIndex: 'goalDifference', width: 60, align: 'center' },
    {
      title: t('standings.colPoints'),
      dataIndex: 'points',
      width: 70,
      align: 'center',
      render: (pts: number) => <strong>{pts}</strong>,
    },
    {
      title: t('standings.colLast5'),
      dataIndex: 'recentForm',
      width: 150,
      align: 'center',
      render: renderRecentForm,
    },
  ];

  const scorerColumns: ColumnsType<TopScorer> = [
    {
      title: '#',
      dataIndex: 'position',
      width: 50,
    },
    { title: t('standings.scorerColPlayer'), dataIndex: 'playerName' },
    {
      title: t('standings.scorerColTeam'),
      dataIndex: 'teamName',
      render: (teamName: string) => {
        const logoUrl = getTeamLogoUrl(teamName);
        return (
          <Flex align="center" gap={8}>
            {logoUrl && (
              <img
                src={logoUrl}
                alt={`${teamName} logo`}
                style={{ width: 24, height: 24, objectFit: 'contain', flex: '0 0 auto' }}
              />
            )}
            <span>{teamName}</span>
          </Flex>
        );
      },
    },
    {
      title: t('standings.scorerColGoals'),
      dataIndex: 'goals',
      width: 100,
      align: 'center',
      render: (goals: number) => <strong>{goals}</strong>,
    },
  ];

  // Row class for AFC CL / relegation zone
  const getRowClassName = (record: TeamStanding) => {
    if (record.position <= AFC_CL_COUNT) return 'standings-afc-cl';
    if (totalTeams > 0 && record.position > totalTeams - RELEGATION_COUNT) {
      return 'standings-relegation';
    }
    return '';
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Inline styles for row highlighting */}
      <style>{`
        .standings-afc-cl {
          background: #f6ffed !important;
          border-left: 4px solid #52c41a !important;
        }
        .standings-afc-cl td {
          background: #f6ffed !important;
        }
        .standings-relegation {
          background: #fff1f0 !important;
          border-left: 4px solid #ff4d4f !important;
        }
        .standings-relegation td {
          background: #fff1f0 !important;
        }
        :root[data-theme='dark'] .standings-afc-cl {
          background: rgba(22, 163, 74, 0.2) !important;
          border-left: 4px solid #22c55e !important;
        }
        :root[data-theme='dark'] .standings-afc-cl td {
          background: rgba(22, 163, 74, 0.2) !important;
          color: rgba(255, 255, 255, 0.92) !important;
        }
        :root[data-theme='dark'] .standings-relegation {
          background: rgba(220, 38, 38, 0.22) !important;
          border-left: 4px solid #ef4444 !important;
        }
        :root[data-theme='dark'] .standings-relegation td {
          background: rgba(220, 38, 38, 0.22) !important;
          color: rgba(255, 255, 255, 0.92) !important;
        }
      `}</style>

      {loading && standings.length === 0 ? (
        <Card>
          <Typography.Title level={4} style={{ margin: '0 0 16px' }}>
            {t('standings.title')}
          </Typography.Title>
          <TableSkeleton />
        </Card>
      ) : (
        <Card>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Typography.Title level={4} style={{ margin: 0 }}>
              {t('standings.title')}
            </Typography.Title>
            <Space>
              <ExportButton
                columns={[
                  { title: t('standings.colRank'), key: 'position' },
                  { title: t('standings.colTeam'), key: 'teamName' },
                  { title: t('standings.colPlayed'), key: 'played' },
                  { title: t('standings.colWon'), key: 'won' },
                  { title: t('standings.colDrawn'), key: 'drawn' },
                  { title: t('standings.colLost'), key: 'lost' },
                  { title: t('standings.colGoalsFor'), key: 'goalsFor' },
                  { title: t('standings.colGoalsAgainst'), key: 'goalsAgainst' },
                  { title: t('standings.colGoalDiff'), key: 'goalDifference' },
                  { title: t('standings.colPoints'), key: 'points' },
                  { title: t('standings.colLast5'), key: 'recentForm' },
                ]}
                dataSource={standings as unknown as Record<string, unknown>[]}
                filename="bang-xep-hang"
              />
              <Select
                placeholder={t('standings.seasonPlaceholder')}
                value={selectedSeason}
                onChange={handleSeasonChange}
                style={{ width: 200 }}
                allowClear
              >
                {seasons.map((s) => (
                  <Select.Option key={s.id} value={s.id}>
                    {s.name}
                  </Select.Option>
                ))}
              </Select>
            </Space>
          </div>

          <Table
            columns={standingsColumns}
            dataSource={standings}
            rowKey="teamId"
            loading={loading}
            pagination={false}
            size="middle"
            rowClassName={getRowClassName}
            locale={{
              emptyText: loading ? (
                t('standings.loading')
              ) : (
                <Empty description={t('standings.emptyStandings')} />
              ),
            }}
          />

          {/* Legend */}
          {totalTeams > 0 && (
            <Flex gap={16} style={{ marginTop: 12, paddingLeft: 4 }} wrap="wrap">
              <Flex align="center" gap={6}>
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 3,
                    background: '#f6ffed',
                    border: '2px solid #52c41a',
                  }}
                />
                <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                  {t('standings.afcLegend', { count: AFC_CL_COUNT })}
                </Typography.Text>
              </Flex>
              <Flex align="center" gap={6}>
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 3,
                    background: '#fff1f0',
                    border: '2px solid #ff4d4f',
                  }}
                />
                <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                  {t('standings.relegationLegend', { count: RELEGATION_COUNT })}
                </Typography.Text>
              </Flex>
            </Flex>
          )}
        </Card>
      )}

      <Card>
        <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
          <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 0 }}>
            {t('standings.topScorersTitle')}
          </Typography.Title>
          <ExportButton
            columns={[
              { title: t('standings.scorerColRank'), key: 'position' },
              { title: t('standings.scorerColPlayer'), key: 'playerName' },
              { title: t('standings.scorerColTeam'), key: 'teamName' },
              { title: t('standings.scorerColGoals'), key: 'goals' },
            ]}
            dataSource={topScorers as unknown as Record<string, unknown>[]}
            filename="vua-pha-luoi"
          />
        </Flex>

        <Table
          columns={scorerColumns}
          dataSource={topScorers}
          rowKey="playerId"
          loading={loading}
          pagination={false}
          size="middle"
          locale={{
            emptyText: loading ? (
              t('standings.loading')
            ) : (
              <Empty description={t('standings.emptyScorers')} />
            ),
          }}
        />
      </Card>
    </Space>
  );
}

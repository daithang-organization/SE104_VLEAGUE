import { CrownOutlined, TrophyOutlined } from '@ant-design/icons';
import { AimOutlined, RiseOutlined, TeamOutlined } from '@ant-design/icons';
import { Card, Empty, Flex, message, Select, Space, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { AppMenuIcon, PageCover, TableSkeleton } from '../components';
import ExportButton from '../components/ExportButton';
import { useMatchSocket } from '../hooks/useMatchSocket';
import { useSeasonSelection } from '../hooks/useSeasonSelection';
import {
  apiGetStandings,
  apiGetTeamStats,
  type StandingsMode,
  type TeamStat,
  apiGetTopScorers,
  type TeamStanding,
  type TopScorer,
} from '../services/standingsApi';
import { apiGetTeamManagerAssignment } from '../services/teamManagerApi';
import { cleanDecorativeLabel } from '../utils/textLabels';
import { getTeamLogoUrl } from '../utils/teamLogos';

// VLeague: top 2 qualify for AFC Champions League, bottom 2 get relegated
const AFC_CL_COUNT = 2;
const RELEGATION_COUNT = 2;
const FORM_SLOTS = 5;

export default function StandingsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStat[]>([]);
  const [topScorers, setTopScorers] = useState<TopScorer[]>([]);
  const [managerTeamId, setManagerTeamId] = useState<string | null>(null);
  const {
    loading: seasonsLoading,
    seasons,
    selectedSeason,
    selectedSeasonId,
    setSelectedSeasonId,
  } = useSeasonSelection();

  const fetchData = useCallback(
    async (seasonId: string, mode: StandingsMode) => {
      setLoading(true);
      try {
        const [standingsData, scorersData, teamStatsData] = await Promise.all([
          apiGetStandings(seasonId, mode),
          apiGetTopScorers(seasonId, 10),
          apiGetTeamStats(seasonId),
        ]);
        setStandings(standingsData);
        setTopScorers(scorersData);
        setTeamStats(teamStatsData);
      } catch (_err) {
        message.error(t('standings.loadError'));
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  const reloadStandings = useCallback(() => {
    if (!selectedSeasonId) {
      if (!seasonsLoading) setLoading(false);
      return;
    }

    const standingsMode: StandingsMode =
      selectedSeason?.status === 'COMPLETED' ? 'final' : 'in_progress';
    fetchData(selectedSeasonId, standingsMode);
  }, [fetchData, seasonsLoading, selectedSeason?.status, selectedSeasonId]);

  useEffect(() => {
    reloadStandings();
  }, [reloadStandings]);

  useMatchSocket({
    onStatusChange: reloadStandings,
  });

  useEffect(() => {
    if (user?.role !== 'TEAM_MANAGER') {
      setManagerTeamId(null);
      return;
    }
    if (!selectedSeasonId) {
      setManagerTeamId(null);
      return;
    }

    let cancelled = false;
    const loadAssignment = async () => {
      try {
        const assignment = await apiGetTeamManagerAssignment(selectedSeasonId);
        if (!cancelled) setManagerTeamId(assignment?.teamId ?? null);
      } catch (_err) {
        if (!cancelled) setManagerTeamId(null);
      }
    };

    loadAssignment();
    return () => {
      cancelled = true;
    };
  }, [selectedSeasonId, user?.role]);

  const handleSeasonChange = (value: string) => {
    setSelectedSeasonId(value);
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
      render: (pos: number, record) => {
        const zoneClass =
          pos <= AFC_CL_COUNT
            ? 'standings-rank-afc-cl'
            : totalTeams > 0 && pos > totalTeams - RELEGATION_COUNT
              ? 'standings-rank-relegation'
              : '';
        const managerClass = record.teamId === managerTeamId ? ' standings-rank-manager' : '';

        if (pos === 1) {
          return (
            <strong className={`standings-rank-cell ${zoneClass}${managerClass}`}>
              <CrownOutlined style={{ marginRight: 4 }} />
              {pos}
            </strong>
          );
        }
        return <strong className={`standings-rank-cell ${zoneClass}${managerClass}`}>{pos}</strong>;
      },
    },
    {
      title: t('standings.colTeam'),
      dataIndex: 'teamName',
      render: (teamName: string, record) => {
        const logoUrl = getTeamLogoUrl(teamName);
        return (
          <Flex
            align="center"
            gap={8}
            role="button"
            tabIndex={0}
            style={{ cursor: 'pointer', width: 'fit-content' }}
            onClick={() => navigate(`/teams/${record.teamId}`)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                navigate(`/teams/${record.teamId}`);
              }
            }}
          >
            {logoUrl && (
              <img
                src={logoUrl}
                alt={`${teamName} logo`}
                style={{ width: 28, height: 28, objectFit: 'contain', flex: '0 0 auto' }}
              />
            )}
            <Typography.Link strong className="standings-team-link">
              {teamName}
            </Typography.Link>
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
    const classes: string[] = [];
    if (record.position <= AFC_CL_COUNT) classes.push('standings-afc-cl');
    if (totalTeams > 0 && record.position > totalTeams - RELEGATION_COUNT) {
      classes.push('standings-relegation');
    }
    if (record.teamId === managerTeamId) classes.push('standings-manager-team');
    return classes.join(' ');
  };
  const standingsTitle = cleanDecorativeLabel(t('standings.title'));
  const summarySource = teamStats.length > 0 ? teamStats : standings;
  const maxGoalsFor = Math.max(0, ...summarySource.map((team) => team.goalsFor ?? 0));
  const maxPoints = Math.max(0, ...summarySource.map((team) => team.points ?? 0));
  const champion =
    selectedSeason?.status === 'COMPLETED'
      ? standings.find((team) => team.position === 1)
      : undefined;

  return (
    <div className="page-stack">
      {/* Inline styles for row highlighting */}
      <style>{`
        .standings-rank-cell {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 34px;
          min-height: 28px;
          padding: 2px 8px;
          border-radius: 6px;
        }
        .standings-rank-afc-cl {
          background: rgba(82, 196, 26, 0.2);
          color: #389e0d;
        }
        .standings-rank-relegation {
          background: rgba(255, 77, 79, 0.18);
          color: #cf1322;
        }
        .standings-rank-manager {
          box-shadow: 0 0 0 2px rgba(250, 204, 21, 0.85), 0 0 18px rgba(250, 204, 21, 0.4);
        }
        .standings-team-link {
          color: #dc2626 !important;
        }
        .standings-manager-team td {
          background: rgba(250, 204, 21, 0.08) !important;
        }
        :root[data-theme='dark'] .standings-team-link {
          color: #ffffff !important;
        }
        :root[data-theme='dark'] .standings-rank-afc-cl {
          background: rgba(22, 163, 74, 0.26);
          color: #f8fafc;
        }
        :root[data-theme='dark'] .standings-rank-relegation {
          background: rgba(220, 38, 38, 0.28);
          color: #f8fafc;
        }
        :root[data-theme='dark'] .standings-manager-team td {
          background: rgba(250, 204, 21, 0.1) !important;
        }
      `}</style>

      <PageCover
        eyebrow="VLeague"
        title={standingsTitle}
        description={t('standings.subtitle')}
        icon={<AppMenuIcon menuKey="standings" />}
        metrics={[
          ...(champion
            ? [
                {
                  label: t('standings.champion'),
                  value: champion.teamName,
                  icon: <TrophyOutlined />,
                },
              ]
            : []),
          {
            label: t('standings.colTeam'),
            value: totalTeams.toLocaleString('vi-VN'),
            icon: <TeamOutlined />,
          },
          {
            label: t('standings.maxGoals'),
            value: maxGoalsFor.toLocaleString('vi-VN'),
            icon: <AimOutlined />,
          },
          {
            label: t('standings.maxPoints'),
            value: maxPoints.toLocaleString('vi-VN'),
            icon: <RiseOutlined />,
          },
        ]}
      />

      <div className="page-toolbar">
        <Space wrap>
          <Select
            placeholder={t('standings.seasonPlaceholder')}
            value={selectedSeasonId}
            onChange={handleSeasonChange}
            style={{ width: 200 }}
          >
            {seasons.map((s) => (
              <Select.Option key={s.id} value={s.id}>
                {s.name}
              </Select.Option>
            ))}
          </Select>
        </Space>
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
      </div>

      {loading && standings.length === 0 ? (
        <Card>
          <TableSkeleton />
        </Card>
      ) : (
        <Card>
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
            <Space size={8}>
              <AimOutlined />
              <span>{cleanDecorativeLabel(t('standings.topScorersTitle'))}</span>
            </Space>
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
    </div>
  );
}

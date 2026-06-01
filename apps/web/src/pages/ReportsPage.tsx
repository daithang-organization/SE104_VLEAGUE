import {
  AimOutlined,
  BarChartOutlined,
  DownloadOutlined,
  RiseOutlined,
  StarOutlined,
  StopOutlined,
  TeamOutlined,
  TrophyOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Alert, Button, Card, message, Select, Space, Tabs } from 'antd';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AppMenuIcon, TableSkeleton } from '../components';
import { PageCover } from '../components/PageCover';
import { useSeasonSelection } from '../hooks/useSeasonSelection';
import {
  apiGetCardStats,
  apiGetPlayerOfMatchStats,
  apiGetSeasonAwards,
  apiGetSuspensionStats,
  apiGetTeamStats,
  apiGetTopAssists,
  apiGetTopScorers,
  type CardStat,
  type PlayerOfMatchStat,
  type SeasonAwards,
  type SuspensionStat,
  type TeamStat,
  type TopAssist,
  type TopScorer,
} from '../services/standingsApi';
import { exportPdf } from '../utils/pdfExport';
import { cleanDecorativeLabel } from '../utils/textLabels';
import CardStatsTab from './reports/CardStatsTab';
import ChartsTab from './reports/ChartsTab';
import PlayerOfMatchTab from './reports/PlayerOfMatchTab';
import SeasonAwardsTab from './reports/SeasonAwardsTab';
import SuspensionsTab from './reports/SuspensionsTab';
import TeamStatsTab from './reports/TeamStatsTab';
import TopAssistsTab from './reports/TopAssistsTab';
import TopScorersTab from './reports/TopScorersTab';

function reportTabLabel(icon: ReactNode, label: string) {
  return (
    <Space size={6}>
      {icon}
      <span>{cleanDecorativeLabel(label)}</span>
    </Space>
  );
}

/* ────────── Main Page ────────── */

export default function ReportsPage() {
  const { t } = useTranslation();
  const [scorers, setScorers] = useState<TopScorer[]>([]);
  const [assists, setAssists] = useState<TopAssist[]>([]);
  const [cardStats, setCardStats] = useState<CardStat[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStat[]>([]);
  const [playerOfMatchStats, setPlayerOfMatchStats] = useState<PlayerOfMatchStat[]>([]);
  const [suspensions, setSuspensions] = useState<SuspensionStat[]>([]);
  const [seasonAwards, setSeasonAwards] = useState<SeasonAwards | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const {
    loading: seasonsLoading,
    seasons,
    selectedSeasonId,
    setSelectedSeasonId,
  } = useSeasonSelection();

  const reloadSeasonAwards = useCallback(async () => {
    if (!selectedSeasonId) {
      setSeasonAwards(null);
      return;
    }

    const awards = await apiGetSeasonAwards(selectedSeasonId);
    setSeasonAwards(awards);
  }, [selectedSeasonId]);

  useEffect(() => {
    if (!selectedSeasonId) {
      if (!seasonsLoading) setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(undefined);

    Promise.allSettled([
      apiGetTopScorers(selectedSeasonId, 50),
      apiGetTopAssists(selectedSeasonId, 50),
      apiGetCardStats(selectedSeasonId, 30),
      apiGetTeamStats(selectedSeasonId),
      apiGetPlayerOfMatchStats(selectedSeasonId, 30),
      apiGetSuspensionStats(selectedSeasonId),
      apiGetSeasonAwards(selectedSeasonId),
    ])
      .then(
        ([scorerRes, assistRes, cardRes, teamRes, playerOfMatchRes, suspensionRes, awardRes]) => {
          if (cancelled) return;

          if (scorerRes.status === 'fulfilled') setScorers(scorerRes.value);
          if (assistRes.status === 'fulfilled') setAssists(assistRes.value);
          if (cardRes.status === 'fulfilled') setCardStats(cardRes.value);
          if (teamRes.status === 'fulfilled') setTeamStats(teamRes.value);
          if (playerOfMatchRes.status === 'fulfilled')
            setPlayerOfMatchStats(playerOfMatchRes.value);
          if (suspensionRes.status === 'fulfilled') setSuspensions(suspensionRes.value);
          if (awardRes.status === 'fulfilled') setSeasonAwards(awardRes.value);
          const failed = [
            scorerRes,
            assistRes,
            cardRes,
            teamRes,
            playerOfMatchRes,
            suspensionRes,
            awardRes,
          ].filter((r) => r.status === 'rejected');
          if (failed.length === 7) setError(t('reports.loadError'));
        },
      )
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [seasonsLoading, selectedSeasonId, t]);

  const handleExportScorersPdf = async () => {
    try {
      await exportPdf(
        'VLeague - Vua phá lưới',
        ['#', 'Cầu thủ', 'Đội', 'Bàn thắng'],
        scorers.map((s) => [String(s.position), s.playerName, s.teamName, String(s.goals)]),
      );
    } catch (_err) {
      message.error(t('reports.exportError'));
    }
  };

  const handleExportTeamStatsPdf = async () => {
    try {
      await exportPdf(
        'VLeague - Thống kê đội bóng',
        ['Đội', 'Trận', 'Thắng', 'Hòa', 'Thua', 'BT', 'BN', 'HS', 'Điểm'],
        teamStats.map((s) => [
          s.teamName,
          String(s.played),
          String(s.won),
          String(s.drawn),
          String(s.lost),
          String(s.goalsFor),
          String(s.goalsAgainst),
          String(s.goalDifference),
          String(s.points),
        ]),
      );
    } catch (_err) {
      message.error(t('reports.exportError'));
    }
  };

  const handleExportAssistsPdf = async () => {
    try {
      await exportPdf(
        'VLeague - Top kiến tạo',
        ['#', 'Cầu thủ', 'Đội', 'Kiến tạo'],
        assists.map((s) => [String(s.position), s.playerName, s.teamName, String(s.assists)]),
      );
    } catch (_err) {
      message.error(t('reports.exportError'));
    }
  };

  const handleExportCardStatsPdf = async () => {
    try {
      await exportPdf(
        'VLeague - Thống kê thẻ phạt',
        ['#', 'Cầu thủ', 'Đội', 'Thẻ vàng', 'Thẻ đỏ'],
        cardStats.map((s, i) => [
          String(i + 1),
          s.playerName,
          s.teamName,
          String(s.yellowCards),
          String(s.redCards),
        ]),
      );
    } catch (_err) {
      message.error(t('reports.exportError'));
    }
  };

  if (error) return <Alert type="error" message={error} showIcon />;

  const exportActions = (
    <Space wrap>
      <Button
        icon={<DownloadOutlined />}
        onClick={handleExportScorersPdf}
        disabled={scorers.length === 0}
      >
        {t('reports.exportScorersPdf')}
      </Button>
      <Button
        icon={<DownloadOutlined />}
        onClick={handleExportAssistsPdf}
        disabled={assists.length === 0}
      >
        {t('reports.exportAssistsPdf')}
      </Button>
      <Button
        icon={<DownloadOutlined />}
        onClick={handleExportTeamStatsPdf}
        disabled={teamStats.length === 0}
      >
        {t('reports.exportTeamStatsPdf')}
      </Button>
      <Button
        icon={<DownloadOutlined />}
        onClick={handleExportCardStatsPdf}
        disabled={cardStats.length === 0}
      >
        {t('reports.exportCardStatsPdf')}
      </Button>
    </Space>
  );

  return (
    <div className="page-stack">
      <PageCover
        eyebrow={t('menu.reports')}
        title={t('reports.title')}
        description={t('reports.subtitle')}
        icon={<AppMenuIcon menuKey="reports" />}
        metrics={[
          {
            label: cleanDecorativeLabel(t('reports.tabScorers')),
            value: scorers.length.toLocaleString('vi-VN'),
            icon: <AimOutlined />,
          },
          {
            label: cleanDecorativeLabel(t('reports.tabAssists')),
            value: assists.length.toLocaleString('vi-VN'),
            icon: <RiseOutlined />,
          },
          {
            label: cleanDecorativeLabel(t('reports.tabPlayerOfMatch')),
            value: playerOfMatchStats.length.toLocaleString('vi-VN'),
            icon: <StarOutlined />,
          },
        ]}
      />

      <div className="page-toolbar">
        <Space wrap>
          <Select
            placeholder={t('reports.seasonPlaceholder')}
            value={selectedSeasonId}
            onChange={setSelectedSeasonId}
            style={{ width: 220 }}
            disabled={seasons.length === 0}
          >
            {seasons.map((season) => (
              <Select.Option key={season.id} value={season.id}>
                {season.name}
              </Select.Option>
            ))}
          </Select>
        </Space>
        {exportActions}
      </div>

      <Card>
        {loading ? (
          <TableSkeleton />
        ) : (
          <Tabs
            defaultActiveKey="scorers"
            items={[
              {
                key: 'scorers',
                label: reportTabLabel(<AimOutlined />, t('reports.tabScorers')),
                children: <TopScorersTab data={scorers} loading={loading} />,
              },
              {
                key: 'assists',
                label: reportTabLabel(<RiseOutlined />, t('reports.tabAssists')),
                children: <TopAssistsTab data={assists} loading={loading} />,
              },
              {
                key: 'player-of-match',
                label: reportTabLabel(<StarOutlined />, t('reports.tabPlayerOfMatch')),
                children: <PlayerOfMatchTab data={playerOfMatchStats} loading={loading} />,
              },
              {
                key: 'cards',
                label: reportTabLabel(<WarningOutlined />, t('reports.tabCards')),
                children: <CardStatsTab data={cardStats} loading={loading} />,
              },
              {
                key: 'suspensions',
                label: reportTabLabel(<StopOutlined />, t('reports.tabSuspensions')),
                children: <SuspensionsTab data={suspensions} loading={loading} />,
              },
              {
                key: 'team-stats',
                label: reportTabLabel(<TeamOutlined />, t('reports.tabTeamStats')),
                children: <TeamStatsTab data={teamStats} loading={loading} />,
              },
              {
                key: 'awards',
                label: reportTabLabel(<TrophyOutlined />, t('reports.tabAwards')),
                children: (
                  <SeasonAwardsTab
                    awards={seasonAwards}
                    loading={loading}
                    onAwardsChanged={reloadSeasonAwards}
                  />
                ),
              },
              {
                key: 'charts',
                label: reportTabLabel(<BarChartOutlined />, t('reports.tabCharts')),
                children: (
                  <ChartsTab
                    scorers={scorers.slice(0, 10)}
                    teamStats={teamStats}
                    loading={loading}
                  />
                ),
              },
            ]}
          />
        )}
      </Card>
    </div>
  );
}

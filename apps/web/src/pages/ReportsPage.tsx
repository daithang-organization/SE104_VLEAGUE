import {
  BarChartOutlined,
  DownloadOutlined,
  RiseOutlined,
  TeamOutlined,
  TrophyOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Alert, Button, Card, Flex, message, Space, Tabs, Typography } from 'antd';
import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { TableSkeleton } from '../components';
import {
  apiGetCardStats,
  apiGetTeamStats,
  apiGetTopAssists,
  apiGetTopScorers,
  type CardStat,
  type TeamStat,
  type TopAssist,
  type TopScorer,
} from '../services/standingsApi';
import CardStatsTab from './reports/CardStatsTab';
import ChartsTab from './reports/ChartsTab';
import TeamStatsTab from './reports/TeamStatsTab';
import TopAssistsTab from './reports/TopAssistsTab';
import TopScorersTab from './reports/TopScorersTab';
import { exportPdf } from '../utils/pdfExport';

const cleanTabLabel = (label: string) => label.replace(/^[^\p{L}\p{N}]+/u, '').trim();

function reportTabLabel(icon: ReactNode, label: string) {
  return (
    <Space size={6}>
      {icon}
      <span>{cleanTabLabel(label)}</span>
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    Promise.allSettled([
      apiGetTopScorers(undefined, 50),
      apiGetTopAssists(undefined, 50),
      apiGetCardStats(undefined, 30),
      apiGetTeamStats(),
    ])
      .then(([scorerRes, assistRes, cardRes, teamRes]) => {
        if (scorerRes.status === 'fulfilled') setScorers(scorerRes.value);
        if (assistRes.status === 'fulfilled') setAssists(assistRes.value);
        if (cardRes.status === 'fulfilled') setCardStats(cardRes.value);
        if (teamRes.status === 'fulfilled') setTeamStats(teamRes.value);
        const failed = [scorerRes, assistRes, cardRes, teamRes].filter(
          (r) => r.status === 'rejected',
        );
        if (failed.length === 4) setError(t('reports.loadError'));
      })
      .finally(() => setLoading(false));
  }, []);

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

  return (
    <Card>
      <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
        <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 0 }}>
          {t('reports.title')}
        </Typography.Title>
        <Space>
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
      </Flex>

      {loading ? (
        <TableSkeleton />
      ) : (
        <Tabs
          defaultActiveKey="scorers"
          items={[
            {
              key: 'scorers',
              label: reportTabLabel(<TrophyOutlined />, t('reports.tabScorers')),
              children: <TopScorersTab data={scorers.slice(0, 20)} loading={loading} />,
            },
            {
              key: 'assists',
              label: reportTabLabel(<RiseOutlined />, t('reports.tabAssists')),
              children: <TopAssistsTab data={assists.slice(0, 20)} loading={loading} />,
            },
            {
              key: 'cards',
              label: reportTabLabel(<WarningOutlined />, t('reports.tabCards')),
              children: <CardStatsTab data={cardStats} loading={loading} />,
            },
            {
              key: 'team-stats',
              label: reportTabLabel(<TeamOutlined />, t('reports.tabTeamStats')),
              children: <TeamStatsTab data={teamStats} loading={loading} />,
            },
            {
              key: 'charts',
              label: reportTabLabel(<BarChartOutlined />, t('reports.tabCharts')),
              children: (
                <ChartsTab scorers={scorers.slice(0, 10)} teamStats={teamStats} loading={loading} />
              ),
            },
          ]}
        />
      )}
    </Card>
  );
}

import { DownloadOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Flex, message, Space, Tabs, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TableSkeleton } from '../components';
import {
  apiGetCardStats,
  apiGetTeamStats,
  apiGetTopScorers,
  type CardStat,
  type TeamStat,
  type TopScorer,
} from '../services/standingsApi';
import CardStatsTab from './reports/CardStatsTab';
import ChartsTab from './reports/ChartsTab';
import TeamStatsTab from './reports/TeamStatsTab';
import TopScorersTab from './reports/TopScorersTab';

/* ────────── Dynamic PDF Export ────────── */

async function exportPdf(title: string, headers: string[], rows: string[][]) {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 14, 20);
  doc.setFontSize(10);
  doc.text(`${new Date().toLocaleDateString('vi-VN')}`, 14, 28);
  autoTable(doc, {
    startY: 34,
    head: [headers],
    body: rows,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [0, 21, 41] },
  });
  doc.save(`${title.replace(/\s+/g, '-').toLowerCase()}.pdf`);
}

/* ────────── Main Page ────────── */

export default function ReportsPage() {
  const { t } = useTranslation();
  const [scorers, setScorers] = useState<TopScorer[]>([]);
  const [cardStats, setCardStats] = useState<CardStat[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    Promise.allSettled([
      apiGetTopScorers(undefined, 50),
      apiGetCardStats(undefined, 30),
      apiGetTeamStats(),
    ])
      .then(([scorerRes, cardRes, teamRes]) => {
        if (scorerRes.status === 'fulfilled') setScorers(scorerRes.value);
        if (cardRes.status === 'fulfilled') setCardStats(cardRes.value);
        if (teamRes.status === 'fulfilled') setTeamStats(teamRes.value);
        const failed = [scorerRes, cardRes, teamRes].filter((r) => r.status === 'rejected');
        if (failed.length === 3) setError(t('reports.loadError'));
      })
      .finally(() => setLoading(false));
  }, []);

  const handleExportScorersPdf = async () => {
    try {
      await exportPdf(
        'VLeague - Vua pha luoi',
        ['#', 'Cau thu', 'Doi', 'Ban thang'],
        scorers.map((s) => [String(s.position), s.playerName, s.teamName, String(s.goals)]),
      );
    } catch (_err) {
      message.error(t('reports.exportError'));
    }
  };

  const handleExportTeamStatsPdf = async () => {
    try {
      await exportPdf(
        'VLeague - Thong ke doi bong',
        ['Doi', 'Tran', 'Thang', 'Hoa', 'Thua', 'BT', 'BN', 'HS', 'Diem'],
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
            onClick={handleExportTeamStatsPdf}
            disabled={teamStats.length === 0}
          >
            {t('reports.exportTeamStatsPdf')}
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
              label: t('reports.tabScorers'),
              children: <TopScorersTab data={scorers.slice(0, 20)} loading={loading} />,
            },
            {
              key: 'cards',
              label: t('reports.tabCards'),
              children: <CardStatsTab data={cardStats} loading={loading} />,
            },
            {
              key: 'team-stats',
              label: t('reports.tabTeamStats'),
              children: <TeamStatsTab data={teamStats} loading={loading} />,
            },
            {
              key: 'charts',
              label: t('reports.tabCharts'),
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

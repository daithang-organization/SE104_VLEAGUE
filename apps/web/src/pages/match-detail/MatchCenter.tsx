import { Card, Spin, Tabs, Typography } from 'antd';
import type { CSSProperties } from 'react';
import type { Match, MatchEvent, MatchReport, MatchTeamLineup } from '../../services/matchApi';
import { getTeamTheme } from '../../utils/teamLogos';
import LineupBench from './LineupBench';
import LineupPitch from './LineupPitch';
import MatchStatsPanel from './MatchStatsPanel';
import MatchTimeline from './MatchTimeline';

const { Text } = Typography;

type MatchCenterProps = {
  match: Match;
  events: MatchEvent[];
  lineups: MatchTeamLineup[];
  matchReport: MatchReport | null;
  loading?: boolean;
  onPlayerClick?: (playerId: string) => void;
};

function formatScore(match: Match) {
  const home = match.homeScore ?? '—';
  const away = match.awayScore ?? '—';
  return `${home} - ${away}`;
}

export default function MatchCenter({
  match,
  events,
  lineups,
  matchReport,
  loading = false,
  onPlayerClick,
}: MatchCenterProps) {
  const homeTeamName = match.homeTeam?.name ?? 'Đội nhà';
  const awayTeamName = match.awayTeam?.name ?? 'Đội khách';
  const homeTheme = getTeamTheme(match.homeTeam ?? homeTeamName);
  const awayTheme = getTeamTheme(match.awayTeam ?? awayTeamName);
  const style = {
    '--match-home-primary': homeTheme.primary,
    '--match-home-border': homeTheme.border,
    '--match-away-primary': awayTheme.primary,
    '--match-away-border': awayTheme.border,
  } as CSSProperties;

  return (
    <Card className="match-center-card" styles={{ body: { padding: 0 } }}>
      <div className="match-center-header" style={style}>
        <strong>{homeTeamName}</strong>
        <span>
          <Text>Match Center</Text>
          <b>{formatScore(match)}</b>
        </span>
        <strong>{awayTeamName}</strong>
      </div>

      <Spin spinning={loading}>
        <Tabs
          className="match-center-tabs"
          defaultActiveKey="lineups"
          items={[
            {
              key: 'timeline',
              label: 'DIỄN BIẾN TRẬN ĐẤU',
              children: (
                <div className="match-center-panel">
                  <MatchTimeline
                    events={events}
                    homeTeamId={match.homeTeamId}
                    homeTeamName={homeTeamName}
                    awayTeamName={awayTeamName}
                    onPlayerClick={onPlayerClick}
                  />
                </div>
              ),
            },
            {
              key: 'lineups',
              label: 'ĐỘI HÌNH RA SÂN',
              children: (
                <div className="match-center-panel">
                  <LineupPitch match={match} lineups={lineups} />
                  <LineupBench match={match} lineups={lineups} />
                </div>
              ),
            },
            {
              key: 'stats',
              label: 'THỐNG KÊ',
              children: (
                <div className="match-center-panel">
                  <MatchStatsPanel match={match} events={events} matchReport={matchReport} />
                </div>
              ),
            },
          ]}
        />
      </Spin>
    </Card>
  );
}

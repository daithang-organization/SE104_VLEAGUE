import { Card, Spin, Typography } from 'antd';
import type { CSSProperties } from 'react';
import type { Match, MatchTeamLineup } from '../../services/matchApi';
import { getTeamLogoUrl, getTeamTheme } from '../../utils/teamLogos';
import LineupBench from './LineupBench';
import LineupPitch from './LineupPitch';

const { Text, Title } = Typography;

type MatchCenterProps = {
  match: Match;
  lineups: MatchTeamLineup[];
  loading?: boolean;
};

type MatchTeam = NonNullable<Match['homeTeam']>;
type TeamSide = 'home' | 'away';

function formatScore(match: Match) {
  const home = match.homeScore ?? '—';
  const away = match.awayScore ?? '—';
  return `${home} - ${away}`;
}

function getTeamInitials(teamName: string) {
  return teamName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function MatchCenterTeam({
  team,
  teamName,
  side,
}: {
  team?: MatchTeam | null;
  teamName: string;
  side: TeamSide;
}) {
  const logoUrl = getTeamLogoUrl(team ?? teamName);

  return (
    <span className={`match-center-team match-center-team-${side}`}>
      {logoUrl ? (
        <img className="match-center-team-logo" src={logoUrl} alt={`${teamName} logo`} />
      ) : (
        <span className="match-center-team-logo match-center-team-logo-fallback" aria-hidden="true">
          {getTeamInitials(teamName)}
        </span>
      )}
      <strong>{teamName}</strong>
    </span>
  );
}

export default function MatchCenter({ match, lineups, loading = false }: MatchCenterProps) {
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
        <span>
          <Text>Match Center</Text>
          <Title level={4}>Đội hình ra sân</Title>
        </span>
        <div className="match-center-matchup">
          <MatchCenterTeam team={match.homeTeam} teamName={homeTeamName} side="home" />
          <b>{formatScore(match)}</b>
          <MatchCenterTeam team={match.awayTeam} teamName={awayTeamName} side="away" />
        </div>
      </div>

      <Spin spinning={loading}>
        <div className="match-center-panel">
          <LineupPitch match={match} lineups={lineups} />
          <LineupBench match={match} lineups={lineups} />
        </div>
      </Spin>
    </Card>
  );
}

import { Card, Spin, Typography } from 'antd';
import dayjs from 'dayjs';
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
type MatchStatusTone = 'neutral' | 'live' | 'done' | 'warning';

const MATCH_STATUS_META: Record<Match['status'], { label: string; tone: MatchStatusTone }> = {
  DRAFT: { label: 'Bản nháp', tone: 'neutral' },
  PUBLISHED: { label: 'Sắp diễn ra', tone: 'neutral' },
  LOCKED: { label: 'Đang diễn ra', tone: 'live' },
  FINISHED: { label: 'FT', tone: 'done' },
  POSTPONED: { label: 'Hoãn', tone: 'warning' },
};

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

function formatKickoff(kickoffAt?: string | null) {
  return kickoffAt ? dayjs(kickoffAt).format('DD/MM/YYYY HH:mm') : 'Chưa đặt giờ';
}

function TeamLogoMark({
  team,
  teamName,
  className,
  fallbackClassName,
  decorative = false,
}: {
  team?: MatchTeam | null;
  teamName: string;
  className: string;
  fallbackClassName: string;
  decorative?: boolean;
}) {
  const logoUrl = getTeamLogoUrl(team ?? teamName);

  if (logoUrl) {
    return (
      <img
        className={className}
        src={logoUrl}
        alt={decorative ? '' : `${teamName} logo`}
        aria-hidden={decorative || undefined}
      />
    );
  }

  return (
    <span className={`${className} ${fallbackClassName}`} aria-hidden={decorative || undefined}>
      {getTeamInitials(teamName)}
    </span>
  );
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
  return (
    <span className={`match-center-team match-center-team-${side}`}>
      <TeamLogoMark
        team={team}
        teamName={teamName}
        className="match-center-team-logo"
        fallbackClassName="match-center-team-logo-fallback"
      />
      <strong>{teamName}</strong>
    </span>
  );
}

function MatchCenterScoreboard({ match }: { match: Match }) {
  const statusMeta = MATCH_STATUS_META[match.status] ?? { label: match.status, tone: 'neutral' };
  const metaItems = [
    `Vòng ${match.roundNo}`,
    match.stadium?.name ?? 'Chưa chọn sân',
    formatKickoff(match.kickoffAt),
  ];

  return (
    <div className="match-center-scoreboard" aria-label="Tỉ số và thông tin trận đấu">
      <span className={`match-center-status match-center-status-${statusMeta.tone}`}>
        {statusMeta.label}
      </span>
      <b>{formatScore(match)}</b>
      <div className="match-center-meta">
        {metaItems.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </div>
  );
}

function MatchCenterEmptyState({
  match,
  homeTeamName,
  awayTeamName,
}: {
  match: Match;
  homeTeamName: string;
  awayTeamName: string;
}) {
  return (
    <div className="match-center-empty">
      <div className="match-center-empty-visual" aria-hidden="true">
        <TeamLogoMark
          team={match.homeTeam}
          teamName={homeTeamName}
          className="match-center-empty-logo"
          fallbackClassName="match-center-empty-logo-fallback"
          decorative
        />
        <span className="match-center-empty-field" />
        <TeamLogoMark
          team={match.awayTeam}
          teamName={awayTeamName}
          className="match-center-empty-logo"
          fallbackClassName="match-center-empty-logo-fallback"
          decorative
        />
      </div>
      <strong>Đội hình chưa được nộp</strong>
      <span>Chưa có đội nào nộp danh sách thi đấu.</span>
    </div>
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
          <MatchCenterScoreboard match={match} />
          <MatchCenterTeam team={match.awayTeam} teamName={awayTeamName} side="away" />
        </div>
      </div>

      <Spin spinning={loading}>
        <div className="match-center-panel">
          {lineups.length === 0 ? (
            <MatchCenterEmptyState
              match={match}
              homeTeamName={homeTeamName}
              awayTeamName={awayTeamName}
            />
          ) : (
            <>
              <LineupPitch match={match} lineups={lineups} />
              <LineupBench match={match} lineups={lineups} />
            </>
          )}
        </div>
      </Spin>
    </Card>
  );
}

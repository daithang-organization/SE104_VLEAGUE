import { CalendarOutlined } from '@ant-design/icons';
import { Tag } from 'antd';
import dayjs from 'dayjs';
import type { CSSProperties, ReactNode } from 'react';
import { getTeamLogoUrl, getTeamTheme } from '../utils/teamLogos';

type FixtureTeam = {
  id?: string | null;
  name?: string | null;
  shortName?: string | null;
  logoUrl?: string | null;
};

type FixtureTeamDisplay = {
  id: string;
  name: string;
  logoUrl?: string;
  source: FixtureTeam | string;
};

export type MatchFixtureCardProps = {
  id: string;
  roundLabel: ReactNode;
  statusLabel: ReactNode;
  statusColor?: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeam?: FixtureTeam | null;
  awayTeam?: FixtureTeam | null;
  homeScore?: number | null;
  awayScore?: number | null;
  kickoffAt?: string | null;
  stadiumName?: string | null;
  stadiumFallback: ReactNode;
  kickoffFallback: ReactNode;
  scoreMode?: 'kickoff-or-vs' | 'result-placeholder';
  className?: string;
  actionClassName?: string;
  actions?: ReactNode;
  onTeamClick?: (teamId: string) => void;
  onMatchClick?: (matchId: string) => void;
};

function getTeamDisplay(
  team: FixtureTeam | null | undefined,
  fallbackId: string,
): FixtureTeamDisplay {
  const fallbackName = fallbackId.slice(0, 8) || '-';
  const name = team?.shortName || team?.name || fallbackName;

  return {
    id: team?.id ?? fallbackId,
    name,
    logoUrl: getTeamLogoUrl(team ?? name),
    source: team ?? name,
  };
}

function getLogoFallback(name: string) {
  return (name.trim() || '-').slice(0, 2).toUpperCase();
}

function renderTeamLogo(team: FixtureTeamDisplay) {
  if (team.logoUrl) {
    return <img src={team.logoUrl} alt={`${team.name} logo`} className="schedule-match-logo" />;
  }

  return (
    <div className="schedule-match-logo schedule-match-logo-fallback">
      {getLogoFallback(team.name)}
    </div>
  );
}

export default function MatchFixtureCard({
  id,
  roundLabel,
  statusLabel,
  statusColor = 'default',
  homeTeamId,
  awayTeamId,
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  kickoffAt,
  stadiumName,
  stadiumFallback,
  kickoffFallback,
  scoreMode = 'kickoff-or-vs',
  className,
  actionClassName,
  actions,
  onTeamClick,
  onMatchClick,
}: MatchFixtureCardProps) {
  const home = getTeamDisplay(homeTeam, homeTeamId);
  const away = getTeamDisplay(awayTeam, awayTeamId);
  const homeTheme = getTeamTheme(home.source);
  const awayTheme = getTeamTheme(away.source);
  const hasScore = homeScore != null && awayScore != null;
  const scoreText = hasScore
    ? `${homeScore} - ${awayScore}`
    : scoreMode === 'result-placeholder'
      ? '\u2014 : \u2014'
      : kickoffAt
        ? dayjs(kickoffAt).format('HH:mm')
        : 'vs';
  const kickoffLabel = kickoffAt ? dayjs(kickoffAt).format('DD/MM/YYYY HH:mm') : kickoffFallback;
  const rootClassName = ['schedule-fixture-row', 'match-fixture-card', className]
    .filter(Boolean)
    .join(' ');
  const actionRootClassName = ['schedule-fixture-action', actionClassName]
    .filter(Boolean)
    .join(' ');
  const themeStyle = {
    '--match-home-primary': homeTheme.primary,
    '--match-home-secondary': homeTheme.secondary,
    '--match-home-accent': homeTheme.accent,
    '--match-home-border': homeTheme.border,
    '--match-away-primary': awayTheme.primary,
    '--match-away-secondary': awayTheme.secondary,
    '--match-away-accent': awayTheme.accent,
    '--match-away-border': awayTheme.border,
  } as CSSProperties;

  return (
    <div className={rootClassName} style={themeStyle}>
      <div className="schedule-fixture-meta">
        <span className="schedule-fixture-round">{roundLabel}</span>
        <Tag color={statusColor}>{statusLabel}</Tag>
      </div>

      <button
        type="button"
        className="schedule-fixture-team schedule-fixture-team-left match-fixture-team-home"
        onClick={() => onTeamClick?.(home.id)}
      >
        <span>{home.name}</span>
        {renderTeamLogo(home)}
      </button>

      <button
        type="button"
        className={`schedule-fixture-score${hasScore ? ' is-final is-score-card' : ''}`}
        onClick={() => onMatchClick?.(id)}
      >
        {scoreText}
      </button>

      <button
        type="button"
        className="schedule-fixture-team schedule-fixture-team-right match-fixture-team-away"
        onClick={() => onTeamClick?.(away.id)}
      >
        {renderTeamLogo(away)}
        <span>{away.name}</span>
      </button>

      <div className="schedule-fixture-detail">
        <span>{stadiumName ?? stadiumFallback}</span>
        <span>
          <CalendarOutlined aria-hidden="true" />
          {kickoffLabel}
        </span>
      </div>

      <div className={actionRootClassName}>{actions}</div>
    </div>
  );
}

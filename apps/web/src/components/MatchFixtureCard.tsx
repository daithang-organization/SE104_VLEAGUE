import { CalendarOutlined } from '@ant-design/icons';
import { Tag, Tooltip } from 'antd';
import dayjs from 'dayjs';
import type { CSSProperties, ReactNode } from 'react';
import { getTeamLogoUrl, getTeamTheme } from '../utils/teamLogos';

type FixtureTeam = {
  id?: string | null;
  name?: string | null;
  shortName?: string | null;
  logoUrl?: string | null;
  coachName?: string | null;
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
  onScoreClick?: (matchId: string) => void;
  onScheduleClick?: (matchId: string) => void;
  onStatusClick?: (matchId: string) => void;
  scoreTitle?: string;
  scheduleTitle?: string;
  statusTitle?: string;
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
  onScoreClick,
  onScheduleClick,
  onStatusClick,
  scoreTitle,
  scheduleTitle,
  statusTitle,
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

  const scoreClassName = `schedule-fixture-score${hasScore ? ' is-final is-score-card' : ''}${onScoreClick ? ' is-editable' : ''}`;
  const tooltipColor = '#1e2f4a';
  const scheduleContent = (
    <>
      <span>{stadiumName ?? stadiumFallback}</span>
      <span>
        <CalendarOutlined aria-hidden="true" />
        {kickoffLabel}
      </span>
    </>
  );
  const statusContent = (
    <>
      <span className="schedule-fixture-round">{roundLabel}</span>
      <Tag color={statusColor}>{statusLabel}</Tag>
    </>
  );
  const statusMeta = onStatusClick ? (
    <button
      type="button"
      className="schedule-fixture-meta schedule-fixture-meta-button"
      onClick={(e) => {
        e.stopPropagation();
        onStatusClick(id);
      }}
    >
      {statusContent}
    </button>
  ) : (
    <div className="schedule-fixture-meta">{statusContent}</div>
  );
  const scoreButton = (
    <button
      type="button"
      className={scoreClassName}
      onClick={(e) => {
        if (!onScoreClick) return;
        e.stopPropagation();
        onScoreClick(id);
      }}
    >
      {scoreText}
    </button>
  );
  const scheduleDetail = onScheduleClick ? (
    <button
      type="button"
      className="schedule-fixture-detail schedule-fixture-detail-button"
      onClick={(e) => {
        e.stopPropagation();
        onScheduleClick(id);
      }}
    >
      {scheduleContent}
    </button>
  ) : (
    <div className="schedule-fixture-detail">{scheduleContent}</div>
  );

  return (
    <div
      className={rootClassName}
      style={{ ...themeStyle, cursor: onMatchClick ? 'pointer' : undefined }}
      onClick={() => onMatchClick?.(id)}
    >
      {statusTitle ? (
        <Tooltip title={statusTitle} color={tooltipColor}>
          {statusMeta}
        </Tooltip>
      ) : (
        statusMeta
      )}

      <div className="schedule-fixture-team schedule-fixture-team-left match-fixture-team-home">
        <span className="schedule-fixture-team-copy">
          <button
            type="button"
            className="schedule-fixture-team-name schedule-fixture-team-button"
            onClick={(e) => {
              if (!onTeamClick) return;
              e.stopPropagation();
              onTeamClick?.(home.id);
            }}
            style={{ cursor: onTeamClick ? 'pointer' : undefined }}
          >
            {home.name}
          </button>
        </span>
        {renderTeamLogo(home)}
      </div>

      {scoreTitle ? (
        <Tooltip title={scoreTitle} color={tooltipColor}>
          {scoreButton}
        </Tooltip>
      ) : (
        scoreButton
      )}

      <div className="schedule-fixture-team schedule-fixture-team-right match-fixture-team-away">
        {renderTeamLogo(away)}
        <span className="schedule-fixture-team-copy">
          <button
            type="button"
            className="schedule-fixture-team-name schedule-fixture-team-button"
            onClick={(e) => {
              if (!onTeamClick) return;
              e.stopPropagation();
              onTeamClick?.(away.id);
            }}
            style={{ cursor: onTeamClick ? 'pointer' : undefined }}
          >
            {away.name}
          </button>
        </span>
      </div>

      {scheduleTitle ? (
        <Tooltip title={scheduleTitle} color={tooltipColor}>
          {scheduleDetail}
        </Tooltip>
      ) : (
        scheduleDetail
      )}

      {actions && (
        <div className={actionRootClassName} onClick={(e) => e.stopPropagation()}>
          {actions}
        </div>
      )}
    </div>
  );
}

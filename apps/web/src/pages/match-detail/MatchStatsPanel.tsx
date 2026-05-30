import type { Match, MatchEvent, MatchReport } from '../../services/matchApi';
import { getTeamLogoUrl } from '../../utils/teamLogos';

type MatchStatsPanelProps = {
  match: Match;
  events: MatchEvent[];
  matchReport: MatchReport | null;
};

const TECHNICAL_STAT_LABELS: Record<string, string> = {
  shots: 'Số lần sút',
  totalShots: 'Số lần sút',
  shotsOnTarget: 'Sút trúng đích',
  onTarget: 'Sút trúng đích',
  possession: 'Kiểm soát bóng',
  ballPossession: 'Kiểm soát bóng',
  passes: 'Lượt chuyền bóng',
  totalPasses: 'Lượt chuyền bóng',
  fouls: 'Phạm lỗi',
  corners: 'Phạt góc',
  offsides: 'Việt vị',
};

const TECHNICAL_STAT_ROWS = [
  {
    key: 'shots',
    label: 'Số lần sút',
    aliases: ['shots', 'totalShots'],
  },
  {
    key: 'shotsOnTarget',
    label: 'Sút trúng đích',
    aliases: ['shotsOnTarget', 'onTarget'],
  },
  {
    key: 'possession',
    label: 'Kiểm soát bóng',
    aliases: ['possession', 'ballPossession'],
  },
  {
    key: 'passes',
    label: 'Lượt chuyền bóng',
    aliases: ['passes', 'totalPasses'],
  },
];

type StatPair = {
  home: unknown;
  away: unknown;
};

type MatchTeam = NonNullable<Match['homeTeam']>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function firstDefined(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    if (record[key] !== undefined) return record[key];
  }

  return undefined;
}

function getSideStat(value: unknown): StatPair | null {
  if (Array.isArray(value)) {
    if (value.length < 2) return null;
    return {
      home: value[0],
      away: value[1],
    };
  }

  if (!isRecord(value)) return null;

  return {
    home: firstDefined(value, ['home', 'homeTeam', 'homeValue']),
    away: firstDefined(value, ['away', 'awayTeam', 'awayValue']),
  };
}

function formatStatValue(value: unknown) {
  if (value === null || value === undefined || value === '') return '—';
  return String(value);
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

function TeamLogo({ team, teamName }: { team?: MatchTeam | null; teamName: string }) {
  const logoUrl = getTeamLogoUrl(team ?? teamName);

  if (logoUrl) {
    return <img className="match-stats-team-logo" src={logoUrl} alt={`${teamName} logo`} />;
  }

  return (
    <span className="match-stats-team-logo match-stats-team-logo-fallback" aria-hidden="true">
      {getTeamInitials(teamName)}
    </span>
  );
}

function getTechnicalStat(technicalStats: Record<string, unknown>, aliases: string[]) {
  for (const alias of aliases) {
    if (alias in technicalStats) return technicalStats[alias];
  }

  return undefined;
}

function getEventTeamId(event: MatchEvent) {
  return event.team?.id ?? event.teamId ?? null;
}

function countEvents(events: MatchEvent[], teamId: string, types: MatchEvent['type'][]) {
  return events.filter((event) => types.includes(event.type) && getEventTeamId(event) === teamId)
    .length;
}

function countGoalsForTeam(events: MatchEvent[], teamId: string, opponentTeamId: string) {
  return events.filter((event) => {
    const eventTeamId = getEventTeamId(event);
    if ((event.type === 'GOAL' || event.type === 'PENALTY') && eventTeamId === teamId) {
      return true;
    }

    return event.type === 'OWN_GOAL' && eventTeamId === opponentTeamId;
  }).length;
}

export default function MatchStatsPanel({ match, events, matchReport }: MatchStatsPanelProps) {
  const homeTeamName = match.homeTeam?.name ?? 'Đội nhà';
  const awayTeamName = match.awayTeam?.name ?? 'Đội khách';
  const technicalStats = isRecord(matchReport?.technicalStats) ? matchReport.technicalStats : {};
  const knownTechnicalKeys = new Set(TECHNICAL_STAT_ROWS.flatMap((row) => row.aliases));
  const technicalRows = TECHNICAL_STAT_ROWS.map((row) => {
    const values = getSideStat(getTechnicalStat(technicalStats, row.aliases));

    return {
      key: row.key,
      label: row.label,
      home: values?.home,
      away: values?.away,
    };
  });
  const extraTechnicalRows = Object.entries(technicalStats).flatMap(([key, value]) => {
    if (knownTechnicalKeys.has(key)) return [];
    const values = getSideStat(value);
    if (!values) return [];

    return [
      {
        key,
        label: TECHNICAL_STAT_LABELS[key] ?? key,
        home: values.home,
        away: values.away,
      },
    ];
  });
  const eventGoals = {
    home: countGoalsForTeam(events, match.homeTeamId, match.awayTeamId),
    away: countGoalsForTeam(events, match.awayTeamId, match.homeTeamId),
  };
  const eventRows = [
    {
      key: 'yellowCards',
      label: 'Thẻ vàng',
      home: countEvents(events, match.homeTeamId, ['YELLOW_CARD']),
      away: countEvents(events, match.awayTeamId, ['YELLOW_CARD']),
    },
    {
      key: 'redCards',
      label: 'Thẻ đỏ',
      home: countEvents(events, match.homeTeamId, ['RED_CARD']),
      away: countEvents(events, match.awayTeamId, ['RED_CARD']),
    },
    {
      key: 'substitutions',
      label: 'Thay người',
      home: countEvents(events, match.homeTeamId, ['SUBSTITUTION']),
      away: countEvents(events, match.awayTeamId, ['SUBSTITUTION']),
    },
  ];
  const statRows = [
    {
      key: 'goals',
      label: 'Bàn thắng',
      home: match.homeScore ?? matchReport?.homeScore ?? eventGoals.home,
      away: match.awayScore ?? matchReport?.awayScore ?? eventGoals.away,
    },
    ...eventRows,
    ...technicalRows,
    ...extraTechnicalRows,
  ];

  return (
    <div className="match-stats-panel">
      <div className="match-stats-teams">
        <div className="match-stats-team match-stats-team-home">
          <TeamLogo team={match.homeTeam} teamName={homeTeamName} />
          <strong>{homeTeamName}</strong>
        </div>
        <span>
          <small>Thống kê</small>
          <b>Thông số trận đấu</b>
        </span>
        <div className="match-stats-team match-stats-team-away">
          <TeamLogo team={match.awayTeam} teamName={awayTeamName} />
          <strong>{awayTeamName}</strong>
        </div>
      </div>

      <div className="match-stats-list">
        {statRows.map((row) => (
          <div className="match-stats-row" key={row.key}>
            <strong>{formatStatValue(row.home)}</strong>
            <span>{row.label}</span>
            <strong>{formatStatValue(row.away)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

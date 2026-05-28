import type { Match, MatchEvent, MatchReport } from '../../services/matchApi';

type MatchStatsPanelProps = {
  match: Match;
  events: MatchEvent[];
  matchReport: MatchReport | null;
};

const TECHNICAL_STAT_LABELS: Record<string, string> = {
  shots: 'Số lần sút',
  shotsOnTarget: 'Sút trúng đích',
  possession: 'Kiểm soát bóng',
  passes: 'Đường chuyền',
  fouls: 'Phạm lỗi',
  corners: 'Phạt góc',
  offsides: 'Việt vị',
};

const TECHNICAL_STAT_ORDER = [
  'shots',
  'shotsOnTarget',
  'possession',
  'passes',
  'fouls',
  'corners',
  'offsides',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function getSideStat(value: unknown) {
  if (!isRecord(value)) return null;
  return {
    home: value.home,
    away: value.away,
  };
}

function formatStatValue(value: unknown) {
  if (value === null || value === undefined || value === '') return '—';
  return String(value);
}

export default function MatchStatsPanel({ match, events, matchReport }: MatchStatsPanelProps) {
  const technicalStats = isRecord(matchReport?.technicalStats) ? matchReport.technicalStats : {};
  const technicalKeys = [
    ...TECHNICAL_STAT_ORDER.filter((key) => key in technicalStats),
    ...Object.keys(technicalStats).filter((key) => !TECHNICAL_STAT_ORDER.includes(key)),
  ];
  const cardEvents = events.filter(
    (event) => event.type === 'YELLOW_CARD' || event.type === 'RED_CARD',
  );
  const statRows = [
    {
      key: 'goals',
      label: 'Bàn thắng',
      home: matchReport?.homeScore ?? match.homeScore ?? 0,
      away: matchReport?.awayScore ?? match.awayScore ?? 0,
    },
    {
      key: 'cards',
      label: 'Thẻ phạt',
      home: cardEvents.filter((event) => event.teamId === match.homeTeamId).length,
      away: cardEvents.filter((event) => event.teamId === match.awayTeamId).length,
    },
    ...technicalKeys.flatMap((key) => {
      const values = getSideStat(technicalStats[key]);
      if (!values) return [];
      return [
        {
          key,
          label: TECHNICAL_STAT_LABELS[key] ?? key,
          home: values.home,
          away: values.away,
        },
      ];
    }),
  ];

  return (
    <div className="match-stats-panel">
      {statRows.map((row) => (
        <div className="match-stats-row" key={row.key}>
          <strong>{formatStatValue(row.home)}</strong>
          <span>{row.label}</span>
          <strong>{formatStatValue(row.away)}</strong>
        </div>
      ))}
    </div>
  );
}

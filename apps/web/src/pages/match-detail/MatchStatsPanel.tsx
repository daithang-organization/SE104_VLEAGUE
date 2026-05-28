import type { Match, MatchEvent, MatchReport } from '../../services/matchApi';

type MatchStatsPanelProps = {
  match: Match;
  events: MatchEvent[];
  matchReport: MatchReport | null;
};

export default function MatchStatsPanel({ match }: MatchStatsPanelProps) {
  return (
    <div className="match-stats-panel">
      <div className="match-stats-row">
        <strong>{match.homeScore ?? 0}</strong>
        <span>Bàn thắng</span>
        <strong>{match.awayScore ?? 0}</strong>
      </div>
    </div>
  );
}

import type { Match, MatchTeamLineup } from '../../services/matchApi';

type LineupBenchProps = {
  match: Match;
  lineups: MatchTeamLineup[];
};

export default function LineupBench({ lineups }: LineupBenchProps) {
  if (lineups.length === 0) return null;
  return <div className="lineup-bench">Bảng ghế dự bị</div>;
}

import { Empty } from 'antd';
import type { Match, MatchTeamLineup } from '../../services/matchApi';

type LineupPitchProps = {
  match: Match;
  lineups: MatchTeamLineup[];
};

export default function LineupPitch({ lineups }: LineupPitchProps) {
  if (lineups.length === 0) {
    return <Empty description="Chưa có đội nào nộp danh sách thi đấu." />;
  }

  return <div className="lineup-pitch">Đội hình ra sân</div>;
}

import { Tag } from 'antd';
import type { Match, MatchTeamLineup } from '../../services/matchApi';
import { getTeamLogoUrl } from '../../utils/teamLogos';

type LineupBenchProps = {
  match: Match;
  lineups: MatchTeamLineup[];
};

type LineupPlayer = NonNullable<MatchTeamLineup['lineupPlayers']>[number];
type TeamSide = 'home' | 'away';
type TeamIdentity = {
  name?: string | null;
  shortName?: string | null;
  logoUrl?: string | null;
};

const POSITION_ORDER: Record<string, number> = {
  GK: 0,
  DF: 1,
  MF: 2,
  FW: 3,
};

function getTeamLineup(lineups: MatchTeamLineup[], teamId: string) {
  return lineups.find((lineup) => lineup.teamId === teamId);
}

function getPlayerName(player: LineupPlayer) {
  return player.player?.fullName ?? player.playerId;
}

function getPlayerPosition(player: LineupPlayer) {
  return (player.position ?? player.player?.position ?? '').toUpperCase();
}

function compareNullableNumber(a?: number | null, b?: number | null) {
  if (typeof a === 'number' && typeof b === 'number' && a !== b) return a - b;
  if (typeof a === 'number') return -1;
  if (typeof b === 'number') return 1;
  return 0;
}

function sortPlayers(players: LineupPlayer[]) {
  return [...players].sort((a, b) => {
    const shirtDiff = compareNullableNumber(a.shirtNumber, b.shirtNumber);
    if (shirtDiff !== 0) return shirtDiff;

    const positionDiff =
      (POSITION_ORDER[getPlayerPosition(a)] ?? 9) - (POSITION_ORDER[getPlayerPosition(b)] ?? 9);
    if (positionDiff !== 0) return positionDiff;

    return getPlayerName(a).localeCompare(getPlayerName(b));
  });
}

function getSubstitutes(lineup?: MatchTeamLineup) {
  return sortPlayers(
    (lineup?.lineupPlayers ?? []).filter((player) => player.role === 'SUBSTITUTE'),
  );
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

function getSideTeam(match: Match, lineup: MatchTeamLineup | undefined, side: TeamSide) {
  return (side === 'home' ? match.homeTeam : match.awayTeam) ?? lineup?.team ?? undefined;
}

function getSideTeamName(match: Match, lineup: MatchTeamLineup | undefined, side: TeamSide) {
  const fallback = side === 'home' ? 'Đội nhà' : 'Đội khách';
  return getSideTeam(match, lineup, side)?.name ?? lineup?.team?.name ?? fallback;
}

function getDisplayName(player: LineupPlayer, compactTrailingShirtNumber: boolean) {
  const name = getPlayerName(player);
  if (
    compactTrailingShirtNumber &&
    typeof player.shirtNumber === 'number' &&
    player.shirtNumber >= 10 &&
    name.endsWith(` ${player.shirtNumber}`)
  ) {
    return `${name.slice(0, -String(player.shirtNumber).length).trimEnd()} #${player.shirtNumber}`;
  }
  return name;
}

function TeamBadge({ team, teamName }: { team?: TeamIdentity | null; teamName: string }) {
  const logoUrl = getTeamLogoUrl(team ?? teamName);

  if (logoUrl) {
    return <img className="lineup-bench-team-logo" src={logoUrl} alt={`${teamName} logo`} />;
  }

  return <span className="lineup-bench-team-logo-fallback">{getTeamInitials(teamName)}</span>;
}

function BenchPlayer({
  player,
  compactTrailingShirtNumber,
}: {
  player: LineupPlayer;
  compactTrailingShirtNumber: boolean;
}) {
  const playerName = getPlayerName(player);
  const position = getPlayerPosition(player);

  return (
    <div className="lineup-bench-player" title={playerName}>
      <span className="lineup-bench-number">#{player.shirtNumber ?? '—'}</span>
      <span className="lineup-bench-name">
        {getDisplayName(player, compactTrailingShirtNumber)}
      </span>
      {position && <Tag className="lineup-bench-position">{position}</Tag>}
    </div>
  );
}

function BenchTeam({
  match,
  lineup,
  side,
}: {
  match: Match;
  lineup?: MatchTeamLineup;
  side: TeamSide;
}) {
  const team = getSideTeam(match, lineup, side);
  const teamName = getSideTeamName(match, lineup, side);
  const substitutes = getSubstitutes(lineup);
  const compactHomeNames = side === 'home';

  return (
    <section
      className={`lineup-bench-team lineup-bench-team-${side}`}
      aria-label={`${teamName} dự bị`}
    >
      <div className="lineup-bench-team-header">
        <TeamBadge team={team} teamName={teamName} />
        <span>
          <strong>{teamName}</strong>
          <small>{substitutes.length} dự bị</small>
        </span>
      </div>

      {!lineup ? (
        <div className="lineup-bench-empty">Chưa nộp danh sách dự bị.</div>
      ) : substitutes.length === 0 ? (
        <div className="lineup-bench-empty">Chưa có cầu thủ dự bị.</div>
      ) : (
        <div className="lineup-bench-list">
          {substitutes.map((player) => (
            <BenchPlayer
              key={player.id}
              player={player}
              compactTrailingShirtNumber={compactHomeNames}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default function LineupBench({ match, lineups }: LineupBenchProps) {
  if (lineups.length === 0) return null;

  const homeLineup = getTeamLineup(lineups, match.homeTeamId);
  const awayLineup = getTeamLineup(lineups, match.awayTeamId);

  return (
    <div className="lineup-bench">
      <div className="lineup-bench-title">
        <strong>Bảng ghế dự bị</strong>
        <span>Danh sách cầu thủ có thể thay người</span>
      </div>
      <div className="lineup-bench-grid">
        <BenchTeam match={match} lineup={homeLineup} side="home" />
        <BenchTeam match={match} lineup={awayLineup} side="away" />
      </div>
    </div>
  );
}

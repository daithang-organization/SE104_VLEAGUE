import { Empty, Tag } from 'antd';
import type { CSSProperties } from 'react';
import type { Match, MatchTeamLineup } from '../../services/matchApi';
import { getTeamLogoUrl } from '../../utils/teamLogos';

type LineupPitchProps = {
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
type LineupLine = {
  key: string;
  label: string;
  players: LineupPlayer[];
};

const POSITION_ORDER: Record<string, number> = {
  GK: 0,
  DF: 1,
  MF: 2,
  FW: 3,
};

const POSITION_LABEL: Record<string, string> = {
  GK: 'GK',
  DF: 'DF',
  MF: 'MF',
  FW: 'FW',
  OTHER: 'Khác',
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

function getPlayerOrder(player: LineupPlayer) {
  const playerWithOrder = player as LineupPlayer & {
    displayOrder?: number | null;
    order?: number | null;
    sortOrder?: number | null;
  };

  return playerWithOrder.displayOrder ?? playerWithOrder.order ?? playerWithOrder.sortOrder;
}

function compareNullableNumber(a?: number | null, b?: number | null) {
  if (typeof a === 'number' && typeof b === 'number' && a !== b) return a - b;
  if (typeof a === 'number') return -1;
  if (typeof b === 'number') return 1;
  return 0;
}

function sortLineupPlayers(players: LineupPlayer[]) {
  return [...players].sort((a, b) => {
    const orderDiff = compareNullableNumber(getPlayerOrder(a), getPlayerOrder(b));
    if (orderDiff !== 0) return orderDiff;

    const positionDiff =
      (POSITION_ORDER[getPlayerPosition(a)] ?? 9) - (POSITION_ORDER[getPlayerPosition(b)] ?? 9);
    if (positionDiff !== 0) return positionDiff;

    const shirtDiff = compareNullableNumber(a.shirtNumber, b.shirtNumber);
    if (shirtDiff !== 0) return shirtDiff;

    return getPlayerName(a).localeCompare(getPlayerName(b));
  });
}

function getStarters(lineup?: MatchTeamLineup) {
  return sortLineupPlayers(
    (lineup?.lineupPlayers ?? []).filter((player) => player.role === 'STARTER'),
  );
}

function parseFormation(formation?: string | null) {
  const numbers = (formation ?? '')
    .match(/\d+/g)
    ?.map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0);

  return numbers && numbers.length >= 2 ? numbers : undefined;
}

function buildFormationLines(players: LineupPlayer[], formation?: string | null): LineupLine[] {
  const sortedPlayers = sortLineupPlayers(players);
  if (sortedPlayers.length === 0) return [];

  const formationLines = parseFormation(formation);
  if (formationLines) {
    const goalkeeper =
      sortedPlayers.find((player) => getPlayerPosition(player) === 'GK') ?? sortedPlayers[0];
    const outfieldPlayers = sortedPlayers.filter((player) => player !== goalkeeper);
    const lines: LineupLine[] = [{ key: 'GK', label: 'GK', players: [goalkeeper] }];
    let cursor = 0;

    formationLines.forEach((count, index) => {
      lines.push({
        key: `formation-${index}`,
        label: String(count),
        players: outfieldPlayers.slice(cursor, cursor + count),
      });
      cursor += count;
    });

    if (cursor < outfieldPlayers.length) {
      lines[lines.length - 1].players.push(...outfieldPlayers.slice(cursor));
    }

    return lines.filter((line) => line.players.length > 0);
  }

  const grouped = sortedPlayers.reduce<Record<string, LineupPlayer[]>>((acc, player) => {
    const playerPosition = getPlayerPosition(player);
    const position = POSITION_ORDER[playerPosition] === undefined ? 'OTHER' : playerPosition;
    acc[position] = [...(acc[position] ?? []), player];
    return acc;
  }, {});

  return ['GK', 'DF', 'MF', 'FW', 'OTHER']
    .map((position) => ({
      key: position,
      label: POSITION_LABEL[position],
      players: grouped[position] ?? [],
    }))
    .filter((line) => line.players.length > 0);
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
    return <img className="lineup-pitch-team-logo" src={logoUrl} alt={`${teamName} logo`} />;
  }

  return <span className="lineup-pitch-team-logo-fallback">{getTeamInitials(teamName)}</span>;
}

function PlayerMarker({
  player,
  compactTrailingShirtNumber,
}: {
  player: LineupPlayer;
  compactTrailingShirtNumber: boolean;
}) {
  const playerName = getPlayerName(player);
  const position = getPlayerPosition(player);

  return (
    <div className="lineup-pitch-player" title={playerName}>
      <span className="lineup-pitch-number">#{player.shirtNumber ?? '—'}</span>
      <span className="lineup-pitch-name">
        {getDisplayName(player, compactTrailingShirtNumber)}
      </span>
      {position && <Tag className="lineup-pitch-position">{position}</Tag>}
    </div>
  );
}

function PitchSide({
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
  const starters = getStarters(lineup);
  const lines = buildFormationLines(starters, lineup?.formation);
  const displayLines = side === 'away' ? [...lines].reverse() : lines;
  const lineStyle = {
    '--lineup-lines': String(Math.max(displayLines.length, 1)),
  } as CSSProperties;
  const compactHomeNames = side === 'home';

  return (
    <section className={`lineup-pitch-side lineup-pitch-side-${side}`} aria-label={teamName}>
      <div className="lineup-pitch-team-header">
        <TeamBadge team={team} teamName={teamName} />
        <span className="lineup-pitch-team-copy">
          <strong>{teamName}</strong>
          <Tag className="lineup-pitch-formation">{lineup?.formation || 'Chưa rõ sơ đồ'}</Tag>
        </span>
      </div>

      {!lineup ? (
        <div className="lineup-pitch-pending">
          <strong>{teamName}</strong>
          <span>Chưa nộp danh sách thi đấu.</span>
        </div>
      ) : displayLines.length === 0 ? (
        <div className="lineup-pitch-pending">
          <strong>{teamName}</strong>
          <span>Chưa có cầu thủ đá chính.</span>
        </div>
      ) : (
        <div className="lineup-pitch-lines" style={lineStyle}>
          {displayLines.map((line) => (
            <div key={line.key} className="lineup-pitch-line" aria-label={`Tuyến ${line.label}`}>
              {line.players.map((player) => (
                <PlayerMarker
                  key={player.id}
                  player={player}
                  compactTrailingShirtNumber={compactHomeNames}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function LineupPitch({ match, lineups }: LineupPitchProps) {
  if (lineups.length === 0) {
    return <Empty description="Chưa có đội nào nộp danh sách thi đấu." />;
  }

  const homeLineup = getTeamLineup(lineups, match.homeTeamId);
  const awayLineup = getTeamLineup(lineups, match.awayTeamId);

  return (
    <div className="lineup-pitch">
      <div className="lineup-pitch-field">
        <span className="lineup-pitch-center-circle" aria-hidden="true" />
        <span className="lineup-pitch-penalty lineup-pitch-penalty-home" aria-hidden="true" />
        <span className="lineup-pitch-penalty lineup-pitch-penalty-away" aria-hidden="true" />
        <PitchSide match={match} lineup={homeLineup} side="home" />
        <PitchSide match={match} lineup={awayLineup} side="away" />
      </div>
    </div>
  );
}

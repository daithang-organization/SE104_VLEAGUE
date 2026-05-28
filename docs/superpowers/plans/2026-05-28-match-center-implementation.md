# Match Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a balanced Match Center inside the existing match detail page with internal tabs for match timeline, visual lineups, and stats while preserving referee/report workflows.

**Architecture:** Add focused presentation components under `apps/web/src/pages/match-detail/` and integrate them into the existing `MatchDetailPage` lineup tab. Reuse existing loaded data and the current `MatchTimeline` component; do not add backend calls or change lineup payloads.

**Tech Stack:** React 19, TypeScript, Ant Design 6, Vite/Vitest, existing `matchApi` types, existing `teamLogos` utilities.

---

## File Structure

- Create: `apps/web/src/pages/match-detail/MatchCenter.tsx`
  - Owns the Match Center shell, header, and internal tabs.
  - Reuses `MatchTimeline` for `DIEN BIEN TRAN DAU`.
  - Delegates lineup pitch and stats display to smaller components.

- Create: `apps/web/src/pages/match-detail/LineupPitch.tsx`
  - Renders submitted starter lineups on a green pitch.
  - Keeps home and away teams on opposite halves.
  - Shows empty/pending states when one or both lineups are missing.

- Create: `apps/web/src/pages/match-detail/LineupBench.tsx`
  - Renders substitutes split by team.
  - Shows shirt number, player name, and position.

- Create: `apps/web/src/pages/match-detail/MatchStatsPanel.tsx`
  - Normalizes technical stats and event-derived fallbacks into symmetric home/away rows.

- Modify: `apps/web/src/pages/MatchDetailPage.tsx`
  - Import and render `MatchCenter` at the top of the existing `lineups` primary tab.
  - Keep existing lineup submission/review panels below it.
  - Keep existing `timeline` and `officials` primary tabs available.

- Modify: `apps/web/src/index.css`
  - Add Match Center, pitch, bench, and stats classes.
  - Keep existing timeline CSS intact.

- Modify: `apps/web/src/pages/__tests__/MatchDetailPage.test.tsx`
  - Add test fixtures for submitted lineups and match events.
  - Add coverage for internal Match Center tabs, lineup pitch/bench, stats fallback, and preserved official/report tab behavior.

---

## Task 1: Lock Behavior With Failing Tests

**Files:**

- Modify: `apps/web/src/pages/__tests__/MatchDetailPage.test.tsx`
- Test: `apps/web/src/pages/__tests__/MatchDetailPage.test.tsx`

- [ ] **Step 1: Update the test imports**

Change the first import to include `within`:

```tsx
import { render, screen, waitFor, within } from '@testing-library/react';
```

- [ ] **Step 2: Add submitted lineup fixtures after `awayRoster`**

Insert this block after the existing `awayRoster` fixture:

```tsx
const submittedLineups = [
  {
    id: 'home-lineup',
    matchId: 'm1',
    teamId: 'home-team',
    kitType: 'PRIMARY',
    formation: '4-4-2',
    status: 'APPROVED',
    team: { id: 'home-team', name: 'Ha Noi FC', shortName: 'HN' },
    lineupPlayers: homeRoster.map((player, index) => ({
      id: `home-lineup-player-${index + 1}`,
      registrationId: 'home-lineup',
      playerId: player.playerId,
      role: index < 11 ? 'STARTER' : 'SUBSTITUTE',
      position: player.position,
      shirtNumber: player.jerseyNumber,
      player: {
        id: player.playerId,
        fullName: player.fullName,
        position: player.position,
        nationality: player.nationality,
      },
    })),
  },
  {
    id: 'away-lineup',
    matchId: 'm1',
    teamId: 'away-team',
    kitType: 'BACKUP',
    formation: '4-2-3-1',
    status: 'SUBMITTED',
    team: { id: 'away-team', name: 'Hai Phong FC', shortName: 'HP' },
    lineupPlayers: awayRoster.map((player, index) => ({
      id: `away-lineup-player-${index + 1}`,
      registrationId: 'away-lineup',
      playerId: player.playerId,
      role: index < 11 ? 'STARTER' : 'SUBSTITUTE',
      position: player.position,
      shirtNumber: player.jerseyNumber,
      player: {
        id: player.playerId,
        fullName: player.fullName,
        position: player.position,
        nationality: player.nationality,
      },
    })),
  },
];
```

- [ ] **Step 3: Add a match-with-events fixture helper after `submittedLineups`**

```tsx
const matchWithEvents = {
  id: 'm1',
  roundNo: 1,
  leg: 1,
  seasonId: 's1',
  season: { id: 's1', name: 'V.League 2025' },
  homeTeamId: 'home-team',
  awayTeamId: 'away-team',
  homeTeam: { id: 'home-team', name: 'Ha Noi FC', shortName: 'HN' },
  awayTeam: { id: 'away-team', name: 'Hai Phong FC', shortName: 'HP' },
  homeScore: 1,
  awayScore: 0,
  status: 'PUBLISHED',
  events: [
    {
      id: 'event-goal-1',
      minute: 23,
      type: 'GOAL',
      teamId: 'home-team',
      playerId: 'h-player-1',
      player: { id: 'h-player-1', fullName: 'Home Player 1' },
      team: { id: 'home-team', name: 'Ha Noi FC' },
      note: 'Goal from open play',
    },
    {
      id: 'event-card-1',
      minute: 45,
      type: 'YELLOW_CARD',
      teamId: 'away-team',
      playerId: 'a-player-2',
      player: { id: 'a-player-2', fullName: 'Away Player 2' },
      team: { id: 'away-team', name: 'Hai Phong FC' },
      note: 'Tactical foul',
    },
  ],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};
```

- [ ] **Step 4: Add a failing test for Match Center tabs, timeline reuse, lineup pitch, bench, and stats**

Add this test before the current officials test:

```tsx
it('renders the match center tabs with timeline, visual lineups, bench, and stats', async () => {
  mockMatchApi.apiGetMatch.mockResolvedValueOnce(matchWithEvents);
  mockMatchApi.apiGetMatchLineups.mockResolvedValueOnce(submittedLineups);
  mockMatchApi.apiGetMatchReport.mockResolvedValueOnce({
    id: 'report-1',
    matchId: 'm1',
    homeScore: 1,
    awayScore: 0,
    technicalStats: {
      shots: { home: 13, away: 5 },
      shotsOnTarget: { home: 5, away: 0 },
      possession: { home: '62%', away: '38%' },
      passes: { home: 516, away: 299 },
    },
  });

  const { container } = renderPage();

  await screen.findByText(/Chi tiết trận đấu/);
  await userEvent.click(screen.getByRole('tab', { name: /Đội hình/ }));

  await waitFor(() => {
    expect(mockMatchApi.apiGetMatchLineups).toHaveBeenCalledWith('m1');
  });

  const matchCenter = container.querySelector('.match-center-card');
  expect(matchCenter).toBeInTheDocument();
  expect(
    within(matchCenter as HTMLElement).getByRole('tab', { name: /DIỄN BIẾN TRẬN ĐẤU/ }),
  ).toBeInTheDocument();
  expect(
    within(matchCenter as HTMLElement).getByRole('tab', { name: /ĐỘI HÌNH RA SÂN/ }),
  ).toBeInTheDocument();
  expect(
    within(matchCenter as HTMLElement).getByRole('tab', { name: /THỐNG KÊ/ }),
  ).toBeInTheDocument();

  await userEvent.click(
    within(matchCenter as HTMLElement).getByRole('tab', { name: /ĐỘI HÌNH RA SÂN/ }),
  );
  expect(container.querySelector('.lineup-pitch')).toBeInTheDocument();
  expect(within(matchCenter as HTMLElement).getAllByText('Ha Noi FC').length).toBeGreaterThan(0);
  expect(within(matchCenter as HTMLElement).getAllByText('Hai Phong FC').length).toBeGreaterThan(0);
  expect(within(matchCenter as HTMLElement).getByText(/Home Player 1/)).toBeInTheDocument();
  expect(within(matchCenter as HTMLElement).getByText(/Away Player 16/)).toBeInTheDocument();
  expect(container.querySelector('.lineup-bench')).toBeInTheDocument();

  await userEvent.click(within(matchCenter as HTMLElement).getByRole('tab', { name: /THỐNG KÊ/ }));
  expect(within(matchCenter as HTMLElement).getByText('Số lần sút')).toBeInTheDocument();
  expect(within(matchCenter as HTMLElement).getByText('Kiểm soát bóng')).toBeInTheDocument();
  expect(within(matchCenter as HTMLElement).getByText('62%')).toBeInTheDocument();
  expect(within(matchCenter as HTMLElement).getByText('38%')).toBeInTheDocument();

  await userEvent.click(
    within(matchCenter as HTMLElement).getByRole('tab', { name: /DIỄN BIẾN TRẬN ĐẤU/ }),
  );
  expect(
    within(matchCenter as HTMLElement).getByLabelText('Diễn biến trận đấu'),
  ).toBeInTheDocument();
  expect(container.querySelector('.match-timeline-hero')).toBeInTheDocument();
});
```

- [ ] **Step 5: Add a failing test for empty lineup state inside Match Center**

Add this test before the current officials test:

```tsx
it('shows a pending lineup state inside the match center when no team has submitted', async () => {
  renderPage();

  await screen.findByText(/Chi tiết trận đấu/);
  await userEvent.click(screen.getByRole('tab', { name: /Đội hình/ }));

  const matchCenter = document.querySelector('.match-center-card');
  expect(matchCenter).toBeInTheDocument();

  await userEvent.click(
    within(matchCenter as HTMLElement).getByRole('tab', { name: /ĐỘI HÌNH RA SÂN/ }),
  );

  expect(
    within(matchCenter as HTMLElement).getByText('Chưa có đội nào nộp danh sách thi đấu.'),
  ).toBeInTheDocument();
});
```

- [ ] **Step 6: Run the targeted test and verify it fails**

Run:

```powershell
pnpm --filter web test -- MatchDetailPage.test.tsx
```

Expected: FAIL because `.match-center-card`, `.lineup-pitch`, `.lineup-bench`, and internal Match Center tabs do not exist yet.

- [ ] **Step 7: Commit the failing tests**

```bash
git add apps/web/src/pages/__tests__/MatchDetailPage.test.tsx
git commit -m "test match center acceptance criteria

Constraint: Preserve existing match detail referee and timeline workflows while adding visual lineup coverage.
Confidence: high
Scope-risk: moderate
Directive: Keep tests focused on visible behavior, not exact CSS internals beyond stable shell classes.
Tested: pnpm --filter web test -- MatchDetailPage.test.tsx fails for missing Match Center UI
Not-tested: Implementation not added yet"
```

---

## Task 2: Add the Match Center Shell

**Files:**

- Create: `apps/web/src/pages/match-detail/MatchCenter.tsx`
- Modify: `apps/web/src/pages/MatchDetailPage.tsx`
- Test: `apps/web/src/pages/__tests__/MatchDetailPage.test.tsx`

- [ ] **Step 1: Create `MatchCenter.tsx` with the shell and internal tabs**

```tsx
import { Card, Spin, Tabs, Typography } from 'antd';
import type { CSSProperties } from 'react';
import type { Match, MatchEvent, MatchReport, MatchTeamLineup } from '../../services/matchApi';
import { getTeamTheme } from '../../utils/teamLogos';
import LineupBench from './LineupBench';
import LineupPitch from './LineupPitch';
import MatchStatsPanel from './MatchStatsPanel';
import MatchTimeline from './MatchTimeline';

const { Text } = Typography;

type MatchCenterProps = {
  match: Match;
  events: MatchEvent[];
  lineups: MatchTeamLineup[];
  matchReport: MatchReport | null;
  loading?: boolean;
  onPlayerClick?: (playerId: string) => void;
};

function formatScore(match: Match) {
  const home = match.homeScore ?? '—';
  const away = match.awayScore ?? '—';
  return `${home} - ${away}`;
}

export default function MatchCenter({
  match,
  events,
  lineups,
  matchReport,
  loading = false,
  onPlayerClick,
}: MatchCenterProps) {
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
        <strong>{homeTeamName}</strong>
        <span>
          <Text>Match Center</Text>
          <b>{formatScore(match)}</b>
        </span>
        <strong>{awayTeamName}</strong>
      </div>

      <Spin spinning={loading}>
        <Tabs
          className="match-center-tabs"
          defaultActiveKey="lineups"
          items={[
            {
              key: 'timeline',
              label: 'DIỄN BIẾN TRẬN ĐẤU',
              children: (
                <div className="match-center-panel">
                  <MatchTimeline
                    events={events}
                    homeTeamId={match.homeTeamId}
                    homeTeamName={homeTeamName}
                    awayTeamName={awayTeamName}
                    onPlayerClick={onPlayerClick}
                  />
                </div>
              ),
            },
            {
              key: 'lineups',
              label: 'ĐỘI HÌNH RA SÂN',
              children: (
                <div className="match-center-panel">
                  <LineupPitch match={match} lineups={lineups} />
                  <LineupBench match={match} lineups={lineups} />
                </div>
              ),
            },
            {
              key: 'stats',
              label: 'THỐNG KÊ',
              children: (
                <div className="match-center-panel">
                  <MatchStatsPanel match={match} events={events} matchReport={matchReport} />
                </div>
              ),
            },
          ]}
        />
      </Spin>
    </Card>
  );
}
```

- [ ] **Step 2: Add temporary stub components so TypeScript can compile**

Create `apps/web/src/pages/match-detail/LineupPitch.tsx`:

```tsx
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
```

Create `apps/web/src/pages/match-detail/LineupBench.tsx`:

```tsx
import type { Match, MatchTeamLineup } from '../../services/matchApi';

type LineupBenchProps = {
  match: Match;
  lineups: MatchTeamLineup[];
};

export default function LineupBench({ lineups }: LineupBenchProps) {
  if (lineups.length === 0) return null;
  return <div className="lineup-bench">Bảng ghế dự bị</div>;
}
```

Create `apps/web/src/pages/match-detail/MatchStatsPanel.tsx`:

```tsx
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
```

- [ ] **Step 3: Import `MatchCenter` in `MatchDetailPage.tsx`**

Add this import near the other `match-detail` imports:

```tsx
import MatchCenter from './match-detail/MatchCenter';
```

- [ ] **Step 4: Render `MatchCenter` at the top of the existing `lineups` tab**

Inside the `lineups` tab `children`, add this as the first child inside the top-level `<Space>`:

```tsx
<MatchCenter
  match={match}
  events={events}
  lineups={lineups}
  matchReport={matchReport}
  loading={lineupLoading}
  onPlayerClick={(pid) => navigate(`/players/${pid}`)}
/>
```

The surrounding structure should remain:

```tsx
children: <Space direction="vertical" size={16} style={{ width: '100%' }}>
  <MatchCenter
    match={match}
    events={events}
    lineups={lineups}
    matchReport={matchReport}
    loading={lineupLoading}
    onPlayerClick={(pid) => navigate(`/players/${pid}`)}
  />

  <Row gutter={[16, 16]}>{/* Existing submitted lineup and suspension cards stay here. */}</Row>

  {/* Existing registration card stays here. */}
  {/* Existing roster cards stay here. */}
</Space>;
```

- [ ] **Step 5: Run the targeted test and verify partial progress**

Run:

```powershell
pnpm --filter web test -- MatchDetailPage.test.tsx
```

Expected: tests still FAIL because pitch, bench, and stats are stubs, but failures should no longer complain that `.match-center-card` or the internal tabs are missing.

- [ ] **Step 6: Commit the shell**

```bash
git add apps/web/src/pages/MatchDetailPage.tsx apps/web/src/pages/match-detail/MatchCenter.tsx apps/web/src/pages/match-detail/LineupPitch.tsx apps/web/src/pages/match-detail/LineupBench.tsx apps/web/src/pages/match-detail/MatchStatsPanel.tsx
git commit -m "introduce match center shell

Constraint: Match Center must reuse existing loaded match data and leave report/referee workflows intact.
Rejected: New public route | Out of scope for this balanced implementation.
Confidence: high
Scope-risk: moderate
Directive: Keep MatchCenter as a composition shell; move display logic into focused child components.
Tested: pnpm --filter web test -- MatchDetailPage.test.tsx fails only on unfinished child component behavior
Not-tested: Full visual styling and production build"
```

---

## Task 3: Implement Visual Lineup Pitch And Bench

**Files:**

- Modify: `apps/web/src/pages/match-detail/LineupPitch.tsx`
- Modify: `apps/web/src/pages/match-detail/LineupBench.tsx`
- Modify: `apps/web/src/index.css`
- Test: `apps/web/src/pages/__tests__/MatchDetailPage.test.tsx`

- [ ] **Step 1: Replace `LineupPitch.tsx` with the full visual implementation**

```tsx
import { Empty, Tag } from 'antd';
import type {
  Match,
  MatchLineupPlayer,
  MatchTeamLineup,
  PlayerPosition,
} from '../../services/matchApi';
import { getTeamLogoUrl } from '../../utils/teamLogos';

type LineupPitchProps = {
  match: Match;
  lineups: MatchTeamLineup[];
};

type TeamSide = 'home' | 'away';

const POSITION_ORDER: PlayerPosition[] = ['GK', 'DF', 'MF', 'FW'];

function getLineupForTeam(lineups: MatchTeamLineup[], teamId: string) {
  return lineups.find((lineup) => lineup.teamId === teamId);
}

function getPlayerName(player: MatchLineupPlayer) {
  return player.player?.fullName ?? player.playerId;
}

function getPlayerPosition(player: MatchLineupPlayer): PlayerPosition {
  const value = player.position ?? player.player?.position ?? 'MF';
  return POSITION_ORDER.includes(value as PlayerPosition) ? (value as PlayerPosition) : 'MF';
}

function getShortName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 2) return name;
  return `${parts[0]} ${parts[parts.length - 1]}`;
}

function getStarters(lineup?: MatchTeamLineup) {
  return [...(lineup?.lineupPlayers ?? [])]
    .filter((player) => player.role === 'STARTER')
    .sort((a, b) => {
      const posDelta =
        POSITION_ORDER.indexOf(getPlayerPosition(a)) - POSITION_ORDER.indexOf(getPlayerPosition(b));
      if (posDelta !== 0) return posDelta;
      return (a.shirtNumber ?? 99) - (b.shirtNumber ?? 99);
    });
}

function buildRows(lineup?: MatchTeamLineup) {
  const starters = getStarters(lineup);
  if (starters.length === 0) return [];

  const goalkeeper = starters.find((player) => getPlayerPosition(player) === 'GK') ?? starters[0];
  const outfield = starters.filter((player) => player.id !== goalkeeper.id);
  const formationParts = (lineup?.formation ?? '')
    .split('-')
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (formationParts.length > 0) {
    const rows: MatchLineupPlayer[][] = [[goalkeeper]];
    let cursor = 0;
    formationParts.forEach((size) => {
      rows.push(outfield.slice(cursor, cursor + size));
      cursor += size;
    });
    const remaining = outfield.slice(cursor);
    if (remaining.length > 0) rows.push(remaining);
    return rows.filter((row) => row.length > 0);
  }

  return [
    [goalkeeper],
    outfield.filter((player) => getPlayerPosition(player) === 'DF'),
    outfield.filter((player) => getPlayerPosition(player) === 'MF'),
    outfield.filter((player) => getPlayerPosition(player) === 'FW'),
  ].filter((row) => row.length > 0);
}

function TeamHeader({
  name,
  logoUrl,
  lineup,
}: {
  name: string;
  logoUrl?: string;
  lineup?: MatchTeamLineup;
}) {
  return (
    <div className="lineup-pitch-team-header">
      {logoUrl ? (
        <img src={logoUrl} alt="" />
      ) : (
        <span className="lineup-pitch-logo-fallback">{name.slice(0, 2).toUpperCase()}</span>
      )}
      <strong>{name}</strong>
      {lineup ? (
        <Tag color={lineup.status === 'APPROVED' ? 'success' : 'processing'}>
          {lineup.formation}
        </Tag>
      ) : (
        <Tag>Chờ nộp</Tag>
      )}
    </div>
  );
}

function PlayerNode({ player }: { player: MatchLineupPlayer }) {
  const name = getPlayerName(player);
  return (
    <button className="lineup-player-node" type="button" title={name}>
      <span>{player.shirtNumber ?? '—'}</span>
      <strong>{getShortName(name)}</strong>
      <small>{getPlayerPosition(player)}</small>
    </button>
  );
}

function TeamHalf({
  side,
  name,
  logoUrl,
  lineup,
}: {
  side: TeamSide;
  name: string;
  logoUrl?: string;
  lineup?: MatchTeamLineup;
}) {
  const rows = buildRows(lineup);

  return (
    <section className={`lineup-pitch-half lineup-pitch-half-${side}`}>
      <TeamHeader name={name} logoUrl={logoUrl} lineup={lineup} />
      {rows.length === 0 ? (
        <div className="lineup-pitch-pending">Chưa nộp đội hình</div>
      ) : (
        <div className="lineup-pitch-rows">
          {rows.map((row, index) => (
            <div className="lineup-pitch-row" key={`${side}-${index}`}>
              {row.map((player) => (
                <PlayerNode key={player.id} player={player} />
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function LineupPitch({ match, lineups }: LineupPitchProps) {
  const homeLineup = getLineupForTeam(lineups, match.homeTeamId);
  const awayLineup = getLineupForTeam(lineups, match.awayTeamId);
  const homeTeamName = match.homeTeam?.name ?? 'Đội nhà';
  const awayTeamName = match.awayTeam?.name ?? 'Đội khách';

  if (!homeLineup && !awayLineup) {
    return <Empty description="Chưa có đội nào nộp danh sách thi đấu." />;
  }

  return (
    <div className="lineup-pitch" aria-label="Đội hình ra sân">
      <TeamHalf
        side="home"
        name={homeTeamName}
        logoUrl={getTeamLogoUrl(match.homeTeam)}
        lineup={homeLineup}
      />
      <div className="lineup-pitch-center-line" />
      <TeamHalf
        side="away"
        name={awayTeamName}
        logoUrl={getTeamLogoUrl(match.awayTeam)}
        lineup={awayLineup}
      />
    </div>
  );
}
```

- [ ] **Step 2: Replace `LineupBench.tsx` with the full bench implementation**

```tsx
import { Empty, Tag, Typography } from 'antd';
import type {
  Match,
  MatchLineupPlayer,
  MatchTeamLineup,
  PlayerPosition,
} from '../../services/matchApi';

const { Text } = Typography;

type LineupBenchProps = {
  match: Match;
  lineups: MatchTeamLineup[];
};

function getLineupForTeam(lineups: MatchTeamLineup[], teamId: string) {
  return lineups.find((lineup) => lineup.teamId === teamId);
}

function getPlayerName(player: MatchLineupPlayer) {
  return player.player?.fullName ?? player.playerId;
}

function getPosition(player: MatchLineupPlayer) {
  return (player.position ?? player.player?.position ?? '—') as PlayerPosition | '—';
}

function getSubstitutes(lineup?: MatchTeamLineup) {
  return [...(lineup?.lineupPlayers ?? [])]
    .filter((player) => player.role === 'SUBSTITUTE')
    .sort((a, b) => (a.shirtNumber ?? 99) - (b.shirtNumber ?? 99));
}

function BenchColumn({ teamName, lineup }: { teamName: string; lineup?: MatchTeamLineup }) {
  const substitutes = getSubstitutes(lineup);

  return (
    <section className="lineup-bench-column">
      <div className="lineup-bench-heading">
        <strong>{teamName}</strong>
        {lineup ? <Tag>{substitutes.length} dự bị</Tag> : <Tag>Chờ nộp</Tag>}
      </div>

      {substitutes.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có cầu thủ dự bị" />
      ) : (
        <div className="lineup-bench-list">
          {substitutes.map((player) => (
            <div className="lineup-bench-player" key={player.id}>
              <span>{player.shirtNumber ?? '—'}</span>
              <strong>{getPlayerName(player)}</strong>
              <Text type="secondary">{getPosition(player)}</Text>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function LineupBench({ match, lineups }: LineupBenchProps) {
  const homeLineup = getLineupForTeam(lineups, match.homeTeamId);
  const awayLineup = getLineupForTeam(lineups, match.awayTeamId);

  if (!homeLineup && !awayLineup) return null;

  return (
    <div className="lineup-bench">
      <div className="lineup-bench-title">Bảng ghế dự bị</div>
      <div className="lineup-bench-grid">
        <BenchColumn teamName={match.homeTeam?.name ?? 'Đội nhà'} lineup={homeLineup} />
        <BenchColumn teamName={match.awayTeam?.name ?? 'Đội khách'} lineup={awayLineup} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add Match Center CSS to `index.css`**

Append this block after the existing match timeline CSS section:

```css
.match-center-card.ant-card {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #1f2233;
}

.match-center-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(120px, auto) minmax(0, 1fr);
  gap: 14px;
  align-items: center;
  min-height: 58px;
  padding: 12px 18px;
  background:
    linear-gradient(
      90deg,
      var(--match-home-primary),
      rgba(139, 92, 246, 0.72),
      var(--match-away-primary)
    ),
    #312e81;
  color: #ffffff;
}

.match-center-header > strong {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.match-center-header > strong:last-child {
  text-align: right;
}

.match-center-header > span {
  display: grid;
  gap: 2px;
  justify-items: center;
  text-align: center;
}

.match-center-header .ant-typography {
  color: rgba(255, 255, 255, 0.76);
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

.match-center-header b {
  font-size: 22px;
  line-height: 1;
}

.match-center-tabs.ant-tabs {
  color: #ffffff;
}

.match-center-tabs .ant-tabs-nav {
  margin: 0;
  background: #242638;
}

.match-center-tabs .ant-tabs-tab {
  justify-content: center;
  margin: 0 !important;
  padding: 14px 20px;
  color: rgba(255, 255, 255, 0.74);
  font-size: 12px;
  font-weight: 850;
  letter-spacing: 0;
}

.match-center-tabs .ant-tabs-tab-active {
  background: #171923;
}

.match-center-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
  color: #ffffff;
}

.match-center-tabs .ant-tabs-ink-bar {
  background: var(--primary);
}

.match-center-tabs .ant-tabs-content-holder {
  background: #242631;
}

.match-center-panel {
  padding: 16px;
}

.lineup-pitch {
  position: relative;
  display: grid;
  grid-template-rows: 1fr auto 1fr;
  min-height: 720px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 8px;
  background:
    linear-gradient(rgba(255, 255, 255, 0.09) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.07) 1px, transparent 1px), #34784e;
  background-size:
    100% 12.5%,
    12.5% 100%,
    auto;
}

.lineup-pitch::before,
.lineup-pitch::after {
  content: '';
  position: absolute;
  left: 50%;
  width: min(42%, 360px);
  height: 120px;
  border: 1px solid rgba(255, 255, 255, 0.38);
  transform: translateX(-50%);
  pointer-events: none;
}

.lineup-pitch::before {
  top: 0;
  border-top: 0;
  border-radius: 0 0 8px 8px;
}

.lineup-pitch::after {
  bottom: 0;
  border-bottom: 0;
  border-radius: 8px 8px 0 0;
}

.lineup-pitch-center-line {
  position: relative;
  height: 1px;
  background: rgba(255, 255, 255, 0.48);
}

.lineup-pitch-center-line::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 116px;
  aspect-ratio: 1;
  border: 1px solid rgba(255, 255, 255, 0.48);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.lineup-pitch-half {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 12px;
  padding: 16px;
}

.lineup-pitch-half-away {
  transform: rotate(180deg);
}

.lineup-pitch-half-away > * {
  transform: rotate(180deg);
}

.lineup-pitch-team-header {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  color: #ffffff;
  font-weight: 850;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.28);
}

.lineup-pitch-team-header img,
.lineup-pitch-logo-fallback {
  flex: 0 0 28px;
  width: 28px;
  height: 28px;
}

.lineup-pitch-team-header img {
  object-fit: contain;
}

.lineup-pitch-logo-fallback {
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
  font-size: 10px;
}

.lineup-pitch-rows {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  gap: 10px;
  min-height: 0;
}

.lineup-pitch-row {
  display: flex;
  gap: 10px;
  justify-content: space-evenly;
  min-width: 0;
}

.lineup-player-node {
  display: grid;
  justify-items: center;
  min-width: 68px;
  max-width: 96px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #ffffff;
  cursor: default;
  font: inherit;
  text-align: center;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.42);
}

.lineup-player-node span {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  margin-bottom: 5px;
  border: 2px solid rgba(255, 255, 255, 0.72);
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.58);
  font-size: 12px;
  font-weight: 900;
}

.lineup-player-node strong {
  width: 100%;
  overflow: hidden;
  font-size: 11px;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lineup-player-node small {
  color: rgba(255, 255, 255, 0.72);
  font-size: 10px;
}

.lineup-pitch-pending {
  display: grid;
  place-items: center;
  min-height: 180px;
  color: rgba(255, 255, 255, 0.76);
  font-weight: 750;
}

.lineup-bench {
  margin-top: 14px;
  overflow: hidden;
  border-radius: 8px;
  background: #22242e;
}

.lineup-bench-title {
  padding: 13px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  color: #ffffff;
  font-weight: 850;
  text-align: center;
}

.lineup-bench-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.lineup-bench-column {
  min-width: 0;
  padding: 14px;
}

.lineup-bench-column + .lineup-bench-column {
  border-left: 1px solid rgba(255, 255, 255, 0.08);
}

.lineup-bench-heading,
.lineup-bench-player {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
}

.lineup-bench-heading {
  margin-bottom: 10px;
  color: #ffffff;
}

.lineup-bench-list {
  display: grid;
}

.lineup-bench-player {
  grid-template-columns: 34px minmax(0, 1fr) auto;
  min-height: 42px;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  color: #ffffff;
}

.lineup-bench-player span {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  font-size: 11px;
  font-weight: 850;
}

.lineup-bench-player strong {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

- [ ] **Step 4: Run the targeted test**

Run:

```powershell
pnpm --filter web test -- MatchDetailPage.test.tsx
```

Expected: The lineup pitch and bench assertions pass. Stats assertions may still fail until Task 4.

- [ ] **Step 5: Commit the pitch and bench**

```bash
git add apps/web/src/pages/match-detail/LineupPitch.tsx apps/web/src/pages/match-detail/LineupBench.tsx apps/web/src/index.css
git commit -m "render match lineups on a pitch

Constraint: Use submitted lineup data only; no backend changes or player image dependency.
Rejected: Drag-and-drop tactical editor | Out of scope for a read-only match center view.
Confidence: high
Scope-risk: moderate
Directive: Keep pitch rendering resilient to missing formation and player metadata.
Tested: pnpm --filter web test -- MatchDetailPage.test.tsx passes lineup pitch and bench assertions
Not-tested: Browser visual inspection"
```

---

## Task 4: Implement Match Stats Panel

**Files:**

- Modify: `apps/web/src/pages/match-detail/MatchStatsPanel.tsx`
- Modify: `apps/web/src/index.css`
- Test: `apps/web/src/pages/__tests__/MatchDetailPage.test.tsx`

- [ ] **Step 1: Replace `MatchStatsPanel.tsx` with stat normalization and fallback rows**

```tsx
import type { Match, MatchEvent, MatchReport } from '../../services/matchApi';

type MatchStatsPanelProps = {
  match: Match;
  events: MatchEvent[];
  matchReport: MatchReport | null;
};

type StatRow = {
  label: string;
  home: string | number;
  away: string | number;
};

type StatPair = {
  home: string | number;
  away: string | number;
};

function countEvents(events: MatchEvent[], teamId: string, types: MatchEvent['type'][]) {
  return events.filter(
    (event) => (event.team?.id ?? event.teamId) === teamId && types.includes(event.type),
  ).length;
}

function getObjectValue(value: unknown, keys: string[]) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const record = value as Record<string, unknown>;
  return keys.map((key) => record[key]).find((item) => item !== undefined && item !== null);
}

function readTechnicalPair(
  stats: Record<string, unknown> | null | undefined,
  keys: string[],
): StatPair | undefined {
  if (!stats) return undefined;

  for (const key of keys) {
    const value = stats[key];

    if (Array.isArray(value) && value.length >= 2) {
      return { home: String(value[0]), away: String(value[1]) };
    }

    if (value && typeof value === 'object') {
      const home = getObjectValue(value, ['home', 'homeTeam', 'homeValue']);
      const away = getObjectValue(value, ['away', 'awayTeam', 'awayValue']);
      if (home !== undefined && away !== undefined) {
        return { home: home as string | number, away: away as string | number };
      }
    }
  }

  return undefined;
}

function valueOrDash(pair: StatPair | undefined, side: 'home' | 'away') {
  return pair?.[side] ?? '—';
}

export default function MatchStatsPanel({ match, events, matchReport }: MatchStatsPanelProps) {
  const technicalStats = matchReport?.technicalStats;
  const homeGoals = match.homeScore ?? countEvents(events, match.homeTeamId, ['GOAL', 'PENALTY']);
  const awayGoals = match.awayScore ?? countEvents(events, match.awayTeamId, ['GOAL', 'PENALTY']);
  const shots = readTechnicalPair(technicalStats, ['shots', 'totalShots']);
  const shotsOnTarget = readTechnicalPair(technicalStats, ['shotsOnTarget', 'onTarget']);
  const possession = readTechnicalPair(technicalStats, ['possession', 'ballPossession']);
  const passes = readTechnicalPair(technicalStats, ['passes', 'totalPasses']);

  const rows: StatRow[] = [
    { label: 'Bàn thắng', home: homeGoals, away: awayGoals },
    { label: 'Số lần sút', home: valueOrDash(shots, 'home'), away: valueOrDash(shots, 'away') },
    {
      label: 'Sút trúng đích',
      home: valueOrDash(shotsOnTarget, 'home'),
      away: valueOrDash(shotsOnTarget, 'away'),
    },
    {
      label: 'Kiểm soát bóng',
      home: valueOrDash(possession, 'home'),
      away: valueOrDash(possession, 'away'),
    },
    {
      label: 'Lượt chuyền bóng',
      home: valueOrDash(passes, 'home'),
      away: valueOrDash(passes, 'away'),
    },
    {
      label: 'Thẻ vàng',
      home: countEvents(events, match.homeTeamId, ['YELLOW_CARD']),
      away: countEvents(events, match.awayTeamId, ['YELLOW_CARD']),
    },
    {
      label: 'Thẻ đỏ',
      home: countEvents(events, match.homeTeamId, ['RED_CARD']),
      away: countEvents(events, match.awayTeamId, ['RED_CARD']),
    },
    {
      label: 'Thay người',
      home: countEvents(events, match.homeTeamId, ['SUBSTITUTION']),
      away: countEvents(events, match.awayTeamId, ['SUBSTITUTION']),
    },
  ];

  return (
    <div className="match-stats-panel" aria-label="Thống kê đội tuyển">
      <div className="match-stats-teams">
        <strong>{match.homeTeam?.name ?? 'Đội nhà'}</strong>
        <span>THỐNG KÊ ĐỘI TUYỂN</span>
        <strong>{match.awayTeam?.name ?? 'Đội khách'}</strong>
      </div>
      <div className="match-stats-list">
        {rows.map((row) => (
          <div className="match-stats-row" key={row.label}>
            <strong>{row.home}</strong>
            <span>{row.label}</span>
            <strong>{row.away}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add stats CSS to `index.css` after the bench CSS**

```css
.match-stats-panel {
  overflow: hidden;
  border-radius: 8px;
  background: #22242e;
  color: #ffffff;
}

.match-stats-teams,
.match-stats-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(160px, 220px) minmax(0, 1fr);
  gap: 14px;
  align-items: center;
}

.match-stats-teams {
  padding: 18px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  text-align: center;
}

.match-stats-teams strong:first-child,
.match-stats-row strong:first-child {
  text-align: left;
}

.match-stats-teams strong:last-child,
.match-stats-row strong:last-child {
  text-align: right;
}

.match-stats-teams span {
  color: rgba(255, 255, 255, 0.82);
  font-size: 12px;
  font-weight: 850;
}

.match-stats-list {
  display: grid;
}

.match-stats-row {
  min-height: 50px;
  padding: 0 28px;
}

.match-stats-row + .match-stats-row {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.match-stats-row strong {
  font-size: 15px;
}

.match-stats-row span {
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  font-weight: 750;
  text-align: center;
}
```

- [ ] **Step 3: Run the targeted test**

Run:

```powershell
pnpm --filter web test -- MatchDetailPage.test.tsx
```

Expected: Match Center tests pass, including technical stats values and event fallback labels.

- [ ] **Step 4: Commit stats panel**

```bash
git add apps/web/src/pages/match-detail/MatchStatsPanel.tsx apps/web/src/index.css
git commit -m "add match center stats panel

Constraint: Stats must use existing match report technicalStats and event-derived fallbacks.
Rejected: New analytics endpoint | Existing data is sufficient for the requested visual panel.
Confidence: high
Scope-risk: narrow
Directive: Keep technical stat parsing permissive and non-throwing.
Tested: pnpm --filter web test -- MatchDetailPage.test.tsx passes Match Center stats coverage
Not-tested: Backend-provided custom technicalStats variants beyond supported object and array pairs"
```

---

## Task 5: Polish Responsiveness And Preserve Existing Workflows

**Files:**

- Modify: `apps/web/src/index.css`
- Modify: `apps/web/src/pages/__tests__/MatchDetailPage.test.tsx`
- Test: `apps/web/src/pages/__tests__/MatchDetailPage.test.tsx`

- [ ] **Step 1: Add responsive CSS for mobile and tablet**

Append this near the existing responsive media queries:

```css
@media (max-width: 900px) {
  .match-center-header {
    grid-template-columns: 1fr;
    justify-items: center;
    text-align: center;
  }

  .match-center-header > strong:last-child {
    text-align: center;
  }

  .lineup-pitch {
    min-height: 620px;
  }

  .lineup-bench-grid {
    grid-template-columns: 1fr;
  }

  .lineup-bench-column + .lineup-bench-column {
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    border-left: 0;
  }

  .match-stats-teams,
  .match-stats-row {
    grid-template-columns: minmax(54px, 1fr) minmax(120px, 1.4fr) minmax(54px, 1fr);
  }
}

@media (max-width: 560px) {
  .match-center-panel {
    padding: 12px;
  }

  .match-center-tabs .ant-tabs-tab {
    padding: 12px 10px;
    font-size: 11px;
  }

  .lineup-pitch {
    min-height: 560px;
  }

  .lineup-pitch-half {
    padding: 12px 8px;
  }

  .lineup-pitch-row {
    gap: 4px;
  }

  .lineup-player-node {
    min-width: 52px;
    max-width: 72px;
  }

  .lineup-player-node span {
    width: 28px;
    height: 28px;
    font-size: 11px;
  }

  .lineup-player-node strong {
    font-size: 10px;
  }

  .match-stats-row {
    min-height: 46px;
    padding: 0 12px;
  }
}
```

- [ ] **Step 2: Confirm the existing referee/report test still passes unchanged**

Do not weaken this existing assertion:

```tsx
expect(screen.getAllByText('Nguyễn Văn Trọng').length).toBeGreaterThan(0);
expect(screen.getAllByText('Trọng tài chính').length).toBeGreaterThan(0);
expect(screen.getByText('Cầu thủ xuất sắc')).toBeInTheDocument();
expect(screen.getByText('Home Player 1')).toBeInTheDocument();
expect(screen.getByText('Một cầu thủ phản ứng trọng tài')).toBeInTheDocument();
```

- [ ] **Step 3: Run targeted tests**

Run:

```powershell
pnpm --filter web test -- MatchDetailPage.test.tsx
```

Expected: PASS.

- [ ] **Step 4: Run web lint**

Run:

```powershell
pnpm --filter web lint
```

Expected: PASS with no new lint errors.

- [ ] **Step 5: Run web build**

Run:

```powershell
pnpm --filter web build
```

Expected: PASS and Vite production bundle completes.

- [ ] **Step 6: Commit responsive polish**

```bash
git add apps/web/src/index.css apps/web/src/pages/__tests__/MatchDetailPage.test.tsx
git commit -m "polish match center responsiveness

Constraint: Mobile layout must avoid overlapping text, player nodes, and stat rows.
Confidence: high
Scope-risk: narrow
Directive: Preserve existing referee/report assertions when extending MatchDetailPage tests.
Tested: pnpm --filter web test -- MatchDetailPage.test.tsx; pnpm --filter web lint; pnpm --filter web build
Not-tested: Manual browser screenshot on every viewport"
```

---

## Task 6: Manual Visual Smoke Check

**Files:**

- No planned code edits.
- Optional run target: `apps/web`

- [ ] **Step 1: Start the web app**

Run:

```powershell
pnpm --filter web dev
```

Expected: Vite prints a local URL such as `http://localhost:5173/`.

- [ ] **Step 2: Open a match detail page and inspect the `Đội hình` tab**

Expected:

- The Match Center appears at the top of the tab.
- Internal tabs are visible: `DIỄN BIẾN TRẬN ĐẤU`, `ĐỘI HÌNH RA SÂN`, `THỐNG KÊ`.
- `DIỄN BIẾN TRẬN ĐẤU` keeps the existing vertical timeline style.
- `ĐỘI HÌNH RA SÂN` shows a green pitch when lineups exist.
- `THỐNG KÊ` shows symmetric home/away rows.
- Existing submitted lineup review, suspension, registration, and roster panels remain below.

- [ ] **Step 3: Inspect the `Trọng tài & báo cáo` primary tab**

Expected:

- Assigned official list still renders.
- Referee assignment form still renders for admins.
- Match report form still renders for admins/referees.
- Discipline report form still renders for admins/supervisors.

- [ ] **Step 4: Stop the dev server**

Stop the Vite command with `Ctrl+C`.

---

## Final Verification

- [ ] `pnpm --filter web test -- MatchDetailPage.test.tsx`
- [ ] `pnpm --filter web lint`
- [ ] `pnpm --filter web build`
- [ ] Manual visual smoke check for desktop width.
- [ ] Manual visual smoke check for mobile width.

Do not claim completion unless the commands above pass or the final report clearly states which command could not run and why.

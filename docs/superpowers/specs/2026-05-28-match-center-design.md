# Match Center UI Design

## Goal

Redesign the match detail experience so the match "Đội hình" area becomes a richer match center inspired by the provided references: a broadcast-like header, tabbed "Diễn biến trận đấu / Đội hình ra sân / Thống kê" surface, visual football pitch for lineups, and bench lists.

## Selected Approach

Use the balanced Match Center approach inside the existing match detail page.

The feature stays in the current authenticated match detail workflow instead of introducing a separate public broadcast route. It reuses the existing APIs and preserves all current operations for lineup submission, lineup review, referee assignment, match report submission, and discipline report submission.

## User Requirements

- Keep the current "Trọng tài & báo cáo" functionality available and usable.
- Keep the current match event timeline/diagram style for "Diễn biến trận đấu", including the vertical center line and event cards.
- Add a visual "Đội hình ra sân" view similar to the reference images: green pitch, team names/logos, formation badges, player positions, and bench section.
- Add a "Thống kê" tab similar to the reference stats panel, using existing match report/technical stats where available.
- Keep administrative forms practical; visual polish must not hide required workflows.

## Information Architecture

The match detail page keeps the existing top score hero and primary page tabs.

Inside the match detail content, add a Match Center panel with three internal tabs:

1. `Diễn biến trận đấu`
   - Reuse the existing `MatchTimeline` visual structure.
   - Keep vertical center-line presentation with home/away event cards.
   - Use the new match-center styling shell so it visually matches the lineup and stats tabs.

2. `Đội hình ra sân`
   - Show submitted lineups as a visual pitch when lineup data exists.
   - Render home and away teams on opposing halves of one pitch when both lineups are available.
   - Show a clear empty/pending state when one or both teams have not submitted lineups.
   - Show bench lists below the pitch, split by team.
   - Keep lineup status, kit type, and formation visible.

3. `Thống kê`
   - Render a team-vs-team stats panel similar to the reference image.
   - Source values from `matchReport.technicalStats` when available.
   - Provide sensible fallback rows when no technical stats exist, such as goals, cards, substitutions, and event counts from `match.events`.

The existing "Trọng tài & báo cáo" primary tab remains separate and unchanged in purpose. It may receive minor visual consistency updates only if necessary, but its fields and submit/review behavior must stay intact.

## Component Shape

Create focused components under `apps/web/src/pages/match-detail/`:

- `MatchCenter.tsx`
  - Owns the internal tabs and layout shell.
  - Receives match, events, lineups, suspensions, reports, and team roster context as props.

- `LineupPitch.tsx`
  - Renders the football pitch, team headers, formation badges, and player nodes.
  - Computes pitch rows from submitted lineup player roles, positions, and formation string.
  - Falls back to stable, readable position grouping when exact formation placement is not possible.

- `LineupBench.tsx`
  - Renders substitutes split by team.
  - Shows shirt number, player name, and position.

- `MatchStatsPanel.tsx`
  - Normalizes report technical stats and event-derived stats into display rows.
  - Renders symmetric home/away values with a central stat label.

Keep the existing `MatchTimeline.tsx` component as the basis for the event tab instead of rewriting it.

## Data Flow

`MatchDetailPage.tsx` continues to load:

- `match` via `apiGetMatch`
- rosters via `apiGetTeamRoster`
- submitted lineups via `apiGetMatchLineups`
- suspensions via `apiGetMatchSuspensions`
- officials and reports via the existing official/report APIs

`MatchCenter` receives already-loaded data. It should not introduce duplicate API calls.

Lineup submission and review remain in the existing registration/review panels. These panels can stay below the Match Center or in the existing lineup management area, but they must continue to call `apiSubmitMatchLineup` and `apiReviewMatchLineup` with the same payload shape.

## Visual Design

Use the current app theme variables and Ant Design primitives where they fit, but add custom CSS classes for the pitch and match-center shell.

Visual direction:

- Dark match-center container to match the current app's dark view.
- Red/purple or team-color header strip for match identity.
- Internal tab bar with compact uppercase labels.
- Green pitch with white field markings.
- Player nodes with shirt number, short name, and optional status/event markers.
- Bench section as a dense two-column list under the pitch.
- Stats rows centered by stat label, with home value left and away value right.

Responsive behavior:

- Desktop: pitch and supporting panels can sit side by side where space allows.
- Tablet/mobile: stack header, tabs, pitch, bench, then admin forms.
- Text must wrap safely and not overlap player nodes or stat rows.

## Error And Empty States

- If no submitted lineups exist, show the existing "Chưa có đội nào nộp danh sách thi đấu" message inside the lineup tab.
- If only one team has submitted, render that team and show a pending placeholder for the other team.
- If technical stats are absent or invalid, fall back to event-derived stats and show no JSON parsing errors to the user.
- If roster/player metadata is incomplete, display shirt number and player name when available, otherwise use the player id as a final fallback.

## Testing

Update or add tests for:

- Match Center renders the three internal tabs.
- "Diễn biến trận đấu" keeps rendering the existing timeline events.
- Submitted lineup data renders a pitch and bench list.
- "Trọng tài & báo cáo" tab still renders assigned officials, match report, and discipline report fields.
- Stats tab renders fallback stats when `technicalStats` is missing.

Use the existing `MatchDetailPage.test.tsx` style and mocked `matchApi` calls.

## Out Of Scope

- New public broadcast route.
- New backend endpoints.
- Player photo upload or image enrichment.
- Real-time heatmaps or advanced tactical animation.
- Changing lineup submission payload structure.

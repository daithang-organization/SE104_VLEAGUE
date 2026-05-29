# Referee Match Report Consolidation Design

## Goal

Reduce match-day data entry friction for referees by consolidating score entry, goal events, player-of-the-match selection, and referee report submission into one coherent post-match workflow.

The new primary action is `Nộp biên bản trận đấu`.

## Selected Approach

Use a guided match report flow inside the existing `Trọng tài & báo cáo` tab.

The referee should not have to jump between `Cập nhật tỉ số`, `Thêm sự kiện`, and `Nộp báo cáo trọng tài` for the same post-match responsibility. Goal events become the source of truth for the score, and the final submission stores the report data in one user-facing action.

## Alternatives Considered

1. Keep separate score, event, and report actions.
   - This preserves the current implementation surface, but it keeps duplicate work and allows score/event mismatch.

2. Put every field into one flat form.
   - This gives one submit button, but the form can become long and error-prone, especially on smaller screens.

3. Use a guided report flow.
   - This keeps one final submission while grouping related fields into clear sections. This is the selected approach because it reduces context switching without hiding important checks.

## User Flow

The referee opens the match detail page and selects `Trọng tài & báo cáo`.

The tab shows a `Biên bản trận đấu` panel with three sections:

1. `Bàn thắng & tỉ số`
   - Add goal events with minute, team, player, and optional note.
   - Show the calculated score from goal events.
   - Allow editing/removing draft goal events before submission.

2. `Thông tin sau trận`
   - Select `Cầu thủ xuất sắc nhất trận`.
   - Enter optional technical stats using the current raw JSON field.
   - Enter referee report notes.

3. `Kiểm tra & nộp`
   - Show a concise summary: final score, goal list, player of the match, and report notes.
   - Submit with one primary button: `Nộp biên bản trận đấu`.

## Score Rules

Goal events are the default source of truth for score.

The score shown in the report is calculated from:

- `GOAL`
- `PENALTY`
- `OWN_GOAL`, counted for the benefiting team according to the event team semantics already used by the backend

`PENALTY_MISS`, cards, and substitutions do not change the score.

For the first pass, the referee flow should not expose separate manual score inputs. It should calculate `homeScore` and `awayScore` from the draft goal events and submit those calculated values through the existing report payload. Existing admin score controls can remain outside this referee report flow.

## Role Boundaries

Referee responsibility:

- Record result
- Record match events relevant to the official result
- Submit referee match report
- Select player of the match

Supervisor responsibility remains separate:

- Submit supervisor report
- Record referee/player/organizer issues from the supervisor perspective

The consolidated referee flow must not merge supervisor-only fields into the referee submission.

## Component Direction

Reuse the existing match detail page and `Trọng tài & báo cáo` tab.

Expected frontend changes:

- Replace the scattered referee actions with one `Biên bản trận đấu` panel.
- Keep assigned officials display visible.
- Keep supervisor report panel separate.
- Reuse existing event form patterns where possible instead of creating a second event model.
- Make the final button visually primary and label it `Nộp biên bản trận đấu`.

Expected API direction:

- Reuse the existing `POST /matches/:id/report` endpoint as the first implementation path.
- The current report payload already supports `homeScore`, `awayScore`, `bestPlayerId`, `technicalStats`, `note`, and `events`, so the first pass should be a frontend consolidation rather than a new backend model.
- Keep standalone event endpoints available for existing match timeline workflows, but the consolidated referee report should submit goal events through the report payload when the referee is filing the final report.

## Validation

Before submission:

- At least one valid final score exists. A `0-0` score is valid.
- Goal event rows must have minute, team, and event type.
- Player is required for normal goals and penalties when available from roster data.
- Player of the match remains optional because the current report DTO allows `bestPlayerId` to be omitted.
- Technical stats JSON must be valid JSON if the field remains raw JSON.

After submission:

- Match score matches the saved goal events.
- Timeline reflects saved goal events.
- Match report shows the submitted score, best player, technical stats, and notes.

## Error And Empty States

- If no goal events exist, show the calculated score as `0-0`.
- If roster data is missing, allow saving a goal event with team and note, then clearly mark the missing player metadata.
- If event saving succeeds but report saving fails, show which part failed and keep the referee's report draft on screen.
- If a duplicate submit is attempted while saving, disable the submit button and keep the summary visible.

## Testing

Add or update tests for:

- Referee can submit a match report from one consolidated panel.
- Goal events calculate the displayed score.
- `0-0` report can be submitted without goal events.
- Referee report flow does not show separate manual score inputs.
- Supervisor report remains separate and still renders for supervisor/admin workflows.
- Existing match timeline still renders submitted goal events.

## Out Of Scope

- Live minute-by-minute officiating console.
- Changing supervisor report ownership.
- Reworking lineup submission.
- New public broadcast page.
- Replacing the existing match event data model.

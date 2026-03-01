---
name: Business Rules
description: All business rules, state machines, scoring, regulations, and domain constraints for SE104_VLEAGUE
---

# Business Rules Skill

## Configurable Regulations (Per-Season)

Stored in the `regulations` table, keyed by `seasonId`. Managed via `RegulationModule`.

| Key                   | Default | Type   | Purpose                       |
| --------------------- | ------- | ------ | ----------------------------- |
| `MIN_AGE`             | 16      | number | Minimum player age            |
| `MAX_AGE`             | 40      | number | Maximum player age            |
| `MIN_ROSTER`          | 15      | number | Minimum team roster size      |
| `MAX_ROSTER`          | 22      | number | Maximum team roster size      |
| `MAX_FOREIGN_PLAYERS` | 3       | number | Foreign player limit per team |
| `WIN_POINTS`          | 3       | number | Points awarded for a win      |
| `DRAW_POINTS`         | 1       | number | Points awarded for a draw     |
| `LOSS_POINTS`         | 0       | number | Points awarded for a loss     |
| `MAX_GOAL_TIME`       | 96      | number | Maximum allowed goal minute   |

### RegulationHelper

Cross-module helper exported from `RegulationModule`:

```typescript
regulationHelper.getNumericValue(seasonId, 'MAX_ROSTER', 22);
// Lookup chain: DB → defaults → hardcoded fallback
```

Used by: `RegistrationModule` (age), `RosterModule` (roster/foreign limits), `MatchModule` (goal time).

---

## Scoring System

| Result | Points                           |
| ------ | -------------------------------- |
| Win    | 3 (configurable via WIN_POINTS)  |
| Draw   | 1 (configurable via DRAW_POINTS) |
| Loss   | 0 (configurable via LOSS_POINTS) |

### Standings Sort Order (Priority)

1. **Points** (descending)
2. **Goal Difference** (descending)
3. **Goals For** (descending)
4. **Team Name** (alphabetical)

Only APPROVED season teams are shown in standings. Non-approved teams excluded.

---

## State Machines

### Match Status Flow

```
DRAFT → PUBLISHED → LOCKED → FINISHED
DRAFT → POSTPONED
PUBLISHED → POSTPONED
POSTPONED → DRAFT
```

- **DRAFT**: Initial state after schedule generation
- **PUBLISHED**: Visible to public, not yet started
- **LOCKED**: Match in progress (scores being recorded)
- **FINISHED**: Match completed → triggers auto standings recalculation
- **POSTPONED**: Match delayed → can return to DRAFT

**Validation rules**:

- Cannot finish match if scores are null
- Standings auto-recalculated when status transitions to FINISHED

### Season Status Flow

```
UPCOMING → IN_PROGRESS → COMPLETED
```

- Single-direction only (no backward transitions)
- Only ONE season can be `IN_PROGRESS` at a time

### Season Team Registration Flow

```
REGISTERED → APPROVED
REGISTERED → REJECTED
REGISTERED → WITHDRAWN
```

---

## Match Event Rules

### Event Types

| Type           | Scoring              | Description                                                        |
| -------------- | -------------------- | ------------------------------------------------------------------ |
| `GOAL`         | +1 for scoring team  | Regular goal                                                       |
| `OWN_GOAL`     | +1 for opposing team | Own goal — points awarded to OTHER team                            |
| `PENALTY`      | +1 for scoring team  | Penalty goal (counts as regular goal for scoring)                  |
| `PENALTY_MISS` | No score change      | Missed/saved penalty                                               |
| `YELLOW_CARD`  | —                    | Yellow card                                                        |
| `RED_CARD`     | —                    | Red card                                                           |
| `SUBSTITUTION` | —                    | Player substitution (requires `relatedPlayerId` for sub-in player) |

### Auto Score Recalculation

When events are added or removed:

- `homeScore` / `awayScore` are **automatically recalculated** from events
- GOAL + PENALTY events → scored for the event's team
- OWN_GOAL → scored for the opposing team

### Goal Time Validation

- Event `minute` must not exceed `MAX_GOAL_TIME` regulation (default: 96)

---

## Player Constraints

| Rule                      | Source                                       | Default |
| ------------------------- | -------------------------------------------- | ------- |
| Minimum age               | `MIN_AGE` regulation                         | 16      |
| Maximum age               | `MAX_AGE` regulation                         | 40      |
| Max roster size           | `MAX_ROSTER` regulation                      | 22      |
| Min roster size           | `MIN_ROSTER` regulation                      | 15      |
| Foreign player limit      | `MAX_FOREIGN_PLAYERS` regulation             | 3       |
| Jersey number uniqueness  | Enforced per active team roster              | —       |
| Exclusive team membership | Player can only belong to one team at a time | —       |
| Soft removal              | `leftAt` timestamp set (not deleted)         | —       |

### CSV Bulk Import

- `POST /api/players/import` accepts CSV file (max 2MB)
- Validates each row individually
- Reports per-row errors (row number + error message)
- Supports optional `teamId` for automatic roster assignment

---

## Scheduling Rules

### Round-Robin Generation

- **Double round-robin**: Leg 1 (lượt đi) + Leg 2 (lượt về) with swapped home/away
- **BYE handling**: Odd number of teams → one team gets a bye per round
- **Kickoff time slots**: Saturday/Sunday with VLeague-typical times (17:00, 18:00, 19:15)
- **Stadium assignment**: Auto-assigns home team's stadium
- **Clean slate**: Deletes ALL existing matches for the season before regenerating

---

## RBAC Permission Matrix

| Resource       | ADMIN               | TEAM_MANAGER    | REFEREE           | SUPERVISOR | PUBLIC    |
| -------------- | ------------------- | --------------- | ----------------- | ---------- | --------- |
| Teams (CRUD)   | ✅                  | Read only       | Read only         | Read only  | Read only |
| Players (CRUD) | ✅                  | Create/Edit own | Read only         | Read only  | Read only |
| Stadiums       | ✅                  | Read only       | Read only         | Read only  | Read only |
| Seasons        | ✅                  | Read only       | Read only         | Read only  | Read only |
| Schedule       | ✅ Generate/Publish | Read only       | Read only         | Read only  | Read only |
| Matches (edit) | ✅                  | Read only       | Add/Remove events | Read only  | Read only |
| Match status   | ✅                  | —               | —                 | —          | —         |
| Roster         | ✅                  | ✅ Own team     | Read only         | Read only  | Read only |
| Regulations    | ✅                  | Read only       | Read only         | Read only  | Read only |
| Users          | ✅                  | —               | —                 | —          | —         |
| Standings      | Read                | Read            | Read              | Read       | Read      |
| Upload         | ✅                  | ✅              | —                 | —          | —         |

---

## Statistics

### Top Scorers

- Counts `GOAL` + `PENALTY` events per player
- Grouped by player with team info

### Card Stats

- Weighted sorting: Red card = 3× Yellow card weight
- Shows yellow, red, and total cards per player

### Team Stats

- Aggregated: goals, cards, clean sheets per team
- Clean sheet = match where team conceded 0 goals

### Head-to-Head

- Historical record between two teams
- Includes goals scored, wins/draws/losses, and match list

### Player Stats

- Individual: goals, assists (via `relatedPlayerId`), cards
- Goals-per-round chart data for Recharts visualization

### CSV Export

- All 4 stat views exportable as CSV
- UTF-8 BOM prepended for Excel Vietnamese character support

---

## Demo Seed Accounts

| Email                      | Password         | Role         |
| -------------------------- | ---------------- | ------------ |
| `admin@vleague.local`      | `Admin@123`      | ADMIN        |
| `manager@vleague.local`    | `Manager@123`    | TEAM_MANAGER |
| `referee@vleague.local`    | `Referee@123`    | REFEREE      |
| `supervisor@vleague.local` | `Supervisor@123` | SUPERVISOR   |
| `user@vleague.local`       | `User@123`       | PUBLIC       |

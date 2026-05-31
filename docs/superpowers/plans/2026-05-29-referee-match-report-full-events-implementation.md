# Referee Match Report Full Events Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the consolidated referee match record so one `Nộp biên bản trận đấu` flow submits goals, own goals, penalties, penalty misses, cards, substitutions, score, player of the match, technical stats, and notes.

**Architecture:** Keep `RefereeMatchReportPanel` as the single report entry surface. Replace goal-only draft state with `DraftReportEvent`, submit `AddMatchEventPayload[]` through the existing match report endpoint, and keep score calculation limited to `GOAL`, `PENALTY`, and `OWN_GOAL`.

**Tech Stack:** React 19, TypeScript, Ant Design 6, react-i18next, Vitest, Testing Library.

---

## File Structure

- Modify `apps/web/src/pages/match-detail/RefereeMatchReportPanel.tsx`
  - Owns full draft event rows, conditional event fields, validation, score calculation, and report payload mapping.
- Modify `apps/web/src/pages/match-detail/refereeMatchReportScore.ts`
  - Reuse existing scoring semantics for scored goals, penalties, and own goals.
- Modify `apps/web/src/pages/__tests__/MatchDetailPage.test.tsx`
  - Covers scored goal metadata, card submission, substitution player-in/player-out, zero-zero reports, and referee-only report flow.
- Modify `apps/web/src/locales/vi.ts` and `apps/web/src/locales/en.ts`
  - Adds generic event labels and validation messages for the report panel.
- Modify `docs/superpowers/specs/2026-05-29-referee-match-report-design.md`
  - Updates the design from goal-only to full match-event reporting.

---

### Task 1: Lock Full Event Behavior With Tests

- [x] Update the goal report test to use `Thêm sự kiện`, `Phút sự kiện`, `Đội sự kiện`, and `Cầu thủ sự kiện`.
- [x] Assert scored goals can include `goalType` and `relatedPlayerId` assist data.
- [x] Add a card test that submits `YELLOW_CARD` and keeps `homeScore`/`awayScore` at `0-0`.
- [x] Add a substitution test that submits `SUBSTITUTION` with `playerId` as player in and `relatedPlayerId` as player out.
- [x] Run the targeted Vitest group and confirm the new expectations fail before implementation.

### Task 2: Implement Full Draft Events

- [x] Replace `DraftGoalEvent`/`draftGoals` with `DraftReportEvent`/`draftEvents`.
- [x] Offer all event types: `GOAL`, `OWN_GOAL`, `PENALTY`, `PENALTY_MISS`, `YELLOW_CARD`, `RED_CARD`, `SUBSTITUTION`.
- [x] Show `goalType` and assist fields for `GOAL` and `PENALTY`.
- [x] Show player-in and player-out fields for `SUBSTITUTION`.
- [x] Require minute, type, team, and player when selected-team roster data exists.
- [x] Require player out for substitutions when selected-team roster data exists.
- [x] Submit draft events through the existing `SubmitMatchReportPayload.events` array.
- [x] Keep non-scoring events out of score calculation.

### Task 3: Update Copy And Documentation

- [x] Add Vietnamese and English labels for generic event rows.
- [x] Keep old goal-oriented locale keys mapped to generic event text where existing references may still use them.
- [x] Update the design spec to describe full event reporting.

### Task 4: Verify

- [x] `pnpm --filter web exec vitest run src/pages/__tests__/MatchDetailPage.test.tsx -t "referee match record|draft goal events|card events|substitutions|referee score"`
- [x] `pnpm --filter web exec tsc -b --pretty false`
- [x] `pnpm --filter web exec vitest run src/pages/__tests__/MatchDetailPage.test.tsx`

---

## Self-Review

- Spec coverage: full report event types, conditional fields, score-only scoring events, and substitution player in/out are covered.
- Placeholder scan: no deferred implementation placeholders remain.
- Type consistency: event payloads reuse `AddMatchEventPayload`, and score helpers reuse existing `MatchEvent`/`Match` semantics.

# Referee Match Report Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build one referee-facing `Nộp biên bản trận đấu` flow that records goal events, calculates the score, stores player-of-match/report fields, and leaves supervisor reporting separate.

**Architecture:** Add a focused `RefereeMatchReportPanel` component under the existing match-detail module. The component owns draft scoring events and report form state, calculates score from saved plus draft scoring events, then submits the current `apiSubmitMatchReport` payload through `MatchDetailPage`.

**Tech Stack:** React 19, TypeScript, Ant Design 6, react-i18next, Vitest, Testing Library.

---

## File Structure

- Create `apps/web/src/pages/match-detail/RefereeMatchReportPanel.tsx`
  - Owns the consolidated referee report UI and draft goal-event state.
- Create `apps/web/src/pages/match-detail/refereeMatchReportScore.ts`
  - Exports pure helpers for scoring-event semantics without mixing helper exports into a `.tsx` component.
- Modify `apps/web/src/pages/MatchDetailPage.tsx`
  - Removes report score/form state from the page.
  - Wires `RefereeMatchReportPanel` into the existing `Trọng tài & báo cáo` tab.
  - Keeps supervisor report rendering unchanged.
  - Hides standalone score/event buttons from referees by reserving those quick actions for admins.
- Modify `apps/web/src/locales/vi.ts` and `apps/web/src/locales/en.ts`
  - Adds labels for the consolidated report sections and updates the submit button copy.
- Modify `apps/web/src/pages/__tests__/MatchDetailPage.test.tsx`
  - Adds regression coverage for the consolidated report submission and supervisor separation.
- Modify `apps/web/vitest.setup.ts`
  - Keeps test i18n interpolation aligned with the app's `{value}` interpolation syntax.

---

### Task 1: Add Failing Match Detail Tests

**Files:**

- Modify: `apps/web/src/pages/__tests__/MatchDetailPage.test.tsx`

- [ ] **Step 1: Add a test for submitting a 0-0 consolidated match report**

Append this test inside the existing `describe('MatchDetailPage', () => { ... })` block:

```tsx
it('submits a zero-zero referee match record from the consolidated report panel', async () => {
  renderPage();

  await screen.findByText(/Chi tiết trận đấu/);
  await userEvent.click(screen.getByRole('tab', { name: /Trọng tài/ }));
  await screen.findByText('Biên bản trận đấu');

  await userEvent.click(screen.getByRole('button', { name: /Nộp biên bản trận đấu/ }));

  await waitFor(() => {
    expect(mockMatchApi.apiSubmitMatchReport).toHaveBeenCalledWith('m1', {
      homeScore: 0,
      awayScore: 0,
      bestPlayerId: 'h-player-1',
      technicalStats: undefined,
      note: undefined,
      events: [],
    });
  });
});
```

- [ ] **Step 2: Add a test for calculated score from a draft goal event**

Append this test after the 0-0 test:

```tsx
it('submits draft goal events and calculates the report score from them', async () => {
  renderPage();

  await screen.findByText(/Chi tiết trận đấu/);
  await userEvent.click(screen.getByRole('tab', { name: /Trọng tài/ }));
  await userEvent.click(screen.getByRole('button', { name: /Thêm bàn thắng/ }));

  const reportPanel = screen.getByTestId('referee-match-report-panel');
  fireEvent.change(within(reportPanel).getByLabelText('Phút bàn thắng 1'), {
    target: { value: '23' },
  });

  await userEvent.click(within(reportPanel).getByLabelText('Đội ghi bàn 1'));
  await userEvent.click(await screen.findByTitle('Ha Noi FC'));
  await userEvent.click(within(reportPanel).getByLabelText('Cầu thủ ghi bàn 1'));
  await userEvent.click(await screen.findByTitle('Home Player 1 #1'));

  await userEvent.click(screen.getByRole('button', { name: /Nộp biên bản trận đấu/ }));

  await waitFor(() => {
    expect(mockMatchApi.apiSubmitMatchReport).toHaveBeenCalledWith('m1', {
      homeScore: 1,
      awayScore: 0,
      bestPlayerId: 'h-player-1',
      technicalStats: undefined,
      note: undefined,
      events: [
        {
          minute: 23,
          type: 'GOAL',
          teamId: 'home-team',
          playerId: 'h-player-1',
          note: undefined,
        },
      ],
    });
  });
});
```

- [ ] **Step 3: Add a test that referees do not see separate quick score/event actions**

Append this test after the draft-goal test:

```tsx
it('keeps referee score and event entry inside the report flow', async () => {
  renderPage();

  await screen.findByText(/Chi tiết trận đấu/);

  expect(screen.queryByRole('button', { name: /Cập nhật tỉ số/ })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Thêm sự kiện/ })).not.toBeInTheDocument();

  await userEvent.click(screen.getByRole('tab', { name: /Trọng tài/ }));
  expect(screen.getByRole('button', { name: /Thêm bàn thắng/ })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Nộp biên bản trận đấu/ })).toBeInTheDocument();
});
```

- [ ] **Step 4: Run the targeted test and verify RED**

Run:

```bash
pnpm --filter web exec vitest run src/pages/__tests__/MatchDetailPage.test.tsx
```

Expected: fails because `Biên bản trận đấu`, `Thêm bàn thắng`, `Nộp biên bản trận đấu`, and `data-testid="referee-match-report-panel"` do not exist yet.

---

### Task 2: Add the Consolidated Report Component

**Files:**

- Create: `apps/web/src/pages/match-detail/RefereeMatchReportPanel.tsx`
- Create: `apps/web/src/pages/match-detail/refereeMatchReportScore.ts`
- Modify: `apps/web/src/pages/MatchDetailPage.tsx`

- [ ] **Step 1: Create `RefereeMatchReportPanel.tsx` with score helpers and UI**

Create the component with these exported helpers and props:

```tsx
export type ScoringEventType = 'GOAL' | 'PENALTY' | 'OWN_GOAL';

export function getScoringSide(
  event: Pick<AddMatchEventPayload, 'type' | 'teamId'>,
  match: Pick<Match, 'homeTeamId' | 'awayTeamId'>,
) {
  if ((event.type === 'GOAL' || event.type === 'PENALTY') && event.teamId === match.homeTeamId) {
    return 'home';
  }
  if ((event.type === 'GOAL' || event.type === 'PENALTY') && event.teamId === match.awayTeamId) {
    return 'away';
  }
  if (event.type === 'OWN_GOAL' && event.teamId === match.homeTeamId) return 'away';
  if (event.type === 'OWN_GOAL' && event.teamId === match.awayTeamId) return 'home';
  return null;
}

export function calculateReportScore(
  events: Array<Pick<AddMatchEventPayload, 'type' | 'teamId'>>,
  match: Pick<Match, 'homeTeamId' | 'awayTeamId'>,
) {
  return events.reduce(
    (score, event) => {
      const side = getScoringSide(event, match);
      if (side) score[side] += 1;
      return score;
    },
    { home: 0, away: 0 },
  );
}
```

The component should:

- Render `data-testid="referee-match-report-panel"`.
- Show saved scoring events from `match.events` as read-only.
- Keep draft goal events editable before submit.
- Calculate score from saved scoring events plus draft goal events.
- Submit only draft goal events in `events`.
- Submit `homeScore` and `awayScore` from the calculated score.
- Keep `bestPlayerId` optional.
- Parse `technicalStatsText` as a JSON object or return `undefined` when empty.

- [ ] **Step 2: Replace report form state in `MatchDetailPage.tsx`**

Remove page-level state and effects for:

```tsx
reportHomeScore;
reportAwayScore;
reportBestPlayerId;
reportNote;
technicalStatsText;
```

Change `handleSubmitMatchReport` to accept the component payload:

```tsx
const handleSubmitMatchReport = async (payload: SubmitMatchReportPayload) => {
  if (!match) return;
  setReportSubmitting(true);
  try {
    await apiSubmitMatchReport(match.id, payload);
    message.success('Đã nộp biên bản trận đấu.');
    fetchMatch();
  } catch (_err) {
    message.error('Không thể nộp biên bản trận đấu.');
  } finally {
    setReportSubmitting(false);
  }
};
```

- [ ] **Step 3: Wire the component into the officials tab**

Replace the existing referee report `<Card title={t('matchDetail.refereeReportTitle')}>...</Card>` block with:

```tsx
<RefereeMatchReportPanel
  match={match}
  matchReport={matchReport}
  homeRoster={homeRoster}
  awayRoster={awayRoster}
  canSubmit={Boolean(canSubmitMatchReport)}
  loading={officialLoading}
  submitting={reportSubmitting}
  onSubmit={handleSubmitMatchReport}
/>
```

- [ ] **Step 4: Restrict standalone score/event quick actions to admins**

Replace the existing `{canEdit && (...)}` admin action card condition with:

```tsx
{canAssignOfficials && (
```

Replace timeline event edit visibility from `canEdit` to `canAssignOfficials` so referees use the report panel for new report-time goal entry.

- [ ] **Step 5: Run the targeted test and verify GREEN**

Run:

```bash
pnpm --filter web exec vitest run src/pages/__tests__/MatchDetailPage.test.tsx
```

Expected: all `MatchDetailPage` tests pass.

---

### Task 3: Update Localized Copy

**Files:**

- Modify: `apps/web/src/locales/vi.ts`
- Modify: `apps/web/src/locales/en.ts`

- [ ] **Step 1: Update Vietnamese copy**

Set these `matchDetail` keys:

```ts
refereeReportTitle: 'Biên bản trận đấu',
submitRefereeReportBtn: 'Nộp biên bản trận đấu',
refereeReportReadonly: 'Chỉ BTC hoặc trọng tài đã được phân công được nộp biên bản.',
reportGoalsSection: 'Bàn thắng & tỉ số',
reportDetailsSection: 'Thông tin sau trận',
reportReviewSection: 'Kiểm tra & nộp',
reportCalculatedScore: 'Tỉ số tự tính: {home} - {away}',
reportSavedGoals: 'Bàn thắng đã lưu',
reportNoSavedGoals: 'Chưa có bàn thắng đã lưu.',
reportDraftGoals: 'Bàn thắng sẽ nộp',
reportAddGoal: 'Thêm bàn thắng',
reportRemoveGoal: 'Xóa bàn thắng {index}',
reportMinuteLabel: 'Phút bàn thắng {index}',
reportTypeLabel: 'Loại bàn thắng {index}',
reportTeamLabel: 'Đội ghi bàn {index}',
reportPlayerLabel: 'Cầu thủ ghi bàn {index}',
reportNoteLabel: 'Ghi chú bàn thắng {index}',
reportSummary: '{goals} bàn thắng mới sẽ được nộp cùng biên bản.',
reportInvalidGoal: 'Vui lòng nhập đủ phút, đội và cầu thủ ghi bàn.',
reportSubmitSuccess: 'Đã nộp biên bản trận đấu.',
reportSubmitError: 'Không thể nộp biên bản trận đấu.',
```

- [ ] **Step 2: Add matching English copy**

Add equivalent English keys under `matchDetail`:

```ts
refereeReportTitle: 'Match record',
submitRefereeReportBtn: 'Submit match record',
refereeReportReadonly: 'Only the organizer or an assigned referee can submit this match record.',
reportGoalsSection: 'Goals & score',
reportDetailsSection: 'Post-match details',
reportReviewSection: 'Review & submit',
reportCalculatedScore: 'Calculated score: {home} - {away}',
reportSavedGoals: 'Saved goals',
reportNoSavedGoals: 'No saved goals.',
reportDraftGoals: 'Goals to submit',
reportAddGoal: 'Add goal',
reportRemoveGoal: 'Remove goal {index}',
reportMinuteLabel: 'Goal minute {index}',
reportTypeLabel: 'Goal type {index}',
reportTeamLabel: 'Scoring team {index}',
reportPlayerLabel: 'Scorer {index}',
reportNoteLabel: 'Goal note {index}',
reportSummary: '{goals} new goals will be submitted with the match record.',
reportInvalidGoal: 'Enter minute, team, and scorer for every goal.',
reportSubmitSuccess: 'Match record submitted.',
reportSubmitError: 'Failed to submit match record.',
```

- [ ] **Step 3: Replace hardcoded submit messages in `MatchDetailPage.tsx`**

Use:

```tsx
message.success(t('matchDetail.reportSubmitSuccess'));
message.error(t('matchDetail.reportSubmitError'));
```

- [ ] **Step 4: Run the targeted test again**

Run:

```bash
pnpm --filter web exec vitest run src/pages/__tests__/MatchDetailPage.test.tsx
```

Expected: pass.

---

### Task 4: Focused Verification And Cleanup

**Files:**

- Modify only if needed: files changed in Tasks 1-3.

- [ ] **Step 1: Run typecheck for the web app**

Run:

```bash
pnpm --filter web exec tsc -b --pretty false
```

Expected: exit code 0.

- [ ] **Step 2: Run the web test suite**

Run:

```bash
pnpm --filter web test
```

Expected: all web tests pass with existing skipped tests unchanged.

- [ ] **Step 3: Inspect the diff**

Run:

```bash
git diff -- apps/web/src/pages/MatchDetailPage.tsx apps/web/src/pages/match-detail/RefereeMatchReportPanel.tsx apps/web/src/locales/vi.ts apps/web/src/locales/en.ts apps/web/src/pages/__tests__/MatchDetailPage.test.tsx
```

Expected:

- Referee report flow is consolidated.
- Supervisor report fields remain separate.
- No manual report score inputs remain in the referee report card.
- Standalone quick actions remain available to admins only.

- [ ] **Step 4: Commit the implementation**

Use a Lore-format commit message with the required OmX trailer:

```bash
git add apps/web/src/pages/MatchDetailPage.tsx apps/web/src/pages/match-detail/RefereeMatchReportPanel.tsx apps/web/src/locales/vi.ts apps/web/src/locales/en.ts apps/web/src/pages/__tests__/MatchDetailPage.test.tsx
git commit -m "Consolidate referee match report entry" -m "Constraint: Reuse the existing match report endpoint and keep supervisor reports separate.
Rejected: Add a new report endpoint | The current payload already supports score, events, player-of-match, stats, and notes.
Confidence: high
Scope-risk: moderate
Directive: Referees should record result goals through the match-record panel, while admins keep standalone correction controls.
Tested: pnpm --filter web exec vitest run src/pages/__tests__/MatchDetailPage.test.tsx; pnpm --filter web exec tsc -b --pretty false; pnpm --filter web test
Not-tested: Browser visual QA.

Co-authored-by: OmX <omx@oh-my-codex.dev>"
```

---

## Self-Review

- Spec coverage: the plan covers one referee report action, goal-event score calculation, optional player-of-match, current technical stats field, existing report API reuse, and supervisor separation.
- Placeholder scan: no `TBD`, `TODO`, or deferred implementation placeholders remain.
- Type consistency: `SubmitMatchReportPayload`, `AddMatchEventPayload`, `Match`, `MatchEvent`, `MatchReport`, and `RosterPlayer` are reused from `matchApi.ts`.

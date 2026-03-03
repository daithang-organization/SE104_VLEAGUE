---
name: React + Ant Design Frontend
description: Complete guide for the SE104_VLEAGUE React frontend — pages, services, components, auth flow, i18n, and patterns
---

# React + Ant Design Frontend Skill

## Tech Stack

| Category          | Package                         | Version   |
| ----------------- | ------------------------------- | --------- |
| UI Framework      | React                           | 19.x      |
| Component Library | Ant Design                      | 6.x       |
| Routing           | react-router-dom                | 7.x       |
| HTTP Client       | Axios                           | 1.x       |
| i18n              | i18next + react-i18next         | 25.x/16.x |
| Charts            | Recharts                        | 3.x       |
| Date              | dayjs                           | 1.x       |
| PDF Export        | jsPDF + jspdf-autotable         | 4.x/5.x   |
| Error Tracking    | @sentry/react                   | 10.x      |
| Build             | Vite                            | 7.x       |
| Test              | Vitest + @testing-library/react | 4.x/16.x  |
| TypeScript        |                                 | 5.9       |

## Project Structure

```
apps/web/src/
├── App.tsx                # Root routing (public + protected routes)
├── main.tsx               # Entry: Sentry, i18n, BrowserRouter, AuthProvider, ThemeProvider
├── auth/                  # AuthContext, RequireAuth, RequireRole, auth.types
├── components/            # Shared: ErrorBoundary, EventModal, ExportButton, ImageUpload, LoadingSkeleton, ScoreEditModal
├── lib/
│   ├── api.ts             # Axios instance with token refresh interceptor
│   └── i18n.ts            # i18next config (vi/en, localStorage detection)
├── locales/
│   ├── vi.ts              # Vietnamese translations (~1,244 lines)
│   └── en.ts              # English translations (~1,207 lines)
├── pages/                 # All page components (PascalCase)
│   ├── __tests__/         # Page component tests
│   ├── match-detail/      # MatchDetailPage sub-components
│   └── reports/           # ReportsPage tab sub-components
├── services/              # API service modules (camelCase)
│   └── __tests__/         # Service tests
├── shell/
│   ├── AppShell.tsx       # Protected layout (Sider + Header + Content)
│   ├── PublicLayout.tsx   # Public layout (gradient header + footer)
│   ├── ThemeContext.tsx    # Dark/light mode context
│   └── menu.ts            # Role-based menu items (12 items)
└── utils/
    └── constants.ts       # STATUS_MAP, EVENT_TYPE_MAP, POSITION_MAP, CAN_EDIT_ROLES
```

---

## All Pages & Routes

### Public (No Auth)

| Route                  | Component            | Load  | Description                            |
| ---------------------- | -------------------- | ----- | -------------------------------------- |
| `/login`               | `LoginPage`          | Eager | Email/password + Google/Facebook OAuth |
| `/register`            | `RegisterPage`       | Eager | Registration with password rules       |
| `/verify-email`        | `VerifyEmailPage`    | Lazy  | OTP email verification with resend     |
| `/forgot-password`     | `ForgotPasswordPage` | Lazy  | Request password reset OTP             |
| `/reset-password`      | `ResetPasswordPage`  | Lazy  | Reset password with OTP                |
| `/auth/oauth-callback` | `OAuthCallbackPage`  | Eager | OAuth redirect token processing        |
| `/403`                 | `ForbiddenPage`      | Eager | Access denied                          |
| `*`                    | `NotFoundPage`       | Lazy  | 404 fallback                           |

### Public Layout (`PublicLayout`)

| Route               | Component             | Description                 |
| ------------------- | --------------------- | --------------------------- |
| `/public/standings` | `PublicStandingsPage` | League table (no auth)      |
| `/public/schedule`  | `PublicSchedulePage`  | Schedule by round (no auth) |
| `/public/results`   | `PublicResultsPage`   | Finished results (no auth)  |

### Protected (`RequireAuth` + `AppShell`)

| Route              | Component            | Roles         | Description                                                               |
| ------------------ | -------------------- | ------------- | ------------------------------------------------------------------------- |
| `/`                | `DashboardPage`      | All           | Stats cards, mini standings, upcoming/recent matches, season progress     |
| `/teams`           | `TeamsPage`          | All           | CRUD team list with search, logo, stadium link                            |
| `/teams/:id`       | `TeamDetailPage`     | All           | Team info, roster, match history, standings                               |
| `/players`         | `PlayersPage`        | All           | CRUD player list, pagination, filters, CSV import                         |
| `/players/:id`     | `PlayerDetailPage`   | All           | Bio, stats (goals/cards), event timeline, goals-by-round chart            |
| `/stadiums`        | `StadiumsPage`       | ADMIN (guard) | CRUD stadium list — wrapped in `RequireRole`                              |
| `/stadiums/:id`    | `StadiumDetailPage`  | ADMIN (guard) | Stadium info, home teams, match history — wrapped in `RequireRole`        |
| `/schedule`        | `SchedulePage`       | All           | Generate/publish schedule, edit match details, grouped by round           |
| `/seasons`         | `SeasonsPage`        | ADMIN (guard) | CRUD seasons, team registration panel — wrapped in `RequireRole`          |
| `/matches`         | `MatchesPage`        | All           | Match list by round, detail modal, score edit, events, status transitions |
| `/matches/:id`     | `MatchDetailPage`    | All           | Scoreboard, events timeline, roster tabs, stat cards                      |
| `/standings`       | `StandingsPage`      | All           | Full standings with AFC CL/relegation highlights, top scorers, CSV export |
| `/head-to-head`    | `HeadToHeadPage`     | All           | Compare two teams — wins/draws/goals + match history                      |
| `/regulations`     | `RegulationsPage`    | ADMIN (guard) | CRUD regulations per season, seed defaults — wrapped in `RequireRole`     |
| `/reports`         | `ReportsPage`        | All           | Tabs: Top Scorers, Card Stats, Team Stats, Charts — PDF/CSV export        |
| `/users`           | `UsersPage`          | ADMIN (guard) | User management (create/role/delete) — wrapped in `RequireRole`           |
| `/profile`         | `ProfilePage`        | All           | View/edit profile, logout all                                             |
| `/change-password` | `ChangePasswordPage` | All           | Change password form                                                      |
| `/sessions`        | `SessionsPage`       | All           | Active sessions, revoke individual/all                                    |

---

## All Services & API Methods

### authApi.ts (17 functions)

| Function             | Method | Endpoint                     |
| -------------------- | ------ | ---------------------------- |
| `apiLogin`           | POST   | `/auth/login`                |
| `apiRefresh`         | POST   | `/auth/refresh`              |
| `apiLogout`          | POST   | `/auth/logout`               |
| `apiRegister`        | POST   | `/auth/register`             |
| `apiVerifyEmail`     | POST   | `/auth/verify-email`         |
| `apiResendOtp`       | POST   | `/auth/resend-otp`           |
| `apiForgotPassword`  | POST   | `/auth/forgot-password`      |
| `apiResetPassword`   | POST   | `/auth/reset-password`       |
| `apiGetMe`           | GET    | `/auth/me`                   |
| `apiChangePassword`  | POST   | `/auth/change-password`      |
| `apiLogoutAll`       | POST   | `/auth/logout-all`           |
| `apiUpdateProfile`   | PATCH  | `/auth/profile`              |
| `apiGetSessions`     | GET    | `/auth/sessions`             |
| `apiRevokeSession`   | DELETE | `/auth/sessions/:id`         |
| `apiSetPassword`     | POST   | `/auth/set-password`         |
| `getGoogleAuthUrl`   | —      | Returns `/auth/google` URL   |
| `getFacebookAuthUrl` | —      | Returns `/auth/facebook` URL |

### teamApi.ts

| Function         | Method | Endpoint                          |
| ---------------- | ------ | --------------------------------- |
| `apiGetTeams`    | GET    | `/teams?page&limit&search&status` |
| `apiGetTeam`     | GET    | `/teams/:id`                      |
| `apiCreateTeam`  | POST   | `/teams`                          |
| `apiUpdateTeam`  | PATCH  | `/teams/:id`                      |
| `apiDeleteTeam`  | DELETE | `/teams/:id`                      |
| `apiGetStadiums` | GET    | `/stadiums`                       |

### playerApi.ts

| Function              | Method | Endpoint                                                 |
| --------------------- | ------ | -------------------------------------------------------- |
| `apiGetPlayers`       | GET    | `/players?page&limit&search&position&nationality&teamId` |
| `apiGetPlayer`        | GET    | `/players/:id`                                           |
| `apiCreatePlayer`     | POST   | `/players`                                               |
| `apiUpdatePlayer`     | PATCH  | `/players/:id`                                           |
| `apiDeletePlayer`     | DELETE | `/players/:id`                                           |
| `apiImportPlayersCsv` | POST   | `/players/import` (multipart FormData)                   |

### stadiumApi.ts

| Function           | Method | Endpoint        |
| ------------------ | ------ | --------------- |
| `apiGetStadiums`   | GET    | `/stadiums`     |
| `apiGetStadium`    | GET    | `/stadiums/:id` |
| `apiCreateStadium` | POST   | `/stadiums`     |
| `apiUpdateStadium` | PATCH  | `/stadiums/:id` |
| `apiDeleteStadium` | DELETE | `/stadiums/:id` |

### seasonApi.ts

| Function                | Method | Endpoint              |
| ----------------------- | ------ | --------------------- |
| `apiGetSeasons`         | GET    | `/seasons`            |
| `apiGetSeason`          | GET    | `/seasons/:id`        |
| `apiGetCurrentSeason`   | GET    | `/seasons/current`    |
| `apiCreateSeason`       | POST   | `/seasons`            |
| `apiUpdateSeason`       | PATCH  | `/seasons/:id`        |
| `apiDeleteSeason`       | DELETE | `/seasons/:id`        |
| `apiUpdateSeasonStatus` | PATCH  | `/seasons/:id/status` |

### seasonTeamApi.ts

| Function                    | Method | Endpoint                                  |
| --------------------------- | ------ | ----------------------------------------- |
| `apiGetSeasonTeams`         | GET    | `/seasons/:seasonId/teams`                |
| `apiRegisterTeam`           | POST   | `/seasons/:seasonId/teams`                |
| `apiUpdateSeasonTeamStatus` | PATCH  | `/seasons/:seasonId/teams/:teamId/status` |
| `apiRemoveSeasonTeam`       | DELETE | `/seasons/:seasonId/teams/:teamId`        |

### matchApi.ts

| Function               | Method | Endpoint                       |
| ---------------------- | ------ | ------------------------------ |
| `apiGetMatches`        | GET    | `/matches?seasonId&page&limit` |
| `apiGetMatch`          | GET    | `/matches/:id`                 |
| `apiAddMatchEvent`     | POST   | `/matches/:id/events`          |
| `apiRemoveMatchEvent`  | DELETE | `/matches/:id/events/:eventId` |
| `apiGetTeamRoster`     | GET    | `/teams/:id/roster`            |
| `apiUpdateMatch`       | PATCH  | `/matches/:id`                 |
| `apiUpdateMatchStatus` | PATCH  | `/matches/:id/status`          |

### scheduleApi.ts

| Function              | Method | Endpoint                      |
| --------------------- | ------ | ----------------------------- |
| `apiGetSchedule`      | GET    | `/schedule?seasonId`          |
| `apiGenerateSchedule` | POST   | `/schedule/generate?seasonId` |
| `apiPublishSchedule`  | POST   | `/schedule/publish?seasonId`  |

### standingsApi.ts

| Function           | Method | Endpoint                                |
| ------------------ | ------ | --------------------------------------- |
| `apiGetStandings`  | GET    | `/standings?seasonId`                   |
| `apiGetTopScorers` | GET    | `/standings/top-scorers?seasonId&limit` |
| `apiGetCardStats`  | GET    | `/standings/card-stats?seasonId&limit`  |
| `apiGetTeamStats`  | GET    | `/standings/team-stats?seasonId`        |

### searchApi.ts

| Function            | Method | Endpoint                                       |
| ------------------- | ------ | ---------------------------------------------- |
| `apiGlobalSearch`   | GET    | `/search?q&limit`                              |
| `apiGetHeadToHead`  | GET    | `/standings/head-to-head?team1&team2&seasonId` |
| `apiGetPlayerStats` | GET    | `/standings/player-stats/:playerId?seasonId`   |

### regulationApi.ts

| Function                    | Method | Endpoint                                 |
| --------------------------- | ------ | ---------------------------------------- |
| `apiGetRegulations`         | GET    | `/seasons/:id/regulations`               |
| `apiGetRegulation`          | GET    | `/seasons/:id/regulations/:key`          |
| `apiUpsertRegulation`       | PUT    | `/seasons/:id/regulations`               |
| `apiDeleteRegulation`       | DELETE | `/seasons/:id/regulations/:key`          |
| `apiSeedDefaultRegulations` | POST   | `/seasons/:id/regulations/seed-defaults` |

### userApi.ts

| Function            | Method | Endpoint          |
| ------------------- | ------ | ----------------- |
| `apiGetUsers`       | GET    | `/users`          |
| `apiCreateUser`     | POST   | `/users`          |
| `apiUpdateUserRole` | PATCH  | `/users/:id/role` |
| `apiDeleteUser`     | DELETE | `/users/:id`      |

### uploadApi.ts

| Function         | Method | Endpoint                             |
| ---------------- | ------ | ------------------------------------ |
| `apiUploadImage` | POST   | `/upload/image` (multipart FormData) |

### http.ts (LEGACY — not used)

`fetch`-based HTTP client. All active services import from `lib/api.ts` (Axios) instead.

---

## Shared Components (`src/components/`)

| Component         | Purpose                                                                                              |
| ----------------- | ---------------------------------------------------------------------------------------------------- |
| `ErrorBoundary`   | Class component catching runtime errors → Ant Design `Result`, reports to Sentry, shows stack in dev |
| `EventModal`      | Dynamic form for adding multiple match events at once (goal, card, sub) with team/player selectors   |
| `ExportButton`    | CSV export button with UTF-8 BOM for Excel Vietnamese compatibility                                  |
| `ImageUpload`     | Ant Design `Upload` wrapper for `/upload/image`, form-compatible (`value`/`onChange`)                |
| `LoadingSkeleton` | Variants: `CardSkeleton`, `TableSkeleton`, `FormSkeleton`, `ProfileSkeleton`, `ListSkeleton`         |
| `ScoreEditModal`  | Modal for editing home/away score with `InputNumber`                                                 |

### Page Sub-Components

| Location              | Components                                                                       |
| --------------------- | -------------------------------------------------------------------------------- |
| `pages/reports/`      | `TopScorersTab`, `CardStatsTab`, `TeamStatsTab`, `ChartsTab`                     |
| `pages/match-detail/` | `EventFormModal`, `ScoreModal`, `constants.ts` (match-detail specific constants) |

---

## Auth Flow

### Types (`auth/auth.types.ts`)

```typescript
User { id, email, role, name? }
AuthState { user, accessToken, isAuthed }
AuthContextValue = AuthState & { login, logout, applyOAuthTokens }
```

### AuthContext (`auth/AuthContext.tsx`)

- **Access token**: in-memory only (NEVER in localStorage)
- **Refresh token**: in `localStorage` for persistence
- **Bootstrap**: On mount → silent refresh via `/auth/refresh` → decode JWT for `User`
- **Login**: POST `/auth/login` → stores both tokens
- **OAuth**: `applyOAuthTokens(at, rt)` → decode JWT → set user
- **Logout**: POST `/auth/logout` → clears both tokens
- **Session expiry**: Listens for `auth:expired` custom event

### Token Refresh (`lib/api.ts`)

- Axios response interceptor on 401 → attempts refresh using stored RT
- Queues concurrent failing requests during refresh (only one refresh runs at a time)
- Dispatches `auth:expired` custom event when refresh fails
- Also handles 429 → dispatches `api:rate-limited` custom event

### Route Guards

- **`RequireAuth`**: Redirects to `/login` if `!isAuthed`, preserves intended URL in `location.state`
- **`RequireRole`**: Checks `user.role` against `allow[]` array, redirects to `/403`

### Roles

`ADMIN` | `TEAM_MANAGER` | `REFEREE` | `SUPERVISOR` | `PUBLIC`

---

## Shell / Layout

### AppShell (`shell/AppShell.tsx`) — Protected

- Ant Design `Layout` with collapsible `Sider` + `Header` + `Content`
- **Sidebar**: Dynamic menu filtered by user role (from `menu.ts`)
- **Header**: Global search (debounced 300ms autocomplete via `/search`), dark mode toggle, language toggle (VI/EN), user dropdown (profile, change password, logout)
- `<Outlet />` renders child routes

### PublicLayout (`shell/PublicLayout.tsx`)

- Gradient header with V-League branding
- Horizontal menu: Standings, Schedule, Results
- Login button
- Footer with copyright

### ThemeContext (`shell/ThemeContext.tsx`)

- Light/dark mode toggle via React Context
- Persisted to `localStorage` key `vleague-theme`
- Returns `theme.darkAlgorithm` or `theme.defaultAlgorithm` for Ant Design

### Menu (`shell/menu.ts`) — 12 items

| Menu Item                                   | Roles                                            |
| ------------------------------------------- | ------------------------------------------------ |
| Dashboard, Standings, Head-to-Head, Reports | All                                              |
| Seasons, Stadiums, Regulations, Users       | ADMIN only                                       |
| Teams, Players                              | ADMIN, TEAM_MANAGER, SUPERVISOR, PUBLIC          |
| Schedule, Matches                           | ADMIN, TEAM_MANAGER, REFEREE, SUPERVISOR, PUBLIC |

---

## i18n Setup

### Configuration (`lib/i18n.ts`)

- **Languages**: Vietnamese (`vi`, fallback) and English (`en`)
- **Detection**: `localStorage` key `vleague-lang` → browser navigator
- **Plugin**: `i18next-browser-languagedetector`

### Translation Files

- `locales/vi.ts` — ~1,244 lines, comprehensive Vietnamese catalog
- `locales/en.ts` — ~1,207 lines, English mirror

### Namespace Convention

`dashboard.*`, `matches.*`, `teams.*`, `players.*`, `seasons.*`, `schedule.*`, `standings.*`, `stadiums.*`, `users.*`, `profile.*`, `sessions.*`, `regulations.*`, `reports.*`, `headToHead.*`, `login.*`, `register.*`, `forgotPassword.*`, `resetPassword.*`, `changePassword.*`, `verifyEmail.*`, `teamDetail.*`, `playerDetail.*`, `stadiumDetail.*`, `forbidden.*`, `oauth.*`

---

## TypeScript Types

### Domain Types (co-located in service files)

| Type                   | Key Fields                                                                                                                                           |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Team`                 | id, name, shortName?, logoUrl?, city?, status, stadiumId?, stadium?                                                                                  |
| `TeamDetail`           | extends Team + teamPlayers[], homeMatches[], awayMatches[], standings[]                                                                              |
| `Player`               | id, fullName, dob, nationality, position, playerType, birthPlace?, heightCm?, weightKg?, teamPlayers?                                                |
| `Stadium`              | id, name, address?, city, capacity?                                                                                                                  |
| `StadiumDetail`        | extends Stadium + teams[], matches[]                                                                                                                 |
| `Season`               | id, name, year, status, startDate?, endDate?                                                                                                         |
| `SeasonTeam`           | id, seasonId, teamId, status, registeredAt, approvedAt, team                                                                                         |
| `Match`                | id, roundNo, leg, seasonId?, homeTeamId, awayTeamId, homeTeam?, awayTeam?, homeScore?, awayScore?, stadiumId?, stadium?, kickoffAt?, status, events? |
| `MatchEvent`           | id, minute, type, goalType?, playerId?, player?, teamId?, team?, relatedPlayerId?, relatedPlayer?, note?                                             |
| `TeamStanding`         | position, teamId, teamName, played, won, drawn, lost, goalsFor, goalsAgainst, goalDifference, points                                                 |
| `TopScorer`            | position, playerId, playerName, teamId, teamName, goals                                                                                              |
| `CardStat`             | position, playerId, playerName, teamId, teamName, yellowCards, redCards, totalCards                                                                  |
| `TeamStat`             | extends standings + cleanSheets, yellowCards, redCards                                                                                               |
| `HeadToHeadResult`     | team comparison data                                                                                                                                 |
| `PlayerStats`          | goals, assists, cards, goals-by-round                                                                                                                |
| `Regulation`           | id, seasonId, key, value, valueType                                                                                                                  |
| `User`                 | id, email, name?, role, emailVerified, avatarUrl?, googleId?, facebookId?                                                                            |
| `Session`              | id, deviceName, userAgent, ipAddress, lastUsedAt, createdAt, expiresAt                                                                               |
| `PaginatedResponse<T>` | data[], total, page, limit, totalPages                                                                                                               |

### Enums (string unions)

- **Position**: `'GK' | 'DF' | 'MF' | 'FW'`
- **PlayerType**: `'DOMESTIC' | 'FOREIGN'`
- **MatchStatus**: `'DRAFT' | 'PUBLISHED' | 'LOCKED' | 'FINISHED' | 'POSTPONED'`
- **SeasonStatus**: `'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED'`
- **SeasonTeamStatus**: `'REGISTERED' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN'`
- **EventType**: `'GOAL' | 'OWN_GOAL' | 'PENALTY' | 'PENALTY_MISS' | 'YELLOW_CARD' | 'RED_CARD' | 'SUBSTITUTION'`
- **UserRole**: `'ADMIN' | 'TEAM_MANAGER' | 'REFEREE' | 'SUPERVISOR' | 'PUBLIC'`
- **ThemeMode**: `'light' | 'dark'`

---

## State Management Patterns

**No Redux/Zustand** — pure React patterns:

- **`AuthContext`**: Global auth state (React Context + `useState`)
- **`ThemeContext`**: Dark/light mode (React Context + `useState`)
- **Per-page local state**: `useState` + `useEffect` for data fetching
- **`useCallback`**: Memoized fetch functions
- **`useMemo`**: Derived data (filtered lists, role checks, menu items)
- **`Promise.allSettled`**: Parallel API calls on Dashboard and Reports
- **`useRef`**: Debounce timers (global search), prevent duplicate processing (OAuth)
- **Custom events**: `auth:expired`, `api:rate-limited` for cross-cutting concerns

---

## Environment Variables

| Variable            | Usage                                                  |
| ------------------- | ------------------------------------------------------ |
| `VITE_API_BASE_URL` | Backend API URL (default: `http://localhost:8080/api`) |
| `VITE_SENTRY_DSN`   | Sentry DSN (optional, no-op when unset)                |
| `VITE_APP_VERSION`  | Sentry release tag                                     |

---

## Utility Constants (`utils/constants.ts`)

| Constant            | Content                                            |
| ------------------- | -------------------------------------------------- |
| `STATUS_MAP`        | Match statuses → `{ label, color }` (admin labels) |
| `PUBLIC_STATUS_MAP` | Match statuses → user-friendly labels              |
| `EVENT_TYPE_MAP`    | Event types → `{ label, color, icon }`             |
| `POSITION_MAP`      | `GK/DF/MF/FW` → `{ label, color }`                 |
| `CAN_EDIT_ROLES`    | `['ADMIN', 'REFEREE']`                             |

---

## Notable Patterns

1. **Lazy loading**: All protected pages + layouts are `React.lazy()`. Auth pages eager for fast first paint
2. **Dual HTTP clients**: `lib/api.ts` (Axios, primary) + `services/http.ts` (fetch, legacy/unused)
3. **Token refresh queue**: Concurrent 401s queued; only one refresh runs at a time
4. **PDF export**: Dynamic `import('jspdf')` to avoid bundling unless needed
5. **CSV export**: `ExportButton` component + `csvExport.ts` utility (UTF-8 BOM for Excel)
6. **Player CSV import**: `apiImportPlayersCsv` sends FormData; `downloadPlayerCsvTemplate()` for template
7. **Match status FSM**: `DRAFT → PUBLISHED → LOCKED → FINISHED` (with POSTPONED side-paths)
8. **Standings highlighting**: AFC Champions League zone (green) + relegation zone (red) via CSS classes
9. **Session management**: View active sessions, revoke individual/all
10. **OAuth flow**: Server redirect → `/auth/oauth-callback?accessToken=&refreshToken=`
11. **Global search**: Debounced 300ms autocomplete in AppShell header
12. **Recharts**: Bar charts (goals by round, team points), Pie chart (goal distribution)
13. **Sentry**: Browser tracing + session replay (100% dev / 20% prod)

---

## Testing Conventions

- **10 page test suites, 13 service test suites, 2 auth test suites**
- Page tests: `src/pages/__tests__/*.test.tsx`
- Service tests: `src/services/__tests__/*.test.ts`
- Auth tests: `src/auth/AuthContext.test.tsx`, `RequireAuth.test.tsx`
- **Always use `vi.hoisted()`** for mock variables inside `vi.mock()`
- Mock `../../lib/api` for service tests
- Mock individual service files + `react-router-dom` for page tests
- Use `getAllByText()` instead of `getByText()` for Ant Design duplicate text
- Import from `__tests__/` goes up one level: `../ComponentName`

### Polyfills (`vitest.setup.ts`)

- `@testing-library/jest-dom/vitest` for custom matchers
- i18n initialized with Vietnamese, no language detector
- `ResizeObserver` polyfill (Ant Design Tabs/Collapse)
- `window.matchMedia` polyfill (Ant Design responsive)

---

## Common Commands

```bash
cd apps/web
pnpm dev                     # Start dev server (port 5173)
pnpm build                   # Production build
pnpm preview                 # Preview production build
pnpm test                    # Vitest (25 suites)
pnpm exec vitest             # Watch mode
pnpm lint                    # ESLint
```

# Design

## Source of truth

- Status: Active
- Last refreshed: 2026-05-27
- Primary product surfaces: React/Vite VLeague web app, authenticated admin shell, public standings/schedule/results pages.
- Evidence reviewed: `apps/web/src/index.css`, `apps/web/src/shell/ThemeContext.tsx`, `apps/web/index.html`, `apps/web/README.md`.

## Brand

- Personality: Professional, sporty, clear, and operational.
- Trust signals: Stable table layouts, strong contrast, consistent V.League red accent, recognizable club colors/logos.
- Avoid: Decorative marketing layouts, low-density dashboards, hard-to-read display fonts, and text overlap.

## Product goals

- Goals: Help league staff manage teams, players, matches, standings, regulations, users, and reports efficiently.
- Non-goals: Public marketing site, editorial storytelling, or heavy visual experimentation.
- Success signals: Fast scanning, readable Vietnamese content, clear hierarchy, and predictable Ant Design interactions.

## Personas and jobs

- Primary personas: Admins, league operators, team managers, referees, and public viewers.
- User jobs: Review status, enter or verify data, inspect standings and schedules, export reports, and manage access.
- Key contexts of use: Desktop admin workflows first, with responsive support for public and lightweight mobile access.

## Information architecture

- Primary navigation: Sidebar menu for authenticated app areas; public layout for public tables and schedules.
- Core routes/screens: Dashboard, teams, players, seasons, stadiums, schedule, matches, standings, regulations, reports, users, profile.
- Content hierarchy: Page title, filter/actions, table or card body, detail/edit states.

## Design principles

- Principle 1: Keep operational screens dense but calm.
- Principle 2: Use typography and spacing to make tables, stats, and team names easy to scan.
- Tradeoffs: Favor practical readability over decorative sports styling.

## Visual language

- Color: Light neutral surfaces with V.League red primary accents and club-themed secondary accents.
- Typography: `Be Vietnam Pro` is the primary UI font, with `Inter`, Segoe UI, and system fonts as fallbacks. It is selected for Vietnamese readability and a cleaner dashboard tone.
- Spacing/layout rhythm: Ant Design spacing plus custom 8px-radius panels and cards.
- Shape/radius/elevation: 8px radius, restrained borders, minimal elevation.
- Motion: Keep motion functional and subtle.
- Imagery/iconography: Reuse club logos and Ant Design icons; avoid unrelated illustration.

## Components

- Existing components to reuse: Ant Design layout, menu, tables, cards, buttons, typography, forms, modals, tags, and custom upload/export/loading components.
- New/changed components: Typography tokens only for this refresh.
- Variants and states: Preserve existing light/dark theme behavior.
- Token/component ownership: `ThemeContext.tsx` owns Ant Design theme tokens; `index.css` owns global CSS variables and base element font inheritance.

## Accessibility

- Target standard: Practical WCAG AA readability for core workflows.
- Keyboard/focus behavior: Preserve Ant Design defaults unless a component needs explicit handling.
- Contrast/readability: Keep text contrast high in both light and dark themes; use font fallbacks that support Vietnamese diacritics.
- Screen-reader semantics: Prefer semantic Ant Design components and native controls.
- Reduced motion and sensory considerations: Avoid unnecessary motion.

## Responsive behavior

- Supported breakpoints/devices: Desktop-first admin screens with mobile adaptations already present in CSS.
- Layout adaptations: Maintain existing responsive grids and table behavior.
- Touch/hover differences: Controls should remain usable without hover-only affordances.

## Interaction states

- Loading: Use existing loading skeletons/spinners.
- Empty: Use existing empty table/card states.
- Error: Use existing error boundary and API error states.
- Success: Use existing Ant Design feedback patterns.
- Disabled: Preserve Ant Design disabled styling.
- Offline/slow network, if applicable: No dedicated offline mode documented.

## Content voice

- Tone: Clear, concise Vietnamese-first operational language.
- Terminology: Use football and league-management terms consistently.
- Microcopy rules: Prefer action-oriented labels and avoid explanatory UI text when controls are self-evident.

## Implementation constraints

- Framework/styling system: React 19, Vite, TypeScript, Ant Design v6, global CSS.
- Design-token constraints: Font decisions must be applied through both Ant Design tokens and `index.css`.
- Performance constraints: Use `font-display=swap` and keep font loading to one family.
- Compatibility constraints: External font load should fall back cleanly to local/system fonts.
- Test/screenshot expectations: Build or lint after token/CSS changes; visual smoke check when running the app locally.

## Open questions

- [ ] Confirm whether production should self-host web fonts instead of loading from Google Fonts / owner: product-engineering / impact: privacy, offline reliability, and CSP.

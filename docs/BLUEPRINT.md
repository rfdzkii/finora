# FINORA technical blueprint

## Product boundary

FINORA is an English-language, IDR-first personal-finance application. Financial records start empty. All production statistics derive from persisted records. This foundation release intentionally exposes only implemented routes; the remaining product modules are tracked below rather than represented by dead navigation.

## Layers

1. Presentation: reusable layout, form, table, dialog, statistic, and chart components.
2. Page composition: each section assembles components and derives filtered views.
3. State integration: useFinance loads once, coordinates commits, subscribes to storage changes, and exposes failures.
4. Domain commands: immutable transaction and category mutations, separate from confirmation UX.
5. Validation and calculation: pure domain functions, safe integer arithmetic, calendar dates, backup schema validation.
6. Persistence: DataRepository contract, LocalStorageRepository, and MemoryRepository for tests.

LocalStorage is selected for the first batch because the state is small and synchronous. The repository seam keeps browser storage calls out of components. For larger datasets and transactional cross-tab updates, replace it with IndexedDB and convert the repository contract to promises.

## Dependencies

- React and React DOM: rendering and component state.
- TypeScript: strict contracts and static checking.
- Vite and its React plugin: development server and production bundling.
- Tailwind CSS and @tailwindcss/vite: utility framework and Vite integration, with a shared CSS component layer.
- Lucide React: consistent SVG icon components.
- Recharts and react-is: financial charts and React element compatibility support. Keep the installed React and react-is versions aligned.
- Vitest: pure-domain and persistence tests.
- Node type declarations: test-runner assert imports.

No router, state-management library, date library, form library, or schema library is introduced in this batch. Hash routes work on static hosting without server rewrites. Future pages should extend the central route union and navigation registry.

## Roadmap

### Stage 1: planning

Define scope, entities, money/date conventions, repository boundary, design system, validation policy, and verification criteria. Delivered in this batch.

### Stage 2: setup

Create Vite/React/TypeScript configuration, Tailwind integration, package manifest, commands, ignore rules, and directories. Delivered as source; dependency installation and production compilation are blocked here.

### Stage 3: UI foundation

Create navy/emerald design tokens, sidebar, mobile drawer, cards, native dialogs, empty/error/loading states, and responsive dashboard shell. Implemented; browser QA pending.

### Stage 4: core

Implement transactions, persistence, predefined categories, custom category services, calculations, CSV export, and business assertions. Implemented except custom category-management UI.

### Stage 5: advanced

Build monthly/category budget CRUD, threshold warnings, goal CRUD, financial trend analytics, report summaries, Settings, theme switching, backup download/import, and destructive reset. Domain models and validation exist; feature pages do not yet exist.

### Stage 6: quality

Run the standard test suite, strict type check, production build, browser smoke tests, persistence/reload checks, keyboard-only tests, responsive checks, and dependency audit. Only transpilation and alternative business-test execution are verified here.

### Stage 7: release

Finish README/deployment instructions, release notes, screenshots based on explicitly labeled demonstration data, final limitations, and lockfile. No deployment or portfolio-readiness claim before build and browser QA pass.

## Future page contracts

- Budgets: one total plus multiple category budgets per month; calculations always use that budget's month; warning at 80%, exceeded at 100%.
- Analytics: user date range; month buckets; prior equal-period comparison; handle a zero prior total with 'No prior data', not an infinite change percentage.
- Savings Goals: editable target/name/date/description and non-negative manual saved amount; completion determined by saved >= target.
- Reports: selected month totals, category distribution, record counts, and CSV generated from the same filtered records.
- Settings: profile name, initial balance, IDR symbol/code display, dark/light/system theme; JSON backup export and size/schema-validated import with replacement confirmation; reset with explicit warning.
- Category manager: custom names editable, type immutable, predefined names protected, used categories reassigned before deletion; reject conflicting budget slots unless the user resolves them.

## Integrity and technical risks

- LocalStorage is neither encrypted nor a backup service. Clearly communicate browser-local scope.
- Two-tab writes can race despite revision checks; one active editing tab until a transactional adapter is available.
- Imported snapshots must be validated in full before one committed replacement. Never evaluate imported text.
- Use safe integer rupiah. Aggregate overflow must fail, never silently round.
- Compare date-only fields lexicographically after validation. Do not parse them as local instants.
- Full snapshot writes and full integrity checks are linear in record count; pagination limits rendering, not storage cost.
- Default state contains zero financial records; empty charts must stay empty until real transactions exist.
- Confirmation belongs in the UI; pure commands must stay testable without browser prompts.
- Display IDs/descriptions as React text; do not use dangerouslySetInnerHTML.
- A render boundary handles unexpected UI errors without claiming data was saved.
- Package resolution, lockfile, security review, and actual browser rendering remain release gates.

## Acceptance checklist

- Create, edit, inspect, search, filter, sort, delete, reload, and export transactions.
- Confirm editing preserves record ID and creation timestamp.
- Confirm refresh preserves records and all visible totals match recomputed data.
- Check 79%, 80%, 99%, 100%, and over-budget indicators after budget UI exists.
- Check goal progress at zero, partial, complete, and above target.
- Import valid/invalid/oversized backups; cancel confirmations; confirm failed imports preserve existing state.
- Navigate every final section on desktop, tablet, and mobile.
- Verify dialog focus behavior, Escape, field labels, chart text alternatives, and reduced motion.
- Pass npm test, npm run typecheck, npm run build, and browser tests before release.

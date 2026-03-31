# Working Notes — Sleep Habits Survey

> **Internal document. Not public-facing. Do not commit sensitive credentials here.
> Update this file at the end of every development session.**

---

## How To Use This File (For AI Assistants)

1. **Read this entire file before writing a single line of code.** It contains decisions that have already been made and must not be relitigated.
2. **Read `README.md` for public-facing context** — setup steps, tech stack overview, and deployment instructions live there.
3. **Do not change the folder structure or file naming conventions** without explicit discussion with the developer first.
4. **Follow all conventions in the "Conventions" section exactly.** Do not introduce Tailwind utility classes, shadcn/ui components, react-router-dom, or any other library listed in "What Was Tried and Rejected."
5. **Do not suggest anything listed under "What Was Tried and Rejected."** Those choices were deliberate.
6. **Ask before making any large structural change** — extracting a shared hook, splitting a page component into sub-components, adding a new dependency, or changing the build pipeline.
7. **This project is AI-assisted.** Refactor conservatively. Prefer targeted edits over rewrites. The existing code is intentionally simple.

---

## Current State

**Last Updated:** 2026-03-30

The app is a complete, functional single-page survey application. All three pages (Home, Survey, Results) are implemented and styled. The CI/CD pipeline to Azure Static Web Apps is configured. The Supabase database table has **not yet been created** in the live Supabase project — survey submissions will fail until the user runs the SQL in `SUPABASE_SETUP.md`.

### What Is Working

- [x] Home page (`/`) with "Take the Survey" and "View Results" CTA buttons
- [x] Survey page (`/survey`) with all four questions, inline validation, and thank-you screen
- [x] Results page (`/results`) with three Recharts bar charts
- [x] Client-side routing via wouter (`/`, `/survey`, `/results`, 404 fallback)
- [x] Supabase JS client initialised with env-injected credentials
- [x] Custom CSS design system using `#8A3BDB` accent, CSS variables, responsive layout
- [x] `staticwebapp.config.json` SPA routing fallback for Azure
- [x] GitHub Actions workflow — builds with pnpm 10, deploys to Azure on push to `main`
- [x] `SUPABASE_SETUP.md` with full SQL (table + RLS policies)
- [x] MIT `LICENSE` file and `README.md` at project root

### What Is Partially Built

- [ ] **Supabase table** — SQL is documented in `SUPABASE_SETUP.md` but must be run manually in the Supabase SQL Editor; submissions are blocked until this is done
- [ ] **Azure deployment** — pipeline is configured but has not been run against a real Azure Static Web App resource; three GitHub Actions secrets need to be added

### What Is Not Started

- [ ] CSV export of results
- [ ] Password-protected Results page
- [ ] Additional demographic survey questions (class year, major)
- [ ] Time-series trend chart on Results page

---

## Current Task

The developer was verifying deployment readiness for Azure Static Web Apps. The CI/CD workflow, `staticwebapp.config.json`, and build output path are all correctly configured.

**Next step:** Run the SQL from `SUPABASE_SETUP.md` in the Supabase dashboard to create the `survey_responses` table so that live survey submissions work.

---

## Architecture and Tech Stack

| Technology | Version | Why It Was Chosen |
|---|---|---|
| React | 18 (workspace catalog) | Standard UI framework; already in the monorepo scaffold |
| TypeScript | 5 (workspace catalog) | Type safety for Supabase row types and form state |
| Vite | 7 (workspace catalog) | Fast dev server; already the monorepo build tool |
| wouter | 3.3.5 | Lightweight client-side router already present in the react-vite scaffold; no reason to swap it |
| @supabase/supabase-js | 2.100.1 | Official client for Supabase PostgreSQL; anon key + RLS for anonymous access |
| Recharts | 2.15.2 (workspace catalog) | Composable, React-native charting; sufficient for three simple bar charts |
| Custom CSS | — | Chosen over Tailwind utilities for full WCAG AA control and readable, self-documenting styles |
| Tailwind CSS | workspace catalog | Imported via `@import "tailwindcss"` in `index.css` but utility classes are intentionally not used |
| pnpm | 10.26.1 | Monorepo package manager; required by the workspace |
| Node.js | 24.13.0 | Runtime for build tooling; matches GitHub Actions `node-version: 24` |
| GitHub Actions | — | CI/CD; triggers on push to `main` only |
| Azure Static Web Apps | — | Production hosting; SPA routing handled by `staticwebapp.config.json` |

---

## Project Structure Notes

```
sleep-habits-survey/                    ← monorepo root (pnpm workspace)
├── artifacts/
│   └── sleep-survey/                   ← the React + Vite SPA artifact
│       ├── public/
│       │   ├── favicon.svg             ← browser tab icon
│       │   ├── opengraph.jpg           ← social share image
│       │   └── staticwebapp.config.json  ← Azure SWA: rewrites all paths to /index.html
│       ├── src/
│       │   ├── components/
│       │   │   └── Footer.tsx          ← shared footer, rendered on ALL pages including 404
│       │   ├── lib/
│       │   │   ├── supabase.ts         ← creates and exports the Supabase client
│       │   │   └── utils.ts            ← scaffold utility (cn helper); currently unused
│       │   ├── pages/
│       │   │   ├── HomePage.tsx        ← landing page; two Link buttons, no logic
│       │   │   ├── SurveyPage.tsx      ← main form; 360 lines; contains all Q1–Q4 logic
│       │   │   ├── ResultsPage.tsx     ← fetches all rows, computes chart data, renders 3 charts
│       │   │   └── not-found.tsx       ← 404; uses Footer
│       │   ├── types/
│       │   │   └── survey.ts           ← SleepQuality/SleepHabit types; SLEEP_*_OPTIONS arrays; Database type
│       │   ├── App.tsx                 ← WouterRouter with BASE_URL base; Switch with 4 routes
│       │   ├── index.css               ← entire design system; ~600 lines; CSS variables + BEM-ish classes
│       │   └── main.tsx                ← React entry point; renders <App />
│       ├── vite.config.ts              ← requires PORT and BASE_PATH env vars; outDir = dist/public
│       ├── tsconfig.json
│       └── package.json
├── .github/
│   └── workflows/
│       └── azure-static-web-apps.yml  ← CI/CD pipeline; push-to-main only
├── SUPABASE_SETUP.md                  ← SQL the developer must run once in Supabase dashboard
├── WORKING_NOTES.md                   ← this file
├── README.md                          ← public-facing documentation
└── LICENSE                            ← MIT, 2026 Colby Davis
```

### Non-obvious decisions

- **`dist/public`** — Vite's `outDir` is `dist/public` (not the default `dist`) to match the Replit monorepo convention. The Azure workflow uses `app_location: artifacts/sleep-survey/dist/public` to match.
- **`BASE_URL` stripping in `App.tsx`** — `WouterRouter` receives `import.meta.env.BASE_URL.replace(/\/$/, "")` to strip the trailing slash that Vite appends, preventing double-slash route matching.
- **`@` alias** — resolves to `artifacts/sleep-survey/src`. Use `@/pages/...`, `@/components/...`, etc. everywhere.
- **Tailwind is imported but not used** — `@import "tailwindcss"` is in `index.css` to satisfy the plugin, but all actual styling is written as custom CSS classes. Do not start using Tailwind utilities.

### Files and folders that must not be changed without discussion

- `vite.config.ts` — PORT/BASE_PATH validation, outDir, and the `@` alias are load-bearing
- `public/staticwebapp.config.json` — removing this breaks all direct-URL navigation on Azure
- `src/types/survey.ts` — the `SLEEP_*_OPTIONS` arrays define exactly what goes into the database; changing labels changes what gets stored
- `.github/workflows/azure-static-web-apps.yml` — env var injection order and `skip_app_build: true` are required for the build to succeed

---

## Data / Database

**Database:** Supabase (PostgreSQL), project `ckgovtjbfwebrldojqps`, table `survey_responses` in the `public` schema.

### Table: `survey_responses`

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | `uuid` | Yes (auto) | Primary key; `gen_random_uuid()` default |
| `created_at` | `timestamptz` | Yes (auto) | Server-side `now()` default; never set by the client |
| `sleep_quality` | `text` | Yes | One of: `Excellent`, `Good`, `Fair`, `Poor`, `Terrible` |
| `sleep_time` | `text` | Yes | One of the 8 values in `SLEEP_TIME_OPTIONS` (e.g. `11:00 PM`) |
| `sleep_habits` | `text[]` | Yes | Array of selected habit labels; can contain standard options + `"Other"` |
| `other_sleep_habits` | `text` | No | Populated only when `"Other"` is in `sleep_habits`; otherwise `null` |
| `negative_impact` | `text` | Yes | Free-text; user describes their perceived worst sleep disruptor |

**RLS:** Enabled. Two policies grant the `anon` role unrestricted `INSERT` and `SELECT`. No `UPDATE` or `DELETE` policies exist — responses are append-only.

**No migrations system** is in place. The table is created once via manual SQL. Any schema change requires running `ALTER TABLE` manually in the Supabase SQL Editor.

---

## Conventions

### Naming conventions

- **Files:** PascalCase for React components (`SurveyPage.tsx`, `Footer.tsx`); camelCase for non-component modules (`supabase.ts`, `utils.ts`); kebab-case for the 404 page (`not-found.tsx`) to match the scaffold convention
- **CSS classes:** BEM-ish, kebab-case (`.survey-card`, `.btn-primary`, `.form-label`); never Tailwind utilities
- **TypeScript types:** PascalCase interfaces and type aliases (`SurveyResponse`, `SleepQuality`); exported from `src/types/survey.ts`
- **Database columns:** `snake_case` to match PostgreSQL convention

### Code style

- Single quotes in TypeScript; no semicolons only where Prettier would remove them (the project has no Prettier config — follow existing file style)
- Arrow functions for event handlers inside components; named function declarations for top-level helpers like `buildQualityData`
- No default parameter values for required props — let TypeScript catch missing values
- Error states are shown inline; no toast notifications

### Framework patterns

- **Routing:** `<Link href="...">` from wouter for navigation; never `<a href>` for internal routes
- **Data fetching:** direct `supabase.from(...).select()` / `.insert()` calls inside `useEffect` or event handlers; no React Query, no SWR
- **State:** `useState` only; no context, no Zustand, no Redux
- **Validation:** manual validate-on-submit function returning an errors object; errors cleared field-by-field on change
- **Accessibility:** every input has a visible `<label>` and its error message is linked via `aria-describedby`

### Git commit style

Short imperative subject line, no period. Examples:
```
Add conditional Other input to sleep habits question
Fix wouter Link nesting bug on home page
Remove unused shadcn/ui scaffold components
```

---

## Decisions and Tradeoffs

- **wouter over react-router-dom:** The react-vite scaffold already included wouter 3. Swapping to react-router-dom would add a dependency and require rewriting three route definitions with zero functional benefit. Do not suggest this switch.
- **Custom CSS over Tailwind utilities:** Tailwind utility classes make WCAG AA compliance harder to audit and produce verbose JSX. All styles are in `index.css` using CSS custom properties and descriptive class names. Tailwind is present only as a PostCSS plugin. Do not introduce utility classes.
- **No React Query:** The Results page is a simple one-shot fetch on mount with no caching requirements. Adding React Query for a single query would be over-engineering. Do not suggest it.
- **`skip_app_build: true` in the Azure workflow:** Azure's built-in Oryx builder does not understand a pnpm monorepo with a non-root artifact. Building manually in the workflow step and pointing `app_location` at the pre-built output is the correct pattern here.
- **PORT and BASE_PATH required at Vite config evaluation time:** Both env vars are validated with `throw new Error(...)` at the top of `vite.config.ts`. The GitHub Actions workflow injects `PORT=3000` and `BASE_PATH=/` explicitly so the build does not fail in CI. Do not remove this validation.
- **Recharts over Chart.js or D3:** Recharts is React-native, composable, and already in the workspace catalog. Chart.js requires a canvas ref pattern that is more verbose. D3 is overkill for three static bar charts.
- **Append-only database design:** No edit or delete functionality is planned. Survey responses are immutable once submitted. RLS policies reflect this — there are no `UPDATE` or `DELETE` grants.

---

## What Was Tried and Rejected

- **`react-router-dom`** — rejected in favour of the scaffold's existing `wouter` dependency. Do not suggest switching.
- **Tailwind utility classes for layout and styling** — rejected; custom CSS gives better WCAG AA auditability. Do not introduce utilities.
- **shadcn/ui components** — the react-vite scaffold generated a full `src/components/ui/` directory (accordion, badge, button, card, etc.). None were used by the survey and all were deleted. Do not re-add them.
- **PR-triggered GitHub Actions workflow** — the standard Azure SWA workflow template includes a `close_pull_request_job` and PR trigger. Both were removed to keep the pipeline simple and match the push-only requirement. Do not re-add PR triggers.
- **React Query / SWR for data fetching** — rejected as unnecessary for a single fetch on mount. Do not suggest it.
- **Nesting `<a>` inside `<Link>`** — wouter's `<Link>` renders an `<a>` tag; wrapping it in another `<a>` produces invalid HTML and a React warning. Fixed by applying `className` directly to `<Link>`. Do not reintroduce anchor nesting.

---

## Known Issues and Workarounds

### Issue 1: Supabase `survey_responses` table does not exist yet

- **Problem:** The table has not been created in the live Supabase project. Any survey submission returns a `PGRST205` error and the UI shows "Something went wrong saving your response."
- **Workaround:** Run the SQL in `SUPABASE_SETUP.md` in the Supabase SQL Editor at `https://supabase.com/dashboard/project/ckgovtjbfwebrldojqps/sql/new`. This is a one-time manual step.
- **Do not remove:** The SQL in `SUPABASE_SETUP.md` is the canonical schema definition and must not be deleted.

### Issue 2: Production JavaScript bundle exceeds 500 KB

- **Problem:** `vite build` emits a warning — the single JS chunk is ~783 KB unminified (222 KB gzipped). Recharts is the primary contributor.
- **Workaround:** None applied yet; gzip compression on Azure CDN brings it to an acceptable transfer size for a low-traffic academic survey.
- **Do not remove:** No code splitting has been applied; if added in future, test that the dynamic `import()` call does not break the Azure static hosting path resolution.

### Issue 3: `PORT` and `BASE_PATH` must be set for every Vite invocation

- **Problem:** `vite.config.ts` throws if either variable is missing, including during `vite build` in CI.
- **Workaround:** The GitHub Actions workflow injects `PORT: 3000` and `BASE_PATH: /` in the Build step env block. Locally, prefix commands with `PORT=3000 BASE_PATH=/ pnpm ...`.
- **Do not remove:** The GitHub Actions env block for PORT and BASE_PATH is required — removing it will break the Azure deployment build.

---

## Browser / Environment Compatibility

### Front-end

- **Tested in:** Chrome 132 (Replit preview), Chrome on Android (mobile responsive check)
- **Expected support:** All modern evergreen browsers (Chrome, Firefox, Safari, Edge) — no IE11, no legacy Safari
- **Known incompatibilities:** None identified
- **CSS features used:** CSS custom properties, `flexbox`, `grid` — all universally supported in evergreen browsers

### Back-end / Build environment

- **OS:** Linux (NixOS in Replit; Ubuntu 24 in GitHub Actions)
- **Node.js:** 24.13.0 (required; specified in the GitHub Actions workflow as `node-version: 24`)
- **pnpm:** 10.26.1 (required; specified in the GitHub Actions workflow as `version: 10`)
- **Environment variables required at build time:** `PORT`, `BASE_PATH`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

---

## Open Questions

- **Should the Results page be password-protected?** The current design allows anyone with the URL to view all aggregated responses. If this is a concern before the survey goes live, an environment-variable-controlled passphrase gate should be added.
- **Should the survey close after a deadline?** There is currently no mechanism to stop accepting submissions after the course ends (May 2026). A `VITE_SURVEY_CLOSES_AT` env var and a client-side date check would be a lightweight solution.
- **Should "Other" habit responses be clustered or shown raw?** Currently, user-typed "Other" values are normalized to lowercase and shown as individual bars on the Results chart. If responses become noisy, manual bucketing or a fuzzy-match grouping may be needed.
- **What is the GitHub repository URL?** The README and workflow assume the repo is at `github.com/colbydavis/sleep-habits-survey` — update both if the actual URL differs.

---

## Session Log

### 2026-03-30

**Accomplished:**
- Built the complete Sleep Habits Survey SPA: Home, Survey (4 questions, validation, thank-you), and Results (3 Recharts bar charts) pages
- Configured Supabase client with anon key and full TypeScript row types
- Set up GitHub Actions CI/CD and `staticwebapp.config.json` for Azure Static Web Apps deployment
- Removed all unused shadcn/ui scaffold components; replaced custom CSS design system
- Fixed nested `<a>` inside `<Link>` bug; fixed PORT/BASE_PATH injection in CI
- Sorted sleep quality chart by count ascending (least→most) per spec
- Wrote `SUPABASE_SETUP.md`, `README.md` (16 sections), `LICENSE`, and this file

**Left incomplete:**
- Supabase table not yet created (user must run SQL from `SUPABASE_SETUP.md`)
- Azure deployment not yet tested end-to-end against a real Azure resource (GitHub Actions secrets not yet added)

**Decisions made:**
- Keep wouter (not react-router-dom); keep custom CSS (not Tailwind utilities); remove all shadcn/ui

**Next step:**
- Run SQL from `SUPABASE_SETUP.md` in the Supabase SQL Editor, then add the three GitHub secrets and push to trigger the first Azure deployment

---

## Useful References

- [Supabase JavaScript client docs](https://supabase.com/docs/reference/javascript/introduction) — `from().insert()`, `from().select()`, TypeScript generics
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) — anon INSERT/SELECT policy setup
- [Recharts API reference](https://recharts.org/en-US/api) — `BarChart`, `Bar`, `XAxis`, `YAxis`, `Cell`, `LabelList`, `ResponsiveContainer`
- [Vite environment variables](https://vite.dev/guide/env-and-mode) — `VITE_` prefix, `import.meta.env`, build-time injection
- [wouter README](https://github.com/molefrog/wouter) — `<Router base>`, `<Switch>`, `<Route>`, `<Link>`
- [Azure Static Web Apps — SPA routing](https://learn.microsoft.com/en-us/azure/static-web-apps/configuration#fallback-routes) — `navigationFallback` in `staticwebapp.config.json`
- [Azure Static Web Apps deploy action](https://github.com/Azure/static-web-apps-deploy) — `skip_app_build`, `app_location`, `api_token`
- [shields.io badge generator](https://shields.io/badges) — for-the-badge style used in README
- **Replit AI (Claude Sonnet)** — used throughout to scaffold components, debug the wouter/Link nesting issue, configure the Azure workflow, write the README and this file. All generated code was reviewed before acceptance.

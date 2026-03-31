# Sleep Habits Survey

## Description

Sleep Habits Survey is a single-page web application that collects anonymous data about undergraduate student sleep behaviors for academic research. Built for BAIS:3300 at the University of Iowa, it presents respondents with four targeted questions about sleep quality, typical bedtime, pre-sleep routines, and perceived sleep disruptors. Responses are stored in a Supabase PostgreSQL database and immediately visualized on a live Results page using interactive Recharts bar charts.

## Badges

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Azure Static Web Apps](https://img.shields.io/badge/Azure_Static_Web_Apps-0089D6?style=for-the-badge&logo=microsoftazure&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

## Features

- **Anonymous, four-question survey** covering sleep quality, typical weeknight bedtime, pre-sleep habits, and open-ended sleep disruptors — no login required
- **Rich input types** — radio buttons with descriptive sub-labels for sleep quality, a dropdown for bedtime, multi-select checkboxes for habits, and a free-text textarea for personal reflections
- **Conditional "Other" field** that auto-focuses as soon as respondents check it, keeping data entry smooth and uninterrupted
- **Inline form validation** with accessible error messages linked via `aria-describedby`, preventing incomplete submissions
- **Thank-you screen** after submission that displays a personalized summary of every answer the respondent provided
- **Live Results page** showing the total response count and three Recharts bar charts: sleep quality ratings sorted least-to-most, sleep habits ranked by popularity, and the top three bedtimes with percentage labels
- **Responsive layout** that works equally well on phones, tablets, and desktops without any additional configuration
- **Continuous deployment** to Azure Static Web Apps on every push to `main` via a pre-configured GitHub Actions workflow

## Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | UI component framework |
| TypeScript 5 | Static type safety throughout the codebase |
| Vite 7 | Build tool and hot-reloading dev server |
| wouter 3 | Lightweight client-side routing (`/`, `/survey`, `/results`) |
| Supabase | Hosted PostgreSQL database with a PostgREST API layer |
| @supabase/supabase-js 2 | Official JavaScript client for database queries and inserts |
| Recharts 2 | Composable charting library for the three results visualizations |
| Custom CSS | Hand-crafted responsive styles using the `#8A3BDB` brand accent |
| GitHub Actions | CI/CD pipeline — builds and deploys on every push to `main` |
| Azure Static Web Apps | Production hosting with global CDN and built-in routing fallback |
| pnpm 10 | Fast, disk-efficient monorepo package manager |

## Getting Started

### Prerequisites

- **Node.js 24+** — [nodejs.org/en/download](https://nodejs.org/en/download)
- **pnpm 10+** — [pnpm.io/installation](https://pnpm.io/installation)
- **Supabase project** — [supabase.com](https://supabase.com) (free tier is sufficient)
- **Azure Static Web Apps resource** *(deployment only)* — [portal.azure.com](https://portal.azure.com)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/colbydavis/sleep-habits-survey.git
   cd sleep-habits-survey
   ```

2. **Install all workspace dependencies**
   ```bash
   pnpm install
   ```

3. **Set your Supabase credentials as environment variables**

   In Replit, add the following as Secrets. Locally, export them in your shell or add them to a `.env` file at the project root (do not commit this file):
   ```bash
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
   Both values are found in your Supabase dashboard under **Project Settings → API**.

4. **Create the database table and RLS policies**

   Open your Supabase project's SQL Editor at `https://supabase.com/dashboard/project/<ref>/sql/new` and run the SQL in [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md).

5. **Start the development server**
   ```bash
   PORT=3000 BASE_PATH=/ pnpm --filter @workspace/sleep-survey run dev
   ```
   The app will be available at `http://localhost:3000`.

## Usage

### Running locally

```bash
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/sleep-survey run dev
```

Navigate to `http://localhost:3000` in your browser.

- **`/`** — Home page with links to take the survey or view results
- **`/survey`** — Four-question form; submit to store a response in Supabase
- **`/results`** — Live aggregated charts pulled directly from the database

### Building for production

```bash
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/sleep-survey run build
```

The production-ready static files are output to `artifacts/sleep-survey/dist/public/`.

### Deploying to Azure Static Web Apps

Push to the `main` branch. The GitHub Actions workflow (`.github/workflows/azure-static-web-apps.yml`) builds the app and uploads the output automatically.

Before the first deployment, add these three secrets to your GitHub repository under **Settings → Secrets and variables → Actions**:

| Secret name | Where to find the value |
|---|---|
| `VITE_SUPABASE_URL` | Supabase dashboard → Project Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase dashboard → Project Settings → API |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Azure portal → your Static Web App → Manage deployment token |

### Configuration

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Full URL of your Supabase project |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `PORT` | Yes (dev/build) | Local port for the Vite dev server |
| `BASE_PATH` | Yes (dev/build) | URL base path (use `/` for root deployment) |

## Project Structure

```
sleep-habits-survey/                  ← monorepo root
├── artifacts/
│   └── sleep-survey/                 ← React + Vite SPA
│       ├── public/
│       │   ├── favicon.svg           ← browser tab icon
│       │   ├── opengraph.jpg         ← social share preview image
│       │   └── staticwebapp.config.json  ← Azure SWA routing fallback (SPA mode)
│       ├── src/
│       │   ├── components/
│       │   │   └── Footer.tsx        ← shared footer: "Survey by Colby Davis, BAIS:3300"
│       │   ├── lib/
│       │   │   ├── supabase.ts       ← Supabase client initialisation
│       │   │   └── utils.ts          ← shared utility helpers
│       │   ├── pages/
│       │   │   ├── HomePage.tsx      ← landing page with CTA buttons
│       │   │   ├── SurveyPage.tsx    ← four-question form with validation + thank-you screen
│       │   │   ├── ResultsPage.tsx   ← live Recharts visualisations of all responses
│       │   │   └── not-found.tsx     ← 404 fallback page
│       │   ├── types/
│       │   │   └── survey.ts         ← TypeScript types, interfaces, and question option arrays
│       │   ├── App.tsx               ← wouter router: /, /survey, /results
│       │   ├── index.css             ← global styles with #8A3BDB accent colour variables
│       │   └── main.tsx              ← React entry point
│       ├── package.json              ← workspace package manifest and dependencies
│       ├── vite.config.ts            ← Vite config (PORT, BASE_PATH, plugins)
│       └── tsconfig.json             ← TypeScript compiler config
├── .github/
│   └── workflows/
│       └── azure-static-web-apps.yml ← CI/CD: build on push to main, deploy to Azure
├── SUPABASE_SETUP.md                 ← SQL to create the table + RLS policies
├── README.md                         ← this file
└── LICENSE                           ← MIT License
```

## Changelog

### v1.0.0 — 2026-03-30

- Initial release
- Home, Survey, and Results pages with wouter client-side routing
- Four-question survey form with inline validation and accessibility attributes
- Conditional auto-focusing "Other" text input for sleep habits
- Thank-you screen with full answer summary on successful submission
- Results page with three Recharts bar charts (sleep quality, habits, bedtimes)
- Supabase PostgreSQL backend with anonymous RLS insert and select policies
- Continuous deployment to Azure Static Web Apps via GitHub Actions
- Responsive custom CSS design with `#8A3BDB` brand accent colour

## Known Issues / To-Do

- [ ] The Supabase `survey_responses` table must be created manually by running the SQL in `SUPABASE_SETUP.md` before the first survey submission will succeed
- [ ] GitHub Actions secrets (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `AZURE_STATIC_WEB_APPS_API_TOKEN`) must be added to the repository before the deployment workflow can run
- [ ] The production JavaScript bundle exceeds 500 KB; consider code-splitting the Recharts dependency with dynamic `import()` to improve initial load time

## Roadmap

- Add a question for average nightly hours of sleep and include it in the results charts
- Implement CSV export on the Results page so data can be downloaded for SPSS or Excel analysis
- Add demographic questions (class year, declared major) to enable cross-tabulated results
- Include a time-series trend chart on the Results page showing response volume over time
- Password-protect the Results page so only the course instructor can view raw aggregated data before the survey closes

## Contributing

This project was created as a course assignment and is not actively seeking outside contributions. That said, if you find a bug or want to suggest an improvement, feel free to open an issue. To submit a change:

1. Fork the repository on GitHub
2. Create a feature branch: `git checkout -b fix/your-description`
3. Make your changes and commit with a descriptive message
4. Push the branch to your fork: `git push origin fix/your-description`
5. Open a Pull Request against `main` with a clear explanation of what you changed and why

## License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for the full text.

## Author

**Colby Davis**
University of Iowa — Tippie College of Business
BAIS:3300 · Spring 2026

## Contact

GitHub: [github.com/colbydavis](https://github.com/colbydavis)

## Acknowledgements

- [Supabase Documentation](https://supabase.com/docs) — database setup, RLS policies, and the JavaScript client API reference
- [Recharts Documentation](https://recharts.org/en-US/api) — composable chart components and responsive container patterns
- [Vite Documentation](https://vite.dev/guide/) — build configuration and environment variable handling
- [Azure Static Web Apps Documentation](https://learn.microsoft.com/en-us/azure/static-web-apps/) — deployment workflow and SPA routing configuration
- [shields.io](https://shields.io) — badge generation for this README
- [wouter](https://github.com/molefrog/wouter) — lightweight React router used for client-side navigation
- **Replit AI (Claude)** — assisted with code scaffolding, component architecture, Supabase integration, and GitHub Actions workflow configuration

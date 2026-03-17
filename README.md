# TheWayToInterview March 19 Launch Pack

This workspace contains a production-ready build specification for transforming TheWayToInterview from an interview-prep product into an AI Career Copilot before the March 19, 2026 launch.

The plan is grounded in the current live product footprint observed on `https://thewaytointerview.com`:

- Current app routes already exist for `jd`, `resume`, `linkedin`, `interview`, `dashboard`, `prep`, `tracker`, `jobs`, and `skill-gap`.
- The live app appears to use a React SPA with Supabase-backed tables such as `jobs`, `jd_analyses`, `prep_roadmaps`, `candidate_profiles`, `career_goals`, `applications`, and `user_job_matches`.
- The fastest path to launch is an accelerated v2 on top of that foundation, not a greenfield rewrite.

Docs in this pack:

- [Overview](docs/launch-spec/00-overview.md)
- [System Architecture](docs/launch-spec/01-system-architecture.md)
- [Database Schema](docs/launch-spec/02-database-schema.sql)
- [API Design](docs/launch-spec/03-api-design.md)
- [UX Wireframes](docs/launch-spec/04-ux-wireframes.md)
- [Feature Specifications](docs/launch-spec/05-feature-specifications.md)
- [Deployment Checklist](docs/launch-spec/06-deployment-checklist.md)
- [Cloudflare Pages Deployment](docs/launch-spec/07-cloudflare-pages.md)

Recommended launch scope for March 19, 2026:

- Smooth onboarding
- Career dashboard
- Smart job discovery
- JD analyzer
- Prep engine
- Resume optimizer
- Career CRM

Planned but disabled at launch:

- AI mock interviews (audio)
- AI mock interviews (video)
- Live recruiter interviews
- Offer negotiation assistant
- Recruiter marketplace

## App Scaffold

This workspace now also includes a runnable React + TypeScript scaffold and ordered Supabase migrations:

- App entrypoint: [src/main.tsx](src/main.tsx)
- Router: [src/app/router.tsx](src/app/router.tsx)
- Shared shell: [src/app/layout/AppShell.tsx](src/app/layout/AppShell.tsx)
- Mock-backed data layer: [src/lib/api/repository.ts](src/lib/api/repository.ts)
- Environment config: [.env.example](.env.example)
- Supabase migrations: [supabase/migrations](supabase/migrations)

To run locally:

1. `npm install`
2. `npm run dev`

To build for production:

1. `npm run build`

## First Live Vertical

The first Supabase-backed vertical is now wired end to end:

- Onboarding form writes to `career_goals` and `candidate_profiles`
- A readiness snapshot is inserted into `readiness_snapshots`
- Jobs page reads scored results from the `get_job_discovery` RPC
- Dashboard reads the latest readiness snapshot plus top jobs

Key app files:

- [Onboarding page](/Users/raghunathbagalkote/Desktop/Thewaytointerview/src/app/pages/OnboardingPage.tsx)
- [Dashboard repository mapping](/Users/raghunathbagalkote/Desktop/Thewaytointerview/src/lib/api/repository.ts)
- [React Query hooks](/Users/raghunathbagalkote/Desktop/Thewaytointerview/src/lib/api/queries.ts)

Key database files:

- [Auth profile helper migration](/Users/raghunathbagalkote/Desktop/Thewaytointerview/supabase/migrations/202603170005_auth_helpers.sql)
- [Onboarding + readiness + job discovery RPCs](/Users/raghunathbagalkote/Desktop/Thewaytointerview/supabase/migrations/202603170006_onboarding_and_job_discovery.sql)
- [Seed jobs](/Users/raghunathbagalkote/Desktop/Thewaytointerview/supabase/migrations/202603170007_seed_jobs.sql)

To wire it against a real Supabase project:

1. Create a Supabase project.
2. Copy [.env.example](/Users/raghunathbagalkote/Desktop/Thewaytointerview/.env.example) to `.env.local` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Apply the SQL migrations in `supabase/migrations` in order.
4. Sign into the app with a valid Supabase-authenticated session.
5. Open `/app/onboarding`, save a career goal, then check `/app/dashboard` and `/app/jobs`.

Expected RPCs after migration:

- `ensure_profile_for_current_user()`
- `refresh_readiness_snapshot()`
- `submit_onboarding_profile(...)`
- `get_job_discovery(...)`

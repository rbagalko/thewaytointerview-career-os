# Cloudflare Pages Deployment

## Build Settings

- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/`

## Required Environment Variables

Add these in Cloudflare Pages for both preview and production:

- `VITE_APP_NAME=TheWayToInterview`
- `VITE_SUPABASE_URL=...`
- `VITE_SUPABASE_ANON_KEY=...`

Do not add the Supabase `service_role` key to Cloudflare Pages frontend env vars.

## SPA Routing

This repo includes [public/_redirects](/Users/raghunathbagalkote/Desktop/Thewaytointerview/public/_redirects) so client-side routes like `/auth`, `/app/dashboard`, and `/app/jobs` resolve correctly on direct refresh.

## Security Headers

This repo includes [public/_headers](/Users/raghunathbagalkote/Desktop/Thewaytointerview/public/_headers) with baseline security headers for Cloudflare Pages.

## Supabase Auth URL Configuration

In Supabase `Authentication -> URL Configuration`, add:

- your Cloudflare Pages production domain
- your Cloudflare preview domain pattern if you plan to use preview auth flows
- `http://localhost:5173/**` for local development

Example production values:

- Site URL: `https://thewaytointerview.com`
- Redirect URL: `https://thewaytointerview.com/auth`

If you use a Pages subdomain before the custom domain goes live, add that URL too.

## Recommended Cloudflare Steps

1. Connect the Git repo to Cloudflare Pages.
2. Set the build/output settings above.
3. Add the environment variables.
4. Trigger the first deployment.
5. Open `/auth` and verify sign-in.
6. Verify `/app/onboarding`, `/app/dashboard`, and `/app/jobs`.

## Post-Deploy Smoke Test

1. Visit `/auth`.
2. Sign in with your Supabase test user.
3. Complete onboarding.
4. Confirm a row appears in `career_goals`.
5. Confirm a row appears in `readiness_snapshots`.
6. Confirm `/app/jobs` shows scored seeded jobs.

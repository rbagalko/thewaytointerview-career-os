# Deployment Checklist

Launch date: March 19, 2026.

## 72-Hour Plan

### March 17, 2026

- Freeze scope to P0 launch modules only.
- Finalize schema migrations and RLS.
- Lock information architecture and navigation labels.
- Move critical AI actions behind server-side endpoints.
- Seed job sources and test normalization pipeline.

### March 18, 2026

- Run end-to-end QA across onboarding, dashboard, jobs, JD analysis, prep, resume, and CRM.
- Backfill or scrape enough jobs for credible discovery.
- Run security, performance, and analytics validation.
- Fix P0 bugs only.

### March 19, 2026

- Smoke test production with seeded test users.
- Enable feature flags for launch modules.
- Keep future modules disabled with correct labels.
- Monitor dashboards continuously for the first 6 hours.

## Environment Checklist

- Separate `dev`, `staging`, and `production` environments
- Distinct Supabase projects or clearly isolated databases
- Production secrets stored in managed secret storage
- No service role keys exposed to frontend bundles
- CORS locked to approved origins only

## Database Checklist

- Migrations applied and recorded
- RLS enabled on every user-owned table
- Indexes created for jobs, readiness, prep, and CRM queries
- Backups enabled
- Point-in-time recovery configured
- Seed `feature_flags` with disabled future modules

## Auth Checklist

- Email auth and password reset verified
- Session expiration behavior tested
- Signup rate limiting enabled
- Bot mitigation enabled on auth and public forms
- Admin role checks verified

## AI Checklist

- Prompt templates versioned
- All AI endpoints write `ai_runs` records
- Rate limits enforced
- Prompt injection sanitization added for JDs and uploaded files
- Graceful fallback copy implemented for AI failures
- Token and latency monitoring enabled

## Job Ingestion Checklist

- Source list prioritized and documented
- Each source has a health status
- Dedupe logic tested
- Manual admin re-run works
- Failed runs alert the team
- Salary, role, and location normalization verified on sample data

## Frontend Checklist

- Desktop and mobile responsive testing complete
- Lighthouse checks run on landing, auth, dashboard, and jobs pages
- Empty states designed for no jobs, no resume, and no roadmap
- Disabled future cards visible and clearly non-clickable
- Dashboard is the post-login default route

## Analytics Checklist

- Event taxonomy implemented
- Activation funnel dashboard ready
- Readiness score changes tracked
- Job analysis, resume optimization, and prep completion tracked
- CRM stage changes tracked

## Monitoring Checklist

- App error monitoring enabled
- API error monitoring enabled
- Uptime checks for frontend and core APIs enabled
- Background worker failure alerts enabled
- Slow query monitoring enabled

## Security Checklist

- Privacy policy, AI disclosure, and data security pages linked in footer
- Private resume files delivered by signed URLs only
- Support/admin access logged
- No secrets in client-side source maps
- Dependency audit complete

## QA Scenarios

Critical paths to test:

- New user completes onboarding and lands on dashboard
- User uploads resume and gets parsed skills
- User opens job and runs JD analysis
- User creates roadmap and completes a task
- User optimizes a resume against a job
- User saves a job and adds it to CRM
- User returns later and sees updated readiness score

Edge cases:

- No resume uploaded
- No jobs match filters
- AI analysis timeout
- Duplicate job records
- Mobile view with long company names and salary strings

## Launch Gates

Do not launch if any of the following are true:

- Authentication is unreliable
- RLS allows cross-user data access
- Dashboard or Jobs p95 exceeds 5 seconds
- JD analysis failure rate exceeds 5%
- Job inventory is too sparse to make recommendations credible
- Disabled future features are accidentally interactive

## Rollback Plan

- Keep previous production deployment available for immediate rollback
- Gate new modules behind feature flags
- If AI services degrade, keep read-only dashboard and jobs experience online
- If ingestion fails, serve last known good active jobs index

## First Week Post-Launch

- Review activation funnel daily
- Review top failure traces twice daily
- Review job source health daily
- Review readiness score distributions for anomalies
- Interview 5 activated users and 5 drop-offs

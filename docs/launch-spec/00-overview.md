# TheWayToInterview V2 Overview

## Executive Summary

Launch target: March 19, 2026.

TheWayToInterview should reposition from "AI Interview Prep Guide" to an "AI Career Operating System" that answers a simpler and more valuable daily question:

> What should I do today to become hireable for my dream role?

The March 19, 2026 release should not attempt a full-platform rewrite. It should ship a disciplined v2 on top of the current live React and Supabase foundation, with stronger information architecture, server-side AI orchestration, better data normalization, and a clearer user journey from goal setting to job matching to daily execution.

## Current State Audit

Observed live product modules:

- `/app/jd`
- `/app/resume`
- `/app/linkedin`
- `/app/interview`
- `/app/dashboard`
- `/app/prep`
- `/app/tracker`
- `/app/jobs`
- `/app/skill-gap`

Observed live data footprint:

- `profiles`
- `career_goals`
- `candidate_profiles`
- `resumes`
- `jd_analyses`
- `jobs`
- `job_sources`
- `crawl_logs`
- `user_job_matches`
- `job_saved`
- `applications`
- `prep_roadmaps`
- `linkedin_optimizations`
- `mock_interviews`

Current strengths:

- There is already a real product shell, not just a landing page.
- JD analysis, prep roadmap, application tracking, and job discovery already exist in some form.
- The product already stores enough data to evolve into a readiness system.

Current gaps blocking the AI Career Copilot vision:

- The information architecture is tool-first, not journey-first.
- Readiness scoring is not yet the main organizing primitive.
- The Jobs page appears to behave more like a board than a career discovery engine.
- AI actions are likely too frontend-coupled for secure, production-grade operations.
- The user does not yet have a single, obvious daily loop.

## Product Reframe

### Old Positioning

- Interview questions
- Resume tools
- Mock interviews

### New Positioning

- Diagnose career gap
- Prioritize learning
- Recommend proof of work
- Optimize job targeting
- Drive daily preparation
- Track applications and outcomes

## March 19 MVP Scope

### P0 Launch Features

- Smooth onboarding
- Career dashboard
- Smart job discovery
- AI job matching
- AI JD analyzer
- Prep engine
- Resume optimizer
- Career CRM

### P1 Beta Features

- LinkedIn optimizer
- Learning intelligence ranking
- Expanded content recommendation engine

### Disabled But Visible

These must appear in-product, but remain disabled with the label `Soon you can experience this.`:

- AI mock interviews (audio)
- AI mock interviews (video)
- Live recruiter interviews
- Offer negotiation assistant
- Recruiter marketplace

## Core User Loop

1. User sets target role, company, salary, experience, and current skills.
2. System computes readiness score and top skill gaps.
3. System recommends realistic jobs for the next 90 days.
4. User opens a job and sees gap analysis, roadmap, and resume guidance.
5. User completes daily prep tasks and sees readiness improve.
6. User tracks job applications and interviews inside the same system.

## North Star

North Star Metric:

- Weekly Active Candidates completing at least 3 prep tasks or 1 job analysis per week.

Key success metrics for launch week:

- Activation rate: onboarding completed plus first JD analysis within 24 hours.
- Dashboard engagement: percent of activated users returning to dashboard at least 3 times in 7 days.
- Job discovery engagement: jobs viewed per activated user.
- Prep execution: average prep tasks completed per user in first 7 days.
- Resume conversion: percent of activated users who upload and optimize a resume.
- Application tracking adoption: percent of activated users who save or track at least 1 job.

## Launch Priorities

### P0

- Make onboarding crisp and under 3 minutes.
- Make dashboard the default home after login.
- Make every job card show readiness and next actions.
- Move AI writes and scoring behind server-side endpoints.
- Add production observability and security controls.

### P1

- Add deeper resource ranking and skill graph logic.
- Add richer proof-of-work recommendations.
- Add LinkedIn optimization into the readiness model.

### Do Not Slip Scope On Launch Week

- Audio or video mock interviews
- Live marketplace workflows
- Offer negotiation flows
- Heavy social or community features

## Product Principles

- One clear next step on every screen.
- The system explains why each recommendation exists.
- Readiness score is transparent, not magic.
- Jobs should feel achievable, not aspirational fluff.
- Every AI output must be editable, saveable, and attributable to input data.
- Disabled future features should create anticipation without breaking trust.

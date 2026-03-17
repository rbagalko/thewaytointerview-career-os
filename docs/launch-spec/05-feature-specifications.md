# Feature Specifications

## Scope Matrix

| Module | Launch Priority | Status |
| --- | --- | --- |
| Smooth onboarding | P0 | Required on March 19, 2026 |
| Career dashboard | P0 | Required on March 19, 2026 |
| Smart job discovery | P0 | Required on March 19, 2026 |
| Job scraper system | P0 | Required on March 19, 2026 |
| AI job matching | P0 | Required on March 19, 2026 |
| AI JD analyzer | P0 | Required on March 19, 2026 |
| Prep engine | P0 | Required on March 19, 2026 |
| Content integration engine | P1 | Partial support in P0 |
| Learning intelligence | P1 | Partial support in P0 |
| Resume optimizer | P0 | Required on March 19, 2026 |
| LinkedIn optimizer | P1 | Beta if stable |
| Career CRM | P0 | Required on March 19, 2026 |
| Mock interviews | Future | Visible but disabled |

## 1. Smooth Onboarding Flow

Goal:

- Convert first-time visitors into activated users quickly.

Inputs:

- target role
- target company
- salary goal
- experience level
- current skills
- optional resume upload

Output:

- baseline readiness score
- top skill gaps
- first prep tasks
- recommended jobs bucket

Acceptance criteria:

- Median completion time under 180 seconds
- 80% of users who start onboarding reach the outcome screen
- Outcome page always shows 3 specific next steps

## 2. Career Dashboard

Goal:

- Act as the user's operating center.

Must display:

- interview readiness score
- factor breakdown
- top skill gaps
- saved jobs count
- today's preparation tasks
- application pipeline summary
- next best action

Logic:

- Dashboard hydrates from one aggregate API.
- Next best action is chosen from the highest-impact incomplete action.

Acceptance criteria:

- Dashboard first contentful data under 2.5 seconds p95
- No more than 1 primary CTA visible above the fold

## 3. Smart Job Discovery

Goal:

- Show jobs the user can realistically win in the next 90 days.

Card requirements:

- company
- role
- salary range
- location
- experience level
- readiness score
- match score
- missing skills
- recommended actions

Ranking:

- Segment into 30-day, 60-day, and 90-day readiness buckets.
- Hide jobs with fatal mismatch unless the user explicitly asks to stretch.

Acceptance criteria:

- Every job card includes at least one concrete next action.
- Search results are filterable by role, location, work mode, and readiness threshold.

## 4. Job Scraper System

Goal:

- Maintain a fresh and usable job inventory.

Sources:

- LinkedIn where legally and technically permissible
- Indeed where legally and technically permissible
- company career pages
- curated tech job boards

Requirements:

- scheduled runs
- source health tracking
- normalization into canonical schema
- dedupe by URL and content fingerprint
- failure alerts on repeated source errors

Launch constraint:

- Seed with the top sources most aligned to target users rather than chasing every source on day 1.

Acceptance criteria:

- Less than 10% duplicate jobs in active inventory
- Source run health visible in admin

## 5. AI Job Matching Engine

Goal:

- Recommend roles based on actual fit, not keyword vanity.

Inputs:

- candidate profile
- career goals
- recent JD analyses
- location preferences
- salary goals

Outputs:

- match score
- readiness score
- missing skills
- next actions

Launch algorithm:

- skill overlap
- experience delta
- location fit
- salary fit
- role-family affinity

Acceptance criteria:

- Every matched job includes a human-readable rationale.
- Scores are stable across repeated recomputation with unchanged inputs.

## 6. AI JD Analyzer

Goal:

- Turn any job into a preparation plan.

Outputs:

- required skills
- technologies
- responsibilities
- predicted interview rounds
- skill gap analysis
- resume actions
- prep roadmap starter

Acceptance criteria:

- Structured JSON persisted for every completed analysis
- Analysis must be generated from both job data and user context

## 7. Preparation Engine

Goal:

- Create a daily training loop.

Must support:

- daily tasks
- progress tracking
- roadmap duration choices
- learning resources
- proof-of-work tasks

Task types:

- interview practice
- reading
- video
- mini-project
- resume update
- application action

Acceptance criteria:

- User can mark tasks done from dashboard and prep pages
- Task completion updates readiness within the same session

## 8. Content Integration Engine

Goal:

- Recommend the most useful free content for each gap.

Sources:

- YouTube
- official docs
- dev blogs
- GitHub repositories

Launch approach:

- Curate seed resources for top role families first
- Rank by skill match, duration, and difficulty

Acceptance criteria:

- Every high-priority gap has at least 1 resource recommendation
- Resources include source, duration, and difficulty when available

## 9. Learning Intelligence

Goal:

- Avoid content overload and rank what matters.

Ranking factors:

- relevance to gap
- popularity
- duration
- difficulty fit
- freshness if applicable

Launch note:

- Use heuristic ranking first, then train on engagement later.

## 10. Resume Optimizer

Goal:

- Improve ATS fit and proof-of-work credibility.

Outputs:

- ATS score
- keyword gaps
- improved bullets
- project suggestions
- exportable optimized version

Acceptance criteria:

- Resume optimization works with and without a selected job
- Every suggestion is editable before export

## 11. LinkedIn Optimizer

Goal:

- Improve discoverability and message clarity.

Launch status:

- Beta if stable, otherwise keep as low-risk existing feature and do not block March 19.

Outputs:

- suggested headline
- suggested summary
- keyword gaps
- profile score

## 12. Career CRM

Goal:

- Track momentum from saved job to offer.

Stages:

- saved
- applied
- screening
- interview
- offer
- rejected

Features:

- drag-and-drop or stage update actions
- next action date
- notes
- resume used

Acceptance criteria:

- User can add any job from the Jobs page directly into CRM
- Dashboard shows a CRM summary without loading the full board

## 13. Disabled Feature Specs

These features must be visible but non-interactive:

- AI mock interviews (audio)
- AI mock interviews (video)
- Live recruiter interviews
- Offer negotiation assistant
- Recruiter marketplace

Required UI treatment:

- card visible
- disabled button state
- helper copy exactly: `Soon you can experience this.`

## Readiness Score Specification

Purpose:

- Give users a believable sense of progress.

Formula:

- skill coverage: 35
- proof of work: 15
- resume fit: 15
- prep consistency: 15
- role clarity: 10
- application hygiene: 10

Rules:

- Recompute after onboarding, resume upload, JD analysis, roadmap generation, and task completion.
- Show top positive contributors and top blockers.
- Never present score without a next action.

## Growth Loop

Product loop:

1. User improves readiness score.
2. User shares progress or wins on LinkedIn.
3. New users join to benchmark and improve.
4. More job, prep, and outcome data improves recommendations.

## Data Strategy

Capture:

- user goals
- normalized skills
- job requirements
- missing skills
- prep completion
- application outcomes
- resume optimization diffs

This becomes the platform's Career Intelligence Dataset and should be treated as a strategic moat, with strict privacy and consent controls.

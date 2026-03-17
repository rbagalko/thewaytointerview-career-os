# UX Wireframes

## Experience Goals

- The UI should feel calm, focused, and decisive.
- Every page should answer "where am I?" and "what do I do next?"
- Readiness should be visible across the product, not buried in analytics.
- The right rail should continuously reinforce skill gaps and recommendations.

## Layout Shell

Desktop:

```text
+------------------+-----------------------------------------+----------------------+
| Sidebar          | Main content                            | Insights panel       |
|                  |                                         |                      |
| Dashboard        | Page title                              | Readiness score      |
| Jobs             | Filters / actions                       | Top gaps             |
| Prep             | Core workflow content                   | Suggested resources  |
| Resume           |                                         | Next best action     |
| LinkedIn         |                                         |                      |
| JD Analyzer      |                                         |                      |
| Applications     |                                         |                      |
|                  |                                         |                      |
+------------------+-----------------------------------------+----------------------+
```

Mobile:

- Sidebar collapses into bottom sheet navigation.
- Insights panel becomes a slide-up drawer.
- Primary CTA stays sticky at the bottom when a page has one main action.

## Onboarding Flow

Goal:

- Finish in under 3 minutes.

Step 1: Goal setup

```text
+------------------------------------------------------------------+
| Build your career cockpit                                        |
| Tell us your target so we can map the fastest route.             |
|                                                                  |
| Target role       [ Azure AD Engineer                    ]       |
| Target company    [ Microsoft                            ]       |
| Salary goal       [ 30 LPA                               ]       |
| Experience level  [ Mid-level v                          ]       |
|                                                                  |
|                                             [Continue]           |
+------------------------------------------------------------------+
```

Step 2: Current profile

```text
+------------------------------------------------------------------+
| What can you already do?                                         |
| Add your current skills or upload a resume.                      |
|                                                                  |
| Skills                                                           |
| [Azure AD] [PowerShell] [MFA] [+ Add skill]                      |
|                                                                  |
| Upload resume [Choose file]                                      |
|                                                                  |
|                                             [Analyze my gap]     |
+------------------------------------------------------------------+
```

Step 3: Outcome screen

```text
+------------------------------------------------------------------+
| Your readiness for Azure AD Engineer at Microsoft                |
|                                                                  |
| 58% ready                                                        |
|                                                                  |
| Biggest gaps                                                     |
| - Conditional Access                                             |
| - Azure AD Connect                                               |
| - PowerShell automation                                          |
|                                                                  |
| Your first 3 actions                                             |
| 1. Analyze 3 target jobs                                         |
| 2. Tailor your resume                                            |
| 3. Complete today's prep tasks                                   |
|                                                                  |
|                                        [Open my dashboard]       |
+------------------------------------------------------------------+
```

## Dashboard

```text
+-------------------------------------------------------------------------------------+
| Dashboard                                              58% Ready   +6 this week     |
| Azure AD Engineer at Microsoft                                                   |
|-------------------------------------------------------------------------------------|
| Next Best Action                                                                  |
| Tailor your resume for identity roles                             [Start now]     |
|-------------------------------------------------------------------------------------|
| Readiness breakdown | Top skill gaps | Saved jobs | Applications | Streak         |
|-------------------------------------------------------------------------------------|
| Today's prep plan                                                                    |
| [ ] Practice 5 Azure AD questions                                                   |
| [ ] Watch Conditional Access fundamentals                                           |
| [ ] Build mini lab: Azure AD Connect sync                                           |
|-------------------------------------------------------------------------------------|
| Jobs you can realistically get in 90 days                                          |
| Microsoft - Azure AD Engineer - 58% readiness                         [View]        |
| Okta - IAM Engineer - 64% readiness                                  [View]        |
+-------------------------------------------------------------------------------------+
```

## Jobs Page

```text
+-------------------------------------------------------------------------------------+
| Smart Job Discovery                                                                 |
| Search [Azure AD, IAM, Okta...]    Location [Any]   Mode [Any]   Readiness [50+]  |
|-------------------------------------------------------------------------------------|
| Tabs: All jobs | 30-day fit | 60-day fit | 90-day fit                               |
|-------------------------------------------------------------------------------------|
| Microsoft | Azure AD Engineer | Bengaluru | 30-40 LPA                               |
| Your readiness: 58%          Match: 74%                                             |
| Gaps: Conditional Access, PowerShell automation                                     |
| Next actions: Practice 6 questions, mini project, improve resume                    |
|                                                      [Analyze] [Save] [Track]       |
|-------------------------------------------------------------------------------------|
| Okta | IAM Engineer | Remote                                                        |
| Your readiness: 64%          Match: 78%                                             |
| Gaps: Access reviews, workflow automation                                           |
|                                                      [Analyze] [Save] [Track]       |
+-------------------------------------------------------------------------------------+
```

## Job Detail and JD Analyzer

```text
+-------------------------------------------------------------------------------------+
| Microsoft - Azure AD Engineer                                                       |
| Salary 30-40 LPA | Bengaluru | Mid-level                                            |
|-------------------------------------------------------------------------------------|
| Why this job fits you                                                               |
| - Strong overlap in Azure AD fundamentals                                           |
| - Experience gap is manageable in 90 days                                           |
|-------------------------------------------------------------------------------------|
| Critical gaps                                                                       |
| 1. Conditional Access                                                               |
| 2. Azure AD Connect                                                                 |
| 3. PowerShell automation                                                            |
|-------------------------------------------------------------------------------------|
| Predicted interview rounds                                                          |
| - Recruiter screen                                                                  |
| - Technical identity round                                                          |
| - Scenario / troubleshooting round                                                  |
|-------------------------------------------------------------------------------------|
| Recommended actions                                                   [Save job]     |
| [Create 14-day roadmap] [Tailor resume] [Add to applications]                      |
+-------------------------------------------------------------------------------------+
```

## Prep Page

```text
+-------------------------------------------------------------------------------------+
| Daily Career Training                                                               |
| 58% Ready | Day 4 of 14 | 6 tasks completed                                         |
|-------------------------------------------------------------------------------------|
| Today                                                                              |
| [ ] Practice 5 Azure AD questions                                                   |
|     20 min | Interview questions | Skill: Conditional Access                        |
| [ ] Watch Microsoft docs walkthrough                                                |
|     14 min | Learning resource | Skill: Azure AD Connect                            |
| [ ] Build mini-project: automate user provisioning                                  |
|     45 min | Proof of work | Skill: PowerShell automation                           |
|-------------------------------------------------------------------------------------|
| Upcoming                                                                             |
| Day 5 - Resume keyword pass                                                         |
| Day 6 - Mock technical answer drill (disabled card)                                 |
+-------------------------------------------------------------------------------------+
```

## Resume Page

```text
+-------------------------------------------------------------------------------------+
| Resume Optimizer                                                                    |
| Upload or paste your resume                                                         |
|-------------------------------------------------------------------------------------|
| ATS score: 71                                                                       |
| Missing keywords: Conditional Access, Graph API, Zero Trust                         |
|-------------------------------------------------------------------------------------|
| Suggested rewrites                                                                  |
| Before: Managed Azure AD tasks                                                      |
| After: Automated Azure AD lifecycle tasks using PowerShell...                       |
|-------------------------------------------------------------------------------------|
| Project suggestions                                                                 |
| - Build an Azure AD Conditional Access lab                                          |
| - Publish a PowerShell automation repo                                              |
|                                                             [Export optimized PDF]  |
+-------------------------------------------------------------------------------------+
```

## Applications CRM

```text
+-------------------------------------------------------------------------------------+
| Career CRM                                                                          |
|-------------------------------------------------------------------------------------|
| Saved           | Applied         | Screening       | Interview       | Offer       |
|-------------------------------------------------------------------------------------|
| Microsoft       | Contoso         | Example Inc     | Fabrikam        |             |
| Azure AD Eng    | IAM Engineer    | Identity Admin  | Cloud IAM Eng   |             |
| Next: Tailor CV | Next: Follow-up | Next: Recruiter | Next: Tech prep |             |
+-------------------------------------------------------------------------------------+
```

## Disabled Future Features

Placement:

- Dashboard right rail
- Prep page lower section
- Dedicated cards in navigation or feature grid

Card content:

```text
+----------------------------------------------------+
| AI mock interviews (audio)                         |
| Soon you can experience this.                      |
| [Disabled]                                         |
+----------------------------------------------------+
```

## Design System Notes

- Use a light, professional palette with a strong accent for readiness and actions.
- Readiness colors:
  - 0 to 39 red
  - 40 to 69 amber
  - 70 to 100 green
- Use one expressive display typeface for headings and a highly legible UI typeface for body text.
- Favor high information density in app views, but keep each card singular in purpose.

## Accessibility Requirements

- Minimum contrast ratio 4.5:1 for body text.
- Keyboard navigation for all filters, forms, and boards.
- Screen-reader labels for readiness meters and kanban drag-drop actions.
- Motion should be subtle and reducible with `prefers-reduced-motion`.

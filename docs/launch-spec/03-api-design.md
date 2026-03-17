# API Design

## API Principles

- Use authenticated server-side endpoints for all AI, scoring, and ingestion workflows.
- Keep the frontend thin: read data, render views, invoke commands.
- Return structured JSON, never prose blobs only.
- Store every AI output before returning it to the client.
- Require idempotency keys on expensive AI generation endpoints.

Base path:

- `/v1` for app APIs
- `/v1/admin` for operator APIs
- `/internal` for worker-only endpoints

Authentication:

- Supabase JWT bearer token for `/v1/*`
- Service token or signed internal secret for `/internal/*`

## Endpoint Summary

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/v1/onboarding/profile` | Save onboarding data and create baseline readiness |
| `GET` | `/v1/dashboard` | Return dashboard aggregate payload |
| `GET` | `/v1/jobs` | Search and filter jobs with readiness context |
| `GET` | `/v1/jobs/{jobId}` | Return full job detail |
| `POST` | `/v1/jobs/{jobId}/analyze` | Generate job-specific gap analysis |
| `POST` | `/v1/jobs/{jobId}/save` | Save a job for the user |
| `DELETE` | `/v1/jobs/{jobId}/save` | Unsave a job |
| `GET` | `/v1/jobs/{jobId}/resources` | Fetch ranked learning resources for gaps |
| `POST` | `/v1/prep/roadmaps` | Create prep roadmap |
| `GET` | `/v1/prep/today` | Fetch today's tasks and progress |
| `PATCH` | `/v1/prep/tasks/{taskId}` | Update task status |
| `POST` | `/v1/resumes` | Upload or paste a resume |
| `POST` | `/v1/resumes/{resumeId}/optimize` | Optimize resume against role or job |
| `POST` | `/v1/linkedin/optimize` | Optimize LinkedIn profile copy |
| `GET` | `/v1/applications` | Return CRM board data |
| `POST` | `/v1/applications` | Create application card |
| `PATCH` | `/v1/applications/{applicationId}` | Update stage, notes, and dates |
| `POST` | `/v1/readiness/recompute` | Force recompute after major changes |
| `GET` | `/v1/feature-flags` | Return feature availability |
| `POST` | `/v1/admin/job-sources` | Create or update scraping source |
| `POST` | `/v1/admin/jobs/ingest` | Trigger manual ingestion run |
| `POST` | `/internal/jobs/normalize` | Normalize raw jobs from worker queue |
| `POST` | `/internal/matches/recompute` | Recompute user-job matches in batch |

## Contracts

### 1. POST `/v1/onboarding/profile`

Purpose:

- Persist target role, company, salary, experience, skills, and preferences.
- Generate the user's first readiness snapshot and recommended actions.

Request:

```json
{
  "targetRole": "Azure AD Engineer",
  "targetCompany": "Microsoft",
  "salaryGoal": 3000000,
  "experienceLevel": "mid",
  "currentSkills": ["Azure AD", "PowerShell", "MFA"],
  "tools": ["Azure Portal", "Graph API"],
  "preferredLocations": ["Bengaluru", "Remote"],
  "preferredWorkModes": ["hybrid", "remote"]
}
```

Response:

```json
{
  "careerGoal": {
    "targetRole": "Azure AD Engineer",
    "targetCompany": "Microsoft"
  },
  "readiness": {
    "overallScore": 58,
    "topGaps": ["Conditional Access", "Azure AD Connect", "PowerShell automation"],
    "nextBestAction": {
      "title": "Analyze 3 relevant jobs",
      "route": "/app/jobs"
    }
  }
}
```

### 2. GET `/v1/dashboard`

Purpose:

- Return the control-center payload in one request.

Response shape:

```json
{
  "readiness": {
    "overallScore": 58,
    "delta7d": 6,
    "factorBreakdown": {
      "skillCoverage": 62,
      "proofOfWork": 41,
      "resumeFit": 54,
      "prepConsistency": 68,
      "roleClarity": 85,
      "applicationHygiene": 32
    }
  },
  "topGaps": ["Conditional Access", "Azure AD Connect", "PowerShell automation"],
  "todayTasks": [],
  "savedJobs": 9,
  "applications": {
    "saved": 4,
    "applied": 5,
    "interview": 1,
    "offer": 0
  },
  "nextBestAction": {
    "title": "Tailor resume for Microsoft IAM roles",
    "route": "/app/resume"
  }
}
```

### 3. GET `/v1/jobs`

Query params:

- `q`
- `location`
- `workMode`
- `experienceLevel`
- `salaryMin`
- `readinessMin`
- `page`
- `limit`

Response shape:

```json
{
  "items": [
    {
      "jobId": "uuid",
      "company": "Microsoft",
      "roleTitle": "Azure AD Engineer",
      "salaryRange": "30-40 LPA",
      "location": "Bengaluru",
      "readinessScore": 58,
      "matchScore": 74,
      "missingSkills": ["Conditional Access", "PowerShell automation"],
      "recommendedActions": [
        "Practice 6 interview questions",
        "Build mini project",
        "Improve resume"
      ]
    }
  ],
  "page": 1,
  "total": 240
}
```

Ranking rule:

- Default sort = opportunity score
- opportunity score = `0.60 * matchScore + 0.20 * salaryFit + 0.10 * freshness + 0.10 * aspirationMatch`

### 4. POST `/v1/jobs/{jobId}/analyze`

Headers:

- `Idempotency-Key: <uuid>`

Purpose:

- Generate a structured analysis for the selected job.

Request:

```json
{
  "resumeId": "uuid",
  "includeRoadmap": true
}
```

Response:

```json
{
  "analysisId": "uuid",
  "summary": "Role emphasizes Conditional Access design, Azure AD Connect, and PowerShell automation.",
  "keySkills": ["Conditional Access", "Azure AD Connect", "PowerShell"],
  "skillGaps": [
    {
      "skill": "Conditional Access",
      "importance": "high",
      "gapScore": 0.82
    }
  ],
  "interviewRounds": [
    {
      "name": "Technical round",
      "focus": ["Azure AD design", "Troubleshooting", "Automation"]
    }
  ],
  "prep48h": [],
  "prep2Week": [],
  "recommendedResumeChanges": []
}
```

### 5. POST `/v1/prep/roadmaps`

Purpose:

- Create a plan from onboarding context or a selected JD.

Request:

```json
{
  "jobId": "uuid",
  "durationDays": 14
}
```

Response:

```json
{
  "roadmapId": "uuid",
  "durationDays": 14,
  "todayTaskCount": 3,
  "tasks": [
    {
      "taskId": "uuid",
      "dayNumber": 1,
      "title": "Practice 5 Azure AD identity questions",
      "status": "todo"
    }
  ]
}
```

### 6. PATCH `/v1/prep/tasks/{taskId}`

Request:

```json
{
  "status": "done"
}
```

Response:

```json
{
  "taskId": "uuid",
  "status": "done",
  "roadmapProgress": 42,
  "updatedReadinessScore": 60
}
```

### 7. POST `/v1/resumes`

Modes:

- multipart upload for PDF or DOCX
- JSON body for pasted text

Response:

```json
{
  "resumeId": "uuid",
  "parsedSections": {
    "summary": "...",
    "experience": [],
    "skills": []
  },
  "detectedSkills": ["Azure AD", "PowerShell", "MFA"]
}
```

### 8. POST `/v1/resumes/{resumeId}/optimize`

Purpose:

- Generate ATS and role-fit improvements.

Request:

```json
{
  "jobId": "uuid",
  "targetRole": "Azure AD Engineer"
}
```

Response:

```json
{
  "atsScore": 71,
  "improvedBullets": [],
  "missingKeywords": ["Conditional Access", "Zero Trust", "Graph API"],
  "projectSuggestions": [
    "Build an Azure AD conditional access policy lab"
  ]
}
```

### 9. GET `/v1/applications`

Response:

```json
{
  "columns": {
    "saved": [],
    "applied": [],
    "screening": [],
    "interview": [],
    "offer": [],
    "rejected": []
  }
}
```

### 10. POST `/v1/applications`

Request:

```json
{
  "jobId": "uuid",
  "company": "Microsoft",
  "role": "Azure AD Engineer",
  "status": "saved",
  "salaryRange": "30-40 LPA"
}
```

### 11. POST `/v1/readiness/recompute`

Purpose:

- Manual recomputation after resume upload, roadmap completion, or career-goal edit.

Response:

```json
{
  "overallScore": 61,
  "topGaps": ["Conditional Access", "Azure AD Connect"],
  "nextBestAction": {
    "title": "Apply to 3 high-match jobs",
    "route": "/app/jobs"
  }
}
```

## Internal Worker Contracts

### POST `/internal/jobs/normalize`

Purpose:

- Convert raw scraped records into canonical `jobs` payloads.

Payload:

```json
{
  "sourceId": "uuid",
  "records": [
    {
      "externalId": "123",
      "title": "IAM Engineer",
      "company": "Example Corp",
      "location": "Remote",
      "description": "..."
    }
  ]
}
```

### POST `/internal/matches/recompute`

Purpose:

- Batch refresh of match scores for recently changed users or jobs.

Payload:

```json
{
  "userIds": ["uuid"],
  "jobIds": ["uuid"]
}
```

## Error Contract

Every error response should follow:

```json
{
  "error": {
    "code": "jd_analysis_failed",
    "message": "Unable to analyze this job description right now.",
    "traceId": "req_123"
  }
}
```

## Rate Limits

- Onboarding update: 10 per hour per user
- JD analyze: 20 per day per user
- Resume optimize: 10 per day per user
- Prep roadmap generation: 5 per day per user
- Admin ingestion trigger: 10 per hour per admin

## Analytics Events

- `onboarding_completed`
- `dashboard_viewed`
- `job_list_viewed`
- `job_saved`
- `job_analyzed`
- `roadmap_created`
- `prep_task_completed`
- `resume_uploaded`
- `resume_optimized`
- `application_created`
- `application_stage_changed`

import {
  type ApplicationCard,
  type DashboardPayload,
  type FeatureFlag,
  type JDAnalysis,
  type JobOpportunity,
  type ResourceRecommendation,
  type ResumeSuggestion
} from "@/lib/types";

export const dashboardPayload: DashboardPayload = {
  goal: {
    targetRole: "Azure AD Engineer",
    targetCompany: "Microsoft",
    salaryGoal: "30-40 LPA",
    experienceLevel: "Mid-level",
    preferredLocations: ["Bengaluru", "Remote"]
  },
  readiness: {
    overallScore: 58,
    delta7d: 6,
    topGaps: ["Conditional Access", "Azure AD Connect", "PowerShell automation"],
    nextBestAction: {
      title: "Tailor your resume for identity-focused platform teams.",
      route: "/app/resume",
      cta: "Optimize resume"
    },
    breakdown: [
      { label: "Skill coverage", score: 62 },
      { label: "Proof of work", score: 41 },
      { label: "Resume fit", score: 54 },
      { label: "Prep consistency", score: 68 },
      { label: "Role clarity", score: 85 },
      { label: "Application hygiene", score: 32 }
    ]
  },
  todayTasks: [
    {
      id: "task-1",
      title: "Practice 5 Azure AD identity questions",
      description: "Focus on Conditional Access tradeoffs and incident examples.",
      type: "Interview questions",
      duration: "20 min",
      status: "todo",
      skillTag: "Conditional Access"
    },
    {
      id: "task-2",
      title: "Review Azure AD Connect sync patterns",
      description: "Read the official sync topology and failure recovery notes.",
      type: "Reading",
      duration: "14 min",
      status: "todo",
      skillTag: "Azure AD Connect"
    },
    {
      id: "task-3",
      title: "Build a mini PowerShell automation lab",
      description: "Automate user provisioning and group assignment end to end.",
      type: "Mini-project",
      duration: "45 min",
      status: "in_progress",
      skillTag: "PowerShell automation"
    }
  ],
  topJobs: [
    {
      id: "job-1",
      company: "Microsoft",
      roleTitle: "Azure AD Engineer",
      salaryRange: "30-40 LPA",
      location: "Bengaluru",
      workMode: "Hybrid",
      experienceLevel: "Mid-level",
      readinessScore: 58,
      matchScore: 74,
      missingSkills: ["Conditional Access", "PowerShell automation"],
      recommendedActions: [
        "Practice 6 interview questions",
        "Build mini project",
        "Improve resume"
      ]
    },
    {
      id: "job-2",
      company: "Okta",
      roleTitle: "IAM Engineer",
      salaryRange: "28-36 LPA",
      location: "Remote",
      workMode: "Remote",
      experienceLevel: "Mid-level",
      readinessScore: 64,
      matchScore: 78,
      missingSkills: ["Access reviews", "Workflow automation"],
      recommendedActions: [
        "Publish a proof-of-work repo",
        "Update keyword coverage",
        "Save and track application"
      ]
    },
    {
      id: "job-3",
      company: "Accenture",
      roleTitle: "Cloud Identity Engineer",
      salaryRange: "24-30 LPA",
      location: "Hyderabad",
      workMode: "Hybrid",
      experienceLevel: "Mid-level",
      readinessScore: 69,
      matchScore: 81,
      missingSkills: ["Zero Trust policy design"],
      recommendedActions: [
        "Analyze the JD",
        "Refine project bullets",
        "Apply this week"
      ]
    }
  ],
  resources: [
    {
      id: "res-1",
      title: "Conditional Access Fundamentals",
      source: "Microsoft Learn",
      duration: "14 min",
      difficulty: "Beginner",
      skillTag: "Conditional Access"
    },
    {
      id: "res-2",
      title: "PowerShell Automation for Identity Teams",
      source: "YouTube",
      duration: "21 min",
      difficulty: "Intermediate",
      skillTag: "PowerShell automation"
    },
    {
      id: "res-3",
      title: "Azure AD Connect Health Walkthrough",
      source: "Official docs",
      duration: "12 min",
      difficulty: "Intermediate",
      skillTag: "Azure AD Connect"
    }
  ],
  metrics: [
    { label: "Saved jobs", value: "9", note: "3 high-fit roles added this week" },
    { label: "Active roadmap", value: "Day 4/14", note: "6 tasks completed" },
    { label: "Applications", value: "5", note: "1 recruiter screen scheduled" },
    { label: "Resume ATS", value: "71", note: "3 keywords missing for target roles" }
  ]
};

export const jobs: JobOpportunity[] = [
  ...dashboardPayload.topJobs,
  {
    id: "job-4",
    company: "Infosys",
    roleTitle: "Azure Identity Administrator",
    salaryRange: "18-24 LPA",
    location: "Pune",
    workMode: "Onsite",
    experienceLevel: "Junior to Mid",
    readinessScore: 76,
    matchScore: 82,
    missingSkills: ["Graph API scripting"],
    recommendedActions: ["Review Graph API basics", "Tailor resume", "Track follow-up plan"]
  },
  {
    id: "job-5",
    company: "Deloitte",
    roleTitle: "Cloud IAM Specialist",
    salaryRange: "25-32 LPA",
    location: "Hyderabad",
    workMode: "Hybrid",
    experienceLevel: "Mid-level",
    readinessScore: 61,
    matchScore: 73,
    missingSkills: ["Privileged identity management", "Access certification"],
    recommendedActions: ["Create 14-day roadmap", "Study PIM", "Share proof of work"]
  }
];

export const jdAnalysis: JDAnalysis = {
  summary:
    "This role values hands-on Azure AD design, Conditional Access policy decisions, and strong troubleshooting with Azure AD Connect and PowerShell.",
  keySkills: ["Conditional Access", "Azure AD Connect", "PowerShell", "Zero Trust", "Graph API"],
  criticalGaps: [
    {
      skill: "Conditional Access",
      importance: "High",
      note: "The JD references policy design and exception handling, not just configuration."
    },
    {
      skill: "Azure AD Connect",
      importance: "High",
      note: "Troubleshooting sync issues is called out in responsibilities."
    },
    {
      skill: "PowerShell automation",
      importance: "Medium",
      note: "Automation is used to separate stronger candidates from operators."
    }
  ],
  interviewRounds: [
    {
      name: "Recruiter screen",
      focus: ["Role motivation", "Communication", "Target company fit"]
    },
    {
      name: "Identity technical round",
      focus: ["Conditional Access", "Azure AD Connect", "Authentication flows"]
    },
    {
      name: "Scenario round",
      focus: ["Troubleshooting", "Policy design tradeoffs", "Automation choices"]
    }
  ]
};

export const resumeSuggestions: ResumeSuggestion[] = [
  {
    before: "Managed Azure AD tasks and user access requests.",
    after:
      "Automated Azure AD user lifecycle workflows with PowerShell, reducing manual provisioning effort and improving access consistency."
  },
  {
    before: "Worked on security and account setup.",
    after:
      "Configured MFA and identity governance controls across Azure AD environments, strengthening policy compliance for enterprise access."
  }
];

export const linkedinSuggestions = [
  "Rewrite headline to emphasize Azure AD, IAM, and automation outcomes.",
  "Add role keywords such as Conditional Access, Zero Trust, and PowerShell.",
  "Show one proof-of-work project instead of generic technology lists."
];

export const applications: Record<string, ApplicationCard[]> = {
  saved: [
    {
      id: "app-1",
      company: "Microsoft",
      role: "Azure AD Engineer",
      nextAction: "Tailor CV before Friday",
      status: "saved"
    }
  ],
  applied: [
    {
      id: "app-2",
      company: "Okta",
      role: "IAM Engineer",
      nextAction: "Send follow-up on Thursday",
      status: "applied"
    }
  ],
  screening: [
    {
      id: "app-3",
      company: "Accenture",
      role: "Cloud Identity Engineer",
      nextAction: "Prepare recruiter story arc",
      status: "screening"
    }
  ],
  interview: [
    {
      id: "app-4",
      company: "Contoso",
      role: "Platform IAM Specialist",
      nextAction: "Rehearse PowerShell lab walkthrough",
      status: "interview"
    }
  ],
  offer: [],
  rejected: [
    {
      id: "app-5",
      company: "Example Corp",
      role: "Identity Analyst",
      nextAction: "Log learnings and move on",
      status: "rejected"
    }
  ]
};

export const featureFlags: FeatureFlag[] = [
  {
    key: "mock-interview-audio",
    label: "AI mock interviews (audio)",
    status: "disabled",
    description: "Soon you can experience this."
  },
  {
    key: "mock-interview-video",
    label: "AI mock interviews (video)",
    status: "disabled",
    description: "Soon you can experience this."
  },
  {
    key: "live-recruiter-interviews",
    label: "Live recruiter interviews",
    status: "disabled",
    description: "Soon you can experience this."
  },
  {
    key: "offer-negotiation-assistant",
    label: "Offer negotiation assistant",
    status: "disabled",
    description: "Soon you can experience this."
  }
];

export const onboardingRoleOptions = [
  "Azure AD Engineer",
  "IAM Engineer",
  "Cloud Identity Engineer",
  "Okta Engineer"
];


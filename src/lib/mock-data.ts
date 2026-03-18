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
    "This role values hands-on Azure AD design, Conditional Access policy decisions, and strong troubleshooting with Azure AD Connect and PowerShell. The strongest signal is practical identity ownership backed by crisp incident stories and automation examples.",
  keySkills: ["Conditional Access", "Azure AD Connect", "PowerShell", "Zero Trust", "Graph API"],
  whatMattersMost: [
    {
      step: 1,
      title: "Identity Architecture Judgment",
      confidence: 95,
      explanation: "The role expects policy decisions, exception handling, and trade-off thinking, not just ticket execution."
    },
    {
      step: 2,
      title: "Operational Troubleshooting",
      confidence: 89,
      explanation: "Azure AD Connect and hybrid sync issues point to a strong need for calm root-cause analysis."
    },
    {
      step: 3,
      title: "Automation Muscle",
      confidence: 84,
      explanation: "PowerShell and Graph API are likely used to separate operators from engineers."
    },
    {
      step: 4,
      title: "Security-First Communication",
      confidence: 78,
      explanation: "You will need to explain policy impact clearly to admins, auditors, and business stakeholders."
    },
    {
      step: 5,
      title: "Zero Trust Thinking",
      confidence: 74,
      explanation: "The JD rewards candidates who can connect authentication, device posture, and access policy design."
    }
  ],
  criticalGaps: [
    {
      skill: "Conditional Access",
      importance: "High",
      note: "The JD references policy design and exception handling, not just configuration.",
      suggestedActions: ["Prepare 2 policy design stories", "Rehearse one exception-handling tradeoff"]
    },
    {
      skill: "Azure AD Connect",
      importance: "High",
      note: "Troubleshooting sync issues is called out in responsibilities.",
      suggestedActions: ["Study sync failure patterns", "Map one incident from detection to fix"]
    },
    {
      skill: "PowerShell automation",
      importance: "Medium",
      note: "Automation is used to separate stronger candidates from operators.",
      suggestedActions: ["Build one provisioning script", "Explain why automation reduced risk"]
    }
  ],
  employerSignals: [
    {
      label: "Hands-on ownership",
      explanation: "This team likely wants someone who can move from access design to execution without hand-holding.",
      prepAction: "Prepare one story where you owned a change end to end."
    },
    {
      label: "Hybrid environment pressure",
      explanation: "Mention of Azure AD Connect suggests the interviewer may test on messy real-world hybrid identity operations.",
      prepAction: "Rehearse one sync troubleshooting incident with clear sequencing."
    },
    {
      label: "Security posture over checkbox setup",
      explanation: "Conditional Access and Zero Trust language signal that security reasoning matters more than rote implementation.",
      prepAction: "Show how you balanced user friction with risk reduction."
    }
  ],
  interviewRounds: [
    {
      step: 1,
      name: "Recruiter screen",
      likelihood: 100,
      gate: true,
      difficulty: "Easy",
      duration: "30 min",
      format: "Screening",
      description: "Expect motivation, role-fit, and compensation calibration before the technical loop starts.",
      focus: ["Role motivation", "Communication", "Target company fit"]
    },
    {
      step: 2,
      name: "Identity technical round",
      likelihood: 90,
      gate: true,
      difficulty: "Medium",
      duration: "60 min",
      format: "Technical panel",
      description: "This round will likely test identity design judgment, troubleshooting depth, and policy tradeoffs.",
      focus: ["Conditional Access", "Azure AD Connect", "Authentication flows"]
    },
    {
      step: 3,
      name: "Scenario round",
      likelihood: 78,
      gate: true,
      difficulty: "Medium",
      duration: "45 min",
      format: "Case discussion",
      description: "Expect troubleshooting prompts that force you to talk through diagnosis, decisions, and recovery.",
      focus: ["Troubleshooting", "Policy design tradeoffs", "Automation choices"]
    },
    {
      step: 4,
      name: "Leadership / stakeholder round",
      likelihood: 62,
      gate: false,
      difficulty: "Medium",
      duration: "45 min",
      format: "Behavioral",
      description: "This final screen often checks communication maturity, incident ownership, and cross-team trust.",
      focus: ["Stakeholder management", "Security communication", "Incident ownership"]
    }
  ],
  prep48h: [
    {
      step: 1,
      title: "Rebuild your Conditional Access mental model",
      duration: "90 min",
      resources: ["Microsoft Learn", "Your own incident notes"],
      note: "Focus on policy conditions, exclusions, and rollout mistakes."
    },
    {
      step: 2,
      title: "Prepare 2 Azure AD Connect troubleshooting stories",
      duration: "75 min",
      resources: ["Personal journal", "Past tickets"],
      note: "Keep the story sequence simple: symptom, diagnosis, fix, prevention."
    },
    {
      step: 3,
      title: "Practice one automation walkthrough",
      duration: "45 min",
      resources: ["PowerShell repo", "Graph API notes"],
      note: "Explain the business reason, not just the code."
    }
  ],
  prep2Week: [
    {
      step: 1,
      title: "Map all top identity themes from the JD",
      duration: "Day 1",
      resources: ["JD notes", "Company research"],
      note: "Turn the role into 4 to 5 interview-ready themes."
    },
    {
      step: 2,
      title: "Build one identity proof-of-work example",
      duration: "Days 2-5",
      resources: ["Lab tenant", "GitHub"],
      note: "A mini project helps you talk beyond theory."
    },
    {
      step: 3,
      title: "Rehearse 5 core interview stories",
      duration: "Days 6-9",
      resources: ["Story bank", "Voice notes"],
      note: "Cover troubleshooting, automation, stakeholder alignment, outage handling, and policy design."
    },
    {
      step: 4,
      title: "Simulate the technical loop",
      duration: "Days 10-12",
      resources: ["Mock interview", "Prep tracker"],
      note: "Practice answering out loud with structure, not bullet memorization."
    },
    {
      step: 5,
      title: "Tighten resume and final role fit",
      duration: "Days 13-14",
      resources: ["Resume workspace", "Saved jobs"],
      note: "Make sure your pitch and resume now match the signals from the JD."
    }
  ],
  generalTips: [
    "Lead with one sentence on business impact before you go technical.",
    "Use troubleshooting stories that show sequence, calm thinking, and prevention.",
    "Quantify improvements in reliability, automation, or incident resolution wherever possible."
  ],
  confidenceScores: {
    skillExtraction: 95,
    roundPrediction: 87,
    seniority: 91,
    companyMatch: 89
  },
  seniority: "Mid",
  geography: "Global/Remote or Hybrid (US/India hubs)",
  jobFamily: "Identity & Access",
  functionArea: "Cloud Security"
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

export interface CareerGoal {
  targetRole: string;
  targetCompany: string;
  salaryGoal: string;
  experienceLevel: string;
  preferredLocations: string[];
}

export interface ReadinessBreakdown {
  label: string;
  score: number;
}

export interface ReadinessSnapshot {
  overallScore: number;
  delta7d: number;
  topGaps: string[];
  nextBestAction: {
    title: string;
    route: string;
    cta: string;
  };
  breakdown: ReadinessBreakdown[];
}

export interface PrepTask {
  id: string;
  title: string;
  description: string;
  type: string;
  duration: string;
  status: "todo" | "done" | "in_progress";
  skillTag: string;
}

export interface JobOpportunity {
  id: string;
  company: string;
  roleTitle: string;
  salaryRange: string;
  location: string;
  workMode: string;
  experienceLevel: string;
  readinessScore: number;
  matchScore: number;
  missingSkills: string[];
  recommendedActions: string[];
}

export interface ResourceRecommendation {
  id: string;
  title: string;
  source: string;
  duration: string;
  difficulty: string;
  skillTag: string;
  url?: string;
}

export interface JDAnalysis {
  summary: string;
  keySkills: string[];
  criticalGaps: { skill: string; importance: string; note: string }[];
  interviewRounds: { name: string; focus: string[] }[];
}

export interface ResumeSuggestion {
  before: string;
  after: string;
}

export interface ApplicationCard {
  id: string;
  company: string;
  role: string;
  nextAction: string;
  status: ApplicationStage;
}

export type ApplicationStage =
  | "saved"
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "rejected";

export interface FeatureFlag {
  key: string;
  label: string;
  status: "active" | "disabled";
  description: string;
}

export interface DashboardPayload {
  goal: CareerGoal;
  readiness: ReadinessSnapshot;
  todayTasks: PrepTask[];
  topJobs: JobOpportunity[];
  resources: ResourceRecommendation[];
  metrics: {
    label: string;
    value: string;
    note: string;
  }[];
}

export interface PrepPlanPayload {
  roadmap: {
    id: string;
    role: string;
    company: string;
    durationDays: number;
    startDate: string | null;
    endDate: string | null;
  } | null;
  tasks: PrepTask[];
  resources: ResourceRecommendation[];
  focusSkills: string[];
}

export interface OnboardingInput {
  targetRole: string;
  targetCompany: string;
  salaryGoal: string;
  experienceLevel: string;
  currentSkills: string[];
  preferredLocations: string[];
}

export interface OnboardingResult {
  source: "mock" | "supabase";
  careerGoal: CareerGoal;
  readiness: ReadinessSnapshot;
}

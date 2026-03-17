import {
  BriefcaseBusiness,
  Gauge,
  Link2,
  Map,
  MessageSquare,
  NotebookText,
  ScanSearch,
  ScrollText,
  Sparkles,
  Target
} from "lucide-react";

export interface AppNavigationItem {
  label: string;
  to: string;
  icon: typeof Sparkles;
}

export const preparationNavigation: AppNavigationItem[] = [
  { label: "Start Here", to: "/app/onboarding", icon: Sparkles },
  { label: "Job Description", to: "/app/jd", icon: ScanSearch },
  { label: "Resume", to: "/app/resume", icon: ScrollText },
  { label: "Skill Gap", to: "/app/skill-gap", icon: Target },
  { label: "Job Discovery", to: "/app/jobs", icon: BriefcaseBusiness },
  { label: "Interview Practice", to: "/app/interview-practice", icon: MessageSquare },
  { label: "Prep Roadmap", to: "/app/prep", icon: Map }
];

export const analysisNavigation: AppNavigationItem[] = [
  { label: "Dashboard", to: "/app/dashboard", icon: Gauge },
  { label: "Applications", to: "/app/tracker", icon: NotebookText }
];

export const finalNavigation: AppNavigationItem[] = [
  { label: "LinkedIn Profile", to: "/app/linkedin", icon: Link2 }
];

export const mobileNavigation: AppNavigationItem[] = [
  ...preparationNavigation,
  ...analysisNavigation,
  ...finalNavigation
];

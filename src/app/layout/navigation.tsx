import {
  BriefcaseBusiness,
  Gauge,
  Link2,
  NotebookText,
  ScanSearch,
  ScrollText,
  Sparkles,
  Target
} from "lucide-react";

export const mainNavigation = [
  { label: "Dashboard", to: "/app/dashboard", icon: Gauge },
  { label: "Jobs", to: "/app/jobs", icon: BriefcaseBusiness },
  { label: "Prep", to: "/app/prep", icon: Target },
  { label: "Resume", to: "/app/resume", icon: ScrollText },
  { label: "LinkedIn", to: "/app/linkedin", icon: Link2 },
  { label: "JD Analyzer", to: "/app/jd", icon: ScanSearch },
  { label: "Applications", to: "/app/tracker", icon: NotebookText }
];

export const secondaryNavigation = [
  { label: "Onboarding", to: "/app/onboarding", icon: Sparkles }
];


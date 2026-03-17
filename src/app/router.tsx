import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { RequireAuth } from "@/app/auth/RequireAuth";
import { AppShell } from "@/app/layout/AppShell";
import { RouteFallback } from "@/components/RouteFallback";

const LandingPage = lazy(async () => ({
  default: (await import("@/app/pages/LandingPage")).LandingPage
}));

const AuthPage = lazy(async () => ({
  default: (await import("@/app/pages/AuthPage")).AuthPage
}));

const DashboardPage = lazy(async () => ({
  default: (await import("@/app/pages/DashboardPage")).DashboardPage
}));

const JobsPage = lazy(async () => ({
  default: (await import("@/app/pages/JobsPage")).JobsPage
}));

const PrepPage = lazy(async () => ({
  default: (await import("@/app/pages/PrepPage")).PrepPage
}));

const ResumePage = lazy(async () => ({
  default: (await import("@/app/pages/ResumePage")).ResumePage
}));

const LinkedInPage = lazy(async () => ({
  default: (await import("@/app/pages/LinkedInPage")).LinkedInPage
}));

const JDAnalyzerPage = lazy(async () => ({
  default: (await import("@/app/pages/JDAnalyzerPage")).JDAnalyzerPage
}));

const ApplicationsPage = lazy(async () => ({
  default: (await import("@/app/pages/ApplicationsPage")).ApplicationsPage
}));

const OnboardingPage = lazy(async () => ({
  default: (await import("@/app/pages/OnboardingPage")).OnboardingPage
}));

function suspense(element: ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: suspense(<LandingPage />)
  },
  {
    path: "/auth",
    element: suspense(<AuthPage />)
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: "/app",
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="/app/dashboard" replace /> },
          { path: "dashboard", element: suspense(<DashboardPage />) },
          { path: "jobs", element: suspense(<JobsPage />) },
          { path: "prep", element: suspense(<PrepPage />) },
          { path: "resume", element: suspense(<ResumePage />) },
          { path: "linkedin", element: suspense(<LinkedInPage />) },
          { path: "jd", element: suspense(<JDAnalyzerPage />) },
          { path: "tracker", element: suspense(<ApplicationsPage />) },
          { path: "onboarding", element: suspense(<OnboardingPage />) }
        ]
      }
    ]
  }
]);

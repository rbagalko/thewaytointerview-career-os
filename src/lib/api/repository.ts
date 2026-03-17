import {
  applications,
  dashboardPayload,
  featureFlags,
  jdAnalysis,
  jobs,
  linkedinSuggestions,
  resumeSuggestions
} from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";
import {
  type ApplicationCard,
  type ApplicationStage,
  type DashboardPayload,
  type FeatureFlag,
  type JDAnalysis,
  type JobOpportunity,
  type OnboardingInput,
  type OnboardingResult,
  type ResumeSuggestion
} from "@/lib/types";

function filterJobs(items: JobOpportunity[], query: string, readinessMin: number) {
  const normalized = query.trim().toLowerCase();

  return items.filter((job) => {
    const matchesQuery =
      !normalized ||
      `${job.company} ${job.roleTitle} ${job.location}`.toLowerCase().includes(normalized);

    return matchesQuery && job.readinessScore >= readinessMin;
  });
}

function parseSalaryGoal(input: string) {
  const normalized = input.trim().toLowerCase();
  const numeric = Number.parseFloat(normalized.replace(/[^0-9.]/g, ""));

  if (!Number.isFinite(numeric)) {
    return null;
  }

  if (normalized.includes("lpa")) {
    return Math.round(numeric * 100_000);
  }

  if (normalized.includes("k")) {
    return Math.round(numeric * 1_000);
  }

  return Math.round(numeric);
}

function plusDaysDateString(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function formatNextAction(date: string | null, note?: string | null) {
  if (note?.trim()) {
    return note.trim();
  }

  if (!date) {
    return "Review this role and set your next action.";
  }

  return `Next action by ${new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short"
  }).format(new Date(date))}`;
}

function mapExperienceLevel(value: string) {
  const normalized = value.trim().toLowerCase();

  if (normalized.includes("entry")) {
    return "entry";
  }

  if (normalized.includes("junior")) {
    return "junior";
  }

  if (normalized.includes("senior")) {
    return "senior";
  }

  if (normalized.includes("lead")) {
    return "lead";
  }

  return "mid";
}

function formatSalaryGoal(value: number | null, fallback: string) {
  if (value == null) {
    return fallback;
  }

  if (value >= 100_000) {
    return `${Math.round(value / 100_000)} LPA`;
  }

  return value.toLocaleString("en-IN");
}

function buildFallbackDashboard(): DashboardPayload {
  return {
    ...dashboardPayload,
    goal: {
      targetRole: "Set your target role",
      targetCompany: "Choose your target company",
      salaryGoal: "Define your goal",
      experienceLevel: "Not set",
      preferredLocations: []
    },
    readiness: {
      overallScore: 0,
      delta7d: 0,
      topGaps: [],
      nextBestAction: {
        title: "Complete onboarding to generate your first readiness snapshot.",
        route: "/app/onboarding",
        cta: "Finish onboarding"
      },
      breakdown: [
        { label: "Skill coverage", score: 0 },
        { label: "Proof of work", score: 0 },
        { label: "Resume fit", score: 0 },
        { label: "Prep consistency", score: 0 },
        { label: "Role clarity", score: 0 },
        { label: "Application hygiene", score: 0 }
      ]
    },
    todayTasks: [],
    topJobs: [],
    metrics: [
      { label: "Saved jobs", value: "0", note: "Save roles once onboarding is complete" },
      { label: "Active roadmap", value: "None", note: "Generate a prep roadmap from a JD" },
      { label: "Applications", value: "0", note: "Track your pipeline in the CRM board" },
      { label: "Resume ATS", value: "0", note: "Upload a resume to score role fit" }
    ]
  };
}

function emptyApplicationsBoard(): Record<ApplicationStage, ApplicationCard[]> {
  return {
    saved: [],
    applied: [],
    screening: [],
    interview: [],
    offer: [],
    rejected: []
  };
}

async function getCurrentUserId() {
  if (!supabase) {
    return null;
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}

function mapJobOpportunity(record: Record<string, unknown>): JobOpportunity {
  return {
    id: String(record.job_id),
    company: String(record.company ?? ""),
    roleTitle: String(record.role_title ?? ""),
    salaryRange: String(record.salary_range ?? "Comp not listed"),
    location: String(record.location ?? "Location flexible"),
    workMode: String(record.work_mode ?? "unknown"),
    experienceLevel: String(record.experience_level ?? "mid"),
    readinessScore: Number(record.readiness_score ?? 0),
    matchScore: Number(record.match_score ?? 0),
    missingSkills: Array.isArray(record.missing_skills)
      ? record.missing_skills.map((value) => String(value))
      : [],
    recommendedActions: Array.isArray(record.recommended_actions)
      ? record.recommended_actions.map((value) => String(value))
      : []
  };
}

function buildJobMetadata(job: JobOpportunity) {
  return {
    readinessScore: job.readinessScore,
    matchScore: job.matchScore,
    missingSkills: job.missingSkills,
    recommendedActions: job.recommendedActions
  };
}

async function ensureJobSaved(userId: string, jobId: string) {
  if (!supabase) {
    return;
  }

  const { error } = await supabase.from("job_saved").upsert(
    {
      user_id: userId,
      job_id: jobId
    },
    {
      onConflict: "user_id,job_id"
    }
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function getDashboard(): Promise<DashboardPayload> {
  if (!supabase) {
    return dashboardPayload;
  }

  const userId = await getCurrentUserId();

  if (!userId) {
    return dashboardPayload;
  }

  const [goalResult, readinessResult, tasksResult, jobsResult, resumeResult, applicationsResult, savedJobsResult] =
    await Promise.all([
      supabase
        .from("career_goals")
        .select("target_role, target_company, salary_goal, experience_level, desired_locations")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("readiness_snapshots")
        .select(
          "overall_score, top_gaps, next_best_action, skill_coverage_score, proof_of_work_score, resume_fit_score, prep_consistency_score, role_clarity_score, application_hygiene_score, created_at"
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("prep_tasks")
        .select("id, title, description, task_type, duration_minutes, status, skill_tags")
        .eq("user_id", userId)
        .order("day_number", { ascending: true })
        .limit(3),
      supabase.rpc("get_job_discovery", {
        p_query: "",
        p_readiness_min: 0,
        p_limit: 3
      }),
      supabase
        .from("resumes")
        .select("ats_score")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from("applications").select("status").eq("user_id", userId),
      supabase.from("job_saved").select("id").eq("user_id", userId)
    ]);

  if (
    goalResult.error ||
    readinessResult.error ||
    tasksResult.error ||
    jobsResult.error ||
    resumeResult.error ||
    applicationsResult.error ||
    savedJobsResult.error
  ) {
    throw new Error(
      goalResult.error?.message ||
        readinessResult.error?.message ||
        tasksResult.error?.message ||
        jobsResult.error?.message ||
        resumeResult.error?.message ||
        applicationsResult.error?.message ||
        savedJobsResult.error?.message ||
        "Unable to load dashboard data."
    );
  }

  if (!goalResult.data || !readinessResult.data) {
    return buildFallbackDashboard();
  }

  const appCounts = (applicationsResult.data ?? []).reduce<Record<string, number>>(
    (accumulator, item) => {
      const status = item.status as ApplicationStage;
      if (status in accumulator) {
        accumulator[status] += 1;
      }
      return accumulator;
    },
    {
      saved: 0,
      applied: 0,
      screening: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
      archived: 0
    }
  );

  const activeApplicationCount = (applicationsResult.data ?? []).filter(
    (item) => item.status !== "saved" && item.status !== "archived"
  ).length;

  const readiness = readinessResult.data;
  const nextBestAction =
    readiness.next_best_action && typeof readiness.next_best_action === "object"
      ? (readiness.next_best_action as {
          title?: string;
          route?: string;
          cta?: string;
        })
      : null;

  const topJobs = Array.isArray(jobsResult.data)
    ? jobsResult.data.map((item) => mapJobOpportunity(item as Record<string, unknown>))
    : [];

  const experienceLevelLabel =
    goalResult.data.experience_level === "entry"
      ? "Entry-level"
      : goalResult.data.experience_level === "junior"
        ? "Junior"
        : goalResult.data.experience_level === "senior"
          ? "Senior"
          : goalResult.data.experience_level === "lead"
            ? "Lead"
            : "Mid-level";

  return {
    goal: {
      targetRole: goalResult.data.target_role ?? "Set your target role",
      targetCompany: goalResult.data.target_company ?? "Choose your target company",
      salaryGoal: formatSalaryGoal(goalResult.data.salary_goal, "Define your goal"),
      experienceLevel: experienceLevelLabel,
      preferredLocations: goalResult.data.desired_locations ?? []
    },
    readiness: {
      overallScore: Number(readiness.overall_score ?? 0),
      delta7d: 0,
      topGaps: readiness.top_gaps ?? [],
      nextBestAction: {
        title: nextBestAction?.title ?? "Create your first roadmap.",
        route: nextBestAction?.route ?? "/app/prep",
        cta: nextBestAction?.cta ?? "Open roadmap"
      },
      breakdown: [
        { label: "Skill coverage", score: Number(readiness.skill_coverage_score ?? 0) },
        { label: "Proof of work", score: Number(readiness.proof_of_work_score ?? 0) },
        { label: "Resume fit", score: Number(readiness.resume_fit_score ?? 0) },
        { label: "Prep consistency", score: Number(readiness.prep_consistency_score ?? 0) },
        { label: "Role clarity", score: Number(readiness.role_clarity_score ?? 0) },
        { label: "Application hygiene", score: Number(readiness.application_hygiene_score ?? 0) }
      ]
    },
    todayTasks: (tasksResult.data ?? []).map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description ?? "",
      type: task.task_type,
      duration: task.duration_minutes ? `${task.duration_minutes} min` : "Flexible",
      status: task.status === "done" ? "done" : task.status === "in_progress" ? "in_progress" : "todo",
      skillTag: task.skill_tags?.[0] ?? "Readiness"
    })),
    topJobs,
    resources: dashboardPayload.resources,
    metrics: [
      {
        label: "Saved jobs",
        value: String((savedJobsResult.data ?? []).length),
        note: (savedJobsResult.data ?? []).length
          ? "Shortlisted from job discovery"
          : "Save roles you want to revisit"
      },
      {
        label: "Active roadmap",
        value: tasksResult.data?.length ? `${tasksResult.data.length} live tasks` : "None",
        note: "Prep tasks are tied to your readiness engine"
      },
      {
        label: "Applications",
        value: String(activeApplicationCount),
        note: appCounts.interview ? `${appCounts.interview} interview stage` : "No active interview stages yet"
      },
      {
        label: "Resume ATS",
        value: resumeResult.data?.ats_score ? String(Math.round(resumeResult.data.ats_score)) : "0",
        note: "Latest stored resume score"
      }
    ]
  };
}

export async function getJobs(query = "", readinessMin = 0): Promise<JobOpportunity[]> {
  if (!supabase) {
    return filterJobs(jobs, query, readinessMin);
  }

  const userId = await getCurrentUserId();

  if (!userId) {
    return filterJobs(jobs, query, readinessMin);
  }

  const { data, error } = await supabase.rpc("get_job_discovery", {
    p_query: query,
    p_readiness_min: readinessMin,
    p_limit: 24
  });

  if (error) {
    throw new Error(error.message);
  }

  return Array.isArray(data)
    ? data.map((item) => mapJobOpportunity(item as Record<string, unknown>))
    : [];
}

export async function getJDAnalysis(): Promise<JDAnalysis> {
  return jdAnalysis;
}

export async function getResumeSuggestions(): Promise<ResumeSuggestion[]> {
  return resumeSuggestions;
}

export async function getLinkedInSuggestions(): Promise<string[]> {
  return linkedinSuggestions;
}

export async function getApplications() {
  if (!supabase) {
    return applications;
  }

  const userId = await getCurrentUserId();

  if (!userId) {
    return applications;
  }

  const { data, error } = await supabase
    .from("applications")
    .select("id, company, role, status, next_action_date, stage_name, notes, created_at")
    .eq("user_id", userId)
    .neq("status", "archived")
    .order("position_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const grouped = emptyApplicationsBoard();

  for (const item of data ?? []) {
    const status = item.status as ApplicationStage;

    if (!(status in grouped)) {
      continue;
    }

    grouped[status].push({
      id: item.id,
      company: item.company,
      role: item.role,
      status,
      nextAction: formatNextAction(item.next_action_date, item.notes ?? item.stage_name)
    });
  }

  return grouped;
}

export async function getFeatureFlags(): Promise<FeatureFlag[]> {
  return featureFlags;
}

export async function saveJob(job: JobOpportunity) {
  if (!supabase) {
    return { source: "mock" as const };
  }

  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error("Sign in to save jobs.");
  }

  await ensureJobSaved(userId, job.id);

  return { source: "supabase" as const };
}

export async function trackJob(job: JobOpportunity) {
  if (!supabase) {
    return { source: "mock" as const };
  }

  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error("Sign in to track jobs.");
  }

  await ensureJobSaved(userId, job.id);

  const { data: existing, error: existingError } = await supabase
    .from("applications")
    .select("id, next_action_date")
    .eq("user_id", userId)
    .eq("job_id", job.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  const nextActionDate = plusDaysDateString(3);

  if (existing?.id) {
    if (!existing.next_action_date) {
      const { error } = await supabase
        .from("applications")
        .update({
          next_action_date: nextActionDate,
          notes: "Review fit and decide whether to apply this week."
        })
        .eq("id", existing.id);

      if (error) {
        throw new Error(error.message);
      }
    }

    return {
      source: "supabase" as const,
      nextActionDate
    };
  }

  const { error } = await supabase.from("applications").insert({
    user_id: userId,
    job_id: job.id,
    company: job.company,
    role: job.roleTitle,
    status: "saved",
    source: "job_discovery",
    salary_range: job.salaryRange,
    next_action_date: nextActionDate,
    stage_name: "Saved",
    notes: "Review fit and decide whether to apply this week.",
    metadata: buildJobMetadata(job)
  });

  if (error) {
    if ("code" in error && error.code === "23505") {
      return {
        source: "supabase" as const,
        nextActionDate
      };
    }

    throw new Error(error.message);
  }

  return {
    source: "supabase" as const,
    nextActionDate
  };
}

export async function submitOnboarding(input: OnboardingInput): Promise<OnboardingResult> {
  const fallbackReadinessScore = Math.min(82, 38 + input.currentSkills.length * 5);
  const fallback: OnboardingResult = {
    source: "mock",
    careerGoal: {
      targetRole: input.targetRole,
      targetCompany: input.targetCompany,
      salaryGoal: input.salaryGoal,
      experienceLevel: input.experienceLevel,
      preferredLocations: input.preferredLocations
    },
    readiness: {
      overallScore: fallbackReadinessScore,
      delta7d: 0,
      topGaps: ["Conditional Access", "Azure AD Connect", "PowerShell automation"],
      nextBestAction: {
        title: "Analyze jobs to sharpen your target skill map.",
        route: "/app/jobs",
        cta: "Open job discovery"
      },
      breakdown: [
        { label: "Skill coverage", score: fallbackReadinessScore },
        { label: "Proof of work", score: 20 },
        { label: "Resume fit", score: 35 },
        { label: "Prep consistency", score: 0 },
        { label: "Role clarity", score: 85 },
        { label: "Application hygiene", score: 0 }
      ]
    }
  };

  if (!supabase) {
    return fallback;
  }

  const userId = await getCurrentUserId();

  if (!userId) {
    return fallback;
  }

  const { data, error } = await supabase.rpc("submit_onboarding_profile", {
    p_target_role: input.targetRole,
    p_target_company: input.targetCompany,
    p_salary_goal: parseSalaryGoal(input.salaryGoal),
    p_experience_level: mapExperienceLevel(input.experienceLevel),
    p_current_skills: input.currentSkills,
    p_tools: [],
    p_preferred_locations: input.preferredLocations
  });

  if (error) {
    throw new Error(error.message);
  }

  const payload = data as {
    careerGoal?: {
      targetRole?: string;
      targetCompany?: string;
      salaryGoal?: number | null;
      experienceLevel?: string;
      preferredLocations?: string[];
    };
    readiness?: {
      overallScore?: number;
      topGaps?: string[];
      nextBestAction?: {
        title?: string;
        route?: string;
        cta?: string;
      };
      factorBreakdown?: {
        skillCoverage?: number;
        proofOfWork?: number;
        resumeFit?: number;
        prepConsistency?: number;
        roleClarity?: number;
        applicationHygiene?: number;
      };
    };
  } | null;

  if (!payload?.careerGoal || !payload.readiness) {
    throw new Error("Supabase onboarding response was incomplete.");
  }

  return {
    source: "supabase",
    careerGoal: {
      targetRole: payload.careerGoal.targetRole ?? input.targetRole,
      targetCompany: payload.careerGoal.targetCompany ?? input.targetCompany,
      salaryGoal: formatSalaryGoal(payload.careerGoal.salaryGoal ?? null, input.salaryGoal),
      experienceLevel:
        payload.careerGoal.experienceLevel === "entry"
          ? "Entry-level"
          : payload.careerGoal.experienceLevel === "junior"
            ? "Junior"
            : payload.careerGoal.experienceLevel === "senior"
              ? "Senior"
              : payload.careerGoal.experienceLevel === "lead"
                ? "Lead"
                : input.experienceLevel,
      preferredLocations: payload.careerGoal.preferredLocations ?? input.preferredLocations
    },
    readiness: {
      overallScore: Number(payload.readiness.overallScore ?? 0),
      delta7d: 0,
      topGaps: payload.readiness.topGaps ?? [],
      nextBestAction: {
        title: payload.readiness.nextBestAction?.title ?? "Open job discovery",
        route: payload.readiness.nextBestAction?.route ?? "/app/jobs",
        cta: payload.readiness.nextBestAction?.cta ?? "Open job discovery"
      },
      breakdown: [
        {
          label: "Skill coverage",
          score: Number(payload.readiness.factorBreakdown?.skillCoverage ?? 0)
        },
        {
          label: "Proof of work",
          score: Number(payload.readiness.factorBreakdown?.proofOfWork ?? 0)
        },
        {
          label: "Resume fit",
          score: Number(payload.readiness.factorBreakdown?.resumeFit ?? 0)
        },
        {
          label: "Prep consistency",
          score: Number(payload.readiness.factorBreakdown?.prepConsistency ?? 0)
        },
        {
          label: "Role clarity",
          score: Number(payload.readiness.factorBreakdown?.roleClarity ?? 0)
        },
        {
          label: "Application hygiene",
          score: Number(payload.readiness.factorBreakdown?.applicationHygiene ?? 0)
        }
      ]
    }
  };
}

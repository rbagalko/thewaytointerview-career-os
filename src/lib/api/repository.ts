import {
  applications,
  dashboardPayload,
  featureFlags,
  jdAnalysis,
  jobs,
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
  type LinkedInWorkspacePayload,
  type OnboardingInput,
  type OnboardingResult,
  type PrepTask,
  type PrepPlanPayload,
  type ResourceRecommendation,
  type ResumeSuggestion,
  type ResumeWorkspacePayload
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

function buildEmptyJDAnalysis(role = "", company = "", rawText = ""): JDAnalysis {
  return {
    analysisId: undefined,
    summary: "",
    keySkills: [],
    criticalGaps: [],
    interviewRounds: [],
    role,
    company,
    rawText,
    hasAnalysis: false
  };
}

function buildSuggestedHeadline(targetRole: string, skills: string[]) {
  const baseRole = targetRole.trim() || "Identity Engineer";
  const focus = skills.filter(Boolean).slice(0, 3);

  return focus.length ? `${baseRole} | ${focus.join(" | ")}` : baseRole;
}

function buildSuggestedLinkedInSummary(targetRole: string, targetCompany: string, skills: string[]) {
  const focus = skills.filter(Boolean).slice(0, 4).join(", ");
  const role = targetRole.trim() || "identity-focused infrastructure";
  const companyNote = targetCompany.trim() ? ` aligned to roles like ${targetCompany.trim()}` : "";

  return `I build toward ${role} opportunities${companyNote} with hands-on work across ${focus || "identity operations, troubleshooting, and automation"}. I focus on translating security and platform requirements into reliable implementation, clear stakeholder communication, and proof-of-work that shows how I solve real access, policy, and automation problems.`;
}

function buildFallbackLinkedInWorkspace(): LinkedInWorkspacePayload {
  const fallbackSkills = ["Azure AD", "Conditional Access", "PowerShell", "Identity Automation"];

  return {
    profileName: "",
    headline: "Azure AD Engineer | Identity Operations | PowerShell",
    summary:
      "Identity-focused engineer building toward cloud IAM roles with practical work across Azure AD, access policy design, and automation.",
    suggestedHeadline: buildSuggestedHeadline(dashboardPayload.goal.targetRole, fallbackSkills),
    suggestedSummary: buildSuggestedLinkedInSummary(
      dashboardPayload.goal.targetRole,
      dashboardPayload.goal.targetCompany,
      fallbackSkills
    ),
    keywordGaps: ["Conditional Access", "Graph API", "Proof of work"],
    profileScore: 72,
    targetRole: dashboardPayload.goal.targetRole,
    targetCompany: dashboardPayload.goal.targetCompany
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

function mapResourceRecommendation(record: Record<string, unknown>): ResourceRecommendation {
  const durationMinutes = Number(record.duration_minutes ?? 0);
  const skillTags = Array.isArray(record.skill_tags)
    ? record.skill_tags.map((value) => String(value))
    : [];

  return {
    id: String(record.id ?? ""),
    title: String(record.title ?? ""),
    source: String(record.provider ?? record.source ?? "Resource"),
    duration: durationMinutes > 0 ? `${durationMinutes} min` : "Flexible",
    difficulty: String(record.difficulty ?? "All levels"),
    skillTag: skillTags[0] ?? "Readiness",
    url: String(record.url ?? "")
  };
}

export async function getDashboard(): Promise<DashboardPayload> {
  if (!supabase) {
    return dashboardPayload;
  }

  const userId = await getCurrentUserId();

  if (!userId) {
    return dashboardPayload;
  }

  const [goalResult, readinessResult, tasksResult, jobsResult, resumeResult, applicationsResult, savedJobsResult, resourcesResult] =
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
      supabase.from("job_saved").select("id").eq("user_id", userId),
      supabase
        .from("learning_resources")
        .select("id, title, provider, url, skill_tags, difficulty, duration_minutes, ranking_score")
        .eq("is_active", true)
        .order("ranking_score", { ascending: false })
        .limit(12)
    ]);

  if (
    goalResult.error ||
    readinessResult.error ||
    tasksResult.error ||
    jobsResult.error ||
    resumeResult.error ||
    applicationsResult.error ||
    savedJobsResult.error ||
    resourcesResult.error
  ) {
    throw new Error(
      goalResult.error?.message ||
        readinessResult.error?.message ||
        tasksResult.error?.message ||
        jobsResult.error?.message ||
        resumeResult.error?.message ||
        applicationsResult.error?.message ||
        savedJobsResult.error?.message ||
        resourcesResult.error?.message ||
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

  const topGapSet = new Set((readiness.top_gaps ?? []).map((item: string) => item.trim().toLowerCase()));
  const matchedResources = (resourcesResult.data ?? []).filter((resource) => {
    const skillTags = Array.isArray(resource.skill_tags) ? resource.skill_tags : [];
    return skillTags.some((skill) => topGapSet.has(String(skill).trim().toLowerCase()));
  });

  const recommendedResources = (matchedResources.length ? matchedResources : resourcesResult.data ?? [])
    .slice(0, 3)
    .map((item) => mapResourceRecommendation(item as Record<string, unknown>));

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
    resources: recommendedResources.length ? recommendedResources : dashboardPayload.resources,
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

export async function getJDAnalysis(jobId?: string): Promise<JDAnalysis> {
  const fallback: JDAnalysis = {
    ...jdAnalysis,
    role: dashboardPayload.goal.targetRole,
    company: dashboardPayload.goal.targetCompany,
    rawText: "",
    hasAnalysis: true
  };

  if (!supabase) {
    return fallback;
  }

  const userId = await getCurrentUserId();

  if (!userId) {
    return fallback;
  }

  const [jobResult, latestAnalysisResult] = await Promise.all([
    jobId
      ? supabase
          .from("jobs")
          .select("id, company, role_title, description_raw, description_normalized")
          .eq("id", jobId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    jobId
      ? supabase
          .from("jd_analyses")
          .select("id, job_id, company, role, summary, key_skills, rounds, raw_jd, created_at")
          .eq("user_id", userId)
          .eq("job_id", jobId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()
      : supabase
          .from("jd_analyses")
          .select("id, job_id, company, role, summary, key_skills, rounds, raw_jd, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()
  ]);

  if (jobResult.error || latestAnalysisResult.error) {
    throw new Error(jobResult.error?.message || latestAnalysisResult.error?.message || "Unable to load JD analysis.");
  }

  if (!latestAnalysisResult.data) {
    return buildEmptyJDAnalysis(
      jobResult.data?.role_title ?? "",
      jobResult.data?.company ?? "",
      jobResult.data?.description_normalized ?? jobResult.data?.description_raw ?? ""
    );
  }

  const gapResult = await supabase
    .from("skill_gaps")
    .select("skill_name, importance")
    .eq("jd_analysis_id", latestAnalysisResult.data.id)
    .order("gap_score", { ascending: false })
    .order("created_at", { ascending: false });

  if (gapResult.error) {
    throw new Error(gapResult.error.message);
  }

  const rounds = Array.isArray(latestAnalysisResult.data.rounds)
    ? latestAnalysisResult.data.rounds
        .map((item) => {
          if (!item || typeof item !== "object") {
            return null;
          }

          const round = item as {
            name?: unknown;
            focus?: unknown;
          };

          return {
            name: String(round.name ?? "Interview round"),
            focus: Array.isArray(round.focus)
              ? round.focus.map((topic) => String(topic))
              : []
          };
        })
        .filter((item): item is { name: string; focus: string[] } => Boolean(item))
    : [];

  return {
    analysisId: latestAnalysisResult.data.id,
    summary: latestAnalysisResult.data.summary ?? "",
    keySkills: latestAnalysisResult.data.key_skills ?? [],
    criticalGaps: (gapResult.data ?? []).map((gap) => ({
      skill: gap.skill_name,
      importance: gap.importance ? `${gap.importance.charAt(0).toUpperCase()}${gap.importance.slice(1)}` : "Medium",
      note: "This skill appears central to the job signal and needs concrete examples in interviews."
    })),
    interviewRounds: rounds,
    role: latestAnalysisResult.data.role ?? jobResult.data?.role_title ?? "",
    company: latestAnalysisResult.data.company ?? jobResult.data?.company ?? "",
    rawText:
      latestAnalysisResult.data.raw_jd?.trim() ||
      jobResult.data?.description_normalized ||
      jobResult.data?.description_raw ||
      "",
    hasAnalysis: true
  };
}

export async function getResumeWorkspace(): Promise<ResumeWorkspacePayload> {
  if (!supabase) {
    return {
      rawText: "",
      atsScore: 71,
      keywordGaps: ["Conditional Access", "Graph API", "Zero Trust"],
      suggestions: resumeSuggestions,
      targetRole: dashboardPayload.goal.targetRole,
      targetCompany: dashboardPayload.goal.targetCompany
    };
  }

  const userId = await getCurrentUserId();

  if (!userId) {
    return {
      rawText: "",
      atsScore: null,
      keywordGaps: [],
      suggestions: [],
      targetRole: "Target role",
      targetCompany: "Target company"
    };
  }

  const { data, error } = await supabase
    .from("resumes")
    .select("raw_text, ats_score, parsed_sections")
    .eq("user_id", userId)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return {
      rawText: "",
      atsScore: null,
      keywordGaps: [],
      suggestions: [],
      targetRole: dashboardPayload.goal.targetRole,
      targetCompany: dashboardPayload.goal.targetCompany
    };
  }

  const parsedSections =
    data.parsed_sections && typeof data.parsed_sections === "object"
      ? (data.parsed_sections as {
          keywordGaps?: unknown;
          suggestions?: unknown;
          targetRole?: unknown;
          targetCompany?: unknown;
        })
      : null;

  const keywordGaps = Array.isArray(parsedSections?.keywordGaps)
    ? parsedSections?.keywordGaps.map((item) => String(item))
    : [];

  const suggestions = Array.isArray(parsedSections?.suggestions)
    ? parsedSections.suggestions
        .map((item) => {
          if (!item || typeof item !== "object") {
            return null;
          }

          const suggestion = item as {
            before?: unknown;
            after?: unknown;
          };

          return {
            before: String(suggestion.before ?? ""),
            after: String(suggestion.after ?? "")
          };
        })
        .filter((item): item is ResumeSuggestion => Boolean(item?.before || item?.after))
    : [];

  return {
    rawText: data.raw_text ?? "",
    atsScore: data.ats_score ? Number(data.ats_score) : null,
    keywordGaps,
    suggestions,
    targetRole: String(parsedSections?.targetRole ?? dashboardPayload.goal.targetRole),
    targetCompany: String(parsedSections?.targetCompany ?? dashboardPayload.goal.targetCompany)
  };
}

export async function getResumeSuggestions(): Promise<ResumeSuggestion[]> {
  return resumeSuggestions;
}

export async function getLinkedInWorkspace(): Promise<LinkedInWorkspacePayload> {
  if (!supabase) {
    return buildFallbackLinkedInWorkspace();
  }

  const userId = await getCurrentUserId();

  if (!userId) {
    return buildFallbackLinkedInWorkspace();
  }

  const [goalResult, profileResult, latestResult, accountResult] = await Promise.all([
    supabase
      .from("career_goals")
      .select("target_role, target_company")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("candidate_profiles")
      .select("current_title, summary, skills, tools")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("linkedin_optimizations")
      .select(
        "profile_name, profile_headline, profile_summary, suggested_headline, suggested_summary, keyword_gaps, profile_score"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .maybeSingle()
  ]);

  if (goalResult.error || profileResult.error || latestResult.error || accountResult.error) {
    throw new Error(
      goalResult.error?.message ||
        profileResult.error?.message ||
        latestResult.error?.message ||
        accountResult.error?.message ||
        "Unable to load LinkedIn workspace."
    );
  }

  const targetRole = goalResult.data?.target_role ?? dashboardPayload.goal.targetRole;
  const targetCompany = goalResult.data?.target_company ?? dashboardPayload.goal.targetCompany;
  const focusSkills = Array.from(
    new Set([...(profileResult.data?.skills ?? []), ...(profileResult.data?.tools ?? [])].filter(Boolean))
  ).slice(0, 5);

  return {
    profileName: latestResult.data?.profile_name ?? accountResult.data?.full_name ?? "",
    headline:
      latestResult.data?.profile_headline ??
      profileResult.data?.current_title ??
      targetRole,
    summary: latestResult.data?.profile_summary ?? profileResult.data?.summary ?? "",
    suggestedHeadline:
      latestResult.data?.suggested_headline ??
      buildSuggestedHeadline(targetRole, focusSkills),
    suggestedSummary:
      latestResult.data?.suggested_summary ??
      buildSuggestedLinkedInSummary(targetRole, targetCompany, focusSkills),
    keywordGaps:
      latestResult.data?.keyword_gaps?.length
        ? latestResult.data.keyword_gaps
        : focusSkills.slice(0, 4),
    profileScore: latestResult.data?.profile_score ? Number(latestResult.data.profile_score) : null,
    targetRole,
    targetCompany
  };
}

export async function getPrepPlan(): Promise<PrepPlanPayload> {
  if (!supabase) {
    return {
      roadmap: {
        id: "mock-roadmap",
        role: dashboardPayload.goal.targetRole,
        company: dashboardPayload.goal.targetCompany,
        durationDays: 14,
        startDate: null,
        endDate: null
      },
      tasks: dashboardPayload.todayTasks,
      resources: dashboardPayload.resources,
      focusSkills: dashboardPayload.readiness.topGaps
    };
  }

  const userId = await getCurrentUserId();

  if (!userId) {
    return {
      roadmap: null,
      tasks: [],
      resources: dashboardPayload.resources,
      focusSkills: []
    };
  }

  const [roadmapResult, readinessResult, resourcesResult] = await Promise.all([
    supabase
      .from("prep_roadmaps")
      .select("id, role, company, duration_days, start_date, end_date")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("readiness_snapshots")
      .select("top_gaps")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("learning_resources")
      .select("id, title, provider, url, skill_tags, difficulty, duration_minutes, ranking_score")
      .eq("is_active", true)
      .order("ranking_score", { ascending: false })
      .limit(12)
  ]);

  if (roadmapResult.error || readinessResult.error || resourcesResult.error) {
    throw new Error(
      roadmapResult.error?.message ||
        readinessResult.error?.message ||
        resourcesResult.error?.message ||
        "Unable to load prep plan."
    );
  }

  const taskRows = roadmapResult.data?.id
    ? await supabase
        .from("prep_tasks")
        .select("id, title, description, task_type, skill_tags, duration_minutes, status")
        .eq("roadmap_id", roadmapResult.data.id)
        .order("day_number", { ascending: true })
        .order("sort_order", { ascending: true })
    : { data: [], error: null };

  if (taskRows.error) {
    throw new Error(taskRows.error.message);
  }

  const tasks: PrepTask[] = (taskRows.data ?? []).map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description ?? "",
    type: task.task_type,
    duration: task.duration_minutes ? `${task.duration_minutes} min` : "Flexible",
    status: task.status === "done" ? "done" : task.status === "in_progress" ? "in_progress" : "todo",
    skillTag: task.skill_tags?.[0] ?? "Readiness"
  }));

  const focusSkills = tasks.length
    ? Array.from(new Set(tasks.map((task) => task.skillTag))).slice(0, 4)
    : (readinessResult.data?.top_gaps ?? []).slice(0, 4);

  const focusSkillSet = new Set(focusSkills.map((item: string) => item.trim().toLowerCase()));
  const matchedResources = (resourcesResult.data ?? []).filter((resource) => {
    const skillTags = Array.isArray(resource.skill_tags) ? resource.skill_tags : [];
    return skillTags.some((skill) => focusSkillSet.has(String(skill).trim().toLowerCase()));
  });

  return {
    roadmap: roadmapResult.data
      ? {
          id: roadmapResult.data.id,
          role: roadmapResult.data.role ?? "Target role",
          company: roadmapResult.data.company ?? "Target company",
          durationDays: roadmapResult.data.duration_days ?? 14,
          startDate: roadmapResult.data.start_date ?? null,
          endDate: roadmapResult.data.end_date ?? null
        }
      : null,
    tasks,
    resources: (matchedResources.length ? matchedResources : resourcesResult.data ?? [])
      .slice(0, 6)
      .map((item) => mapResourceRecommendation(item as Record<string, unknown>)),
    focusSkills
  };
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
  if (!supabase) {
    return featureFlags;
  }

  const { data, error } = await supabase
    .from("feature_flags")
    .select("key, label, status, meta")
    .order("label", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((flag) => {
    const meta =
      flag.meta && typeof flag.meta === "object"
        ? (flag.meta as { description?: unknown })
        : null;

    return {
      key: flag.key,
      label: flag.label,
      status: flag.status === "active" ? "active" : "disabled",
      description:
        typeof meta?.description === "string"
          ? meta.description
          : "Soon you can experience this."
    };
  });
}

export async function analyzeJD(rawText: string, jobId?: string) {
  if (!supabase) {
    return {
      source: "mock" as const,
      analysisId: "mock-analysis"
    };
  }

  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error("Sign in to analyze a job description.");
  }

  const { data, error } = await supabase.rpc("analyze_jd", {
    p_raw_jd: rawText,
    p_job_id: jobId ?? null
  });

  if (error) {
    throw new Error(error.message);
  }

  const payload = data as {
    analysisId?: string;
  } | null;

  return {
    source: "supabase" as const,
    analysisId: String(payload?.analysisId ?? "")
  };
}

export async function analyzeLinkedInProfile(input: {
  profileName: string;
  headline: string;
  summary: string;
}) {
  if (!supabase) {
    return {
      source: "mock" as const,
      profileScore: buildFallbackLinkedInWorkspace().profileScore ?? 0
    };
  }

  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error("Sign in to optimize your LinkedIn profile.");
  }

  const { data, error } = await supabase.rpc("analyze_linkedin_profile", {
    p_profile_name: input.profileName,
    p_profile_headline: input.headline,
    p_profile_summary: input.summary
  });

  if (error) {
    throw new Error(error.message);
  }

  const payload = data as {
    profileScore?: number;
  } | null;

  return {
    source: "supabase" as const,
    profileScore: Number(payload?.profileScore ?? 0)
  };
}

export async function analyzeResume(rawText: string, jobId?: string) {
  if (!supabase) {
    return {
      source: "mock" as const,
      atsScore: 71
    };
  }

  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error("Sign in to analyze your resume.");
  }

  const { data, error } = await supabase.rpc("analyze_resume", {
    p_raw_text: rawText,
    p_job_id: jobId ?? null
  });

  if (error) {
    throw new Error(error.message);
  }

  const payload = data as {
    atsScore?: number;
  } | null;

  return {
    source: "supabase" as const,
    atsScore: Number(payload?.atsScore ?? 0)
  };
}

export async function generatePrepRoadmap(jobId?: string) {
  if (!supabase) {
    return {
      source: "mock" as const,
      taskCount: dashboardPayload.todayTasks.length
    };
  }

  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error("Sign in to generate a prep roadmap.");
  }

  const { data, error } = await supabase.rpc("generate_prep_roadmap", {
    p_job_id: jobId ?? null
  });

  if (error) {
    throw new Error(error.message);
  }

  const payload = data as {
    taskCount?: number;
  } | null;

  return {
    source: "supabase" as const,
    taskCount: Number(payload?.taskCount ?? 0)
  };
}

export async function updatePrepTaskStatus(taskId: string, status: "todo" | "in_progress" | "done") {
  if (!supabase) {
    return { source: "mock" as const };
  }

  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error("Sign in to update prep tasks.");
  }

  const { error } = await supabase
    .from("prep_tasks")
    .update({
      status,
      completed_at: status === "done" ? new Date().toISOString() : null
    })
    .eq("id", taskId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  await supabase.rpc("refresh_readiness_snapshot");

  return { source: "supabase" as const };
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

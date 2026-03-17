import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getApplications,
  getDashboard,
  getFeatureFlags,
  getJDAnalysis,
  getJobs,
  getLinkedInSuggestions,
  getPrepPlan,
  getResumeSuggestions,
  generatePrepRoadmap,
  saveJob,
  submitOnboarding,
  trackJob,
  updatePrepTaskStatus
} from "@/lib/api/repository";
import { type JobOpportunity, type OnboardingInput } from "@/lib/types";

export function useDashboardQuery() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard
  });
}

export function useJobsQuery(query: string, readinessMin: number) {
  return useQuery({
    queryKey: ["jobs", query, readinessMin],
    queryFn: () => getJobs(query, readinessMin)
  });
}

export function useJDAnalysisQuery() {
  return useQuery({
    queryKey: ["jd-analysis"],
    queryFn: getJDAnalysis
  });
}

export function useResumeSuggestionsQuery() {
  return useQuery({
    queryKey: ["resume-suggestions"],
    queryFn: getResumeSuggestions
  });
}

export function usePrepPlanQuery() {
  return useQuery({
    queryKey: ["prep-plan"],
    queryFn: getPrepPlan
  });
}

export function useLinkedInSuggestionsQuery() {
  return useQuery({
    queryKey: ["linkedin-suggestions"],
    queryFn: getLinkedInSuggestions
  });
}

export function useApplicationsQuery() {
  return useQuery({
    queryKey: ["applications"],
    queryFn: getApplications
  });
}

export function useFeatureFlagsQuery() {
  return useQuery({
    queryKey: ["feature-flags"],
    queryFn: getFeatureFlags
  });
}

function invalidateCareerQueries(queryClient: ReturnType<typeof useQueryClient>) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
    queryClient.invalidateQueries({ queryKey: ["jobs"] }),
    queryClient.invalidateQueries({ queryKey: ["applications"] }),
    queryClient.invalidateQueries({ queryKey: ["prep-plan"] })
  ]);
}

export function useOnboardingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: OnboardingInput) => submitOnboarding(input),
    onSuccess: async () => {
      await invalidateCareerQueries(queryClient);
    }
  });
}

export function useSaveJobMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (job: JobOpportunity) => saveJob(job),
    onSuccess: async () => {
      await invalidateCareerQueries(queryClient);
    }
  });
}

export function useTrackJobMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (job: JobOpportunity) => trackJob(job),
    onSuccess: async () => {
      await invalidateCareerQueries(queryClient);
    }
  });
}

export function useGeneratePrepRoadmapMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId?: string) => generatePrepRoadmap(jobId),
    onSuccess: async () => {
      await invalidateCareerQueries(queryClient);
    }
  });
}

export function usePrepTaskStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: "todo" | "in_progress" | "done" }) =>
      updatePrepTaskStatus(taskId, status),
    onSuccess: async () => {
      await invalidateCareerQueries(queryClient);
    }
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getApplications,
  getDashboard,
  getFeatureFlags,
  getJDAnalysis,
  getJobs,
  getLinkedInSuggestions,
  getResumeSuggestions,
  submitOnboarding
} from "@/lib/api/repository";
import { type OnboardingInput } from "@/lib/types";

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

export function useOnboardingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: OnboardingInput) => submitOnboarding(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["jobs"] })
      ]);
    }
  });
}

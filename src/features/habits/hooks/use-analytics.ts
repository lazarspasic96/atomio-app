"use client";

import { api } from "~/trpc/react";

export function useAnalytics() {
  const weeklyTrendsQuery = api.analytics.getWeeklyTrends.useQuery();
  const completionPatternsQuery = api.analytics.getCompletionPatterns.useQuery();

  return {
    // Weekly trends
    weeklyTrends: weeklyTrendsQuery.data,
    isLoadingWeeklyTrends: weeklyTrendsQuery.isLoading,

    // Completion patterns
    completionPatterns: completionPatternsQuery.data,
    isLoadingPatterns: completionPatternsQuery.isLoading,

    // Refetch
    refetchAll: () => {
      void weeklyTrendsQuery.refetch();
      void completionPatternsQuery.refetch();
    },
  };
}

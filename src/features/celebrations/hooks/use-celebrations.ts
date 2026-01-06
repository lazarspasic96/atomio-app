"use client";

import { api } from "~/trpc/react";

export function useCelebrations() {
  const utils = api.useUtils();

  const uncelebratedQuery = api.celebration.getUncelebrated.useQuery();
  const recentQuery = api.celebration.getRecent.useQuery({ limit: 10 });

  const markViewedMutation = api.celebration.markViewed.useMutation({
    onSuccess: () => {
      void utils.celebration.getUncelebrated.invalidate();
    },
  });

  const markAllViewedMutation = api.celebration.markAllViewed.useMutation({
    onSuccess: () => {
      void utils.celebration.getUncelebrated.invalidate();
    },
  });

  return {
    // Uncelebrated milestones
    uncelebrated: uncelebratedQuery.data ?? [],
    hasUncelebrated: (uncelebratedQuery.data?.length ?? 0) > 0,
    isLoading: uncelebratedQuery.isLoading,

    // Recent celebrations
    recent: recentQuery.data ?? [],
    isLoadingRecent: recentQuery.isLoading,

    // Actions
    markViewed: (celebrationId: string) =>
      markViewedMutation.mutate({ celebrationId }),
    markAllViewed: () => markAllViewedMutation.mutate(),
    isMarkingViewed: markViewedMutation.isPending,

    // Get the next celebration to show
    getNextCelebration: () => {
      const celebrations = uncelebratedQuery.data;
      if (!celebrations || celebrations.length === 0) return null;
      return celebrations[0];
    },

    // Refetch
    refetch: () => {
      void utils.celebration.getUncelebrated.invalidate();
      void utils.celebration.getRecent.invalidate();
    },
  };
}

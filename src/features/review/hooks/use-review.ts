"use client";

import { api } from "~/trpc/react";

export function useWeeklyReview() {
  const utils = api.useUtils();

  const currentWeekQuery = api.review.getCurrentWeek.useQuery();
  const lastWeekQuery = api.review.getLastWeek.useQuery();
  const recentQuery = api.review.getRecent.useQuery({ limit: 4 });

  const markViewedMutation = api.review.markViewed.useMutation({
    onSuccess: () => {
      void utils.review.getCurrentWeek.invalidate();
      void utils.review.getLastWeek.invalidate();
    },
  });

  const regenerateMutation = api.review.regenerate.useMutation({
    onSuccess: () => {
      void utils.review.getCurrentWeek.invalidate();
    },
  });

  return {
    // Current week
    currentWeek: currentWeekQuery.data,
    isLoadingCurrentWeek: currentWeekQuery.isLoading,

    // Last week
    lastWeek: lastWeekQuery.data,
    isLoadingLastWeek: lastWeekQuery.isLoading,

    // Recent reviews
    recent: recentQuery.data ?? [],
    isLoadingRecent: recentQuery.isLoading,

    // Actions
    markViewed: (reviewId: string) => markViewedMutation.mutate({ reviewId }),
    regenerate: () => regenerateMutation.mutate(),
    isRegenerating: regenerateMutation.isPending,

    // Helpers
    hasUnviewedReview: () => {
      const current = currentWeekQuery.data;
      const last = lastWeekQuery.data;
      const hasUnviewedCurrent = Boolean(current && !current.viewedAt);
      const hasUnviewedLast = Boolean(last && !last.viewedAt);
      return hasUnviewedCurrent || hasUnviewedLast;
    },

    // Refetch
    refetch: () => {
      void utils.review.getCurrentWeek.invalidate();
      void utils.review.getLastWeek.invalidate();
      void utils.review.getRecent.invalidate();
    },
  };
}

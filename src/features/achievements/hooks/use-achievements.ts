"use client";

import { api } from "~/trpc/react";

export function useAchievements() {
  const utils = api.useUtils();

  const allQuery = api.achievement.getAll.useQuery();
  const earnedQuery = api.achievement.getEarned.useQuery();
  const summaryQuery = api.achievement.getSummary.useQuery();
  const uncelebratedQuery = api.achievement.getUncelebrated.useQuery();

  const markCelebratedMutation = api.achievement.markCelebrated.useMutation({
    onSuccess: () => {
      void utils.achievement.getUncelebrated.invalidate();
      void utils.achievement.getEarned.invalidate();
      void utils.achievement.getAll.invalidate();
      void utils.achievement.getSummary.invalidate();
    },
  });

  const markAllCelebratedMutation = api.achievement.markAllCelebrated.useMutation({
    onSuccess: () => {
      void utils.achievement.getUncelebrated.invalidate();
      void utils.achievement.getEarned.invalidate();
      void utils.achievement.getAll.invalidate();
      void utils.achievement.getSummary.invalidate();
    },
  });

  return {
    // All achievements with progress
    achievements: allQuery.data ?? [],
    isLoading: allQuery.isLoading,
    isError: allQuery.isError,
    error: allQuery.error,

    // Earned achievements
    earned: earnedQuery.data ?? [],
    isLoadingEarned: earnedQuery.isLoading,

    // Summary data
    summary: summaryQuery.data,
    isLoadingSummary: summaryQuery.isLoading,

    // Uncelebrated achievements (for toasts)
    uncelebrated: uncelebratedQuery.data ?? [],
    isLoadingUncelebrated: uncelebratedQuery.isLoading,

    // Actions
    markCelebrated: (userAchievementId: string) =>
      markCelebratedMutation.mutate({ userAchievementId }),
    markAllCelebrated: () => markAllCelebratedMutation.mutate(),
    isMarking: markCelebratedMutation.isPending || markAllCelebratedMutation.isPending,

    // Helpers
    getEarnedCount: () => earnedQuery.data?.length ?? 0,

    getTotalCount: () => allQuery.data?.length ?? 0,

    getCompletionPercent: () => {
      const total = allQuery.data?.length ?? 0;
      const earned = earnedQuery.data?.length ?? 0;
      if (total === 0) return 0;
      return Math.round((earned / total) * 100);
    },

    getByCategory: (category: string) => {
      return allQuery.data?.filter((a) => a.category === category) ?? [];
    },

    getEarnedByCategory: (category: string) => {
      return earnedQuery.data?.filter((a) => a.category === category) ?? [];
    },

    getNextUnlockable: () => {
      // Find achievements closest to being unlocked (highest progress, not yet earned)
      const notEarned = allQuery.data?.filter((a) => !a.isEarned) ?? [];
      return notEarned
        .sort((a, b) => b.progressPercent - a.progressPercent)
        .slice(0, 3);
    },

    // Refetch
    refetch: () => {
      void utils.achievement.getAll.invalidate();
      void utils.achievement.getEarned.invalidate();
      void utils.achievement.getSummary.invalidate();
      void utils.achievement.getUncelebrated.invalidate();
    },
  };
}

export function useAchievementCelebration() {
  const { uncelebrated, markCelebrated, markAllCelebrated, isMarking } = useAchievements();

  return {
    // Get the next achievement to celebrate
    nextToShow: uncelebrated[0] ?? null,
    hasUncelebrated: uncelebrated.length > 0,
    uncelebratedCount: uncelebrated.length,

    // Dismiss the current achievement
    dismiss: (userAchievementId: string) => markCelebrated(userAchievementId),
    dismissAll: () => markAllCelebrated(),
    isDismissing: isMarking,
  };
}

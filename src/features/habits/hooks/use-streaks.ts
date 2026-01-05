"use client";

import { api } from "~/trpc/react";

export function useStreaks() {
  const utils = api.useUtils();

  const streaksQuery = api.streak.getAll.useQuery();
  const atRiskQuery = api.streak.getAtRisk.useQuery();

  const recalculateMutation = api.streak.recalculate.useMutation({
    onSuccess: () => {
      void utils.streak.getAll.invalidate();
      void utils.streak.getAtRisk.invalidate();
    },
  });

  const recalculateAllMutation = api.streak.recalculateAll.useMutation({
    onSuccess: () => {
      void utils.streak.getAll.invalidate();
      void utils.streak.getAtRisk.invalidate();
    },
  });

  return {
    // Streak data
    streaks: streaksQuery.data ?? [],
    isLoading: streaksQuery.isLoading,
    isError: streaksQuery.isError,
    error: streaksQuery.error,

    // At risk habits
    atRiskHabits: atRiskQuery.data ?? [],
    isLoadingAtRisk: atRiskQuery.isLoading,

    // Actions
    recalculate: (habitId: string) => recalculateMutation.mutate({ habitId }),
    recalculateAll: () => recalculateAllMutation.mutate(),
    isRecalculating: recalculateMutation.isPending || recalculateAllMutation.isPending,

    // Helpers
    getStreakByHabitId: (habitId: string) => {
      return streaksQuery.data?.find((s) => s.habitId === habitId);
    },

    getTotalActiveStreaks: () => {
      return streaksQuery.data?.filter((s) => s.currentStreak > 0).length ?? 0;
    },

    getLongestActiveStreak: () => {
      if (!streaksQuery.data || streaksQuery.data.length === 0) return 0;
      return Math.max(...streaksQuery.data.map((s) => s.currentStreak));
    },

    getTotalCompletions: () => {
      return streaksQuery.data?.reduce((sum, s) => sum + s.totalCompletions, 0) ?? 0;
    },

    // Refetch
    refetch: streaksQuery.refetch,
  };
}

export function useStats() {
  const utils = api.useUtils();

  const dashboardQuery = api.stats.getDashboard.useQuery();
  const userStatsQuery = api.stats.getUserStats.useQuery();
  const identityVotesQuery = api.stats.getIdentityVotes.useQuery();

  return {
    // Dashboard data
    dashboard: dashboardQuery.data,
    isLoadingDashboard: dashboardQuery.isLoading,

    // User stats
    userStats: userStatsQuery.data,
    isLoadingUserStats: userStatsQuery.isLoading,

    // Identity votes
    identityVotes: identityVotesQuery.data,
    isLoadingIdentityVotes: identityVotesQuery.isLoading,

    // Refetch
    refetchDashboard: dashboardQuery.refetch,
    refetchAll: () => {
      void utils.stats.getDashboard.invalidate();
      void utils.stats.getUserStats.invalidate();
      void utils.stats.getIdentityVotes.invalidate();
    },
  };
}

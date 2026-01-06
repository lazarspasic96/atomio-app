"use client";

import { api } from "~/trpc/react";
import { getStrengthLabel } from "~/lib/strength";

export function useStrength() {
  const utils = api.useUtils();

  const strengthsQuery = api.strength.getAll.useQuery();
  const summaryQuery = api.strength.getSummary.useQuery();

  const recalculateMutation = api.strength.recalculate.useMutation({
    onSuccess: () => {
      void utils.strength.getAll.invalidate();
      void utils.strength.getSummary.invalidate();
    },
  });

  const recalculateAllMutation = api.strength.recalculateAll.useMutation({
    onSuccess: () => {
      void utils.strength.getAll.invalidate();
      void utils.strength.getSummary.invalidate();
    },
  });

  return {
    // Strength data
    strengths: strengthsQuery.data ?? [],
    isLoading: strengthsQuery.isLoading,
    isError: strengthsQuery.isError,
    error: strengthsQuery.error,

    // Summary data
    summary: summaryQuery.data,
    isLoadingSummary: summaryQuery.isLoading,

    // Actions
    recalculate: (habitId: string) => recalculateMutation.mutate({ habitId }),
    recalculateAll: () => recalculateAllMutation.mutate(),
    isRecalculating: recalculateMutation.isPending || recalculateAllMutation.isPending,

    // Helpers
    getStrengthByHabitId: (habitId: string) => {
      return strengthsQuery.data?.find((s) => s.habitId === habitId);
    },

    getStrongHabits: () => {
      return strengthsQuery.data?.filter((s) => s.strength >= 80) ?? [];
    },

    getBuildingHabits: () => {
      return strengthsQuery.data?.filter((s) => s.strength >= 60 && s.strength < 80) ?? [];
    },

    getDevelopingHabits: () => {
      return strengthsQuery.data?.filter((s) => s.strength >= 40 && s.strength < 60) ?? [];
    },

    getFragileHabits: () => {
      return strengthsQuery.data?.filter((s) => s.strength >= 20 && s.strength < 40) ?? [];
    },

    getNewHabits: () => {
      return strengthsQuery.data?.filter((s) => s.strength < 20) ?? [];
    },

    getAverageStrength: () => {
      const data = strengthsQuery.data;
      if (!data || data.length === 0) return 0;
      return Math.round(data.reduce((sum, s) => sum + s.strength, 0) / data.length);
    },

    getStrengthLabel: (strength: number) => getStrengthLabel(strength),

    // Refetch
    refetch: strengthsQuery.refetch,
  };
}

export function useHabitStrength(habitId: string) {
  const utils = api.useUtils();

  const strengthQuery = api.strength.getByHabitId.useQuery(
    { habitId },
    { enabled: !!habitId }
  );

  const recalculateMutation = api.strength.recalculate.useMutation({
    onSuccess: () => {
      void utils.strength.getByHabitId.invalidate({ habitId });
      void utils.strength.getAll.invalidate();
      void utils.strength.getSummary.invalidate();
    },
  });

  return {
    strength: strengthQuery.data,
    isLoading: strengthQuery.isLoading,
    isError: strengthQuery.isError,
    error: strengthQuery.error,
    recalculate: () => recalculateMutation.mutate({ habitId }),
    isRecalculating: recalculateMutation.isPending,
    refetch: strengthQuery.refetch,
  };
}

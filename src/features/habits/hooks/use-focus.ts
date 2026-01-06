"use client";

import { api } from "~/trpc/react";

export function useFocus() {
  const utils = api.useUtils();

  const todayQuery = api.focus.getToday.useQuery();
  const messageQuery = api.focus.getMessage.useQuery();

  return {
    // Focus data
    focus: todayQuery.data,
    isLoading: todayQuery.isLoading,
    isError: todayQuery.isError,
    error: todayQuery.error,

    // Message
    message: messageQuery.data,
    isLoadingMessage: messageQuery.isLoading,

    // Helpers
    getTotalRemaining: () => {
      const data = todayQuery.data;
      if (!data) return 0;
      return data.priority.length + data.protect.length + data.momentum.length;
    },

    getTotalCompleted: () => {
      return todayQuery.data?.completed.length ?? 0;
    },

    getTotalActive: () => {
      const data = todayQuery.data;
      if (!data) return 0;
      return (
        data.priority.length +
        data.protect.length +
        data.momentum.length +
        data.completed.length
      );
    },

    getProgress: () => {
      const data = todayQuery.data;
      if (!data) return 0;
      const total =
        data.priority.length +
        data.protect.length +
        data.momentum.length +
        data.completed.length;
      if (total === 0) return 100;
      return Math.round((data.completed.length / total) * 100);
    },

    getTopPriority: () => {
      const data = todayQuery.data;
      if (!data) return null;
      // Return the first uncompleted priority, or first protect, or first momentum
      return (
        data.priority[0] ?? data.protect[0] ?? data.momentum[0] ?? null
      );
    },

    // Refetch
    refetch: () => {
      void utils.focus.getToday.invalidate();
      void utils.focus.getMessage.invalidate();
    },
  };
}

"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import type { HabitWithCompletions } from "~/types";
import { isSameDay } from "~/lib/utils";

interface UseCompletionsOptions {
  startDate: Date;
  endDate: Date;
}

export function useCompletions({ startDate, endDate }: UseCompletionsOptions) {
  const utils = api.useUtils();

  const query = api.completion.getByDateRange.useQuery({
    startDate,
    endDate,
  });

  const toggleMutation = api.completion.toggle.useMutation({
    onMutate: async ({ habitId, date }) => {
      // Cancel any outgoing refetches
      await utils.completion.getByDateRange.cancel({ startDate, endDate });

      // Snapshot the previous value
      const previousData = utils.completion.getByDateRange.getData({
        startDate,
        endDate,
      });

      // Optimistically update the cache
      utils.completion.getByDateRange.setData(
        { startDate, endDate },
        (old) => {
          if (!old) return old;

          return old.map((habit) => {
            if (habit.id !== habitId) return habit;

            const existingCompletion = habit.completions.find((c) =>
              isSameDay(new Date(c.date), date),
            );

            if (existingCompletion) {
              // Remove completion (optimistic uncomplete)
              return {
                ...habit,
                completions: habit.completions.filter(
                  (c) => !isSameDay(new Date(c.date), date),
                ),
              };
            } else {
              // Add completion (optimistic complete)
              return {
                ...habit,
                completions: [
                  ...habit.completions,
                  {
                    id: `temp-${Date.now()}`,
                    habitId,
                    date,
                    completed: true,
                    createdAt: new Date(),
                  },
                ],
              };
            }
          });
        },
      );

      return { previousData };
    },
    onError: (error, _variables, context) => {
      // Rollback to the previous value on error
      if (context?.previousData) {
        utils.completion.getByDateRange.setData(
          { startDate, endDate },
          context.previousData,
        );
      }
      toast.error("Failed to update habit", {
        description: error.message,
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      void utils.completion.getByDateRange.invalidate({ startDate, endDate });
    },
  });

  const toggle = useCallback(
    (habitId: string, date: Date) => {
      toggleMutation.mutate({ habitId, date });
    },
    [toggleMutation],
  );

  // Helper to check if a specific date is completed for a habit
  const isCompleted = useCallback(
    (habitId: string, date: Date): boolean => {
      const habit = query.data?.find((h) => h.id === habitId);
      if (!habit) return false;

      return habit.completions.some((c) => isSameDay(new Date(c.date), date));
    },
    [query.data],
  );

  // Helper to get completion count for a habit in the current range
  const getCompletionCount = useCallback(
    (habitId: string): number => {
      const habit = query.data?.find((h) => h.id === habitId);
      if (!habit) return 0;

      return habit.completions.length;
    },
    [query.data],
  );

  return {
    // Query state
    habits: query.data as HabitWithCompletions[] | undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,

    // Mutation
    toggle,
    isToggling: toggleMutation.isPending,

    // Helpers
    isCompleted,
    getCompletionCount,

    // Refetch
    refetch: query.refetch,
  };
}

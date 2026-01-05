"use client";

import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import type { HabitWithCompletions } from "~/types";
import { toUTCMidnight, isSameDayUTC } from "~/lib/utils";

interface UseCompletionsOptions {
  startDate: Date;
  endDate: Date;
}

export function useCompletions({ startDate, endDate }: UseCompletionsOptions) {
  const utils = api.useUtils();

  // Normalize dates to UTC midnight before sending to server
  const normalizedStartDate = useMemo(() => toUTCMidnight(startDate), [startDate]);
  const normalizedEndDate = useMemo(() => toUTCMidnight(endDate), [endDate]);

  const query = api.completion.getByDateRange.useQuery({
    startDate: normalizedStartDate,
    endDate: normalizedEndDate,
  });

  const toggleMutation = api.completion.toggle.useMutation({
    onMutate: async ({ habitId, date }) => {
      // Cancel any outgoing refetches
      await utils.completion.getByDateRange.cancel({ startDate: normalizedStartDate, endDate: normalizedEndDate });

      // Snapshot the previous value
      const previousData = utils.completion.getByDateRange.getData({
        startDate: normalizedStartDate,
        endDate: normalizedEndDate,
      });

      // Optimistically update the cache
      utils.completion.getByDateRange.setData(
        { startDate: normalizedStartDate, endDate: normalizedEndDate },
        (old) => {
          if (!old) return old;

          return old.map((habit) => {
            if (habit.id !== habitId) return habit;

            const existingCompletion = habit.completions.find((c) =>
              isSameDayUTC(new Date(c.date), date),
            );

            if (existingCompletion) {
              // Remove completion (optimistic uncomplete)
              return {
                ...habit,
                completions: habit.completions.filter(
                  (c) => !isSameDayUTC(new Date(c.date), date),
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
          { startDate: normalizedStartDate, endDate: normalizedEndDate },
          context.previousData,
        );
      }
      toast.error("Failed to update habit", {
        description: error.message,
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      void utils.completion.getByDateRange.invalidate({ startDate: normalizedStartDate, endDate: normalizedEndDate });
    },
  });

  const toggle = useCallback(
    (habitId: string, date: Date) => {
      // Normalize the date to UTC midnight before sending to server
      const normalizedDate = toUTCMidnight(date);
      toggleMutation.mutate({ habitId, date: normalizedDate });
    },
    [toggleMutation],
  );

  // Helper to check if a specific date is completed for a habit
  const isCompleted = useCallback(
    (habitId: string, date: Date): boolean => {
      const habit = query.data?.find((h) => h.id === habitId);
      if (!habit) return false;

      // Normalize the check date and use UTC comparison
      const normalizedDate = toUTCMidnight(date);
      return habit.completions.some((c) => isSameDayUTC(new Date(c.date), normalizedDate));
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

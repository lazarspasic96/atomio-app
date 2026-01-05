"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import type { CreateHabitInput, UpdateHabitInput } from "../schemas/habit.schema";

export function useHabits() {
  const utils = api.useUtils();

  const habitsQuery = api.habit.getAll.useQuery();

  const createMutation = api.habit.create.useMutation({
    onSuccess: (newHabit) => {
      toast.success("Habit created", {
        description: `"${newHabit.name}" has been added to your habits.`,
      });
      void utils.habit.getAll.invalidate();
      void utils.completion.getByDateRange.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to create habit", {
        description: error.message,
      });
    },
  });

  const updateMutation = api.habit.update.useMutation({
    onSuccess: (updatedHabit) => {
      toast.success("Habit updated", {
        description: `"${updatedHabit.name}" has been updated.`,
      });
      void utils.habit.getAll.invalidate();
      void utils.completion.getByDateRange.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to update habit", {
        description: error.message,
      });
    },
  });

  const deleteMutation = api.habit.delete.useMutation({
    onSuccess: (deletedHabit) => {
      toast.success("Habit deleted", {
        description: `"${deletedHabit.name}" has been removed.`,
      });
      void utils.habit.getAll.invalidate();
      void utils.completion.getByDateRange.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to delete habit", {
        description: error.message,
      });
    },
  });

  const create = useCallback(
    (input: CreateHabitInput) => {
      createMutation.mutate(input);
    },
    [createMutation],
  );

  const update = useCallback(
    (input: UpdateHabitInput) => {
      updateMutation.mutate(input);
    },
    [updateMutation],
  );

  const remove = useCallback(
    (id: string) => {
      deleteMutation.mutate({ id });
    },
    [deleteMutation],
  );

  return {
    // Query state
    habits: habitsQuery.data ?? [],
    isLoading: habitsQuery.isLoading,
    isError: habitsQuery.isError,
    error: habitsQuery.error,

    // Mutations
    create,
    update,
    remove,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isMutating:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,

    // Refetch
    refetch: habitsQuery.refetch,
  };
}

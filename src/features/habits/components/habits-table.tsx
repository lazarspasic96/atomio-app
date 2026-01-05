"use client";

import { Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { TooltipProvider } from "~/components/ui/tooltip";
import { useHabits } from "../hooks/use-habits";
import { useStreaks } from "../hooks/use-streaks";
import { DAYS_OF_WEEK, HABIT_CATEGORIES } from "../schemas/habit.schema";
import { EditHabitDialog } from "./edit-habit-dialog";
import { CreateHabitDialog } from "./create-habit-dialog";
import { HabitStreakBadge } from "./habit-streak-badge";

export function HabitsTable() {
  const { habits, isLoading, remove, isDeleting } = useHabits();
  const { getStreakByHabitId } = useStreaks();

  if (isLoading) {
    return <HabitsTableSkeleton />;
  }

  const getCategoryDisplay = (category: string | null | undefined) => {
    if (!category) return null;
    const categoryInfo = HABIT_CATEGORIES.find((c) => c.value === category);
    if (!categoryInfo) return null;
    return (
      <span className="bg-muted inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs">
        <span>{categoryInfo.emoji}</span>
        <span>{categoryInfo.label}</span>
      </span>
    );
  };

  const getActiveDaysLabel = (activeDays: number[]) => {
    if (activeDays.length === 7) return "Every day";
    if (
      activeDays.length === 5 &&
      [1, 2, 3, 4, 5].every((d) => activeDays.includes(d))
    ) {
      return "Weekdays";
    }
    if (
      activeDays.length === 2 &&
      [0, 6].every((d) => activeDays.includes(d))
    ) {
      return "Weekends";
    }
    return activeDays
      .sort((a, b) => {
        // Sort with Monday first (1, 2, 3, 4, 5, 6, 0)
        const orderA = a === 0 ? 7 : a;
        const orderB = b === 0 ? 7 : b;
        return orderA - orderB;
      })
      .map((d) => DAYS_OF_WEEK.find((day) => day.value === d)?.label)
      .join(", ");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Manage Habits</h2>
        <CreateHabitDialog />
      </div>

      {habits.length === 0 ? (
        <div className="bg-card flex flex-1 items-center justify-center rounded-lg border p-8">
          <div className="text-center">
            <p className="text-muted-foreground">No habits yet</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Click &quot;Add Habit&quot; to create your first habit
            </p>
          </div>
        </div>
      ) : (
        <TooltipProvider>
          <div className="bg-card overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Habit</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Streak</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Active Days</TableHead>
                  <TableHead className="w-[100px] text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {habits.map((habit) => {
                  const streakData = getStreakByHabitId(habit.id);
                  return (
                    <TableRow key={habit.id}>
                      <TableCell className="font-medium">
                        {habit.name}
                      </TableCell>
                      <TableCell>
                        {getCategoryDisplay(habit.category) ?? (
                          <span className="text-muted-foreground text-sm">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {streakData?.currentStreak ? (
                          <HabitStreakBadge
                            currentStreak={streakData.currentStreak}
                            longestStreak={streakData.longestStreak}
                            isAtRisk={streakData.isAtRisk}
                          />
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{habit.frequencyPerWeek}x per week</TableCell>
                      <TableCell>
                        {getActiveDaysLabel(habit.activeDays)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <EditHabitDialog habit={habit} />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Habit
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete &quot;
                                  {habit.name}
                                  &quot;? This will also delete all completion
                                  history for this habit. This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => remove(habit.id)}
                                  disabled={isDeleting}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {isDeleting ? "Deleting..." : "Delete"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TooltipProvider>
      )}
    </div>
  );
}

function HabitsTableSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div className="bg-muted h-6 w-32 animate-pulse rounded" />
        <div className="bg-muted h-9 w-28 animate-pulse rounded" />
      </div>
      <div className="bg-card flex-1 overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Habit</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Streak</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Active Days</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="bg-muted h-5 w-32 animate-pulse rounded" />
                </TableCell>
                <TableCell>
                  <div className="bg-muted h-5 w-16 animate-pulse rounded" />
                </TableCell>
                <TableCell>
                  <div className="bg-muted h-5 w-12 animate-pulse rounded" />
                </TableCell>
                <TableCell>
                  <div className="bg-muted h-5 w-20 animate-pulse rounded" />
                </TableCell>
                <TableCell>
                  <div className="bg-muted h-5 w-24 animate-pulse rounded" />
                </TableCell>
                <TableCell>
                  <div className="bg-muted ml-auto h-8 w-16 animate-pulse rounded" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

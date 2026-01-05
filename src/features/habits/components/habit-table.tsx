"use client";

import { useMemo } from "react";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useCompletions } from "../hooks/use-completions";
import { useHabits } from "../hooks/use-habits";
import { useStreaks } from "../hooks/use-streaks";
import {
  formatDateLong,
  getWeekStart,
  getWeekEnd,
  getWeekDates,
  cn,
} from "~/lib/utils";
import { isToday, isActiveDay, isPastDate } from "../utils/date-utils";
import { CreateHabitDialog } from "./create-habit-dialog";
import { HabitActionsMenu } from "./habit-actions-menu";
import { HabitTableSkeleton } from "./habit-table-skeleton";
import { HabitStreakBadge } from "./habit-streak-badge";

export function HabitTable() {
  // Always show current week (Monday to Sunday)
  const { weekStart, weekEnd, weekDates } = useMemo(() => {
    const today = new Date();
    const start = getWeekStart(today);
    const end = getWeekEnd(today);
    const dates = getWeekDates(start);
    return { weekStart: start, weekEnd: end, weekDates: dates };
  }, []);

  const {
    habits,
    isLoading,
    toggle,
    isToggling,
    isCompleted,
    getCompletionCount,
  } = useCompletions({
    startDate: weekStart,
    endDate: weekEnd,
  });

  const { remove, isDeleting } = useHabits();
  const { getStreakByHabitId, atRiskHabits } = useStreaks();

  // Calculate daily summary (completed/active habits per day)
  const dailySummary = useMemo(() => {
    if (!habits) return [];
    return weekDates.map((date) => {
      let completed = 0;
      let active = 0;
      habits.forEach((habit) => {
        if (isActiveDay(habit.activeDays, date)) {
          active++;
          if (isCompleted(habit.id, date)) {
            completed++;
          }
        }
      });
      return { date, completed, active };
    });
  }, [habits, weekDates, isCompleted]);

  if (isLoading) {
    return <HabitTableSkeleton />;
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">This Week</h2>
          <CreateHabitDialog />
        </div>

        {/* Table or empty state */}
        {habits && habits.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Date</TableHead>
                  {habits.map((habit) => (
                    <TableHead key={habit.id} className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="max-w-[120px] cursor-default truncate">
                              {habit.name}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{habit.name}</p>
                            <p className="text-muted-foreground text-xs">
                              {habit.frequencyPerWeek}x per week
                            </p>
                          </TooltipContent>
                        </Tooltip>
                        <HabitActionsMenu
                          habitId={habit.id}
                          habitName={habit.name}
                          onDelete={() => remove(habit.id)}
                          isDeleting={isDeleting}
                        />
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="w-[80px] text-center">Done</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weekDates.map((date) => {
                  const isTodayDate = isToday(date);
                  const isDateInPast = isPastDate(date);
                  const summary = dailySummary.find(
                    (s) => s.date.getTime() === date.getTime()
                  );

                  return (
                    <TableRow
                      key={date.toISOString()}
                      className={isTodayDate ? "bg-primary/5" : ""}
                    >
                      <TableCell className="font-medium">
                        <span
                          className={
                            isTodayDate ? "text-primary font-bold" : ""
                          }
                        >
                          {formatDateLong(date)}
                        </span>
                      </TableCell>
                      {habits.map((habit) => {
                        const active = isActiveDay(habit.activeDays, date);
                        const completed = isCompleted(habit.id, date);
                        const isMissed = isDateInPast && active && !completed;

                        return (
                          <TableCell
                            key={habit.id}
                            className={cn(
                              "text-center",
                              isMissed && "bg-red-50 dark:bg-red-950/20",
                              completed && active && "bg-green-50 dark:bg-green-950/20"
                            )}
                          >
                            {active ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex justify-center">
                                    <Checkbox
                                      checked={completed}
                                      onCheckedChange={() =>
                                        toggle(habit.id, date)
                                      }
                                      disabled={isToggling}
                                      className={cn(
                                        isTodayDate && "border-primary",
                                        isMissed && "border-red-400 dark:border-red-600"
                                      )}
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {completed
                                      ? "Mark as incomplete"
                                      : isMissed
                                        ? "Missed - click to complete"
                                        : "Mark as complete"}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        );
                      })}
                      {/* Daily summary cell */}
                      <TableCell className="text-center">
                        {summary && summary.active > 0 ? (
                          <span
                            className={cn(
                              "text-sm",
                              summary.completed === summary.active
                                ? "text-green-600 dark:text-green-400 font-medium"
                                : summary.completed === 0 && isDateInPast
                                  ? "text-red-500"
                                  : "text-muted-foreground"
                            )}
                          >
                            {summary.completed}/{summary.active}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {/* Weekly summary row with Done and Streak */}
                <TableRow className="bg-muted/50 font-medium border-t-2">
                  <TableCell>Weekly Progress</TableCell>
                  {habits.map((habit) => {
                    const streak = getStreakByHabitId(habit.id);
                    const isAtRisk = atRiskHabits.some(
                      (h) => h.habitId === habit.id
                    );
                    const completionCount = getCompletionCount(habit.id);
                    const goalMet = completionCount >= habit.frequencyPerWeek;

                    return (
                      <TableCell key={habit.id} className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={cn(
                              goalMet && "text-green-600 dark:text-green-400"
                            )}
                          >
                            {completionCount}/{habit.frequencyPerWeek}
                          </span>
                          {streak && (
                            <HabitStreakBadge
                              currentStreak={streak.currentStreak}
                              longestStreak={streak.longestStreak}
                              isAtRisk={isAtRisk}
                              size="sm"
                            />
                          )}
                        </div>
                      </TableCell>
                    );
                  })}
                  {/* Total summary */}
                  <TableCell className="text-center">
                    <span className="text-sm text-muted-foreground">
                      {dailySummary.reduce((sum, d) => sum + d.completed, 0)}/
                      {dailySummary.reduce((sum, d) => sum + d.active, 0)}
                    </span>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-16">
            <p className="text-muted-foreground mb-4">
              No habits yet. Create your first habit to start tracking!
            </p>
            <CreateHabitDialog />
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

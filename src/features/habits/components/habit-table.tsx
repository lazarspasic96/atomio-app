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
import {
  formatDateLong,
  getWeekStart,
  getWeekEnd,
  getWeekDates,
} from "~/lib/utils";
import { isToday, isActiveDay } from "../utils/date-utils";
import { CreateHabitDialog } from "./create-habit-dialog";
import { HabitActionsMenu } from "./habit-actions-menu";
import { HabitTableSkeleton } from "./habit-table-skeleton";

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
                </TableRow>
              </TableHeader>
              <TableBody>
                {weekDates.map((date) => {
                  const isTodayDate = isToday(date);
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

                        return (
                          <TableCell key={habit.id} className="text-center">
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
                                      className={
                                        isTodayDate ? "border-primary" : ""
                                      }
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {completed
                                      ? "Mark as incomplete"
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
                    </TableRow>
                  );
                })}
                {/* Weekly summary row */}
                <TableRow className="bg-muted/50 font-medium">
                  <TableCell>Weekly Progress</TableCell>
                  {habits.map((habit) => (
                    <TableCell key={habit.id} className="text-center">
                      <span
                        className={
                          getCompletionCount(habit.id) >= habit.frequencyPerWeek
                            ? "text-green-600"
                            : ""
                        }
                      >
                        {getCompletionCount(habit.id)}/{habit.frequencyPerWeek}
                      </span>
                    </TableCell>
                  ))}
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

"use client";

import { useMemo } from "react";
import { useCompletions } from "../../hooks/use-completions";
import { useHabits } from "../../hooks/use-habits";
import {
  getMonthStart,
  getMonthEnd,
  getMonthDates,
  formatMonthYear,
  isSameDay,
  isCurrentMonth,
} from "~/lib/utils";
import { TooltipProvider } from "~/components/ui/tooltip";
import { isActiveDay } from "../../utils/date-utils";
import { CreateHabitDialog } from "../create-habit-dialog";
import { HabitCalendarDayCell } from "./habit-calendar-day-cell";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function HabitCalendarView() {
  const today = new Date();

  // Get all dates for the month calendar grid
  const { monthStart, monthEnd, monthDates } = useMemo(() => {
    const start = getMonthStart(today);
    const end = getMonthEnd(today);
    const dates = getMonthDates(today);
    return { monthStart: start, monthEnd: end, monthDates: dates };
  }, []);

  const {
    habits,
    isLoading,
    toggle,
    isToggling,
    isCompleted,
  } = useCompletions({
    startDate: monthDates[0]!,
    endDate: monthDates[monthDates.length - 1]!,
  });

  const { remove, isDeleting } = useHabits();

  if (isLoading) {
    return <HabitCalendarSkeleton />;
  }

  // Group dates into weeks (7 days per row)
  const weeks: Date[][] = [];
  for (let i = 0; i < monthDates.length; i += 7) {
    weeks.push(monthDates.slice(i, i + 7));
  }

  return (
    <TooltipProvider>
      <div className="flex h-full flex-col">
        {/* Top controls */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{formatMonthYear(today)}</h2>
          <CreateHabitDialog />
        </div>

        {/* Calendar grid */}
        <div className="flex-1 overflow-auto rounded-lg border bg-card">
          {/* Weekday headers - hidden on mobile */}
          <div className="sticky top-0 z-10 hidden border-b bg-muted/50 md:grid md:grid-cols-7">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="border-r p-2 text-center text-sm font-medium last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Mobile: single column layout */}
          <div className="flex flex-col md:hidden">
            {monthDates.map((day) => {
              const isInCurrentMonth = isCurrentMonth(day, today);
              const isToday = isSameDay(day, today);
              const dayHabits = (habits ?? []).filter((habit) =>
                isActiveDay(habit.activeDays, day)
              );

              return (
                <HabitCalendarDayCell
                  key={day.toISOString()}
                  day={day}
                  isToday={isToday}
                  isCurrentMonth={isInCurrentMonth}
                  habits={dayHabits}
                  isCompleted={isCompleted}
                  toggle={toggle}
                  isToggling={isToggling}
                  remove={remove}
                  isDeleting={isDeleting}
                  showFullDate
                />
              );
            })}
          </div>

          {/* Desktop: calendar grid rows */}
          <div className="hidden md:grid">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 border-b last:border-b-0">
                {week.map((day) => {
                  const isInCurrentMonth = isCurrentMonth(day, today);
                  const isToday = isSameDay(day, today);
                  const dayHabits = (habits ?? []).filter((habit) =>
                    isActiveDay(habit.activeDays, day)
                  );

                  return (
                    <HabitCalendarDayCell
                      key={day.toISOString()}
                      day={day}
                      isToday={isToday}
                      isCurrentMonth={isInCurrentMonth}
                      habits={dayHabits}
                      isCompleted={isCompleted}
                      toggle={toggle}
                      isToggling={isToggling}
                      remove={remove}
                      isDeleting={isDeleting}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

function HabitCalendarSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-6 w-32 animate-pulse rounded bg-muted" />
        <div className="h-9 w-28 animate-pulse rounded bg-muted" />
      </div>
      <div className="flex-1 overflow-hidden rounded-lg border bg-card">
        {/* Header */}
        <div className="grid grid-cols-7 border-b bg-muted/50">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="border-r p-2 last:border-r-0">
              <div className="mx-auto h-4 w-8 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
        {/* Grid */}
        {Array.from({ length: 5 }).map((_, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 border-b last:border-b-0">
            {Array.from({ length: 7 }).map((_, dayIndex) => (
              <div
                key={dayIndex}
                className="min-h-[120px] border-r p-2 last:border-r-0"
              >
                <div className="mb-2 h-5 w-5 animate-pulse rounded bg-muted" />
                <div className="space-y-1">
                  <div className="h-6 animate-pulse rounded bg-muted" />
                  <div className="h-6 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

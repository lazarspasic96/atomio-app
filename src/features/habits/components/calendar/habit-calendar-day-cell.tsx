"use client";

import { Checkbox } from "~/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

interface Habit {
  id: string;
  name: string;
  frequencyPerWeek: number;
  activeDays: number[];
}

interface HabitCalendarDayCellProps {
  day: Date;
  isToday: boolean;
  isCurrentMonth: boolean;
  habits: Habit[];
  isCompleted: (habitId: string, date: Date) => boolean;
  toggle: (habitId: string, date: Date) => void;
  isToggling: boolean;
  remove: (id: string) => void;
  isDeleting: boolean;
  showFullDate?: boolean;
}

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function HabitCalendarDayCell({
  day,
  isToday,
  isCurrentMonth,
  habits,
  isCompleted,
  toggle,
  isToggling,
  showFullDate,
}: HabitCalendarDayCellProps) {
  return (
    <div
      className={`min-h-[80px] border-b p-3 last:border-b-0 md:min-h-[100px] md:border-b-0 md:border-r md:p-2 md:last:border-r-0 ${
        !isCurrentMonth ? "bg-muted/30" : ""
      } ${isToday ? "bg-primary/5" : ""}`}
    >
      {/* Day header */}
      <div
        className={`mb-2 flex items-center gap-2 ${
          isToday
            ? "font-bold text-primary"
            : isCurrentMonth
              ? "font-medium"
              : "text-muted-foreground"
        }`}
      >
        {showFullDate ? (
          <span className="text-sm">
            {WEEKDAY_NAMES[day.getDay()]}, {day.getDate()}
          </span>
        ) : (
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full text-sm ${
              isToday ? "bg-primary text-primary-foreground" : ""
            }`}
          >
            {day.getDate()}
          </span>
        )}
      </div>

      {/* Habits list */}
      <div className="space-y-1.5">
        {habits.map((habit) => {
          const completed = isCompleted(habit.id, day);

          return (
            <Tooltip key={habit.id}>
              <TooltipTrigger asChild>
                <div
                  className={`flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 text-sm transition-colors ${
                    completed
                      ? "border-green-500/50 bg-green-500/20 text-green-700 dark:border-green-500/30 dark:text-green-400"
                      : "border-border bg-muted/80 hover:bg-muted"
                  }`}
                  onClick={() => !isToggling && toggle(habit.id, day)}
                >
                  <Checkbox
                    checked={completed}
                    onCheckedChange={() => toggle(habit.id, day)}
                    onClick={(e) => e.stopPropagation()}
                    disabled={isToggling}
                    className="h-4 w-4 border-2"
                  />
                  <span
                    className={`truncate font-medium ${completed ? "line-through opacity-70" : ""}`}
                  >
                    {habit.name}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{habit.name}</p>
                <p className="text-xs text-muted-foreground">
                  {completed ? "Click to mark incomplete" : "Click to complete"}
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}

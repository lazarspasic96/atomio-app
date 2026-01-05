"use client";

import { Checkbox } from "~/components/ui/checkbox";
import { isSameDay } from "~/lib/utils";
import { isActiveDay } from "../../utils/date-utils";
import { HabitActionsMenu } from "../habit-actions-menu";

interface Habit {
  id: string;
  name: string;
  frequencyPerWeek: number;
  activeDays: number[];
}

interface HabitCalendarDayColumnProps {
  day: Date;
  today: Date;
  habits: Habit[];
  isCompleted: (habitId: string, date: Date) => boolean;
  toggle: (habitId: string, date: Date) => void;
  isToggling: boolean;
  remove: (id: string) => void;
  isDeleting: boolean;
}

export function HabitCalendarDayColumn({
  day,
  today,
  habits,
  isCompleted,
  toggle,
  isToggling,
  remove,
  isDeleting,
}: HabitCalendarDayColumnProps) {
  const isToday = isSameDay(day, today);

  return (
    <div
      className={`flex min-w-[140px] flex-1 flex-col border-r last:border-r-0 ${
        isToday ? "bg-primary/5" : ""
      }`}
    >
      <div className="flex-1 space-y-2 overflow-y-auto p-2">
        {habits.map((habit) => {
          const active = isActiveDay(habit.activeDays, day);
          const completed = isCompleted(habit.id, day);

          if (!active) return null;

          return (
            <div
              key={habit.id}
              className={`group flex items-start gap-2 rounded-md border p-2 transition-colors ${
                completed
                  ? "border-green-500/30 bg-green-500/10"
                  : "border-border bg-background hover:bg-muted/50"
              }`}
            >
              <Checkbox
                checked={completed}
                onCheckedChange={() => toggle(habit.id, day)}
                disabled={isToggling}
                className={`mt-0.5 ${isToday ? "border-primary" : ""}`}
              />
              <div className="min-w-0 flex-1">
                <span
                  className={`text-sm ${
                    completed ? "text-muted-foreground line-through" : ""
                  }`}
                >
                  {habit.name}
                </span>
              </div>
              <div className="opacity-0 transition-opacity group-hover:opacity-100">
                <HabitActionsMenu
                  habitId={habit.id}
                  habitName={habit.name}
                  onDelete={() => remove(habit.id)}
                  isDeleting={isDeleting}
                />
              </div>
            </div>
          );
        })}

        {/* Show message if no active habits for this day */}
        {habits.filter((h) => isActiveDay(h.activeDays, day)).length === 0 && (
          <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
            No habits
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { format } from "date-fns";
import { isSameDay } from "~/lib/utils";

interface HabitCalendarHeaderProps {
  weekDays: Date[];
  today: Date;
}

export function HabitCalendarHeader({
  weekDays,
  today,
}: HabitCalendarHeaderProps) {
  return (
    <div className="flex border-b bg-muted/30">
      {weekDays.map((day) => {
        const isToday = isSameDay(day, today);
        return (
          <div
            key={day.toISOString()}
            className={`flex-1 border-r p-3 last:border-r-0 ${
              isToday ? "bg-primary/10" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-medium ${
                  isToday ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {format(day, "dd")}
              </span>
              <span
                className={`text-sm font-medium uppercase ${
                  isToday ? "text-primary" : "text-foreground"
                }`}
              >
                {format(day, "EEE")}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

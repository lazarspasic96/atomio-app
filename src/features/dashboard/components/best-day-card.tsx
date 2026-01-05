"use client";

import { BarChart3, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface DayCount {
  day: number;
  dayName: string;
  count: number;
}

interface BestDayCardProps {
  /** Completions by day of week */
  byDayOfWeek: DayCount[];
  /** Best performing day */
  bestDay: { day: string; count: number } | null;
  /** Total completions in period */
  totalCompletions: number;
  /** Loading state */
  isLoading?: boolean;
}

/**
 * Best Day Card
 *
 * Shows which day of the week the user performs best on.
 * Helps identify patterns for habit stacking.
 */
export function BestDayCard({
  byDayOfWeek,
  bestDay,
  totalCompletions,
  isLoading,
}: BestDayCardProps) {
  if (isLoading) {
    return <BestDayCardSkeleton />;
  }

  const maxCount = Math.max(...byDayOfWeek.map((d) => d.count), 1);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-4 w-4 text-blue-500" />
          Completion Patterns
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {totalCompletions === 0 ? (
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground">
              No completion data yet. Start tracking to see your patterns!
            </p>
          </div>
        ) : (
          <>
            {bestDay && (
              <div className="flex items-center gap-2 rounded-lg bg-yellow-500/10 p-3">
                <Star className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium">
                    {bestDay.day} is your best day!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {bestDay.count} completions in the last 4 weeks
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Last 4 weeks</p>
              <div className="flex justify-between gap-1">
                {byDayOfWeek.map((day) => {
                  const heightPercent = (day.count / maxCount) * 100;
                  const isBestDay = bestDay?.day === day.dayName;

                  return (
                    <div
                      key={day.day}
                      className="flex flex-1 flex-col items-center gap-1"
                    >
                      <div className="relative flex h-16 w-full flex-col justify-end">
                        <div
                          className={`w-full rounded-t ${
                            isBestDay ? "bg-yellow-500" : "bg-primary/60"
                          } transition-all`}
                          style={{ height: `${Math.max(heightPercent, 4)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {day.dayName}
                      </span>
                      <span className="text-[10px] font-medium">{day.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function BestDayCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-4 w-4 text-blue-500" />
          Completion Patterns
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-12 animate-pulse rounded-lg bg-muted" />
        <div className="flex justify-between gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div className="h-16 w-full animate-pulse rounded-t bg-muted" />
              <div className="h-3 w-6 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

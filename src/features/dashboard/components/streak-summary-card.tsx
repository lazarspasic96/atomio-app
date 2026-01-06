"use client";

import { Flame, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface StreakItem {
  habitId: string;
  habitName: string;
  emoji?: string | null;
  currentStreak: number;
  isAtRisk?: boolean;
}

interface StreakSummaryCardProps {
  streaks: StreakItem[];
  atRiskHabits: StreakItem[];
  isLoading?: boolean;
}

export function StreakSummaryCard({
  streaks,
  atRiskHabits,
  isLoading,
}: StreakSummaryCardProps) {
  if (isLoading) {
    return <StreakSummaryCardSkeleton />;
  }

  const activeStreaks = streaks.filter((s) => s.currentStreak > 0);
  const totalStreakDays = activeStreaks.reduce(
    (sum, s) => sum + s.currentStreak,
    0
  );
  const longestStreak = activeStreaks.length > 0
    ? Math.max(...activeStreaks.map((s) => s.currentStreak))
    : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Flame className="h-4 w-4 text-orange-500" />
          Streak Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeStreaks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Complete habits on consecutive days to build streaks!
          </p>
        ) : (
          <>
            <div className="flex gap-6">
              <div>
                <p className="text-2xl font-bold">{activeStreaks.length}</p>
                <p className="text-xs text-muted-foreground">Active streaks</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{longestStreak}</p>
                <p className="text-xs text-muted-foreground">Longest</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStreakDays}</p>
                <p className="text-xs text-muted-foreground">Total days</p>
              </div>
            </div>

            {atRiskHabits.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-3 w-3" />
                  At risk today
                </p>
                <div className="space-y-1">
                  {atRiskHabits.slice(0, 3).map((habit) => (
                    <div
                      key={habit.habitId}
                      className="flex items-center justify-between rounded bg-amber-50 px-2 py-1 text-sm dark:bg-amber-950/30"
                    >
                      <span className="truncate text-amber-900 dark:text-amber-100">
                        {habit.emoji && <span className="mr-1">{habit.emoji}</span>}
                        {habit.habitName}
                      </span>
                      <span className="flex items-center gap-0.5 text-orange-600 dark:text-orange-400">
                        <Flame className="h-3 w-3" />
                        {habit.currentStreak}
                      </span>
                    </div>
                  ))}
                  {atRiskHabits.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{atRiskHabits.length - 3} more
                    </p>
                  )}
                </div>
              </div>
            )}

            {atRiskHabits.length === 0 && activeStreaks.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Top streaks
                </p>
                <div className="space-y-1">
                  {activeStreaks
                    .sort((a, b) => b.currentStreak - a.currentStreak)
                    .slice(0, 3)
                    .map((streak) => (
                      <div
                        key={streak.habitId}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="truncate text-muted-foreground">
                          {streak.emoji && <span className="mr-1">{streak.emoji}</span>}
                          {streak.habitName}
                        </span>
                        <span className="flex items-center gap-0.5 font-medium text-orange-600 dark:text-orange-400">
                          <Flame className="h-3 w-3" />
                          {streak.currentStreak}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function StreakSummaryCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="h-4 w-28 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="flex gap-6">
          <div>
            <div className="h-8 w-8 animate-pulse rounded bg-muted" />
            <div className="mt-1 h-3 w-16 animate-pulse rounded bg-muted" />
          </div>
          <div>
            <div className="h-8 w-8 animate-pulse rounded bg-muted" />
            <div className="mt-1 h-3 w-12 animate-pulse rounded bg-muted" />
          </div>
          <div>
            <div className="h-8 w-8 animate-pulse rounded bg-muted" />
            <div className="mt-1 h-3 w-14 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

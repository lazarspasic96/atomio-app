"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { cn } from "~/lib/utils";

interface WeeklyTrendsCardProps {
  /** This week's completion rate (0-100) */
  thisWeekRate: number;
  /** Last week's completion rate (0-100) */
  lastWeekRate: number;
  /** This week's total completions */
  thisWeekCompletions: number;
  /** Last week's total completions */
  lastWeekCompletions: number;
  /** Whether data is loading */
  isLoading?: boolean;
}

/**
 * Weekly Trends Card
 *
 * Shows week-over-week comparison of habit completion rates.
 * Implements the "1% Better" concept from Atomic Habits.
 */
export function WeeklyTrendsCard({
  thisWeekRate,
  lastWeekRate,
  thisWeekCompletions,
  lastWeekCompletions,
  isLoading,
}: WeeklyTrendsCardProps) {
  if (isLoading) {
    return <WeeklyTrendsCardSkeleton />;
  }

  const rateDiff = thisWeekRate - lastWeekRate;
  const completionDiff = thisWeekCompletions - lastWeekCompletions;

  const getTrendInfo = () => {
    if (rateDiff > 0) {
      return {
        icon: TrendingUp,
        color: "text-green-500",
        bgColor: "bg-green-500/10",
        message: "You're improving!",
        subMessage: "Keep stacking those 1% improvements",
      };
    }
    if (rateDiff < 0) {
      return {
        icon: TrendingDown,
        color: "text-red-500",
        bgColor: "bg-red-500/10",
        message: "Slight dip this week",
        subMessage: "Every expert was once a beginner. Get back on track!",
      };
    }
    return {
      icon: Minus,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      message: "Holding steady",
      subMessage: "Consistency is key. Push for that 1% improvement!",
    };
  };

  const trend = getTrendInfo();
  const TrendIcon = trend.icon;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className={cn("rounded-full p-1", trend.bgColor)}>
            <TrendIcon className={cn("h-4 w-4", trend.color)} />
          </div>
          Weekly Trends
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">This Week</p>
            <p className="text-2xl font-bold">{thisWeekRate.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">
              {thisWeekCompletions} completions
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Last Week</p>
            <p className="text-2xl font-bold text-muted-foreground">
              {lastWeekRate.toFixed(0)}%
            </p>
            <p className="text-xs text-muted-foreground">
              {lastWeekCompletions} completions
            </p>
          </div>
        </div>

        <div className="border-t pt-3">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                trend.bgColor,
                trend.color,
              )}
            >
              <TrendIcon className="h-3 w-3" />
              {rateDiff > 0 ? "+" : ""}
              {rateDiff.toFixed(1)}%
            </span>
            <span className="text-xs text-muted-foreground">
              ({completionDiff > 0 ? "+" : ""}
              {completionDiff} completions)
            </span>
          </div>
          <p className="mt-2 text-sm font-medium">{trend.message}</p>
          <p className="text-xs text-muted-foreground">{trend.subMessage}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function WeeklyTrendsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="h-6 w-6 animate-pulse rounded-full bg-muted" />
          Weekly Trends
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            <div className="mt-1 h-8 w-12 animate-pulse rounded bg-muted" />
            <div className="mt-1 h-3 w-20 animate-pulse rounded bg-muted" />
          </div>
          <div>
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            <div className="mt-1 h-8 w-12 animate-pulse rounded bg-muted" />
            <div className="mt-1 h-3 w-20 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="border-t pt-3">
          <div className="h-5 w-24 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-32 animate-pulse rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}

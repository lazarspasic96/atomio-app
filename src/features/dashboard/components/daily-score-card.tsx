"use client";

import { TrendingUp, TrendingDown, Minus, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { cn } from "~/lib/utils";

interface DailyScoreCardProps {
  score: number;
  completedCount: number;
  totalCount: number;
  comparisonYesterday: number;
  isLoading?: boolean;
}

export function DailyScoreCard({
  score,
  completedCount,
  totalCount,
  comparisonYesterday,
  isLoading,
}: DailyScoreCardProps) {
  if (isLoading) {
    return <DailyScoreCardSkeleton />;
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 50) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const getMotivationalMessage = (score: number, total: number) => {
    if (total === 0) return "No habits scheduled for today";
    if (score === 100) return "Perfect day! You're crushing it!";
    if (score >= 80) return "Great progress! Keep going!";
    if (score >= 50) return "You're on track. Finish strong!";
    if (score > 0) return "Every habit counts. Keep pushing!";
    return "Start your day with one small win!";
  };

  const ComparisonIcon = comparisonYesterday > 0
    ? TrendingUp
    : comparisonYesterday < 0
      ? TrendingDown
      : Minus;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <CheckCircle2 className="h-4 w-4" />
          Today&apos;s Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className={cn("text-4xl font-bold", getScoreColor(score))}>
            {score}%
          </span>
          {comparisonYesterday !== 0 && (
            <span
              className={cn(
                "flex items-center text-sm",
                comparisonYesterday > 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              )}
            >
              <ComparisonIcon className="h-3 w-3 mr-0.5" />
              {Math.abs(comparisonYesterday)}%
            </span>
          )}
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          {completedCount} of {totalCount} habits completed
        </p>

        <p className="mt-3 text-xs text-muted-foreground">
          {getMotivationalMessage(score, totalCount)}
        </p>
      </CardContent>
    </Card>
  );
}

function DailyScoreCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="h-10 w-20 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-40 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-3 w-48 animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  );
}

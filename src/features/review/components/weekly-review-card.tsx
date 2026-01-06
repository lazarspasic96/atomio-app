"use client";

import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Trophy,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface HabitPerformance {
  habitId: string;
  habitName: string;
  emoji: string | null;
  completed: number;
  possible: number;
  rate: number;
  streak: number;
}

interface WeeklyReviewData {
  id: string;
  weekStartDate: Date;
  weekEndDate: Date;
  completionRate: number;
  totalCompleted: number;
  totalPossible: number;
  previousWeekRate: number | null;
  changeFromPrevious: number | null;
  wins: unknown; // Prisma Json type
  needsAttention: unknown; // Prisma Json type
  focusSuggestion: string | null;
  habitPerformance: unknown; // Prisma Json type
  viewedAt: Date | null;
}

interface WeeklyReviewCardProps {
  review: WeeklyReviewData | null;
  isLoading?: boolean;
  onMarkViewed?: (reviewId: string) => void;
  variant?: "compact" | "full";
}

export function WeeklyReviewCard({
  review,
  isLoading,
  onMarkViewed,
  variant = "compact",
}: WeeklyReviewCardProps) {
  if (isLoading) {
    return <WeeklyReviewCardSkeleton variant={variant} />;
  }

  if (!review) {
    return (
      <Card className={variant === "full" ? "col-span-full" : ""}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="h-4 w-4 text-blue-500" />
            Weekly Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your weekly review will be available mid-week. Keep tracking your habits!
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const TrendIcon =
    review.changeFromPrevious !== null
      ? review.changeFromPrevious > 0
        ? TrendingUp
        : review.changeFromPrevious < 0
          ? TrendingDown
          : Minus
      : Minus;

  const trendColor =
    review.changeFromPrevious !== null
      ? review.changeFromPrevious > 0
        ? "text-green-500"
        : review.changeFromPrevious < 0
          ? "text-red-500"
          : "text-gray-400"
      : "text-gray-400";

  const wins = Array.isArray(review.wins) ? (review.wins as string[]) : [];
  const needsAttention = Array.isArray(review.needsAttention)
    ? (review.needsAttention as string[])
    : [];
  const habitPerformance = Array.isArray(review.habitPerformance)
    ? (review.habitPerformance as HabitPerformance[])
    : [];

  if (variant === "compact") {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4 text-blue-500" />
              Weekly Review
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              {formatDate(review.weekStartDate)} - {formatDate(review.weekEndDate)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Completion rate */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm">Completion Rate</span>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-lg font-bold",
                    review.completionRate >= 80
                      ? "text-green-500"
                      : review.completionRate >= 60
                        ? "text-yellow-500"
                        : "text-red-500"
                  )}
                >
                  {review.completionRate}%
                </span>
                {review.changeFromPrevious !== null && (
                  <span className={cn("flex items-center text-xs", trendColor)}>
                    <TrendIcon className="h-3 w-3" />
                    {Math.abs(review.changeFromPrevious)}%
                  </span>
                )}
              </div>
            </div>
            <Progress value={review.completionRate} className="h-2" />
          </div>

          {/* Quick summary */}
          <div className="flex gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Completed</p>
              <p className="font-medium">{review.totalCompleted}/{review.totalPossible}</p>
            </div>
          </div>

          {/* Top win or attention item */}
          {wins.length > 0 && (
            <div className="flex items-start gap-2 rounded-lg bg-green-50 p-2 dark:bg-green-950/30">
              <Trophy className="h-4 w-4 shrink-0 text-green-500 mt-0.5" />
              <p className="text-xs text-green-700 dark:text-green-400">
                {wins[0]}
              </p>
            </div>
          )}

          {wins.length === 0 && needsAttention.length > 0 && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-2 dark:bg-amber-950/30">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                {needsAttention[0]}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Full variant
  return (
    <Card className="col-span-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="h-4 w-4 text-blue-500" />
            Weekly Review
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {formatDate(review.weekStartDate)} - {formatDate(review.weekEndDate)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Completion Rate</p>
            <div className="flex items-end gap-2">
              <span
                className={cn(
                  "text-3xl font-bold",
                  review.completionRate >= 80
                    ? "text-green-500"
                    : review.completionRate >= 60
                      ? "text-yellow-500"
                      : "text-red-500"
                )}
              >
                {review.completionRate}%
              </span>
              {review.changeFromPrevious !== null && (
                <span className={cn("flex items-center text-sm mb-1", trendColor)}>
                  <TrendIcon className="h-4 w-4" />
                  {Math.abs(review.changeFromPrevious)}% vs last week
                </span>
              )}
            </div>
            <Progress value={review.completionRate} className="h-2" />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Habits Completed</p>
            <p className="text-3xl font-bold">
              {review.totalCompleted}
              <span className="text-lg text-muted-foreground">
                /{review.totalPossible}
              </span>
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">vs Previous Week</p>
            {review.previousWeekRate !== null ? (
              <p className="text-3xl font-bold">
                {review.previousWeekRate}%
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">No previous data</p>
            )}
          </div>
        </div>

        {/* Wins and Needs Attention */}
        <div className="grid gap-4 md:grid-cols-2">
          {wins.length > 0 && (
            <div className="space-y-2">
              <p className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
                <Trophy className="h-4 w-4" />
                Wins This Week
              </p>
              <div className="space-y-1">
                {wins.map((win, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded-lg bg-green-50 p-2 dark:bg-green-950/30"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500 mt-0.5" />
                    <p className="text-sm text-green-700 dark:text-green-400">
                      {win}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {needsAttention.length > 0 && (
            <div className="space-y-2">
              <p className="flex items-center gap-1 text-sm font-medium text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4" />
                Needs Attention
              </p>
              <div className="space-y-1">
                {needsAttention.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded-lg bg-amber-50 p-2 dark:bg-amber-950/30"
                  >
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Focus suggestion */}
        {review.focusSuggestion && (
          <div className="flex items-start gap-3 rounded-lg border bg-muted/50 p-4">
            <Lightbulb className="h-5 w-5 shrink-0 text-yellow-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Focus for Next Week</p>
              <p className="text-sm text-muted-foreground">
                {review.focusSuggestion}
              </p>
            </div>
          </div>
        )}

        {/* Habit breakdown */}
        {habitPerformance.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Habit Breakdown</p>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {habitPerformance.map((habit) => (
                <div
                  key={habit.habitId}
                  className="flex items-center justify-between rounded-lg border p-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {habit.emoji && (
                      <span className="text-lg">{habit.emoji}</span>
                    )}
                    <span className="text-sm truncate">{habit.habitName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        habit.rate >= 80
                          ? "text-green-500"
                          : habit.rate >= 50
                            ? "text-yellow-500"
                            : "text-red-500"
                      )}
                    >
                      {habit.rate}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {habit.completed}/{habit.possible}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mark as viewed */}
        {!review.viewedAt && onMarkViewed && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMarkViewed(review.id)}
          >
            Mark as Reviewed
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function WeeklyReviewCardSkeleton({ variant }: { variant: "compact" | "full" }) {
  if (variant === "compact") {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="h-4 w-28 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-6 w-12 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
          </div>
          <div className="h-12 animate-pulse rounded-lg bg-muted" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader className="pb-2">
        <div className="h-4 w-28 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-10 w-20 animate-pulse rounded bg-muted" />
            <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-28 animate-pulse rounded bg-muted" />
            <div className="h-10 w-16 animate-pulse rounded bg-muted" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-10 w-12 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-24 animate-pulse rounded-lg bg-muted" />
          <div className="h-24 animate-pulse rounded-lg bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}

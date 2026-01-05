"use client";

import { Flame, AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";

interface HabitStreakBadgeProps {
  currentStreak: number;
  longestStreak?: number;
  isAtRisk?: boolean;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

export function HabitStreakBadge({
  currentStreak,
  longestStreak,
  isAtRisk = false,
  size = "md",
  showTooltip = true,
}: HabitStreakBadgeProps) {
  if (currentStreak === 0 && !isAtRisk) {
    return null;
  }

  const sizeClasses = {
    sm: "text-xs gap-0.5",
    md: "text-sm gap-1",
    lg: "text-base gap-1.5",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const badge = (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 font-medium",
        sizeClasses[size],
        currentStreak > 0
          ? isAtRisk
            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
          : "bg-muted text-muted-foreground",
        isAtRisk && "animate-pulse"
      )}
    >
      {isAtRisk ? (
        <AlertTriangle className={cn(iconSizes[size])} />
      ) : (
        <Flame className={cn(iconSizes[size])} />
      )}
      <span>{currentStreak}</span>
    </div>
  );

  if (!showTooltip) {
    return badge;
  }

  const isPersonalBest = longestStreak !== undefined && currentStreak >= longestStreak && currentStreak > 0;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent>
        <div className="text-center">
          <p className="font-medium">
            {currentStreak} day streak{currentStreak !== 1 ? "" : ""}
            {isPersonalBest && currentStreak > 0 && " (Personal Best!)"}
          </p>
          {isAtRisk && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Complete today to keep your streak!
            </p>
          )}
          {longestStreak !== undefined && longestStreak > currentStreak && (
            <p className="text-xs text-muted-foreground">
              Best: {longestStreak} days
            </p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Compact version showing just the flame and number
 */
export function StreakCount({
  streak,
  className,
}: {
  streak: number;
  className?: string;
}) {
  if (streak === 0) {
    return null;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-orange-600 dark:text-orange-400",
        className
      )}
    >
      <Flame className="h-3 w-3" />
      <span className="text-xs font-medium">{streak}</span>
    </span>
  );
}

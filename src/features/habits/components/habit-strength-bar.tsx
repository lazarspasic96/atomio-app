"use client";

import { Zap, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import { getStrengthLabel, type StrengthScores } from "~/lib/strength";

interface HabitStrengthBarProps {
  strength: number;
  scores?: Partial<StrengthScores>;
  trend?: number; // -1 = declining, 0 = stable, 1 = improving
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  showTooltip?: boolean;
  className?: string;
}

export function HabitStrengthBar({
  strength,
  scores,
  trend,
  size = "md",
  showLabel = true,
  showTooltip = true,
  className,
}: HabitStrengthBarProps) {
  const { label, color, description } = getStrengthLabel(strength);

  const colorClasses: Record<string, string> = {
    green: "bg-green-500",
    emerald: "bg-emerald-500",
    yellow: "bg-yellow-500",
    orange: "bg-orange-500",
    gray: "bg-gray-400",
  };

  const textColorClasses: Record<string, string> = {
    green: "text-green-600 dark:text-green-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    yellow: "text-yellow-600 dark:text-yellow-400",
    orange: "text-orange-600 dark:text-orange-400",
    gray: "text-gray-500 dark:text-gray-400",
  };

  const sizeClasses = {
    sm: { bar: "h-1.5", text: "text-xs", icon: "h-3 w-3" },
    md: { bar: "h-2", text: "text-sm", icon: "h-4 w-4" },
    lg: { bar: "h-3", text: "text-base", icon: "h-5 w-5" },
  };

  const TrendIcon =
    trend === 1 ? TrendingUp : trend === -1 ? TrendingDown : Minus;
  const trendColor =
    trend === 1
      ? "text-green-500"
      : trend === -1
        ? "text-red-500"
        : "text-gray-400";

  const bar = (
    <div className={cn("space-y-1", className)}>
      {showLabel && (
        <div
          className={cn(
            "flex items-center justify-between",
            sizeClasses[size].text
          )}
        >
          <div className="flex items-center gap-1.5">
            <Zap className={cn(sizeClasses[size].icon, textColorClasses[color])} />
            <span className={cn("font-medium", textColorClasses[color])}>
              {label}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">{strength}%</span>
            {trend !== undefined && (
              <TrendIcon className={cn(sizeClasses[size].icon, trendColor)} />
            )}
          </div>
        </div>
      )}
      <div
        className={cn(
          "relative w-full rounded-full bg-muted overflow-hidden",
          sizeClasses[size].bar
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            colorClasses[color]
          )}
          style={{ width: `${strength}%` }}
        />
      </div>
    </div>
  );

  if (!showTooltip || !scores) {
    return bar;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="cursor-default">{bar}</div>
      </TooltipTrigger>
      <TooltipContent className="w-64">
        <div className="space-y-2">
          <div className="text-center border-b pb-2">
            <p className={cn("font-medium", textColorClasses[color])}>
              {label} ({strength}%)
            </p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <div className="space-y-1.5 text-xs">
            {scores.currentStreakScore !== undefined && (
              <ScoreLine
                label="Current Streak"
                score={scores.currentStreakScore}
                weight="25%"
              />
            )}
            {scores.consistencyScore !== undefined && (
              <ScoreLine
                label="30-Day Consistency"
                score={scores.consistencyScore}
                weight="25%"
              />
            )}
            {scores.longevityScore !== undefined && (
              <ScoreLine
                label="Total Completions"
                score={scores.longevityScore}
                weight="20%"
              />
            )}
            {scores.recoveryScore !== undefined && (
              <ScoreLine
                label="Recovery Rate"
                score={scores.recoveryScore}
                weight="15%"
              />
            )}
            {scores.trendScore !== undefined && (
              <ScoreLine
                label="Recent Trend"
                score={scores.trendScore}
                weight="15%"
              />
            )}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function ScoreLine({
  label,
  score,
  weight,
}: {
  label: string;
  score: number;
  weight: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">
        {label} <span className="text-xs opacity-60">({weight})</span>
      </span>
      <span className="font-medium">{score}%</span>
    </div>
  );
}

/**
 * Compact version showing just the strength percentage with color
 */
export function StrengthBadge({
  strength,
  className,
}: {
  strength: number;
  className?: string;
}) {
  const { color } = getStrengthLabel(strength);

  const bgClasses: Record<string, string> = {
    green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    yellow: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    orange: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    gray: "bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        bgClasses[color],
        className
      )}
    >
      <Zap className="h-3 w-3" />
      <span>{strength}%</span>
    </span>
  );
}

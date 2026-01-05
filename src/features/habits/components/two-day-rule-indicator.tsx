"use client";

import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { cn } from "~/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

interface TwoDayRuleIndicatorProps {
  /** Number of consecutive days missed (0 = completed today or yesterday on active day) */
  daysMissed: number;
  /** Whether the habit has an active streak */
  hasStreak: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Whether to show tooltip */
  showTooltip?: boolean;
}

/**
 * Two-Day Rule Indicator
 *
 * Based on James Clear's "Two-Day Rule" from Atomic Habits:
 * "Never miss twice" - missing one day is an accident, missing two is the start of a new habit.
 *
 * Visual states:
 * - Green check: Completed (on track)
 * - Yellow warning: Missed 1 day (warning)
 * - Red X: Missed 2+ days (rule broken)
 */
export function TwoDayRuleIndicator({
  daysMissed,
  hasStreak,
  size = "md",
  showTooltip = true,
}: TwoDayRuleIndicatorProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const getStatus = () => {
    if (daysMissed === 0) {
      return {
        icon: CheckCircle,
        color: "text-green-500",
        bgColor: "bg-green-500/10",
        label: "On track",
        description: hasStreak
          ? "Great job! You're maintaining your streak."
          : "You've completed this habit recently.",
      };
    }
    if (daysMissed === 1) {
      return {
        icon: AlertTriangle,
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/10",
        label: "1 day missed",
        description:
          "Don't miss again! Remember: never miss twice. Complete this habit today to stay on track.",
      };
    }
    return {
      icon: XCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      label: `${daysMissed} days missed`,
      description:
        "Two-day rule broken. Time to restart! Every expert was once a beginner.",
    };
  };

  const status = getStatus();
  const Icon = status.icon;

  const indicator = (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5",
        status.bgColor,
      )}
    >
      <Icon className={cn(sizeClasses[size], status.color)} />
      <span className={cn("text-xs font-medium", status.color)}>
        {status.label}
      </span>
    </div>
  );

  if (!showTooltip) {
    return indicator;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{indicator}</TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="font-medium">{status.label}</p>
        <p className="text-xs text-muted-foreground">{status.description}</p>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Compact version for use in tight spaces like table cells
 */
export function TwoDayRuleIcon({
  daysMissed,
  hasStreak: _hasStreak,
  size = "sm",
}: Omit<TwoDayRuleIndicatorProps, "showTooltip">) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  if (daysMissed === 0) {
    return <CheckCircle className={cn(sizeClasses[size], "text-green-500")} />;
  }
  if (daysMissed === 1) {
    return <AlertTriangle className={cn(sizeClasses[size], "text-yellow-500")} />;
  }
  return <XCircle className={cn(sizeClasses[size], "text-red-500")} />;
}

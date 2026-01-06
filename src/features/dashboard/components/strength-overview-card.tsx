"use client";

import { Zap, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { getStrengthLabel } from "~/lib/strength";

interface StrengthItem {
  habitId: string;
  habitName: string;
  emoji?: string | null;
  strength: number;
}

interface StrengthSummary {
  strongHabits: number;
  buildingHabits: number;
  developingHabits: number;
  fragileHabits: number;
  newHabits: number;
  averageStrength: number;
}

interface StrengthOverviewCardProps {
  strengths: StrengthItem[];
  summary?: StrengthSummary | null;
  isLoading?: boolean;
}

export function StrengthOverviewCard({
  strengths,
  summary,
  isLoading,
}: StrengthOverviewCardProps) {
  if (isLoading) {
    return <StrengthOverviewCardSkeleton />;
  }

  if (strengths.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Zap className="h-4 w-4 text-yellow-500" />
            Habit Strength
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Complete habits regularly to build their strength!
          </p>
        </CardContent>
      </Card>
    );
  }

  const averageStrength =
    strengths.length > 0
      ? Math.round(strengths.reduce((sum, s) => sum + s.strength, 0) / strengths.length)
      : 0;

  const { label: avgLabel, color: avgColor } = getStrengthLabel(averageStrength);

  const colorClasses: Record<string, string> = {
    green: "text-green-600 dark:text-green-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    yellow: "text-yellow-600 dark:text-yellow-400",
    orange: "text-orange-600 dark:text-orange-400",
    gray: "text-gray-500 dark:text-gray-400",
  };

  const bgColorClasses: Record<string, string> = {
    green: "bg-green-500",
    emerald: "bg-emerald-500",
    yellow: "bg-yellow-500",
    orange: "bg-orange-500",
    gray: "bg-gray-400",
  };

  // Get habits that need attention (fragile or new)
  const needsAttention = strengths
    .filter((s) => s.strength < 40)
    .sort((a, b) => a.strength - b.strength);

  // Get strongest habits
  const strongestHabits = strengths
    .filter((s) => s.strength >= 60)
    .sort((a, b) => b.strength - a.strength);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Zap className="h-4 w-4 text-yellow-500" />
          Habit Strength
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Average Strength */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-muted-foreground">Average Strength</span>
            <span className={cn("text-sm font-medium", colorClasses[avgColor])}>
              {avgLabel} ({averageStrength}%)
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500", bgColorClasses[avgColor])}
              style={{ width: `${averageStrength}%` }}
            />
          </div>
        </div>

        {/* Summary counts */}
        {summary && (
          <div className="flex flex-wrap gap-3 mb-4 text-xs">
            {summary.strongHabits > 0 && (
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-muted-foreground">{summary.strongHabits} Strong</span>
              </div>
            )}
            {summary.buildingHabits > 0 && (
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">{summary.buildingHabits} Building</span>
              </div>
            )}
            {summary.developingHabits > 0 && (
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <span className="text-muted-foreground">{summary.developingHabits} Developing</span>
              </div>
            )}
            {(summary.fragileHabits > 0 || summary.newHabits > 0) && (
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-orange-500" />
                <span className="text-muted-foreground">
                  {summary.fragileHabits + summary.newHabits} Need attention
                </span>
              </div>
            )}
          </div>
        )}

        {/* Needs attention section */}
        {needsAttention.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 flex items-center gap-1 text-xs font-medium text-orange-600 dark:text-orange-400">
              <AlertCircle className="h-3 w-3" />
              Needs attention
            </p>
            <div className="space-y-2">
              {needsAttention.slice(0, 3).map((habit) => {
                const { color } = getStrengthLabel(habit.strength);
                return (
                  <StrengthRow
                    key={habit.habitId}
                    name={habit.habitName}
                    emoji={habit.emoji}
                    strength={habit.strength}
                    color={color}
                    highlight
                  />
                );
              })}
              {needsAttention.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{needsAttention.length - 3} more
                </p>
              )}
            </div>
          </div>
        )}

        {/* Strongest habits section */}
        {strongestHabits.length > 0 && needsAttention.length === 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Strongest habits
            </p>
            <div className="space-y-2">
              {strongestHabits.slice(0, 3).map((habit) => {
                const { color } = getStrengthLabel(habit.strength);
                return (
                  <StrengthRow
                    key={habit.habitId}
                    name={habit.habitName}
                    emoji={habit.emoji}
                    strength={habit.strength}
                    color={color}
                  />
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StrengthRow({
  name,
  emoji,
  strength,
  color,
  highlight = false,
}: {
  name: string;
  emoji?: string | null;
  strength: number;
  color: string;
  highlight?: boolean;
}) {
  const bgColorClasses: Record<string, string> = {
    green: "bg-green-500",
    emerald: "bg-emerald-500",
    yellow: "bg-yellow-500",
    orange: "bg-orange-500",
    gray: "bg-gray-400",
  };

  return (
    <div
      className={cn(
        "rounded px-2 py-1.5",
        highlight && "bg-orange-50 dark:bg-orange-950/30"
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm truncate">
          {emoji && <span className="mr-1">{emoji}</span>}
          {name}
        </span>
        <span className="text-xs font-medium">{strength}%</span>
      </div>
      <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full", bgColorClasses[color])}
          style={{ width: `${strength}%` }}
        />
      </div>
    </div>
  );
}

function StrengthOverviewCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="h-4 w-28 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
        </div>
        <div className="flex gap-3 mb-4">
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
        </div>
        <div className="space-y-2">
          <div className="h-10 animate-pulse rounded bg-muted" />
          <div className="h-10 animate-pulse rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import {
  Target,
  Shield,
  Zap,
  CheckCircle2,
  Flame,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { cn } from "~/lib/utils";

interface FocusHabit {
  id: string;
  name: string;
  emoji: string | null;
  currentStreak: number;
  strength: number;
  reason: string;
}

interface DailyFocusCardProps {
  priority: FocusHabit[];
  protect: FocusHabit[];
  momentum: FocusHabit[];
  completed: FocusHabit[];
  message?: {
    message: string;
    type: string;
  } | null;
  isLoading?: boolean;
  onHabitClick?: (habitId: string) => void;
}

export function DailyFocusCard({
  priority,
  protect,
  momentum,
  completed,
  message,
  isLoading,
  onHabitClick,
}: DailyFocusCardProps) {
  if (isLoading) {
    return <DailyFocusCardSkeleton />;
  }

  const totalActive = priority.length + protect.length + momentum.length + completed.length;
  const progress = totalActive > 0 ? Math.round((completed.length / totalActive) * 100) : 100;

  // Check if it's a rest day
  if (totalActive === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Target className="h-4 w-4 text-blue-500" />
            Today&apos;s Focus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {message?.message ?? "No habits scheduled for today. Enjoy your rest day!"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const remaining = totalActive - completed.length;

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Target className="h-4 w-4 text-blue-500" />
            Today&apos;s Focus
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {completed.length}/{totalActive} done
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-1">
          <Progress value={progress} className="h-2" />
          {message && (
            <p className="text-xs text-muted-foreground">{message.message}</p>
          )}
        </div>

        {/* All done message */}
        {remaining === 0 && (
          <div className="rounded-lg bg-green-50 p-4 text-center dark:bg-green-950/30">
            <CheckCircle2 className="mx-auto h-8 w-8 text-green-500" />
            <p className="mt-2 font-medium text-green-700 dark:text-green-400">
              All habits completed!
            </p>
            <p className="text-sm text-green-600 dark:text-green-500">
              You&apos;re building the person you want to become.
            </p>
          </div>
        )}

        {/* Focus sections */}
        {remaining > 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            {/* Priority section */}
            {priority.length > 0 && (
              <FocusSection
                title="Priority"
                subtitle="Do these first"
                icon={<Target className="h-4 w-4" />}
                color="red"
                habits={priority}
                onHabitClick={onHabitClick}
              />
            )}

            {/* Protect section */}
            {protect.length > 0 && (
              <FocusSection
                title="Protect"
                subtitle="Keep your streaks"
                icon={<Shield className="h-4 w-4" />}
                color="amber"
                habits={protect}
                onHabitClick={onHabitClick}
              />
            )}

            {/* Momentum section */}
            {momentum.length > 0 && (
              <FocusSection
                title="Momentum"
                subtitle="Build the habit"
                icon={<Zap className="h-4 w-4" />}
                color="blue"
                habits={momentum}
                onHabitClick={onHabitClick}
              />
            )}
          </div>
        )}

        {/* Completed section */}
        {completed.length > 0 && remaining > 0 && (
          <div className="border-t pt-4">
            <p className="mb-2 flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-3 w-3" />
              Completed today
            </p>
            <div className="flex flex-wrap gap-2">
              {completed.map((habit) => (
                <span
                  key={habit.id}
                  className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs text-green-700 dark:bg-green-950/30 dark:text-green-400"
                >
                  {habit.emoji && <span>{habit.emoji}</span>}
                  {habit.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FocusSection({
  title,
  subtitle,
  icon,
  color,
  habits,
  onHabitClick,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: "red" | "amber" | "blue";
  habits: FocusHabit[];
  onHabitClick?: (habitId: string) => void;
}) {
  const colorClasses = {
    red: {
      bg: "bg-red-50 dark:bg-red-950/30",
      border: "border-red-200 dark:border-red-900",
      title: "text-red-700 dark:text-red-400",
      icon: "text-red-500",
      text: "text-red-900 dark:text-red-100",
      subtext: "text-red-700/70 dark:text-red-300/70",
    },
    amber: {
      bg: "bg-amber-50 dark:bg-amber-950/30",
      border: "border-amber-200 dark:border-amber-900",
      title: "text-amber-700 dark:text-amber-400",
      icon: "text-amber-500",
      text: "text-amber-900 dark:text-amber-100",
      subtext: "text-amber-700/70 dark:text-amber-300/70",
    },
    blue: {
      bg: "bg-blue-50 dark:bg-blue-950/30",
      border: "border-blue-200 dark:border-blue-900",
      title: "text-blue-700 dark:text-blue-400",
      icon: "text-blue-500",
      text: "text-blue-900 dark:text-blue-100",
      subtext: "text-blue-700/70 dark:text-blue-300/70",
    },
  };

  const colors = colorClasses[color];

  return (
    <div className={cn("rounded-lg border p-3", colors.bg, colors.border)}>
      <div className="mb-2 flex items-center gap-1.5">
        <span className={colors.icon}>{icon}</span>
        <div>
          <p className={cn("text-sm font-medium", colors.title)}>{title}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-2">
        {habits.slice(0, 3).map((habit) => (
          <button
            key={habit.id}
            onClick={() => onHabitClick?.(habit.id)}
            className="group flex w-full items-center justify-between rounded px-2 py-1.5 text-left transition-colors hover:bg-white/50 dark:hover:bg-white/5"
          >
            <div className="min-w-0">
              <p className={cn("truncate text-sm font-medium", colors.text)}>
                {habit.emoji && <span className="mr-1">{habit.emoji}</span>}
                {habit.name}
              </p>
              <p className={cn("truncate text-xs", colors.subtext)}>
                {habit.reason}
              </p>
            </div>
            {habit.currentStreak > 0 && (
              <span className="ml-2 flex shrink-0 items-center gap-0.5 text-xs text-orange-500">
                <Flame className="h-3 w-3" />
                {habit.currentStreak}
              </span>
            )}
          </button>
        ))}
        {habits.length > 3 && (
          <p className={cn("text-xs", colors.subtext)}>
            +{habits.length - 3} more
          </p>
        )}
      </div>
    </div>
  );
}

function DailyFocusCardSkeleton() {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="h-4 w-28 animate-pulse rounded bg-muted" />
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
          <div className="h-3 w-48 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-32 animate-pulse rounded-lg bg-muted" />
          <div className="h-32 animate-pulse rounded-lg bg-muted" />
          <div className="h-32 animate-pulse rounded-lg bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}

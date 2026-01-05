"use client";

import { useStats, useStreaks, useAnalytics } from "~/features/habits/hooks";
import { DailyScoreCard } from "./daily-score-card";
import { StreakSummaryCard } from "./streak-summary-card";
import { IdentityVotesCard } from "./identity-votes-card";
import { WeeklyTrendsCard } from "./weekly-trends-card";
import { BestDayCard } from "./best-day-card";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Trophy } from "lucide-react";

export function Dashboard() {
  const { dashboard, isLoadingDashboard, identityVotes, isLoadingIdentityVotes } = useStats();
  const { streaks, atRiskHabits, isLoading: isLoadingStreaks } = useStreaks();
  const { weeklyTrends, completionPatterns, isLoadingWeeklyTrends, isLoadingPatterns } = useAnalytics();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Your habit tracking overview
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Daily Score */}
        <DailyScoreCard
          score={dashboard?.todayScore ?? 0}
          completedCount={dashboard?.completedToday ?? 0}
          totalCount={dashboard?.totalActiveToday ?? 0}
          comparisonYesterday={dashboard?.comparison ?? 0}
          isLoading={isLoadingDashboard}
        />

        {/* Streak Summary */}
        <StreakSummaryCard
          streaks={streaks}
          atRiskHabits={atRiskHabits}
          isLoading={isLoadingStreaks}
        />

        {/* Level Card */}
        <LevelCard
          level={dashboard?.level ?? 1}
          xp={dashboard?.experiencePoints ?? 0}
          isLoading={isLoadingDashboard}
        />
      </div>

      {/* Analytics Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <IdentityVotesCard
          votesByCategory={identityVotes?.byCategory ?? []}
          totalVotes={identityVotes?.totalVotes ?? 0}
          isLoading={isLoadingIdentityVotes}
        />

        <WeeklyTrendsCard
          thisWeekRate={weeklyTrends?.thisWeek.rate ?? 0}
          lastWeekRate={weeklyTrends?.lastWeek.rate ?? 0}
          thisWeekCompletions={weeklyTrends?.thisWeek.completions ?? 0}
          lastWeekCompletions={weeklyTrends?.lastWeek.completions ?? 0}
          isLoading={isLoadingWeeklyTrends}
        />

        <BestDayCard
          byDayOfWeek={completionPatterns?.byDayOfWeek ?? []}
          bestDay={completionPatterns?.bestDay ?? null}
          totalCompletions={completionPatterns?.totalCompletions ?? 0}
          isLoading={isLoadingPatterns}
        />
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <QuickStatCard
          title="Total Habits"
          value={dashboard?.totalHabits ?? 0}
          isLoading={isLoadingDashboard}
        />
        <QuickStatCard
          title="Total Completions"
          value={dashboard?.totalCompletions ?? 0}
          isLoading={isLoadingDashboard}
        />
        <QuickStatCard
          title="Best Overall Streak"
          value={dashboard?.longestOverallStreak ?? 0}
          suffix=" days"
          isLoading={isLoadingDashboard}
        />
      </div>
    </div>
  );
}

function LevelCard({
  level,
  xp,
  isLoading,
}: {
  level: number;
  xp: number;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="h-8 w-12 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-3 w-24 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  // XP needed for next level (simple formula)
  const xpForNextLevel = Math.pow(level, 2) * 50;
  const progress = Math.min((xp / xpForNextLevel) * 100, 100);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Trophy className="h-4 w-4 text-yellow-500" />
          Level
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{level}</p>
        <div className="mt-2">
          <div className="h-1.5 w-full rounded-full bg-muted">
            <div
              className="h-1.5 rounded-full bg-yellow-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {xp} / {xpForNextLevel} XP
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickStatCard({
  title,
  value,
  suffix = "",
  isLoading,
}: {
  title: string;
  value: number;
  suffix?: string;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-8 w-16 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold">
          {value.toLocaleString()}
          {suffix}
        </p>
      </CardContent>
    </Card>
  );
}

"use client";

import { useStats, useStreaks, useAnalytics, useStrength, useFocus } from "~/features/habits/hooks";
import { CreateHabitDialog } from "~/features/habits/components";
import { AchievementsSummaryCard } from "~/features/achievements";
import { WeeklyReviewCard, useWeeklyReview } from "~/features/review";
import { DailyScoreCard } from "./daily-score-card";
import { StreakSummaryCard } from "./streak-summary-card";
import { StrengthOverviewCard } from "./strength-overview-card";
import { DailyFocusCard } from "./daily-focus-card";
import { IdentityVotesCard } from "./identity-votes-card";
import { WeeklyTrendsCard } from "./weekly-trends-card";
import { BestDayCard } from "./best-day-card";
import { Card, CardContent } from "~/components/ui/card";

export function Dashboard() {
  const { dashboard, isLoadingDashboard, identityVotes, isLoadingIdentityVotes } = useStats();
  const { streaks, atRiskHabits, isLoading: isLoadingStreaks } = useStreaks();
  const { weeklyTrends, completionPatterns, isLoadingWeeklyTrends, isLoadingPatterns } = useAnalytics();
  const { strengths, summary, isLoading: isLoadingStrength } = useStrength();
  const { focus, message, isLoading: isLoadingFocus } = useFocus();
  const { lastWeek, isLoadingLastWeek, markViewed } = useWeeklyReview();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Your habit tracking overview
          </p>
        </div>
        <CreateHabitDialog />
      </div>

      {/* Daily Focus - Full width at top */}
      <DailyFocusCard
        priority={focus?.priority ?? []}
        protect={focus?.protect ?? []}
        momentum={focus?.momentum ?? []}
        completed={focus?.completed ?? []}
        message={message}
        isLoading={isLoadingFocus}
      />

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

        {/* Achievements Summary */}
        <AchievementsSummaryCard />

        {/* Habit Strength Overview */}
        <StrengthOverviewCard
          strengths={strengths.map((s) => ({
            habitId: s.habitId,
            habitName: s.habitName,
            emoji: s.emoji,
            strength: s.strength,
          }))}
          summary={summary}
          isLoading={isLoadingStrength}
        />

        {/* Weekly Review */}
        <WeeklyReviewCard
          review={lastWeek ?? null}
          isLoading={isLoadingLastWeek}
          onMarkViewed={markViewed}
          variant="compact"
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

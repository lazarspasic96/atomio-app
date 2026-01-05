"use client";

import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { useAchievements } from "../hooks/use-achievements";
import { AchievementCard } from "./achievement-card";

export function AchievementsSummaryCard() {
  const {
    summary,
    isLoadingSummary,
    getNextUnlockable,
    getCompletionPercent,
  } = useAchievements();

  if (isLoadingSummary) {
    return <AchievementsSummaryCardSkeleton />;
  }

  if (!summary) {
    return null;
  }

  const nextUnlockable = getNextUnlockable();
  const completionPercent = getCompletionPercent();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Trophy className="h-4 w-4 text-amber-500" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Progress overview */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {summary.earned}/{summary.total}
            </span>
          </div>
          <Progress value={completionPercent} className="mt-2 h-2" />
        </div>

        {/* Stats row */}
        <div className="mb-4 flex gap-4">
          <div>
            <p className="text-2xl font-bold">{summary.totalXp}</p>
            <p className="text-xs text-muted-foreground">XP earned</p>
          </div>
          {summary.recent && (
            <div className="flex-1 min-w-0">
              <p className="flex items-center gap-1 text-sm font-medium truncate">
                <span>{summary.recent.emoji}</span>
                {summary.recent.name}
              </p>
              <p className="text-xs text-muted-foreground">Latest unlock</p>
            </div>
          )}
        </div>

        {/* Next achievements */}
        {nextUnlockable.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Almost there
            </p>
            <div className="space-y-2">
              {nextUnlockable.slice(0, 2).map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  name={achievement.name}
                  description={achievement.description}
                  emoji={achievement.emoji}
                  threshold={achievement.threshold}
                  xpReward={achievement.xpReward}
                  isEarned={false}
                  progress={achievement.progress}
                  progressPercent={achievement.progressPercent}
                  variant="compact"
                />
              ))}
            </div>
          </div>
        )}

        {/* All earned */}
        {nextUnlockable.length === 0 && summary.earned === summary.total && (
          <div className="rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 p-3 text-center dark:from-amber-950/30 dark:to-amber-900/20">
            <span className="text-2xl">🏆</span>
            <p className="mt-1 text-sm font-medium">All achievements unlocked!</p>
            <p className="text-xs text-muted-foreground">
              You&apos;re a habit master
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AchievementsSummaryCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="h-4 w-28 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between">
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            <div className="h-4 w-10 animate-pulse rounded bg-muted" />
          </div>
          <div className="mt-2 h-2 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="flex gap-4">
          <div>
            <div className="h-8 w-12 animate-pulse rounded bg-muted" />
            <div className="mt-1 h-3 w-16 animate-pulse rounded bg-muted" />
          </div>
          <div className="flex-1">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="mt-1 h-3 w-16 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

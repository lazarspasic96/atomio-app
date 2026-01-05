"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { AchievementCard } from "./achievement-card";
import { useAchievements } from "../hooks/use-achievements";
import { Flame, CheckCircle2, Calendar, Sparkles } from "lucide-react";

const CATEGORIES = [
  { value: "all", label: "All", icon: null },
  { value: "STREAK", label: "Streaks", icon: Flame },
  { value: "COMPLETIONS", label: "Completions", icon: CheckCircle2 },
  { value: "CONSISTENCY", label: "Consistency", icon: Calendar },
  { value: "SPECIAL", label: "Special", icon: Sparkles },
] as const;

export function AchievementsGrid() {
  const { achievements, isLoading, getEarnedCount, getTotalCount } = useAchievements();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  if (isLoading) {
    return <AchievementsGridSkeleton />;
  }

  const filteredAchievements =
    selectedCategory === "all"
      ? achievements
      : achievements.filter((a) => a.category === selectedCategory);

  const earnedAchievements = filteredAchievements.filter((a) => a.isEarned);
  const lockedAchievements = filteredAchievements.filter((a) => !a.isEarned);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Achievements</h2>
        <p className="text-sm text-muted-foreground">
          {getEarnedCount()} of {getTotalCount()} unlocked
        </p>
      </div>

      {/* Category tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="w-full flex-wrap h-auto gap-1 p-1">
          {CATEGORIES.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className="text-xs gap-1">
              {Icon && <Icon className="h-3 w-3" />}
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIES.map(({ value }) => (
          <TabsContent key={value} value={value} className="mt-4">
            {/* Earned section */}
            {earnedAchievements.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                  Unlocked ({earnedAchievements.length})
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {earnedAchievements.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      name={achievement.name}
                      description={achievement.description}
                      emoji={achievement.emoji}
                      threshold={achievement.threshold}
                      xpReward={achievement.xpReward}
                      isEarned={achievement.isEarned}
                      earnedAt={achievement.earnedAt}
                      progress={achievement.progress}
                      progressPercent={achievement.progressPercent}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Locked section */}
            {lockedAchievements.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                  Locked ({lockedAchievements.length})
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {lockedAchievements.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      name={achievement.name}
                      description={achievement.description}
                      emoji={achievement.emoji}
                      threshold={achievement.threshold}
                      xpReward={achievement.xpReward}
                      isEarned={achievement.isEarned}
                      earnedAt={achievement.earnedAt}
                      progress={achievement.progress}
                      progressPercent={achievement.progressPercent}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {filteredAchievements.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">
                No achievements in this category
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function AchievementsGridSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-6 w-32 animate-pulse rounded bg-muted" />
        <div className="mt-1 h-4 w-24 animate-pulse rounded bg-muted" />
      </div>
      <div className="h-9 w-full animate-pulse rounded-lg bg-muted" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}

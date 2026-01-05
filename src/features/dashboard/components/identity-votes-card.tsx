"use client";

import { Vote, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { HABIT_CATEGORIES } from "~/features/habits/schemas/habit.schema";

interface CategoryVotes {
  category: string;
  votes: number;
  habitCount: number;
}

interface IdentityVotesCardProps {
  /** Votes grouped by category */
  votesByCategory: CategoryVotes[];
  /** Total votes across all habits */
  totalVotes: number;
  /** Whether data is loading */
  isLoading?: boolean;
}

/**
 * Identity Votes Card
 *
 * Based on James Clear's concept from Atomic Habits:
 * "Every action you take is a vote for the type of person you wish to become."
 *
 * Shows how many "votes" (completions) the user has cast toward each identity/category.
 */
export function IdentityVotesCard({
  votesByCategory,
  totalVotes,
  isLoading,
}: IdentityVotesCardProps) {
  if (isLoading) {
    return <IdentityVotesCardSkeleton />;
  }

  // Sort by votes descending
  const sortedCategories = [...votesByCategory].sort((a, b) => b.votes - a.votes);
  const topCategories = sortedCategories.slice(0, 5);

  const getCategoryInfo = (categoryValue: string) => {
    return (
      HABIT_CATEGORIES.find((c) => c.value === categoryValue) ?? {
        value: categoryValue,
        label: categoryValue,
        emoji: "✨",
      }
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Vote className="h-4 w-4 text-purple-500" />
          Identity Votes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {totalVotes === 0 ? (
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground">
              No votes cast yet. Complete habits to vote for your identity!
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              &quot;Every action is a vote for the type of person you wish to become.&quot;
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total votes cast</span>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="font-bold">{totalVotes.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-3">
              {topCategories.map((cat) => {
                const categoryInfo = getCategoryInfo(cat.category);
                const percentage = totalVotes > 0 ? (cat.votes / totalVotes) * 100 : 0;

                return (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5">
                        <span>{categoryInfo.emoji}</span>
                        <span>{categoryInfo.label}</span>
                        <span className="text-muted-foreground">
                          ({cat.habitCount} {cat.habitCount === 1 ? "habit" : "habits"})
                        </span>
                      </span>
                      <span className="font-medium">{cat.votes}</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>

            <p className="pt-2 text-center text-xs text-muted-foreground">
              Each completion is a vote for who you want to become
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function IdentityVotesCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Vote className="h-4 w-4 text-purple-500" />
          Identity Votes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-5 w-12 animate-pulse rounded bg-muted" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="h-4 w-8 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-2 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

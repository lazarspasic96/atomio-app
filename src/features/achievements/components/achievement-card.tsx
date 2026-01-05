"use client";

import { Lock } from "lucide-react";
import { Progress } from "~/components/ui/progress";
import { cn } from "~/lib/utils";

interface AchievementCardProps {
  name: string;
  description: string;
  emoji: string;
  threshold: number;
  xpReward: number;
  isEarned: boolean;
  earnedAt?: Date | null;
  progress: number;
  progressPercent: number;
  variant?: "default" | "compact";
}

export function AchievementCard({
  name,
  description,
  emoji,
  threshold,
  xpReward,
  isEarned,
  earnedAt,
  progress,
  progressPercent,
  variant = "default",
}: AchievementCardProps) {
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border p-3 transition-colors",
          isEarned
            ? "border-primary/20 bg-primary/5"
            : "border-muted bg-muted/30 opacity-60"
        )}
      >
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full text-xl",
            isEarned ? "bg-primary/10" : "bg-muted"
          )}
        >
          {isEarned ? emoji : <Lock className="h-4 w-4 text-muted-foreground" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-medium truncate", !isEarned && "text-muted-foreground")}>
            {name}
          </p>
          {!isEarned && (
            <div className="mt-1">
              <Progress value={progressPercent} className="h-1" />
              <p className="mt-0.5 text-xs text-muted-foreground">
                {progress}/{threshold}
              </p>
            </div>
          )}
          {isEarned && earnedAt && (
            <p className="text-xs text-muted-foreground">
              Earned {new Date(earnedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative rounded-xl border p-4 transition-all",
        isEarned
          ? "border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 shadow-sm"
          : "border-muted bg-muted/20"
      )}
    >
      {/* Locked overlay */}
      {!isEarned && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/50 backdrop-blur-[1px]">
          <Lock className="h-6 w-6 text-muted-foreground/50" />
        </div>
      )}

      {/* Content */}
      <div className={cn(!isEarned && "opacity-50")}>
        {/* Emoji */}
        <div className="mb-3 text-center">
          <span className="text-4xl">{emoji}</span>
        </div>

        {/* Name */}
        <h3 className="mb-1 text-center text-sm font-semibold">{name}</h3>

        {/* Description */}
        <p className="mb-3 text-center text-xs text-muted-foreground line-clamp-2">
          {description}
        </p>

        {/* Progress or earned date */}
        {isEarned ? (
          <div className="text-center">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              +{xpReward} XP
            </span>
            {earnedAt && (
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(earnedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        ) : (
          <div>
            <Progress value={progressPercent} className="h-1.5" />
            <p className="mt-1 text-center text-xs text-muted-foreground">
              {progress} / {threshold}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

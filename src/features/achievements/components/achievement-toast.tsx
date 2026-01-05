"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useAchievementCelebration } from "../hooks/use-achievements";

export function AchievementToast() {
  const { nextToShow, hasUncelebrated, dismiss } = useAchievementCelebration();

  useEffect(() => {
    if (hasUncelebrated && nextToShow) {
      toast.success(
        <div className="flex items-center gap-3">
          <span className="text-2xl">{nextToShow.emoji}</span>
          <div>
            <p className="font-medium">{nextToShow.name}</p>
            <p className="text-xs text-muted-foreground">
              +{nextToShow.xpReward} XP
            </p>
          </div>
        </div>,
        {
          description: nextToShow.description,
          duration: 5000,
          onDismiss: () => dismiss(nextToShow.id),
          onAutoClose: () => dismiss(nextToShow.id),
        }
      );
    }
  }, [nextToShow, hasUncelebrated, dismiss]);

  return null;
}

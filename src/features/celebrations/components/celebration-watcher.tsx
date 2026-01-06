"use client";

import { useEffect, useState } from "react";
import { CelebrationModal } from "./celebration-modal";
import { useCelebrations } from "../hooks/use-celebrations";

interface Celebration {
  id: string;
  type: string;
  title: string;
  message: string;
  value: number;
}

export function CelebrationWatcher({
  children,
}: {
  children: React.ReactNode;
}) {
  const { uncelebrated, markViewed, refetch } = useCelebrations();
  const [currentCelebration, setCurrentCelebration] =
    useState<Celebration | null>(null);
  const [queue, setQueue] = useState<Celebration[]>([]);

  // Update queue when uncelebrated changes
  useEffect(() => {
    if (uncelebrated.length > 0 && queue.length === 0 && !currentCelebration) {
      setQueue(uncelebrated);
    }
  }, [uncelebrated, queue.length, currentCelebration]);

  // Show next celebration from queue
  useEffect(() => {
    if (queue.length > 0 && !currentCelebration) {
      const next = queue[0];
      if (next) {
        setCurrentCelebration(next);
        setQueue((prev) => prev.slice(1));
      }
    }
  }, [queue, currentCelebration]);

  const handleClose = () => {
    if (currentCelebration) {
      markViewed(currentCelebration.id);
      setCurrentCelebration(null);
      // Small delay before showing next celebration
      setTimeout(() => {
        refetch();
      }, 500);
    }
  };

  return (
    <>
      {children}
      <CelebrationModal
        celebration={currentCelebration}
        onClose={handleClose}
      />
    </>
  );
}

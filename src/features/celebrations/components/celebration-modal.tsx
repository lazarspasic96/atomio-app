"use client";

import { useEffect, useState, useCallback } from "react";
import { PartyPopper } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";

interface Celebration {
  id: string;
  type: string;
  title: string;
  message: string;
  value: number;
}

interface CelebrationModalProps {
  celebration: Celebration | null;
  onClose: () => void;
}

export function CelebrationModal({
  celebration,
  onClose,
}: CelebrationModalProps) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Generate confetti on mount
  useEffect(() => {
    if (celebration) {
      setIsVisible(true);
      setConfetti(generateConfetti(50));
    }
  }, [celebration]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  }, [onClose]);

  if (!celebration) return null;

  return (
    <Dialog open={isVisible} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="overflow-hidden sm:max-w-md">
        {/* Confetti layer */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {confetti.map((piece) => (
            <ConfettiPieceElement key={piece.id} piece={piece} />
          ))}
        </div>

        <DialogHeader className="relative z-10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg">
            <PartyPopper className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-center text-2xl font-bold">
            {celebration.title}
          </DialogTitle>
        </DialogHeader>

        <div className="relative z-10 space-y-4 text-center">
          <p className="text-muted-foreground">{celebration.message}</p>

          {/* Milestone badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-2 dark:from-amber-900/30 dark:to-orange-900/30">
              <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {celebration.value}
              </span>
              <span className="text-sm text-orange-700 dark:text-orange-300">
                {celebration.type.includes("streak") ? "days" : "milestone"}
              </span>
            </div>
          </div>

          <Button onClick={handleClose} className="w-full">
            Keep Going!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Confetti types and generation
interface ConfettiPiece {
  id: number;
  x: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  rotation: number;
}

const CONFETTI_COLORS = [
  "#f59e0b", // amber
  "#ef4444", // red
  "#22c55e", // green
  "#3b82f6", // blue
  "#a855f7", // purple
  "#ec4899", // pink
  "#14b8a6", // teal
];

function generateConfetti(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]!,
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360,
  }));
}

function ConfettiPieceElement({ piece }: { piece: ConfettiPiece }) {
  return (
    <div
      className="absolute animate-confetti-fall"
      style={{
        left: `${piece.x}%`,
        animationDelay: `${piece.delay}s`,
        animationDuration: `${piece.duration}s`,
      }}
    >
      <div
        className="rounded-sm"
        style={{
          width: piece.size,
          height: piece.size * 0.6,
          backgroundColor: piece.color,
          transform: `rotate(${piece.rotation}deg)`,
        }}
      />
    </div>
  );
}

/**
 * Provider component that shows celebrations automatically
 */
export function CelebrationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

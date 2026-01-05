import type {
  Habit,
  HabitCompletion,
  HabitStreak,
  User,
  UserStats,
  HabitCategory,
} from "../../generated/prisma";

// Re-export Prisma types
export type { Habit, HabitCompletion, HabitStreak, User, UserStats, HabitCategory };

// Habit with completions (common query result)
export type HabitWithCompletions = Habit & {
  completions: HabitCompletion[];
  streakData?: HabitStreak | null;
};

// Form state union type
export type FormStatus = "idle" | "submitting" | "success" | "error";

// Dialog state
export interface DialogState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

// Week view types
export interface WeekRange {
  start: Date;
  end: Date;
  dates: Date[];
}

// Completion map for quick lookup
export type CompletionMap = Map<string, Set<string>>; // habitId -> Set of date strings

import { isActiveDay } from "./date-utils";

/**
 * Check if a completion exists for a specific date
 */
export function hasCompletionOnDate(
  completions: Array<{ date: Date | string }>,
  date: Date
): boolean {
  return completions.some((c) => {
    const completionDate = new Date(c.date);
    return (
      completionDate.getFullYear() === date.getFullYear() &&
      completionDate.getMonth() === date.getMonth() &&
      completionDate.getDate() === date.getDate()
    );
  });
}

/**
 * Get the start of day (midnight) for a date in local timezone
 */
export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Subtract days from a date
 */
export function subDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d;
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Calculate the current streak for a habit
 * A streak counts consecutive active days where the habit was completed
 * Non-active days don't break the streak
 */
export function calculateCurrentStreak(
  completions: Array<{ date: Date | string }>,
  activeDays: number[]
): number {
  if (completions.length === 0 || activeDays.length === 0) {
    return 0;
  }

  let streak = 0;
  let checkDate = startOfDay(new Date());

  // If today is an active day and not yet completed, check if we should start from yesterday
  if (isActiveDay(activeDays, checkDate)) {
    if (!hasCompletionOnDate(completions, checkDate)) {
      // Today is not complete - but if it's early in the day, streak might still be alive
      // For simplicity, we'll check from yesterday (user can still complete today)
      // The streak is considered at risk but not broken until end of day
      checkDate = subDays(checkDate, 1);
    }
  } else {
    // Today is not an active day, start checking from yesterday
    checkDate = subDays(checkDate, 1);
  }

  // Go back in time, counting streak
  const maxDaysToCheck = 400; // Safety limit (a bit over a year)
  let daysChecked = 0;

  while (daysChecked < maxDaysToCheck) {
    if (isActiveDay(activeDays, checkDate)) {
      if (hasCompletionOnDate(completions, checkDate)) {
        streak++;
      } else {
        // Active day without completion - streak broken
        break;
      }
    }
    // Non-active days are skipped (don't break or count)

    checkDate = subDays(checkDate, 1);
    daysChecked++;
  }

  return streak;
}

/**
 * Calculate the longest streak from completion history
 */
export function calculateLongestStreak(
  completions: Array<{ date: Date | string }>,
  activeDays: number[],
  habitCreatedAt: Date
): number {
  if (completions.length === 0 || activeDays.length === 0) {
    return 0;
  }

  // Sort completions by date ascending
  const sortedCompletions = [...completions].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA.getTime() - dateB.getTime();
  });

  // Build a set of completion dates for fast lookup
  const completionSet = new Set(
    sortedCompletions.map((c) => {
      const d = new Date(c.date);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );

  const hasCompletion = (date: Date): boolean => {
    return completionSet.has(
      `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    );
  };

  let longestStreak = 0;
  let currentStreak = 0;

  // Iterate from habit creation date to today
  const startDate = startOfDay(habitCreatedAt);
  const endDate = startOfDay(new Date());
  let checkDate = new Date(startDate);

  while (checkDate <= endDate) {
    if (isActiveDay(activeDays, checkDate)) {
      if (hasCompletion(checkDate)) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    // Non-active days don't affect streak

    checkDate = addDays(checkDate, 1);
  }

  return longestStreak;
}

/**
 * Find the date when the current streak started
 */
export function findStreakStartDate(
  completions: Array<{ date: Date | string }>,
  activeDays: number[]
): Date | null {
  if (completions.length === 0 || activeDays.length === 0) {
    return null;
  }

  let checkDate = startOfDay(new Date());
  let streakStartDate: Date | null = null;

  // Handle today
  if (isActiveDay(activeDays, checkDate)) {
    if (!hasCompletionOnDate(completions, checkDate)) {
      checkDate = subDays(checkDate, 1);
    }
  } else {
    checkDate = subDays(checkDate, 1);
  }

  const maxDaysToCheck = 400;
  let daysChecked = 0;

  while (daysChecked < maxDaysToCheck) {
    if (isActiveDay(activeDays, checkDate)) {
      if (hasCompletionOnDate(completions, checkDate)) {
        streakStartDate = new Date(checkDate);
      } else {
        break;
      }
    }

    checkDate = subDays(checkDate, 1);
    daysChecked++;
  }

  return streakStartDate;
}

/**
 * Check if a habit is at risk (active today but not completed)
 */
export function isStreakAtRisk(
  completions: Array<{ date: Date | string }>,
  activeDays: number[],
  currentStreak: number
): boolean {
  if (currentStreak === 0) {
    return false; // No streak to risk
  }

  const today = startOfDay(new Date());

  if (!isActiveDay(activeDays, today)) {
    return false; // Not an active day
  }

  return !hasCompletionOnDate(completions, today);
}

/**
 * Calculate days until habit should be checked again
 * Returns 0 if today is an active day
 */
export function daysUntilNextActive(activeDays: number[]): number {
  if (activeDays.length === 0) {
    return -1;
  }

  const today = new Date();
  const todayDay = today.getDay();

  if (activeDays.includes(todayDay)) {
    return 0;
  }

  for (let i = 1; i <= 7; i++) {
    const nextDay = (todayDay + i) % 7;
    if (activeDays.includes(nextDay)) {
      return i;
    }
  }

  return -1;
}

/**
 * Calculate streak milestone reached
 */
export function getStreakMilestone(streak: number): number | null {
  const milestones = [7, 21, 30, 66, 100, 365];

  for (let i = milestones.length - 1; i >= 0; i--) {
    if (streak >= milestones[i]!) {
      return milestones[i]!;
    }
  }

  return null;
}

/**
 * Check if streak just hit a milestone
 */
export function isNewMilestone(currentStreak: number, previousStreak: number): number | null {
  const milestones = [7, 21, 30, 66, 100, 365];

  for (const milestone of milestones) {
    if (currentStreak >= milestone && previousStreak < milestone) {
      return milestone;
    }
  }

  return null;
}

/**
 * Habit Strength Calculation Service
 *
 * Calculates how "automatic" each habit has become based on:
 * - Current streak (25%)
 * - 30-day consistency (25%)
 * - Total completions/longevity (20%)
 * - Recovery rate (15%)
 * - Recent trend (15%)
 */

export interface HabitStrengthFactors {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  consistencyLast30Days: number; // 0-100
  recoveryRate: number; // 0-100 (percentage of times recovered within 1 day)
  habitAgeDays: number;
  recentTrend: number; // -1 = declining, 0 = stable, 1 = improving
}

export interface StrengthScores {
  strength: number;
  currentStreakScore: number;
  consistencyScore: number;
  longevityScore: number;
  recoveryScore: number;
  trendScore: number;
}

export interface StrengthLabel {
  label: "Strong" | "Building" | "Developing" | "Fragile" | "New";
  color: string;
  description: string;
}

// Weight configuration for strength calculation
const WEIGHTS = {
  currentStreakScore: 0.25, // 25% - Active streak matters most
  consistencyScore: 0.25, // 25% - 30-day consistency
  longevityScore: 0.2, // 20% - Total completions over time
  recoveryScore: 0.15, // 15% - Bouncing back ability
  trendScore: 0.15, // 15% - Recent trajectory
};

/**
 * Calculate the overall strength score and individual factor scores
 */
export function calculateHabitStrength(
  factors: HabitStrengthFactors
): StrengthScores {
  // Current streak score (logarithmic - diminishing returns after 30 days)
  // log(31) ≈ 3.43, so at 30 days we hit 100%
  const currentStreakScore = Math.min(
    100,
    (Math.log(factors.currentStreak + 1) / Math.log(31)) * 100
  );

  // Consistency score (direct percentage from last 30 days)
  const consistencyScore = factors.consistencyLast30Days;

  // Longevity score (based on total completions, logarithmic)
  // log(101) ≈ 4.62, so at 100 completions we hit 100%
  const longevityScore = Math.min(
    100,
    (Math.log(factors.totalCompletions + 1) / Math.log(101)) * 100
  );

  // Recovery score (percentage of times user recovered within 1 day)
  const recoveryScore = factors.recoveryRate;

  // Trend score (converts -1 to 1 range to 0-100)
  // -1 = declining (0), 0 = stable (50), 1 = improving (100)
  const trendScore = ((factors.recentTrend + 1) / 2) * 100;

  // Calculate weighted sum
  const strength = Math.round(
    currentStreakScore * WEIGHTS.currentStreakScore +
      consistencyScore * WEIGHTS.consistencyScore +
      longevityScore * WEIGHTS.longevityScore +
      recoveryScore * WEIGHTS.recoveryScore +
      trendScore * WEIGHTS.trendScore
  );

  return {
    strength,
    currentStreakScore: Math.round(currentStreakScore),
    consistencyScore: Math.round(consistencyScore),
    longevityScore: Math.round(longevityScore),
    recoveryScore: Math.round(recoveryScore),
    trendScore: Math.round(trendScore),
  };
}

/**
 * Get the strength label based on the score
 */
export function getStrengthLabel(strength: number): StrengthLabel {
  if (strength >= 80) {
    return {
      label: "Strong",
      color: "green",
      description: "This habit is nearly automatic",
    };
  }
  if (strength >= 60) {
    return {
      label: "Building",
      color: "emerald",
      description: "Good progress - keep going",
    };
  }
  if (strength >= 40) {
    return {
      label: "Developing",
      color: "yellow",
      description: "Needs more consistency",
    };
  }
  if (strength >= 20) {
    return {
      label: "Fragile",
      color: "orange",
      description: "At risk - prioritize this habit",
    };
  }
  return {
    label: "New",
    color: "gray",
    description: "Just getting started",
  };
}

/**
 * Calculate consistency rate for the last N days
 * Returns a percentage (0-100)
 */
export function calculateConsistencyRate(
  completions: Array<{ date: Date }>,
  activeDays: number[],
  days = 30
): number {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);

  let activeDaysCount = 0;
  let completedDaysCount = 0;

  // Create a set of completed dates for fast lookup
  const completedDates = new Set(
    completions.map((c) => {
      const d = new Date(c.date);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );

  // Check each day in the range
  for (let i = 0; i < days; i++) {
    const checkDate = new Date(now);
    checkDate.setDate(checkDate.getDate() - i);

    // Check if this is an active day for the habit
    if (activeDays.includes(checkDate.getDay())) {
      activeDaysCount++;
      const dateKey = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
      if (completedDates.has(dateKey)) {
        completedDaysCount++;
      }
    }
  }

  if (activeDaysCount === 0) return 0;
  return Math.round((completedDaysCount / activeDaysCount) * 100);
}

/**
 * Calculate recovery rate
 * Returns percentage of times user completed the habit within 1 day of missing
 */
export function calculateRecoveryRate(
  completions: Array<{ date: Date }>,
  activeDays: number[],
  habitCreatedAt: Date
): { recoveryRate: number; missedCount: number; recoveryCount: number } {
  if (completions.length === 0) {
    return { recoveryRate: 0, missedCount: 0, recoveryCount: 0 };
  }

  // Sort completions by date
  const sortedCompletions = [...completions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const completedDates = new Set(
    sortedCompletions.map((c) => {
      const d = new Date(c.date);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );

  let missedCount = 0;
  let recoveryCount = 0;

  const startDate = new Date(habitCreatedAt);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Iterate through each day since habit creation
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);

  while (current < now) {
    const dayOfWeek = current.getDay();

    if (activeDays.includes(dayOfWeek)) {
      const dateKey = `${current.getFullYear()}-${current.getMonth()}-${current.getDate()}`;

      if (!completedDates.has(dateKey)) {
        // This is a missed day
        missedCount++;

        // Check if they recovered (completed next active day)
        const nextActiveDay = findNextActiveDay(
          new Date(current),
          activeDays,
          now
        );
        if (nextActiveDay) {
          const nextKey = `${nextActiveDay.getFullYear()}-${nextActiveDay.getMonth()}-${nextActiveDay.getDate()}`;
          if (completedDates.has(nextKey)) {
            recoveryCount++;
          }
        }
      }
    }

    current.setDate(current.getDate() + 1);
  }

  if (missedCount === 0) return { recoveryRate: 100, missedCount: 0, recoveryCount: 0 };
  return {
    recoveryRate: Math.round((recoveryCount / missedCount) * 100),
    missedCount,
    recoveryCount,
  };
}

/**
 * Find the next active day after a given date
 */
function findNextActiveDay(
  fromDate: Date,
  activeDays: number[],
  maxDate: Date
): Date | null {
  const next = new Date(fromDate);
  next.setDate(next.getDate() + 1);

  while (next <= maxDate) {
    if (activeDays.includes(next.getDay())) {
      return next;
    }
    next.setDate(next.getDate() + 1);
  }

  return null;
}

/**
 * Calculate trend based on comparing recent weeks
 * Returns: -1 (declining), 0 (stable), 1 (improving)
 */
export function calculateTrend(
  completions: Array<{ date: Date }>,
  activeDays: number[]
): number {
  const now = new Date();

  // Calculate last week's rate (days 0-6)
  const lastWeekRate = calculateConsistencyRate(completions, activeDays, 7);

  // Calculate previous week's rate (days 7-13)
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 7);

  // Filter completions for previous week
  const previousWeekCompletions = completions.filter((c) => {
    const d = new Date(c.date);
    const threeWeeksAgo = new Date(now);
    threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 14);
    return d >= threeWeeksAgo && d < twoWeeksAgo;
  });

  const prevWeekRate = calculateConsistencyRateForCompletions(
    previousWeekCompletions,
    activeDays,
    new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
    new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  );

  const difference = lastWeekRate - prevWeekRate;

  if (difference >= 15) return 1; // Improving (15%+ increase)
  if (difference <= -15) return -1; // Declining (15%+ decrease)
  return 0; // Stable
}

/**
 * Calculate consistency rate for a specific date range
 */
function calculateConsistencyRateForCompletions(
  completions: Array<{ date: Date }>,
  activeDays: number[],
  startDate: Date,
  endDate: Date
): number {
  const completedDates = new Set(
    completions.map((c) => {
      const d = new Date(c.date);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );

  let activeDaysCount = 0;
  let completedDaysCount = 0;

  const current = new Date(startDate);
  while (current < endDate) {
    if (activeDays.includes(current.getDay())) {
      activeDaysCount++;
      const dateKey = `${current.getFullYear()}-${current.getMonth()}-${current.getDate()}`;
      if (completedDates.has(dateKey)) {
        completedDaysCount++;
      }
    }
    current.setDate(current.getDate() + 1);
  }

  if (activeDaysCount === 0) return 0;
  return Math.round((completedDaysCount / activeDaysCount) * 100);
}

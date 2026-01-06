import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import type { db as DbClient } from "~/server/db";

// Get Monday of the given week
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
}

// Get Sunday of the given week
function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export const reviewRouter = createTRPCRouter({
  /**
   * Get the current week's review (or generate if needed)
   */
  getCurrentWeek: protectedProcedure.query(async ({ ctx }) => {
    const today = new Date();
    const weekStart = getWeekStart(today);

    // Check if we already have a review for this week
    const existingReview = await ctx.db.weeklyReview.findUnique({
      where: {
        userId_weekStartDate: {
          userId: ctx.dbUser.id,
          weekStartDate: weekStart,
        },
      },
    });

    if (existingReview) {
      return existingReview;
    }

    // Generate a new review if it's at least mid-week (Wednesday) or later
    const dayOfWeek = today.getDay();
    const isWeekEnd = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
    const isMidWeek = dayOfWeek >= 3; // Wednesday or later

    if (!isMidWeek && !isWeekEnd) {
      return null; // Too early in the week
    }

    return generateWeeklyReview(ctx.db, ctx.dbUser.id, weekStart);
  }),

  /**
   * Get the last week's review
   */
  getLastWeek: protectedProcedure.query(async ({ ctx }) => {
    const today = new Date();
    const lastWeekDate = new Date(today);
    lastWeekDate.setDate(lastWeekDate.getDate() - 7);
    const weekStart = getWeekStart(lastWeekDate);

    // Check if we already have a review for last week, or generate one
    const review = await ctx.db.weeklyReview.findUnique({
      where: {
        userId_weekStartDate: {
          userId: ctx.dbUser.id,
          weekStartDate: weekStart,
        },
      },
    }) ?? await generateWeeklyReview(ctx.db, ctx.dbUser.id, weekStart);

    return review;
  }),

  /**
   * Get review by specific week start date
   */
  getByWeek: protectedProcedure
    .input(z.object({ weekStartDate: z.date() }))
    .query(async ({ ctx, input }) => {
      const weekStart = getWeekStart(input.weekStartDate);

      return ctx.db.weeklyReview.findUnique({
        where: {
          userId_weekStartDate: {
            userId: ctx.dbUser.id,
            weekStartDate: weekStart,
          },
        },
      });
    }),

  /**
   * Get recent reviews
   */
  getRecent: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(12).default(4) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.weeklyReview.findMany({
        where: { userId: ctx.dbUser.id },
        orderBy: { weekStartDate: "desc" },
        take: input.limit,
      });
    }),

  /**
   * Mark a review as viewed
   */
  markViewed: protectedProcedure
    .input(z.object({ reviewId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.weeklyReview.update({
        where: {
          id: input.reviewId,
          userId: ctx.dbUser.id,
        },
        data: {
          viewedAt: new Date(),
        },
      });

      return { success: true };
    }),

  /**
   * Force regenerate the current week's review
   */
  regenerate: protectedProcedure.mutation(async ({ ctx }) => {
    const today = new Date();
    const weekStart = getWeekStart(today);

    // Delete existing review if any
    await ctx.db.weeklyReview.deleteMany({
      where: {
        userId: ctx.dbUser.id,
        weekStartDate: weekStart,
      },
    });

    // Generate fresh review
    return generateWeeklyReview(ctx.db, ctx.dbUser.id, weekStart);
  }),
});

/**
 * Generate a weekly review for the given week
 */
async function generateWeeklyReview(
  db: typeof DbClient,
  userId: string,
  weekStart: Date
) {
  const weekEnd = getWeekEnd(weekStart);

  // Get all habits with completions for the week
  const habits = await db.habit.findMany({
    where: { userId },
    include: {
      completions: {
        where: {
          date: {
            gte: weekStart,
            lte: weekEnd,
          },
        },
      },
      streakData: true,
      strengthData: true,
    },
  });

  // Calculate week metrics
  let totalPossible = 0;
  let totalCompleted = 0;
  const habitPerformance: Array<{
    habitId: string;
    habitName: string;
    emoji: string | null;
    completed: number;
    possible: number;
    rate: number;
    streak: number;
  }> = [];

  let bestHabit: { id: string; rate: number } | null = null;
  let worstHabit: { id: string; rate: number } | null = null;
  let longestStreakHabit: { id: string; streak: number } | null = null;

  for (const habit of habits) {
    // Count active days in the week for this habit
    let possibleDays = 0;
    const current = new Date(weekStart);
    while (current <= weekEnd) {
      if (habit.activeDays.includes(current.getDay())) {
        possibleDays++;
      }
      current.setDate(current.getDate() + 1);
    }

    const completedDays = habit.completions.length;
    const rate = possibleDays > 0 ? (completedDays / possibleDays) * 100 : 0;

    totalPossible += possibleDays;
    totalCompleted += completedDays;

    habitPerformance.push({
      habitId: habit.id,
      habitName: habit.name,
      emoji: habit.emoji,
      completed: completedDays,
      possible: possibleDays,
      rate: Math.round(rate),
      streak: habit.streakData?.currentStreak ?? 0,
    });

    // Track best/worst
    if (possibleDays > 0) {
      if (!bestHabit || rate > bestHabit.rate) {
        bestHabit = { id: habit.id, rate };
      }
      if (!worstHabit || rate < worstHabit.rate) {
        worstHabit = { id: habit.id, rate };
      }
    }

    // Track longest streak
    const streak = habit.streakData?.currentStreak ?? 0;
    if (!longestStreakHabit || streak > longestStreakHabit.streak) {
      longestStreakHabit = { id: habit.id, streak };
    }
  }

  const completionRate =
    totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

  // Get previous week's rate for comparison
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);

  const prevReview = await db.weeklyReview.findUnique({
    where: {
      userId_weekStartDate: {
        userId,
        weekStartDate: prevWeekStart,
      },
    },
  });

  const previousWeekRate = prevReview?.completionRate ?? null;
  const changeFromPrevious =
    previousWeekRate !== null ? completionRate - previousWeekRate : null;

  // Generate wins
  const wins: string[] = [];
  if (completionRate >= 80) {
    wins.push("Excellent week! You hit most of your habits.");
  }
  if (changeFromPrevious !== null && changeFromPrevious > 10) {
    wins.push(`You improved ${Math.abs(Math.round(changeFromPrevious))}% from last week!`);
  }

  const perfectHabits = habitPerformance.filter((h) => h.rate === 100);
  if (perfectHabits.length > 0) {
    wins.push(
      `Perfect week for ${perfectHabits.map((h) => h.habitName).join(", ")}!`
    );
  }

  const longStreaks = habitPerformance.filter((h) => h.streak >= 7);
  if (longStreaks.length > 0) {
    wins.push(
      `Strong streaks: ${longStreaks.map((h) => `${h.habitName} (${h.streak} days)`).join(", ")}`
    );
  }

  // Generate needs attention items
  const needsAttention: string[] = [];
  const strugglingHabits = habitPerformance.filter(
    (h) => h.rate < 50 && h.possible > 0
  );
  if (strugglingHabits.length > 0) {
    needsAttention.push(
      `${strugglingHabits.map((h) => h.habitName).join(", ")} need more focus`
    );
  }

  if (changeFromPrevious !== null && changeFromPrevious < -10) {
    needsAttention.push(
      `Completion rate dropped ${Math.abs(Math.round(changeFromPrevious))}% from last week`
    );
  }

  // Generate focus suggestion
  let focusSuggestion: string | null = null;
  if (strugglingHabits.length > 0) {
    const weakest = strugglingHabits[0];
    if (weakest) {
      focusSuggestion = `Focus on ${weakest.habitName} this week. Try to complete it at least ${Math.ceil(weakest.possible / 2)} times.`;
    }
  } else if (completionRate < 60) {
    focusSuggestion =
      "Try starting your day with your first habit. Morning momentum carries through!";
  } else if (completionRate < 80) {
    focusSuggestion =
      "You're close to a great week! Stack your habits together for better consistency.";
  } else {
    focusSuggestion =
      "Keep up the great work! Consider adding a new habit or increasing frequency.";
  }

  // Find any new streak milestones this week
  const newMilestones = habitPerformance
    .filter((h) => [7, 14, 21, 30, 50, 66, 100].some((m) => h.streak === m))
    .map((h) => ({
      habitName: h.habitName,
      milestone: h.streak,
    }));

  // Create the review
  const review = await db.weeklyReview.create({
    data: {
      userId,
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      completionRate,
      totalCompleted,
      totalPossible,
      previousWeekRate,
      changeFromPrevious,
      bestHabitId: bestHabit?.id ?? null,
      worstHabitId: worstHabit?.id ?? null,
      longestStreakHabitId: longestStreakHabit?.id ?? null,
      newStreakMilestones: newMilestones.length > 0 ? newMilestones : undefined,
      wins,
      needsAttention,
      focusSuggestion,
      habitPerformance,
    },
  });

  return review;
}

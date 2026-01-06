import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  calculateHabitStrength,
  calculateConsistencyRate,
  calculateRecoveryRate,
  calculateTrend,
  getStrengthLabel,
  type HabitStrengthFactors,
} from "~/lib/strength";
import type { db as DbClient } from "~/server/db";

export const strengthRouter = createTRPCRouter({
  /**
   * Get strength data for a specific habit
   */
  getByHabitId: protectedProcedure
    .input(z.object({ habitId: z.string() }))
    .query(async ({ ctx, input }) => {
      const habit = await ctx.db.habit.findFirst({
        where: {
          id: input.habitId,
          userId: ctx.dbUser.id,
        },
        include: {
          completions: true,
          streakData: true,
          strengthData: true,
        },
      });

      if (!habit) {
        return null;
      }

      // If strength data exists and is recent (updated within last hour), return it
      if (
        habit.strengthData &&
        habit.strengthData.updatedAt > new Date(Date.now() - 60 * 60 * 1000)
      ) {
        const label = getStrengthLabel(habit.strengthData.strength);
        return {
          habitId: habit.id,
          habitName: habit.name,
          strength: habit.strengthData.strength,
          label: label.label,
          color: label.color,
          description: label.description,
          factors: {
            currentStreakScore: habit.strengthData.currentStreakScore,
            consistencyScore: habit.strengthData.consistencyScore,
            longevityScore: habit.strengthData.longevityScore,
            recoveryScore: habit.strengthData.recoveryScore,
            trendScore: habit.strengthData.trendScore,
          },
          currentStreak: habit.streakData?.currentStreak ?? 0,
          longestStreak: habit.streakData?.longestStreak ?? 0,
        };
      }

      // Calculate fresh strength data
      const strengthData = await calculateAndStoreStrength(
        ctx.db,
        habit.id,
        habit.completions,
        habit.activeDays,
        habit.createdAt,
        habit.streakData?.currentStreak ?? 0,
        habit.streakData?.longestStreak ?? 0,
        habit.streakData?.totalCompletions ?? 0
      );

      const label = getStrengthLabel(strengthData.strength);

      return {
        habitId: habit.id,
        habitName: habit.name,
        strength: strengthData.strength,
        label: label.label,
        color: label.color,
        description: label.description,
        factors: {
          currentStreakScore: strengthData.currentStreakScore,
          consistencyScore: strengthData.consistencyScore,
          longevityScore: strengthData.longevityScore,
          recoveryScore: strengthData.recoveryScore,
          trendScore: strengthData.trendScore,
        },
        currentStreak: habit.streakData?.currentStreak ?? 0,
        longestStreak: habit.streakData?.longestStreak ?? 0,
      };
    }),

  /**
   * Get all habit strengths for the user, sorted by strength
   */
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const habits = await ctx.db.habit.findMany({
      where: { userId: ctx.dbUser.id },
      include: {
        completions: true,
        streakData: true,
        strengthData: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const results = await Promise.all(
      habits.map(async (habit) => {
        // Check if we need to recalculate
        const needsRecalculation =
          !habit.strengthData ||
          habit.strengthData.updatedAt < new Date(Date.now() - 60 * 60 * 1000);

        let strengthData = habit.strengthData;

        if (needsRecalculation) {
          strengthData = await calculateAndStoreStrength(
            ctx.db,
            habit.id,
            habit.completions,
            habit.activeDays,
            habit.createdAt,
            habit.streakData?.currentStreak ?? 0,
            habit.streakData?.longestStreak ?? 0,
            habit.streakData?.totalCompletions ?? 0
          );
        }

        const label = getStrengthLabel(strengthData?.strength ?? 0);

        return {
          habitId: habit.id,
          habitName: habit.name,
          emoji: habit.emoji,
          strength: strengthData?.strength ?? 0,
          label: label.label,
          color: label.color,
          description: label.description,
          currentStreak: habit.streakData?.currentStreak ?? 0,
          longestStreak: habit.streakData?.longestStreak ?? 0,
        };
      })
    );

    // Sort by strength descending
    return results.sort((a, b) => b.strength - a.strength);
  }),

  /**
   * Force recalculate strength for a habit
   */
  recalculate: protectedProcedure
    .input(z.object({ habitId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const habit = await ctx.db.habit.findFirst({
        where: {
          id: input.habitId,
          userId: ctx.dbUser.id,
        },
        include: {
          completions: true,
          streakData: true,
        },
      });

      if (!habit) {
        return null;
      }

      const strengthData = await calculateAndStoreStrength(
        ctx.db,
        habit.id,
        habit.completions,
        habit.activeDays,
        habit.createdAt,
        habit.streakData?.currentStreak ?? 0,
        habit.streakData?.longestStreak ?? 0,
        habit.streakData?.totalCompletions ?? 0
      );

      const label = getStrengthLabel(strengthData.strength);

      return {
        habitId: habit.id,
        strength: strengthData.strength,
        label: label.label,
        color: label.color,
        description: label.description,
      };
    }),

  /**
   * Recalculate all habit strengths for the user
   */
  recalculateAll: protectedProcedure.mutation(async ({ ctx }) => {
    const habits = await ctx.db.habit.findMany({
      where: { userId: ctx.dbUser.id },
      include: {
        completions: true,
        streakData: true,
      },
    });

    await Promise.all(
      habits.map((habit) =>
        calculateAndStoreStrength(
          ctx.db,
          habit.id,
          habit.completions,
          habit.activeDays,
          habit.createdAt,
          habit.streakData?.currentStreak ?? 0,
          habit.streakData?.longestStreak ?? 0,
          habit.streakData?.totalCompletions ?? 0
        )
      )
    );

    return { success: true };
  }),

  /**
   * Get summary of all habit strengths
   */
  getSummary: protectedProcedure.query(async ({ ctx }) => {
    const habits = await ctx.db.habit.findMany({
      where: { userId: ctx.dbUser.id },
      include: {
        strengthData: true,
        streakData: true,
      },
    });

    if (habits.length === 0) {
      return {
        totalHabits: 0,
        strongHabits: 0,
        buildingHabits: 0,
        developingHabits: 0,
        fragileHabits: 0,
        newHabits: 0,
        averageStrength: 0,
        weakestHabit: null,
      };
    }

    const strengths = habits.map((h) => h.strengthData?.strength ?? 0);
    const averageStrength = Math.round(
      strengths.reduce((a, b) => a + b, 0) / strengths.length
    );

    const categorized = {
      strong: habits.filter((h) => (h.strengthData?.strength ?? 0) >= 80),
      building: habits.filter(
        (h) =>
          (h.strengthData?.strength ?? 0) >= 60 &&
          (h.strengthData?.strength ?? 0) < 80
      ),
      developing: habits.filter(
        (h) =>
          (h.strengthData?.strength ?? 0) >= 40 &&
          (h.strengthData?.strength ?? 0) < 60
      ),
      fragile: habits.filter(
        (h) =>
          (h.strengthData?.strength ?? 0) >= 20 &&
          (h.strengthData?.strength ?? 0) < 40
      ),
      new: habits.filter((h) => (h.strengthData?.strength ?? 0) < 20),
    };

    // Find weakest habit that's not new (so we can give actionable advice)
    const weakestNonNew = habits
      .filter((h) => (h.strengthData?.strength ?? 0) >= 20)
      .sort((a, b) => (a.strengthData?.strength ?? 0) - (b.strengthData?.strength ?? 0))[0];

    return {
      totalHabits: habits.length,
      strongHabits: categorized.strong.length,
      buildingHabits: categorized.building.length,
      developingHabits: categorized.developing.length,
      fragileHabits: categorized.fragile.length,
      newHabits: categorized.new.length,
      averageStrength,
      weakestHabit: weakestNonNew
        ? {
            id: weakestNonNew.id,
            name: weakestNonNew.name,
            emoji: weakestNonNew.emoji,
            strength: weakestNonNew.strengthData?.strength ?? 0,
          }
        : null,
    };
  }),
});

/**
 * Helper function to calculate and store strength data
 */
async function calculateAndStoreStrength(
  db: typeof DbClient,
  habitId: string,
  completions: Array<{ date: Date }>,
  activeDays: number[],
  createdAt: Date,
  currentStreak: number,
  longestStreak: number,
  totalCompletions: number
) {
  // Calculate all factors
  const consistencyLast30Days = calculateConsistencyRate(
    completions,
    activeDays,
    30
  );

  const { recoveryRate, missedCount, recoveryCount } = calculateRecoveryRate(
    completions,
    activeDays,
    createdAt
  );

  const trend = calculateTrend(completions, activeDays);

  const habitAgeDays = Math.floor(
    (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  const factors: HabitStrengthFactors = {
    currentStreak,
    longestStreak,
    totalCompletions,
    consistencyLast30Days,
    recoveryRate,
    habitAgeDays,
    recentTrend: trend,
  };

  const scores = calculateHabitStrength(factors);

  // Upsert strength data
  const strengthData = await db.habitStrength.upsert({
    where: { habitId },
    create: {
      habitId,
      strength: scores.strength,
      currentStreakScore: scores.currentStreakScore,
      consistencyScore: scores.consistencyScore,
      longevityScore: scores.longevityScore,
      recoveryScore: scores.recoveryScore,
      trendScore: scores.trendScore,
      missedDaysCount: missedCount,
      recoveryCount: recoveryCount,
      last30DaysRate: consistencyLast30Days,
    },
    update: {
      strength: scores.strength,
      currentStreakScore: scores.currentStreakScore,
      consistencyScore: scores.consistencyScore,
      longevityScore: scores.longevityScore,
      recoveryScore: scores.recoveryScore,
      trendScore: scores.trendScore,
      missedDaysCount: missedCount,
      recoveryCount: recoveryCount,
      last30DaysRate: consistencyLast30Days,
    },
  });

  return strengthData;
}

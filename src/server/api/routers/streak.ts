import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  calculateCurrentStreak,
  calculateLongestStreak,
  findStreakStartDate,
  isStreakAtRisk,
} from "~/features/habits/utils/streak-utils";

export const streakRouter = createTRPCRouter({
  /**
   * Get all streaks for the current user
   */
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const habits = await ctx.db.habit.findMany({
      where: { userId: ctx.dbUser.id },
      include: {
        streakData: true,
        completions: {
          orderBy: { date: "desc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return habits.map((habit) => ({
      habitId: habit.id,
      habitName: habit.name,
      emoji: habit.emoji,
      category: habit.category,
      currentStreak: habit.streakData?.currentStreak ?? 0,
      longestStreak: habit.streakData?.longestStreak ?? 0,
      totalCompletions: habit.streakData?.totalCompletions ?? habit.completions.length,
      lastCompletedAt: habit.streakData?.lastCompletedAt,
      streakStartedAt: habit.streakData?.streakStartedAt,
      isAtRisk: isStreakAtRisk(
        habit.completions,
        habit.activeDays,
        habit.streakData?.currentStreak ?? 0
      ),
      consecutiveMisses: habit.streakData?.consecutiveMisses ?? 0,
    }));
  }),

  /**
   * Get streak data for a specific habit
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
          streakData: true,
          completions: {
            orderBy: { date: "desc" },
          },
        },
      });

      if (!habit) {
        return null;
      }

      return {
        habitId: habit.id,
        habitName: habit.name,
        currentStreak: habit.streakData?.currentStreak ?? 0,
        longestStreak: habit.streakData?.longestStreak ?? 0,
        totalCompletions: habit.streakData?.totalCompletions ?? habit.completions.length,
        lastCompletedAt: habit.streakData?.lastCompletedAt,
        streakStartedAt: habit.streakData?.streakStartedAt,
        isAtRisk: isStreakAtRisk(
          habit.completions,
          habit.activeDays,
          habit.streakData?.currentStreak ?? 0
        ),
        consecutiveMisses: habit.streakData?.consecutiveMisses ?? 0,
      };
    }),

  /**
   * Recalculate streak for a habit (useful after data corrections)
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
          completions: {
            orderBy: { date: "desc" },
          },
        },
      });

      if (!habit) {
        throw new Error("Habit not found");
      }

      const currentStreak = calculateCurrentStreak(habit.completions, habit.activeDays);
      const longestStreak = calculateLongestStreak(
        habit.completions,
        habit.activeDays,
        habit.createdAt
      );
      const streakStartDate = findStreakStartDate(habit.completions, habit.activeDays);
      const lastCompletion = habit.completions[0];

      const streakData = await ctx.db.habitStreak.upsert({
        where: { habitId: habit.id },
        create: {
          habitId: habit.id,
          currentStreak,
          longestStreak,
          totalCompletions: habit.completions.length,
          lastCompletedAt: lastCompletion?.date,
          streakStartedAt: streakStartDate,
          lastCalculatedAt: new Date(),
        },
        update: {
          currentStreak,
          longestStreak,
          totalCompletions: habit.completions.length,
          lastCompletedAt: lastCompletion?.date,
          streakStartedAt: streakStartDate,
          lastCalculatedAt: new Date(),
        },
      });

      return streakData;
    }),

  /**
   * Recalculate all streaks for the current user
   */
  recalculateAll: protectedProcedure.mutation(async ({ ctx }) => {
    const habits = await ctx.db.habit.findMany({
      where: { userId: ctx.dbUser.id },
      include: {
        completions: {
          orderBy: { date: "desc" },
        },
      },
    });

    const results = await Promise.all(
      habits.map(async (habit) => {
        const currentStreak = calculateCurrentStreak(habit.completions, habit.activeDays);
        const longestStreak = calculateLongestStreak(
          habit.completions,
          habit.activeDays,
          habit.createdAt
        );
        const streakStartDate = findStreakStartDate(habit.completions, habit.activeDays);
        const lastCompletion = habit.completions[0];

        return ctx.db.habitStreak.upsert({
          where: { habitId: habit.id },
          create: {
            habitId: habit.id,
            currentStreak,
            longestStreak,
            totalCompletions: habit.completions.length,
            lastCompletedAt: lastCompletion?.date,
            streakStartedAt: streakStartDate,
            lastCalculatedAt: new Date(),
          },
          update: {
            currentStreak,
            longestStreak,
            totalCompletions: habit.completions.length,
            lastCompletedAt: lastCompletion?.date,
            streakStartedAt: streakStartDate,
            lastCalculatedAt: new Date(),
          },
        });
      })
    );

    return { updated: results.length };
  }),

  /**
   * Get habits at risk (not completed today, have active streak)
   */
  getAtRisk: protectedProcedure.query(async ({ ctx }) => {
    const habits = await ctx.db.habit.findMany({
      where: { userId: ctx.dbUser.id },
      include: {
        streakData: true,
        completions: {
          orderBy: { date: "desc" },
          take: 30, // Only need recent completions for this check
        },
      },
    });

    const atRiskHabits = habits.filter((habit) => {
      const currentStreak = habit.streakData?.currentStreak ?? 0;
      if (currentStreak === 0) return false;

      return isStreakAtRisk(habit.completions, habit.activeDays, currentStreak);
    });

    return atRiskHabits.map((habit) => ({
      habitId: habit.id,
      habitName: habit.name,
      emoji: habit.emoji,
      currentStreak: habit.streakData?.currentStreak ?? 0,
    }));
  }),
});

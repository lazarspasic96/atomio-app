import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { isStreakAtRisk } from "~/features/habits/utils/streak-utils";

export const statsRouter = createTRPCRouter({
  /**
   * Get or create user stats
   */
  getUserStats: protectedProcedure.query(async ({ ctx }) => {
    const stats = await ctx.db.userStats.upsert({
      where: { userId: ctx.dbUser.id },
      create: { userId: ctx.dbUser.id },
      update: {},
      include: {
        weeklyStats: {
          orderBy: { weekStartDate: "desc" },
          take: 12,
        },
      },
    });

    return stats;
  }),

  /**
   * Get dashboard summary data
   */
  getDashboard: protectedProcedure.query(async ({ ctx }) => {
    // Get user stats
    const userStats = await ctx.db.userStats.upsert({
      where: { userId: ctx.dbUser.id },
      create: { userId: ctx.dbUser.id },
      update: {},
    });

    // Get today's date normalized
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Get all habits with today's completions
    const habits = await ctx.db.habit.findMany({
      where: { userId: ctx.dbUser.id },
      include: {
        streakData: true,
        completions: {
          where: {
            date: {
              gte: yesterday,
              lte: today,
            },
          },
        },
      },
    });

    // Calculate today's stats
    const todayDayOfWeek = today.getDay();
    const activeHabitsToday = habits.filter((h) =>
      h.activeDays.includes(todayDayOfWeek)
    );

    const completedToday = activeHabitsToday.filter((h) =>
      h.completions.some((c) => {
        const cDate = new Date(c.date);
        return (
          cDate.getFullYear() === today.getFullYear() &&
          cDate.getMonth() === today.getMonth() &&
          cDate.getDate() === today.getDate()
        );
      })
    );

    const todayScore =
      activeHabitsToday.length > 0
        ? Math.round((completedToday.length / activeHabitsToday.length) * 100)
        : 100;

    // Calculate yesterday's score for comparison
    const yesterdayDayOfWeek = yesterday.getDay();
    const activeHabitsYesterday = habits.filter((h) =>
      h.activeDays.includes(yesterdayDayOfWeek)
    );

    const completedYesterday = activeHabitsYesterday.filter((h) =>
      h.completions.some((c) => {
        const cDate = new Date(c.date);
        return (
          cDate.getFullYear() === yesterday.getFullYear() &&
          cDate.getMonth() === yesterday.getMonth() &&
          cDate.getDate() === yesterday.getDate()
        );
      })
    );

    const yesterdayScore =
      activeHabitsYesterday.length > 0
        ? Math.round(
            (completedYesterday.length / activeHabitsYesterday.length) * 100
          )
        : 100;

    // Get streaks at risk
    const streaksAtRisk = habits
      .filter((habit) => {
        const currentStreak = habit.streakData?.currentStreak ?? 0;
        if (currentStreak === 0) return false;
        return isStreakAtRisk(
          habit.completions,
          habit.activeDays,
          currentStreak
        );
      })
      .map((h) => ({
        habitId: h.id,
        habitName: h.name,
        emoji: h.emoji,
        currentStreak: h.streakData?.currentStreak ?? 0,
      }));

    // Get top streaks
    const topStreaks = habits
      .filter((h) => (h.streakData?.currentStreak ?? 0) > 0)
      .sort(
        (a, b) =>
          (b.streakData?.currentStreak ?? 0) - (a.streakData?.currentStreak ?? 0)
      )
      .slice(0, 5)
      .map((h) => ({
        habitId: h.id,
        habitName: h.name,
        emoji: h.emoji,
        currentStreak: h.streakData?.currentStreak ?? 0,
        longestStreak: h.streakData?.longestStreak ?? 0,
      }));

    return {
      todayScore,
      yesterdayScore,
      comparison: todayScore - yesterdayScore,
      completedToday: completedToday.length,
      totalActiveToday: activeHabitsToday.length,
      totalHabits: habits.length,
      totalCompletions: userStats.totalCompletions,
      identityVotes: userStats.identityVotes,
      level: userStats.level,
      experiencePoints: userStats.experiencePoints,
      currentOverallStreak: userStats.currentOverallStreak,
      longestOverallStreak: userStats.longestOverallStreak,
      streaksAtRisk,
      topStreaks,
    };
  }),

  /**
   * Update user stats after a completion toggle
   */
  updateAfterCompletion: protectedProcedure
    .input(
      z.object({
        completed: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const stats = await ctx.db.userStats.upsert({
        where: { userId: ctx.dbUser.id },
        create: {
          userId: ctx.dbUser.id,
          totalCompletions: input.completed ? 1 : 0,
          identityVotes: input.completed ? 1 : 0,
        },
        update: {
          totalCompletions: {
            [input.completed ? "increment" : "decrement"]: 1,
          },
          identityVotes: {
            [input.completed ? "increment" : "decrement"]: 1,
          },
          lastActiveAt: new Date(),
        },
      });

      return stats;
    }),

  /**
   * Get identity votes summary by category
   */
  getIdentityVotes: protectedProcedure.query(async ({ ctx }) => {
    const habits = await ctx.db.habit.findMany({
      where: { userId: ctx.dbUser.id },
      include: {
        streakData: true,
      },
    });

    // Group by category
    const votesByCategory = habits.reduce(
      (acc, habit) => {
        const category = habit.category ?? "OTHER";
        acc[category] ??= {
          category,
          votes: 0,
          habitCount: 0,
        };
        acc[category].votes += habit.streakData?.totalCompletions ?? 0;
        acc[category].habitCount += 1;
        return acc;
      },
      {} as Record<string, { category: string; votes: number; habitCount: number }>
    );

    const totalVotes = Object.values(votesByCategory).reduce(
      (sum, cat) => sum + cat.votes,
      0
    );

    return {
      totalVotes,
      byCategory: Object.values(votesByCategory).sort((a, b) => b.votes - a.votes),
    };
  }),
});

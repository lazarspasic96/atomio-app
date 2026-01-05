import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  startOfWeek,
  endOfWeek,
  subWeeks,
  eachDayOfInterval,
  format,
  startOfDay,
  endOfDay,
} from "date-fns";
import { isActiveDay } from "~/features/habits/utils/date-utils";

export const analyticsRouter = createTRPCRouter({
  /**
   * Get weekly trends - compare this week to last week
   */
  getWeeklyTrends: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();

    // This week range (Monday to Sunday)
    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });

    // Last week range
    const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
    const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

    // Get all habits
    const habits = await ctx.db.habit.findMany({
      where: { userId: ctx.dbUser.id },
    });

    if (habits.length === 0) {
      return {
        thisWeek: { rate: 0, completions: 0, possible: 0 },
        lastWeek: { rate: 0, completions: 0, possible: 0 },
      };
    }

    // Get completions for both weeks
    const [thisWeekCompletions, lastWeekCompletions] = await Promise.all([
      ctx.db.habitCompletion.findMany({
        where: {
          habitId: { in: habits.map((h) => h.id) },
          date: {
            gte: startOfDay(thisWeekStart),
            lte: endOfDay(thisWeekEnd),
          },
        },
      }),
      ctx.db.habitCompletion.findMany({
        where: {
          habitId: { in: habits.map((h) => h.id) },
          date: {
            gte: startOfDay(lastWeekStart),
            lte: endOfDay(lastWeekEnd),
          },
        },
      }),
    ]);

    // Calculate possible completions for each week
    const calculatePossible = (weekStart: Date, weekEnd: Date) => {
      const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
      return habits.reduce((total, habit) => {
        return (
          total +
          days.filter((day) => {
            // Only count days the habit was active and after the habit was created
            return (
              isActiveDay(habit.activeDays, day) &&
              day >= new Date(habit.createdAt)
            );
          }).length
        );
      }, 0);
    };

    // Only count days up to today for this week
    const thisWeekDaysToCount = eachDayOfInterval({
      start: thisWeekStart,
      end: now > thisWeekEnd ? thisWeekEnd : now,
    });

    const thisWeekPossible = habits.reduce((total, habit) => {
      return (
        total +
        thisWeekDaysToCount.filter((day) => {
          return (
            isActiveDay(habit.activeDays, day) &&
            day >= new Date(habit.createdAt)
          );
        }).length
      );
    }, 0);

    const lastWeekPossible = calculatePossible(lastWeekStart, lastWeekEnd);

    const thisWeekRate =
      thisWeekPossible > 0
        ? (thisWeekCompletions.length / thisWeekPossible) * 100
        : 0;

    const lastWeekRate =
      lastWeekPossible > 0
        ? (lastWeekCompletions.length / lastWeekPossible) * 100
        : 0;

    return {
      thisWeek: {
        rate: thisWeekRate,
        completions: thisWeekCompletions.length,
        possible: thisWeekPossible,
      },
      lastWeek: {
        rate: lastWeekRate,
        completions: lastWeekCompletions.length,
        possible: lastWeekPossible,
      },
    };
  }),

  /**
   * Get completion patterns by day of week and time
   */
  getCompletionPatterns: protectedProcedure.query(async ({ ctx }) => {
    // Get all completions for the last 30 days
    const thirtyDaysAgo = subWeeks(new Date(), 4);

    const completions = await ctx.db.habitCompletion.findMany({
      where: {
        habit: { userId: ctx.dbUser.id },
        date: { gte: thirtyDaysAgo },
      },
    });

    // Group by day of week
    const byDayOfWeek: Record<number, number> = {};
    for (let i = 0; i < 7; i++) {
      byDayOfWeek[i] = 0;
    }

    completions.forEach((c) => {
      const dayOfWeek = c.date.getDay();
      byDayOfWeek[dayOfWeek] = (byDayOfWeek[dayOfWeek] ?? 0) + 1;
    });

    // Find best and worst days
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const sortedDays = Object.entries(byDayOfWeek)
      .map(([day, count]) => ({ day: parseInt(day), count }))
      .sort((a, b) => b.count - a.count);

    return {
      byDayOfWeek: sortedDays.map((d) => ({
        day: d.day,
        dayName: dayNames[d.day] ?? "Unknown",
        count: d.count,
      })),
      bestDay: sortedDays[0]
        ? { day: dayNames[sortedDays[0].day] ?? "Unknown", count: sortedDays[0].count }
        : null,
      totalCompletions: completions.length,
    };
  }),

  /**
   * Get daily completion data for charts (last N weeks)
   */
  getDailyData: protectedProcedure
    .input(
      z.object({
        weeks: z.number().min(1).max(12).default(4),
      }),
    )
    .query(async ({ ctx, input }) => {
      const endDate = new Date();
      const startDate = subWeeks(endDate, input.weeks);

      const habits = await ctx.db.habit.findMany({
        where: { userId: ctx.dbUser.id },
      });

      const completions = await ctx.db.habitCompletion.findMany({
        where: {
          habitId: { in: habits.map((h) => h.id) },
          date: { gte: startDate, lte: endDate },
        },
      });

      // Group completions by date
      const completionsByDate = new Map<string, number>();
      completions.forEach((c) => {
        const dateKey = format(c.date, "yyyy-MM-dd");
        completionsByDate.set(dateKey, (completionsByDate.get(dateKey) ?? 0) + 1);
      });

      // Build daily data array
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      const dailyData = days.map((day) => {
        const dateKey = format(day, "yyyy-MM-dd");
        const possibleForDay = habits.filter(
          (h) =>
            isActiveDay(h.activeDays, day) && day >= new Date(h.createdAt),
        ).length;

        const completedForDay = completionsByDate.get(dateKey) ?? 0;

        return {
          date: dateKey,
          completed: completedForDay,
          possible: possibleForDay,
          rate: possibleForDay > 0 ? (completedForDay / possibleForDay) * 100 : 0,
        };
      });

      return dailyData;
    }),
});

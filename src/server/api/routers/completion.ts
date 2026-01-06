import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  calculateCurrentStreak,
  calculateLongestStreak,
  findStreakStartDate,
  isNewMilestone,
} from "~/features/habits/utils/streak-utils";
import {
  calculateHabitStrength,
  calculateConsistencyRate,
  calculateRecoveryRate,
  calculateTrend,
  type HabitStrengthFactors,
} from "~/lib/strength";

export const completionRouter = createTRPCRouter({
  toggle: protectedProcedure
    .input(
      z.object({
        habitId: z.string(),
        date: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the habit belongs to the user
      const habit = await ctx.db.habit.findFirst({
        where: {
          id: input.habitId,
          userId: ctx.dbUser.id,
        },
        include: {
          streakData: true,
        },
      });

      if (!habit) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Habit not found",
        });
      }

      // Date is already normalized to UTC midnight by the client
      // Use UTC methods to ensure consistency
      const normalizedDate = new Date(
        Date.UTC(
          input.date.getUTCFullYear(),
          input.date.getUTCMonth(),
          input.date.getUTCDate(),
          0,
          0,
          0,
          0,
        ),
      );

      // Check if completion exists
      const existingCompletion = await ctx.db.habitCompletion.findUnique({
        where: {
          habitId_date: {
            habitId: input.habitId,
            date: normalizedDate,
          },
        },
      });

      let completed: boolean;

      if (existingCompletion) {
        // Delete the completion (uncomplete)
        await ctx.db.habitCompletion.delete({
          where: {
            id: existingCompletion.id,
          },
        });
        completed = false;
      } else {
        // Create the completion - use try/catch to handle race conditions
        try {
          await ctx.db.habitCompletion.create({
            data: {
              habitId: input.habitId,
              date: normalizedDate,
              completed: true,
            },
          });
          completed = true;
        } catch (error) {
          // If unique constraint fails, it means another request just created it
          // In that case, delete it (treat as toggle to uncomplete)
          const justCreated = await ctx.db.habitCompletion.findUnique({
            where: {
              habitId_date: {
                habitId: input.habitId,
                date: normalizedDate,
              },
            },
          });
          if (justCreated) {
            await ctx.db.habitCompletion.delete({
              where: { id: justCreated.id },
            });
            completed = false;
          } else {
            throw error; // Re-throw if it's a different error
          }
        }
      }

      // Update streak data
      const completions = await ctx.db.habitCompletion.findMany({
        where: { habitId: input.habitId },
        orderBy: { date: "desc" },
      });

      const previousStreak = habit.streakData?.currentStreak ?? 0;
      const currentStreak = calculateCurrentStreak(
        completions,
        habit.activeDays,
      );
      const longestStreak = Math.max(
        calculateLongestStreak(completions, habit.activeDays, habit.createdAt),
        habit.streakData?.longestStreak ?? 0,
      );
      const streakStartDate = findStreakStartDate(
        completions,
        habit.activeDays,
      );
      const lastCompletion = completions[0];

      await ctx.db.habitStreak.upsert({
        where: { habitId: input.habitId },
        create: {
          habitId: input.habitId,
          currentStreak,
          longestStreak,
          totalCompletions: completions.length,
          lastCompletedAt: lastCompletion?.date,
          streakStartedAt: streakStartDate,
          consecutiveMisses: completed
            ? 0
            : (habit.streakData?.consecutiveMisses ?? 0),
          lastCalculatedAt: new Date(),
        },
        update: {
          currentStreak,
          longestStreak,
          totalCompletions: completions.length,
          lastCompletedAt: lastCompletion?.date,
          streakStartedAt: streakStartDate,
          consecutiveMisses: completed
            ? 0
            : (habit.streakData?.consecutiveMisses ?? 0),
          lastCalculatedAt: new Date(),
        },
      });

      // Update user stats
      await ctx.db.userStats.upsert({
        where: { userId: ctx.dbUser.id },
        create: {
          userId: ctx.dbUser.id,
          totalCompletions: completed ? 1 : 0,
          identityVotes: completed ? 1 : 0,
        },
        update: {
          totalCompletions: {
            [completed ? "increment" : "decrement"]: 1,
          },
          identityVotes: {
            [completed ? "increment" : "decrement"]: 1,
          },
          lastActiveAt: new Date(),
        },
      });

      // Check for new milestone
      const milestone = completed
        ? isNewMilestone(currentStreak, previousStreak)
        : null;

      // Check and award achievements (only on completion, not uncomplete)
      let newAchievements: Array<{
        id: string;
        key: string;
        name: string;
        emoji: string;
        xpReward: number;
      }> = [];

      if (completed) {
        // Get user's total completions count
        const userStats = await ctx.db.userStats.findUnique({
          where: { userId: ctx.dbUser.id },
        });
        const totalCompletions = userStats?.totalCompletions ?? 0;

        // Get habit count for special achievements
        const habitCount = await ctx.db.habit.count({
          where: { userId: ctx.dbUser.id },
        });

        // Get consecutive misses before this completion (for comeback achievements)
        const consecutiveMisses = habit.streakData?.consecutiveMisses ?? 0;

        // Get user's highest strength across all habits (for strength achievements)
        const allStrengths = await ctx.db.habitStrength.findMany({
          where: {
            habit: { userId: ctx.dbUser.id },
          },
          select: { strength: true },
        });
        const maxStrength = allStrengths.length > 0
          ? Math.max(...allStrengths.map((s) => s.strength))
          : 0;

        // Find achievements the user hasn't earned yet that they now qualify for
        const eligibleAchievements = await ctx.db.achievement.findMany({
          where: {
            OR: [
              // Streak achievements
              { category: "STREAK", threshold: { lte: currentStreak } },
              // Completion count achievements
              { category: "COMPLETIONS", threshold: { lte: totalCompletions } },
              // Special achievements
              { key: "first_completion", threshold: { lte: totalCompletions } },
              { key: "first_habit", threshold: { lte: habitCount } },
              { key: "habits_3", threshold: { lte: habitCount } },
              { key: "habits_5", threshold: { lte: habitCount } },
              // Strength achievements (match keys that start with strength_)
              { key: "strength_50", threshold: { lte: maxStrength } },
              { key: "strength_80", threshold: { lte: maxStrength } },
              { key: "strength_90", threshold: { lte: maxStrength } },
              { key: "strength_100", threshold: { lte: maxStrength } },
              // Comeback achievements (match keys that start with comeback_)
              { key: "comeback_3", threshold: { lte: consecutiveMisses } },
              { key: "comeback_7", threshold: { lte: consecutiveMisses } },
              { key: "comeback_14", threshold: { lte: consecutiveMisses } },
              { key: "comeback_30", threshold: { lte: consecutiveMisses } },
            ],
            NOT: {
              userAchievements: {
                some: { userId: ctx.dbUser.id },
              },
            },
          },
        });

        // Award new achievements
        if (eligibleAchievements.length > 0) {
          await ctx.db.userAchievement.createMany({
            data: eligibleAchievements.map((a) => ({
              userId: ctx.dbUser.id,
              achievementId: a.id,
            })),
            skipDuplicates: true,
          });

          // Add XP from achievements to user stats
          const totalXp = eligibleAchievements.reduce(
            (sum, a) => sum + a.xpReward,
            0,
          );
          await ctx.db.userStats.update({
            where: { userId: ctx.dbUser.id },
            data: {
              experiencePoints: { increment: totalXp },
            },
          });

          newAchievements = eligibleAchievements.map((a) => ({
            id: a.id,
            key: a.key,
            name: a.name,
            emoji: a.emoji,
            xpReward: a.xpReward,
          }));
        }
      }

      // Update habit strength (Phase 2)
      const consistencyLast30Days = calculateConsistencyRate(
        completions,
        habit.activeDays,
        30
      );

      const { recoveryRate, missedCount, recoveryCount } = calculateRecoveryRate(
        completions,
        habit.activeDays,
        habit.createdAt
      );

      const trend = calculateTrend(completions, habit.activeDays);

      const habitAgeDays = Math.floor(
        (Date.now() - habit.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      const strengthFactors: HabitStrengthFactors = {
        currentStreak,
        longestStreak,
        totalCompletions: completions.length,
        consistencyLast30Days,
        recoveryRate,
        habitAgeDays,
        recentTrend: trend,
      };

      const strengthScores = calculateHabitStrength(strengthFactors);

      await ctx.db.habitStrength.upsert({
        where: { habitId: input.habitId },
        create: {
          habitId: input.habitId,
          strength: strengthScores.strength,
          currentStreakScore: strengthScores.currentStreakScore,
          consistencyScore: strengthScores.consistencyScore,
          longevityScore: strengthScores.longevityScore,
          recoveryScore: strengthScores.recoveryScore,
          trendScore: strengthScores.trendScore,
          missedDaysCount: missedCount,
          recoveryCount: recoveryCount,
          last30DaysRate: consistencyLast30Days,
        },
        update: {
          strength: strengthScores.strength,
          currentStreakScore: strengthScores.currentStreakScore,
          consistencyScore: strengthScores.consistencyScore,
          longevityScore: strengthScores.longevityScore,
          recoveryScore: strengthScores.recoveryScore,
          trendScore: strengthScores.trendScore,
          missedDaysCount: missedCount,
          recoveryCount: recoveryCount,
          last30DaysRate: consistencyLast30Days,
        },
      });

      // Create celebration for milestone streaks
      let newCelebration: { id: string; type: string; title: string; message: string; value: number } | null = null;

      if (completed && milestone) {
        // Milestone thresholds that trigger celebrations
        const celebrationMilestones = [7, 14, 21, 30, 50, 66, 100, 150, 200, 365];

        if (celebrationMilestones.includes(currentStreak)) {
          const celebrationMessages: Record<number, { title: string; message: string }> = {
            7: { title: "One Week Strong!", message: `You've completed ${habit.name} for 7 days straight. You're building a real habit!` },
            14: { title: "Two Weeks!", message: `14 days of consistency with ${habit.name}. You're proving this is who you are now.` },
            21: { title: "Three Weeks!", message: `21 days! ${habit.name} is becoming automatic. Keep going!` },
            30: { title: "One Month!", message: `30 days of ${habit.name}! You've shown incredible dedication.` },
            50: { title: "50 Days!", message: `Half a hundred! ${habit.name} is truly part of who you are now.` },
            66: { title: "66 Days - Habit Formed!", message: `Research says it takes 66 days to form a habit. ${habit.name} is now automatic!` },
            100: { title: "100 Days!", message: `Triple digits! Your commitment to ${habit.name} is extraordinary.` },
            150: { title: "150 Days!", message: `150 days of ${habit.name}! You're in the top 1% of habit builders.` },
            200: { title: "200 Days!", message: `200 days! ${habit.name} has become part of your identity.` },
            365: { title: "One Year!", message: `365 days of ${habit.name}! You've transformed your life.` },
          };

          const content = celebrationMessages[currentStreak] ?? {
            title: "Milestone Reached!",
            message: `You've hit a ${currentStreak}-day milestone with ${habit.name}. Keep building!`,
          };

          const celebration = await ctx.db.celebration.create({
            data: {
              userId: ctx.dbUser.id,
              type: `streak_${currentStreak}`,
              habitId: habit.id,
              value: currentStreak,
              title: content.title,
              message: content.message,
            },
          });

          newCelebration = {
            id: celebration.id,
            type: celebration.type,
            title: celebration.title,
            message: celebration.message,
            value: celebration.value,
          };
        }
      }

      return {
        completed,
        currentStreak,
        longestStreak,
        milestone,
        newAchievements,
        strength: strengthScores.strength,
        newCelebration,
      };
    }),

  getByDateRange: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Dates are already normalized to UTC midnight by the client
      // Use UTC methods to ensure consistency
      const normalizedStartDate = new Date(
        Date.UTC(
          input.startDate.getUTCFullYear(),
          input.startDate.getUTCMonth(),
          input.startDate.getUTCDate(),
          0,
          0,
          0,
          0,
        ),
      );
      const normalizedEndDate = new Date(
        Date.UTC(
          input.endDate.getUTCFullYear(),
          input.endDate.getUTCMonth(),
          input.endDate.getUTCDate(),
          23,
          59,
          59,
          999,
        ),
      );

      // Get all habits for the user with their completions in the date range
      const habits = await ctx.db.habit.findMany({
        where: {
          userId: ctx.dbUser.id,
        },
        include: {
          completions: {
            where: {
              date: {
                gte: normalizedStartDate,
                lte: normalizedEndDate,
              },
            },
          },
          streakData: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      return habits;
    }),
});

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  calculateCurrentStreak,
  calculateLongestStreak,
  findStreakStartDate,
  isNewMilestone,
} from "~/features/habits/utils/streak-utils";

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

      return {
        completed,
        currentStreak,
        longestStreak,
        milestone,
        newAchievements,
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

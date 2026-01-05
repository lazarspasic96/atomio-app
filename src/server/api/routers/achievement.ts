import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const achievementRouter = createTRPCRouter({
  /**
   * Get all achievements with user's progress/unlock status
   */
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const achievements = await ctx.db.achievement.findMany({
      include: {
        userAchievements: {
          where: { userId: ctx.dbUser.id },
        },
      },
      orderBy: [{ category: "asc" }, { threshold: "asc" }],
    });

    // Get user stats for progress calculation
    const userStats = await ctx.db.userStats.findUnique({
      where: { userId: ctx.dbUser.id },
    });

    // Get max streak across all habits
    const maxStreak = await ctx.db.habitStreak.aggregate({
      where: {
        habit: { userId: ctx.dbUser.id },
      },
      _max: { currentStreak: true, longestStreak: true },
    });

    // Get habit count
    const habitCount = await ctx.db.habit.count({
      where: { userId: ctx.dbUser.id },
    });

    return achievements.map((achievement) => {
      const userAchievement = achievement.userAchievements[0];
      const isEarned = !!userAchievement;

      // Calculate progress based on category
      let progress = 0;
      switch (achievement.category) {
        case "STREAK":
          progress = Math.max(
            maxStreak._max.currentStreak ?? 0,
            maxStreak._max.longestStreak ?? 0
          );
          break;
        case "COMPLETIONS":
          progress = userStats?.totalCompletions ?? 0;
          break;
        case "SPECIAL":
          if (achievement.key === "first_habit" || achievement.key.startsWith("habits_")) {
            progress = habitCount;
          } else if (achievement.key === "first_completion") {
            progress = userStats?.totalCompletions ?? 0;
          }
          break;
        case "CONSISTENCY":
          // These are awarded separately, show 0/1 progress
          progress = isEarned ? 1 : 0;
          break;
      }

      return {
        id: achievement.id,
        key: achievement.key,
        name: achievement.name,
        description: achievement.description,
        emoji: achievement.emoji,
        category: achievement.category,
        threshold: achievement.threshold,
        xpReward: achievement.xpReward,
        isEarned,
        earnedAt: userAchievement?.earnedAt,
        celebrated: userAchievement?.celebrated ?? false,
        progress: Math.min(progress, achievement.threshold),
        progressPercent: Math.min((progress / achievement.threshold) * 100, 100),
      };
    });
  }),

  /**
   * Get user's earned achievements
   */
  getEarned: protectedProcedure.query(async ({ ctx }) => {
    const userAchievements = await ctx.db.userAchievement.findMany({
      where: { userId: ctx.dbUser.id },
      include: { achievement: true },
      orderBy: { earnedAt: "desc" },
    });

    return userAchievements.map((ua) => ({
      id: ua.id,
      key: ua.achievement.key,
      name: ua.achievement.name,
      description: ua.achievement.description,
      emoji: ua.achievement.emoji,
      category: ua.achievement.category,
      xpReward: ua.achievement.xpReward,
      earnedAt: ua.earnedAt,
      celebrated: ua.celebrated,
    }));
  }),

  /**
   * Get recently earned achievements (last 7 days)
   */
  getRecent: protectedProcedure
    .input(z.object({ days: z.number().default(7) }).optional())
    .query(async ({ ctx, input }) => {
      const days = input?.days ?? 7;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const userAchievements = await ctx.db.userAchievement.findMany({
        where: {
          userId: ctx.dbUser.id,
          earnedAt: { gte: cutoffDate },
        },
        include: { achievement: true },
        orderBy: { earnedAt: "desc" },
      });

      return userAchievements.map((ua) => ({
        id: ua.id,
        key: ua.achievement.key,
        name: ua.achievement.name,
        description: ua.achievement.description,
        emoji: ua.achievement.emoji,
        category: ua.achievement.category,
        xpReward: ua.achievement.xpReward,
        earnedAt: ua.earnedAt,
        celebrated: ua.celebrated,
      }));
    }),

  /**
   * Get achievements user hasn't seen yet (for showing celebration)
   */
  getUncelebrated: protectedProcedure.query(async ({ ctx }) => {
    const userAchievements = await ctx.db.userAchievement.findMany({
      where: {
        userId: ctx.dbUser.id,
        celebrated: false,
      },
      include: { achievement: true },
      orderBy: { earnedAt: "desc" },
    });

    return userAchievements.map((ua) => ({
      id: ua.id,
      key: ua.achievement.key,
      name: ua.achievement.name,
      description: ua.achievement.description,
      emoji: ua.achievement.emoji,
      category: ua.achievement.category,
      xpReward: ua.achievement.xpReward,
      earnedAt: ua.earnedAt,
    }));
  }),

  /**
   * Mark an achievement as celebrated (user has seen it)
   */
  markCelebrated: protectedProcedure
    .input(z.object({ userAchievementId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.userAchievement.update({
        where: {
          id: input.userAchievementId,
          userId: ctx.dbUser.id,
        },
        data: { celebrated: true },
      });

      return { success: true };
    }),

  /**
   * Mark all uncelebrated achievements as celebrated
   */
  markAllCelebrated: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.userAchievement.updateMany({
      where: {
        userId: ctx.dbUser.id,
        celebrated: false,
      },
      data: { celebrated: true },
    });

    return { success: true };
  }),

  /**
   * Get achievement summary for dashboard
   */
  getSummary: protectedProcedure.query(async ({ ctx }) => {
    const totalAchievements = await ctx.db.achievement.count();
    const earnedCount = await ctx.db.userAchievement.count({
      where: { userId: ctx.dbUser.id },
    });
    const uncelebratedCount = await ctx.db.userAchievement.count({
      where: {
        userId: ctx.dbUser.id,
        celebrated: false,
      },
    });

    // Get total XP from achievements
    const earnedAchievements = await ctx.db.userAchievement.findMany({
      where: { userId: ctx.dbUser.id },
      include: { achievement: { select: { xpReward: true } } },
    });
    const totalXpFromAchievements = earnedAchievements.reduce(
      (sum, ua) => sum + ua.achievement.xpReward,
      0
    );

    // Get most recent achievement
    const recentAchievement = await ctx.db.userAchievement.findFirst({
      where: { userId: ctx.dbUser.id },
      include: { achievement: true },
      orderBy: { earnedAt: "desc" },
    });

    return {
      total: totalAchievements,
      earned: earnedCount,
      uncelebrated: uncelebratedCount,
      totalXp: totalXpFromAchievements,
      recent: recentAchievement
        ? {
            name: recentAchievement.achievement.name,
            emoji: recentAchievement.achievement.emoji,
            earnedAt: recentAchievement.earnedAt,
          }
        : null,
    };
  }),
});

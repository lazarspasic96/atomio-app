import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

// Milestone thresholds for streak celebrations
const STREAK_MILESTONES = [7, 14, 21, 30, 50, 66, 100, 150, 200, 365];

// Get celebration message based on milestone type and value
function getCelebrationContent(
  type: string,
  value: number,
  habitName?: string
): { title: string; message: string } {
  switch (type) {
    case "streak_7":
      return {
        title: "One Week Strong!",
        message: `You've completed ${habitName ?? "your habit"} for 7 days straight. You're building a real habit!`,
      };
    case "streak_14":
      return {
        title: "Two Weeks!",
        message: `14 days of consistency with ${habitName ?? "your habit"}. You're proving this is who you are now.`,
      };
    case "streak_21":
      return {
        title: "Three Weeks!",
        message: `21 days! ${habitName ?? "This habit"} is becoming automatic. Keep going!`,
      };
    case "streak_30":
      return {
        title: "One Month!",
        message: `30 days of ${habitName ?? "your habit"}! You've shown incredible dedication.`,
      };
    case "streak_50":
      return {
        title: "50 Days!",
        message: `Half a hundred! ${habitName ?? "This habit"} is truly part of who you are now.`,
      };
    case "streak_66":
      return {
        title: "66 Days - Habit Formed!",
        message: `Research says it takes 66 days to form a habit. ${habitName ?? "This"} is now automatic!`,
      };
    case "streak_100":
      return {
        title: "100 Days!",
        message: `Triple digits! Your commitment to ${habitName ?? "this habit"} is extraordinary.`,
      };
    case "streak_365":
      return {
        title: "One Year!",
        message: `365 days of ${habitName ?? "your habit"}! You've transformed your life.`,
      };
    case "perfect_week":
      return {
        title: "Perfect Week!",
        message: "You completed every scheduled habit this week. That's dedication!",
      };
    case "comeback":
      return {
        title: "Great Comeback!",
        message: `You recovered after missing ${habitName ?? "your habit"}. That's real resilience!`,
      };
    case "strength_strong":
      return {
        title: "Habit Strength: Strong!",
        message: `${habitName ?? "Your habit"} has reached strong status. It's becoming automatic!`,
      };
    default:
      return {
        title: "Milestone Reached!",
        message: `You've hit a ${value}-day milestone. Keep building!`,
      };
  }
}

export const celebrationRouter = createTRPCRouter({
  /**
   * Get uncelebrated milestones
   */
  getUncelebrated: protectedProcedure.query(async ({ ctx }) => {
    const celebrations = await ctx.db.celebration.findMany({
      where: {
        userId: ctx.dbUser.id,
        viewedAt: null,
      },
      orderBy: { triggeredAt: "desc" },
      take: 5,
    });

    return celebrations;
  }),

  /**
   * Mark a celebration as viewed
   */
  markViewed: protectedProcedure
    .input(z.object({ celebrationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.celebration.update({
        where: {
          id: input.celebrationId,
          userId: ctx.dbUser.id,
        },
        data: {
          viewedAt: new Date(),
        },
      });

      return { success: true };
    }),

  /**
   * Mark all celebrations as viewed
   */
  markAllViewed: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.celebration.updateMany({
      where: {
        userId: ctx.dbUser.id,
        viewedAt: null,
      },
      data: {
        viewedAt: new Date(),
      },
    });

    return { success: true };
  }),

  /**
   * Get recent celebrations (for history)
   */
  getRecent: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const celebrations = await ctx.db.celebration.findMany({
        where: { userId: ctx.dbUser.id },
        orderBy: { triggeredAt: "desc" },
        take: input.limit,
      });

      return celebrations;
    }),

  /**
   * Trigger a celebration (internal use after completion)
   */
  trigger: protectedProcedure
    .input(
      z.object({
        type: z.string(),
        habitId: z.string().optional(),
        habitName: z.string().optional(),
        value: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const content = getCelebrationContent(
        input.type,
        input.value,
        input.habitName
      );

      const celebration = await ctx.db.celebration.create({
        data: {
          userId: ctx.dbUser.id,
          type: input.type,
          habitId: input.habitId,
          value: input.value,
          title: content.title,
          message: content.message,
        },
      });

      return celebration;
    }),
});

/**
 * Check if a streak value is a milestone
 */
export function isStreakMilestone(streak: number): boolean {
  return STREAK_MILESTONES.includes(streak);
}

/**
 * Get milestone type from streak value
 */
export function getMilestoneType(streak: number): string | null {
  if (STREAK_MILESTONES.includes(streak)) {
    return `streak_${streak}`;
  }
  return null;
}

export { getCelebrationContent, STREAK_MILESTONES };

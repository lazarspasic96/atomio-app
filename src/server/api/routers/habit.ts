import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { habitCategorySchema } from "~/features/habits/schemas/habit.schema";

export const habitRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Habit name is required").max(100),
        frequencyPerWeek: z.number().min(1).max(7),
        activeDays: z.array(z.number().min(0).max(6)).min(1),
        category: habitCategorySchema.optional(),
        emoji: z.string().max(4).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Create habit with streak data initialized
      const habit = await ctx.db.habit.create({
        data: {
          name: input.name,
          frequencyPerWeek: input.frequencyPerWeek,
          activeDays: input.activeDays,
          category: input.category,
          emoji: input.emoji,
          userId: ctx.dbUser.id,
          streakData: {
            create: {
              currentStreak: 0,
              longestStreak: 0,
              totalCompletions: 0,
            },
          },
        },
        include: {
          streakData: true,
        },
      });

      // Update user stats
      await ctx.db.userStats.upsert({
        where: { userId: ctx.dbUser.id },
        create: {
          userId: ctx.dbUser.id,
          totalHabitsCreated: 1,
        },
        update: {
          totalHabitsCreated: { increment: 1 },
        },
      });

      return habit;
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.habit.findMany({
      where: {
        userId: ctx.dbUser.id,
      },
      include: {
        streakData: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.habit.findFirst({
        where: {
          id: input.id,
          userId: ctx.dbUser.id,
        },
        include: {
          streakData: true,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        frequencyPerWeek: z.number().min(1).max(7).optional(),
        activeDays: z.array(z.number().min(0).max(6)).min(1).optional(),
        category: habitCategorySchema.optional().nullable(),
        emoji: z.string().max(4).optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Verify ownership
      const habit = await ctx.db.habit.findFirst({
        where: {
          id,
          userId: ctx.dbUser.id,
        },
      });

      if (!habit) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Habit not found",
        });
      }

      return ctx.db.habit.update({
        where: { id },
        data,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const habit = await ctx.db.habit.findFirst({
        where: {
          id: input.id,
          userId: ctx.dbUser.id,
        },
      });

      if (!habit) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Habit not found",
        });
      }

      return ctx.db.habit.delete({
        where: { id: input.id },
      });
    }),
});

import { habitRouter } from "~/server/api/routers/habit";
import { completionRouter } from "~/server/api/routers/completion";
import { streakRouter } from "~/server/api/routers/streak";
import { statsRouter } from "~/server/api/routers/stats";
import { analyticsRouter } from "~/server/api/routers/analytics";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  habit: habitRouter,
  completion: completionRouter,
  streak: streakRouter,
  stats: statsRouter,
  analytics: analyticsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.habit.getAll();
 *       ^? Habit[]
 */
export const createCaller = createCallerFactory(appRouter);

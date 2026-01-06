import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

interface FocusHabit {
  id: string;
  name: string;
  emoji: string | null;
  currentStreak: number;
  strength: number;
  reason: string;
}

interface DailyFocus {
  date: Date;
  priority: FocusHabit[]; // Fragile habits at risk - do these first
  protect: FocusHabit[]; // Strong streaks to maintain
  momentum: FocusHabit[]; // Building habits to keep going
  completed: FocusHabit[]; // Already done today
  notScheduled: number; // Count of habits not scheduled for today
}

export const focusRouter = createTRPCRouter({
  /**
   * Get today's focus - what habits to prioritize
   */
  getToday: protectedProcedure.query(async ({ ctx }): Promise<DailyFocus> => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayDayOfWeek = today.getDay();

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all habits with their data
    const habits = await ctx.db.habit.findMany({
      where: { userId: ctx.dbUser.id },
      include: {
        streakData: true,
        strengthData: true,
        completions: {
          where: {
            date: {
              gte: today,
              lt: tomorrow,
            },
          },
        },
      },
    });

    // Filter to habits active today
    const todayHabits = habits.filter((h) =>
      h.activeDays.includes(todayDayOfWeek)
    );
    const notScheduledCount = habits.length - todayHabits.length;

    // Categorize habits
    const priority: FocusHabit[] = [];
    const protect: FocusHabit[] = [];
    const momentum: FocusHabit[] = [];
    const completed: FocusHabit[] = [];

    for (const habit of todayHabits) {
      const currentStreak = habit.streakData?.currentStreak ?? 0;
      const strength = habit.strengthData?.strength ?? 0;
      const isCompletedToday = habit.completions.length > 0;

      const focusHabit: FocusHabit = {
        id: habit.id,
        name: habit.name,
        emoji: habit.emoji,
        currentStreak,
        strength,
        reason: "",
      };

      if (isCompletedToday) {
        focusHabit.reason = "Done!";
        completed.push(focusHabit);
        continue;
      }

      // Priority: Fragile/weak habits (strength < 40) OR at-risk streaks (consecutive misses approaching)
      if (strength < 40) {
        if (strength < 20) {
          focusHabit.reason = "New habit - build the foundation";
        } else {
          focusHabit.reason = "Fragile - needs consistency";
        }
        priority.push(focusHabit);
      }
      // Protect: Strong streaks (7+ days) that need protecting
      else if (currentStreak >= 7) {
        if (currentStreak >= 30) {
          focusHabit.reason = `${currentStreak} day streak - keep it going!`;
        } else if (currentStreak >= 21) {
          focusHabit.reason = `${currentStreak} days - almost a month!`;
        } else {
          focusHabit.reason = `${currentStreak} day streak to protect`;
        }
        protect.push(focusHabit);
      }
      // Momentum: Building habits (strength 40-79) or shorter streaks
      else {
        if (currentStreak > 0) {
          focusHabit.reason = `${currentStreak} day streak building`;
        } else {
          focusHabit.reason = "Start a new streak today";
        }
        momentum.push(focusHabit);
      }
    }

    // Sort each category
    // Priority: lowest strength first (most fragile)
    priority.sort((a, b) => a.strength - b.strength);

    // Protect: highest streak first (most to lose)
    protect.sort((a, b) => b.currentStreak - a.currentStreak);

    // Momentum: by strength (help the ones closest to "building")
    momentum.sort((a, b) => b.strength - a.strength);

    return {
      date: today,
      priority,
      protect,
      momentum,
      completed,
      notScheduled: notScheduledCount,
    };
  }),

  /**
   * Get a motivational message based on current progress
   */
  getMessage: protectedProcedure.query(async ({ ctx }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayDayOfWeek = today.getDay();

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const habits = await ctx.db.habit.findMany({
      where: { userId: ctx.dbUser.id },
      include: {
        completions: {
          where: {
            date: {
              gte: today,
              lt: tomorrow,
            },
          },
        },
      },
    });

    const activeToday = habits.filter((h) =>
      h.activeDays.includes(todayDayOfWeek)
    );
    const completedToday = activeToday.filter(
      (h) => h.completions.length > 0
    ).length;
    const totalActive = activeToday.length;

    if (totalActive === 0) {
      return {
        message: "No habits scheduled for today. Enjoy your rest day!",
        type: "rest" as const,
      };
    }

    const progress = completedToday / totalActive;

    if (completedToday === totalActive) {
      return {
        message: "Perfect day! All habits completed. You're building something great.",
        type: "success" as const,
      };
    }

    if (progress >= 0.75) {
      return {
        message: `Almost there! Just ${totalActive - completedToday} more to go.`,
        type: "almost" as const,
      };
    }

    if (progress >= 0.5) {
      return {
        message: "Halfway done! Keep the momentum going.",
        type: "progress" as const,
      };
    }

    if (completedToday > 0) {
      return {
        message: "Good start! Every completion is a vote for who you want to become.",
        type: "started" as const,
      };
    }

    const hour = new Date().getHours();
    if (hour < 12) {
      return {
        message: "Fresh start! Your morning habits set the tone for the day.",
        type: "morning" as const,
      };
    }

    if (hour < 17) {
      return {
        message: "Time to check in. What's one habit you can complete right now?",
        type: "afternoon" as const,
      };
    }

    return {
      message: "Day's not over yet. Start small - one habit at a time.",
      type: "evening" as const,
    };
  }),
});

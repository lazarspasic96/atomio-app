import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

const ACHIEVEMENTS = [
  // Streak milestones
  {
    key: "streak_3",
    name: "Getting Started",
    description: "Maintain a 3-day streak",
    emoji: "🔥",
    category: "STREAK" as const,
    threshold: 3,
    xpReward: 25,
  },
  {
    key: "streak_7",
    name: "Week Warrior",
    description: "Maintain a 7-day streak",
    emoji: "🔥",
    category: "STREAK" as const,
    threshold: 7,
    xpReward: 50,
  },
  {
    key: "streak_14",
    name: "Fortnight Fighter",
    description: "Maintain a 14-day streak",
    emoji: "🔥",
    category: "STREAK" as const,
    threshold: 14,
    xpReward: 75,
  },
  {
    key: "streak_21",
    name: "Habit Builder",
    description: "Maintain a 21-day streak",
    emoji: "💪",
    category: "STREAK" as const,
    threshold: 21,
    xpReward: 100,
  },
  {
    key: "streak_30",
    name: "Monthly Master",
    description: "Maintain a 30-day streak",
    emoji: "🌟",
    category: "STREAK" as const,
    threshold: 30,
    xpReward: 150,
  },
  {
    key: "streak_66",
    name: "Habit Formed",
    description: "Maintain a 66-day streak (science says it's a habit!)",
    emoji: "🧠",
    category: "STREAK" as const,
    threshold: 66,
    xpReward: 300,
  },
  {
    key: "streak_100",
    name: "Century Club",
    description: "Maintain a 100-day streak",
    emoji: "💯",
    category: "STREAK" as const,
    threshold: 100,
    xpReward: 500,
  },
  {
    key: "streak_365",
    name: "Year Champion",
    description: "Maintain a 365-day streak",
    emoji: "👑",
    category: "STREAK" as const,
    threshold: 365,
    xpReward: 1000,
  },

  // Completion counts
  {
    key: "completions_10",
    name: "First Steps",
    description: "Complete habits 10 times",
    emoji: "🌱",
    category: "COMPLETIONS" as const,
    threshold: 10,
    xpReward: 20,
  },
  {
    key: "completions_50",
    name: "Building Momentum",
    description: "Complete habits 50 times",
    emoji: "🚀",
    category: "COMPLETIONS" as const,
    threshold: 50,
    xpReward: 50,
  },
  {
    key: "completions_100",
    name: "Century of Votes",
    description: "Complete habits 100 times",
    emoji: "💯",
    category: "COMPLETIONS" as const,
    threshold: 100,
    xpReward: 100,
  },
  {
    key: "completions_500",
    name: "Dedicated",
    description: "Complete habits 500 times",
    emoji: "⭐",
    category: "COMPLETIONS" as const,
    threshold: 500,
    xpReward: 250,
  },
  {
    key: "completions_1000",
    name: "Thousand Strong",
    description: "Complete habits 1000 times",
    emoji: "🎯",
    category: "COMPLETIONS" as const,
    threshold: 1000,
    xpReward: 500,
  },

  // Consistency achievements
  {
    key: "perfect_day",
    name: "Perfect Day",
    description: "Complete all active habits in a single day",
    emoji: "✨",
    category: "CONSISTENCY" as const,
    threshold: 1,
    xpReward: 25,
  },
  {
    key: "perfect_week",
    name: "Perfect Week",
    description: "Achieve 7 perfect days",
    emoji: "🌈",
    category: "CONSISTENCY" as const,
    threshold: 7,
    xpReward: 100,
  },
  {
    key: "perfect_month",
    name: "Perfect Month",
    description: "Achieve 30 perfect days",
    emoji: "💫",
    category: "CONSISTENCY" as const,
    threshold: 30,
    xpReward: 300,
  },

  // Special achievements
  {
    key: "first_habit",
    name: "First Step",
    description: "Create your first habit",
    emoji: "🎉",
    category: "SPECIAL" as const,
    threshold: 1,
    xpReward: 10,
  },
  {
    key: "first_completion",
    name: "Off the Ground",
    description: "Complete a habit for the first time",
    emoji: "✅",
    category: "SPECIAL" as const,
    threshold: 1,
    xpReward: 15,
  },
  {
    key: "habits_3",
    name: "Triple Threat",
    description: "Track 3 habits simultaneously",
    emoji: "🎯",
    category: "SPECIAL" as const,
    threshold: 3,
    xpReward: 30,
  },
  {
    key: "habits_5",
    name: "High Five",
    description: "Track 5 habits simultaneously",
    emoji: "🖐️",
    category: "SPECIAL" as const,
    threshold: 5,
    xpReward: 50,
  },
];

async function main() {
  console.log("🌱 Seeding achievements...");

  for (const achievement of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: achievement,
      create: achievement,
    });
  }

  console.log(`✅ Seeded ${ACHIEVEMENTS.length} achievements`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

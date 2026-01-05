# Atomic Habits Progress System - Implementation Plan

This document outlines a comprehensive plan to transform the Habit Tracker app into a powerful habit-building tool based on James Clear's Atomic Habits principles.

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Feature Inventory](#feature-inventory)
3. [Data Model Changes](#data-model-changes)
4. [Calculation Definitions](#calculation-definitions)
5. [API Endpoints](#api-endpoints)
6. [Component Specifications](#component-specifications)
7. [Library Recommendations](#library-recommendations)
8. [Implementation Roadmap](#implementation-roadmap)
9. [UX Considerations](#ux-considerations)
10. [Performance Considerations](#performance-considerations)

---

## Current State Analysis

### Existing Architecture

```
Tech Stack:
├── Next.js 15 (App Router)
├── tRPC 11 (type-safe API)
├── Prisma 6 + PostgreSQL
├── Supabase (authentication)
├── shadcn/ui + Tailwind CSS
└── react-hook-form + Zod
```

### Current Data Model

```
User ──┬── id (Supabase Auth)
       ├── email
       └── habits[]

Habit ──┬── id, name
        ├── frequencyPerWeek (1-7)
        ├── activeDays[] (0-6)
        └── completions[]

HabitCompletion ──┬── habitId
                  ├── date
                  └── completed (boolean)
```

### Current Capabilities

- CRUD operations for habits
- Toggle completions per day
- Weekly table view and monthly calendar view
- Optimistic updates for completion toggling
- Basic completion counting

### Gaps to Address

- No streak tracking
- No historical analytics
- No progress metrics or trends
- No gamification elements
- No identity/goal tracking
- No insights or recommendations

---

## Feature Inventory

### 1. The Power of 1% Improvement

| Feature | Description | Priority |
|---------|-------------|----------|
| **Improvement Calculator** | Show week-over-week percentage improvement | High |
| **Compound Growth Chart** | Visualize cumulative progress vs 1% daily curve | Medium |
| **Projected Progress** | "At this rate, in 30 days you'll have X completions" | Low |
| **Historical Trend Line** | Show actual growth trajectory over time | Medium |

### 2. Habit Streaks & Consistency

| Feature | Description | Priority |
|---------|-------------|----------|
| **Current Streak** | Days in a row habit was completed | High |
| **Longest Streak** | Personal best streak record | High |
| **Two-Day Rule** | Alert when habit missed, warn before missing twice | High |
| **Streak Calendar** | GitHub-style contribution heatmap | High |
| **Streak Milestones** | Celebrate 7, 21, 30, 66, 100, 365 day streaks | Medium |
| **Streak Recovery Rate** | How often user bounces back from missed days | Low |

### 3. The Four Laws of Behavior Change

#### Make it Obvious

| Feature | Description | Priority |
|---------|-------------|----------|
| **Implementation Intentions** | Store "I will [X] at [TIME] in [LOCATION]" | Medium |
| **Habit Stacking** | Link habits: "After [HABIT A], I will [HABIT B]" | Low |
| **Time-of-Day Tracking** | When habits are typically completed | Medium |

#### Make it Attractive

| Feature | Description | Priority |
|---------|-------------|----------|
| **Achievement Badges** | Visual rewards for milestones | Medium |
| **Progress Celebrations** | Confetti/animation on completions | Low |
| **Motivational Quotes** | Context-aware James Clear quotes | Low |

#### Make it Easy

| Feature | Description | Priority |
|---------|-------------|----------|
| **Two-Minute Version** | Store simplified version of each habit | Medium |
| **Difficulty Progression** | Track habit difficulty level (1-5) | Low |
| **Friction Score** | Rate how easy each habit is to start | Low |

#### Make it Satisfying

| Feature | Description | Priority |
|---------|-------------|----------|
| **Instant Visual Feedback** | Checkbox animations, color changes | High |
| **Daily Score** | Overall completion percentage for today | High |
| **Points/XP System** | Earn XP for completions, level up | Medium |

### 4. Identity-Based Habits

| Feature | Description | Priority |
|---------|-------------|----------|
| **Habit Categories** | Group habits by life area (health, work, learning) | Medium |
| **Identity Statements** | "I am a person who..." per category | Medium |
| **Identity Votes Counter** | Total completions = votes for new identity | High |
| **Identity Reinforcement** | Messages based on streak ("You've voted for being a reader 47 times!") | Medium |

### 5. The Plateau of Latent Potential

| Feature | Description | Priority |
|---------|-------------|----------|
| **Expected vs Actual Chart** | Show gap between effort and visible results | Low |
| **Patience Indicator** | "Keep going! Results typically visible after X days" | Low |
| **Breakthrough Prediction** | Based on consistency, predict breakthrough timing | Low |

### 6. Systems vs Goals

| Feature | Description | Priority |
|---------|-------------|----------|
| **System Adherence Score** | Did you follow your system today? (% of active habits done) | High |
| **Weekly System Review** | Auto-generated summary with insights | Medium |
| **Habit Audit** | Periodic prompt to review and adjust habits | Low |

---

## Data Model Changes

### New Prisma Schema

```prisma
// ============================================
// ENUMS
// ============================================

enum HabitCategory {
  HEALTH
  FITNESS
  LEARNING
  PRODUCTIVITY
  MINDFULNESS
  SOCIAL
  CREATIVE
  FINANCIAL
  OTHER
}

enum AchievementType {
  // Streak achievements
  STREAK_7
  STREAK_21
  STREAK_30
  STREAK_66
  STREAK_100
  STREAK_365

  // Completion achievements
  COMPLETIONS_10
  COMPLETIONS_50
  COMPLETIONS_100
  COMPLETIONS_500
  COMPLETIONS_1000

  // Behavioral achievements
  FIRST_HABIT
  FIVE_HABITS
  PERFECT_WEEK
  PERFECT_MONTH
  COMEBACK_KING      // Recovered after missing
  EARLY_BIRD         // Completed before 9am 7 times
  CONSISTENCY_MASTER // 90%+ for 4 weeks

  // Identity achievements
  IDENTITY_DEFINED   // Set first identity statement
  MULTI_IDENTITY     // Habits in 3+ categories
}

// ============================================
// EXTENDED HABIT MODEL
// ============================================

model Habit {
  id               String            @id @default(cuid())
  name             String
  frequencyPerWeek Int
  activeDays       Int[]
  userId           String
  user             User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  completions      HabitCompletion[]
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt

  // NEW: Atomic Habits fields
  category              HabitCategory?
  emoji                 String?              // Visual identifier
  twoMinuteVersion      String?              // Simplified version
  implementationIntent  String?              // "I will X at Y in Z"
  stackedAfterId        String?              // Habit stacking reference
  stackedAfter          Habit?               @relation("HabitStack", fields: [stackedAfterId], references: [id])
  stackedBefore         Habit[]              @relation("HabitStack")
  difficultyLevel       Int?                 // 1-5 scale

  // NEW: Streak tracking (denormalized for performance)
  streakData            HabitStreak?

  @@index([userId])
  @@index([category])
}

// ============================================
// STREAK TRACKING
// ============================================

model HabitStreak {
  id                String    @id @default(cuid())
  habitId           String    @unique
  habit             Habit     @relation(fields: [habitId], references: [id], onDelete: Cascade)

  currentStreak     Int       @default(0)
  longestStreak     Int       @default(0)
  totalCompletions  Int       @default(0)

  lastCompletedAt   DateTime?
  streakStartedAt   DateTime?

  // Two-day rule tracking
  lastMissedAt      DateTime?
  consecutiveMisses Int       @default(0)

  // Performance optimization
  lastCalculatedAt  DateTime  @default(now())

  updatedAt         DateTime  @updatedAt
}

// ============================================
// USER STATISTICS
// ============================================

model UserStats {
  id                    String       @id @default(cuid())
  userId                String       @unique
  user                  User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Aggregate stats
  totalHabitsCreated    Int          @default(0)
  totalCompletions      Int          @default(0)

  // Overall streaks (any habit completed)
  currentOverallStreak  Int          @default(0)
  longestOverallStreak  Int          @default(0)

  // Gamification
  experiencePoints      Int          @default(0)
  level                 Int          @default(1)

  // Identity tracking
  identityVotes         Int          @default(0)  // = totalCompletions

  // Timestamps
  lastActiveAt          DateTime?
  createdAt             DateTime     @default(now())
  updatedAt             DateTime     @updatedAt

  // Relations
  weeklyStats           WeeklyStat[]
  achievements          Achievement[]
  identities            UserIdentity[]
}

// ============================================
// WEEKLY STATISTICS (for trends)
// ============================================

model WeeklyStat {
  id              String    @id @default(cuid())
  userStatsId     String
  userStats       UserStats @relation(fields: [userStatsId], references: [id], onDelete: Cascade)

  weekStartDate   DateTime  @db.Date
  weekEndDate     DateTime  @db.Date

  // Metrics
  completionRate  Float     // 0.0 - 1.0
  habitsCompleted Int
  habitsPossible  Int

  // Comparison
  improvementRate Float?    // % change from previous week

  createdAt       DateTime  @default(now())

  @@unique([userStatsId, weekStartDate])
  @@index([weekStartDate])
}

// ============================================
// ACHIEVEMENTS
// ============================================

model Achievement {
  id          String          @id @default(cuid())
  userStatsId String
  userStats   UserStats       @relation(fields: [userStatsId], references: [id], onDelete: Cascade)

  type        AchievementType
  habitId     String?         // If achievement is habit-specific

  title       String
  description String
  icon        String          // Emoji or icon name

  earnedAt    DateTime        @default(now())
  celebrated  Boolean         @default(false)

  @@unique([userStatsId, type, habitId])
}

// ============================================
// IDENTITY TRACKING
// ============================================

model UserIdentity {
  id              String        @id @default(cuid())
  userStatsId     String
  userStats       UserStats     @relation(fields: [userStatsId], references: [id], onDelete: Cascade)

  category        HabitCategory
  statement       String        // "I am a person who exercises daily"

  // Calculated votes (completions in this category)
  votes           Int           @default(0)

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@unique([userStatsId, category])
}

// ============================================
// UPDATED USER MODEL
// ============================================

model User {
  id        String     @id
  email     String     @unique
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  habits    Habit[]

  // NEW: Stats relation
  stats     UserStats?
}
```

### Migration Strategy

1. **Phase 1**: Add optional fields to Habit (category, emoji, twoMinuteVersion)
2. **Phase 2**: Create HabitStreak model, backfill from existing completions
3. **Phase 3**: Create UserStats, WeeklyStat models with calculation jobs
4. **Phase 4**: Add Achievement, UserIdentity models

---

## Calculation Definitions

### Core Metrics

#### 1. Completion Rate

```typescript
// Daily Completion Rate
dailyRate = completedToday / activeHabitsToday

// Weekly Completion Rate
weeklyRate = completionsThisWeek / possibleCompletionsThisWeek

// Where possibleCompletions = sum of activeDays that fall within the week
```

#### 2. Current Streak

```typescript
function calculateStreak(completions: Date[], activeDays: number[]): number {
  // Sort completions descending
  const sorted = completions.sort((a, b) => b.getTime() - a.getTime());

  let streak = 0;
  let checkDate = startOfToday();

  // If today's habit isn't done yet but day is active, start from yesterday
  if (isActiveDay(checkDate, activeDays) && !isCompletedOn(checkDate, sorted)) {
    // Only break if it's past typical completion time
    if (isPastTypicalCompletionTime()) {
      return 0; // Streak broken
    }
    checkDate = subDays(checkDate, 1);
  }

  while (true) {
    if (!isActiveDay(checkDate, activeDays)) {
      // Skip non-active days
      checkDate = subDays(checkDate, 1);
      continue;
    }

    if (isCompletedOn(checkDate, sorted)) {
      streak++;
      checkDate = subDays(checkDate, 1);
    } else {
      break; // Streak broken
    }
  }

  return streak;
}
```

#### 3. Consistency Score (0-100)

```typescript
function calculateConsistency(habit: HabitWithCompletions, days: number = 30): number {
  const activeDaysInPeriod = getActiveDaysInPeriod(habit.activeDays, days);
  const completionsInPeriod = getCompletionsInPeriod(habit.completions, days);

  const baseRate = completionsInPeriod / activeDaysInPeriod;

  // Bonus for streaks (up to 20% bonus)
  const streakBonus = Math.min(habit.streakData.currentStreak / 30, 0.2);

  // Penalty for variance (inconsistent patterns)
  const variance = calculateWeeklyVariance(habit.completions, days);
  const variancePenalty = variance * 0.1;

  return Math.min(100, Math.max(0,
    (baseRate + streakBonus - variancePenalty) * 100
  ));
}
```

#### 4. Improvement Rate (Week-over-Week)

```typescript
function calculateImprovement(currentWeek: WeeklyStat, previousWeek: WeeklyStat): number {
  if (previousWeek.completionRate === 0) {
    return currentWeek.completionRate > 0 ? 100 : 0;
  }

  return ((currentWeek.completionRate - previousWeek.completionRate)
          / previousWeek.completionRate) * 100;
}
```

#### 5. Habit Strength Index (0-100)

```typescript
function calculateStrengthIndex(habit: HabitWithCompletions): number {
  const weights = {
    streakLength: 0.3,
    totalCompletions: 0.25,
    consistency: 0.25,
    longevity: 0.2
  };

  // Streak component (max at 66 days - habit formation threshold)
  const streakScore = Math.min(habit.streakData.currentStreak / 66, 1) * 100;

  // Total completions component (log scale, max meaningful at ~500)
  const completionsScore = Math.min(Math.log10(habit.streakData.totalCompletions + 1) / Math.log10(500), 1) * 100;

  // Consistency from last 30 days
  const consistencyScore = calculateConsistency(habit, 30);

  // Longevity (days since habit created, max at 365)
  const daysSinceCreated = differenceInDays(new Date(), habit.createdAt);
  const longevityScore = Math.min(daysSinceCreated / 365, 1) * 100;

  return (
    streakScore * weights.streakLength +
    completionsScore * weights.totalCompletions +
    consistencyScore * weights.consistency +
    longevityScore * weights.longevity
  );
}
```

#### 6. System Adherence Score

```typescript
function calculateSystemAdherence(date: Date, habits: HabitWithCompletions[]): number {
  const activeHabits = habits.filter(h => isActiveDay(h.activeDays, date));

  if (activeHabits.length === 0) return 100; // No habits = perfect adherence

  const completed = activeHabits.filter(h =>
    h.completions.some(c => isSameDay(c.date, date))
  );

  return (completed.length / activeHabits.length) * 100;
}
```

#### 7. Experience Points (XP)

```typescript
const XP_VALUES = {
  completion: 10,
  streakDay: 5,          // Bonus per streak day
  streakMilestone7: 50,
  streakMilestone21: 150,
  streakMilestone30: 250,
  streakMilestone66: 500,
  streakMilestone100: 1000,
  perfectDay: 25,        // All habits completed
  perfectWeek: 200,
  comeback: 30,          // Recovered after miss
};

function calculateLevel(xp: number): number {
  // Level formula: each level requires 20% more XP than previous
  // Level 1: 0 XP, Level 2: 100 XP, Level 3: 220 XP, etc.
  return Math.floor(1 + Math.sqrt(xp / 50));
}

function xpForNextLevel(currentLevel: number): number {
  return Math.pow(currentLevel, 2) * 50;
}
```

#### 8. Risk Score (Probability of Breaking Streak)

```typescript
function calculateRiskScore(habit: HabitWithCompletions): number {
  const factors = {
    notCompletedToday: 0.4,
    longStreak: -0.2,      // Longer streaks = lower risk
    recentMisses: 0.3,
    lowConsistency: 0.3
  };

  let risk = 0;

  // Not completed today (if active day)
  if (isActiveDay(habit.activeDays, new Date()) && !isCompletedToday(habit)) {
    risk += factors.notCompletedToday;
  }

  // Long streak bonus (up to 20% risk reduction)
  const streakBonus = Math.min(habit.streakData.currentStreak / 30, 1) * Math.abs(factors.longStreak);
  risk -= streakBonus;

  // Recent misses in last 14 days
  const recentMissRate = getMissRateLastNDays(habit, 14);
  risk += recentMissRate * factors.recentMisses;

  // Low consistency
  const consistency = calculateConsistency(habit, 30);
  if (consistency < 70) {
    risk += (1 - consistency / 100) * factors.lowConsistency;
  }

  return Math.min(100, Math.max(0, risk * 100));
}
```

---

## API Endpoints

### New tRPC Routers

#### Stats Router (`src/server/api/routers/stats.ts`)

```typescript
export const statsRouter = createTRPCRouter({
  // Get or create user stats
  getUserStats: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.db.userStats.upsert({
        where: { userId: ctx.dbUser.id },
        create: { userId: ctx.dbUser.id },
        update: {},
        include: {
          weeklyStats: { orderBy: { weekStartDate: 'desc' }, take: 12 },
          achievements: { orderBy: { earnedAt: 'desc' } },
          identities: true,
        },
      });
    }),

  // Get dashboard summary
  getDashboard: protectedProcedure
    .query(async ({ ctx }) => {
      // Returns: today's score, streaks at risk, recent achievements, weekly trend
    }),

  // Calculate and store weekly stats (called by cron or on-demand)
  calculateWeeklyStats: protectedProcedure
    .input(z.object({ weekStartDate: z.date() }))
    .mutation(async ({ ctx, input }) => {
      // Calculate completion rate, improvement, store in WeeklyStat
    }),

  // Get improvement trends
  getImprovementTrends: protectedProcedure
    .input(z.object({ weeks: z.number().min(1).max(52).default(12) }))
    .query(async ({ ctx, input }) => {
      // Returns array of weekly stats for trend visualization
    }),
});
```

#### Streaks Router (`src/server/api/routers/streak.ts`)

```typescript
export const streakRouter = createTRPCRouter({
  // Get all streaks for user
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.db.habitStreak.findMany({
        where: { habit: { userId: ctx.dbUser.id } },
        include: { habit: true },
        orderBy: { currentStreak: 'desc' },
      });
    }),

  // Get streak for specific habit
  getByHabitId: protectedProcedure
    .input(z.object({ habitId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Returns streak data with calculated risk score
    }),

  // Recalculate streak (after data correction)
  recalculate: protectedProcedure
    .input(z.object({ habitId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Full recalculation from completion history
    }),

  // Get habits at risk (not completed today, have active streak)
  getAtRisk: protectedProcedure
    .query(async ({ ctx }) => {
      // Returns habits that need attention today
    }),
});
```

#### Achievements Router (`src/server/api/routers/achievement.ts`)

```typescript
export const achievementRouter = createTRPCRouter({
  // Get all achievements
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.db.achievement.findMany({
        where: { userStats: { userId: ctx.dbUser.id } },
        orderBy: { earnedAt: 'desc' },
      });
    }),

  // Get uncelebrated achievements
  getUncelebrated: protectedProcedure
    .query(async ({ ctx }) => {
      // For showing celebration modals
    }),

  // Mark achievement as celebrated
  markCelebrated: protectedProcedure
    .input(z.object({ achievementId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Update celebrated = true
    }),

  // Check and award achievements (called after completion toggle)
  checkAndAward: protectedProcedure
    .input(z.object({ habitId: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      // Check all achievement conditions, award new ones
    }),
});
```

#### Identity Router (`src/server/api/routers/identity.ts`)

```typescript
export const identityRouter = createTRPCRouter({
  // Get all identities
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.db.userIdentity.findMany({
        where: { userStats: { userId: ctx.dbUser.id } },
        orderBy: { votes: 'desc' },
      });
    }),

  // Create or update identity statement
  upsert: protectedProcedure
    .input(z.object({
      category: z.nativeEnum(HabitCategory),
      statement: z.string().min(1).max(200),
    }))
    .mutation(async ({ ctx, input }) => {
      // Upsert identity for category
    }),

  // Get identity vote counts by category
  getVoteCounts: protectedProcedure
    .query(async ({ ctx }) => {
      // Aggregate completions by habit category
    }),
});
```

#### Analytics Router (`src/server/api/routers/analytics.ts`)

```typescript
export const analyticsRouter = createTRPCRouter({
  // Get heatmap data for year
  getHeatmapData: protectedProcedure
    .input(z.object({
      habitId: z.string().optional(), // All habits if not specified
      year: z.number().default(() => new Date().getFullYear()),
    }))
    .query(async ({ ctx, input }) => {
      // Returns array of { date, count, rate } for heatmap
    }),

  // Get completion patterns (time of day, day of week)
  getCompletionPatterns: protectedProcedure
    .input(z.object({ habitId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      // Returns { dayOfWeek: number[], hourOfDay: number[] } heatmap data
    }),

  // Get habit correlations
  getHabitCorrelations: protectedProcedure
    .query(async ({ ctx }) => {
      // Which habits are completed together
    }),

  // Get compound growth data
  getCompoundGrowth: protectedProcedure
    .input(z.object({ days: z.number().min(7).max(365).default(90) }))
    .query(async ({ ctx, input }) => {
      // Returns { actual: number[], theoretical: number[] } for chart
    }),
});
```

### Updated Completion Router

```typescript
// In completion.ts - enhance toggle to update streaks
toggle: protectedProcedure
  .input(z.object({ habitId: z.string(), date: z.date() }))
  .mutation(async ({ ctx, input }) => {
    // ... existing toggle logic ...

    // NEW: Update streak data
    await updateHabitStreak(ctx.db, input.habitId);

    // NEW: Update user stats
    await updateUserStats(ctx.db, ctx.dbUser.id);

    // NEW: Check achievements
    await checkAndAwardAchievements(ctx.db, ctx.dbUser.id, input.habitId);

    return { completed, newStreak, achievements };
  }),
```

---

## Component Specifications

### Dashboard Components

#### 1. DailyScoreCard

```typescript
interface DailyScoreCardProps {
  score: number;              // 0-100
  completedCount: number;
  totalCount: number;
  comparisonYesterday: number; // +/- percentage
}

// Features:
// - Large circular progress indicator
// - "X of Y habits completed"
// - Comparison badge (↑ 15% vs yesterday)
// - Motivational message based on score
```

#### 2. StreakSummaryCard

```typescript
interface StreakSummaryCardProps {
  activeStreaks: Array<{
    habitId: string;
    habitName: string;
    currentStreak: number;
    isAtRisk: boolean;
  }>;
  longestActiveStreak: number;
  totalStreakDays: number; // Sum of all streaks
}

// Features:
// - List of active streaks with flame icons
// - "At risk" badges for incomplete habits
// - Tap to expand full streak details
```

#### 3. IdentityVotesCard

```typescript
interface IdentityVotesCardProps {
  totalVotes: number;
  topIdentity: {
    category: HabitCategory;
    statement: string;
    votes: number;
  };
  todayVotes: number;
}

// Features:
// - Large vote counter with animation on increment
// - Identity statement display
// - "You've cast X votes for becoming [identity]"
```

#### 4. WeeklyTrendChart

```typescript
interface WeeklyTrendChartProps {
  data: Array<{
    week: string;       // "Jan 1"
    completionRate: number;
    improvement: number;
  }>;
  showImprovement: boolean;
}

// Features:
// - Line/bar chart showing 12 weeks
// - Trend line overlay
// - Toggle between rate and improvement view
```

### Visualization Components

#### 5. ContributionHeatmap

```typescript
interface ContributionHeatmapProps {
  data: Array<{
    date: string;    // ISO date
    count: number;   // Completions
    rate: number;    // 0-1 completion rate
  }>;
  year: number;
  habitId?: string;  // Filter to specific habit
  colorScale: 'green' | 'blue' | 'purple';
}

// Features:
// - GitHub-style year calendar
// - 5-level color intensity (0, 1-25%, 26-50%, 51-75%, 76-100%)
// - Hover tooltip with date and stats
// - Click to view day details
```

#### 6. StreakTimeline

```typescript
interface StreakTimelineProps {
  habitId: string;
  data: Array<{
    startDate: Date;
    endDate: Date;
    length: number;
    isCurrent: boolean;
  }>;
}

// Features:
// - Horizontal timeline showing streak periods
// - Gaps shown in gray
// - Current streak highlighted
// - Personal best marked with star
```

#### 7. CompoundGrowthChart

```typescript
interface CompoundGrowthChartProps {
  actualData: Array<{ date: string; cumulative: number }>;
  theoreticalData: Array<{ date: string; cumulative: number }>;
  showTheoretical: boolean;
}

// Features:
// - Area chart with two series
// - Actual progress (solid)
// - 1% daily improvement curve (dashed)
// - "You are here" marker
// - Projection to future
```

#### 8. RadarChart (Life Balance)

```typescript
interface LifeBalanceRadarProps {
  data: Array<{
    category: HabitCategory;
    score: number;    // 0-100 based on completion rate
    habitCount: number;
  }>;
}

// Features:
// - Spider/radar chart
// - One axis per category with habits
// - Score based on consistency in that category
// - Hover to see category details
```

### Achievement Components

#### 9. AchievementBadge

```typescript
interface AchievementBadgeProps {
  type: AchievementType;
  title: string;
  icon: string;
  earnedAt: Date;
  size: 'sm' | 'md' | 'lg';
  showDate: boolean;
}

// Features:
// - Circular badge with icon
// - Gold/silver/bronze variants based on achievement tier
// - Hover for full description
// - Locked state for unearned
```

#### 10. AchievementCelebration

```typescript
interface AchievementCelebrationProps {
  achievement: Achievement;
  onClose: () => void;
}

// Features:
// - Modal overlay
// - Confetti animation
// - Large badge display
// - Motivational message
// - Share button (optional)
```

#### 11. AchievementProgress

```typescript
interface AchievementProgressProps {
  nextAchievements: Array<{
    type: AchievementType;
    title: string;
    progress: number;  // 0-100
    remaining: string; // "5 more days"
  }>;
}

// Features:
// - Progress bars for near achievements
// - "X more to go" labels
// - Motivates continued effort
```

### Habit Enhancement Components

#### 12. HabitStreakBadge

```typescript
interface HabitStreakBadgeProps {
  currentStreak: number;
  longestStreak: number;
  isAtRisk: boolean;
}

// Features:
// - Flame icon with streak count
// - Personal best indicator
// - Pulsing animation if at risk
// - Tooltip with streak details
```

#### 13. TwoDayRuleIndicator

```typescript
interface TwoDayRuleIndicatorProps {
  lastMissedAt: Date | null;
  consecutiveMisses: number;
}

// Features:
// - Visual warning system
// - Green: all good
// - Yellow: missed once (don't miss again!)
// - Red: streak broken
```

#### 14. ImplementationIntentForm

```typescript
interface ImplementationIntentFormProps {
  habitId: string;
  currentIntent?: string;
  onSave: (intent: string) => void;
}

// Features:
// - Template: "I will [BEHAVIOR] at [TIME] in [LOCATION]"
// - Guided fill-in-the-blank
// - Saves to habit record
```

---

## Library Recommendations

### Charting

| Library | Use Case | Notes |
|---------|----------|-------|
| **Recharts** | Line, bar, area charts | React-native, composable, good for trends |
| **@nivo/calendar** | Contribution heatmap | Beautiful GitHub-style calendars |
| **@nivo/radar** | Life balance radar | Spider charts for category balance |

```bash
bun add recharts @nivo/calendar @nivo/radar
```

### Animations

| Library | Use Case | Notes |
|---------|----------|-------|
| **Framer Motion** | Component animations | Already common in shadcn ecosystem |
| **canvas-confetti** | Celebration effects | Lightweight, no React wrapper needed |
| **@lottiefiles/react-lottie-player** | Complex animations | For achievement animations |

```bash
bun add framer-motion canvas-confetti
```

### Date Handling

| Library | Use Case | Notes |
|---------|----------|-------|
| **date-fns** | Date calculations | Tree-shakeable, already likely in use |

```bash
bun add date-fns
```

### State Management (if needed)

The existing React Query + tRPC setup should suffice. Consider `zustand` only if complex client-side state emerges.

---

## Implementation Roadmap

### Phase 1: Core Metrics Foundation (Week 1-2)

**Goal**: Streak tracking and basic stats

**Database Changes**:
- Add `HabitStreak` model
- Add `UserStats` model
- Add optional fields to `Habit` (category, emoji)

**API Endpoints**:
- `streak.getAll`
- `streak.getByHabitId`
- `stats.getUserStats`

**UI Components**:
- `HabitStreakBadge` (inline with habits)
- `StreakSummaryCard` (dashboard)
- Update habit table/calendar to show streak counts

**Tasks**:
1. Create Prisma migrations
2. Implement streak calculation logic
3. Add streak update trigger to completion toggle
4. Build streak display components
5. Backfill existing data

### Phase 2: Basic Visualizations (Week 3-4)

**Goal**: Weekly trends and heatmap

**Database Changes**:
- Add `WeeklyStat` model

**API Endpoints**:
- `stats.calculateWeeklyStats`
- `stats.getImprovementTrends`
- `analytics.getHeatmapData`

**UI Components**:
- `WeeklyTrendChart`
- `ContributionHeatmap`
- `DailyScoreCard`
- Dashboard layout

**Tasks**:
1. Implement weekly stats calculation (cron or on-demand)
2. Build chart components with Recharts
3. Integrate @nivo/calendar for heatmap
4. Create dashboard page layout
5. Add navigation to dashboard

### Phase 3: Atomic Habits Features (Week 5-6)

**Goal**: Identity tracking, two-day rule, implementation intentions

**Database Changes**:
- Add `UserIdentity` model
- Add `implementationIntent`, `twoMinuteVersion` to Habit

**API Endpoints**:
- `identity.getAll`
- `identity.upsert`
- `identity.getVoteCounts`
- `streak.getAtRisk`

**UI Components**:
- `IdentityVotesCard`
- `TwoDayRuleIndicator`
- `ImplementationIntentForm`
- Edit habit form updates

**Tasks**:
1. Build identity management UI
2. Implement vote counting by category
3. Add two-day rule logic and warnings
4. Create implementation intention input
5. Add identity reinforcement messages

### Phase 4: Advanced Analytics (Week 7-8)

**Goal**: Compound growth, patterns, correlations

**API Endpoints**:
- `analytics.getCompoundGrowth`
- `analytics.getCompletionPatterns`
- `analytics.getHabitCorrelations`

**UI Components**:
- `CompoundGrowthChart`
- `LifeBalanceRadar`
- `StreakTimeline`
- Analytics page

**Tasks**:
1. Implement compound growth calculation
2. Build pattern analysis queries
3. Create correlation matrix logic
4. Build advanced chart components
5. Design analytics page layout

### Phase 5: Gamification & Engagement (Week 9-10)

**Goal**: Achievements, XP, celebrations

**Database Changes**:
- Add `Achievement` model
- Add XP/level fields to `UserStats`

**API Endpoints**:
- `achievement.getAll`
- `achievement.checkAndAward`
- `achievement.markCelebrated`

**UI Components**:
- `AchievementBadge`
- `AchievementCelebration`
- `AchievementProgress`
- XP/Level display

**Tasks**:
1. Define all achievement types and conditions
2. Build achievement checking logic
3. Create celebration animations (confetti)
4. Build achievement showcase UI
5. Implement XP calculation and leveling

### Phase 6: Polish & Optimization (Week 11-12)

**Goal**: Performance, mobile optimization, edge cases

**Tasks**:
1. Add caching layer for computed stats
2. Optimize database queries with proper indexes
3. Mobile-responsive dashboard
4. Empty state designs
5. Error handling and loading states
6. User onboarding flow for new features
7. Documentation

---

## UX Considerations

### Progressive Disclosure

**Problem**: Too many metrics can overwhelm users.

**Solution**:
- Default dashboard shows only: daily score, active streaks, recent achievement
- "Show more" expands to weekly trend
- Full analytics on separate page
- New users see simplified view until they have 7+ days of data

### Empty States

| State | Message | Action |
|-------|---------|--------|
| No habits | "Start your journey with your first habit" | Create habit CTA |
| No completions today | "Your habits are waiting for you" | List today's habits |
| No streaks yet | "Complete a habit 2 days in a row to start a streak" | Explain streaks |
| New user, no data | "Let's track your first week!" | Onboarding guide |

### Motivation vs Guilt

**Principle**: Celebrate progress, don't shame failure.

**Do**:
- "You've completed 85% this week - amazing!"
- "Every completion is a vote for your new identity"
- "You recovered your streak - resilience is key!"

**Don't**:
- "You missed 3 habits today"
- "Your streak is broken"
- "You're behind your goal"

### Mobile Experience

- Dashboard cards stack vertically
- Heatmap scrolls horizontally for year view
- Charts simplify (fewer data points, larger touch targets)
- Swipe gestures for week navigation
- Pull-to-refresh for stats

### Notifications (Future)

**Smart Timing**:
- Learn when user typically completes habits
- Remind 30 min before typical time
- "Don't break the chain" warning if at-risk habit not done by evening

**Celebration Moments**:
- Push notification for new achievements
- Weekly summary digest

---

## Performance Considerations

### Database Optimization

**Indexes** (already in schema):
```prisma
@@index([userId])           // Fast habit lookup by user
@@index([habitId])          // Fast completion lookup by habit
@@index([date])             // Fast date range queries
@@index([weekStartDate])    // Fast weekly stat lookup
```

**Denormalization**:
- `HabitStreak.currentStreak` - Avoid recalculating on every read
- `HabitStreak.totalCompletions` - Avoid COUNT(*) queries
- `UserStats.totalCompletions` - Aggregate for quick display

### Caching Strategy

**React Query Settings** (already configured):
```typescript
staleTime: 30 * 1000,        // 30 seconds
gcTime: 5 * 60 * 1000,       // 5 minutes
```

**Invalidation Triggers**:
- Toggle completion → invalidate: streaks, daily stats, weekly stats
- Create/delete habit → invalidate: all stats
- Weekly stat calculation → cache for 24 hours

### Computed Stats Calculation

**Real-time** (on every read):
- Daily completion rate
- Today's score
- At-risk habits

**On-demand** (triggered by mutations):
- Current streak (update on toggle)
- Longest streak (update on toggle)
- Total completions (increment/decrement)

**Scheduled** (cron or lazy):
- Weekly stats (calculate end of week or on first view)
- Achievement checks (after completion toggle)
- Compound growth data (calculate daily or on view)

### Query Optimization

**Batch Queries**:
```typescript
// Instead of N+1 queries for streaks
const habitsWithStreaks = await db.habit.findMany({
  where: { userId },
  include: { streakData: true, completions: { where: { date: { gte: thirtyDaysAgo } } } }
});
```

**Pagination**:
- Heatmap: Load current year, lazy-load previous years
- Weekly stats: Load 12 weeks, pagination for history
- Achievements: Show recent 10, "View all" for full list

### Bundle Size

**Code Splitting**:
- Dashboard page: lazy load
- Analytics page: lazy load
- Chart libraries: dynamic import

```typescript
const ContributionHeatmap = dynamic(
  () => import('@/components/analytics/contribution-heatmap'),
  { loading: () => <Skeleton className="h-40" /> }
);
```

---

## Summary

This plan transforms the Habit Tracker into a comprehensive Atomic Habits-based system with:

- **5 new database models** (HabitStreak, UserStats, WeeklyStat, Achievement, UserIdentity)
- **4 new tRPC routers** (stats, streak, achievement, analytics)
- **14+ new UI components** organized by function
- **8 core metrics** with defined calculation formulas
- **5 implementation phases** over ~12 weeks
- **Clear UX guidelines** for progressive disclosure and motivation

The phased approach ensures:
1. Early value delivery (streaks in Phase 1)
2. Building blocks for advanced features
3. Performance considerations from the start
4. Mobile-first responsive design

Next step: Review and approve this plan, then begin Phase 1 implementation.

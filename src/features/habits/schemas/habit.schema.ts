import { z } from "zod";

// Day of week constants
export const DAYS_OF_WEEK = [
  { value: 1, label: "Mon", fullLabel: "Monday" },
  { value: 2, label: "Tue", fullLabel: "Tuesday" },
  { value: 3, label: "Wed", fullLabel: "Wednesday" },
  { value: 4, label: "Thu", fullLabel: "Thursday" },
  { value: 5, label: "Fri", fullLabel: "Friday" },
  { value: 6, label: "Sat", fullLabel: "Saturday" },
  { value: 0, label: "Sun", fullLabel: "Sunday" },
] as const;

// Habit categories (matching Prisma enum)
export const HABIT_CATEGORIES = [
  { value: "HEALTH", label: "Health", emoji: "💚" },
  { value: "FITNESS", label: "Fitness", emoji: "💪" },
  { value: "LEARNING", label: "Learning", emoji: "📚" },
  { value: "PRODUCTIVITY", label: "Productivity", emoji: "⚡" },
  { value: "MINDFULNESS", label: "Mindfulness", emoji: "🧘" },
  { value: "SOCIAL", label: "Social", emoji: "👥" },
  { value: "CREATIVE", label: "Creative", emoji: "🎨" },
  { value: "FINANCIAL", label: "Financial", emoji: "💰" },
  { value: "OTHER", label: "Other", emoji: "✨" },
] as const;

export const habitCategorySchema = z.enum([
  "HEALTH",
  "FITNESS",
  "LEARNING",
  "PRODUCTIVITY",
  "MINDFULNESS",
  "SOCIAL",
  "CREATIVE",
  "FINANCIAL",
  "OTHER",
]);

// Base schemas
export const habitNameSchema = z
  .string()
  .min(1, "Habit name is required")
  .max(100, "Habit name must be 100 characters or less");

export const frequencySchema = z
  .number()
  .min(1, "Frequency must be at least 1")
  .max(7, "Frequency cannot exceed 7");

export const activeDaysSchema = z
  .array(z.number().min(0).max(6))
  .min(1, "Select at least one active day");

// Create habit schema
export const createHabitSchema = z
  .object({
    name: habitNameSchema,
    frequencyPerWeek: frequencySchema,
    activeDays: activeDaysSchema,
    category: habitCategorySchema.optional(),
    emoji: z.string().max(4).optional(),
  })
  .refine((data) => data.frequencyPerWeek <= data.activeDays.length, {
    message: "Frequency cannot exceed number of active days",
    path: ["frequencyPerWeek"],
  });

// Update habit schema
export const updateHabitSchema = z
  .object({
    id: z.string(),
    name: habitNameSchema.optional(),
    frequencyPerWeek: frequencySchema.optional(),
    activeDays: activeDaysSchema.optional(),
    category: habitCategorySchema.optional().nullable(),
    emoji: z.string().max(4).optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.frequencyPerWeek && data.activeDays) {
        return data.frequencyPerWeek <= data.activeDays.length;
      }
      return true;
    },
    {
      message: "Frequency cannot exceed number of active days",
      path: ["frequencyPerWeek"],
    },
  );

// Delete habit schema
export const deleteHabitSchema = z.object({
  id: z.string(),
});

// Toggle completion schema
export const toggleCompletionSchema = z.object({
  habitId: z.string(),
  date: z.date(),
});

// Date range schema
export const dateRangeSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
});

// Type exports
export type HabitCategory = z.infer<typeof habitCategorySchema>;
export type CreateHabitInput = z.infer<typeof createHabitSchema>;
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;
export type DeleteHabitInput = z.infer<typeof deleteHabitSchema>;
export type ToggleCompletionInput = z.infer<typeof toggleCompletionSchema>;
export type DateRangeInput = z.infer<typeof dateRangeSchema>;

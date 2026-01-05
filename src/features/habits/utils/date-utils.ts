// Re-export date utilities from lib/utils for feature-based imports
// This allows feature modules to import from their own utils folder
export {
  getWeekStart,
  getWeekEnd,
  getWeekDates,
  formatDayShort,
  formatWeekRange,
  isSameDay,
  getDayOfWeek,
} from "~/lib/utils";

// Additional habit-specific date utilities

/**
 * Check if a day is active for a habit (client-side, uses local timezone)
 * @param activeDays - Array of active day numbers (0=Sunday, 1=Monday, etc.)
 * @param date - The date to check (local date)
 */
export function isActiveDay(activeDays: number[], date: Date): boolean {
  return activeDays.includes(date.getDay());
}

/**
 * Check if a day is active for a habit (server-side, uses UTC)
 * Use this when working with UTC midnight dates (e.g., in streak calculations)
 * @param activeDays - Array of active day numbers (0=Sunday, 1=Monday, etc.)
 * @param date - The date to check (UTC midnight date)
 */
export function isActiveDayUTC(activeDays: number[], date: Date): boolean {
  return activeDays.includes(date.getUTCDay());
}

/**
 * Get the number of active days in a week for a habit
 * @param activeDays - Array of active day numbers
 */
export function countActiveDays(activeDays: number[]): number {
  return activeDays.length;
}

/**
 * Check if a date is today
 * @param date - The date to check
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

/**
 * Check if a date is in the past
 * @param date - The date to check
 */
export function isPastDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
}

/**
 * Check if a date is in the future
 * @param date - The date to check
 */
export function isFutureDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate > today;
}

/**
 * Format a date for display in the table header
 * @param date - The date to format
 * @returns Formatted string like "Mon 1"
 */
export function formatTableHeader(date: Date): { day: string; date: number } {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return {
    day: days[date.getDay()] ?? "",
    date: date.getDate(),
  };
}

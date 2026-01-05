"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { api } from "~/trpc/react";
import {
  getWeekStart,
  getWeekEnd,
  getWeekDates,
  formatWeekRange,
  isSameDay,
} from "~/lib/utils";

export function useWeekNavigation() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const utils = api.useUtils();

  // Memoized week calculations
  const weekStart = useMemo(() => getWeekStart(currentDate), [currentDate]);
  const weekEnd = useMemo(() => getWeekEnd(currentDate), [currentDate]);
  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);
  const weekLabel = useMemo(
    () => formatWeekRange(weekStart, weekEnd),
    [weekStart, weekEnd],
  );

  // Check if viewing current week
  const isCurrentWeek = useMemo(
    () => isSameDay(weekStart, getWeekStart(new Date())),
    [weekStart],
  );

  // Prefetch a week's data
  const prefetchWeek = useCallback(
    (date: Date) => {
      const start = getWeekStart(date);
      const end = getWeekEnd(date);
      void utils.completion.getByDateRange.prefetch({
        startDate: start,
        endDate: end,
      });
    },
    [utils],
  );

  // Prefetch adjacent weeks on mount and when current week changes
  useEffect(() => {
    // Prefetch next week
    const nextWeekDate = new Date(currentDate);
    nextWeekDate.setDate(nextWeekDate.getDate() + 7);
    prefetchWeek(nextWeekDate);

    // Prefetch previous week
    const prevWeekDate = new Date(currentDate);
    prevWeekDate.setDate(prevWeekDate.getDate() - 7);
    prefetchWeek(prevWeekDate);
  }, [currentDate, prefetchWeek]);

  // Navigation handlers
  const goToPreviousWeek = useCallback(() => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 7);
      return newDate;
    });
  }, []);

  const goToNextWeek = useCallback(() => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
  }, []);

  const goToCurrentWeek = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const goToDate = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  // Prefetch on hover for instant navigation
  const onPreviousHover = useCallback(() => {
    const prevWeekDate = new Date(currentDate);
    prevWeekDate.setDate(prevWeekDate.getDate() - 7);
    prefetchWeek(prevWeekDate);
  }, [currentDate, prefetchWeek]);

  const onNextHover = useCallback(() => {
    const nextWeekDate = new Date(currentDate);
    nextWeekDate.setDate(nextWeekDate.getDate() + 7);
    prefetchWeek(nextWeekDate);
  }, [currentDate, prefetchWeek]);

  return {
    // Current state
    currentDate,
    weekStart,
    weekEnd,
    weekDates,
    weekLabel,
    isCurrentWeek,

    // Navigation
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    goToDate,

    // Prefetch handlers (for onMouseEnter)
    onPreviousHover,
    onNextHover,
    prefetchWeek,
  };
}

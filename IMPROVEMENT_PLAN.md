# Habit Tracker Codebase Improvement Plan

> **Status**: Draft - Awaiting Approval
> **Created**: January 2026
> **Goal**: Refactor codebase to follow 2025 best practices for Next.js 15+, TypeScript, Tailwind CSS, tRPC, and shadcn/ui

---

## Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [Proposed Project Structure](#2-proposed-project-structure)
3. [Component Architecture & shadcn/ui](#3-component-architecture--shadcnui)
4. [State Management & Data Fetching](#4-state-management--data-fetching)
5. [TypeScript Best Practices](#5-typescript-best-practices)
6. [Tailwind CSS & Styling](#6-tailwind-css--styling)
7. [Custom Hooks Architecture](#7-custom-hooks-architecture)
8. [Error Handling Strategy](#8-error-handling-strategy)
9. [Performance Optimizations](#9-performance-optimizations)
10. [Code Quality Tooling](#10-code-quality-tooling)
11. [File-by-File Migration Plan](#11-file-by-file-migration-plan)
12. [Implementation Order](#12-implementation-order)

---

## 1. Current State Analysis

### What Exists Now

#### Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── api/trpc/[trpc]/   # tRPC handler
│   ├── auth/callback/      # OAuth callback
│   ├── login/              # Login page
│   ├── register/           # Register page
│   └── page.tsx            # Dashboard (protected)
├── components/
│   ├── auth/               # Login/Register forms
│   ├── habits/             # HabitTable, CreateHabitDialog
│   ├── layout/             # Header
│   └── ui/                 # shadcn components
├── lib/
│   ├── supabase/           # Client/Server/Middleware
│   └── utils.ts            # Date utils + cn()
├── server/api/
│   ├── routers/            # habit.ts, completion.ts
│   ├── root.ts             # Combined router
│   ├── trpc.ts             # Context & procedures
│   └── db.ts               # Prisma client
├── trpc/                   # Client-side tRPC setup
├── styles/globals.css      # Tailwind + CSS variables
├── middleware.ts           # Auth middleware
└── env.js                  # Environment validation
```

#### Current Patterns

| Area | Current Implementation | Issues |
|------|----------------------|--------|
| **Forms** | Manual `useState` for each field | Verbose, no schema validation, no react-hook-form |
| **Error Handling** | Inline error state, browser `alert()` | No toast notifications, inconsistent UX |
| **Confirmations** | Browser `confirm()` | Not customizable, breaks design consistency |
| **Loading States** | `isPending` boolean checks | No skeleton loaders, jarring UX |
| **Data Fetching** | Direct `refetch()` calls | No optimistic updates, no prefetching |
| **Types** | Zod in routers only | No shared schemas, types scattered |
| **Hooks** | No custom hooks | Logic duplicated, not reusable |
| **State** | Local component state | No abstraction for common patterns |

#### Strengths to Preserve
- Clean tRPC router separation
- Proper authentication middleware
- Supabase integration working
- Database schema well-designed
- shadcn/ui components installed
- TypeScript strict mode enabled

---

## 2. Proposed Project Structure

### New Feature-Based Structure

```
src/
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Auth route group (public)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx                # Auth layout (centered card)
│   ├── (dashboard)/                  # Dashboard route group (protected)
│   │   ├── page.tsx                  # Main habit tracker
│   │   ├── settings/
│   │   │   └── page.tsx              # Future: user settings
│   │   └── layout.tsx                # Dashboard layout with header
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts              # OAuth callback handler
│   ├── api/
│   │   └── trpc/
│   │       └── [trpc]/
│   │           └── route.ts
│   ├── layout.tsx                    # Root layout
│   ├── error.tsx                     # Global error boundary
│   ├── loading.tsx                   # Global loading state
│   └── not-found.tsx                 # 404 page
│
├── features/                         # Feature modules
│   ├── auth/
│   │   ├── components/
│   │   │   ├── login-form.tsx
│   │   │   ├── register-form.tsx
│   │   │   └── logout-button.tsx
│   │   ├── hooks/
│   │   │   └── use-auth.ts
│   │   ├── schemas/
│   │   │   └── auth.schema.ts        # Zod schemas for forms
│   │   └── types.ts
│   │
│   └── habits/
│       ├── components/
│       │   ├── habit-table/
│       │   │   ├── habit-table.tsx
│       │   │   ├── habit-row.tsx
│       │   │   ├── day-cell.tsx
│       │   │   ├── week-header.tsx
│       │   │   └── index.ts          # Barrel export
│       │   ├── create-habit-dialog.tsx
│       │   ├── edit-habit-dialog.tsx
│       │   ├── delete-habit-dialog.tsx
│       │   └── habit-actions-menu.tsx
│       ├── hooks/
│       │   ├── use-habits.ts
│       │   ├── use-completions.ts
│       │   └── use-week-navigation.ts
│       ├── schemas/
│       │   └── habit.schema.ts       # Shared Zod schemas
│       ├── utils/
│       │   └── date-utils.ts         # Feature-specific utils
│       └── types.ts
│
├── components/                       # Shared components
│   ├── ui/                           # shadcn/ui (auto-generated)
│   │   ├── alert-dialog.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── checkbox.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── skeleton.tsx
│   │   ├── sonner.tsx                # Toast notifications
│   │   ├── table.tsx
│   │   └── tooltip.tsx
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── container.tsx
│   └── shared/
│       ├── error-boundary.tsx
│       ├── loading-spinner.tsx
│       └── confirm-dialog.tsx        # Reusable confirmation
│
├── server/                           # Server-side code
│   ├── api/
│   │   ├── routers/
│   │   │   ├── habit.ts
│   │   │   ├── completion.ts
│   │   │   └── index.ts              # Barrel export
│   │   ├── root.ts
│   │   └── trpc.ts
│   └── db/
│       ├── index.ts                  # Prisma client
│       └── seed.ts                   # Optional: seed data
│
├── lib/                              # Core utilities
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── utils.ts                      # cn() and shared utilities
│   └── constants.ts                  # App-wide constants
│
├── hooks/                            # Global hooks
│   ├── use-media-query.ts
│   └── use-debounce.ts
│
├── types/                            # Global types
│   ├── index.ts
│   └── database.ts                   # Re-exported Prisma types
│
├── styles/
│   └── globals.css
│
├── middleware.ts
└── env.js
```

### Key Structural Changes

| Change | Rationale |
|--------|-----------|
| Route groups `(auth)` and `(dashboard)` | Separate layouts without URL prefix |
| `features/` directory | Co-locate related code, improve discoverability |
| Feature-specific `hooks/` | Encapsulate business logic |
| Feature-specific `schemas/` | Share Zod schemas between client/server |
| `components/shared/` | Reusable non-UI components |
| Barrel exports (`index.ts`) | Cleaner imports |
| `server/db/` directory | Room for seeds, migrations utils |

---

## 3. Component Architecture & shadcn/ui

### Components to Add

```bash
npx shadcn@latest add alert-dialog dropdown-menu skeleton sonner tooltip
```

### Replacement Plan

| Current | Replace With | Component |
|---------|-------------|-----------|
| `alert("...")` | Toast notification | `<Sonner>` via `toast()` |
| `confirm("...")` | Confirmation dialog | `<AlertDialog>` |
| Manual loading text | Skeleton loaders | `<Skeleton>` |
| Delete button inline | Actions dropdown | `<DropdownMenu>` |
| No tooltips | Helpful hints | `<Tooltip>` |
| Manual form state | Form library | `<Form>` + react-hook-form |

### Component Patterns to Implement

#### 1. Delete Confirmation Dialog
```tsx
// features/habits/components/delete-habit-dialog.tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";

interface DeleteHabitDialogProps {
  habitId: string;
  habitName: string;
  onDelete: () => void;
  trigger: React.ReactNode;
}

export function DeleteHabitDialog({
  habitId,
  habitName,
  onDelete,
  trigger,
}: DeleteHabitDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete "{habitName}"?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this
            habit and all its completion history.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

#### 2. Toast Notifications Setup
```tsx
// app/layout.tsx - Add Sonner provider
import { Toaster } from "~/components/ui/sonner";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}

// Usage in components
import { toast } from "sonner";

// Success
toast.success("Habit created successfully");

// Error
toast.error("Failed to update habit", {
  description: error.message,
});

// With action
toast("Habit deleted", {
  action: {
    label: "Undo",
    onClick: () => handleUndo(),
  },
});
```

#### 3. Form with react-hook-form + Zod
```tsx
// features/habits/components/create-habit-dialog.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createHabitSchema, type CreateHabitInput } from "../schemas/habit.schema";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";

export function CreateHabitDialog({ onSuccess }: Props) {
  const form = useForm<CreateHabitInput>({
    resolver: zodResolver(createHabitSchema),
    defaultValues: {
      name: "",
      frequencyPerWeek: 3,
      activeDays: [1, 2, 3, 4, 5], // Mon-Fri
    },
  });

  const createHabit = api.habit.create.useMutation({
    onSuccess: () => {
      toast.success("Habit created!");
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Failed to create habit", { description: error.message });
    },
  });

  const onSubmit = (data: CreateHabitInput) => {
    createHabit.mutate(data);
  };

  return (
    <Dialog>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Habit Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Exercise" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* More fields... */}
            <Button type="submit" disabled={createHabit.isPending}>
              {createHabit.isPending ? "Creating..." : "Create Habit"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

#### 4. Skeleton Loading States
```tsx
// features/habits/components/habit-table/habit-table-skeleton.tsx
import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export function HabitTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-9 w-16" />
        </div>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">
                <Skeleton className="h-4 w-16" />
              </TableHead>
              {Array.from({ length: 7 }).map((_, i) => (
                <TableHead key={i} className="w-[80px]">
                  <Skeleton className="mx-auto h-4 w-10" />
                </TableHead>
              ))}
              <TableHead className="w-[80px]">
                <Skeleton className="mx-auto h-4 w-10" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                {Array.from({ length: 7 }).map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="mx-auto h-4 w-4 rounded" />
                  </TableCell>
                ))}
                <TableCell>
                  <Skeleton className="mx-auto h-4 w-8" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
```

#### 5. Actions Dropdown Menu
```tsx
// features/habits/components/habit-actions-menu.tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

interface HabitActionsMenuProps {
  habitId: string;
  habitName: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function HabitActionsMenu({
  habitId,
  habitName,
  onEdit,
  onDelete,
}: HabitActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

## 4. State Management & Data Fetching

### Optimistic Updates Implementation

```tsx
// features/habits/hooks/use-completions.ts
import { api } from "~/trpc/react";
import { toast } from "sonner";

export function useCompletions(startDate: Date, endDate: Date) {
  const utils = api.useUtils();

  const query = api.completion.getByDateRange.useQuery({
    startDate,
    endDate,
  });

  const toggleMutation = api.completion.toggle.useMutation({
    onMutate: async ({ habitId, date }) => {
      // Cancel outgoing refetches
      await utils.completion.getByDateRange.cancel({ startDate, endDate });

      // Snapshot previous value
      const previousData = utils.completion.getByDateRange.getData({
        startDate,
        endDate,
      });

      // Optimistically update
      utils.completion.getByDateRange.setData(
        { startDate, endDate },
        (old) => {
          if (!old) return old;
          return old.map((habit) => {
            if (habit.id !== habitId) return habit;

            const existingCompletion = habit.completions.find(
              (c) => isSameDay(new Date(c.date), date)
            );

            if (existingCompletion) {
              // Remove completion (optimistic uncomplete)
              return {
                ...habit,
                completions: habit.completions.filter(
                  (c) => !isSameDay(new Date(c.date), date)
                ),
              };
            } else {
              // Add completion (optimistic complete)
              return {
                ...habit,
                completions: [
                  ...habit.completions,
                  {
                    id: `temp-${Date.now()}`,
                    habitId,
                    date,
                    completed: true,
                    createdAt: new Date(),
                  },
                ],
              };
            }
          });
        }
      );

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        utils.completion.getByDateRange.setData(
          { startDate, endDate },
          context.previousData
        );
      }
      toast.error("Failed to update habit");
    },
    onSettled: () => {
      // Refetch to ensure consistency
      void utils.completion.getByDateRange.invalidate({ startDate, endDate });
    },
  });

  return {
    habits: query.data,
    isLoading: query.isLoading,
    error: query.error,
    toggle: toggleMutation.mutate,
    isToggling: toggleMutation.isPending,
  };
}
```

### Prefetching for Week Navigation

```tsx
// features/habits/hooks/use-week-navigation.ts
import { useState, useMemo, useCallback, useEffect } from "react";
import { api } from "~/trpc/react";
import { getWeekStart, getWeekEnd, getWeekDates } from "../utils/date-utils";

export function useWeekNavigation() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const utils = api.useUtils();

  const weekStart = useMemo(() => getWeekStart(currentDate), [currentDate]);
  const weekEnd = useMemo(() => getWeekEnd(currentDate), [currentDate]);
  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);

  // Prefetch adjacent weeks on hover or after initial load
  const prefetchWeek = useCallback(
    (date: Date) => {
      const start = getWeekStart(date);
      const end = getWeekEnd(date);
      void utils.completion.getByDateRange.prefetch({ startDate: start, endDate: end });
    },
    [utils]
  );

  // Prefetch next and previous weeks on mount
  useEffect(() => {
    const nextWeekDate = new Date(currentDate);
    nextWeekDate.setDate(nextWeekDate.getDate() + 7);

    const prevWeekDate = new Date(currentDate);
    prevWeekDate.setDate(prevWeekDate.getDate() - 7);

    prefetchWeek(nextWeekDate);
    prefetchWeek(prevWeekDate);
  }, [currentDate, prefetchWeek]);

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

  const isCurrentWeek = useMemo(
    () => isSameDay(weekStart, getWeekStart(new Date())),
    [weekStart]
  );

  return {
    currentDate,
    weekStart,
    weekEnd,
    weekDates,
    isCurrentWeek,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    prefetchWeek,
  };
}
```

### Query Configuration

```tsx
// src/trpc/query-client.ts
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000, // 30 seconds
        gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
```

---

## 5. TypeScript Best Practices

### Shared Zod Schemas

```tsx
// features/habits/schemas/habit.schema.ts
import { z } from "zod";

// Day of week constants
export const DAYS_OF_WEEK = [
  { value: 0, label: "Sun", fullLabel: "Sunday" },
  { value: 1, label: "Mon", fullLabel: "Monday" },
  { value: 2, label: "Tue", fullLabel: "Tuesday" },
  { value: 3, label: "Wed", fullLabel: "Wednesday" },
  { value: 4, label: "Thu", fullLabel: "Thursday" },
  { value: 5, label: "Fri", fullLabel: "Friday" },
  { value: 6, label: "Sat", fullLabel: "Saturday" },
] as const;

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
  })
  .refine(
    (data) => data.frequencyPerWeek <= data.activeDays.length,
    {
      message: "Frequency cannot exceed number of active days",
      path: ["frequencyPerWeek"],
    }
  );

// Update habit schema
export const updateHabitSchema = z
  .object({
    id: z.string(),
    name: habitNameSchema.optional(),
    frequencyPerWeek: frequencySchema.optional(),
    activeDays: activeDaysSchema.optional(),
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
    }
  );

// Type exports
export type CreateHabitInput = z.infer<typeof createHabitSchema>;
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;
```

### Proper tRPC Error Types

```tsx
// server/api/routers/habit.ts
import { TRPCError } from "@trpc/server";

export const habitRouter = createTRPCRouter({
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const habit = await ctx.db.habit.findFirst({
        where: {
          id: input.id,
          userId: ctx.dbUser.id,
        },
      });

      if (!habit) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Habit not found or you don't have permission to delete it",
        });
      }

      return ctx.db.habit.delete({
        where: { id: input.id },
      });
    }),
});
```

### Global Types

```tsx
// types/index.ts
import type { Habit, HabitCompletion, User } from "~/generated/prisma";

// Re-export Prisma types with convenience aliases
export type { Habit, HabitCompletion, User };

// Habit with completions (common query result)
export type HabitWithCompletions = Habit & {
  completions: HabitCompletion[];
};

// Form state union type
export type FormStatus = "idle" | "submitting" | "success" | "error";

// API response wrapper (if needed)
export interface ApiResponse<T> {
  data: T;
  message?: string;
}
```

---

## 6. Tailwind CSS & Styling

### Color Token Improvements

```css
/* styles/globals.css - Add semantic tokens */
:root {
  /* Existing tokens... */

  /* Semantic tokens */
  --success: oklch(0.6 0.15 145);
  --success-foreground: oklch(0.98 0 0);
  --warning: oklch(0.75 0.15 85);
  --warning-foreground: oklch(0.2 0 0);
  --info: oklch(0.6 0.15 250);
  --info-foreground: oklch(0.98 0 0);
}

.dark {
  --success: oklch(0.55 0.15 145);
  --warning: oklch(0.7 0.15 85);
  --info: oklch(0.55 0.15 250);
}

@theme inline {
  /* Add to existing theme */
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
  --color-info: var(--info);
  --color-info-foreground: var(--info-foreground);
}
```

### Component Styling Patterns

```tsx
// Consistent use of cn() for conditional classes
import { cn } from "~/lib/utils";

// Pattern: Variant-based styling
interface DayCellProps {
  isActive: boolean;
  isCompleted: boolean;
  isToday: boolean;
}

function DayCell({ isActive, isCompleted, isToday }: DayCellProps) {
  return (
    <div
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
        {
          "bg-muted text-muted-foreground": !isActive,
          "bg-primary text-primary-foreground": isCompleted,
          "ring-2 ring-primary ring-offset-2": isToday,
          "hover:bg-accent": isActive && !isCompleted,
        }
      )}
    >
      {/* content */}
    </div>
  );
}
```

### Animation Classes

```tsx
// Add to components that need animations
className="transition-all duration-200 ease-in-out"

// For checkboxes
className="transition-transform duration-150 data-[state=checked]:scale-100 scale-95"

// For dialogs (already handled by shadcn)
// For loading states
className="animate-pulse"
```

---

## 7. Custom Hooks Architecture

### Hooks to Create

#### 1. useAuth Hook
```tsx
// features/auth/hooks/use-auth.ts
import { useRouter } from "next/navigation";
import { createClient } from "~/lib/supabase/client";
import { toast } from "sonner";

export function useAuth() {
  const router = useRouter();
  const supabase = createClient();

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out");
      return;
    }
    router.push("/login");
    router.refresh();
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw error;
    }
    router.push("/");
    router.refresh();
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      throw error;
    }
    return { success: true };
  };

  return {
    signIn,
    signUp,
    signOut,
  };
}
```

#### 2. useHabits Hook
```tsx
// features/habits/hooks/use-habits.ts
import { api } from "~/trpc/react";
import { toast } from "sonner";

export function useHabits() {
  const utils = api.useUtils();

  const habitsQuery = api.habit.getAll.useQuery();

  const createMutation = api.habit.create.useMutation({
    onSuccess: () => {
      toast.success("Habit created successfully");
      void utils.habit.getAll.invalidate();
      void utils.completion.getByDateRange.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to create habit", { description: error.message });
    },
  });

  const updateMutation = api.habit.update.useMutation({
    onSuccess: () => {
      toast.success("Habit updated");
      void utils.habit.getAll.invalidate();
      void utils.completion.getByDateRange.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to update habit", { description: error.message });
    },
  });

  const deleteMutation = api.habit.delete.useMutation({
    onSuccess: () => {
      toast.success("Habit deleted");
      void utils.habit.getAll.invalidate();
      void utils.completion.getByDateRange.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to delete habit", { description: error.message });
    },
  });

  return {
    habits: habitsQuery.data ?? [],
    isLoading: habitsQuery.isLoading,
    error: habitsQuery.error,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
```

#### 3. useMediaQuery Hook
```tsx
// hooks/use-media-query.ts
import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

// Usage
const isMobile = useMediaQuery("(max-width: 768px)");
```

#### 4. useDebounce Hook
```tsx
// hooks/use-debounce.ts
import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

---

## 8. Error Handling Strategy

### Global Error Boundary

```tsx
// app/error.tsx
"use client";

import { useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-destructive">Something went wrong</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            An unexpected error occurred. Please try again or contact support if
            the problem persists.
          </p>
          {process.env.NODE_ENV === "development" && (
            <pre className="mt-4 rounded bg-muted p-4 text-xs overflow-auto">
              {error.message}
            </pre>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" onClick={() => window.location.href = "/"}>
            Go home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
```

### tRPC Error Middleware

```tsx
// server/api/trpc.ts - Enhanced error formatting
errorFormatter({ shape, error }) {
  return {
    ...shape,
    data: {
      ...shape.data,
      zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      code: error.code,
      httpStatus: getHTTPStatusCodeFromError(error),
    },
  };
},
```

### Client-Side Error Handling Pattern

```tsx
// Standard error handling in mutations
const mutation = api.habit.create.useMutation({
  onError: (error) => {
    // Check for specific error types
    if (error.data?.zodError) {
      // Form validation error - show field-specific errors
      const fieldErrors = error.data.zodError.fieldErrors;
      Object.entries(fieldErrors).forEach(([field, errors]) => {
        toast.error(`${field}: ${errors?.join(", ")}`);
      });
    } else if (error.data?.code === "UNAUTHORIZED") {
      // Auth error - redirect to login
      toast.error("Please sign in to continue");
      router.push("/login");
    } else {
      // Generic error
      toast.error("Something went wrong", {
        description: error.message,
      });
    }
  },
});
```

---

## 9. Performance Optimizations

### Server vs Client Components

| Component | Type | Rationale |
|-----------|------|-----------|
| `page.tsx` files | Server | Data fetching, SEO |
| `layout.tsx` files | Server | Static shell |
| `Header` | Client | User interaction (logout) |
| `HabitTable` | Client | Interactive, mutations |
| `CreateHabitDialog` | Client | Form state |
| `LoginForm` | Client | Form state |
| Skeleton components | Server | Static UI |

### Memoization Strategy

```tsx
// Memoize expensive calculations
const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);

// Memoize callbacks passed to children
const handleToggle = useCallback(
  (habitId: string, date: Date) => {
    toggle({ habitId, date });
  },
  [toggle]
);

// Memoize child components that receive callbacks
const MemoizedDayCell = React.memo(DayCell);
```

### Dynamic Imports

```tsx
// Lazy load dialogs
const CreateHabitDialog = dynamic(
  () => import("~/features/habits/components/create-habit-dialog"),
  { loading: () => <Button disabled>Add Habit</Button> }
);
```

---

## 10. Code Quality Tooling

### ESLint Configuration Updates

```js
// eslint.config.js additions
{
  rules: {
    // Enforce consistent imports
    "import/order": ["error", {
      "groups": ["builtin", "external", "internal", "parent", "sibling"],
      "newlines-between": "always",
      "alphabetize": { "order": "asc" }
    }],

    // Enforce explicit return types on exported functions
    "@typescript-eslint/explicit-module-boundary-types": "warn",

    // Warn on any type
    "@typescript-eslint/no-explicit-any": "warn",

    // Enforce consistent type imports
    "@typescript-eslint/consistent-type-imports": ["error", {
      "prefer": "type-imports"
    }],
  }
}
```

### Pre-commit Hooks (Husky + lint-staged)

```json
// package.json additions
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,css}": [
      "prettier --write"
    ]
  }
}
```

---

## 11. File-by-File Migration Plan

### Phase 1: Infrastructure (No Breaking Changes)

| Action | File | Changes |
|--------|------|---------|
| Add | `src/features/habits/schemas/habit.schema.ts` | Create shared Zod schemas |
| Add | `src/features/auth/schemas/auth.schema.ts` | Create auth schemas |
| Add | `src/types/index.ts` | Create global types |
| Add | `src/hooks/use-media-query.ts` | Create hook |
| Add | `src/hooks/use-debounce.ts` | Create hook |
| Install | - | `npx shadcn@latest add alert-dialog dropdown-menu skeleton sonner tooltip` |
| Modify | `src/app/layout.tsx` | Add `<Toaster />` |

### Phase 2: Custom Hooks

| Action | File | Changes |
|--------|------|---------|
| Add | `src/features/auth/hooks/use-auth.ts` | Create auth hook |
| Add | `src/features/habits/hooks/use-habits.ts` | Create habits hook |
| Add | `src/features/habits/hooks/use-completions.ts` | Create with optimistic updates |
| Add | `src/features/habits/hooks/use-week-navigation.ts` | Create with prefetching |
| Move | `src/lib/utils.ts` date functions | To `src/features/habits/utils/date-utils.ts` |

### Phase 3: Component Refactoring

| Action | File | Changes |
|--------|------|---------|
| Create | `src/features/habits/components/delete-habit-dialog.tsx` | AlertDialog for delete confirmation |
| Refactor | `src/components/habits/create-habit-dialog.tsx` | Use react-hook-form + schema |
| Refactor | `src/components/habits/habit-table.tsx` | Use custom hooks, split into smaller components |
| Create | `src/features/habits/components/habit-table/habit-row.tsx` | Extract row component |
| Create | `src/features/habits/components/habit-table/day-cell.tsx` | Extract cell component |
| Create | `src/features/habits/components/habit-actions-menu.tsx` | DropdownMenu for actions |
| Create | `src/features/habits/components/habit-table-skeleton.tsx` | Loading skeleton |
| Refactor | `src/components/auth/login-form.tsx` | Use react-hook-form + useAuth |
| Refactor | `src/components/auth/register-form.tsx` | Use react-hook-form + useAuth |

### Phase 4: Directory Restructure

| Action | From | To |
|--------|------|-----|
| Move | `src/components/auth/*` | `src/features/auth/components/*` |
| Move | `src/components/habits/*` | `src/features/habits/components/*` |
| Move | `src/components/layout/header.tsx` | Keep, use auth hook |
| Create | `src/app/(auth)/layout.tsx` | Auth pages layout |
| Create | `src/app/(dashboard)/layout.tsx` | Dashboard layout with header |
| Move | `src/app/login/page.tsx` | `src/app/(auth)/login/page.tsx` |
| Move | `src/app/register/page.tsx` | `src/app/(auth)/register/page.tsx` |
| Move | `src/app/page.tsx` | `src/app/(dashboard)/page.tsx` |

### Phase 5: Error Handling & Polish

| Action | File | Changes |
|--------|------|---------|
| Add | `src/app/error.tsx` | Global error boundary |
| Add | `src/app/not-found.tsx` | 404 page |
| Add | `src/app/loading.tsx` | Global loading |
| Update | `src/server/api/routers/*.ts` | Use TRPCError consistently |
| Update | All mutations | Add toast notifications |
| Update | `src/styles/globals.css` | Add semantic color tokens |

---

## 12. Implementation Order

### Priority 1: High Impact, Low Risk
**Estimated Effort: 2-3 hours**

1. Install new shadcn components
2. Add Toaster to layout
3. Create shared Zod schemas
4. Create global types file
5. Create utility hooks (useMediaQuery, useDebounce)

### Priority 2: Core Refactoring
**Estimated Effort: 4-6 hours**

1. Create useAuth hook
2. Create useHabits hook with toast notifications
3. Create useCompletions with optimistic updates
4. Create useWeekNavigation with prefetching
5. Move date utils to feature folder

### Priority 3: Component Improvements
**Estimated Effort: 4-6 hours**

1. Create DeleteHabitDialog (replace confirm())
2. Create HabitActionsMenu
3. Create HabitTableSkeleton
4. Refactor CreateHabitDialog with react-hook-form
5. Refactor login/register forms with react-hook-form
6. Split HabitTable into smaller components

### Priority 4: Structure & Polish
**Estimated Effort: 2-3 hours**

1. Create route groups ((auth), (dashboard))
2. Move components to features directory
3. Create layouts for each group
4. Add error boundary and not-found pages
5. Update tRPC error handling

### Priority 5: Quality & Testing (Optional)
**Estimated Effort: 2-4 hours**

1. Set up Husky + lint-staged
2. Update ESLint rules
3. Add basic component tests
4. Performance audit with Lighthouse

---

## Summary

### Total Estimated Effort
- **Minimum (Priorities 1-3)**: 10-15 hours
- **Full Implementation (All Priorities)**: 14-22 hours

### Key Outcomes
- Consistent UI with shadcn/ui patterns
- Type-safe forms with react-hook-form + Zod
- Optimistic updates for better UX
- Reusable hooks for business logic
- Proper error handling with toast notifications
- Feature-based code organization
- Improved maintainability and scalability

### Breaking Changes
- None during migration if done incrementally
- All changes are additive until final directory restructure

---

**Next Step**: Review this plan and approve to begin implementation.

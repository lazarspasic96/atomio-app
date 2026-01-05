"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import { EmojiPicker } from "~/components/ui/emoji-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  createHabitSchema,
  DAYS_OF_WEEK,
  HABIT_CATEGORIES,
  type CreateHabitInput,
} from "../schemas/habit.schema";
import { useHabits } from "../hooks/use-habits";

interface CreateHabitDialogProps {
  onSuccess?: () => void;
}

export function CreateHabitDialog({ onSuccess }: CreateHabitDialogProps) {
  const [open, setOpen] = useState(false);
  const { create, isCreating } = useHabits();
  const inputRef = useRef<HTMLInputElement>(null);
  const cursorPositionRef = useRef<number>(0);

  const form = useForm<CreateHabitInput>({
    resolver: zodResolver(createHabitSchema),
    defaultValues: {
      name: "",
      frequencyPerWeek: 3,
      activeDays: [1, 2, 3, 4, 5], // Mon-Fri
    },
  });

  const onSubmit = (data: CreateHabitInput) => {
    create(data);
    setOpen(false);
    form.reset();
    onSuccess?.();
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>Add Habit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Habit</DialogTitle>
          <DialogDescription>
            Add a new habit to track. Choose which days you want to practice it.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Habit Name</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        placeholder="e.g., 🏃 Exercise, 📚 Read, 🧘 Meditate"
                        disabled={isCreating}
                        {...field}
                        ref={(el) => {
                          field.ref(el);
                          inputRef.current = el;
                        }}
                      />
                    </FormControl>
                    <EmojiPicker
                      disabled={isCreating}
                      onOpenChange={(isOpen) => {
                        if (isOpen && inputRef.current) {
                          cursorPositionRef.current =
                            inputRef.current.selectionStart ?? field.value.length;
                        }
                      }}
                      onEmojiSelect={(emoji) => {
                        const pos = cursorPositionRef.current;
                        const before = field.value.slice(0, pos);
                        const after = field.value.slice(pos);
                        field.onChange(before + emoji + after);
                        // Focus back on input and set cursor position after emoji
                        setTimeout(() => {
                          if (inputRef.current) {
                            inputRef.current.focus();
                            const newPos = pos + emoji.length;
                            inputRef.current.setSelectionRange(newPos, newPos);
                          }
                        }, 0);
                      }}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category (optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                    disabled={isCreating}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {HABIT_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.emoji} {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Categorize your habit for better organization
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="frequencyPerWeek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency per Week</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      const newFrequency = parseInt(value);
                      field.onChange(newFrequency);

                      // Auto-select days if frequency exceeds current active days
                      const currentDays = form.getValues("activeDays") ?? [];
                      if (newFrequency > currentDays.length) {
                        // Select all 7 days for frequency 7, otherwise select weekdays + weekend as needed
                        const allDays = [1, 2, 3, 4, 5, 6, 0]; // Mon-Sun
                        const daysNeeded = allDays.slice(0, newFrequency);
                        form.setValue("activeDays", daysNeeded, { shouldValidate: true });
                      }
                    }}
                    defaultValue={field.value.toString()}
                    disabled={isCreating}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? "time" : "times"} per week
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="activeDays"
              render={() => {
                const frequency = form.watch("frequencyPerWeek");
                return (
                  <FormItem>
                    <FormLabel>Active Days</FormLabel>
                    <div className="flex flex-wrap gap-3">
                      {DAYS_OF_WEEK.map((day) => (
                        <FormField
                          key={day.value}
                          control={form.control}
                          name="activeDays"
                          render={({ field }) => {
                            const isChecked = field.value?.includes(day.value);
                            const currentCount = field.value?.length ?? 0;
                            // Prevent unchecking if it would violate frequency constraint
                            const canUncheck = !isChecked || currentCount > frequency;

                            return (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={(checked) => {
                                      const current = field.value ?? [];
                                      if (checked) {
                                        field.onChange([...current, day.value]);
                                      } else if (canUncheck) {
                                        field.onChange(
                                          current.filter((v) => v !== day.value),
                                        );
                                      }
                                    }}
                                    disabled={isCreating || (isChecked && !canUncheck)}
                                  />
                                </FormControl>
                                <FormLabel className="cursor-pointer text-sm font-normal">
                                  {day.label}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormDescription>
                      Select at least {frequency} {frequency === 1 ? "day" : "days"} to match your frequency
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Habit"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

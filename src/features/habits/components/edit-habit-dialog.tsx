"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
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
import { DAYS_OF_WEEK, HABIT_CATEGORIES, habitCategorySchema, type HabitCategory } from "../schemas/habit.schema";
import { useHabits } from "../hooks/use-habits";
import { z } from "zod";

// Create a form-specific schema without the refine (we'll validate manually)
const editFormSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Habit name is required").max(100),
  frequencyPerWeek: z.number().min(1).max(7),
  activeDays: z.array(z.number().min(0).max(6)).min(1, "Select at least one day"),
  category: habitCategorySchema.optional().nullable(),
});

type EditFormInput = z.infer<typeof editFormSchema>;

interface Habit {
  id: string;
  name: string;
  frequencyPerWeek: number;
  activeDays: number[];
  category?: HabitCategory | null;
}

interface EditHabitDialogProps {
  habit: Habit;
  onSuccess?: () => void;
}

export function EditHabitDialog({ habit, onSuccess }: EditHabitDialogProps) {
  const [open, setOpen] = useState(false);
  const { update, isUpdating } = useHabits();
  const inputRef = useRef<HTMLInputElement>(null);
  const cursorPositionRef = useRef<number>(0);

  const form = useForm<EditFormInput>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      id: habit.id,
      name: habit.name,
      frequencyPerWeek: habit.frequencyPerWeek,
      activeDays: habit.activeDays,
      category: habit.category,
    },
  });

  // Reset form when habit changes or dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        id: habit.id,
        name: habit.name,
        frequencyPerWeek: habit.frequencyPerWeek,
        activeDays: habit.activeDays,
        category: habit.category,
      });
    }
  }, [open, habit, form]);

  const onSubmit = (data: EditFormInput) => {
    // Validate frequency vs active days
    if (data.frequencyPerWeek > data.activeDays.length) {
      form.setError("frequencyPerWeek", {
        message: "Frequency cannot exceed number of active days",
      });
      return;
    }

    update(data);
    setOpen(false);
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
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Habit</DialogTitle>
          <DialogDescription>
            Make changes to your habit settings.
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
                        disabled={isUpdating}
                        {...field}
                        ref={(el) => {
                          field.ref(el);
                          inputRef.current = el;
                        }}
                      />
                    </FormControl>
                    <EmojiPicker
                      disabled={isUpdating}
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
                    disabled={isUpdating}
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
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value.toString()}
                    disabled={isUpdating}
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
              render={() => (
                <FormItem>
                  <FormLabel>Active Days</FormLabel>
                  <div className="flex flex-wrap gap-3">
                    {DAYS_OF_WEEK.map((day) => (
                      <FormField
                        key={day.value}
                        control={form.control}
                        name="activeDays"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(day.value)}
                                onCheckedChange={(checked) => {
                                  const current = field.value ?? [];
                                  if (checked) {
                                    field.onChange([...current, day.value]);
                                  } else {
                                    field.onChange(
                                      current.filter((v) => v !== day.value),
                                    );
                                  }
                                }}
                                disabled={isUpdating}
                              />
                            </FormControl>
                            <FormLabel className="cursor-pointer text-sm font-normal">
                              {day.label}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormDescription>
                    Only checked days will show checkboxes in the calendar
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

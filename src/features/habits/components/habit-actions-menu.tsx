"use client";

import { MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { DeleteHabitDialog } from "./delete-habit-dialog";

interface HabitActionsMenuProps {
  habitId: string;
  habitName: string;
  onDelete: () => void;
  isDeleting?: boolean;
}

export function HabitActionsMenu({
  habitName,
  onDelete,
  isDeleting = false,
}: HabitActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DeleteHabitDialog
          habitName={habitName}
          onConfirm={onDelete}
          isDeleting={isDeleting}
          trigger={
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          }
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

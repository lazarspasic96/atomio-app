"use client";

import { useState } from "react";
import { EmojiPicker as FrimousseEmojiPicker } from "frimousse";
import { Smile } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

export function EmojiPicker({ onEmojiSelect, onOpenChange, disabled }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    onOpenChange?.(isOpen);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={disabled}
          className="shrink-0"
        >
          <Smile className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <FrimousseEmojiPicker.Root
          className="isolate flex h-[368px] w-fit flex-col bg-background text-foreground"
          onEmojiSelect={(emoji) => {
            onEmojiSelect(emoji.emoji);
            setOpen(false);
          }}
        >
          <FrimousseEmojiPicker.Search
            className="z-10 mx-2 mt-2 flex-none rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Search emoji..."
          />
          <FrimousseEmojiPicker.Viewport className="relative flex-1 outline-none">
            <FrimousseEmojiPicker.Loading className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
              Loading...
            </FrimousseEmojiPicker.Loading>
            <FrimousseEmojiPicker.Empty className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
              No emoji found.
            </FrimousseEmojiPicker.Empty>
            <FrimousseEmojiPicker.List
              className="select-none pb-1"
              components={{
                CategoryHeader: ({ category, ...props }) => (
                  <div
                    className="sticky top-0 bg-background/90 px-3 py-2 text-xs font-medium text-muted-foreground backdrop-blur-sm"
                    {...props}
                  >
                    {category.label}
                  </div>
                ),
                Row: ({ children, ...props }) => (
                  <div className="flex gap-0.5 px-2" {...props}>
                    {children}
                  </div>
                ),
                Emoji: ({ emoji, ...props }) => (
                  <button
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded text-lg hover:bg-muted data-[active]:bg-muted"
                    {...props}
                  >
                    {emoji.emoji}
                  </button>
                ),
              }}
            />
          </FrimousseEmojiPicker.Viewport>
        </FrimousseEmojiPicker.Root>
      </PopoverContent>
    </Popover>
  );
}

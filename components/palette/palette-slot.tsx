"use client";

import { Plus, X } from "lucide-react";
import { BlockCard } from "@/components/blocks/block-card";
import { cn } from "@/lib/utils";

interface Block {
  _id: string;
  slug: string;
  name: string;
  category: string;
}

interface PaletteSlotProps {
  block: Block | null;
  index: number;
  onClick?: () => void;
  onRemove?: () => void;
  disabled?: boolean;
}

export function PaletteSlot({
  block,
  index,
  onClick,
  onRemove,
  disabled,
}: PaletteSlotProps) {
  if (!block) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center transition-all",
          !disabled && "hover:border-primary hover:bg-primary/5 cursor-pointer",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        title={`Slot ${index + 1} - Click to add block`}
      >
        <Plus className="h-6 w-6 text-muted-foreground" />
      </button>
    );
  }

  return (
    <div className="relative group">
      <BlockCard slug={block.slug} name={block.name} onClick={onClick} />
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          title="Remove block"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

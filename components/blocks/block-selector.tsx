"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BlockGrid } from "./block-grid";
import { Blocks, Loader2 } from "lucide-react";

interface BlockSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectBlock: (blockSlug: string) => void;
  selectedBlockSlug?: string | null;
}

export function BlockSelector({
  open,
  onOpenChange,
  onSelectBlock,
  selectedBlockSlug,
}: BlockSelectorProps) {
  // Defer mounting the heavy BlockGrid until after the dialog has painted
  const [shouldRenderGrid, setShouldRenderGrid] = useState(false);

  useEffect(() => {
    if (open) {
      // Use requestAnimationFrame to defer grid mount until after dialog paints
      const rafId = requestAnimationFrame(() => {
        setShouldRenderGrid(true);
      });
      return () => cancelAnimationFrame(rafId);
    } else {
      // Reset when dialog closes
      setShouldRenderGrid(false);
    }
  }, [open]);

  const handleSelectBlock = (blockSlug: string) => {
    onSelectBlock(blockSlug);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-bottom-4 data-[state=open]:slide-in-from-bottom-4 duration-300">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center transition-transform hover:scale-105">
              <Blocks className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Select a Block</DialogTitle>
              <DialogDescription>
                Choose a block to add to your palette
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto py-4 -mx-6 px-6 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          {shouldRenderGrid ? (
            <BlockGrid
              selectedBlockSlug={selectedBlockSlug}
              onSelectBlock={handleSelectBlock}
            />
          ) : (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

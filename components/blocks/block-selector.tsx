"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BlockGrid } from "./block-grid";
import { Id } from "@/convex/_generated/dataModel";
import { Blocks } from "lucide-react";

interface BlockSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectBlock: (blockId: Id<"blocks">) => void;
  selectedBlockId?: Id<"blocks"> | null;
}

export function BlockSelector({
  open,
  onOpenChange,
  onSelectBlock,
  selectedBlockId,
}: BlockSelectorProps) {
  const handleSelectBlock = (blockId: Id<"blocks">) => {
    onSelectBlock(blockId);
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
          <BlockGrid
            selectedBlockId={selectedBlockId}
            onSelectBlock={handleSelectBlock}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

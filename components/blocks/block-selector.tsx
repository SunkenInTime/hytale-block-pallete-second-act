"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BlockGrid } from "./block-grid";
import { Id } from "@/convex/_generated/dataModel";

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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select a Block</DialogTitle>
        </DialogHeader>
        <BlockGrid
          selectedBlockId={selectedBlockId}
          onSelectBlock={handleSelectBlock}
        />
      </DialogContent>
    </Dialog>
  );
}

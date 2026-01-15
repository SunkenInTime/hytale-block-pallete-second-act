"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BlockCard } from "./block-card";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BlockGridProps {
  selectedBlockId?: Id<"blocks"> | null;
  onSelectBlock?: (blockId: Id<"blocks">) => void;
}

export function BlockGrid({ selectedBlockId, onSelectBlock }: BlockGridProps) {
  const blocks = useQuery(api.blocks.list);
  const categories = useQuery(api.blocks.getCategories);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  if (!blocks || !categories) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="w-16 h-16 rounded-lg bg-muted animate-pulse"
          />
        ))}
      </div>
    );
  }

  const filteredBlocks = activeCategory
    ? blocks.filter((b) => b.category === activeCategory)
    : blocks;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveCategory(null)}
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
        {filteredBlocks.map((block) => (
          <BlockCard
            key={block._id}
            slug={block.slug}
            name={block.name}
            selected={selectedBlockId === block._id}
            onClick={onSelectBlock ? () => onSelectBlock(block._id) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

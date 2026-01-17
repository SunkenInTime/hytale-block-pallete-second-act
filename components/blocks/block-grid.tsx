"use client";

import { BlockCard } from "./block-card";
import { useState, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { BLOCKS, CATEGORIES, type Block } from "@/lib/blocks";
import { useVirtualizer } from "@tanstack/react-virtual";

interface BlockGridProps {
  selectedBlockSlug?: string | null;
  onSelectBlock?: (blockSlug: string) => void;
}

// Number of columns at different breakpoints (matching the grid classes)
const COLUMNS = 8; // md:grid-cols-8

export function BlockGrid({
  selectedBlockSlug,
  onSelectBlock,
}: BlockGridProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const parentRef = useRef<HTMLDivElement>(null);

  const filteredBlocks = useMemo(() => {
    let filtered: Block[] = BLOCKS;

    // Filter by category
    if (activeCategory) {
      filtered = filtered.filter((b) => b.category === activeCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (b) =>
          b.name.toLowerCase().includes(query) ||
          b.slug.toLowerCase().includes(query) ||
          b.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [activeCategory, searchQuery]);

  // Calculate rows for virtualization
  const rowCount = Math.ceil(filteredBlocks.length / COLUMNS);
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Approximate row height (64px block + 16px gap)
    overscan: 3, // Render 3 extra rows above/below viewport
  });

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search blocks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveCategory(null)}
          className="transition-all duration-200 hover:scale-105"
        >
          All
        </Button>
        {CATEGORIES.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(category)}
            className="transition-all duration-200 hover:scale-105"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Blocks Grid - Virtualized */}
      {filteredBlocks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No blocks found{searchQuery ? ` for "${searchQuery}"` : ""}.
          </p>
        </div>
      ) : (
        <div
          ref={parentRef}
          className="h-[400px] overflow-auto"
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const startIndex = virtualRow.index * COLUMNS;
              const rowBlocks = filteredBlocks.slice(
                startIndex,
                startIndex + COLUMNS
              );

              return (
                <div
                  key={virtualRow.key}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                    {rowBlocks.map((block) => (
                      <BlockCard
                        key={block.slug}
                        slug={block.slug}
                        name={block.name}
                        selected={selectedBlockSlug === block.slug}
                        onClick={
                          onSelectBlock
                            ? () => onSelectBlock(block.slug)
                            : undefined
                        }
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Results count */}
      <p className="text-xs text-muted-foreground text-center">
        {filteredBlocks.length} block{filteredBlocks.length !== 1 ? "s" : ""}
        {activeCategory ? ` in ${activeCategory}` : ""}
        {searchQuery ? ` matching "${searchQuery}"` : ""}
      </p>
    </div>
  );
}

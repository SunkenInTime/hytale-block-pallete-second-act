"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BlockCard } from "./block-card";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";

interface BlockGridProps {
  selectedBlockId?: Id<"blocks"> | null;
  onSelectBlock?: (blockId: Id<"blocks">) => void;
}

export function BlockGrid({ selectedBlockId, onSelectBlock }: BlockGridProps) {
  const blocks = useQuery(api.blocks.list);
  const categories = useQuery(api.blocks.getCategories);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBlocks = useMemo(() => {
    if (!blocks) return [];

    let filtered = blocks;

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
  }, [blocks, activeCategory, searchQuery]);

  if (!blocks || !categories) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted animate-pulse rounded-md" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="w-16 h-16 rounded-lg bg-muted animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

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
        {categories.map((category, index) => (
          <Button
            key={category}
            variant={activeCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(category)}
            className="transition-all duration-200 hover:scale-105 animate-in fade-in slide-in-from-left-2"
            style={{ animationDelay: `${index * 30}ms` }}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Blocks Grid */}
      {filteredBlocks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No blocks found{searchQuery ? ` for "${searchQuery}"` : ""}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
          {filteredBlocks.map((block, index) => (
            <div
              key={block._id}
              className="animate-in fade-in zoom-in-95 duration-300 fill-mode-both"
              style={{ animationDelay: `${Math.min(index * 15, 300)}ms` }}
            >
              <BlockCard
                slug={block.slug}
                name={block.name}
                selected={selectedBlockId === block._id}
                onClick={onSelectBlock ? () => onSelectBlock(block._id) : undefined}
              />
            </div>
          ))}
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

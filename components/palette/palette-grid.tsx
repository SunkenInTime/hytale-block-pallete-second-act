"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PaletteCard } from "./palette-card";

interface PaletteGridProps {
  type: "user" | "published";
}

export function PaletteGrid({ type }: PaletteGridProps) {
  const userPalettes = useQuery(
    api.palettes.getByUser,
    type === "user" ? {} : "skip"
  );
  const publishedPalettes = useQuery(
    api.palettes.getPublished,
    type === "published" ? {} : "skip"
  );
  const blocks = useQuery(api.blocks.list);

  const palettes = type === "user" ? userPalettes : publishedPalettes;

  if (!palettes || !blocks) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-48 rounded-xl bg-muted animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (palettes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {type === "user"
            ? "You haven't created any palettes yet."
            : "No palettes have been published yet."}
        </p>
      </div>
    );
  }

  // Create a map of blocks by ID for quick lookup
  const blocksMap = new Map(blocks.map((b) => [b._id, b]));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {palettes.map((palette) => {
        // Get block objects for the slots
        const paletteBlocks = palette.slots.map((blockId) =>
          blockId ? blocksMap.get(blockId) || null : null
        );

        return (
          <PaletteCard
            key={palette._id}
            id={palette._id}
            name={palette.name}
            description={palette.description}
            blocks={paletteBlocks}
            isPublished={palette.isPublished}
            user={type === "published" ? (palette as { user?: { name?: string; avatarUrl?: string } }).user : undefined}
            showUser={type === "published"}
            href={type === "user" ? `/palette/${palette._id}/edit` : `/palette/${palette._id}`}
          />
        );
      })}
    </div>
  );
}

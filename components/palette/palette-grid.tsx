"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PaletteCard } from "./palette-card";
import { Id } from "@/convex/_generated/dataModel";
import { Plus } from "lucide-react";
import Link from "next/link";

interface PaletteGridProps {
  type: "user" | "published" | "liked";
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
  const likedPalettes = useQuery(
    api.likes.getUserLikedPalettes,
    type === "liked" ? {} : "skip"
  );
  const blocks = useQuery(api.blocks.list);

  const palettes = type === "user" ? userPalettes : type === "liked" ? likedPalettes : publishedPalettes;

  if (!palettes || !blocks) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-[3/2] rounded-xl bg-muted animate-pulse" />
            <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
            <div className="h-3 w-1/3 bg-muted animate-pulse rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (palettes.length === 0) {
    return (
      <div className="text-center py-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4 animate-in zoom-in-50 duration-500 delay-100">
          <Plus className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2 animate-in fade-in duration-500 delay-200">
          {type === "user"
            ? "No palettes yet"
            : type === "liked"
            ? "No saved palettes"
            : "No palettes found"}
        </h3>
        <p className="text-muted-foreground mb-4 animate-in fade-in duration-500 delay-300">
          {type === "user"
            ? "Create your first block palette to get started."
            : type === "liked"
            ? "Like palettes to save them here for later."
            : "Be the first to share a palette with the community."}
        </p>
        {type === "user" && (
          <Link
            href="/palette/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-200 animate-in fade-in zoom-in-95 duration-500 delay-400"
          >
            <Plus className="h-4 w-4" />
            Create Palette
          </Link>
        )}
      </div>
    );
  }

  // Create a map of blocks by ID for quick lookup
  const blocksMap = new Map(blocks.map((b) => [b._id, b]));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {palettes.map((palette, index) => {
        // Get block objects for the slots
        const paletteBlocks = palette.slots.map((blockId) =>
          blockId ? blocksMap.get(blockId) || null : null
        );

        const paletteUser = (palette as { user?: { _id?: Id<"users">; name?: string; avatarUrl?: string } }).user;

        return (
          <div
            key={palette._id}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <PaletteCard
              id={palette._id}
              name={palette.name}
              description={palette.description}
              blocks={paletteBlocks}
              isPublished={palette.isPublished}
              likesCount={(palette as { likesCount?: number }).likesCount ?? 0}
              createdAt={palette._creationTime}
              user={paletteUser}
              showUser={type === "published" || type === "liked"}
              showLikeButton={type !== "user"}
              href={type === "user" ? `/palette/${palette._id}/edit` : `/palette/${palette._id}`}
            />
          </div>
        );
      })}
    </div>
  );
}

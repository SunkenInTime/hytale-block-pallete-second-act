"use client";

import { getBlockImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";

interface BlockCardProps {
  slug: string;
  name: string;
  category?: string;
  selected?: boolean;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}

export function BlockCard({
  slug,
  name,
  category,
  selected,
  onClick,
  size = "md",
}: BlockCardProps) {
  // Sizes based on 32x32 pixel art - using multiples for crisp scaling
  const sizeClasses = {
    sm: "w-8 h-8",    // 32px - 1x
    md: "w-16 h-16",  // 64px - 2x
    lg: "w-24 h-24",  // 96px - 3x
  };

  const imageUrl = getBlockImageUrl(slug);

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative border-2 transition-all hover:scale-105 overflow-hidden bg-muted",
        sizeClasses[size],
        selected
          ? "border-primary ring-2 ring-primary/20"
          : "border-border hover:border-primary/50",
        onClick && "cursor-pointer"
      )}
      title={name}
      style={{
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: "100% 100%",
        imageRendering: "pixelated",
      }}
    >
      {category && (
        <span className="absolute -bottom-5 left-0 right-0 text-xs text-muted-foreground truncate text-center">
          {name}
        </span>
      )}
    </button>
  );
}

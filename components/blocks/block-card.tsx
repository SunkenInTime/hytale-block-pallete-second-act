"use client";

import { getBlockImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BlockCardProps {
  slug: string;
  name: string;
  category?: string;
  selected?: boolean;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

export function BlockCard({
  slug,
  name,
  category,
  selected,
  onClick,
  size = "md",
  showTooltip = true,
}: BlockCardProps) {
  // Sizes based on 32x32 pixel art - using multiples for crisp scaling
  const sizeClasses = {
    sm: "w-8 h-8",    // 32px - 1x
    md: "w-16 h-16",  // 64px - 2x
    lg: "w-24 h-24",  // 96px - 3x
  };

  const imageUrl = getBlockImageUrl(slug);

  const button = (
    <button
      onClick={onClick}
      className={cn(
        "relative border-2 transition-all duration-200 hover:scale-110 hover:-translate-y-0.5 overflow-hidden bg-muted rounded-sm",
        sizeClasses[size],
        selected
          ? "border-primary ring-2 ring-primary/30 shadow-lg shadow-primary/20"
          : "border-border hover:border-primary/50 hover:shadow-md",
        onClick && "cursor-pointer active:scale-95"
      )}
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

  if (showTooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>
          <p>{name}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}

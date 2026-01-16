"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  paletteId: Id<"palettes">;
  likesCount: number;
  size?: "sm" | "default";
  showCount?: boolean;
  className?: string;
}

export function LikeButton({
  paletteId,
  likesCount,
  size = "default",
  showCount = true,
  className,
}: LikeButtonProps) {
  const { user } = useAuth();
  const isLiked = useQuery(api.likes.isLiked, { paletteId });
  const toggleLike = useMutation(api.likes.toggle);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      window.location.href = "/sign-in";
      return;
    }

    setIsAnimating(true);
    await toggleLike({ paletteId });
    setTimeout(() => setIsAnimating(false), 400);
  };

  return (
    <Button
      variant="ghost"
      size={size === "sm" ? "sm" : "default"}
      className={cn(
        "gap-1.5 transition-all duration-200 hover:scale-105 active:scale-95",
        isLiked
          ? "text-red-500 hover:text-red-600 hover:bg-red-500/10"
          : "hover:text-red-500 hover:bg-red-500/10",
        className
      )}
      onClick={handleClick}
    >
      <Heart
        className={cn(
          size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4",
          "transition-all duration-200",
          isLiked && "fill-current",
          isAnimating && "animate-heart-beat"
        )}
      />
      {showCount && (
        <span className={cn(
          size === "sm" ? "text-xs" : "text-sm",
          "tabular-nums transition-all duration-200",
          isAnimating && "scale-110"
        )}>
          {likesCount}
        </span>
      )}
    </Button>
  );
}

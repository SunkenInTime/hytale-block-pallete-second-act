"use client";

import Image from "next/image";
import { getBlockImageUrl, getPlaceholderColor } from "@/lib/images";
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
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20",
  };

  const placeholderColor = getPlaceholderColor(slug);

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative rounded-lg border-2 transition-all hover:scale-105",
        sizeClasses[size],
        selected
          ? "border-primary ring-2 ring-primary/20"
          : "border-border hover:border-primary/50",
        onClick && "cursor-pointer"
      )}
      title={name}
    >
      <div
        className="absolute inset-0 rounded-md"
        style={{ backgroundColor: placeholderColor }}
      />
      <Image
        src={getBlockImageUrl(slug)}
        alt={name}
        fill
        className="object-cover rounded-md"
        onError={(e) => {
          // Hide broken image, show placeholder color
          e.currentTarget.style.display = "none";
        }}
      />
      {category && (
        <span className="absolute -bottom-5 left-0 right-0 text-xs text-muted-foreground truncate text-center">
          {name}
        </span>
      )}
    </button>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getBlockImageUrl } from "@/lib/images";
import { Id } from "@/convex/_generated/dataModel";
import { LikeButton } from "./like-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Block {
  _id: Id<"blocks">;
  slug: string;
  name: string;
  category: string;
}

interface PaletteCardProps {
  id: Id<"palettes">;
  name: string;
  description?: string;
  blocks: (Block | null)[];
  isPublished?: boolean;
  likesCount?: number;
  createdAt?: number;
  user?: {
    _id?: Id<"users">;
    name?: string;
    avatarUrl?: string;
  } | null;
  showUser?: boolean;
  showLikeButton?: boolean;
  href?: string;
}

export function PaletteCard({
  id,
  name,
  blocks,
  likesCount = 0,
  createdAt,
  user,
  showUser = false,
  showLikeButton = true,
  href,
}: PaletteCardProps) {
  const router = useRouter();

  // Get the first 6 blocks for a 3x2 grid
  const displayBlocks = blocks.slice(0, 6);

  // Format the date
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const BlockGrid = () => (
    <div className="rounded-xl overflow-hidden bg-muted aspect-[3/2] ring-1 ring-border/50 transition-all duration-300 group-hover:ring-primary/30 group-hover:shadow-xl group-hover:shadow-primary/5">
      <div className="grid grid-cols-3 grid-rows-2 h-full">
        {displayBlocks.map((block, index) => (
          <div
            key={`${id}-${index}`}
            className={cn(
              "relative transition-transform duration-300",
              "group-hover:scale-[1.02]"
            )}
            style={{
              backgroundImage: block ? `url(${getBlockImageUrl(block.slug)})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              imageRendering: "pixelated",
              transitionDelay: `${index * 30}ms`,
            }}
          >
            {!block && (
              <div className="absolute inset-0 bg-muted-foreground/10" />
            )}
          </div>
        ))}
        {Array.from({ length: Math.max(0, 6 - displayBlocks.length) }).map((_, index) => (
          <div
            key={`${id}-empty-${index}`}
            className="bg-muted-foreground/10"
          />
        ))}
      </div>
    </div>
  );

  const CardContent = () => (
    <>
      <BlockGrid />
      <div className="mt-3 space-y-2">
        <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
          {name}
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showUser && user && (
              <span
                role="button"
                tabIndex={0}
                className="flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (user._id) {
                    router.push(`/user/${user._id}`);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    if (user._id) {
                      router.push(`/user/${user._id}`);
                    }
                  }
                }}
              >
                <Avatar className="h-5 w-5">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                  {user.name || "Anonymous"}
                </span>
              </span>
            )}
            {!showUser && createdAt && (
              <span className="text-xs text-muted-foreground">
                {formatDate(createdAt)}
              </span>
            )}
          </div>
          {showLikeButton ? (
            <LikeButton
              paletteId={id}
              likesCount={likesCount}
              size="sm"
              className="h-7 px-2 rounded-full"
            />
          ) : (
            <span className="text-xs text-muted-foreground">
              {likesCount} likes
            </span>
          )}
        </div>
      </div>
    </>
  );

  if (href) {
    return (
      <div className="group">
        <Link href={href} className="block">
          <div className="transition-transform duration-300 group-hover:-translate-y-1">
            <CardContent />
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className="group cursor-pointer">
      <div className="transition-transform duration-300 group-hover:-translate-y-1">
        <CardContent />
      </div>
    </div>
  );
}

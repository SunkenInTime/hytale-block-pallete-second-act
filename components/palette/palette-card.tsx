"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BlockCard } from "@/components/blocks/block-card";
import { Globe, Lock } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

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
  user?: {
    name?: string;
    avatarUrl?: string;
  } | null;
  showUser?: boolean;
  href?: string;
}

export function PaletteCard({
  id,
  name,
  description,
  blocks,
  isPublished,
  user,
  showUser = false,
  href,
}: PaletteCardProps) {
  const content = (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">{name}</CardTitle>
            {description && (
              <CardDescription className="line-clamp-2">
                {description}
              </CardDescription>
            )}
          </div>
          {isPublished !== undefined && (
            <span className="text-muted-foreground">
              {isPublished ? (
                <Globe className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {blocks.slice(0, 6).map((block, index) =>
            block ? (
              <BlockCard
                key={`${id}-${index}`}
                slug={block.slug}
                name={block.name}
                size="sm"
              />
            ) : (
              <div
                key={`${id}-empty-${index}`}
                className="w-8 h-8 rounded border border-dashed border-muted-foreground/30"
              />
            )
          )}
          {blocks.length > 6 && (
            <div className="w-8 h-8 rounded border flex items-center justify-center text-xs text-muted-foreground">
              +{blocks.length - 6}
            </div>
          )}
        </div>

        {showUser && user && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t">
            <Avatar className="h-6 w-6">
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback className="text-xs">
                {user.name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              {user.name || "Anonymous"}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Header } from "@/components/layout/header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowLeft, Share2, Check, Pencil } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { getBlockImageUrl } from "@/lib/images";
import { LikeButton } from "@/components/palette/like-button";
import { toast } from "sonner";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { getBlockBySlug, Block } from "@/lib/blocks";

export default function PaletteViewPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const paletteId = params.id as Id<"palettes">;
  const palette = useQuery(api.palettes.getById, { id: paletteId });
  const [copied, setCopied] = useState(false);

  const handleGoBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      router.back();
    } else {
      // Default to explore if no history
      router.push("/explore");
    }
  };

  // Check if current user owns this palette (palette.userId is workosId, user.id is workosId)
  const isOwner = user && palette && palette.userId === user.id;

  const handleCopyLink = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!palette) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
        <Header />
        <main className="flex-1 py-8 px-4">
          <div className="container max-w-4xl mx-auto">
            <div className="h-10 w-32 bg-muted animate-pulse rounded-md mb-6" />
            <div className="aspect-[3/2] max-w-2xl mx-auto rounded-xl bg-muted animate-pulse" />
            <div className="max-w-2xl mx-auto mt-6 space-y-4">
              <div className="h-8 w-48 bg-muted animate-pulse rounded" />
              <div className="h-4 w-64 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Get blocks from slugs using static data
  const validBlocks = palette.slots
    .map((slug: unknown) => {
      if (!slug || typeof slug !== "string") return null;
      return getBlockBySlug(slug);
    })
    .filter((block: Block | null | undefined): block is Block => block !== null && block !== undefined);

  // Calculate grid dimensions (aim for roughly square aspect ratio)
  const blockCount = validBlocks.length;
  const cols = Math.ceil(Math.sqrt(blockCount * 1.5)); // Slightly wider than tall
  const rows = Math.ceil(blockCount / cols);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="container max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={handleGoBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            {isOwner && (
              <Button variant="outline" asChild className="gap-2">
                <Link href={`/palette/${paletteId}/edit`}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </Link>
              </Button>
            )}
          </div>

          {/* Large Block Grid - Main Visual */}
          <div className="rounded-2xl overflow-hidden bg-muted mb-6 max-w-2xl mx-auto shadow-lg ring-1 ring-border">
            <div
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                aspectRatio: `${cols}/${rows}`,
              }}
            >
              {validBlocks.map((block: Block, index: number) => (
                <div
                  key={`${paletteId}-grid-${index}`}
                  className="aspect-square animate-in fade-in duration-500"
                  style={{
                    backgroundImage: `url(${getBlockImageUrl(block.slug)})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    imageRendering: "pixelated",
                    animationDelay: `${index * 50}ms`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Palette Info */}
          <Card className="max-w-2xl mx-auto mb-8">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold mb-1">{palette.name}</h1>
                  {palette.description && (
                    <p className="text-muted-foreground">{palette.description}</p>
                  )}
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyLink}
                      className="gap-2 transition-all duration-200 hover:scale-105"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Share2 className="h-4 w-4" />
                          Share
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy link to clipboard</TooltipContent>
                </Tooltip>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {palette.user && (
                  <Link
                    href={`/user/${palette.user._id}`}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    <Avatar className="h-6 w-6 ring-2 ring-transparent hover:ring-primary/20 transition-all">
                      <AvatarImage src={palette.user.avatarUrl} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {palette.user.name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span>{palette.user.name || "Anonymous"}</span>
                  </Link>
                )}
                <LikeButton
                  paletteId={paletteId}
                  likesCount={palette.likesCount}
                  size="default"
                />
              </div>
            </CardContent>
          </Card>

          {/* Small Block Thumbnails with Names */}
          <div className="max-w-2xl mx-auto">
            <h2 className="text-lg font-semibold mb-4">Blocks in this palette</h2>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
              {validBlocks.map((block: Block, index: number) => (
                <Tooltip key={`${paletteId}-thumb-${index}`}>
                  <TooltipTrigger asChild>
                    <div
                      className="text-center cursor-default animate-in fade-in zoom-in-95 duration-300"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <div
                        className="w-12 h-12 mx-auto rounded-lg overflow-hidden bg-muted mb-2 ring-1 ring-border transition-all duration-200 hover:scale-110 hover:shadow-md"
                        style={{
                          backgroundImage: `url(${getBlockImageUrl(block.slug)})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          imageRendering: "pixelated",
                        }}
                      />
                      <p className="text-xs text-muted-foreground truncate">
                        {block.name}
                      </p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{block.name}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

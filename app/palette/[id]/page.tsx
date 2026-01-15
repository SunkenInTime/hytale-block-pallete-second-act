"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BlockCard } from "@/components/blocks/block-card";
import { ArrowLeft, Share2, Copy, Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function PaletteViewPage() {
  const params = useParams();
  const paletteId = params.id as Id<"palettes">;
  const palette = useQuery(api.palettes.getById, { id: paletteId });
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!palette) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8 px-4">
          <div className="container max-w-4xl mx-auto">
            <div className="h-64 rounded-xl bg-muted animate-pulse" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="container max-w-4xl mx-auto">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/explore">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Explore
            </Link>
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-2xl">{palette.name}</CardTitle>
                  {palette.description && (
                    <CardDescription className="text-base">
                      {palette.description}
                    </CardDescription>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={handleCopyLink}>
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </>
                  )}
                </Button>
              </div>

              {palette.user && (
                <div className="flex items-center gap-2 mt-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={palette.user.avatarUrl} />
                    <AvatarFallback>
                      {palette.user.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">
                    Created by {palette.user.name || "Anonymous"}
                  </span>
                </div>
              )}
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
                {palette.slotsWithBlocks.map((block, index) =>
                  block ? (
                    <div key={`${paletteId}-${index}`} className="space-y-2">
                      <BlockCard
                        slug={block.slug}
                        name={block.name}
                        size="lg"
                      />
                      <p className="text-xs text-center text-muted-foreground truncate">
                        {block.name}
                      </p>
                    </div>
                  ) : (
                    <div
                      key={`${paletteId}-empty-${index}`}
                      className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/20"
                    />
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

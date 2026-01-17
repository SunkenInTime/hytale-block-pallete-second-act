"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Header } from "@/components/layout/header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PaletteCard } from "@/components/palette/palette-card";
import { Palette } from "lucide-react";
import { getBlockBySlug } from "@/lib/blocks";

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as Id<"users">;
  const profile = useQuery(api.users.getPublicProfile, { id: userId });

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
        <Header />
        <main className="flex-1 py-6 px-2 sm:px-4 lg:px-6">
          <div className="w-full">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-20 w-20 rounded-full bg-muted animate-pulse" />
              <div className="space-y-2">
                <div className="h-7 w-40 bg-muted animate-pulse rounded" />
                <div className="h-5 w-28 bg-muted animate-pulse rounded" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-[3/2] rounded-xl bg-muted animate-pulse" />
                  <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <Header />

      <main className="flex-1 py-6 px-2 sm:px-4 lg:px-6">
        <div className="w-full">
          {/* Profile Header */}
          <div className="flex items-center gap-5 mb-10 p-6 rounded-2xl bg-card border">
            <Avatar className="h-20 w-20 ring-4 ring-primary/10">
              <AvatarImage src={profile.avatarUrl} />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {profile.name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">{profile.name || "Anonymous"}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Palette className="h-4 w-4" />
                  {profile.palettes.length} palette{profile.palettes.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Palettes Grid */}
          {profile.palettes.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Palette className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No public palettes</h3>
              <p className="text-muted-foreground">
                This user hasn't published any palettes yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {profile.palettes.map((palette) => {
                // Get block objects from slugs using static data
                const paletteBlocks = palette.slots.map((slug) => {
                  if (!slug || typeof slug !== "string") return null;
                  return getBlockBySlug(slug) ?? null;
                });

                return (
                  <PaletteCard
                    key={palette._id}
                    id={palette._id}
                    name={palette.name}
                    description={palette.description}
                    blocks={paletteBlocks}
                    likesCount={palette.likesCount}
                    createdAt={palette._creationTime}
                    showLikeButton={true}
                    href={`/palette/${palette._id}`}
                  />
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

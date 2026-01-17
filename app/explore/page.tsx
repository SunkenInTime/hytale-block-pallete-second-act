"use client";

import { Header } from "@/components/layout/header";
import { PaletteGrid } from "@/components/palette/palette-grid";
import { Compass } from "lucide-react";

export default function ExplorePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <Header />

      <main className="flex-1 py-6 px-2 sm:px-4 lg:px-6">
        <div className="w-full">
          <div className="flex items-center gap-4 mb-5">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Compass className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Explore Palettes</h1>
              <p className="text-sm text-muted-foreground">
                Discover palettes shared by the community
              </p>
            </div>
          </div>

          <PaletteGrid type="published" />
        </div>
      </main>
    </div>
  );
}

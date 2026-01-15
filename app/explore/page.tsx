"use client";

import { Header } from "@/components/layout/header";
import { PaletteGrid } from "@/components/palette/palette-grid";

export default function ExplorePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Explore Palettes</h1>
            <p className="text-muted-foreground">
              Discover block palettes created and shared by the community.
            </p>
          </div>

          <PaletteGrid type="published" />
        </div>
      </main>
    </div>
  );
}

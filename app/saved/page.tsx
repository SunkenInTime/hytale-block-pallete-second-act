"use client";

import { Header } from "@/components/layout/header";
import { PaletteGrid } from "@/components/palette/palette-grid";
import { Heart } from "lucide-react";

export default function SavedPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <Header />

      <main className="flex-1 py-6 px-2 sm:px-4 lg:px-6">
        <div className="w-full">
          <div className="flex items-center gap-4 mb-5">
            <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Heart className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Saved Palettes</h1>
              <p className="text-sm text-muted-foreground">
                Your collection of liked palettes
              </p>
            </div>
          </div>

          <PaletteGrid type="liked" />
        </div>
      </main>
    </div>
  );
}

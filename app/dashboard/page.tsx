"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/layout/header";
import { PaletteGrid } from "@/components/palette/palette-grid";
import { Button } from "@/components/ui/button";
import { Plus, Palette } from "lucide-react";

export default function DashboardPage() {
  const getOrCreateUser = useMutation(api.users.getOrCreate);

  useEffect(() => {
    // Ensure user exists in database when they visit dashboard
    getOrCreateUser();
  }, [getOrCreateUser]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Palette className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">My Palettes</h1>
                <p className="text-sm text-muted-foreground">
                  Create and manage your block palettes
                </p>
              </div>
            </div>
            <Button asChild className="rounded-full shadow-md">
              <Link href="/palette/new">
                <Plus className="h-4 w-4 mr-2" />
                New Palette
              </Link>
            </Button>
          </div>

          <PaletteGrid type="user" />
        </div>
      </main>
    </div>
  );
}

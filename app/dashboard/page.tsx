"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/layout/header";
import { PaletteGrid } from "@/components/palette/palette-grid";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function DashboardPage() {
  const getOrCreateUser = useMutation(api.users.getOrCreate);

  useEffect(() => {
    // Ensure user exists in database when they visit dashboard
    getOrCreateUser();
  }, [getOrCreateUser]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Palettes</h1>
              <p className="text-muted-foreground">
                Manage your block palette collections.
              </p>
            </div>
            <Button asChild>
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

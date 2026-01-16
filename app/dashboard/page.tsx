"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/layout/header";
import { PaletteGrid } from "@/components/palette/palette-grid";
import { Button } from "@/components/ui/button";
import { Plus, Palette } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const getOrCreateUser = useMutation(api.users.getOrCreate);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Ensure user exists in database when they visit dashboard
    getOrCreateUser().then((result) => {
      if (!result.hasCompletedSignup) {
        // Redirect to complete signup if user hasn't chosen a username yet
        router.push("/complete-signup");
      } else {
        setIsReady(true);
      }
    }).catch(() => {
      // If there's an error, still show the page
      setIsReady(true);
    });
  }, [getOrCreateUser, router]);

  if (!isReady) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </main>
      </div>
    );
  }

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

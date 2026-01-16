"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function NewPalettePage() {
  const router = useRouter();
  const createPalette = useMutation(api.palettes.create);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createAndRedirect = async () => {
      if (isCreating) return;

      setIsCreating(true);
      try {
        const paletteId = await createPalette({
          name: "Untitled Palette",
        });
        router.replace(`/palette/${paletteId}/edit`);
      } catch (err) {
        console.error("Failed to create palette:", err);
        setError("Failed to create palette. Please try again.");
        setIsCreating(false);
      }
    };

    createAndRedirect();
  }, [createPalette, router, isCreating]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
        <Header />
        <main className="flex-1 py-8 px-4">
          <div className="container max-w-2xl mx-auto">
            <Button variant="ghost" asChild className="mb-6">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>

            <div className="text-center py-16 space-y-4">
              <p className="text-destructive">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4 animate-in fade-in duration-500">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Creating your palette...</p>
        </div>
      </main>
    </div>
  );
}

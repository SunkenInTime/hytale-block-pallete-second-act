"use client";

import Link from "next/link";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { PaletteGrid } from "@/components/palette/palette-grid";
import { ArrowRight, Palette, Share2, Sparkles } from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Create Your Perfect{" "}
              <span className="text-primary">Block Palette</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Design and share custom block palettes for your Hytale builds.
              Choose from a variety of blocks and organize them into beautiful,
              shareable collections.
            </p>
            <div className="flex items-center justify-center gap-4">
              {user ? (
                <Button size="lg" asChild>
                  <Link href="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" asChild>
                    <Link href="/sign-up">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/explore">Browse Palettes</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 bg-muted/50">
          <div className="container max-w-5xl mx-auto">
            <h2 className="text-2xl font-semibold text-center mb-12">
              Everything You Need
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Palette className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Create Palettes</h3>
                <p className="text-sm text-muted-foreground">
                  Build custom palettes with up to 12 blocks. Perfect for
                  planning your next build.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Share2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Share with Others</h3>
                <p className="text-sm text-muted-foreground">
                  Publish your palettes and share them with the community via
                  unique links.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Get Inspired</h3>
                <p className="text-sm text-muted-foreground">
                  Explore palettes created by other builders and discover new
                  combinations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Community Palettes Section */}
        <section className="py-16 px-4">
          <div className="container max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold">Community Palettes</h2>
              <Button variant="ghost" asChild>
                <Link href="/explore">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <PaletteGrid type="published" />
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Block Palette - Create and share your Hytale block collections</p>
        </div>
      </footer>
    </div>
  );
}

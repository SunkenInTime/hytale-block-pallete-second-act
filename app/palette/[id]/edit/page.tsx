"use client";

import { useParams, useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { Header } from "@/components/layout/header";
import { PaletteEditor } from "@/components/palette/palette-editor";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye } from "lucide-react";
import Link from "next/link";

export default function EditPalettePage() {
  const params = useParams();
  const router = useRouter();
  const paletteId = params.id as Id<"palettes">;

  const handleDelete = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="container max-w-4xl mx-auto">
          {/* Navigation Bar */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" asChild className="gap-2">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            <Button variant="outline" asChild className="gap-2">
              <Link href={`/palette/${paletteId}`}>
                <Eye className="h-4 w-4" />
                Preview
              </Link>
            </Button>
          </div>

          {/* Editor */}
          <PaletteEditor
            paletteId={paletteId}
            onDelete={handleDelete}
          />
        </div>
      </main>
    </div>
  );
}

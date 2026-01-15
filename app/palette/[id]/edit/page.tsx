"use client";

import { useParams, useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { Header } from "@/components/layout/header";
import { PaletteEditor } from "@/components/palette/palette-editor";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditPalettePage() {
  const params = useParams();
  const router = useRouter();
  const paletteId = params.id as Id<"palettes">;

  const handleSave = () => {
    // Stay on page, changes are saved
  };

  const handleDelete = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="container max-w-4xl mx-auto">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>

          <div className="bg-card rounded-xl border p-6">
            <PaletteEditor
              paletteId={paletteId}
              onSave={handleSave}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

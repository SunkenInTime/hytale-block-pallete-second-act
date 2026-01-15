"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { PaletteSlot } from "./palette-slot";
import { BlockSelector } from "@/components/blocks/block-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Save, Trash2, Share2, Globe, Lock } from "lucide-react";

interface PaletteEditorProps {
  paletteId?: Id<"palettes">;
  onSave?: () => void;
  onDelete?: () => void;
}

export function PaletteEditor({ paletteId, onSave, onDelete }: PaletteEditorProps) {
  const palette = useQuery(
    api.palettes.getById,
    paletteId ? { id: paletteId } : "skip"
  );
  const blocks = useQuery(api.blocks.list);

  const createPalette = useMutation(api.palettes.create);
  const updatePalette = useMutation(api.palettes.update);
  const deletePalette = useMutation(api.palettes.remove);
  const addBlockToSlot = useMutation(api.palettes.addBlockToSlot);
  const expandSlots = useMutation(api.palettes.expandSlots);
  const togglePublish = useMutation(api.palettes.togglePublish);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (palette) {
      setName(palette.name);
      setDescription(palette.description || "");
    }
  }, [palette]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (paletteId) {
        await updatePalette({
          id: paletteId,
          name,
          description: description || undefined,
        });
      } else {
        await createPalette({
          name,
          description: description || undefined,
        });
      }
      onSave?.();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!paletteId) return;
    if (!confirm("Are you sure you want to delete this palette?")) return;

    await deletePalette({ id: paletteId });
    onDelete?.();
  };

  const handleSlotClick = (index: number) => {
    setSelectedSlot(index);
    setSelectorOpen(true);
  };

  const handleSelectBlock = async (blockId: Id<"blocks">) => {
    if (!paletteId || selectedSlot === null) return;

    await addBlockToSlot({
      paletteId,
      slotIndex: selectedSlot,
      blockId,
    });
    setSelectedSlot(null);
  };

  const handleRemoveBlock = async (index: number) => {
    if (!paletteId) return;

    await addBlockToSlot({
      paletteId,
      slotIndex: index,
      blockId: null,
    });
  };

  const handleExpandSlots = async () => {
    if (!paletteId || !palette) return;
    const newMax = Math.min(palette.maxSlots + 3, 12);
    if (newMax <= palette.maxSlots) return;

    await expandSlots({
      paletteId,
      newMaxSlots: newMax,
    });
  };

  const handleTogglePublish = async () => {
    if (!paletteId) return;
    await togglePublish({ id: paletteId });
  };

  const getBlockForSlot = (index: number) => {
    if (!palette?.slotsWithBlocks) return null;
    return palette.slotsWithBlocks[index] || null;
  };

  // For new palette creation
  if (!paletteId) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Palette Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Awesome Palette"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A collection of blocks for..."
            rows={3}
          />
        </div>

        <Button onClick={handleSave} disabled={!name || isSaving}>
          <Save className="h-4 w-4 mr-2" />
          Create Palette
        </Button>
      </div>
    );
  }

  if (!palette) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-16 h-16 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-lg font-semibold border-none px-0 focus-visible:ring-0"
            placeholder="Palette Name"
          />
          <p className="text-sm text-muted-foreground">
            {palette.maxSlots} slots
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={palette.isPublished ? "default" : "outline"}
            size="sm"
            onClick={handleTogglePublish}
          >
            {palette.isPublished ? (
              <>
                <Globe className="h-4 w-4 mr-1" />
                Published
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-1" />
                Private
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description..."
          rows={2}
          className="resize-none"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Blocks</Label>
          {palette.maxSlots < 12 && (
            <Button variant="ghost" size="sm" onClick={handleExpandSlots}>
              <Plus className="h-4 w-4 mr-1" />
              Add more slots
            </Button>
          )}
        </div>

        <div className="grid grid-cols-6 gap-4">
          {Array.from({ length: palette.maxSlots }).map((_, index) => (
            <PaletteSlot
              key={index}
              index={index}
              block={getBlockForSlot(index)}
              onClick={() => handleSlotClick(index)}
              onRemove={
                getBlockForSlot(index)
                  ? () => handleRemoveBlock(index)
                  : undefined
              }
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-4 border-t">
        <Button onClick={handleSave} disabled={!name || isSaving}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
        <Button variant="destructive" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>

      <BlockSelector
        open={selectorOpen}
        onOpenChange={setSelectorOpen}
        onSelectBlock={handleSelectBlock}
        selectedBlockId={
          selectedSlot !== null
            ? (palette.slots[selectedSlot] as Id<"blocks"> | null)
            : null
        }
      />
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { BlockSelector } from "@/components/blocks/block-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Plus,
  Save,
  Trash2,
  Globe,
  Lock,
  Shuffle,
  X,
  Loader2,
  Check,
  Unlock,
  Eraser,
} from "lucide-react";
import { getBlockImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { BLOCKS, getBlockBySlug } from "@/lib/blocks";

interface PaletteEditorProps {
  paletteId?: Id<"palettes">;
  onSave?: () => void;
  onDelete?: () => void;
  mode?: "create" | "edit";
}

export function PaletteEditor({
  paletteId,
  onSave,
  onDelete,
  mode = "edit",
}: PaletteEditorProps) {
  const palette = useQuery(
    api.palettes.getById,
    paletteId ? { id: paletteId } : "skip"
  );

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
  const [lockedSlots, setLockedSlots] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (palette) {
      setName(palette.name);
      setDescription(palette.description || "");
    }
  }, [palette]);

  // Track unsaved changes
  useEffect(() => {
    if (palette) {
      const hasChanges =
        name !== palette.name ||
        description !== (palette.description || "");
      setHasUnsavedChanges(hasChanges);
    }
  }, [name, description, palette]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter a palette name");
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      if (paletteId) {
        await updatePalette({
          id: paletteId,
          name: name.trim(),
          description: description.trim() || undefined,
        });
        toast.success("Palette saved successfully!");
      } else {
        const newId = await createPalette({
          name: name.trim(),
          description: description.trim() || undefined,
        });
        toast.success("Palette created!");
        onSave?.();
        return newId;
      }
      setSaveSuccess(true);
      setHasUnsavedChanges(false);
      setTimeout(() => setSaveSuccess(false), 2000);
      onSave?.();
    } catch {
      toast.error("Failed to save palette");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!paletteId) return;
    if (!confirm("Are you sure you want to delete this palette?")) return;

    try {
      await deletePalette({ id: paletteId });
      toast.success("Palette deleted");
      onDelete?.();
    } catch {
      toast.error("Failed to delete palette");
    }
  };

  const handleSlotClick = (index: number) => {
    setSelectedSlot(index);
    setSelectorOpen(true);
  };

  // Updated to use slug instead of ID
  const handleSelectBlock = async (blockSlug: string) => {
    if (!paletteId || selectedSlot === null) return;

    try {
      await addBlockToSlot({
        paletteId,
        slotIndex: selectedSlot,
        blockSlug,
      });
    } catch {
      toast.error("Failed to add block");
    }
    setSelectedSlot(null);
  };

  const handleRemoveBlock = async (index: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!paletteId) return;

    try {
      await addBlockToSlot({
        paletteId,
        slotIndex: index,
        blockSlug: null,
      });
    } catch {
      toast.error("Failed to remove block");
    }
  };

  const handleClearAll = async () => {
    if (!paletteId || !palette) return;

    try {
      const clearPromises = [];
      for (let i = 0; i < palette.maxSlots; i++) {
        if (palette.slots[i] && !lockedSlots.has(i)) {
          clearPromises.push(
            addBlockToSlot({
              paletteId,
              slotIndex: i,
              blockSlug: null,
            })
          );
        }
      }
      await Promise.all(clearPromises);
      toast.success("Cleared unlocked slots");
    } catch {
      toast.error("Failed to clear slots");
    }
  };

  const toggleSlotLock = useCallback((index: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLockedSlots((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  // Updated to use static BLOCKS and slugs
  const handleRandomize = async () => {
    if (!paletteId || !palette || BLOCKS.length === 0) return;

    setIsRandomizing(true);

    try {
      const usedSlugs = new Set<string>();
      const randomPromises = [];

      // Keep locked slots' block slugs
      for (let i = 0; i < palette.maxSlots; i++) {
        if (lockedSlots.has(i) && palette.slots[i]) {
          usedSlugs.add(palette.slots[i] as string);
        }
      }

      for (let i = 0; i < palette.maxSlots; i++) {
        // Skip locked slots
        if (lockedSlots.has(i)) continue;

        let randomBlock;
        let attempts = 0;
        do {
          randomBlock = BLOCKS[Math.floor(Math.random() * BLOCKS.length)];
          attempts++;
        } while (usedSlugs.has(randomBlock.slug) && attempts < 100);

        usedSlugs.add(randomBlock.slug);

        randomPromises.push(
          addBlockToSlot({
            paletteId,
            slotIndex: i,
            blockSlug: randomBlock.slug,
          })
        );
      }

      await Promise.all(randomPromises);
      toast.success(
        lockedSlots.size > 0
          ? `Randomized ${palette.maxSlots - lockedSlots.size} unlocked slots`
          : "Randomized all slots"
      );
    } catch {
      toast.error("Failed to randomize");
    } finally {
      setIsRandomizing(false);
    }
  };

  const handleExpandSlots = async () => {
    if (!paletteId || !palette) return;
    const newMax = Math.min(palette.maxSlots + 3, 12);
    if (newMax <= palette.maxSlots) return;

    try {
      await expandSlots({
        paletteId,
        newMaxSlots: newMax,
      });
      toast.success(`Expanded to ${newMax} slots`);
    } catch {
      toast.error("Failed to expand slots");
    }
  };

  const handleTogglePublish = async () => {
    if (!paletteId) return;
    try {
      await togglePublish({ id: paletteId });
      toast.success(palette?.isPublished ? "Palette is now private" : "Palette published!");
    } catch {
      toast.error("Failed to update publish status");
    }
  };

  // Updated to use static blocks lookup by slug
  const getBlockForSlot = (index: number) => {
    if (!palette?.slots) return null;
    const slug = palette.slots[index];
    if (!slug || typeof slug !== "string") return null;
    return getBlockBySlug(slug) ?? null;
  };

  // Loading state
  if (paletteId && !palette) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center gap-4">
          <div className="h-10 flex-1 max-w-xs bg-muted animate-pulse rounded-md" />
          <div className="h-10 w-24 bg-muted animate-pulse rounded-md" />
        </div>
        <div className="aspect-[3/2] max-w-2xl mx-auto rounded-xl bg-muted animate-pulse" />
        <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const maxSlots = palette?.maxSlots || 6;
  const cols = Math.min(3, maxSlots);
  const rows = Math.ceil(maxSlots / cols);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Large Preview Grid */}
      {paletteId && palette && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Preview</h3>

          {/* Lock Indicator */}
          {lockedSlots.size > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground animate-in fade-in slide-in-from-top-2 duration-300">
              <Lock className="h-3.5 w-3.5" />
              <span>
                {lockedSlots.size} slot{lockedSlots.size !== 1 ? "s" : ""} locked
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto py-0.5 px-2 text-xs"
                onClick={() => setLockedSlots(new Set())}
              >
                Unlock all
              </Button>
            </div>
          )}

          {/* Preview Grid */}
          <div className="rounded-2xl overflow-hidden bg-muted/50 border-2 border-border max-w-2xl mx-auto shadow-lg">
            <div
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
              }}
            >
              {Array.from({ length: maxSlots }).map((_, index) => {
                const block = getBlockForSlot(index);
                const row = Math.floor(index / cols);
                const col = index % cols;
                const isLastCol = col === cols - 1;
                const isLastRow = row === rows - 1;
                const isLocked = lockedSlots.has(index);

                return (
                  <div
                    key={index}
                    className={cn(
                      "aspect-square relative cursor-pointer group transition-all duration-200",
                      "hover:brightness-110",
                      isLocked && "ring-2 ring-inset ring-amber-500/50"
                    )}
                    onClick={() => handleSlotClick(index)}
                    style={{
                      backgroundImage: block
                        ? `url(${getBlockImageUrl(block.slug)})`
                        : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      imageRendering: "pixelated",
                      borderRight: !isLastCol
                        ? "2px dashed var(--border)"
                        : undefined,
                      borderBottom: !isLastRow
                        ? "2px dashed var(--border)"
                        : undefined,
                    }}
                  >
                    {/* Empty slot indicator */}
                    {!block && (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted/30 group-hover:bg-primary/10 transition-colors">
                        <Plus className="h-8 w-8 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                      </div>
                    )}

                    {/* Hover overlay with actions */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                      {block && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-8 w-8 rounded-full shadow-md"
                              onClick={(e) => handleRemoveBlock(index, e)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Remove block</TooltipContent>
                        </Tooltip>
                      )}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={isLocked ? "default" : "secondary"}
                            size="icon"
                            className={cn(
                              "h-8 w-8 rounded-full shadow-md transition-colors",
                              isLocked && "bg-amber-500 hover:bg-amber-600"
                            )}
                            onClick={(e) => toggleSlotLock(index, e)}
                          >
                            {isLocked ? (
                              <Lock className="h-4 w-4" />
                            ) : (
                              <Unlock className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {isLocked ? "Unlock slot" : "Lock slot"}
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    {/* Lock indicator badge */}
                    {isLocked && (
                      <div className="absolute top-1 right-1">
                        <Badge
                          variant="secondary"
                          className="h-5 w-5 p-0 flex items-center justify-center bg-amber-500 text-white border-0"
                        >
                          <Lock className="h-3 w-3" />
                        </Badge>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add more slots button */}
          {maxSlots < 12 && (
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExpandSlots}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add more slots (max 12)
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Block Slots List */}
      {paletteId && palette && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Blocks</h3>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAll}
                    className="gap-2"
                    disabled={!palette.slots.some((s, i) => s && !lockedSlots.has(i))}
                  >
                    <Eraser className="h-4 w-4" />
                    Clear
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clear unlocked slots</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRandomize}
                    disabled={isRandomizing}
                    className="gap-2"
                  >
                    {isRandomizing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Shuffle className="h-4 w-4" />
                    )}
                    Randomize
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {lockedSlots.size > 0
                    ? "Randomize unlocked slots"
                    : "Randomize all slots"}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: maxSlots }).map((_, index) => {
              const block = getBlockForSlot(index);
              const isLocked = lockedSlots.has(index);

              if (block) {
                return (
                  <Card
                    key={index}
                    className={cn(
                      "group cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
                      isLocked && "ring-2 ring-amber-500/50"
                    )}
                    onClick={() => handleSlotClick(index)}
                  >
                    <CardContent className="p-3 flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg flex-shrink-0 ring-1 ring-border"
                        style={{
                          backgroundImage: `url(${getBlockImageUrl(block.slug)})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          imageRendering: "pixelated",
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">
                          {block.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Slot {index + 1}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn(
                                "h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity",
                                isLocked && "opacity-100 text-amber-500"
                              )}
                              onClick={(e) => toggleSlotLock(index, e)}
                            >
                              {isLocked ? (
                                <Lock className="h-4 w-4" />
                              ) : (
                                <Unlock className="h-4 w-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isLocked ? "Unlock" : "Lock"}
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                              onClick={(e) => handleRemoveBlock(index, e)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Remove</TooltipContent>
                        </Tooltip>
                      </div>
                    </CardContent>
                  </Card>
                );
              }

              return (
                <Card
                  key={index}
                  className="border-dashed cursor-pointer transition-all duration-200 hover:border-primary hover:bg-primary/5"
                  onClick={() => handleSlotClick(index)}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-muted flex-shrink-0 flex items-center justify-center">
                      <Plus className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        Add block to slot {index + 1}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Name & Description Section */}
      <Card className="border-2">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Name & Publish Status */}
            <div className="flex items-start gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Palette Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Awesome Palette"
                  className="text-lg font-semibold h-12"
                />
              </div>
              {paletteId && (
                <div className="pt-7">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={palette?.isPublished ? "default" : "outline"}
                        size="sm"
                        onClick={handleTogglePublish}
                        className="gap-2 transition-all duration-200 hover:scale-105"
                      >
                        {palette?.isPublished ? (
                          <>
                            <Globe className="h-4 w-4" />
                            Public
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4" />
                            Private
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {palette?.isPublished
                        ? "Click to make private"
                        : "Click to publish"}
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A collection of blocks for building..."
                rows={2}
                className="resize-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t sticky bottom-0 bg-background/95 backdrop-blur py-4 -mx-4 px-4">
        <div className="flex items-center gap-2">
          {paletteId && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleDelete}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete palette</TooltipContent>
            </Tooltip>
          )}
        </div>
        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <Badge variant="secondary" className="animate-in fade-in">
              Unsaved changes
            </Badge>
          )}
          <Button
            onClick={handleSave}
            disabled={!name.trim() || isSaving}
            className={cn(
              "min-w-[120px] transition-all duration-300",
              saveSuccess && "bg-green-600 hover:bg-green-600"
            )}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : saveSuccess ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {paletteId ? "Save" : "Create"}
              </>
            )}
          </Button>
        </div>
      </div>

      <BlockSelector
        open={selectorOpen}
        onOpenChange={setSelectorOpen}
        onSelectBlock={handleSelectBlock}
        selectedBlockSlug={
          selectedSlot !== null && palette
            ? (palette.slots[selectedSlot] as string | null)
            : null
        }
      />
    </div>
  );
}

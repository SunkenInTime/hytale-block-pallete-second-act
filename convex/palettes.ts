import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getByUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const palettes = await ctx.db
      .query("palettes")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    // Convert slots to slugs (handle legacy IDs)
    const palettesWithSlugs = await Promise.all(
      palettes.map(async (palette) => {
        const slotsAsSlugs = await Promise.all(
          palette.slots.map(async (slot) => {
            if (slot === null) return null;
            // If it's a short string, it's likely already a slug
            if (typeof slot === "string" && slot.length < 50) {
              return slot;
            }
            // Otherwise try to resolve it as an ID
            try {
              const block = await ctx.db.get(slot as any);
              return block?.slug ?? null;
            } catch {
              return slot as string;
            }
          })
        );
        return { ...palette, slots: slotsAsSlugs };
      })
    );

    return palettesWithSlugs;
  },
});

export const getPublished = query({
  args: {},
  handler: async (ctx) => {
    const palettes = await ctx.db
      .query("palettes")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .collect();

    // Get user info and likes count for each palette, and convert slots to slugs
    const palettesWithUsers = await Promise.all(
      palettes.map(async (palette) => {
        const user = await ctx.db
          .query("users")
          .withIndex("by_workos_id", (q) => q.eq("workosId", palette.userId))
          .first();

        // Get likes count
        const likes = await ctx.db
          .query("likes")
          .withIndex("by_palette", (q) => q.eq("paletteId", palette._id))
          .collect();

        // Convert slots to slugs (handle legacy IDs)
        const slotsAsSlugs = await Promise.all(
          palette.slots.map(async (slot) => {
            if (slot === null) return null;
            // If it's a short string, it's likely already a slug
            if (typeof slot === "string" && slot.length < 50) {
              return slot;
            }
            // Otherwise try to resolve it as an ID
            try {
              const block = await ctx.db.get(slot as any);
              return block?.slug ?? null;
            } catch {
              return slot as string;
            }
          })
        );

        return {
          ...palette,
          slots: slotsAsSlugs,
          likesCount: likes.length,
          user: user ? { _id: user._id, name: user.name || user.username, avatarUrl: user.avatarUrl } : null,
        };
      })
    );

    return palettesWithUsers;
  },
});

export const getById = query({
  args: { id: v.id("palettes") },
  handler: async (ctx, args) => {
    const palette = await ctx.db.get(args.id);
    if (!palette) {
      return null;
    }

    // Convert slots to slugs if they're still IDs (for backwards compatibility)
    const slotsAsSlugs = await Promise.all(
      palette.slots.map(async (slot) => {
        if (slot === null) return null;
        // If it's already a string (slug), return as-is
        if (typeof slot === "string" && !slot.startsWith("k")) {
          return slot;
        }
        // Otherwise it might be an ID - try to resolve it
        try {
          const block = await ctx.db.get(slot as any);
          return block?.slug ?? null;
        } catch {
          // If it's actually a slug string that starts with 'k', return it
          return slot as string;
        }
      })
    );

    // Get user info
    const user = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosId", palette.userId))
      .first();

    // Get likes count
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_palette", (q) => q.eq("paletteId", args.id))
      .collect();

    return {
      ...palette,
      slots: slotsAsSlugs, // Return slots as slugs
      likesCount: likes.length,
      user: user ? { _id: user._id, name: user.name || user.username, avatarUrl: user.avatarUrl } : null,
    };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    const paletteId = await ctx.db.insert("palettes", {
      userId: identity.subject,
      name: args.name,
      description: args.description,
      slots: [null, null, null, null, null, null],
      maxSlots: 6,
      isPublished: false,
      createdAt: now,
      updatedAt: now,
    });

    return paletteId;
  },
});

export const update = mutation({
  args: {
    id: v.id("palettes"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    // Accept slots as slugs (strings) or null
    slots: v.optional(v.array(v.union(v.string(), v.null()))),
    maxSlots: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const palette = await ctx.db.get(args.id);
    if (!palette) {
      throw new Error("Palette not found");
    }

    if (palette.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.slots !== undefined) updates.slots = args.slots;
    if (args.maxSlots !== undefined) {
      if (args.maxSlots < 6 || args.maxSlots > 12) {
        throw new Error("maxSlots must be between 6 and 12");
      }
      updates.maxSlots = args.maxSlots;
    }

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

export const remove = mutation({
  args: { id: v.id("palettes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const palette = await ctx.db.get(args.id);
    if (!palette) {
      throw new Error("Palette not found");
    }

    if (palette.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

export const togglePublish = mutation({
  args: { id: v.id("palettes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const palette = await ctx.db.get(args.id);
    if (!palette) {
      throw new Error("Palette not found");
    }

    if (palette.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.id, {
      isPublished: !palette.isPublished,
      updatedAt: Date.now(),
    });

    return !palette.isPublished;
  },
});

// New: Add block to slot using slug
export const addBlockToSlot = mutation({
  args: {
    paletteId: v.id("palettes"),
    slotIndex: v.number(),
    blockSlug: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const palette = await ctx.db.get(args.paletteId);
    if (!palette) {
      throw new Error("Palette not found");
    }

    if (palette.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    if (args.slotIndex < 0 || args.slotIndex >= palette.maxSlots) {
      throw new Error("Invalid slot index");
    }

    // Convert existing slots to strings/nulls (handle legacy IDs)
    const newSlots: (string | null)[] = await Promise.all(
      palette.slots.map(async (slot) => {
        if (slot === null) return null;
        if (typeof slot === "string" && !slot.startsWith("k")) {
          return slot;
        }
        try {
          const block = await ctx.db.get(slot as any);
          return block?.slug ?? null;
        } catch {
          return slot as string;
        }
      })
    );

    // Ensure slots array has enough elements
    while (newSlots.length < palette.maxSlots) {
      newSlots.push(null);
    }
    newSlots[args.slotIndex] = args.blockSlug;

    await ctx.db.patch(args.paletteId, {
      slots: newSlots,
      updatedAt: Date.now(),
    });

    return args.paletteId;
  },
});

export const expandSlots = mutation({
  args: {
    paletteId: v.id("palettes"),
    newMaxSlots: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const palette = await ctx.db.get(args.paletteId);
    if (!palette) {
      throw new Error("Palette not found");
    }

    if (palette.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    if (args.newMaxSlots < 6 || args.newMaxSlots > 12) {
      throw new Error("Max slots must be between 6 and 12");
    }

    if (args.newMaxSlots <= palette.maxSlots) {
      throw new Error("New max slots must be greater than current");
    }

    // Convert existing slots to strings/nulls (handle legacy IDs)
    const newSlots: (string | null)[] = await Promise.all(
      palette.slots.map(async (slot) => {
        if (slot === null) return null;
        if (typeof slot === "string" && !slot.startsWith("k")) {
          return slot;
        }
        try {
          const block = await ctx.db.get(slot as any);
          return block?.slug ?? null;
        } catch {
          return slot as string;
        }
      })
    );

    while (newSlots.length < args.newMaxSlots) {
      newSlots.push(null);
    }

    await ctx.db.patch(args.paletteId, {
      slots: newSlots,
      maxSlots: args.newMaxSlots,
      updatedAt: Date.now(),
    });

    return args.paletteId;
  },
});

// Migration: Convert all palette slots from block IDs to slugs
export const migrateSlotsToSlugs = mutation({
  args: {},
  handler: async (ctx) => {
    const palettes = await ctx.db.query("palettes").collect();
    let migratedCount = 0;

    for (const palette of palettes) {
      let needsMigration = false;
      const newSlots: (string | null)[] = [];

      for (const slot of palette.slots) {
        if (slot === null) {
          newSlots.push(null);
        } else if (typeof slot === "string") {
          // Check if it looks like a Convex ID (starts with certain patterns)
          // Convex IDs are typically longer strings with specific patterns
          if (slot.length > 20) {
            // Likely an ID, try to resolve it
            try {
              const block = await ctx.db.get(slot as any);
              if (block) {
                newSlots.push(block.slug);
                needsMigration = true;
              } else {
                newSlots.push(null);
                needsMigration = true;
              }
            } catch {
              // Not a valid ID, treat as slug
              newSlots.push(slot);
            }
          } else {
            // Short string, likely already a slug
            newSlots.push(slot);
          }
        } else {
          // It's an ID object, resolve it
          try {
            const block = await ctx.db.get(slot);
            if (block) {
              newSlots.push(block.slug);
              needsMigration = true;
            } else {
              newSlots.push(null);
              needsMigration = true;
            }
          } catch {
            newSlots.push(null);
            needsMigration = true;
          }
        }
      }

      if (needsMigration) {
        await ctx.db.patch(palette._id, { slots: newSlots });
        migratedCount++;
      }
    }

    return { message: `Migrated ${migratedCount} palettes to use slug-based slots` };
  },
});

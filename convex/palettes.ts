import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getByUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    return await ctx.db
      .query("palettes")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
  },
});

export const getPublished = query({
  args: {},
  handler: async (ctx) => {
    const palettes = await ctx.db
      .query("palettes")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .collect();

    // Get user info and likes count for each palette
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

        return {
          ...palette,
          likesCount: likes.length,
          user: user ? { _id: user._id, name: user.name, avatarUrl: user.avatarUrl } : null,
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

    // Get block details for each slot
    const slotsWithBlocks = await Promise.all(
      palette.slots.map(async (blockId) => {
        if (blockId === null) return null;
        return await ctx.db.get(blockId);
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
      slotsWithBlocks,
      likesCount: likes.length,
      user: user ? { _id: user._id, name: user.name, avatarUrl: user.avatarUrl } : null,
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
    slots: v.optional(v.array(v.union(v.id("blocks"), v.null()))),
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

export const addBlockToSlot = mutation({
  args: {
    paletteId: v.id("palettes"),
    slotIndex: v.number(),
    blockId: v.union(v.id("blocks"), v.null()),
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

    const newSlots = [...palette.slots];
    // Ensure slots array has enough elements
    while (newSlots.length < palette.maxSlots) {
      newSlots.push(null);
    }
    newSlots[args.slotIndex] = args.blockId;

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

    const newSlots = [...palette.slots];
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

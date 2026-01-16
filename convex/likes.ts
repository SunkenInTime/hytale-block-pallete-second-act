import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const isLiked = query({
  args: { paletteId: v.id("palettes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    const like = await ctx.db
      .query("likes")
      .withIndex("by_user_and_palette", (q) =>
        q.eq("userId", identity.subject).eq("paletteId", args.paletteId)
      )
      .first();

    return !!like;
  },
});

export const getLikesCount = query({
  args: { paletteId: v.id("palettes") },
  handler: async (ctx, args) => {
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_palette", (q) => q.eq("paletteId", args.paletteId))
      .collect();

    return likes.length;
  },
});

export const getUserLikedPalettes = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const likes = await ctx.db
      .query("likes")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    // Get the palette details for each liked palette
    const palettesWithDetails = await Promise.all(
      likes.map(async (like) => {
        const palette = await ctx.db.get(like.paletteId);
        if (!palette || !palette.isPublished) return null;

        // Get user info for the palette
        const user = await ctx.db
          .query("users")
          .withIndex("by_workos_id", (q) => q.eq("workosId", palette.userId))
          .first();

        // Get likes count for this palette
        const paletteLikes = await ctx.db
          .query("likes")
          .withIndex("by_palette", (q) => q.eq("paletteId", palette._id))
          .collect();

        return {
          ...palette,
          likesCount: paletteLikes.length,
          user: user ? { name: user.name, avatarUrl: user.avatarUrl } : null,
        };
      })
    );

    // Filter out null values (deleted or unpublished palettes)
    return palettesWithDetails.filter((p) => p !== null);
  },
});

export const toggle = mutation({
  args: { paletteId: v.id("palettes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if the palette exists
    const palette = await ctx.db.get(args.paletteId);
    if (!palette) {
      throw new Error("Palette not found");
    }

    // Check if the user has already liked this palette
    const existingLike = await ctx.db
      .query("likes")
      .withIndex("by_user_and_palette", (q) =>
        q.eq("userId", identity.subject).eq("paletteId", args.paletteId)
      )
      .first();

    if (existingLike) {
      // Unlike - remove the existing like
      await ctx.db.delete(existingLike._id);
      return { liked: false };
    } else {
      // Like - create a new like
      await ctx.db.insert("likes", {
        userId: identity.subject,
        paletteId: args.paletteId,
      });
      return { liked: true };
    }
  },
});

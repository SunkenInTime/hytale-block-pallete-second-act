import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosId", identity.subject))
      .first();

    return user;
  },
});

export const getOrCreate = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosId", identity.subject))
      .first();

    if (existingUser) {
      // Update user info if changed
      const updates: Record<string, unknown> = {};
      if (identity.name && identity.name !== existingUser.name) {
        updates.name = identity.name;
      }
      if (identity.email && identity.email !== existingUser.email) {
        updates.email = identity.email;
      }
      if (identity.pictureUrl && identity.pictureUrl !== existingUser.avatarUrl) {
        updates.avatarUrl = identity.pictureUrl;
      }

      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(existingUser._id, updates);
      }

      return existingUser._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      workosId: identity.subject,
      name: identity.name || undefined,
      email: identity.email || "",
      avatarUrl: identity.pictureUrl || undefined,
    });

    return userId;
  },
});

export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getPublicProfile = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) {
      return null;
    }

    // Get user's published palettes
    const palettes = await ctx.db
      .query("palettes")
      .withIndex("by_user", (q) => q.eq("userId", user.workosId))
      .filter((q) => q.eq(q.field("isPublished"), true))
      .collect();

    // Get likes count for each palette
    const palettesWithLikes = await Promise.all(
      palettes.map(async (palette) => {
        const likes = await ctx.db
          .query("likes")
          .withIndex("by_palette", (q) => q.eq("paletteId", palette._id))
          .collect();
        return {
          ...palette,
          likesCount: likes.length,
        };
      })
    );

    return {
      _id: user._id,
      name: user.name,
      avatarUrl: user.avatarUrl,
      palettes: palettesWithLikes,
    };
  },
});

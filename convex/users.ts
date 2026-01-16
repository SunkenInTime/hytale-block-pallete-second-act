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
      // Update user info if changed (but not username - that's user-controlled)
      const updates: Record<string, unknown> = {};
      if (identity.email && identity.email !== existingUser.email) {
        updates.email = identity.email;
      }
      if (identity.pictureUrl && identity.pictureUrl !== existingUser.avatarUrl) {
        updates.avatarUrl = identity.pictureUrl;
      }

      // For existing users who have a name but no hasCompletedSignup flag,
      // consider them as having completed signup (migration for existing users)
      const hasCompletedSignup = existingUser.hasCompletedSignup ??
        (existingUser.name !== undefined && existingUser.name !== null && existingUser.name !== "");

      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(existingUser._id, updates);
      }

      return {
        userId: existingUser._id,
        isNew: false,
        hasCompletedSignup,
      };
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      workosId: identity.subject,
      email: identity.email || "",
      avatarUrl: identity.pictureUrl || undefined,
      hasCompletedSignup: false,
    });

    return { userId, isNew: true, hasCompletedSignup: false };
  },
});

export const checkUsernameAvailable = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const username = args.username.toLowerCase().trim();

    // Username validation
    if (username.length < 3 || username.length > 20) {
      return { available: false, reason: "Username must be 3-20 characters" };
    }

    if (!/^[a-z0-9_]+$/.test(username)) {
      return { available: false, reason: "Username can only contain letters, numbers, and underscores" };
    }

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();

    return {
      available: !existingUser,
      reason: existingUser ? "Username is already taken" : null
    };
  },
});

export const setUsername = mutation({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const username = args.username.toLowerCase().trim();

    // Validate username
    if (username.length < 3 || username.length > 20) {
      throw new Error("Username must be 3-20 characters");
    }

    if (!/^[a-z0-9_]+$/.test(username)) {
      throw new Error("Username can only contain letters, numbers, and underscores");
    }

    // Check if username is taken
    const existingUserWithUsername = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();

    if (existingUserWithUsername) {
      throw new Error("Username is already taken");
    }

    // Get current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Update user with username
    await ctx.db.patch(user._id, {
      username,
      name: username, // Also set name to username for display
      hasCompletedSignup: true,
    });

    return { success: true, username };
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
      username: user.username,
      name: user.name || user.username,
      avatarUrl: user.avatarUrl,
      palettes: palettesWithLikes,
    };
  },
});

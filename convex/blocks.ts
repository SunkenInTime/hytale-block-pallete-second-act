import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("blocks").collect();
  },
});

export const listByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("blocks")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("blocks")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const getById = query({
  args: { id: v.id("blocks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const blocks = await ctx.db.query("blocks").collect();
    const categories = [...new Set(blocks.map((b) => b.category))];
    return categories.sort();
  },
});

// Seed function for initial data
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existingBlocks = await ctx.db.query("blocks").first();
    if (existingBlocks) {
      return { message: "Blocks already seeded" };
    }

    const blocks = [
      // Stone category
      { name: "Stone", slug: "stone", category: "Stone" },
      { name: "Cobblestone", slug: "cobblestone", category: "Stone" },
      { name: "Granite", slug: "granite", category: "Stone" },
      { name: "Marble", slug: "marble", category: "Stone" },
      { name: "Slate", slug: "slate", category: "Stone" },
      // Wood category
      { name: "Oak Planks", slug: "oak-planks", category: "Wood" },
      { name: "Birch Planks", slug: "birch-planks", category: "Wood" },
      { name: "Pine Planks", slug: "pine-planks", category: "Wood" },
      { name: "Jungle Planks", slug: "jungle-planks", category: "Wood" },
      // Earth category
      { name: "Dirt", slug: "dirt", category: "Earth" },
      { name: "Grass", slug: "grass", category: "Earth" },
      { name: "Sand", slug: "sand", category: "Earth" },
      { name: "Gravel", slug: "gravel", category: "Earth" },
      { name: "Clay", slug: "clay", category: "Earth" },
      // Ore category
      { name: "Coal Ore", slug: "coal-ore", category: "Ore" },
      { name: "Iron Ore", slug: "iron-ore", category: "Ore" },
      { name: "Gold Ore", slug: "gold-ore", category: "Ore" },
      { name: "Crystal Ore", slug: "crystal-ore", category: "Ore" },
      // Decorative category
      { name: "Brick", slug: "brick", category: "Decorative" },
      { name: "Mossy Stone", slug: "mossy-stone", category: "Decorative" },
      { name: "Carved Stone", slug: "carved-stone", category: "Decorative" },
      { name: "Glass", slug: "glass", category: "Decorative" },
    ];

    for (const block of blocks) {
      await ctx.db.insert("blocks", block);
    }

    return { message: `Seeded ${blocks.length} blocks` };
  },
});

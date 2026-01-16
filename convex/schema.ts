import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  blocks: defineTable({
    name: v.string(),
    slug: v.string(),
    category: v.string(),
  }).index("by_slug", ["slug"])
    .index("by_category", ["category"]),

  palettes: defineTable({
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    slots: v.array(v.union(v.id("blocks"), v.null())),
    maxSlots: v.number(),
    isPublished: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_published", ["isPublished"]),

  users: defineTable({
    workosId: v.string(),
    name: v.optional(v.string()),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
  }).index("by_workos_id", ["workosId"]),

  likes: defineTable({
    userId: v.string(),
    paletteId: v.id("palettes"),
  }).index("by_user", ["userId"])
    .index("by_palette", ["paletteId"])
    .index("by_user_and_palette", ["userId", "paletteId"]),
});

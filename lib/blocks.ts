// Static blocks data - single source of truth
// This replaces Convex queries for block data since blocks are static/constant

import blocksData from "@/data/blocks.json";

export interface Block {
  name: string;
  slug: string;
  category: string;
}

// All blocks from static JSON
export const BLOCKS: Block[] = blocksData.blocks;

// Unique sorted categories
export const CATEGORIES: string[] = [
  ...new Set(BLOCKS.map((b) => b.category)),
].sort();

// Lookup map by slug for O(1) access
export const blocksBySlug: Map<string, Block> = new Map(
  BLOCKS.map((block) => [block.slug, block])
);

// Helper to get a block by slug
export function getBlockBySlug(slug: string): Block | undefined {
  return blocksBySlug.get(slug);
}

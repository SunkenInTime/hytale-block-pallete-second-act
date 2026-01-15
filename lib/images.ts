export function getBlockImageUrl(slug: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || "/images/blocks";
  return `${baseUrl}/${slug}.png`;
}

export function getPlaceholderColor(slug: string): string {
  // Generate a consistent color based on the slug
  const colors: Record<string, string> = {
    // Stone category - grays
    stone: "#808080",
    cobblestone: "#6B6B6B",
    granite: "#A0522D",
    marble: "#F0F0F0",
    slate: "#4A4A4A",
    // Wood category - browns
    "oak-planks": "#BA8C63",
    "birch-planks": "#D4C4A8",
    "pine-planks": "#8B7355",
    "jungle-planks": "#6B4423",
    // Earth category - natural tones
    dirt: "#8B4513",
    grass: "#228B22",
    sand: "#F4D03F",
    gravel: "#A9A9A9",
    clay: "#CD853F",
    // Ore category - metallic
    "coal-ore": "#2C2C2C",
    "iron-ore": "#B8860B",
    "gold-ore": "#FFD700",
    "crystal-ore": "#9370DB",
    // Decorative category
    brick: "#CB4335",
    "mossy-stone": "#556B2F",
    "carved-stone": "#696969",
    glass: "#87CEEB",
  };

  return colors[slug] || "#808080";
}

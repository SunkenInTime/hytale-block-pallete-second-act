export function getBlockImageUrl(slug: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || "/assets";
  return `${baseUrl}/${slug}.webp`;
}

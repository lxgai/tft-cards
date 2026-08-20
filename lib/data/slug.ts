import type { Slug } from "./types";

/**
 * "Apex Predator" -> "apex-predator", "Rek'Sai" -> "rek-sai".
 * Apostrophes (straight and curly) behave as separators, so Kha'Zix, Kog'Maw
 * and Rek'Sai all produce readable two-part slugs.
 */
export function slugify(name: string): Slug {
  return name
    .toLowerCase()
    .replace(/[’']/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") as Slug;
}

/** Throws on the first duplicate — slugs are identifiers, not display text. */
export function assertUniqueSlugs(slugs: Slug[], label: string): void {
  const seen = new Set<Slug>();
  for (const s of slugs) {
    if (seen.has(s)) throw new Error(`Duplicate ${label} slug: ${s}`);
    seen.add(s);
  }
}

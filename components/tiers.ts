import type { Cost, TierColor } from "@/lib/data/types";

export type Swatch = { fill: string; ink: string; label: string };

/** Cost tier. The number a champion costs, wherever it appears, is this colour. */
export const COST_TIER: Record<Cost, Swatch> = {
  1: { fill: "var(--color-tier-1)", ink: "var(--color-surface)", label: "1-cost" },
  2: { fill: "var(--color-tier-2)", ink: "var(--color-surface)", label: "2-cost" },
  3: { fill: "var(--color-tier-3)", ink: "var(--color-surface)", label: "3-cost" },
  4: { fill: "var(--color-tier-4)", ink: "var(--color-surface)", label: "4-cost" },
  5: { fill: "var(--color-tier-5)", ink: "var(--color-ink)", label: "5-cost" },
};

/**
 * Trait breakpoint metals, keyed by the `colors` array in traits.json. Set 18
 * uses 1/3/4/5/6 and never 2: 4 appears only on Unique traits, 6 only on a
 * trait's top breakpoint.
 */
export const BREAKPOINT_TIER: Record<TierColor, Swatch> = {
  1: { fill: "var(--color-bronze)", ink: "var(--color-surface)", label: "BRONZE" },
  3: { fill: "var(--color-silver)", ink: "var(--color-surface)", label: "SILVER" },
  4: { fill: "var(--color-unique)", ink: "var(--color-surface)", label: "UNIQUE" },
  5: { fill: "var(--color-gold)", ink: "var(--color-ink)", label: "GOLD" },
  6: { fill: "var(--color-prismatic)", ink: "var(--color-surface)", label: "PRISMATIC" },
};

export const costSwatch = (cost: Cost | undefined): Swatch =>
  cost ? COST_TIER[cost] : { fill: "var(--color-trace)", ink: "var(--color-surface)", label: "" };

export const tierSwatch = (color: TierColor): Swatch =>
  BREAKPOINT_TIER[color] ?? BREAKPOINT_TIER[1];

/** Deck accent, so the deck list and the card spine agree on a colour. */
export function deckSwatch(deckId: string): Swatch {
  const cost = deckId.match(/-(\d)$/);
  if (cost) return COST_TIER[Number(cost[1]) as Cost];
  return deckId === "trait-rosters" ? BREAKPOINT_TIER[6] : BREAKPOINT_TIER[4];
}

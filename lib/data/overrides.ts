/**
 * Author-supplied corrections to the source export. Kept in one place, and
 * every application raises a `override` data warning so nothing is silent.
 */

/**
 * Eclipse is the only trait with no champions and a breakpoint of 0: it is not
 * fielded, it is unlocked by holding 3 Solar and 3 Lunar. The export describes
 * what it does but never how it activates, which is the part worth memorizing.
 * Excluded from every generated question; shown in the trait descriptions deck.
 */
export const TRAIT_DESCRIPTION_OVERRIDES: Record<string, string> = {
  Eclipse: "Achieved by fielding 3 Solar and 3 Lunar.",
};

/** Traits kept out of every generated question. */
export const NON_QUIZZABLE_TRAITS: readonly string[] = ["Eclipse"];

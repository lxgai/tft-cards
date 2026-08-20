/**
 * Domain types for the TFT Set 18 flashcard data layer.
 *
 * `Raw*` mirrors what sits on disk in data/*.json, warts and all.
 * Everything else is the normalized shape the rest of the app consumes.
 */

/** Stable identifier derived from an entity name. See slug.ts. */
export type Slug = string & { readonly __slug: unique symbol };

export type TraitType = "Origin" | "Class" | "Unique";
export type Cost = 1 | 2 | 3 | 4 | 5;

/**
 * Tier colour, parallel to `breakpoints`. Set 18 uses 1/3/4/5/6 (never 2):
 * 4 appears only on Unique traits, 6 only on a trait's top breakpoint.
 */
export type TierColor = 1 | 3 | 4 | 5 | 6;

// ---------------------------------------------------------------- raw

export type RawChampion = {
  name: string;
  cost: number;
  traits: string[];
  abilityName: string;
  abilityMana: string;
  ability: string;
};

export type RawTrait = {
  name: string;
  type: string;
  breakpoints: number[];
  colors: number[];
  description: string;
  /** Empty on all 36 traits in Set 18 — per-tier effects come from `description`. */
  effects: unknown[];
};

// ---------------------------------------------------------------- traits

/**
 * How a trait's description carries its per-breakpoint information.
 *
 * - `per-tier`  each breakpoint does something distinct (Inferno, Blossom, ...)
 * - `scaling`   one effect that simply gets bigger per breakpoint (Brawler,
 *               Adaptor, ...). The effect lives in `sharedEffect`; per-tier
 *               text in the source is empty or repeated, so it is not quizzed.
 * - `single`    one breakpoint, or none at all (all 10 Uniques, Solar, Eclipse).
 */
export type TierShape = "per-tier" | "scaling" | "single";

export type TraitTier = {
  breakpoint: number;
  color: TierColor;
  /** Distinct effect text for this breakpoint; null when the data has none. */
  text: string | null;
  /**
   * Safe to ask "what does this trait give at this breakpoint?". False when
   * the tier has no text, or when another tier of the same trait reads
   * identically once numbers are stripped (Inferno 5 and 7 are both
   * "Ignite shop slots, % Burn") — that question has two right answers.
   */
  quizzable: boolean;
};

export type Trait = {
  slug: Slug;
  name: string;
  type: TraitType;
  breakpoints: number[];
  tiers: TraitTier[];
  shape: TierShape;
  /** Full normalized description — what the study deck shows. */
  description: string;
  /** Description with the trait's own name masked, for reverse questions. */
  redactedDescription: string;
  /** Description text before the first `(n)` marker. */
  preamble: string;
  /** For `scaling` traits: the one effect every breakpoint increases. */
  sharedEffect: string | null;
  /** Trailing explainer after the last breakpoint (keyword glossaries, flavour). */
  footnote: string | null;
  championSlugs: Slug[];
  /** False for traits excluded from every generated question (Eclipse). */
  quizzable: boolean;
  /** True only when per-breakpoint effects are distinct enough to ask about. */
  quizzableTiers: boolean;
};

// ---------------------------------------------------------------- champions

export type Mana = {
  /** As authored, e.g. "0 / 30". Kayle is "0 / 0"; Caitlyn/Master Yi are "0 / 3". */
  raw: string;
  start: number;
  max: number;
};

export type Champion = {
  slug: Slug;
  name: string;
  cost: Cost;
  traitSlugs: Slug[];
  traitNames: string[];
  abilityName: string;
  mana: Mana;
  /** Normalized ability text — what the study deck shows. */
  ability: string;
  /** Ability with the champion's own name and trait names masked. */
  redactedAbility: string;
  /**
   * Portrait slot, deliberately unfilled in v1: the source data carries no
   * image reference and we ship no Riot assets. Populate here when it lands.
   */
  portrait: null;
};

// ---------------------------------------------------------------- dataset

export type DataWarning = {
  kind:
    | "trait-parse"
    | "tier-text-missing"
    | "tier-text-duplicate"
    | "redaction-miss"
    | "empty-roster"
    | "shape-mismatch"
    | "override";
  entity: string;
  detail: string;
};

export type Dataset = {
  champions: Champion[];
  traits: Trait[];
  championBySlug: ReadonlyMap<Slug, Champion>;
  traitBySlug: ReadonlyMap<Slug, Trait>;
  byCost: Record<Cost, Champion[]>;
  /** trait slug -> champions with that trait, in champions.json order. */
  roster: ReadonlyMap<Slug, Champion[]>;
  warnings: DataWarning[];
};

export const COSTS: readonly Cost[] = [1, 2, 3, 4, 5];
export const TRAIT_TYPES: readonly TraitType[] = ["Origin", "Class", "Unique"];

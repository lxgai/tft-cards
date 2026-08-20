/**
 * Card templates for Set 18. Each one is pure config: entity in, two faces out.
 */
import { COSTS, type Champion, type Dataset, type Trait } from "@/lib/data/types";

import type { CardBlock, CardFace, CardTemplate } from "./types";

/** Roster grouped into one block per cost tier, in cost order. */
function rosterBlocks(trait: Trait, data: Dataset): CardBlock[] {
  const members = trait.championSlugs.map((s) => data.championBySlug.get(s)!);
  return COSTS.flatMap((cost) => {
    const names = members.filter((c) => c.cost === cost).map((c) => c.name);
    return names.length ? [{ type: "group", label: `${cost}-cost`, cost, items: names } as CardBlock] : [];
  });
}

/**
 * What a trait actually does, shaped by how the source data carries it.
 * `scaling` traits get one effect plus their breakpoints as bare badges,
 * because the export gives no distinct text per breakpoint — that is the
 * honest rendering, not a gap to paper over.
 */
function effectBlocks(trait: Trait): CardBlock[] {
  const blocks: CardBlock[] = [];
  const tiers = trait.tiers.map((t) => ({ breakpoint: t.breakpoint, color: t.color, text: t.text }));

  if (trait.shape === "per-tier") {
    if (trait.preamble) blocks.push({ type: "text", text: trait.preamble });
    blocks.push({ type: "tiers", items: tiers });
  } else if (trait.shape === "scaling") {
    blocks.push({ type: "text", text: trait.sharedEffect ?? trait.description });
    blocks.push({ type: "tiers", items: tiers });
    blocks.push({ type: "note", text: "Same effect at every breakpoint, stronger each time." });
  } else {
    // `single` traits show their description whole, footnote included.
    blocks.push({ type: "text", text: trait.description });
    return blocks;
  }

  if (trait.footnote) blocks.push({ type: "note", text: trait.footnote });
  return blocks;
}

/**
 * A front face is the subject plus the recall cue for this deck — the card
 * says what to try to remember before you flip it.
 */
const championSubject =
  (hint: string) =>
  (c: Champion): CardFace => ({
    blocks: [
      { type: "subject", text: c.name, cost: c.cost },
      { type: "note", text: hint },
    ],
  });

const traitSubject =
  (hint: string) =>
  (t: Trait): CardFace => ({
    blocks: [
      { type: "subject", text: t.name, traitType: t.type },
      { type: "note", text: hint },
    ],
  });

/** Champion name -> the traits it brings. */
export const championTraitsTemplate: CardTemplate<Champion> = {
  id: "champ-traits",
  entityType: "champion",
  slugOf: (c) => c.slug,
  front: championSubject("List all traits associated with this champion."),
  back: (c, data) => ({
    blocks: [
      {
        type: "chips",
        items: c.traitSlugs.map((slug) => {
          const trait = data.traitBySlug.get(slug)!;
          return { label: trait.name, tiers: trait.tiers.map((t) => t.color) };
        }),
      },
    ],
  }),
};

/** Champion name -> what its ability does, and what it costs to get there. */
export const championAbilityTemplate: CardTemplate<Champion> = {
  id: "champ-ability",
  entityType: "champion",
  slugOf: (c) => c.slug,
  front: championSubject("List the champion’s ability. Optional: mana cost"),
  back: (c) => ({
    blocks: [
      { type: "subject", text: c.abilityName },
      { type: "kv", label: "Mana", value: c.mana.max === 0 ? "None — passive" : `${c.mana.raw} mana` },
      { type: "text", text: c.ability },
      { type: "caveat", text: "Numeric values are stripped from the source data." },
    ],
  }),
};

/** Trait name -> type, breakpoints, effect. */
export const traitDescriptionTemplate: CardTemplate<Trait> = {
  id: "trait-description",
  entityType: "trait",
  slugOf: (t) => t.slug,
  front: traitSubject("Describe the trait’s effect and what happens at each breakpoint."),
  back: (t) => ({
    blocks: [
      ...effectBlocks(t),
      { type: "caveat", text: "Numeric values are stripped from the source data." },
    ],
  }),
};

/** Trait name -> every champion that carries it. The emblem-scouting deck. */
export const traitRosterTemplate: CardTemplate<Trait> = {
  id: "trait-roster",
  entityType: "trait",
  slugOf: (t) => t.slug,
  front: traitSubject("Name all champions with this trait."),
  back: (t, data) => ({
    blocks: [
      { type: "kv", label: "Champions", value: String(t.championSlugs.length) },
      ...rosterBlocks(t, data),
    ],
  }),
};

/**
 * Traits and ability on one back — the card you want when drilling a single
 * trait's roster, where the question is "what does this unit actually give me".
 */
export const championProfileTemplate: CardTemplate<Champion> = {
  id: "champ-profile",
  entityType: "champion",
  slugOf: (c) => c.slug,
  front: championSubject("List this champion’s traits and ability."),
  back: (c, data) => ({
    blocks: [
      {
        type: "chips",
        items: c.traitSlugs.map((slug) => {
          const trait = data.traitBySlug.get(slug)!;
          return { label: trait.name, tiers: trait.tiers.map((t) => t.color) };
        }),
      },
      { type: "subject", text: c.abilityName },
      { type: "kv", label: "Mana", value: c.mana.max === 0 ? "None — passive" : `${c.mana.raw} mana` },
      { type: "text", text: c.ability },
      { type: "caveat", text: "Numeric values are stripped from the source data." },
    ],
  }),
};

export const CARD_TEMPLATES = [
  championTraitsTemplate,
  championAbilityTemplate,
  championProfileTemplate,
  traitDescriptionTemplate,
  traitRosterTemplate,
] as const;

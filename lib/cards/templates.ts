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

const championSubject = (c: Champion): CardFace => ({
  blocks: [{ type: "subject", text: c.name, cost: c.cost }],
});

const traitSubject = (t: Trait): CardFace => ({
  blocks: [{ type: "subject", text: t.name, traitType: t.type }],
});

/** Champion name -> the traits it brings. */
export const championTraitsTemplate: CardTemplate<Champion> = {
  id: "champ-traits",
  entityType: "champion",
  slugOf: (c) => c.slug,
  front: championSubject,
  back: (c) => ({
    blocks: [{ type: "chips", items: c.traitNames.map((label) => ({ label })) }],
  }),
};

/** Champion name -> what its ability does, and what it costs to get there. */
export const championAbilityTemplate: CardTemplate<Champion> = {
  id: "champ-ability",
  entityType: "champion",
  slugOf: (c) => c.slug,
  front: championSubject,
  back: (c) => ({
    blocks: [
      { type: "subject", text: c.abilityName },
      { type: "kv", label: "Mana", value: c.mana.max === 0 ? "None — passive" : c.mana.raw },
      { type: "text", text: c.ability },
    ],
  }),
};

/** Trait name -> type, breakpoints, effect. */
export const traitDescriptionTemplate: CardTemplate<Trait> = {
  id: "trait-description",
  entityType: "trait",
  slugOf: (t) => t.slug,
  front: traitSubject,
  back: (t) => ({
    blocks: [
      { type: "kv", label: "Type", value: t.type },
      ...effectBlocks(t),
    ],
  }),
};

/** Trait name -> every champion that carries it. The emblem-scouting deck. */
export const traitRosterTemplate: CardTemplate<Trait> = {
  id: "trait-roster",
  entityType: "trait",
  slugOf: (t) => t.slug,
  front: traitSubject,
  back: (t, data) => ({
    blocks: [
      { type: "kv", label: "Champions", value: String(t.championSlugs.length) },
      ...rosterBlocks(t, data),
    ],
  }),
};

export const CARD_TEMPLATES = [
  championTraitsTemplate,
  championAbilityTemplate,
  traitDescriptionTemplate,
  traitRosterTemplate,
] as const;

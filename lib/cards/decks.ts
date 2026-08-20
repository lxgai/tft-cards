/**
 * The study decks. Study never grades and never tracks: a deck is an ordered
 * list of cards, and the only thing the reader controls is order.
 *
 * Three sections — by cost, the two whole-trait decks, and one deck per trait.
 */
import { COSTS, type Cost, type Dataset, type Trait } from "@/lib/data/types";
import { makeRng, shuffle } from "@/lib/rng";

import {
  championAbilityTemplate,
  championProfileTemplate,
  championTraitsTemplate,
  traitDescriptionTemplate,
  traitRosterTemplate,
} from "./templates";
import { makeCard, type Deck } from "./types";

/** A trait's colour is its top breakpoint's metal. */
const traitAccent = (trait: Trait) =>
  ({ kind: "tier", color: trait.tiers[trait.tiers.length - 1]?.color ?? 1 }) as const;

export function buildDecks(data: Dataset): Deck[] {
  const costDeck = (cost: Cost, kind: "traits" | "abilities"): Deck => ({
    id: `${kind}-cost-${cost}`,
    title: `${cost}-cost ${kind}`,
    blurb:
      kind === "traits"
        ? `The ${data.byCost[cost].length} ${cost}-cost champions and what they bring.`
        : `What each ${cost}-cost champion's ability does.`,
    section: "by-cost",
    accent: { kind: "cost", cost },
    cards: data.byCost[cost].map((c) =>
      makeCard(kind === "traits" ? championTraitsTemplate : championAbilityTemplate, c, data),
    ),
  });

  const traitDescriptions: Deck = {
    id: "trait-descriptions",
    title: "Trait descriptions",
    blurb: `All ${data.traits.length} traits — type, breakpoints, and what they give.`,
    section: "traits",
    accent: { kind: "tier", color: 4 },
    cards: data.traits.map((t) => makeCard(traitDescriptionTemplate, t, data)),
  };

  // Eclipse has no champions, so it has no roster card and no deck of its own.
  const fieldable = data.traits.filter((t) => t.championSlugs.length > 0);

  const traitRosters: Deck = {
    id: "trait-rosters",
    title: "Trait rosters",
    blurb: `Which champions carry each of the ${fieldable.length} fieldable traits.`,
    section: "traits",
    accent: { kind: "tier", color: 6 },
    cards: fieldable.map((t) => makeCard(traitRosterTemplate, t, data)),
  };

  /**
   * One deck per trait: every champion in it, with its traits and ability on
   * the back. A champion in three traits appears in three decks — as the same
   * card, since a card id names its content and not where you met it.
   */
  const byTrait: Deck[] = fieldable.map((trait) => ({
    id: `trait-${trait.slug}`,
    title: `${trait.name} champions`,
    blurb:
      trait.championSlugs.length === 1
        ? `${data.championBySlug.get(trait.championSlugs[0])!.name} — the only ${trait.name} champion.`
        : `The ${trait.championSlugs.length} ${trait.name} champions, and what each one brings.`,
    section: "by-trait",
    accent: traitAccent(trait),
    cards: trait.championSlugs.map((slug) =>
      makeCard(championProfileTemplate, data.championBySlug.get(slug)!, data),
    ),
  }));

  return [
    ...COSTS.map((c) => costDeck(c, "traits")),
    ...COSTS.map((c) => costDeck(c, "abilities")),
    traitDescriptions,
    traitRosters,
    ...byTrait,
  ];
}

export function findDeck(data: Dataset, id: string): Deck | undefined {
  return buildDecks(data).find((d) => d.id === id);
}

/**
 * Deck order is the JSON order by default — alphabetical within each cost tier
 * for champions. Shuffling is a view of the same deck, never a new one.
 */
export function orderCards(deck: Deck, shuffled: boolean, seed: number): Deck["cards"] {
  return shuffled ? shuffle(deck.cards, makeRng(seed)) : deck.cards;
}

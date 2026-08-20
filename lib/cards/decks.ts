/**
 * The study decks. Study never grades and never tracks: a deck is an ordered
 * list of cards, and the only thing the reader controls is order.
 *
 * Six sections: traits and abilities by cost, the two whole-trait decks, and
 * one deck per Origin and per Class trait, with the Uniques gathered into one.
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
    section: kind === "traits" ? "traits-by-cost" : "abilities-by-cost",
    accent: { kind: "cost", cost },
    cards: data.byCost[cost].map((c) =>
      makeCard(kind === "traits" ? championTraitsTemplate : championAbilityTemplate, c, data),
    ),
  });

  const traitDescriptions: Deck = {
    id: "trait-descriptions",
    title: "Trait descriptions",
    blurb: `All ${data.traits.length} traits — type, breakpoints, and what they give.`,
    section: "traits-general",
    accent: { kind: "tier", color: 4 },
    cards: data.traits.map((t) => makeCard(traitDescriptionTemplate, t, data)),
  };

  // Eclipse has no champions, so it has no roster card and no deck of its own.
  const fieldable = data.traits.filter((t) => t.championSlugs.length > 0);

  const traitRosters: Deck = {
    id: "trait-rosters",
    title: "Trait rosters",
    blurb: `Which champions carry each of the ${fieldable.length} fieldable traits.`,
    section: "traits-general",
    accent: { kind: "tier", color: 6 },
    cards: fieldable.map((t) => makeCard(traitRosterTemplate, t, data)),
  };

  /**
   * One deck per Origin and Class trait: every champion in it, with its traits
   * and ability on the back. A champion in three traits appears in three decks
   * — as the same card, since a card id names its content and not where you
   * met it.
   */
  const traitDeck = (trait: Trait): Deck => ({
    id: `trait-${trait.slug}`,
    title: `${trait.name} champions`,
    blurb: `The ${trait.championSlugs.length} ${trait.name} champions, and what each one brings.`,
    section: trait.type === "Origin" ? "by-trait-origin" : "by-trait-class",
    accent: traitAccent(trait),
    cards: trait.championSlugs.map((slug) =>
      makeCard(championProfileTemplate, data.championBySlug.get(slug)!, data),
    ),
  });

  // traits.json is alphabetical, which interleaves the two types; the returned
  // order is the deck-list order, so split them here rather than in the UI.
  const origins = fieldable.filter((t) => t.type === "Origin").map(traitDeck);
  const classes = fieldable.filter((t) => t.type === "Class").map(traitDeck);

  /**
   * The Unique traits hold one champion each, so ten decks of one card each is
   * ten dead ends. They travel together instead, in champion order.
   */
  const uniqueBearers = data.champions.filter((champion) =>
    champion.traitSlugs.some((slug) => data.traitBySlug.get(slug)!.type === "Unique"),
  );
  const uniques: Deck = {
    id: "unique-champions",
    title: "Unique champions",
    blurb: `The ${uniqueBearers.length} champions who carry a Unique trait of their own.`,
    section: "by-trait-unique",
    accent: { kind: "tier", color: 4 },
    cards: uniqueBearers.map((champion) => makeCard(championProfileTemplate, champion, data)),
  };

  return [
    ...COSTS.map((c) => costDeck(c, "traits")),
    ...COSTS.map((c) => costDeck(c, "abilities")),
    traitDescriptions,
    traitRosters,
    ...origins,
    ...classes,
    uniques,
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

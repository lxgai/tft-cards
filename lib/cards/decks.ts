/**
 * The 12 study decks. Study never grades and never tracks: a deck is an
 * ordered list of cards, and the only thing the reader controls is order.
 */
import { COSTS, type Cost, type Dataset } from "@/lib/data/types";
import { makeRng, shuffle } from "@/lib/rng";

import {
  championAbilityTemplate,
  championTraitsTemplate,
  traitDescriptionTemplate,
  traitRosterTemplate,
} from "./templates";
import { makeCard, type Deck } from "./types";

export function buildDecks(data: Dataset): Deck[] {
  const costDeck = (cost: Cost, kind: "traits" | "abilities"): Deck => ({
    id: `${kind}-cost-${cost}`,
    title: `${cost}-cost ${kind}`,
    blurb:
      kind === "traits"
        ? `The ${data.byCost[cost].length} ${cost}-cost champions and what they bring.`
        : `What each ${cost}-cost champion's ability does.`,
    section: "champions",
    cards: data.byCost[cost].map((c) =>
      makeCard(kind === "traits" ? championTraitsTemplate : championAbilityTemplate, c, data),
    ),
  });

  const traitDescriptions: Deck = {
    id: "trait-descriptions",
    title: "Trait descriptions",
    blurb: `All ${data.traits.length} traits — type, breakpoints, and what they give.`,
    section: "traits",
    cards: data.traits.map((t) => makeCard(traitDescriptionTemplate, t, data)),
  };

  // Eclipse has no champions, so it has no roster card.
  const withRoster = data.traits.filter((t) => t.championSlugs.length > 0);
  const traitRosters: Deck = {
    id: "trait-rosters",
    title: "Trait rosters",
    blurb: `Which champions carry each of the ${withRoster.length} fieldable traits.`,
    section: "traits",
    cards: withRoster.map((t) => makeCard(traitRosterTemplate, t, data)),
  };

  return [
    ...COSTS.map((c) => costDeck(c, "traits")),
    ...COSTS.map((c) => costDeck(c, "abilities")),
    traitDescriptions,
    traitRosters,
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

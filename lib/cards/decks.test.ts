import { describe, expect, it } from "vitest";

import { buildDataset } from "@/lib/data/dataset";
import { makeRng } from "@/lib/rng";

import { buildDecks, orderCards } from "./decks";
import type { Card, CardBlock } from "./types";

const data = buildDataset();
const decks = buildDecks(data);
const deck = (id: string) => decks.find((d) => d.id === id)!;
const cardFor = (deckId: string, name: string): Card =>
  deck(deckId).cards.find(
    (c) => c.front.blocks[0].type === "subject" && c.front.blocks[0].text === name,
  )!;
const blocks = <T extends CardBlock["type"]>(c: Card, type: T) =>
  c.back.blocks.filter((b): b is Extract<CardBlock, { type: T }> => b.type === type);

describe("deck list", () => {
  it("is the twelve decks, in curriculum order", () => {
    expect(decks.map((d) => d.id)).toEqual([
      "traits-cost-1",
      "traits-cost-2",
      "traits-cost-3",
      "traits-cost-4",
      "traits-cost-5",
      "abilities-cost-1",
      "abilities-cost-2",
      "abilities-cost-3",
      "abilities-cost-4",
      "abilities-cost-5",
      "trait-descriptions",
      "trait-rosters",
    ]);
  });

  it("sizes each deck from the data", () => {
    expect(decks.map((d) => d.cards.length)).toEqual([14, 13, 14, 14, 10, 14, 13, 14, 14, 10, 36, 35]);
  });

  it("covers every champion twice and every trait once per trait deck", () => {
    const champCards = decks.filter((d) => d.section === "champions").flatMap((d) => d.cards);
    expect(champCards).toHaveLength(130);
    expect(new Set(champCards.map((c) => c.entitySlug)).size).toBe(65);
  });

  it("leaves Eclipse out of the roster deck but keeps it in descriptions", () => {
    expect(deck("trait-rosters").cards.map((c) => c.entitySlug)).not.toContain("eclipse");
    expect(deck("trait-descriptions").cards.map((c) => c.entitySlug)).toContain("eclipse");
  });
});

describe("card identity", () => {
  it("keys on entity and template, never on position or display text", () => {
    expect(cardFor("traits-cost-1", "Akali").id).toBe("champion:akali#champ-traits");
    expect(cardFor("abilities-cost-1", "Akali").id).toBe("champion:akali#champ-ability");
    expect(cardFor("trait-rosters", "Apex Predator").id).toBe("trait:apex-predator#trait-roster");
  });

  it("is unique across the whole study section", () => {
    const ids = decks.flatMap((d) => d.cards.map((c) => c.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("card content", () => {
  it("puts a champion's traits on the back, each with its breakpoint metals", () => {
    const back = blocks(cardFor("traits-cost-1", "Akali"), "chips")[0];
    expect(back.items.map((i) => i.label)).toEqual(["Inferno", "Adaptor", "Ravager"]);
    // Inferno is 2/3/5/7: bronze, silver, gold, prismatic.
    expect(back.items[0].tiers).toEqual([1, 3, 5, 6]);
    expect(back.items[1].tiers).toEqual([1, 3, 5]);
  });

  it("names Kayle's zero-mana ability as a passive rather than 0 / 0", () => {
    const kv = blocks(cardFor("abilities-cost-2", "Kayle"), "kv");
    expect(kv).toContainEqual({ type: "kv", label: "Mana", value: "None — passive" });
    expect(blocks(cardFor("abilities-cost-1", "Akali"), "kv")).toContainEqual({
      type: "kv",
      label: "Mana",
      value: "0 / 30 mana",
    });
  });

  it("groups a roster by cost, in cost order", () => {
    expect(blocks(cardFor("trait-rosters", "Riftbeast"), "group")).toEqual([
      { type: "group", label: "1-cost", cost: 1, items: ["Cinderling", "Pebbles"] },
      { type: "group", label: "2-cost", cost: 2, items: ["Gromp", "Murkwolf", "Scuttlecrab"] },
      { type: "group", label: "3-cost", cost: 3, items: ["Krug", "Raptor"] },
      { type: "group", label: "4-cost", cost: 4, items: ["Ancient Sentinel", "Brambleback"] },
      { type: "group", label: "5-cost", cost: 5, items: ["The Elder Dragon"] },
    ]);
  });

  it("skips empty cost tiers in a roster", () => {
    expect(blocks(cardFor("trait-rosters", "Summoner"), "group").map((b) => b.label)).toEqual([
      "1-cost",
      "3-cost",
      "4-cost",
    ]);
  });

  it("shows a per-tier trait's breakpoints with their own text", () => {
    const tiers = blocks(cardFor("trait-descriptions", "Elderwood"), "tiers")[0];
    expect(tiers.items.map((t) => t.breakpoint)).toEqual([3, 5, 7, 9, 11]);
    expect(tiers.items.every((t) => t.text !== null)).toBe(true);
  });

  it("shows a scaling trait's one effect, with empty tiers marked as such", () => {
    const card = cardFor("trait-descriptions", "Brawler");
    expect(blocks(card, "text")[0].text).toBe("Your team gains max Health. Brawlers gain more.");
    expect(blocks(card, "tiers")[0].items.every((t) => t.text === null)).toBe(true);
    expect(blocks(card, "note")[0].text).toContain("Same effect at every breakpoint");
  });

  it("does not repeat a single-breakpoint trait's footnote", () => {
    const card = cardFor("trait-descriptions", "Solar");
    expect(blocks(card, "note")).toHaveLength(0);
    expect(blocks(card, "text")[0].text).toContain("When the sun shines");
  });

  it("keeps the glossary footnote on a per-tier trait", () => {
    expect(blocks(cardFor("trait-descriptions", "Inferno"), "note")[0].text).toContain("Burn:");
  });
});

describe("ordering", () => {
  it("defaults to JSON order", () => {
    const d = deck("traits-cost-1");
    expect(orderCards(d, false, 1)).toEqual(d.cards);
    expect(orderCards(d, false, 1)[0].entitySlug).toBe("akali");
  });

  it("shuffles without dropping or duplicating a card", () => {
    const d = deck("trait-descriptions");
    const shuffled = orderCards(d, true, 42);
    expect(shuffled).toHaveLength(d.cards.length);
    expect(new Set(shuffled.map((c) => c.id))).toEqual(new Set(d.cards.map((c) => c.id)));
    expect(shuffled).not.toEqual(d.cards);
  });

  it("is deterministic for a given seed", () => {
    const d = deck("trait-rosters");
    expect(orderCards(d, true, 7).map((c) => c.id)).toEqual(orderCards(d, true, 7).map((c) => c.id));
  });

  it("never mutates the deck", () => {
    const d = deck("traits-cost-5");
    const before = d.cards.map((c) => c.id);
    orderCards(d, true, makeRng(1)() * 1000);
    expect(d.cards.map((c) => c.id)).toEqual(before);
  });
});

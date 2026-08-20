import { describe, expect, it } from "vitest";

import { buildDataset } from "@/lib/data/dataset";
import { makeRng } from "@/lib/rng";

import { buildDecks, orderCards } from "./decks";
import { SECTION_ORDER, type Card, type CardBlock } from "./types";

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
  it("opens with the twelve whole-set decks, in curriculum order", () => {
    expect(decks.slice(0, 12).map((d) => d.id)).toEqual([
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
    expect(decks.slice(0, 12).map((d) => d.cards.length)).toEqual([
      14, 13, 14, 14, 10, 14, 13, 14, 14, 10, 36, 35,
    ]);
  });

  it("covers every champion twice across the cost decks", () => {
    const champCards = decks
      .filter((d) => d.section === "traits-by-cost" || d.section === "abilities-by-cost")
      .flatMap((d) => d.cards);
    expect(champCards).toHaveLength(130);
    expect(new Set(champCards.map((c) => c.entitySlug)).size).toBe(65);
  });

  it("groups the deck list into the six sections, in order", () => {
    const seen: string[] = [];
    for (const deck of decks) if (seen.at(-1) !== deck.section) seen.push(deck.section);
    expect(seen).toEqual(SECTION_ORDER);
  });

  it("adds one deck per Origin and Class trait, sized to its roster", () => {
    const byTrait = decks.filter(
      (d) => d.section === "by-trait-origin" || d.section === "by-trait-class",
    );
    // 14 Origins less Eclipse, plus 12 Classes.
    expect(byTrait).toHaveLength(25);
    expect(byTrait.map((d) => d.title)).toContain("Lunar champions");
    for (const deck of byTrait) {
      const trait = data.traits.find((t) => `${t.name} champions` === deck.title)!;
      expect(trait.type).not.toBe("Unique");
      expect(deck.cards.map((c) => c.entitySlug)).toEqual(trait.championSlugs);
    }
  });

  it("gathers the Unique traits into one deck rather than ten of one card", () => {
    expect(decks.filter((d) => d.section === "by-trait-unique").map((d) => d.id)).toEqual([
      "unique-champions",
    ]);
    const uniques = deck("unique-champions");
    expect(uniques.cards).toHaveLength(10);
    // Champion order, not trait order.
    expect(uniques.cards.map((c) => c.entitySlug)).toEqual([
      "kog-maw",
      "malphite",
      "zyra",
      "alune",
      "draven",
      "ivern",
      "lux",
      "maokai",
      "taric",
      "the-elder-dragon",
    ]);
    for (const id of ["trait-caustic", "trait-greenfather", "trait-avatar"]) {
      expect(decks.map((d) => d.id)).not.toContain(id);
    }
  });

  it("gives a trait deck the colour of its top breakpoint", () => {
    const lunar = decks.find((d) => d.id === "trait-lunar")!;
    expect(lunar.accent).toEqual({ kind: "tier", color: 6 });
    expect(decks.find((d) => d.id === "traits-cost-3")!.accent).toEqual({ kind: "cost", cost: 3 });
  });

  it("gives a trait deck's card both the traits and the ability", () => {
    const aphelios = decks
      .find((d) => d.id === "trait-lunar")!
      .cards.find((c) => c.entitySlug === "aphelios")!;
    expect(aphelios.id).toBe("champion:aphelios#champ-profile");
    expect(blocks(aphelios, "chips")[0].items.map((i) => i.label)).toEqual(["Lunar", "Rapidfire"]);
    expect(blocks(aphelios, "subject")[0].text).toBe("Moonlight's Onslaught");
    expect(blocks(aphelios, "bullets")[0].items[0]).toContain("Swipes the target");
    // The source paragraph stays underneath the bullets as the reference.
    expect(blocks(aphelios, "note")[0].text).toContain("Equip Severum");
  });

  it("leaves Eclipse out of the roster deck but keeps it in descriptions", () => {
    expect(deck("trait-rosters").cards.map((c) => c.entitySlug)).not.toContain("eclipse");
    expect(deck("trait-descriptions").cards.map((c) => c.entitySlug)).toContain("eclipse");
    expect(decks.map((d) => d.id)).not.toContain("trait-eclipse");
  });
});

describe("card identity", () => {
  it("keys on entity and template, never on position or display text", () => {
    expect(cardFor("traits-cost-1", "Akali").id).toBe("champion:akali#champ-traits");
    expect(cardFor("abilities-cost-1", "Akali").id).toBe("champion:akali#champ-ability");
    expect(cardFor("trait-rosters", "Apex Predator").id).toBe("trait:apex-predator#trait-roster");
  });

  it("is unique within a deck", () => {
    for (const deck of decks) {
      const ids = deck.cards.map((c) => c.id);
      expect(new Set(ids).size, deck.id).toBe(ids.length);
    }
  });

  it("is the same card wherever it appears — an id names content, not a deck", () => {
    // Aphelios is Lunar and Rapidfire, so he is in two trait decks.
    const inLunar = decks.find((d) => d.id === "trait-lunar")!.cards.find((c) => c.entitySlug === "aphelios");
    const inRapidfire = decks
      .find((d) => d.id === "trait-rapidfire")!
      .cards.find((c) => c.entitySlug === "aphelios");
    expect(inLunar!.id).toBe(inRapidfire!.id);
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

  it("carries the recall cue the deck is for on the front", () => {
    const hint = (deckId: string, name: string) =>
      cardFor(deckId, name).front.blocks.find((b) => b.type === "note")!;
    expect(hint("traits-cost-1", "Akali").text).toBe(
      "List all traits associated with this champion.",
    );
    expect(hint("abilities-cost-1", "Akali").text).toBe(
      "List the champion’s ability. Optional: mana cost",
    );
    expect(hint("trait-descriptions", "Inferno").text).toBe(
      "Describe the trait’s effect and what happens at each breakpoint.",
    );
    expect(hint("trait-rosters", "Inferno").text).toBe("Name all champions with this trait.");
    expect(hint("trait-lunar", "Diana").text).toBe("List this champion’s traits and ability.");
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

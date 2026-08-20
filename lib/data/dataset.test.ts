import { describe, expect, it } from "vitest";

import { buildDataset } from "./dataset";
import { MASK } from "./redact";
import { slugify } from "./slug";
import { isMeaningful, parseMana } from "./text";
import { parseDescription } from "./traitParser";
import type { Slug } from "./types";

const data = buildDataset();
const trait = (name: string) => data.traits.find((t) => t.name === name)!;
const champion = (name: string) => data.champions.find((c) => c.name === name)!;
const rosterOf = (name: string) => data.roster.get(slugify(name))!;

describe("source shape", () => {
  it("has the expected counts", () => {
    expect(data.champions).toHaveLength(65);
    expect(data.traits).toHaveLength(36);
  });

  it("has the expected cost distribution", () => {
    expect([1, 2, 3, 4, 5].map((c) => data.byCost[c as 1].length)).toEqual([14, 13, 14, 14, 10]);
  });

  it("has the expected trait type distribution", () => {
    const count = (t: string) => data.traits.filter((x) => x.type === t).length;
    expect([count("Class"), count("Origin"), count("Unique")]).toEqual([12, 14, 10]);
  });

  it("gives every trait as many colors as breakpoints", () => {
    for (const t of data.traits) expect(t.tiers).toHaveLength(t.breakpoints.length);
  });
});

describe("slugs", () => {
  it("handles apostrophes and spaces", () => {
    expect(slugify("Apex Predator")).toBe("apex-predator");
    expect(slugify("Rek'Sai")).toBe("rek-sai");
    expect(slugify("Kha'Zix")).toBe("kha-zix");
    expect(slugify("The Elder Dragon")).toBe("the-elder-dragon");
  });

  it("is unique across each entity type", () => {
    expect(new Set(data.champions.map((c) => c.slug)).size).toBe(65);
    expect(new Set(data.traits.map((t) => t.slug)).size).toBe(36);
  });
});

describe("text normalization", () => {
  it("leaves no literal backslash-n anywhere", () => {
    for (const t of data.traits) expect(t.description).not.toMatch(/\\n/);
    for (const c of data.champions) expect(c.ability).not.toMatch(/\\n/);
  });

  it("turns champion ability space-runs into paragraph breaks", () => {
    for (const c of data.champions) expect(c.ability).not.toMatch(/ {3,}/);
    expect(champion("Akali").ability.split("\n\n")).toHaveLength(2);
  });

  it("strips hollow parentheticals left by number-stripping", () => {
    expect(champion("Ornn").ability).not.toContain("Forge Power:");
    expect(champion("Varus").ability).not.toContain("minimum");
    expect(champion("Veigar").ability).not.toContain("Current bonus");
  });

  it("strips live-UI readout lines from trait descriptions", () => {
    expect(trait("Greenfather").description).not.toContain("Seeds:");
    expect(trait("Fae").description).not.toContain("Current Pixies");
  });

  it("parses mana, including the passives", () => {
    expect(parseMana("0 / 30")).toEqual({ raw: "0 / 30", start: 0, max: 30 });
    expect(champion("Kayle").mana).toEqual({ raw: "0 / 0", start: 0, max: 0 });
    expect(champion("Caitlyn").mana.max).toBe(3);
  });

  it("rejects punctuation debris as meaningful", () => {
    expect(isMeaningful(", ")).toBe(false);
    expect(isMeaningful("+ + + +")).toBe(false);
    expect(isMeaningful("|")).toBe(false);
    expect(isMeaningful("OR")).toBe(false);
    // Real words survive even when the numbers around them did not — what
    // makes Spellweaver a scaling trait is that all three tiers say this.
    expect(isMeaningful("+ per cast")).toBe(true);
    expect(isMeaningful("Empower Summons")).toBe(true);
  });
});

describe("breakpoint parsing", () => {
  it("classifies traits by whether their breakpoints differ", () => {
    const shapes = (s: string) => data.traits.filter((t) => t.shape === s).map((t) => t.name);
    expect(shapes("per-tier")).toEqual([
      "Blossom",
      "Elderwood",
      "Executioner",
      "Fae",
      "Flora Fatalis",
      "Inferno",
      "Riftbeast",
      "Rival",
      "Sprykin",
      "Summoner",
    ]);
    expect(shapes("scaling")).toHaveLength(14);
    expect(shapes("single")).toHaveLength(12);
  });

  it("keys per-tier text to the right breakpoint", () => {
    const elderwood = trait("Elderwood");
    expect(elderwood.tiers.map((t) => t.breakpoint)).toEqual([3, 5, 7, 9, 11]);
    expect(elderwood.tiers[0].text).toBe("A Stonebark Tree and a Lifebloom");
    expect(elderwood.footnote).toContain("Plants gain Max Health");
  });

  it("gives scaling traits one shared effect and no per-tier text", () => {
    const brawler = trait("Brawler");
    expect(brawler.sharedEffect).toBe("Your team gains max Health. Brawlers gain more.");
    expect(brawler.tiers.every((t) => t.text === null)).toBe(true);
    expect(brawler.quizzableTiers).toBe(false);
    expect(trait("Adaptor").sharedEffect).toContain("depending on which is higher");
  });

  it("refuses to quiz two breakpoints that read identically", () => {
    const inferno = trait("Inferno");
    expect(inferno.tiers.find((t) => t.breakpoint === 5)!.quizzable).toBe(false);
    expect(inferno.tiers.find((t) => t.breakpoint === 7)!.quizzable).toBe(false);
    expect(inferno.tiers.find((t) => t.breakpoint === 3)!.quizzable).toBe(true);
  });

  it("keeps breakpoints that differ only by a surviving number", () => {
    const elderwood = trait("Elderwood");
    expect(elderwood.tiers.find((t) => t.breakpoint === 9)!.quizzable).toBe(true);
    expect(elderwood.tiers.find((t) => t.breakpoint === 11)!.quizzable).toBe(true);
  });

  it("drops the leading marker from a single-breakpoint description", () => {
    expect(trait("Solar").description.startsWith("Your champions gain")).toBe(true);
  });

  it("finds no markers in the Unique traits", () => {
    for (const t of data.traits.filter((t) => t.type === "Unique")) {
      expect(parseDescription(t.description).segments).toHaveLength(0);
      expect(t.shape).toBe("single");
    }
  });
});

describe("trait rosters", () => {
  it("inverts champions.json into the sizes we expect", () => {
    expect(rosterOf("Riftbeast")).toHaveLength(10);
    expect(rosterOf("Summoner")).toHaveLength(4);
    expect(rosterOf("Blossom")).toHaveLength(7);
    expect(rosterOf("Rival").map((c) => c.name)).toEqual(["Kha'Zix", "Rengar"]);
  });

  it("gives every Unique trait exactly one champion", () => {
    for (const t of data.traits.filter((t) => t.type === "Unique")) {
      expect(rosterOf(t.name)).toHaveLength(1);
    }
  });

  it("keeps rosters in champions.json order, which is by cost then name", () => {
    expect(rosterOf("Inferno").map((c) => c.name)).toEqual([
      "Akali",
      "Varus",
      "Shen",
      "Amumu",
      "Kennen",
    ]);
  });

  it("agrees with each champion's own trait list", () => {
    for (const c of data.champions) {
      for (const slug of c.traitSlugs) {
        expect(data.roster.get(slug)).toContain(c);
      }
    }
  });
});

describe("Eclipse", () => {
  it("is excluded from questions and carries the authored description", () => {
    const eclipse = trait("Eclipse");
    expect(eclipse.quizzable).toBe(false);
    expect(eclipse.championSlugs).toEqual([]);
    expect(eclipse.description).toBe("Achieved by fielding 3 Solar and 3 Lunar.");
  });

  it("is the only trait with no champions", () => {
    const empty = data.traits.filter((t) => t.championSlugs.length === 0);
    expect(empty.map((t) => t.name)).toEqual(["Eclipse"]);
  });
});

describe("redaction", () => {
  it("masks a champion's own name out of its ability", () => {
    expect(champion("Cinderling").redactedAbility).not.toMatch(/Cinderling/i);
    expect(champion("Krug").redactedAbility).not.toMatch(/Krug/i);
    expect(champion("Ancient Sentinel").redactedAbility).not.toMatch(/Sentinel/i);
    expect(champion("The Elder Dragon").redactedAbility).not.toMatch(/Elder Dragon/i);
  });

  it("masks the champion's own traits, leading prefix or not", () => {
    expect(champion("Akali").redactedAbility.startsWith(MASK)).toBe(true);
    expect(champion("Master Yi").redactedAbility).not.toMatch(/Adaptor/i);
    expect(champion("Lux").redactedAbility).not.toMatch(/\bFae\b/i);
  });

  it("masks a trait's own name out of its description", () => {
    expect(trait("Brawler").redactedDescription).not.toMatch(/Brawler/i);
    expect(trait("Riftbeast").redactedDescription).not.toMatch(/Riftbeast/i);
    expect(trait("Flora Fatalis").redactedDescription).not.toMatch(/Flora/i);
  });

  it("leaks nothing anywhere", () => {
    for (const c of data.champions) {
      expect(c.redactedAbility.toLowerCase()).not.toContain(c.name.toLowerCase());
    }
    for (const t of data.traits) {
      expect(t.redactedDescription.toLowerCase()).not.toContain(t.name.toLowerCase());
    }
  });

  it("leaves the study text untouched", () => {
    expect(champion("Cinderling").ability).toContain("Cinderling");
    expect(trait("Brawler").description).toContain("Brawlers");
  });
});

describe("load warnings", () => {
  it("reports only the four known data issues", () => {
    expect(data.warnings.map((w) => `${w.kind}:${w.entity}`).sort()).toEqual([
      "empty-roster:Eclipse",
      "override:Eclipse",
      "tier-text-duplicate:Inferno",
    ]);
  });
});

describe("lookup maps", () => {
  it("resolves every slug", () => {
    for (const c of data.champions) expect(data.championBySlug.get(c.slug)).toBe(c);
    for (const t of data.traits) expect(data.traitBySlug.get(t.slug)).toBe(t);
    expect(data.championBySlug.get("nobody" as Slug)).toBeUndefined();
  });
});

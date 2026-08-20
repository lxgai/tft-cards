import { describe, expect, it } from "vitest";

import { highlight } from "./highlight";

const toned = (text: string) =>
  highlight(text)
    .filter((s) => s.tone)
    .map((s) => [s.text, s.tone]);

describe("highlighting a bullet", () => {
  it("colours damage by its type", () => {
    expect(toned("Deals physical damage to the target")).toEqual([["physical damage", "physical"]]);
    expect(toned("Deals magic damage in a cone")).toEqual([["magic damage", "magic"]]);
  });

  it("colours crowd control", () => {
    expect(toned("Stuns them")).toEqual([["Stuns", "control"]]);
    expect(toned("Taunts nearby enemies onto itself")).toEqual([["Taunts", "control"]]);
    expect(toned("Knocks up enemies in the fissure")).toEqual([["Knocks up", "control"]]);
    expect(toned("Becomes immune to crowd control")).toEqual([["crowd control", "control"]]);
  });

  it("colours utility, including the keyword inside a condition", () => {
    expect(toned("Slows enemies hit (reduces Attack Speed)")).toEqual([["Slows", "utility"]]);
    expect(toned("Reduces their Magic Resist")).toEqual([["Reduces their Magic Resist", "utility"]]);
    expect(toned("Reduces Armor")).toEqual([["Reduces Armor", "utility"]]);
    expect(toned("More damage if the target is Burning")).toEqual([["Burning", "utility"]]);
  });

  it("marks each mechanic in a bullet that carries several", () => {
    expect(toned("Deals max-Health physical damage per second while Ignited")).toEqual([
      ["physical damage", "physical"],
      ["Ignited", "utility"],
    ]);
  });

  it("never overlaps two tones", () => {
    const segments = highlight("Deals magic damage and Stuns them, then Slows them");
    const rebuilt = segments.map((s) => s.text).join("");
    expect(rebuilt).toBe("Deals magic damage and Stuns them, then Slows them");
    expect(segments.filter((s) => s.tone).map((s) => s.tone)).toEqual([
      "magic",
      "control",
      "utility",
    ]);
  });

  it("returns the text whole when nothing matches", () => {
    expect(highlight("Shields self")).toEqual([{ text: "Shields self" }]);
    expect(highlight("")).toEqual([]);
  });

  it("rebuilds the original text exactly, always", () => {
    for (const text of [
      "Deals physical damage on the leap to a new target",
      "Wounds them (reduces healing received)",
      "Passive: 100 mana the first time it drops low each combat",
      "Mana Reaves them (raises their next cast's cost)",
    ]) {
      expect(
        highlight(text)
          .map((s) => s.text)
          .join(""),
      ).toBe(text);
    }
  });
});

import { describe, expect, it } from "vitest";

import { ABILITY_SUMMARIES } from "./ability-summaries";
import { buildDataset } from "./dataset";

const data = buildDataset();

/**
 * A bullet's class is read from its opening verb, which is why the openers are
 * fixed. Anything else is "other" and may sit wherever it reads best.
 */
type Kind = "damage" | "control" | "utility" | "other";

const CONTROL = /^(Stuns|Taunts|Knocks up|Sleeps|Charms|Disarms)\b/;
const UTILITY = /^(Slows|Shreds|Wounds|Burns|Sunders|Reduces|Ignites|Mana Reaves|Poisons)\b/;

function kindOf(bullet: string): Kind {
  if (/^Deals\b/.test(bullet)) return "damage";
  if (CONTROL.test(bullet)) return "control";
  if (UTILITY.test(bullet)) return "utility";
  return "other";
}

const positionsOf = (bullets: string[], kind: Kind) =>
  bullets.map((b, i) => [kindOf(b), i] as const).filter(([k]) => k === kind).map(([, i]) => i);

describe("authored ability summaries", () => {
  it("covers every champion", () => {
    for (const champion of data.champions) {
      expect(champion.summary.length, champion.name).toBeGreaterThan(0);
    }
    expect(Object.keys(ABILITY_SUMMARIES)).toHaveLength(65);
    expect(data.warnings.filter((w) => w.kind === "summary-missing")).toEqual([]);
  });

  it("has no entry for a champion that does not exist", () => {
    const slugs = new Set(data.champions.map((c) => c.slug as string));
    for (const slug of Object.keys(ABILITY_SUMMARIES)) expect(slugs.has(slug), slug).toBe(true);
  });

  /**
   * The rule the whole app turns on. The source export has had its numeric
   * values stripped, so a number appearing in a summary that is absent from
   * the ability text can only have been invented.
   */
  it("never introduces a number the source does not contain", () => {
    for (const champion of data.champions) {
      const inSource = new Set(champion.ability.match(/\d+/g) ?? []);
      for (const bullet of champion.summary) {
        for (const digits of bullet.match(/\d+/g) ?? []) {
          expect(inSource.has(digits), `${champion.name}: "${digits}" is not in the ability text`).toBe(
            true,
          );
        }
      }
    }
  });

  it("gives each action its own bullet, one to seven of them", () => {
    for (const champion of data.champions) {
      expect(champion.summary.length, champion.name).toBeGreaterThanOrEqual(1);
      expect(champion.summary.length, champion.name).toBeLessThanOrEqual(7);
    }
    // Alistar's roar does five separate things.
    expect(ABILITY_SUMMARIES.alistar).toHaveLength(5);
  });

  it("leads with damage when the ability deals any", () => {
    for (const champion of data.champions) {
      const damage = positionsOf(champion.summary, "damage");
      if (damage.length) expect(damage[0], champion.name).toBe(0);
    }
  });

  it("orders damage, then crowd control, then utility", () => {
    for (const champion of data.champions) {
      const damage = positionsOf(champion.summary, "damage");
      const control = positionsOf(champion.summary, "control");
      const utility = positionsOf(champion.summary, "utility");

      if (damage.length && control.length) {
        expect(Math.max(...damage), `${champion.name}: control before damage`).toBeLessThan(
          Math.min(...control),
        );
      }
      if (control.length && utility.length) {
        expect(Math.max(...control), `${champion.name}: utility before control`).toBeLessThan(
          Math.min(...utility),
        );
      }
      if (damage.length && utility.length) {
        expect(Math.max(...damage), `${champion.name}: utility before damage`).toBeLessThan(
          Math.min(...utility),
        );
      }
    }
  });

  it("keeps each class contiguous, so the groups read as groups", () => {
    for (const champion of data.champions) {
      for (const kind of ["damage", "control", "utility"] as const) {
        const at = positionsOf(champion.summary, kind);
        if (at.length < 2) continue;
        expect(at.at(-1)! - at[0], `${champion.name}: ${kind} bullets are split up`).toBe(
          at.length - 1,
        );
      }
    }
  });

  it("keeps every bullet a short phrase", () => {
    for (const champion of data.champions) {
      for (const bullet of champion.summary) {
        expect(bullet.length, `${champion.name}: ${bullet}`).toBeLessThanOrEqual(88);
        expect(bullet.trim(), champion.name).toBe(bullet);
        expect(bullet.endsWith("."), `${champion.name}: ${bullet}`).toBe(false);
      }
    }
  });

  it("summarizes rather than restating — always shorter than the source", () => {
    for (const champion of data.champions) {
      const summary = champion.summary.join(" ");
      expect(summary.length, champion.name).toBeLessThan(champion.ability.length);
    }
  });

  it("masks self-references the same way the ability text is masked", () => {
    for (const champion of data.champions) {
      for (const bullet of champion.redactedSummary) {
        expect(bullet.toLowerCase()).not.toContain(champion.name.toLowerCase());
      }
    }
  });

  it("keeps the mechanic, not the flavour", () => {
    expect(ABILITY_SUMMARIES.karma).toEqual([
      "Deals magic damage over time to the tethered target",
      "Deals magic damage in a Hex radius",
      "Slows enemies hit (reduces Attack Speed)",
    ]);
    expect(ABILITY_SUMMARIES.rakan).toEqual([
      "Shields self",
      "Grants the highest-damage ally decaying Attack Speed",
    ]);
  });
});

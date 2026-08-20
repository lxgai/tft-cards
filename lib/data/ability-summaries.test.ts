import { describe, expect, it } from "vitest";

import { ABILITY_SUMMARIES } from "./ability-summaries";
import { buildDataset } from "./dataset";

const data = buildDataset();

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

  it("keeps every bullet a short phrase", () => {
    for (const champion of data.champions) {
      expect(champion.summary.length, champion.name).toBeGreaterThanOrEqual(2);
      expect(champion.summary.length, champion.name).toBeLessThanOrEqual(5);
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
      "Tethers the target for magic damage over time",
      "Then bursts for magic damage in a Hex radius",
      "Slows enemies hit, reducing their Attack Speed",
    ]);
    expect(ABILITY_SUMMARIES.rakan).toEqual([
      "Shields self",
      "Grants the highest-damage ally decaying Attack Speed",
    ]);
  });
});

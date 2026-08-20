import { describe, expect, it } from "vitest";

import { buildDataset } from "@/lib/data/dataset";
import type { Champion, Trait } from "@/lib/data/types";

import { UNITS, findUnit } from "./curriculum";
import { buildQuiz, retryQuiz } from "./generate";
import { grade, isCorrect } from "./score";
import type { Question, Quiz } from "./types";

const data = buildDataset();
const SEEDS = [1, 2, 3, 7, 11, 42, 99, 1234];

const unit = (id: string) => findUnit(id)!;
const quizFor = (id: string, seed = 1) => buildQuiz(unit(id), data, seed);
const everyQuestion = (unitId: string): Question[] =>
  SEEDS.flatMap((seed) => quizFor(unitId, seed).questions);
const optionIds = (q: Question) => q.options.map((o) => o.id);
const wrongIds = (q: Question) => optionIds(q).filter((id) => !q.correct.includes(id));
const championOf = (slug: string) => data.championBySlug.get(slug as Champion["slug"])!;
const traitOf = (slug: string) => data.traitBySlug.get(slug as Trait["slug"])!;
const subjectSlug = (q: Question) => q.id.split("#")[0].split(":")[1];

describe("the syllabus", () => {
  it("is the units the curriculum lists, in order", () => {
    expect(UNITS.map((u) => u.id)).toEqual([
      "1.1",
      "2.1",
      "2.2",
      "2.3",
      "3.1",
      "3.2",
      "3.3",
      "3.4",
      "3.5",
      "3.6",
      "4.0",
      "4.1",
      "4.2",
      "4.3",
      "5.1",
      "5.2",
      "5.3",
      "5.4",
      "6.1",
      "6.2",
      "6.3",
      "6.4",
    ]);
  });

  it("builds a non-empty quiz for every unit, at every seed", () => {
    for (const u of UNITS) {
      for (const seed of SEEDS) {
        const quiz = buildQuiz(u, data, seed);
        expect(quiz.questions.length, `${u.id} @ ${seed}`).toBeGreaterThan(0);
        if (u.length) expect(quiz.questions.length).toBeLessThanOrEqual(u.length);
      }
    }
  });

  it("sizes the units that run their whole pool", () => {
    expect(quizFor("4.0").questions).toHaveLength(10); // the 10 Uniques
    expect(quizFor("4.1").questions).toHaveLength(6); // 2–4 champions
    expect(quizFor("4.3").questions).toHaveLength(1); // Riftbeast alone
    expect(quizFor("3.1").questions).toHaveLength(14); // the 14 1-costs
    expect(quizFor("3.5").questions).toHaveLength(10);
  });

  it("never repeats a question inside one quiz", () => {
    for (const u of UNITS) {
      for (const seed of SEEDS) {
        const ids = buildQuiz(u, data, seed).questions.map((q) => q.id);
        expect(new Set(ids).size, `${u.id} @ ${seed}`).toBe(ids.length);
      }
    }
  });

  it("draws only from the unit's slice of the data", () => {
    for (const q of everyQuestion("3.2")) expect(championOf(subjectSlug(q)).cost).toBe(2);
    for (const q of everyQuestion("4.2")) {
      expect(traitOf(subjectSlug(q)).championSlugs.length).toBeGreaterThanOrEqual(5);
      expect(traitOf(subjectSlug(q)).championSlugs.length).toBeLessThanOrEqual(7);
    }
    expect(everyQuestion("4.3").every((q) => subjectSlug(q) === "riftbeast")).toBe(true);
  });

  it("runs 5.2 with the expensive units first", () => {
    const costs = quizFor("5.2").questions.map((q) => championOf(subjectSlug(q)).cost);
    expect(costs).toEqual([...costs].sort((a, b) => b - a));
    expect(costs[0]).toBe(5);
  });
});

describe("question identity", () => {
  it("is entity plus template, stable across seeds and never positional", () => {
    const first = quizFor("2.1", 5).questions[0];
    expect(first.id).toBe(`trait:${subjectSlug(first)}#trait-type`);
    for (const seed of SEEDS) {
      const same = quizFor("2.1", seed).questions.find((q) => subjectSlug(q) === subjectSlug(first));
      if (same) expect(same.id).toBe(first.id);
    }
  });

  it("gives every option a stable id rather than its label", () => {
    for (const q of everyQuestion("6.4")) {
      expect(new Set(optionIds(q)).size).toBe(q.options.length);
      for (const id of q.correct) expect(optionIds(q)).toContain(id);
    }
  });
});

describe("distractor rules", () => {
  it("never offers a wrong option that is also a right answer", () => {
    for (const u of UNITS) {
      for (const seed of SEEDS) {
        for (const q of buildQuiz(u, data, seed).questions) {
          expect(new Set(optionIds(q)).size, `${q.id} has duplicate options`).toBe(q.options.length);
          expect(q.correct.every((id) => optionIds(q).includes(id))).toBe(true);
        }
      }
    }
  });

  it("offers exactly the five costs on a cost question", () => {
    for (const q of everyQuestion("1.1")) {
      expect(optionIds(q).sort()).toEqual(["1", "2", "3", "4", "5"]);
      expect(q.correct).toEqual([String(championOf(subjectSlug(q)).cost)]);
    }
  });

  it("offers exactly the three trait types", () => {
    for (const q of everyQuestion("2.1")) {
      expect(optionIds(q).sort()).toEqual(["Class", "Origin", "Unique"]);
    }
  });

  it("builds breakpoint distractors only from real breakpoint arrays", () => {
    const real = new Set(data.traits.map((t) => t.breakpoints.join("-")));
    for (const q of everyQuestion("2.2")) {
      expect(q.options).toHaveLength(4);
      for (const id of wrongIds(q)) expect(real.has(id), `${id} is not a real array`).toBe(true);
      expect(q.correct[0]).toBe(traitOf(subjectSlug(q)).breakpoints.join("-"));
    }
  });

  it("prefers breakpoint distractors from the same trait type", () => {
    const sameType = everyQuestion("2.2").map((q) => {
      const type = traitOf(subjectSlug(q)).type;
      const pool = new Set(
        data.traits.filter((t) => t.type === type).map((t) => t.breakpoints.join("-")),
      );
      return wrongIds(q).filter((id) => pool.has(id)).length;
    });
    // Not every trait type has three other distinct shapes, so this is a
    // preference, not a guarantee — but it should dominate.
    expect(sameType.reduce((a, b) => a + b, 0) / sameType.length).toBeGreaterThan(2);
  });

  it("draws champion-trait distractors from traits that share a champion, then same type", () => {
    for (const q of everyQuestion("3.6")) {
      const champion = championOf(subjectSlug(q));
      expect(q.mode).toBe("multi");
      expect([...q.correct].sort()).toEqual([...champion.traitSlugs].sort());

      const neighbours = new Set<string>(
        champion.traitSlugs
          .flatMap((s) => traitOf(s).championSlugs)
          .flatMap((s) => championOf(s).traitSlugs),
      );
      const ownTypes = new Set(champion.traitSlugs.map((s) => traitOf(s).type));
      for (const id of wrongIds(q)) {
        expect(champion.traitSlugs).not.toContain(id);
        expect(
          neighbours.has(id) || ownTypes.has(traitOf(id).type),
          `${id} is neither a neighbour nor same-type for ${champion.name}`,
        ).toBe(true);
      }
    }
  });

  it("draws roster distractors from champions of the same cost tiers, outside the trait", () => {
    for (const q of [...everyQuestion("4.1"), ...everyQuestion("4.2"), ...everyQuestion("4.3")]) {
      const trait = traitOf(subjectSlug(q));
      const memberCosts = new Set(trait.championSlugs.map((s) => championOf(s).cost));
      expect([...q.correct].sort()).toEqual([...trait.championSlugs].sort());
      for (const id of wrongIds(q)) {
        expect(trait.championSlugs).not.toContain(id);
        expect(memberCosts.has(championOf(id).cost), `${id} is off-tier for ${trait.name}`).toBe(true);
      }
    }
  });

  it("scales the roster option count with the roster size", () => {
    const expected = (correct: number) => (correct <= 3 ? 8 : correct <= 7 ? 12 : 16);
    for (const q of [...everyQuestion("4.1"), ...everyQuestion("4.2"), ...everyQuestion("4.3")]) {
      expect(q.options.length, `${q.id} has ${q.correct.length} correct`).toBe(
        expected(q.correct.length),
      );
    }
    // Riftbeast: 10 right among 16, not 10 among 65.
    expect(quizFor("4.3").questions[0].options).toHaveLength(16);
  });

  it("draws ability distractors from the same cost tier", () => {
    for (const q of [...everyQuestion("5.1"), ...everyQuestion("5.2"), ...everyQuestion("5.3")]) {
      const cost = championOf(subjectSlug(q)).cost;
      for (const id of optionIds(q)) expect(championOf(id).cost).toBe(cost);
    }
  });

  it("offers distinct mana values, never the same value twice", () => {
    for (const q of everyQuestion("5.4")) {
      expect(new Set(optionIds(q)).size).toBe(4);
      expect(q.correct).toEqual([championOf(subjectSlug(q)).mana.raw]);
    }
  });

  it("keeps Kayle's no-mana-bar answer in play", () => {
    const kayle = everyQuestion("5.4").find((q) => subjectSlug(q) === "kayle");
    expect(kayle).toBeDefined();
    expect(kayle!.correct).toEqual(["0 / 0"]);
    expect(kayle!.options.find((o) => o.id === "0 / 0")!.label).toContain("no mana bar");
  });

  it("makes the odd one out the only non-member", () => {
    for (const q of everyQuestion("6.2")) {
      const trait = traitOf(subjectSlug(q));
      expect(q.correct).toHaveLength(1);
      expect(trait.championSlugs).not.toContain(q.correct[0]);
      for (const id of wrongIds(q)) expect(trait.championSlugs).toContain(id);
    }
  });

  it("makes the trait-pair distractors half-right", () => {
    for (const q of everyQuestion("6.1")) {
      const answer = championOf(q.correct[0]);
      const chips = q.prompt[0];
      expect(chips.type).toBe("chips");
      const asked = chips.type === "chips" ? chips.items.map((i) => i.label) : [];
      expect(asked.every((name) => answer.traitNames.includes(name))).toBe(true);

      // Neither trait may answer the question on its own — "Caustic and
      // Invoker" is just Caustic, which is L4 material, not synthesis.
      for (const name of asked) {
        const trait = data.traits.find((t) => t.name === name)!;
        expect(trait.championSlugs.length, `${name} identifies one champion`).toBeGreaterThan(1);
      }
      for (const id of wrongIds(q)) {
        const other = championOf(id);
        const shared = asked.filter((name) => other.traitNames.includes(name));
        expect(shared.length, `${other.name} should share exactly one of ${asked}`).toBe(1);
      }
    }
  });

  it("answers the breakpoint scenario with a real member", () => {
    for (const q of everyQuestion("6.3")) {
      const trait = traitOf(subjectSlug(q));
      expect(trait.championSlugs).toContain(q.correct[0]);
      for (const id of wrongIds(q)) expect(trait.championSlugs).not.toContain(id);
      expect(q.lead).toMatch(new RegExp(`You have \\d+ ${trait.name}`));
    }
  });
});

describe("answer leakage", () => {
  it("never names the champion in a prompt that asks for the champion", () => {
    for (const q of [...everyQuestion("5.3")]) {
      const champion = championOf(q.correct[0]);
      const text = q.prompt.map((b) => (b.type === "text" ? b.text : "")).join(" ");
      expect(text.toLowerCase()).not.toContain(champion.name.toLowerCase());
      for (const trait of champion.traitNames) {
        expect(text.toLowerCase()).not.toContain(trait.toLowerCase());
      }
    }
  });

  it("never names the trait in a prompt that asks for the trait", () => {
    for (const q of everyQuestion("2.3")) {
      const trait = traitOf(q.correct[0]);
      const text = q.prompt.map((b) => (b.type === "text" ? b.text : "")).join(" ");
      expect(text.toLowerCase()).not.toContain(trait.name.toLowerCase());
    }
  });

  it("redacts every ability option, not only the right one", () => {
    for (const q of everyQuestion("5.2")) {
      for (const option of q.options) {
        const champion = championOf(option.id);
        expect(option.body!.toLowerCase()).not.toContain(champion.name.toLowerCase());
      }
    }
  });

  it("never shows a champion's cost in a prompt", () => {
    for (const u of UNITS) {
      for (const q of buildQuiz(u, data, 3).questions) {
        for (const block of q.prompt) {
          if (block.type === "subject") expect(block.cost).toBeUndefined();
        }
      }
    }
  });
});

describe("Eclipse", () => {
  it("never appears as a subject, an answer or a distractor", () => {
    for (const u of UNITS) {
      for (const seed of SEEDS) {
        for (const q of buildQuiz(u, data, seed).questions) {
          expect(subjectSlug(q)).not.toBe("eclipse");
          expect(optionIds(q)).not.toContain("eclipse");
        }
      }
    }
  });
});

describe("grading", () => {
  const quiz: Quiz = quizFor("3.1", 4);
  const answerAll = (correct: boolean) =>
    Object.fromEntries(
      quiz.questions.map((q) => [q.id, correct ? q.correct : wrongIds(q).slice(0, 1)]),
    );

  it("scores a perfect run", () => {
    const result = grade(quiz, answerAll(true));
    expect(result.correct).toBe(quiz.questions.length);
    expect(result.misses).toEqual([]);
  });

  it("scores a wrong run and keeps every miss", () => {
    const result = grade(quiz, answerAll(false));
    expect(result.correct).toBe(0);
    expect(result.misses).toHaveLength(quiz.questions.length);
    expect(result.misses[0].question.correct.length).toBeGreaterThan(0);
  });

  it("treats an unanswered question as wrong", () => {
    expect(grade(quiz, {}).correct).toBe(0);
  });

  it("marks multi-select all-or-nothing", () => {
    const q = quiz.questions.find((x) => x.correct.length >= 2)!;
    expect(isCorrect(q, q.correct)).toBe(true);
    expect(isCorrect(q, q.correct.slice(0, 1))).toBe(false);
    expect(isCorrect(q, [...q.correct, wrongIds(q)[0]])).toBe(false);
    expect(isCorrect(q, [...q.correct].reverse())).toBe(true);
  });
});

describe("retry", () => {
  it("rebuilds only the missed questions, with the options moved", () => {
    const quiz = quizFor("2.2", 8);
    const answers = Object.fromEntries(
      quiz.questions.map((q, i) => [q.id, i % 2 === 0 ? q.correct : wrongIds(q).slice(0, 1)]),
    );
    const result = grade(quiz, answers);
    const retry = retryQuiz(quiz, result.misses.map((m) => m.question), 5);

    expect(retry.questions).toHaveLength(result.misses.length);
    expect(new Set(retry.questions.map((q) => q.id))).toEqual(
      new Set(result.misses.map((m) => m.question.id)),
    );
    expect(retry.title).toContain("retry");
    const moved = retry.questions.some((q) => {
      const before = quiz.questions.find((x) => x.id === q.id)!;
      return optionIds(q).join() !== optionIds(before).join();
    });
    expect(moved).toBe(true);
  });
});
